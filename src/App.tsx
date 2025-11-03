import { useState, useEffect, useCallback } from 'react';
import { Coordinates } from './types';
import { MAX_API_RETRIES } from './constants';
import { useGroundwaterPrediction } from './hooks/useGroundwaterPrediction';
import { useTypingAnimation } from './hooks/useTypingAnimation';
import { Header } from './components/Header';
import { InputForm } from './components/InputForm';
import { ReportView } from './components/ReportView';
import { Footer } from './components/Footer';

const LOADING_MESSAGES = [
    'Analyzing regional geological data...',
    'Cross-referencing historical rainfall patterns...',
    'Evaluating population and agricultural impact...',
    'Generating comprehensive forecast...',
];

export default function App() {
    const { state, fetchPrediction, setPredictionError, resetPrediction } =
        useGroundwaterPrediction();
    const [currentLoadingMessage, setCurrentLoadingMessage] = useState(
        LOADING_MESSAGES[0],
    );
    const { displayedText: animatedLoadingMessage, isTyping } =
        useTypingAnimation(currentLoadingMessage, 50);

    useEffect(() => {
        let messageIndex = 0;
        let intervalId: number | undefined;

        if (state.status === 'loading' && state.retryAttempt === 0) {
            setCurrentLoadingMessage(LOADING_MESSAGES[0]); // Reset to first message on new load
            intervalId = window.setInterval(() => {
                messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
                setCurrentLoadingMessage(LOADING_MESSAGES[messageIndex]);
            }, 3500); // Increased interval to allow typing animation to complete
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [state.status, state.retryAttempt]);

    const handlePredict = useCallback(
        (
            location: string,
            advancedData?: {
                rainfall: string;
                soil: string;
                population: string;
            },
        ) => {
            fetchPrediction({ location, advancedData });
        },
        [fetchPrediction],
    );

    const handleGeolocate = useCallback(() => {
        if (!navigator.geolocation) {
            setPredictionError('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords: Coordinates = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                };
                fetchPrediction({ coords });
            },
            (error) => {
                let errorMessage = 'Could not retrieve your location. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage += 'Please enable location services.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage += 'Location information is unavailable.';
                        break;
                    case error.TIMEOUT:
                        errorMessage +=
                            'The request to get user location timed out.';
                        break;
                    default:
                        errorMessage += 'An unknown error occurred.';
                        break;
                }
                setPredictionError(errorMessage);
            },
        );
    }, [fetchPrediction, setPredictionError]);

    return (
        <>
            <Header />
            <InputForm
                isLoading={state.status === 'loading'}
                onPredict={handlePredict}
                onGeolocate={handleGeolocate}
            />
            {state.error && (
                <div className="error-message" role="alert">
                    {state.error}
                </div>
            )}
            <main>
                <div className="results-container">
                    {state.status === 'idle' && (
                        <div className="placeholder-text">
                            <div className="placeholder-icon">
                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 2C7.03 2 3 6.03 3 11C3 16.05 12 22 12 22C12 22 21 16.05 21 11C21 6.03 16.97 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M8 12L10 14L12 11L14 15L16 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h2>Enter a location to begin</h2>
                            <p>
                                Receive an advanced groundwater forecast in
                                seconds.
                            </p>
                        </div>
                    )}
                    {state.status === 'loading' && (
                        <div className="placeholder-text">
                            <div
                                className="map-loader"
                                style={{ marginBottom: '1rem' }}
                            ></div>
                            <h2>
                                {state.retryAttempt > 0 ? (
                                    `Connection Unstable. Retrying... (${state.retryAttempt}/${MAX_API_RETRIES})`
                                ) : (
                                    <>
                                        {animatedLoadingMessage}
                                        {isTyping && (
                                            <span className="typing-cursor"></span>
                                        )}
                                    </>
                                )}
                            </h2>
                            <p>
                                This may take a moment while we process complex
                                data.
                            </p>
                        </div>
                    )}
                    {state.status === 'success' && state.data && (
                        <ReportView data={state.data} onReset={resetPrediction} />
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}