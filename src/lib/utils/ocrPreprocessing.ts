/**
 * OCR Preprocessing Utilities
 * Functions to prepare images for better OCR results using Canvas API
 */

export async function preprocessImageForOCR(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            // Set canvas dimensions
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Get image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Apply Grayscale & Binarization
            // Algorithm:
            // 1. Convert to grayscale
            // 2. Increase contrast
            // 3. Apply simple thresholding

            for (let i = 0; i < data.length; i += 4) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];

                // Grayscale (weighted)
                // Human eye is more sensitive to green, then red, then blue
                let gray = 0.299 * r + 0.587 * g + 0.114 * b;

                // Increase Contrast
                // Factor > 1 increases contrast
                const contrastFactor = 1.5;
                gray = (gray - 128) * contrastFactor + 128;

                // Binarization (Thresholding)
                // If pixel is light enough, make it white. Otherwise black.
                // Threshold of 128 is standard, but for scanned docs sometimes higher is better to remove background noise
                const threshold = 140;
                const val = gray >= threshold ? 255 : 0;

                data[i] = val;     // R
                data[i + 1] = val; // G
                data[i + 2] = val; // B
                // Alpha (data[i+3]) remains unchanged
            }

            // Put processed data back
            ctx.putImageData(imageData, 0, 0);

            // Convert to Blob
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error('Canvas to Blob failed'));
                }
            }, 'image/jpeg', 0.95);
        };

        img.onerror = (err) => {
            URL.revokeObjectURL(url);
            reject(err);
        };

        img.src = url;
    });
}
