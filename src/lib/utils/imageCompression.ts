'use client';

export type ImageFormat = 'jpeg' | 'webp' | 'png';

interface CompressionOptions {
    maxSizeKB?: number;
    maxWidth?: number;
    format?: ImageFormat;
    quality?: number;
}

/**
 * Compress an image file with format options
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<File> - The compressed image file
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    const {
        maxSizeKB = 500,
        maxWidth = 1920,
        format = 'webp', // Default to WebP for better compression
        quality: initialQuality = 0.85,
    } = options;

    return new Promise((resolve, reject) => {
        // If file is already under the max size and same format, return it as is
        if (file.size <= maxSizeKB * 1024 && file.type === `image/${format}`) {
            resolve(file);
            return;
        }

        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
        }

        img.onload = () => {
            // Calculate new dimensions while maintaining aspect ratio
            let width = img.width;
            let height = img.height;

            if (width > maxWidth) {
                height = (height * maxWidth) / width;
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            // Draw image with white background (for transparency)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            // Start with initial quality and reduce until size is under limit
            let quality = initialQuality;
            const maxSizeBytes = maxSizeKB * 1024;
            const minQuality = 0.1;
            const step = 0.1;
            const mimeType = `image/${format}`;
            const extension = format === 'jpeg' ? 'jpg' : format;

            const attemptCompression = () => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Failed to compress image'));
                            return;
                        }

                        // If under max size or minimum quality reached, create file
                        if (blob.size <= maxSizeBytes || quality <= minQuality) {
                            const compressedFile = new File(
                                [blob],
                                file.name.replace(/\.[^/.]+$/, `.${extension}`),
                                { type: mimeType, lastModified: Date.now() }
                            );
                            resolve(compressedFile);
                        } else {
                            // Reduce quality and try again
                            quality -= step;
                            attemptCompression();
                        }
                    },
                    mimeType,
                    quality
                );
            };

            attemptCompression();
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = URL.createObjectURL(file);
    });
}

/**
 * Batch compress multiple images
 * @param files - Array of files to compress
 * @param options - Compression options
 * @param onProgress - Progress callback (0-100)
 * @returns Promise<File[]> - Array of compressed files
 */
export async function batchCompressImages(
    files: File[],
    options: CompressionOptions = {},
    onProgress?: (progress: number) => void
): Promise<File[]> {
    const results: File[] = [];

    for (let i = 0; i < files.length; i++) {
        const compressed = await compressImage(files[i], options);
        results.push(compressed);
        onProgress?.(((i + 1) / files.length) * 100);
    }

    return results;
}

/**
 * Check if browser supports WebP
 */
export function supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Get optimal format based on browser support
 */
export function getOptimalFormat(): ImageFormat {
    return supportsWebP() ? 'webp' : 'jpeg';
}

/**
 * Get the size of a file in a human-readable format
 * @param bytes - Size in bytes
 * @returns string - Human-readable size
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if a file is an image
 * @param file - The file to check
 * @returns boolean - Whether the file is an image
 */
export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

/**
 * Get compression statistics
 */
export function getCompressionStats(original: File, compressed: File): {
    originalSize: string;
    compressedSize: string;
    savings: string;
    percentage: number;
} {
    const originalSize = original.size;
    const compressedSize = compressed.size;
    const savings = originalSize - compressedSize;
    const percentage = Math.round((savings / originalSize) * 100);

    return {
        originalSize: formatFileSize(originalSize),
        compressedSize: formatFileSize(compressedSize),
        savings: formatFileSize(savings),
        percentage,
    };
}

