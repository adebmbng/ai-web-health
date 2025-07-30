import { useState, useRef, useCallback, useEffect } from 'react';
import type { CameraDevice, CameraSettings, CapturedImage, CameraError } from '../types/camera';
import { CameraService } from '../services/cameraService';

interface UseCameraReturn {
    // State
    isActive: boolean;
    isLoading: boolean;
    error: CameraError | null;
    devices: CameraDevice[];
    currentSettings: CameraSettings | null;

    // Actions
    startCamera: (settings?: Partial<CameraSettings>) => Promise<void>;
    stopCamera: () => void;
    captureImage: (compressionSettings?: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
    }) => Promise<CapturedImage>;
    switchCamera: () => Promise<void>;
    refreshDevices: () => Promise<void>;

    // Refs
    videoRef: React.RefObject<HTMLVideoElement>;
}

export function useCamera(): UseCameraReturn {
    const [isActive, setIsActive] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<CameraError | null>(null);
    const [devices, setDevices] = useState<CameraDevice[]>([]);
    const [currentSettings, setCurrentSettings] = useState<CameraSettings | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const cameraService = CameraService.getInstance();

    // Clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const refreshDevices = useCallback(async () => {
        try {
            const availableDevices = await cameraService.getAvailableDevices();
            setDevices(availableDevices);
        } catch (err) {
            console.error('Failed to refresh devices:', err);
            setError(err as CameraError);
        }
    }, [cameraService]);

    const startCamera = useCallback(async (settings?: Partial<CameraSettings>) => {
        if (!videoRef.current) {
            setError({ name: 'CameraError', message: 'Video element not available' });
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await cameraService.startCamera(videoRef.current, settings);
            setIsActive(true);
            setCurrentSettings(cameraService.getCurrentSettings());

            // Refresh devices list after starting camera
            await refreshDevices();
        } catch (err) {
            console.error('Failed to start camera:', err);
            setError(err as CameraError);
            setIsActive(false);
        } finally {
            setIsLoading(false);
        }
    }, [cameraService, refreshDevices]);

    const stopCamera = useCallback(() => {
        try {
            cameraService.stopCamera();
            setIsActive(false);
            setCurrentSettings(null);
            setError(null);
        } catch (err) {
            console.error('Failed to stop camera:', err);
            setError(err as CameraError);
        }
    }, [cameraService]);

    const captureImage = useCallback(async (compressionSettings?: {
        maxWidth?: number;
        maxHeight?: number;
        quality?: number;
    }): Promise<CapturedImage> => {
        if (!isActive) {
            throw new Error('Camera is not active');
        }

        try {
            setError(null);
            const image = await cameraService.captureImage(compressionSettings);
            return image;
        } catch (err) {
            console.error('Failed to capture image:', err);
            const error = err as CameraError;
            setError(error);
            throw error;
        }
    }, [isActive, cameraService]);

    const switchCamera = useCallback(async () => {
        if (!isActive) {
            setError({ name: 'CameraError', message: 'Camera is not active' });
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await cameraService.switchCamera();
            setCurrentSettings(cameraService.getCurrentSettings());
        } catch (err) {
            console.error('Failed to switch camera:', err);
            setError(err as CameraError);
        } finally {
            setIsLoading(false);
        }
    }, [isActive, cameraService]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (isActive) {
                cameraService.stopCamera();
            }
        };
    }, [isActive, cameraService]);

    return {
        // State
        isActive,
        isLoading,
        error,
        devices,
        currentSettings,

        // Actions
        startCamera,
        stopCamera,
        captureImage,
        switchCamera,
        refreshDevices,

        // Refs
        videoRef
    };
}
