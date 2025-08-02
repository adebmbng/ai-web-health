import type { FoodAnalysisResponse, ComparisonAnalysis } from '../types/food';
import { OpenRouterService } from './openRouterService';

export interface ComparisonResponse {
    winner: number;
    reasoning: string;
    processing_winner: number;
    sugar_winner: number;
    preservative_winner: number;
    health_scores: [number, number];
    key_differences: string[];
    recommendation: string;
}

export const compareProducts = async (
    product1: FoodAnalysisResponse,
    product2: FoodAnalysisResponse
): Promise<ComparisonAnalysis> => {
    const comparisonPrompt = `
Compare these two food products for health and help a shopper decide which is better:

PRODUCT 1: ${product1.detected_food}
- Category: ${product1.category}
- Confidence: ${product1.confidence}%
- Explanation: ${product1.explanation}
- Nutritional Notes: ${product1.nutritional_notes || 'None'}
- Sugar Analysis: ${product1.sugar ? `${product1.sugar.sugarContent}g per serving (${product1.sugar.dailyPercentageFor4To6YearOld}% of daily limit for 4-6 year olds), ${product1.sugar.simpleExplanation}` : 'Not analyzed'}
- Preservation: ${product1.preservation ? `${product1.preservation.riskLevel} risk, ${product1.preservation.simpleExplanation}` : 'Not analyzed'}

PRODUCT 2: ${product2.detected_food}
- Category: ${product2.category}
- Confidence: ${product2.confidence}%
- Explanation: ${product2.explanation}
- Nutritional Notes: ${product2.nutritional_notes || 'None'}
- Sugar Analysis: ${product2.sugar ? `${product2.sugar.sugarContent}g per serving (${product2.sugar.dailyPercentageFor4To6YearOld}% of daily limit for 4-6 year olds), ${product2.sugar.simpleExplanation}` : 'Not analyzed'}
- Preservation: ${product2.preservation ? `${product2.preservation.riskLevel} risk, ${product2.preservation.simpleExplanation}` : 'Not analyzed'}

Please provide a JSON response with:
{
    "winner": (0 for Product 1, 1 for Product 2),
    "reasoning": "Brief explanation why this product is healthier",
    "processing_winner": (0 or 1 - which has better processing level),
    "sugar_winner": (0 or 1 - which has better sugar content),
    "preservative_winner": (0 or 1 - which has better preservative profile),
    "health_scores": [score1, score2] (0-100 scale for each product),
    "key_differences": ["difference 1", "difference 2", "difference 3"] (max 3 key differences),
    "recommendation": "Clear action recommendation for the shopper"
}

Focus on practical shopping advice and be concise but helpful.
`;

    try {
        const openRouterService = OpenRouterService.getInstance();
        const response = await openRouterService.analyzeText(comparisonPrompt);

        // Parse the JSON response
        let parsedResponse: ComparisonResponse;
        try {
            // Try to extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                parsedResponse = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Failed to parse comparison response:', parseError);
            // Fallback comparison based on categories
            return generateFallbackComparison(product1, product2);
        }

        return {
            winner: parsedResponse.winner as 0 | 1,
            reasoning: parsedResponse.reasoning,
            metrics: {
                processingLevelWinner: parsedResponse.processing_winner as 0 | 1,
                sugarWinner: parsedResponse.sugar_winner as 0 | 1,
                preservativeWinner: parsedResponse.preservative_winner as 0 | 1,
            },
            healthScores: parsedResponse.health_scores,
            keyDifferences: parsedResponse.key_differences,
            recommendation: parsedResponse.recommendation,
        };
    } catch (error) {
        console.error('Error comparing products:', error);
        // Return fallback comparison
        return generateFallbackComparison(product1, product2);
    }
};

const generateFallbackComparison = (
    product1: FoodAnalysisResponse,
    product2: FoodAnalysisResponse
): ComparisonAnalysis => {
    // Simple category-based comparison as fallback
    const categoryRank = { unprocessed: 4, minimal: 3, processed: 2, upf: 1 };

    const score1 = categoryRank[product1.category] * 25;
    const score2 = categoryRank[product2.category] * 25;

    const winner = score1 >= score2 ? 0 : 1;

    return {
        winner,
        reasoning: winner === 0
            ? `${product1.detected_food} is less processed than ${product2.detected_food}`
            : `${product2.detected_food} is less processed than ${product1.detected_food}`,
        metrics: {
            processingLevelWinner: score1 >= score2 ? 0 : 1,
            sugarWinner: 0, // Default when we can't determine
            preservativeWinner: 0,
        },
        healthScores: [score1, score2],
        keyDifferences: [`Processing level: ${product1.category} vs ${product2.category}`],
        recommendation: `Choose ${winner === 0 ? product1.detected_food : product2.detected_food} for a healthier option.`,
    };
};
