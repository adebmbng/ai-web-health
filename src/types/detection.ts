import type { FoodAnalysisResponse } from './food';

export interface DetectionState {
    isDetecting: boolean;
    result: FoodAnalysisResponse | null;
    error: string | null;
    processingTime: number | null;
}

export interface DetectionSettings {
    imageQuality: number; // 0.1 to 1.0
    maxWidth: number;
    maxHeight: number;
    enableCompression: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    timestamp: number;
}

export interface OpenRouterMessage {
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{
        type: 'text' | 'image_url';
        text?: string;
        image_url?: {
            url: string;
            detail?: 'low' | 'high' | 'auto';
        };
    }>;
}

export interface OpenRouterRequest {
    model: string;
    messages: OpenRouterMessage[];
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}
