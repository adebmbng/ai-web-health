import type { FoodCategory } from '../types/food';

/**
 * Get category color classes for Tailwind
 */
export function getCategoryColors(category: FoodCategory) {
    const colorMap = {
        unprocessed: {
            bg: 'bg-unprocessed-100',
            text: 'text-unprocessed-700',
            border: 'border-unprocessed-300',
            ring: 'ring-unprocessed-500',
            button: 'bg-unprocessed-500 hover:bg-unprocessed-600',
        },
        minimal: {
            bg: 'bg-minimal-100',
            text: 'text-minimal-700',
            border: 'border-minimal-300',
            ring: 'ring-minimal-500',
            button: 'bg-minimal-500 hover:bg-minimal-600',
        },
        processed: {
            bg: 'bg-processed-100',
            text: 'text-processed-700',
            border: 'border-processed-300',
            ring: 'ring-processed-500',
            button: 'bg-processed-500 hover:bg-processed-600',
        },
        upf: {
            bg: 'bg-upf-100',
            text: 'text-upf-700',
            border: 'border-upf-300',
            ring: 'ring-upf-500',
            button: 'bg-upf-500 hover:bg-upf-600',
        },
    };

    return colorMap[category];
}

/**
 * Get category display information
 */
export function getCategoryInfo(category: FoodCategory) {
    const categoryInfo = {
        unprocessed: {
            label: 'Unprocessed',
            shortLabel: 'Fresh',
            description: 'Fresh, whole foods in their natural state',
            healthScore: 10,
            icon: '🥬',
        },
        minimal: {
            label: 'Minimally Processed',
            shortLabel: 'Minimal',
            description: 'Foods processed for preservation or convenience',
            healthScore: 8,
            icon: '🥫',
        },
        processed: {
            label: 'Processed',
            shortLabel: 'Processed',
            description: 'Foods with added ingredients for flavor or preservation',
            healthScore: 5,
            icon: '🧀',
        },
        upf: {
            label: 'Ultra-Processed (UPF)',
            shortLabel: 'UPF',
            description: 'Heavily processed foods with many additives',
            healthScore: 2,
            icon: '🍟',
        },
    };

    return categoryInfo[category];
}

/**
 * Determine category from string (for API responses)
 */
export function parseFoodCategory(categoryString: string): FoodCategory {
    const normalized = categoryString.toLowerCase().trim();

    if (normalized.includes('unprocessed') || normalized.includes('fresh') || normalized.includes('natural')) {
        return 'unprocessed';
    }

    if (normalized.includes('minimal') || normalized.includes('lightly processed')) {
        return 'minimal';
    }

    if (normalized.includes('ultra') || normalized.includes('upf') || normalized.includes('highly processed')) {
        return 'upf';
    }

    // Default to processed if we can't determine
    return 'processed';
}

/**
 * Get confidence level description
 */
export function getConfidenceLevel(confidence: number): {
    level: 'low' | 'medium' | 'high';
    description: string;
    color: string;
} {
    if (confidence >= 0.8) {
        return {
            level: 'high',
            description: 'High confidence',
            color: 'text-green-600',
        };
    }

    if (confidence >= 0.6) {
        return {
            level: 'medium',
            description: 'Medium confidence',
            color: 'text-yellow-600',
        };
    }

    return {
        level: 'low',
        description: 'Low confidence',
        color: 'text-red-600',
    };
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
    return `${Math.round(confidence * 100)}%`;
}
