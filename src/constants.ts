import { KeyMetrics } from "./types";

export const INITIAL_MAP_VIEW: [number, number] = [20, 0];
export const INITIAL_MAP_ZOOM = 2;
export const LOCATION_MAP_ZOOM = 10;
export const DEFAULT_SYSTEM_INSTRUCTION = "Act as an expert hydrogeologist. Your analysis must be rigorously grounded in data from official sources like government geological surveys and meteorological agencies. Provide a precise, quantitative groundwater forecast. Prioritize verifiable data over speculation. When providing scores and predictions, maintain a conservative and data-driven approach. Clearly state the key factors influencing your forecast.";

export const KEY_METRIC_DISPLAY_NAMES: { [key in keyof KeyMetrics]: string } = {
    avgAnnualRainfall: "Rainfall",
    dominantSoilType: "Soil Type",
    populationDensity: "Population",
    keyGeologicalFormation: "Geology",
};

// --- API Reliability ---
export const MAX_API_RETRIES = 3;
export const API_RETRY_DELAY = 1500; // ms
export const MIN_LOADING_TIME = 750; // ms
