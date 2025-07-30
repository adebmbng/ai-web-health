import type { CapturedImage } from '../types/camera';

/**
 * Compresses and resizes an image to optimize for LLM API calls
 */
export async function compressImage(
    file: File | Blob,
    maxWidth: number = 800,
    maxHeight: number = 600,
    quality: number = 0.8
): Promise<CapturedImage> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            // Calculate new dimensions while maintaining aspect ratio
            const { width: newWidth, height: newHeight } = calculateDimensions(
                img.width,
                img.height,
                maxWidth,
                maxHeight
            );

            canvas.width = newWidth;
            canvas.height = newHeight;

            // Draw and compress the image
            ctx?.drawImage(img, 0, 0, newWidth, newHeight);

            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to compress image'));
                        return;
                    }

                    const dataUrl = canvas.toDataURL('image/jpeg', quality);

                    resolve({
                        blob,
                        dataUrl,
                        width: newWidth,
                        height: newHeight,
                        size: blob.size,
                        timestamp: Date.now()
                    });
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
export function calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } {
    let { width, height } = { width: originalWidth, height: originalHeight };

    // Calculate scaling factor
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio, 1); // Don't upscale

    width = Math.round(width * ratio);
    height = Math.round(height * ratio);

    return { width, height };
}

/**
 * Convert a file to base64 string
 */
export function fileToBase64(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}

/**
 * Extract base64 data from data URL
 */
export function extractBase64FromDataUrl(dataUrl: string): string {
    return dataUrl.split(',')[1];
}

/**
 * Validate image file type
 */
export function isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return validTypes.includes(file.type);
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
