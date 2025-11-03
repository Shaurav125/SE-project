import { memo, Children, isValidElement, cloneElement, useState, useEffect, CSSProperties } from 'react';
import { marked } from 'marked';
import { PredictionData, FutureOutlook } from '../types';
import { WaterLevelGauge } from './WaterLevelGauge';
import { KeyMetricsRadarChart } from './KeyMetricsRadarChart';
import { HistoricalTrendChart } from './HistoricalTrendChart';
import { Recommendations } from './Recommendations';
import { RainfallChart } from './RainfallChart';
import { ForecastMethodology } from './ForecastMethodology';

interface ReportViewProps {
    data: PredictionData;
    onReset: () => void;
}

// Secure marked configuration
const renderer = new marked.Renderer();
renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }): string => {
    return `<a target="_blank" rel="noopener noreferrer" href="${href}" title="${title || ''}">${text}</a>`;
};
marked.use({ renderer, gfm: true, breaks: true });


const StaggerContainer = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            {Children.map(children, (child, index) => {
                if (isValidElement(child)) {
                    // FIX: Cast child.props to a type that includes an optional 'style' property to resolve the TypeScript error,
                    // and provide a fallback `{}` for `child.props.style` to prevent runtime errors when a child component doesn't have a style prop.
                    return cloneElement(child as React.ReactElement<any>, {
                        style: { ...((child.props as { style?: CSSProperties }).style || {}), animationDelay: `${index * 100}ms` }
                    });
                }
                return child;
            })}
        </>
    );
};

const OutlookSection = ({ title, outlook, className, style }: { title: string; outlook: FutureOutlook; className: string; style?: React.CSSProperties; }) => {
    const confidenceClass = `confidence-${outlook.confidence.toLowerCase()}`;

    return (
        <section className={`report-section card ${className}`} style={style}>
            <div className="outlook-header">
                <h3 className="section-title" style={{ border: 'none', marginBottom: 0, paddingBottom: 0 }}>{title}</h3>
                <div className={`confidence-badge ${confidenceClass}`}>
                    <span className="confidence-badge-text">{outlook.confidence} Confidence</span>
                </div>
            </div>

            <div className="scenario-grid">
                <div className="scenario-card most-likely">
                    <h4 className="scenario-title">Most Likely Scenario</h4>
                    <p>{outlook.scenarios.mostLikely}</p>
                </div>
                <div className="scenario-card optimistic">
                    <h4 className="scenario-title">Optimistic Scenario</h4>
                    <p>{outlook.scenarios.optimistic}</p>
                </div>
                <div className="scenario-card pessimistic">
                    <h4 className="scenario-title">Pessimistic Scenario</h4>
                    <p>{outlook.scenarios.pessimistic}</p>
                </div>
            </div>

            <div className="key-factors-container">
                <h5>Key Influencing Factors</h5>
                <p>{outlook.keyFactors}</p>
            </div>
        </section>
    );
};


export const ReportView = memo(({ data, onReset }: ReportViewProps) => {
    const { report } = data;
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (copied) {
            const timer = setTimeout(() => setCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [copied]);

    const handleCopyCoords = () => {
        if (navigator.clipboard) {
            const coordsText = `${data.coordinates.lat.toFixed(4)}, ${data.coordinates.lon.toFixed(4)}`;
            navigator.clipboard.writeText(coordsText)
                .then(() => setCopied(true))
                .catch(err => console.error('Failed to copy coordinates: ', err));
        }
    };

    return (
        <div className="report-content fade-in">
            <header className="report-header">
                <h2>{data.locationName}</h2>
                <div className="report-subheader">
                     <div className="coordinates">
                        <span>{data.coordinates.lat.toFixed(4)}°, {data.coordinates.lon.toFixed(4)}°</span>
                        <a href={`https://www.google.com/maps/search/?api=1&query=${data.coordinates.lat},${data.coordinates.lon}`} target="_blank" rel="noopener noreferrer" className="map-link">
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            View on Map
                        </a>
                        <button onClick={handleCopyCoords} className="copy-button" aria-label="Copy coordinates">
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                     <button onClick={onReset} className="reset-button">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                        Start New Forecast
                    </button>
                </div>
            </header>
            <StaggerContainer>
                <WaterLevelGauge data={data.currentWaterLevelIndex} />
                <section className="report-section key-factor-analysis card">
                    <h3 className="section-title">Key Factor Analysis</h3>
                    <KeyMetricsRadarChart data={data.keyMetrics} />
                </section>
                <HistoricalTrendChart data={data.historicalWaterLevels} predictionData={data.predictedWaterLevels} />
                <RainfallChart data={data.rainfallData} />
                <OutlookSection title="Short-Term Outlook (1-5 Years)" outlook={report.shortTerm} className="outlook-short-term" />
                <OutlookSection title="Long-Term Outlook (5-20 Years)" outlook={report.longTerm} className="outlook-long-term" />
                <Recommendations data={data.recommendations} className="recommendations-section" />
                <section className="report-section conclusion-section card">
                    <h3 className="section-title">Conclusion</h3>
                    <div className="markdown-body" dangerouslySetInnerHTML={{ __html: marked.parse(report.conclusion) as string }} />
                </section>
                <ForecastMethodology />
            </StaggerContainer>
        </div>
    );
});