export interface Coordinates { lat: number; lon: number; }
export interface Metric { value: string; score: number; } // Score: 0-100 for radar chart
export interface KeyMetrics {
    avgAnnualRainfall: Metric;
    dominantSoilType: Metric;
    populationDensity: Metric;
    keyGeologicalFormation: Metric;
}
export interface HistoricalDataPoint { year: number; score: number; }
export interface RainfallDataPoint { year: number; rainfall: number; }
export interface Recommendation { title: string; description: string; }
export interface WaterLevelIndex { score: number; condition: 'Safe' | 'Moderate' | 'Danger'; }
export interface FutureScenario { mostLikely: string; optimistic: string; pessimistic: string; }
export interface FutureOutlook { confidence: 'High' | 'Medium' | 'Low'; confidenceScore: number; keyFactors: string; scenarios: FutureScenario; }
export interface PredictionReport { coreFactors: string; shortTerm: FutureOutlook; longTerm: FutureOutlook; conclusion: string; }
export interface PredictionData {
    locationName: string;
    coordinates: Coordinates;
    keyMetrics: KeyMetrics;
    currentWaterLevelIndex: WaterLevelIndex;
    historicalWaterLevels: HistoricalDataPoint[];
    predictedWaterLevels: HistoricalDataPoint[];
    rainfallData: RainfallDataPoint[];
    recommendations: Recommendation[];
    report: PredictionReport;
}