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
    analysisData?: FoodAnalysisResponse; // Store original analysis for comparison
}

export interface DetectionResult {
    success: boolean;
    foodItem?: FoodItem;
    error?: string;
    processingTime?: number;
}

export interface PreservationAnalysis {
    hasProblematicPreservatives: boolean;
    preservativeTypes: string[]; // e.g., ['chemical', 'salt', 'sugar']
    riskLevel: 'low' | 'medium' | 'high';
    simpleExplanation: string;
}

export interface SugarAnalysis {
    sugarContent: number; // grams per serving
    dailyPercentageFor4To6YearOld: number; // percentage of WHO daily limit (25g)
    isExcessive: boolean;
    simpleExplanation: string;
}

export interface FoodAnalysisResponse {
    detected_food: string;
    category: FoodCategory;
    confidence: number;
    explanation: string;
    nutritional_notes?: string;
    preservation?: PreservationAnalysis;
    sugar?: SugarAnalysis;
}

export interface ComparisonAnalysis {
    winner: 0 | 1; // Index of better product (0 = first, 1 = second)
    reasoning: string;
    metrics: {
        processingLevelWinner: 0 | 1;
        sugarWinner: 0 | 1;
        preservativeWinner: 0 | 1;
    };
    healthScores: [number, number]; // 0-100 scale
    keyDifferences: string[];
    recommendation: string; // Clear action for user
}

export interface ComparisonState {
    mode: 'normal' | 'awaiting-second-product' | 'showing-comparison';
    firstProduct: FoodItem | null;
    secondProduct: FoodItem | null;
    comparisonResult?: ComparisonAnalysis;
}

export interface ComparisonRequest {
    product1: FoodAnalysisResponse;
    product2: FoodAnalysisResponse;
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
