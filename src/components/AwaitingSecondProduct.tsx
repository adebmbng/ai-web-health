import React from 'react';
import type { FoodItem } from '../types/food';
import { FOOD_CATEGORIES } from '../types/food';
import { X } from 'lucide-react';
import { Button } from './ui/Button';

interface AwaitingSecondProductProps {
    firstProduct: FoodItem;
    onCancel: () => void;
}

export const AwaitingSecondProduct: React.FC<AwaitingSecondProductProps> = ({
    firstProduct,
    onCancel,
}) => {
    return (
        <div className="absolute top-0 left-0 right-0 z-10 bg-blue-50 border-b-2 border-blue-200 p-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm font-medium text-blue-800">Comparing with:</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="font-semibold text-blue-900">{firstProduct.name}</span>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${FOOD_CATEGORIES[firstProduct.category].bgColor} ${FOOD_CATEGORIES[firstProduct.category].color}`}>
                            {FOOD_CATEGORIES[firstProduct.category].label}
                        </div>
                    </div>
                </div>
                <Button
                    onClick={onCancel}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 border-blue-300 hover:bg-blue-100"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
            <div className="mt-2">
                <p className="text-sm text-blue-700">📱 Scan another product to compare</p>
            </div>
        </div>
    );
};
