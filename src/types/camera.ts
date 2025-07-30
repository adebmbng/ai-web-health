export interface CameraDevice {
    deviceId: string;
    label: string;
    kind: MediaDeviceKind;
}

export interface CameraCapabilities {
    facingMode?: 'user' | 'environment';
    width?: { min: number; max: number; ideal: number };
    height?: { min: number; max: number; ideal: number };
}

export interface CameraSettings {
    deviceId?: string;
    facingMode?: 'user' | 'environment';
    width: number;
    height: number;
    aspectRatio?: number;
}

export interface CapturedImage {
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
    size: number;
    timestamp: number;
}

export interface CameraError {
    name: string;
    message: string;
    code?: string;
}
