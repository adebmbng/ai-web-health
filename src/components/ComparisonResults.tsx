import React from 'react';
import type { ComparisonState } from '../types/food';
import { FOOD_CATEGORIES } from '../types/food';
import { Card } from './ui/Card';
import { Button } from './ui/Button';

interface ComparisonResultsProps {
    comparisonState: ComparisonState;
    onReplaceFirst: () => void;
    onReplaceSecond: () => void;
    onNewComparison: () => void;
    onExit: () => void;
}

export const ComparisonResults: React.FC<ComparisonResultsProps> = ({
    comparisonState,
    onReplaceFirst,
    onReplaceSecond,
    onNewComparison,
    onExit,
}) => {
    if (comparisonState.mode !== 'showing-comparison' ||
        !comparisonState.firstProduct ||
        !comparisonState.secondProduct ||
        !comparisonState.comparisonResult) {
        return null;
    }

    const { firstProduct, secondProduct, comparisonResult } = comparisonState;
    const winner = comparisonResult.winner === 0 ? firstProduct : secondProduct;

    return (
        <div className="space-y-6 p-4">
            {/* Winner Announcement */}
            <Card className="bg-green-50 border-green-200">
                <div className="text-center space-y-2">
                    <div className="text-2xl">🏆</div>
                    <h2 className="text-xl font-bold text-green-800">
                        Better Choice: {winner.name}
                    </h2>
                    <p className="text-green-700">{comparisonResult.reasoning}</p>
                    <div className="text-sm text-green-600 font-medium">
                        {comparisonResult.recommendation}
                    </div>
                </div>
            </Card>

            {/* Side-by-Side Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Product */}
                <Card className={`relative ${comparisonResult.winner === 0 ? 'ring-2 ring-green-400 bg-green-50' : 'bg-gray-50'}`}>
                    {comparisonResult.winner === 0 && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                            <span className="text-xs font-bold">✓</span>
                        </div>
                    )}
                    <div className="space-y-3">
                        <div>
                            <h3 className="font-semibold text-lg">{firstProduct.name}</h3>
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${FOOD_CATEGORIES[firstProduct.category].bgColor} ${FOOD_CATEGORIES[firstProduct.category].color}`}>
                                {FOOD_CATEGORIES[firstProduct.category].label}
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            <div>Confidence: {firstProduct.confidence}%</div>
                            <div>Health Score: {comparisonResult.healthScores[0]}/100</div>
                        </div>
                    </div>
                </Card>

                {/* Second Product */}
                <Card className={`relative ${comparisonResult.winner === 1 ? 'ring-2 ring-green-400 bg-green-50' : 'bg-gray-50'}`}>
                    {comparisonResult.winner === 1 && (
                        <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                            <span className="text-xs font-bold">✓</span>
                        </div>
                    )}
                    <div className="space-y-3">
                        <div>
                            <h3 className="font-semibold text-lg">{secondProduct.name}</h3>
                            <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${FOOD_CATEGORIES[secondProduct.category].bgColor} ${FOOD_CATEGORIES[secondProduct.category].color}`}>
                                {FOOD_CATEGORIES[secondProduct.category].label}
                            </div>
                        </div>
                        <div className="text-sm text-gray-600">
                            <div>Confidence: {secondProduct.confidence}%</div>
                            <div>Health Score: {comparisonResult.healthScores[1]}/100</div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Key Differences */}
            <Card>
                <h3 className="font-semibold mb-3">Key Differences</h3>
                <ul className="space-y-2">
                    {comparisonResult.keyDifferences.map((difference, index) => (
                        <li key={index} className="flex items-start">
                            <span className="mr-2 text-blue-500">•</span>
                            <span className="text-sm text-gray-700">{difference}</span>
                        </li>
                    ))}
                </ul>
            </Card>

            {/* Detailed Metrics */}
            <Card>
                <h3 className="font-semibold mb-3">Comparison Breakdown</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Processing Level Winner:</span>
                        <span className="font-medium">
                            {comparisonResult.metrics.processingLevelWinner === 0 ? firstProduct.name : secondProduct.name}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Sugar Content Winner:</span>
                        <span className="font-medium">
                            {comparisonResult.metrics.sugarWinner === 0 ? firstProduct.name : secondProduct.name}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Preservative Winner:</span>
                        <span className="font-medium">
                            {comparisonResult.metrics.preservativeWinner === 0 ? firstProduct.name : secondProduct.name}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={onReplaceFirst}>
                        Replace {firstProduct.name}
                    </Button>
                    <Button variant="outline" onClick={onReplaceSecond}>
                        Replace {secondProduct.name}
                    </Button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={onNewComparison}>
                        New Comparison
                    </Button>
                    <Button onClick={onExit}>
                        Done
                    </Button>
                </div>
            </div>
        </div>
    );
};
