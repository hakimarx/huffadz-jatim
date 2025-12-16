'use client';

/**
 * Compress an image file to meet the maximum size requirement
 * @param file - The image file to compress
 * @param maxSizeKB - Maximum file size in KB (default: 500KB)
 * @param maxWidth - Maximum width in pixels (default: 1920)
 * @returns Promise<File> - The compressed image file
 */
export async function compressImage(
    file: File,
    maxSizeKB: number = 500,
    maxWidth: number = 1920
): Promise<File> {
    return new Promise((resolve, reject) => {
        // If file is already under the max size, return it as is
        if (file.size <= maxSizeKB * 1024) {
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

            // Start with quality of 0.9 and reduce until size is under limit
            let quality = 0.9;
            const maxSizeBytes = maxSizeKB * 1024;
            const minQuality = 0.1;
            const step = 0.1;

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
                                file.name.replace(/\.[^/.]+$/, '.jpg'),
                                { type: 'image/jpeg', lastModified: Date.now() }
                            );
                            resolve(compressedFile);
                        } else {
                            // Reduce quality and try again
                            quality -= step;
                            attemptCompression();
                        }
                    },
                    'image/jpeg',
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
