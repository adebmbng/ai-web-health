import { useState, useCallback } from 'react';
import type { FoodItem, ComparisonState, ComparisonAnalysis, FoodAnalysisResponse } from '../types/food';
import { compareProducts } from '../services/comparisonService';

export const useProductComparison = () => {
    const [comparisonState, setComparisonState] = useState<ComparisonState>({
        mode: 'normal',
        firstProduct: null,
        secondProduct: null,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startComparison = useCallback((firstProduct: FoodItem, firstAnalysis: FoodAnalysisResponse) => {
        setComparisonState({
            mode: 'awaiting-second-product',
            firstProduct: { ...firstProduct, analysisData: firstAnalysis },
            secondProduct: null,
        });
        setError(null);
    }, []);

    const addSecondProduct = useCallback(async (secondProduct: FoodItem, secondAnalysis: FoodAnalysisResponse) => {
        if (!comparisonState.firstProduct?.analysisData) {
            setError('First product data is missing');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Generate comparison analysis
            const comparisonResult = await compareProducts(
                comparisonState.firstProduct.analysisData,
                secondAnalysis
            );

            setComparisonState({
                mode: 'showing-comparison',
                firstProduct: comparisonState.firstProduct,
                secondProduct: { ...secondProduct, analysisData: secondAnalysis },
                comparisonResult,
            });
        } catch (err) {
            console.error('Error generating comparison:', err);
            setError('Failed to compare products. Please try again.');

            // Fall back to basic comparison
            const fallbackResult: ComparisonAnalysis = {
                winner: 0,
                reasoning: 'Unable to perform detailed comparison',
                metrics: {
                    processingLevelWinner: 0,
                    sugarWinner: 0,
                    preservativeWinner: 0,
                },
                healthScores: [50, 50],
                keyDifferences: ['Comparison temporarily unavailable'],
                recommendation: 'Try comparing again or choose based on processing level',
            };

            setComparisonState({
                mode: 'showing-comparison',
                firstProduct: comparisonState.firstProduct,
                secondProduct: { ...secondProduct, analysisData: secondAnalysis },
                comparisonResult: fallbackResult,
            });
        } finally {
            setIsLoading(false);
        }
    }, [comparisonState.firstProduct]);

    const replaceFirstProduct = useCallback(() => {
        setComparisonState({
            mode: 'normal',
            firstProduct: null,
            secondProduct: null,
        });
        setError(null);
    }, []);

    const replaceSecondProduct = useCallback(() => {
        if (comparisonState.firstProduct) {
            setComparisonState({
                mode: 'awaiting-second-product',
                firstProduct: comparisonState.firstProduct,
                secondProduct: null,
            });
        }
        setError(null);
    }, [comparisonState.firstProduct]);

    const resetComparison = useCallback(() => {
        setComparisonState({
            mode: 'normal',
            firstProduct: null,
            secondProduct: null,
        });
        setError(null);
    }, []);

    const cancelComparison = useCallback(() => {
        setComparisonState({
            mode: 'normal',
            firstProduct: null,
            secondProduct: null,
        });
        setError(null);
    }, []);

    return {
        comparisonState,
        isLoading,
        error,
        startComparison,
        addSecondProduct,
        replaceFirstProduct,
        replaceSecondProduct,
        resetComparison,
        cancelComparison,
    };
};
