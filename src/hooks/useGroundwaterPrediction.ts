import { useReducer, useCallback } from 'react';
import { PredictionData, Coordinates } from '../types';
import { getGroundwaterPrediction } from '../services/api';
import { MAX_API_RETRIES, API_RETRY_DELAY, MIN_LOADING_TIME } from '../constants';

type PredictionState = {
    status: 'idle' | 'loading' | 'success' | 'error';
    data: PredictionData | null;
    error: string | null;
    retryAttempt: number;
};

type PredictionAction = 
    | { type: 'FETCH_START' } 
    | { type: 'FETCH_SUCCESS', payload: PredictionData } 
    | { type: 'FETCH_ERROR', payload: string } 
    | { type: 'SET_RETRY', payload: number }
    | { type: 'RESET' };

const predictionReducer = (state: PredictionState, action: PredictionAction): PredictionState => {
    switch (action.type) {
        case 'FETCH_START': return { ...state, status: 'loading', error: null, retryAttempt: 0 };
        case 'FETCH_SUCCESS': return { status: 'success', data: action.payload, error: null, retryAttempt: 0 };
        case 'FETCH_ERROR': return { ...state, status: 'error', error: action.payload, data: null, retryAttempt: 0 };
        case 'SET_RETRY': return { ...state, status: 'loading', retryAttempt: action.payload, error: null, data: null };
        case 'RESET': return { status: 'idle', data: null, error: null, retryAttempt: 0 };
        default: throw new Error('Unhandled action type');
    }
};

interface FetchParams {
    location?: string;
    coords?: Coordinates;
    advancedData?: {
        rainfall: string;
        soil: string;
        population: string;
    }
}

export const useGroundwaterPrediction = () => {
    const [state, dispatch] = useReducer(predictionReducer, { status: 'idle', data: null, error: null, retryAttempt: 0 });

    const fetchPrediction = useCallback(async (params: FetchParams) => {
        dispatch({ type: 'FETCH_START' });

        for (let attempt = 1; attempt <= MAX_API_RETRIES; attempt++) {
            const startTime = Date.now();
            try {
                const data = await getGroundwaterPrediction(params);

                // Enforce a minimum loading time for a smoother user experience
                const elapsedTime = Date.now() - startTime;
                if (elapsedTime < MIN_LOADING_TIME) {
                    await new Promise(resolve => setTimeout(resolve, MIN_LOADING_TIME - elapsedTime));
                }

                dispatch({ type: 'FETCH_SUCCESS', payload: data });
                return; // Success, exit the retry loop
            } catch (err: any) {
                const errorMessage = err instanceof Error ? err.message : (err && err.message) || '';
                const lowerCaseMessage = errorMessage.toLowerCase();
                const isRetriable = !navigator.onLine || lowerCaseMessage.includes('503') || lowerCaseMessage.includes('500') || lowerCaseMessage.includes('service unavailable') || lowerCaseMessage.includes('network error');
                
                if (isRetriable && attempt < MAX_API_RETRIES) {
                    dispatch({ type: 'SET_RETRY', payload: attempt });
                    await new Promise(resolve => setTimeout(resolve, API_RETRY_DELAY * Math.pow(2, attempt - 1)));
                    continue; // Continue to the next attempt
                }
                
                // If the error is not retriable or max retries are reached, fail permanently.
                let detailedError = 'An unexpected error occurred. Please try again later.';
                if (!navigator.onLine) {
                   detailedError = 'Network error. Please check your internet connection.';
                } else if (lowerCaseMessage.includes('malformed json') || lowerCaseMessage.includes('incomplete')) {
                   detailedError = 'The service returned an unreadable response. This may be a temporary issue.';
                } else if (lowerCaseMessage.includes('inconsistent forecast timeline')) {
                   detailedError = 'The service returned an inconsistent forecast timeline. Please try again.';
                } else if (lowerCaseMessage.includes('api key')) {
                   detailedError = 'The prediction service is temporarily unavailable. Please try again.';
                } else if (lowerCaseMessage.includes('400') || lowerCaseMessage.includes('invalid argument')) {
                   detailedError = 'The location could not be processed. Please try a different one.';
                } else if (lowerCaseMessage.includes('503') || lowerCaseMessage.includes('500') || lowerCaseMessage.includes('service unavailable')) {
                   detailedError = 'The prediction service is temporarily unavailable. Please try again.';
                } else {
                   detailedError = errorMessage;
                }
                dispatch({ type: 'FETCH_ERROR', payload: detailedError });
                return; // Failure, exit the retry loop
            }
        }
    }, []);
    
    const setPredictionError = useCallback((errorMessage: string) => {
        dispatch({ type: 'FETCH_ERROR', payload: errorMessage });
    }, []);

    const resetPrediction = useCallback(() => {
        dispatch({ type: 'RESET' });
    }, []);

    return { state, fetchPrediction, setPredictionError, resetPrediction };
};