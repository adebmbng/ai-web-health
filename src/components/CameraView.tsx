import React, { useEffect, useState } from 'react';
import { Camera, CameraOff, RotateCcw, Settings } from 'lucide-react';
import { useCamera } from '../hooks/useCamera';
import { Button } from './ui/Button';
import { LoadingSpinner } from './ui/LoadingSpinner';
import { cn } from '../utils/common';

interface CameraViewProps {
    onCapture: (image: CapturedImage) => void;
    isCapturing?: boolean;
    className?: string;
}

interface CapturedImage {
    blob: Blob;
    dataUrl: string;
    width: number;
    height: number;
    size: number;
    timestamp: number;
}

export function CameraView({ onCapture, isCapturing = false, className }: CameraViewProps) {
    const {
        isActive,
        isLoading,
        error,
        currentSettings,
        startCamera,
        stopCamera,
        captureImage,
        switchCamera,
        videoRef
    } = useCamera();

    const [showSettings, setShowSettings] = useState(false);

    // Auto-start camera on component mount
    useEffect(() => {
        if (!isActive && !isLoading) {
            startCamera();
        }

        // Cleanup on unmount
        return () => {
            if (isActive) {
                stopCamera();
            }
        };
    }, []);

    const handleCapture = async () => {
        if (!isActive || isCapturing) return;

        try {
            const image = await captureImage({
                maxWidth: 800,
                maxHeight: 600,
                quality: 0.8
            });
            onCapture(image);
        } catch (error) {
            console.error('Failed to capture image:', error);
        }
    };

    const handleToggleCamera = () => {
        if (isActive) {
            stopCamera();
        } else {
            startCamera();
        }
    };

    const handleSwitchCamera = async () => {
        if (isActive) {
            try {
                await switchCamera();
            } catch (error) {
                console.error('Failed to switch camera:', error);
            }
        }
    };

    const facingMode = currentSettings?.facingMode || 'environment';
    const isFrontCamera = facingMode === 'user';

    return (
        <div className={cn('relative w-full h-full bg-black rounded-lg overflow-hidden', className)}>
            {/* Video Element */}
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
                autoPlay
            />

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center text-white">
                        <LoadingSpinner size="lg" className="text-white mb-2" />
                        <p className="text-sm">Starting camera...</p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
                    <div className="text-center text-white max-w-sm">
                        <CameraOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
                        <p className="text-sm text-gray-300 mb-4">{error.message}</p>
                        <Button
                            onClick={() => startCamera()}
                            variant="outline"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            )}

            {/* Camera Inactive State */}
            {!isActive && !isLoading && !error && (
                <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-4">
                    <div className="text-center text-white">
                        <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">Camera Off</h3>
                        <p className="text-sm text-gray-300 mb-4">
                            Turn on your camera to start detecting food
                        </p>
                        <Button
                            onClick={handleToggleCamera}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Start Camera
                        </Button>
                    </div>
                </div>
            )}

            {/* Camera Controls */}
            {isActive && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-between">
                        {/* Left Controls */}
                        <div className="flex space-x-2">
                            <Button
                                onClick={() => setShowSettings(!showSettings)}
                                size="icon"
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                                <Settings className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Center Capture Button */}
                        <Button
                            onClick={handleCapture}
                            disabled={!isActive || isCapturing}
                            size="lg"
                            className="w-16 h-16 rounded-full bg-white text-black hover:bg-gray-200 disabled:opacity-50"
                        >
                            {isCapturing ? (
                                <LoadingSpinner size="md" className="text-black" />
                            ) : (
                                <div className="w-4 h-4 bg-black rounded-full" />
                            )}
                        </Button>

                        {/* Right Controls */}
                        <div className="flex space-x-2">
                            <Button
                                onClick={handleSwitchCamera}
                                size="icon"
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                                <RotateCcw className="w-4 h-4" />
                            </Button>

                            <Button
                                onClick={handleToggleCamera}
                                size="icon"
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                                <CameraOff className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Camera Info */}
                    {currentSettings && (
                        <div className="mt-2 text-center">
                            <p className="text-xs text-white/70">
                                {isFrontCamera ? 'Front' : 'Back'} Camera • {currentSettings.width}x{currentSettings.height}
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* Settings Panel */}
            {showSettings && isActive && (
                <div className="absolute top-4 left-4 right-4 bg-black/90 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Camera Settings</h4>
                        <Button
                            onClick={() => setShowSettings(false)}
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/10"
                        >
                            ✕
                        </Button>
                    </div>

                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span>Camera:</span>
                            <span>{isFrontCamera ? 'Front' : 'Back'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Resolution:</span>
                            <span>{currentSettings?.width}x{currentSettings?.height}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Device ID:</span>
                            <span className="truncate max-w-24">
                                {currentSettings?.deviceId?.slice(0, 8)}...
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Capture Animation */}
            {isCapturing && (
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
            )}
        </div>
    );
}
