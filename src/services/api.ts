import { GoogleGenAI, Type } from '@google/genai';
import { PredictionData, Coordinates } from '../types';
import { DEFAULT_SYSTEM_INSTRUCTION } from '../constants';

// For readability and maintainability, the schema is defined as a constant with added descriptions to guide the model.
const metricSchema = { type: Type.OBJECT, properties: { value: { type: Type.STRING, description: "The qualitative value of the metric (e.g., 'Sandy Loam')." }, score: { type: Type.NUMBER, description: "A quantitative score from 0-100 representing the metric's impact." } }, required: ['value', 'score'] };
const scenarioSchema = { type: Type.OBJECT, properties: { mostLikely: { type: Type.STRING }, optimistic: { type: Type.STRING }, pessimistic: { type: Type.STRING }, }, required: ['mostLikely', 'optimistic', 'pessimistic'], };
const outlookSchema = { type: Type.OBJECT, properties: { confidence: { type: Type.STRING, description: "Confidence level: 'High', 'Medium', or 'Low'." }, confidenceScore: { type: Type.NUMBER, description: "A numerical confidence score from 0-100." }, keyFactors: { type: Type.STRING }, scenarios: scenarioSchema, }, required: ['confidence', 'confidenceScore', 'keyFactors', 'scenarios'], };
const historicalAndPredictedSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.NUMBER }, score: { type: Type.NUMBER, description: "Water level score for that year, 0-100." } }, required: ['year', 'score'] } };
const rainfallSchema = { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { year: { type: Type.NUMBER }, rainfall: { type: Type.NUMBER, description: "Total annual rainfall in millimeters (mm)." } }, required: ['year', 'rainfall'] } };

const fullResponseSchema = { type: Type.OBJECT, properties: { locationName: { type: Type.STRING }, coordinates: { type: Type.OBJECT, properties: { lat: { type: Type.NUMBER }, lon: { type: Type.NUMBER } }, required: ['lat', 'lon'], }, currentWaterLevelIndex: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER, description: "Current water level score, 0-100." }, condition: { type: Type.STRING, description: "'Safe', 'Moderate', or 'Danger'." } }, required: ['score', 'condition'] }, keyMetrics: { type: Type.OBJECT, properties: { avgAnnualRainfall: metricSchema, dominantSoilType: metricSchema, populationDensity: metricSchema, keyGeologicalFormation: metricSchema }, required: ["avgAnnualRainfall", "dominantSoilType", "populationDensity", "keyGeologicalFormation"], }, historicalWaterLevels: historicalAndPredictedSchema, predictedWaterLevels: historicalAndPredictedSchema, rainfallData: rainfallSchema, recommendations: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, description: { type: Type.STRING } }, required: ['title', 'description'] } }, report: { type: Type.OBJECT, properties: { coreFactors: { type: Type.STRING }, shortTerm: outlookSchema, longTerm: outlookSchema, conclusion: { type: Type.STRING }, }, required: ['coreFactors', 'shortTerm', 'longTerm', 'conclusion'], }, }, required: ['coordinates', 'keyMetrics', 'currentWaterLevelIndex', 'historicalWaterLevels', 'predictedWaterLevels', 'rainfallData', 'recommendations', 'report'], };

/**
 * Validates the parsed JSON object against the expected PredictionData structure.
 * @param data - The parsed JSON data from the API.
 * @throws An error if the data is missing required fields.
 */
const validatePredictionData = (data: any): data is PredictionData => {
    const requiredKeys: (keyof PredictionData)[] = [
        'locationName', 'coordinates', 'keyMetrics', 'currentWaterLevelIndex',
        'historicalWaterLevels', 'predictedWaterLevels', 'rainfallData', 'recommendations', 'report'
    ];
    for (const key of requiredKeys) {
        if (data[key] === undefined || data[key] === null) {
            throw new Error(`API response is missing required field: ${key}`);
        }
    }
    if (!data.report.shortTerm || !data.report.longTerm) {
        throw new Error('API response is missing short-term or long-term report data.');
    }
    return true;
};

/**
 * Sanitizes and validates the logical integrity of the prediction data.
 * @param data - The parsed prediction data.
 * @returns The sanitized and validated data.
 * @throws An error if the data has logical inconsistencies.
 */
const sanitizeAndEnhanceData = (data: PredictionData, coords?: Coordinates): PredictionData => {
    // 1. Clamp scores to be within 0-100 range.
    data.currentWaterLevelIndex.score = Math.max(0, Math.min(100, data.currentWaterLevelIndex.score));
    Object.values(data.keyMetrics).forEach(metric => {
        metric.score = Math.max(0, Math.min(100, metric.score));
    });

    // 2. Ensure all time-series data is sorted by year.
    const sortByYear = (a: { year: number }, b: { year: number }) => a.year - b.year;
    data.historicalWaterLevels.sort(sortByYear);
    data.predictedWaterLevels.sort(sortByYear);
    data.rainfallData.sort(sortByYear);

    // 3. Validate continuity between historical and predicted data.
    if (data.historicalWaterLevels.length > 0 && data.predictedWaterLevels.length > 0) {
        const lastHistoricalYear = data.historicalWaterLevels[data.historicalWaterLevels.length - 1].year;
        const firstPredictedYear = data.predictedWaterLevels[0].year;
        if (firstPredictedYear !== lastHistoricalYear + 1) {
            throw new Error('Inconsistent forecast timeline: Prediction does not start immediately after historical data.');
        }
    }

    // 4. Align rainfall data with historical data years.
    if (data.historicalWaterLevels.length > 0) {
        const historicalYears = new Set(data.historicalWaterLevels.map(d => d.year));
        data.rainfallData = data.rainfallData.filter(d => historicalYears.has(d.year));
    }
    
    // 5. Provide fallback for locationName if missing.
    if (!data.locationName && coords) {
        data.locationName = `Forecast for ${coords.lat.toFixed(2)}°, ${coords.lon.toFixed(2)}°`;
    }


    return data;
};


/**
 * Calls the Gemini API to get a groundwater prediction.
 * @param params - The location name or coordinates for the prediction.
 * @returns A promise that resolves to the full prediction data.
 */
export const getGroundwaterPrediction = async ({ location, coords, advancedData }: { location?: string; coords?: Coordinates; advancedData?: { rainfall: string; soil: string; population: string; } }): Promise<PredictionData> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let prompt: string;
    const basePrompt = "Generate a detailed groundwater forecast, prioritizing data from official government meteorological and geological survey sources. Ensure all time-series data (historicalWaterLevels, predictedWaterLevels, rainfallData) is sorted chronologically by year. Crucially, the 'predictedWaterLevels' array must start exactly one year after the final year in 'historicalWaterLevels'. The 'rainfallData' array must correspond to the same years as the 'historicalWaterLevels' data. All scores must be between 0 and 100. The 'conclusion' field must be a concise summary formatted as a markdown bulleted list (e.g., using '-' or '*'). Each point should highlight a key takeaway from the analysis.";

    let advancedPromptPart = '';
    if (advancedData) {
        const { rainfall, soil, population } = advancedData;
        const parts = [];
        if (rainfall) parts.push(`average annual rainfall of ${rainfall} mm`);
        if (soil) parts.push(`a dominant soil type of '${soil}'`);
        if (population) parts.push(`a population density of ${population} people per square kilometer`);
        
        if (parts.length > 0) {
            advancedPromptPart = ` Use the following user-provided data as a primary source for your analysis, overriding general data where specified: ${parts.join(', ')}.`;
        }
    }

    if (location) {
        prompt = `${basePrompt} The location is: "${location}".${advancedPromptPart}`;
    } else if (coords) {
        prompt = `${basePrompt} The coordinates are lat: ${coords.lat}, lon: ${coords.lon}. Include a 'locationName' in the response.${advancedPromptPart}`;
    } else {
        throw new Error("Either location or coordinates must be provided.");
    }
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
            responseMimeType: "application/json", 
            responseSchema: fullResponseSchema,
            temperature: 0.2
        }
    });

    let jsonResponse: any;
    try {
        let jsonString = response.text.trim();
        // The API might still wrap the JSON in markdown, so we strip it just in case.
        if (jsonString.startsWith('```json') && jsonString.endsWith('```')) {
            jsonString = jsonString.substring(7, jsonString.length - 3).trim();
        }
        jsonResponse = JSON.parse(jsonString);
        validatePredictionData(jsonResponse);

    } catch (parseError) {
        console.error("Data Validation/Parsing Error:", parseError, "Original string:", response.text);
        if (parseError instanceof Error && parseError.message.startsWith('API response is missing')) {
             throw new Error("The service's response was incomplete. Please try again.");
        }
        throw new Error("API returned malformed JSON. The response might not be a valid JSON object.");
    }
    
    // Sanitize and validate the logical integrity of the data.
    return sanitizeAndEnhanceData(jsonResponse as PredictionData, coords);
};