import { memo, useState, KeyboardEvent } from 'react';

interface InputFormProps { 
    isLoading: boolean; 
    onPredict: (location: string, advancedData?: { rainfall: string; soil: string; population: string }) => void;
    onGeolocate: () => void;
}

export const InputForm = memo(({ isLoading, onPredict, onGeolocate }: InputFormProps) => {
    const [location, setLocation] = useState('');
    const [advancedVisible, setAdvancedVisible] = useState(false);
    const [rainfall, setRainfall] = useState('');
    const [soil, setSoil] = useState('');
    const [population, setPopulation] = useState('');
    
    const handlePredict = () => { if (location) onPredict(location, { rainfall, soil, population }); };
    const handleKeyPress = (e: KeyboardEvent) => { if (e.key === 'Enter') handlePredict(); };
    
    return (<section className="form-container-wrapper card" role="form" aria-labelledby="form-heading">
        <h2 id="form-heading" className="sr-only">Groundwater Forecast Input</h2>
        <div className="form-container">
            <div className="input-wrapper">
                <label htmlFor="location-input" className="sr-only">Enter a city, region, or country</label>
                <input id="location-input" type="text" className="text-input location-input" placeholder="Enter a city, region, or country..." value={location} onChange={(e) => setLocation(e.target.value)} onKeyPress={handleKeyPress} disabled={isLoading} />
                <div className="input-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>
            </div>
            <button className="predict-button" onClick={handlePredict} disabled={isLoading || !location}>
                {isLoading ? <><div className="button-loader"></div><span>Forecasting...</span></> : <><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="m12 12-2 5h4l-2 5"/></svg><span>Forecast</span></>}
            </button>
            <button className="icon-button geolocate-button" onClick={onGeolocate} disabled={isLoading} aria-label="Use my location">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><line x1="22" y1="12" x2="18" y2="12"></line><line x1="6" y1="12" x2="2" y2="12"></line><line x1="12" y1="6" x2="12" y2="2"></line><line x1="12" y1="22" x2="12" y2="18"></line></svg>
            </button>
            <button className="icon-button advanced-options-toggle" onClick={() => setAdvancedVisible(!advancedVisible)} disabled={isLoading} aria-label="Toggle advanced options" aria-expanded={advancedVisible}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9.5 9.5 5 5"></path><path d="m14.5 9.5-5 5"></path></svg>
            </button>
            <div className={`advanced-options ${advancedVisible ? 'visible' : ''}`}>
                <div className="advanced-input-group">
                    <label htmlFor="rainfall-input">Avg. Annual Rainfall (mm)</label>
                    <input id="rainfall-input" type="number" className="text-input" placeholder="e.g., 600" value={rainfall} onChange={(e) => setRainfall(e.target.value)} disabled={isLoading} />
                </div>
                <div className="advanced-input-group">
                    <label htmlFor="soil-input">Dominant Soil Type</label>
                    <input id="soil-input" type="text" className="text-input" placeholder="e.g., Sandy Loam" value={soil} onChange={(e) => setSoil(e.target.value)} disabled={isLoading} />
                </div>
                <div className="advanced-input-group">
                    <label htmlFor="population-input">Population Density (/km²)</label>
                    <input id="population-input" type="number" className="text-input" placeholder="e.g., 150" value={population} onChange={(e) => setPopulation(e.target.value)} disabled={isLoading} />
                </div>
            </div>
        </div>
    </section>);
});