import { useState } from 'react';
import { CheckCircle, AlertCircle, Info, X, Copy, Share2, Heart, Shield, Candy } from 'lucide-react';
import type { FoodAnalysisResponse } from '../types/food';
import { getCategoryColors, getCategoryInfo, getConfidenceLevel, formatConfidence } from '../utils/categoryMapping';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { copyToClipboard } from '../utils/common';

interface FoodResultProps {
    result: FoodAnalysisResponse;
    onClose: () => void;
    onNewAnalysis: () => void;
    onStartComparison?: (result: FoodAnalysisResponse) => void;
    processingTime?: number;
}

export function FoodResult({ result, onClose, onNewAnalysis, onStartComparison, processingTime }: FoodResultProps) {
    const [showDetails, setShowDetails] = useState(false);
    const [showAbout, setShowAbout] = useState(false);
    const [copied, setCopied] = useState(false);

    const categoryColors = getCategoryColors(result.category);
    const categoryInfo = getCategoryInfo(result.category);
    const confidenceInfo = getConfidenceLevel(result.confidence);

    const handleCopy = async () => {
        const text = `
Food: ${result.detected_food}
Category: ${categoryInfo.label}
Confidence: ${formatConfidence(result.confidence)}
Description: ${result.explanation}
${result.nutritional_notes ? `Notes: ${result.nutritional_notes}` : ''}
${result.preservation ? `Preservatives: ${result.preservation.riskLevel} risk - ${result.preservation.simpleExplanation}` : ''}
${result.sugar ? `Sugar for 4-6yo: ${result.sugar.dailyPercentageFor4To6YearOld.toFixed(0)}% of daily limit (${result.sugar.sugarContent}g)` : ''}

Analyzed with AI Food Detection - helping families avoid UPF foods. Built by @dbmkrn
LinkedIn: https://www.linkedin.com/in/adebmbng/
    `.trim();

        const success = await copyToClipboard(text);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'AI Food Detection - Helping Families Make Informed Choices',
                    text: `${result.detected_food} - ${categoryInfo.label} (${formatConfidence(result.confidence)} confidence)\n\nAnalyzed with AI Food Detection - helping families avoid UPF foods. Built by @dbmkrn\n\nhttps://www.linkedin.com/in/adebmbng/`,
                });
            } catch (error) {
                console.log('Share cancelled or failed:', error);
            }
        } else {
            // Fallback to copy
            handleCopy();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="w-full max-w-md my-4 sm:my-auto">
                <Card className="w-full bg-white shadow-xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 max-h-[calc(100vh-2rem)] flex flex-col">
                    <CardHeader className="pb-4 flex-shrink-0 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <CardTitle className="text-xl mb-2 flex items-center gap-2">
                                    <span className="text-2xl">{categoryInfo.icon}</span>
                                    {result.detected_food}
                                </CardTitle>

                                {/* Category Badge */}
                                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${categoryColors.bg} ${categoryColors.text}`}>
                                    {categoryInfo.label}
                                </div>
                            </div>

                            <Button
                                onClick={onClose}
                                size="icon"
                                variant="ghost"
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-4 overflow-y-auto flex-1 px-6 pb-6">
                        {/* Confidence Score */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                {result.confidence >= 0.8 ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : result.confidence >= 0.6 ? (
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                ) : (
                                    <AlertCircle className="w-5 h-5 text-red-600" />
                                )}
                                <span className="font-medium">Confidence</span>
                            </div>
                            <span className={`font-semibold ${confidenceInfo.color}`}>
                                {formatConfidence(result.confidence)}
                            </span>
                        </div>

                        {/* Health Score */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 flex items-center justify-center">
                                    <div className={`w-3 h-3 rounded-full ${categoryColors.bg.replace('bg-', 'bg-')} ${categoryColors.text}`}></div>
                                </div>
                                <span className="font-medium">Health Score</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {[...Array(10)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${i < categoryInfo.healthScore
                                            ? categoryColors.bg.replace('100', '400')
                                            : 'bg-gray-200'
                                            }`}
                                    />
                                ))}
                                <span className="ml-2 text-sm font-semibold">{categoryInfo.healthScore}/10</span>
                            </div>
                        </div>

                        {/* Explanation */}
                        <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-sm text-blue-800 font-medium mb-1">Analysis</p>
                                    <p className="text-sm text-blue-700">{result.explanation}</p>
                                </div>
                            </div>
                        </div>

                        {/* Nutritional Notes */}
                        {result.nutritional_notes && (
                            <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-sm text-green-800 font-medium mb-1">Nutritional Notes</p>
                                <p className="text-sm text-green-700">{result.nutritional_notes}</p>
                            </div>
                        )}

                        {/* Preservation Analysis */}
                        {result.preservation && (
                            <div className={`p-3 rounded-lg ${result.preservation.riskLevel === 'high' ? 'bg-red-50' :
                                result.preservation.riskLevel === 'medium' ? 'bg-yellow-50' : 'bg-green-50'
                                }`}>
                                <div className="flex items-start gap-2">
                                    <Shield className={`w-4 h-4 mt-0.5 flex-shrink-0 ${result.preservation.riskLevel === 'high' ? 'text-red-600' :
                                        result.preservation.riskLevel === 'medium' ? 'text-yellow-600' : 'text-green-600'
                                        }`} />
                                    <div>
                                        <p className={`text-sm font-medium mb-1 ${result.preservation.riskLevel === 'high' ? 'text-red-800' :
                                            result.preservation.riskLevel === 'medium' ? 'text-yellow-800' : 'text-green-800'
                                            }`}>
                                            Preservatives: {result.preservation.riskLevel.charAt(0).toUpperCase() + result.preservation.riskLevel.slice(1)} Risk
                                        </p>
                                        <p className={`text-sm ${result.preservation.riskLevel === 'high' ? 'text-red-700' :
                                            result.preservation.riskLevel === 'medium' ? 'text-yellow-700' : 'text-green-700'
                                            }`}>
                                            {result.preservation.simpleExplanation}
                                        </p>
                                        {result.preservation.preservativeTypes.length > 0 && (
                                            <div className="mt-1">
                                                <span className="text-xs font-medium">Types: </span>
                                                <span className="text-xs">{result.preservation.preservativeTypes.join(', ')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Sugar Analysis */}
                        {result.sugar && (
                            <div className={`p-3 rounded-lg ${result.sugar.isExcessive ? 'bg-red-50' :
                                result.sugar.dailyPercentageFor4To6YearOld > 25 ? 'bg-yellow-50' : 'bg-green-50'
                                }`}>
                                <div className="flex items-start gap-2">
                                    <Candy className={`w-4 h-4 mt-0.5 flex-shrink-0 ${result.sugar.isExcessive ? 'text-red-600' :
                                        result.sugar.dailyPercentageFor4To6YearOld > 25 ? 'text-yellow-600' : 'text-green-600'
                                        }`} />
                                    <div>
                                        <p className={`text-sm font-medium mb-1 ${result.sugar.isExcessive ? 'text-red-800' :
                                            result.sugar.dailyPercentageFor4To6YearOld > 25 ? 'text-yellow-800' : 'text-green-800'
                                            }`}>
                                            Sugar for 4-6 year old: {result.sugar.dailyPercentageFor4To6YearOld.toFixed(0)}% of daily limit
                                        </p>
                                        <p className={`text-sm ${result.sugar.isExcessive ? 'text-red-700' :
                                            result.sugar.dailyPercentageFor4To6YearOld > 25 ? 'text-yellow-700' : 'text-green-700'
                                            }`}>
                                            {result.sugar.simpleExplanation}
                                        </p>
                                        <div className="mt-1 text-xs">
                                            Sugar content: {result.sugar.sugarContent}g per serving
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Processing Time */}
                        {processingTime && (
                            <div className="text-center text-xs text-gray-500">
                                Analysis completed in {(processingTime / 1000).toFixed(1)}s
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                            {/* Primary Actions */}
                            <div className="flex gap-2">
                                <Button
                                    onClick={onNewAnalysis}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    Analyze Another
                                </Button>

                                <Button
                                    onClick={handleCopy}
                                    variant="outline"
                                    size="icon"
                                    className="flex-shrink-0"
                                >
                                    {copied ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                    ) : (
                                        <Copy className="w-4 h-4" />
                                    )}
                                </Button>

                                <Button
                                    onClick={handleShare}
                                    variant="outline"
                                    size="icon"
                                    className="flex-shrink-0"
                                >
                                    <Share2 className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Comparison Button */}
                            {onStartComparison && (
                                <Button
                                    onClick={() => onStartComparison(result)}
                                    variant="outline"
                                    className="w-full text-green-700 border-green-300 hover:bg-green-50"
                                >
                                    Compare with Another Product
                                </Button>
                            )}
                        </div>

                        {/* Category Description */}
                        <div className="pt-2 border-t">
                            <button
                                onClick={() => setShowDetails(!showDetails)}
                                className="w-full text-left text-sm text-gray-600 hover:text-gray-800"
                            >
                                <div className="flex items-center justify-between">
                                    <span>About {categoryInfo.label}</span>
                                    <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            </button>

                            {showDetails && (
                                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700 mb-2">{categoryInfo.description}</p>
                                    <div>
                                        <p className="text-xs font-medium text-gray-600 mb-1">Common examples:</p>
                                        <p className="text-xs text-gray-600">
                                            {categoryInfo.label === 'Unprocessed'
                                                ? 'Fresh fruits, vegetables, raw nuts, fresh herbs'
                                                : categoryInfo.label === 'Minimally Processed'
                                                    ? 'Frozen vegetables, plain yogurt, canned beans, dried fruits'
                                                    : categoryInfo.label === 'Processed'
                                                        ? 'Cheese, bread, canned vegetables, smoked meats'
                                                        : 'Packaged snacks, soft drinks, ready meals, processed meats'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* About This App */}
                        <div className="pt-2 border-t">
                            <button
                                onClick={() => setShowAbout(!showAbout)}
                                className="w-full text-left text-sm text-gray-600 hover:text-gray-800"
                            >
                                <div className="flex items-center justify-between">
                                    <span>About This App</span>
                                    <span className={`transform transition-transform ${showAbout ? 'rotate-180' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            </button>

                            {showAbout && (
                                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-start gap-2 mb-2">
                                        <Heart className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-blue-800 font-medium mb-1">Built for Family Health</p>
                                            <p className="text-sm text-blue-700 mb-2">
                                                Created by <strong>Ade Bambang Kurnia</strong> to help his daughter Alula manage H. Pylori bacteria.
                                                Following doctor's advice to avoid chocolate and minimize Ultra-Processed Foods (UPF),
                                                this app helps families make informed food choices.
                                            </p>
                                            <p className="text-xs text-blue-600">
                                                <a
                                                    href="https://www.linkedin.com/in/adebmbng/"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                >
                                                    Connect with Ade on LinkedIn →
                                                </a>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
