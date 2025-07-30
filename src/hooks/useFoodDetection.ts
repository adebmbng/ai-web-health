import { useState, useCallback } from 'react';
import type { DetectionState, DetectionSettings } from '../types/detection';
import type { FoodAnalysisResponse } from '../types/food';
import type { CapturedImage } from '../types/camera';
import { OpenRouterService } from '../services/openRouterService';
import { extractBase64FromDataUrl } from '../utils/imageProcessing';

interface UseFoodDetectionReturn {
    // State
    detectionState: DetectionState;
    settings: DetectionSettings;

    // Actions
    analyzeImage: (image: CapturedImage) => Promise<FoodAnalysisResponse | null>;
    updateSettings: (newSettings: Partial<DetectionSettings>) => void;
    clearResult: () => void;
    clearError: () => void;
}

const defaultSettings: DetectionSettings = {
    imageQuality: 0.8,
    maxWidth: 800,
    maxHeight: 600,
    enableCompression: true
};

const defaultState: DetectionState = {
    isDetecting: false,
    result: null,
    error: null,
    processingTime: null
};

export function useFoodDetection(): UseFoodDetectionReturn {
    const [detectionState, setDetectionState] = useState<DetectionState>(defaultState);
    const [settings, setSettings] = useState<DetectionSettings>(defaultSettings);

    const openRouterService = OpenRouterService.getInstance();

    const analyzeImage = useCallback(async (image: CapturedImage): Promise<FoodAnalysisResponse | null> => {
        const startTime = Date.now();

        // Reset state
        setDetectionState(prevState => ({
            ...prevState,
            isDetecting: true,
            error: null,
            processingTime: null
        }));

        try {
            // Extract base64 data from the image
            const base64Data = extractBase64FromDataUrl(image.dataUrl);

            if (!base64Data) {
                throw new Error('Failed to extract image data');
            }

            // Call OpenRouter API
            const response = await openRouterService.analyzeFoodImage(base64Data);

            if (!response.success || !response.data) {
                throw new Error(response.error || 'Analysis failed');
            }

            const processingTime = Date.now() - startTime;

            // Update state with successful result
            setDetectionState({
                isDetecting: false,
                result: response.data,
                error: null,
                processingTime
            });

            return response.data;

        } catch (error) {
            console.error('Food detection error:', error);

            const processingTime = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            // Update state with error
            setDetectionState({
                isDetecting: false,
                result: null,
                error: errorMessage,
                processingTime
            });

            return null;
        }
    }, [openRouterService]);

    const updateSettings = useCallback((newSettings: Partial<DetectionSettings>) => {
        setSettings(prevSettings => ({
            ...prevSettings,
            ...newSettings
        }));
    }, []);

    const clearResult = useCallback(() => {
        setDetectionState(prevState => ({
            ...prevState,
            result: null,
            processingTime: null
        }));
    }, []);

    const clearError = useCallback(() => {
        setDetectionState(prevState => ({
            ...prevState,
            error: null
        }));
    }, []);

    return {
        detectionState,
        settings,
        analyzeImage,
        updateSettings,
        clearResult,
        clearError
    };
}
