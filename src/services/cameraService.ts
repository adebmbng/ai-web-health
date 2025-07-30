import type {
    CameraDevice,
    CameraSettings,
    CapturedImage,
    CameraError
} from '../types/camera';
import { compressImage } from '../utils/imageProcessing';

export class CameraService {
    private static instance: CameraService;
    private stream: MediaStream | null = null;
    private videoElement: HTMLVideoElement | null = null;

    static getInstance(): CameraService {
        if (!CameraService.instance) {
            CameraService.instance = new CameraService();
        }
        return CameraService.instance;
    }

    /**
     * Get available camera devices
     */
    async getAvailableDevices(): Promise<CameraDevice[]> {
        try {
            await navigator.mediaDevices.getUserMedia({ video: true });
            const devices = await navigator.mediaDevices.enumerateDevices();

            return devices
                .filter(device => device.kind === 'videoinput')
                .map(device => ({
                    deviceId: device.deviceId,
                    label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
                    kind: device.kind
                }));
        } catch (error) {
            console.error('Error getting camera devices:', error);
            throw this.createCameraError(error, 'Failed to get camera devices');
        }
    }

    /**
     * Start camera stream
     */
    async startCamera(
        videoElement: HTMLVideoElement,
        settings: Partial<CameraSettings> = {}
    ): Promise<MediaStream> {
        try {
            this.videoElement = videoElement;

            const defaultSettings: CameraSettings = {
                facingMode: 'environment', // Back camera by default
                width: 1280,
                height: 720,
                ...settings
            };

            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: defaultSettings.facingMode,
                    width: { ideal: defaultSettings.width },
                    height: { ideal: defaultSettings.height },
                    deviceId: settings.deviceId ? { exact: settings.deviceId } : undefined
                },
                audio: false
            };

            // Stop existing stream if any
            if (this.stream) {
                this.stopCamera();
            }

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            videoElement.srcObject = this.stream;

            return new Promise((resolve, reject) => {
                videoElement.onloadedmetadata = () => {
                    videoElement.play()
                        .then(() => resolve(this.stream!))
                        .catch(reject);
                };

                videoElement.onerror = () => {
                    reject(new Error('Failed to load video'));
                };
            });

        } catch (error) {
            console.error('Error starting camera:', error);
            throw this.createCameraError(error, 'Failed to start camera');
        }
    }

    /**
     * Capture image from video stream
     */
    async captureImage(
        compressionSettings: {
            maxWidth?: number;
            maxHeight?: number;
            quality?: number;
        } = {}
    ): Promise<CapturedImage> {
        if (!this.videoElement || !this.stream) {
            throw new Error('Camera not initialized');
        }

        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Failed to get canvas context');
            }

            const video = this.videoElement;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current video frame to canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to blob
            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Failed to create blob'));
                    },
                    'image/jpeg',
                    0.9
                );
            });

            // Compress the image if settings provided
            if (compressionSettings.maxWidth || compressionSettings.maxHeight || compressionSettings.quality) {
                return await compressImage(
                    blob,
                    compressionSettings.maxWidth || 800,
                    compressionSettings.maxHeight || 600,
                    compressionSettings.quality || 0.8
                );
            }

            // Return uncompressed image
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

            return {
                blob,
                dataUrl,
                width: canvas.width,
                height: canvas.height,
                size: blob.size,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('Error capturing image:', error);
            throw this.createCameraError(error, 'Failed to capture image');
        }
    }

    /**
     * Switch camera (front/back)
     */
    async switchCamera(): Promise<void> {
        if (!this.videoElement) {
            throw new Error('Camera not initialized');
        }

        const currentFacingMode = this.getCurrentFacingMode();
        const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';

        await this.startCamera(this.videoElement, { facingMode: newFacingMode });
    }

    /**
     * Stop camera stream
     */
    stopCamera(): void {
        if (this.stream) {
            this.stream.getTracks().forEach(track => {
                track.stop();
            });
            this.stream = null;
        }

        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
    }

    /**
     * Get current camera settings
     */
    getCurrentSettings(): CameraSettings | null {
        if (!this.stream) return null;

        const videoTrack = this.stream.getVideoTracks()[0];
        if (!videoTrack) return null;

        const settings = videoTrack.getSettings();

        return {
            deviceId: settings.deviceId || '',
            facingMode: settings.facingMode as 'user' | 'environment',
            width: settings.width || 0,
            height: settings.height || 0,
            aspectRatio: settings.aspectRatio
        };
    }

    /**
     * Get current facing mode
     */
    private getCurrentFacingMode(): 'user' | 'environment' {
        const settings = this.getCurrentSettings();
        return settings?.facingMode || 'environment';
    }

    /**
     * Check if camera is active
     */
    isActive(): boolean {
        return this.stream !== null && this.stream.active;
    }

    /**
     * Get stream status
     */
    getStreamInfo(): {
        isActive: boolean;
        deviceId?: string;
        facingMode?: string;
        resolution?: { width: number; height: number };
    } {
        if (!this.stream || !this.stream.active) {
            return { isActive: false };
        }

        const videoTrack = this.stream.getVideoTracks()[0];
        if (!videoTrack) {
            return { isActive: false };
        }

        const settings = videoTrack.getSettings();

        return {
            isActive: true,
            deviceId: settings.deviceId,
            facingMode: settings.facingMode,
            resolution: settings.width && settings.height
                ? { width: settings.width, height: settings.height }
                : undefined
        };
    }

    /**
     * Create standardized camera error
     */
    private createCameraError(originalError: unknown, message: string): CameraError {
        const error = originalError as Error;

        return {
            name: error.name || 'CameraError',
            message: `${message}: ${error.message}`,
            code: (error as any).code
        };
    }

    /**
     * Check camera permissions
     */
    async checkPermissions(): Promise<PermissionState> {
        try {
            const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
            return result.state;
        } catch (error) {
            console.warn('Permission API not supported:', error);
            return 'prompt';
        }
    }

    /**
     * Request camera permissions
     */
    async requestPermissions(): Promise<boolean> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false
            });

            // Stop the stream immediately as we just wanted to check permissions
            stream.getTracks().forEach(track => track.stop());

            return true;
        } catch (error) {
            console.error('Permission request failed:', error);
            return false;
        }
    }
}
