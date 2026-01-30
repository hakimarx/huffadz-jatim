'use client';

/**
 * Simple background job queue for non-blocking operations
 * Useful for: image processing, data exports, batch operations
 */

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

interface Job<T = unknown> {
    id: string;
    name: string;
    status: JobStatus;
    progress: number;
    result?: T;
    error?: string;
    createdAt: number;
    startedAt?: number;
    completedAt?: number;
    retries: number;
    maxRetries: number;
}

type JobHandler<T> = () => Promise<T>;

class JobQueue {
    private jobs: Map<string, Job> = new Map();
    private queue: Array<{ id: string; handler: JobHandler<unknown>; priority: number }> = [];
    private isProcessing: boolean = false;
    private maxConcurrent: number = 2;
    private runningCount: number = 0;

    /**
     * Add a job to the queue
     */
    addJob<T>(
        name: string,
        handler: JobHandler<T>,
        options: { priority?: number; maxRetries?: number } = {}
    ): string {
        const id = `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
        const { priority = 0, maxRetries = 3 } = options;

        const job: Job = {
            id,
            name,
            status: 'pending',
            progress: 0,
            createdAt: Date.now(),
            retries: 0,
            maxRetries,
        };

        this.jobs.set(id, job);
        this.queue.push({ id, handler, priority });

        // Sort by priority (higher priority first)
        this.queue.sort((a, b) => b.priority - a.priority);

        this.processQueue();
        return id;
    }

    /**
     * Get job status
     */
    getJob(id: string): Job | undefined {
        return this.jobs.get(id);
    }

    /**
     * Get all jobs
     */
    getAllJobs(): Job[] {
        return Array.from(this.jobs.values());
    }

    /**
     * Update job progress
     */
    updateProgress(id: string, progress: number): void {
        const job = this.jobs.get(id);
        if (job) {
            job.progress = Math.min(100, Math.max(0, progress));
        }
    }

    /**
     * Cancel a pending job
     */
    cancelJob(id: string): boolean {
        const index = this.queue.findIndex(item => item.id === id);
        if (index > -1) {
            this.queue.splice(index, 1);
            const job = this.jobs.get(id);
            if (job) {
                job.status = 'failed';
                job.error = 'Cancelled by user';
            }
            return true;
        }
        return false;
    }

    /**
     * Clear completed jobs
     */
    clearCompleted(): void {
        for (const [id, job] of this.jobs) {
            if (job.status === 'completed' || job.status === 'failed') {
                this.jobs.delete(id);
            }
        }
    }

    /**
     * Process the queue
     */
    private async processQueue(): Promise<void> {
        if (this.isProcessing || this.runningCount >= this.maxConcurrent) {
            return;
        }

        this.isProcessing = true;

        while (this.queue.length > 0 && this.runningCount < this.maxConcurrent) {
            const item = this.queue.shift();
            if (!item) break;

            const job = this.jobs.get(item.id);
            if (!job) continue;

            this.runningCount++;
            job.status = 'running';
            job.startedAt = Date.now();

            try {
                const result = await item.handler();
                job.status = 'completed';
                job.result = result;
                job.progress = 100;
            } catch (error) {
                job.retries++;

                if (job.retries < job.maxRetries) {
                    // Retry with exponential backoff
                    job.status = 'pending';
                    const delay = Math.pow(2, job.retries) * 1000;
                    setTimeout(() => {
                        this.queue.push(item);
                        this.processQueue();
                    }, delay);
                } else {
                    job.status = 'failed';
                    job.error = error instanceof Error ? error.message : 'Unknown error';
                }
            } finally {
                job.completedAt = Date.now();
                this.runningCount--;
            }
        }

        this.isProcessing = false;

        // Continue processing if there are more jobs
        if (this.queue.length > 0) {
            this.processQueue();
        }
    }
}

// Singleton instance
export const jobQueue = new JobQueue();

// Convenience functions for common jobs
export function addImageCompressionJob(
    files: File[],
    onProgress?: (progress: number) => void
): string {
    return jobQueue.addJob(
        'Image Compression',
        async () => {
            const { compressImage } = await import('./utils/imageCompression');
            const results: File[] = [];

            for (let i = 0; i < files.length; i++) {
                const compressed = await compressImage(files[i]);
                results.push(compressed);
                onProgress?.(((i + 1) / files.length) * 100);
            }

            return results;
        },
        { priority: 1 }
    );
}

export function addExportJob(
    exportFn: () => Promise<Blob>,
    filename: string
): string {
    return jobQueue.addJob(
        `Export: ${filename}`,
        async () => {
            const blob = await exportFn();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            return { filename, size: blob.size };
        },
        { priority: 0 }
    );
}
