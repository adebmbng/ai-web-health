import type {
    OpenRouterRequest,
    OpenRouterMessage,
    ApiResponse
} from '../types/detection';
import type { FoodAnalysisResponse } from '../types/food';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_URL = import.meta.env.VITE_OPENROUTER_API_URL;
const MODEL = import.meta.env.VITE_OPENROUTER_MODEL;

export class OpenRouterService {
    private static instance: OpenRouterService;

    static getInstance(): OpenRouterService {
        if (!OpenRouterService.instance) {
            OpenRouterService.instance = new OpenRouterService();
        }
        return OpenRouterService.instance;
    }

    private constructor() {
        if (!API_KEY || !API_URL || !MODEL) {
            console.warn('OpenRouter configuration missing. Please check your environment variables.');
        }
    }

    /**
     * Analyze food image using OpenRouter LLM
     */
    async analyzeFoodImage(imageBase64: string): Promise<ApiResponse<FoodAnalysisResponse>> {
        try {
            if (!API_KEY) {
                throw new Error('OpenRouter API key not configured');
            }

            const systemPrompt = this.getSystemPrompt();
            const userPrompt = this.getUserPrompt();

            const messages: OpenRouterMessage[] = [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: userPrompt
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: `data:image/jpeg;base64,${imageBase64}`,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ];

            const requestBody: OpenRouterRequest = {
                model: MODEL,
                messages,
                max_tokens: 500,
                temperature: 0.1,
                top_p: 0.9
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json',
                    'HTTP-Referer': window.location.origin,
                    'X-Title': 'AI Food Detection Camera'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            const content = data.choices?.[0]?.message?.content;

            if (!content) {
                throw new Error('No response content from OpenRouter API');
            }

            // Parse the JSON response from the LLM
            const analysisResult = this.parseAnalysisResponse(content);

            return {
                success: true,
                data: analysisResult,
                timestamp: Date.now()
            };

        } catch (error) {
            console.error('OpenRouter API error:', error);

            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                timestamp: Date.now()
            };
        }
    }

    /**
     * Get system prompt for food analysis
     */
    private getSystemPrompt(): string {
        return `You are an expert food nutritionist and image recognition specialist. Your task is to analyze food images and classify them according to the NOVA food classification system, plus analyze preservatives and sugar content.

NOVA Classification System:
1. **Unprocessed**: Fresh, whole foods in their natural state (fruits, vegetables, nuts, seeds, fresh meat, fish)
2. **Minimally Processed**: Foods processed only for preservation, safety, or convenience (frozen vegetables, dried fruits, plain yogurt, canned beans)
3. **Processed**: Foods with added salt, sugar, oil, or other substances (cheese, bread, canned vegetables in brine, smoked meats)
4. **Ultra-Processed (UPF)**: Formulated from industrial ingredients with additives (packaged snacks, soft drinks, ready meals, processed meats with preservatives)

PRESERVATION ANALYSIS:
- Identify any preservatives in ingredients
- Chemical preservatives (problematic): sodium benzoate, potassium sorbate, BHA, BHT, nitrates, nitrites, sulfites
- Natural preservatives (less concern): salt, sugar, vinegar, citric acid
- Rate overall preservation risk: low (none/natural only), medium (1-2 chemical), high (multiple chemical)

SUGAR ANALYSIS FOR 4-6 YEAR OLD CHILDREN:
- WHO daily limit for 4-6yo: 25g free sugars maximum
- Calculate sugar content per serving
- Flag as excessive if >50% of daily limit (>12.5g) in one serving
- Consider both added sugars and natural sugars in processed foods

You must respond with a JSON object in this exact format:
{
  "detected_food": "specific food name",
  "category": "unprocessed|minimal|processed|upf",
  "confidence": 0.85,
  "explanation": "Brief explanation of why this food fits this category",
  "nutritional_notes": "Optional additional nutritional information",
  "preservation": {
    "hasProblematicPreservatives": boolean,
    "preservativeTypes": ["chemical", "salt", "sugar"],
    "riskLevel": "low|medium|high",
    "simpleExplanation": "Brief parent-friendly explanation about preservatives"
  },
  "sugar": {
    "sugarContent": number,
    "dailyPercentageFor4To6YearOld": number,
    "isExcessive": boolean,
    "simpleExplanation": "Brief explanation for parents about sugar content"
  }
}

Be precise, scientific, and always provide a confidence score between 0 and 1.`;
    }

    /**
     * Get user prompt for food analysis
     */
    private getUserPrompt(): string {
        return `Please analyze this food image and classify it according to the NOVA system. Also analyze preservatives and sugar content for a 4-6 year old child. Identify the specific food item, determine its processing level, check for problematic preservatives, and calculate sugar impact. If you can see ingredient lists or nutrition labels, use them for more accurate analysis. Respond only with the JSON format specified in the system prompt.`;
    }

    /**
     * Parse the LLM response to extract food analysis
     */
    private parseAnalysisResponse(content: string): FoodAnalysisResponse {
        try {
            // Try to extract JSON from the response
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }

            const parsed = JSON.parse(jsonMatch[0]);

            // Validate required fields
            if (!parsed.detected_food || !parsed.category || typeof parsed.confidence !== 'number') {
                throw new Error('Invalid response format');
            }

            // Normalize category to ensure it matches our types
            const normalizedCategory = this.normalizeCategory(parsed.category);

            return {
                detected_food: parsed.detected_food,
                category: normalizedCategory,
                confidence: Math.max(0, Math.min(1, parsed.confidence)), // Clamp between 0 and 1
                explanation: parsed.explanation || 'No explanation provided',
                nutritional_notes: parsed.nutritional_notes,
                preservation: parsed.preservation ? {
                    hasProblematicPreservatives: Boolean(parsed.preservation.hasProblematicPreservatives),
                    preservativeTypes: Array.isArray(parsed.preservation.preservativeTypes) ? parsed.preservation.preservativeTypes : [],
                    riskLevel: ['low', 'medium', 'high'].includes(parsed.preservation.riskLevel) ? parsed.preservation.riskLevel : 'low',
                    simpleExplanation: parsed.preservation.simpleExplanation || 'No preservative information available'
                } : undefined,
                sugar: parsed.sugar ? {
                    sugarContent: Number(parsed.sugar.sugarContent) || 0,
                    dailyPercentageFor4To6YearOld: Number(parsed.sugar.dailyPercentageFor4To6YearOld) || 0,
                    isExcessive: Boolean(parsed.sugar.isExcessive),
                    simpleExplanation: parsed.sugar.simpleExplanation || 'No sugar information available'
                } : undefined
            };

        } catch (error) {
            console.error('Failed to parse analysis response:', error);

            // Fallback response
            return {
                detected_food: 'Unknown food item',
                category: 'processed',
                confidence: 0.1,
                explanation: 'Failed to analyze the image properly. Please try again with a clearer image.',
                nutritional_notes: undefined
            };
        }
    }

    /**
     * Normalize category string to match our FoodCategory type
     */
    private normalizeCategory(category: string): 'unprocessed' | 'minimal' | 'processed' | 'upf' {
        const normalized = category.toLowerCase().trim();

        if (normalized.includes('unprocessed') || normalized === 'fresh' || normalized === 'natural') {
            return 'unprocessed';
        }

        if (normalized.includes('minimal') || normalized === 'minimally_processed') {
            return 'minimal';
        }

        if (normalized.includes('ultra') || normalized === 'upf' || normalized === 'ultra_processed') {
            return 'upf';
        }

        return 'processed';
    }

    /**
     * Test API connection
     */
    async testConnection(): Promise<boolean> {
        try {
            const response = await fetch(API_URL.replace('/chat/completions', '/models'), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Connection test failed:', error);
            return false;
        }
    }
}
