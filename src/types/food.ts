export type FoodCategory = 'unprocessed' | 'minimal' | 'processed' | 'upf';

export interface FoodItem {
    name: string;
    category: FoodCategory;
    confidence: number;
    description?: string;
    nutritionalInfo?: {
        calories?: number;
        protein?: number;
        carbs?: number;
        fat?: number;
        fiber?: number;
        sugar?: number;
    };
}

export interface DetectionResult {
    success: boolean;
    foodItem?: FoodItem;
    error?: string;
    processingTime?: number;
}

export interface FoodAnalysisResponse {
    detected_food: string;
    category: FoodCategory;
    confidence: number;
    explanation: string;
    nutritional_notes?: string;
}

export const FOOD_CATEGORIES: Record<FoodCategory, {
    label: string;
    description: string;
    color: string;
    bgColor: string;
    examples: string[];
}> = {
    unprocessed: {
        label: 'Unprocessed',
        description: 'Fresh, whole foods in their natural state',
        color: 'text-unprocessed-700',
        bgColor: 'bg-unprocessed-100',
        examples: ['Fresh fruits', 'Vegetables', 'Raw nuts', 'Fresh herbs']
    },
    minimal: {
        label: 'Minimally Processed',
        description: 'Foods processed for preservation or convenience',
        color: 'text-minimal-700',
        bgColor: 'bg-minimal-100',
        examples: ['Frozen vegetables', 'Plain yogurt', 'Canned beans', 'Dried fruits']
    },
    processed: {
        label: 'Processed',
        description: 'Foods with added ingredients for flavor or preservation',
        color: 'text-processed-700',
        bgColor: 'bg-processed-100',
        examples: ['Cheese', 'Bread', 'Canned vegetables', 'Smoked meats']
    },
    upf: {
        label: 'Ultra-Processed (UPF)',
        description: 'Heavily processed foods with many additives',
        color: 'text-upf-700',
        bgColor: 'bg-upf-100',
        examples: ['Packaged snacks', 'Soft drinks', 'Ready meals', 'Processed meats']
    }
};
