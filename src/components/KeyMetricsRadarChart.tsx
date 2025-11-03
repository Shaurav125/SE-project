import { memo } from 'react';
import { KeyMetrics, Metric } from '../types';
import { KEY_METRIC_DISPLAY_NAMES } from '../constants';

/*
 * NOTE: This component was originally a radar chart but was redesigned to a more
 * readable grid of "Factor Cards" for better UX. The filename and component name
 * are retained to maintain component tree stability, but its visual output is a grid.
 */

const RainfallIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25"/><path d="M8 14v4"/><path d="M12 16v4"/><path d="M16 14v4"/></svg>;
const SoilIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22h20V2L2 22z"/><path d="M7 12h2"/><path d="M11 12h2"/><path d="M15 12h2"/><path d="M7 16h2"/><path d="M11 16h2"/><path d="M15 16h2"/><path d="M7 8h2"/><path d="M11 8h2"/></svg>;
const PopulationIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const GeologyIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 20l7-10 4 4 7-10"/></svg>;

const ICONS: { [key in keyof KeyMetrics]: React.ReactNode } = {
    avgAnnualRainfall: <RainfallIcon />,
    dominantSoilType: <SoilIcon />,
    populationDensity: <PopulationIcon />,
    keyGeologicalFormation: <GeologyIcon />,
};

const getImpactClass = (score: number) => {
    if (score < 40) return 'impact-negative';
    if (score < 70) return 'impact-moderate';
    return 'impact-positive';
};

interface FactorCardProps {
    metricKey: keyof KeyMetrics;
    metric: Metric;
}

const FactorCard = ({ metricKey, metric }: FactorCardProps) => {
    const impactClass = getImpactClass(metric.score);
    return (
        <div className="key-factor-card">
            <div className="factor-icon">{ICONS[metricKey]}</div>
            <div className="factor-details">
                <h4 className="factor-title">{KEY_METRIC_DISPLAY_NAMES[metricKey]}</h4>
                <p className="factor-value">{metric.value}</p>
                <div className="factor-score-bar-container" title={`Impact Score: ${metric.score}/100`}>
                    <div className={`factor-score-bar ${impactClass}`} style={{ width: `${metric.score}%` }}></div>
                </div>
            </div>
        </div>
    );
};


interface KeyMetricsRadarChartProps {
    data: KeyMetrics;
}

// Note: This component has been redesigned from a radar chart to a grid of factor cards for better clarity.
// The filename and export name are preserved to maintain compatibility within the existing project structure.
export const KeyMetricsRadarChart = memo(({ data }: KeyMetricsRadarChartProps) => {
    return (
        <div className="key-factor-grid">
            {(Object.keys(data) as Array<keyof KeyMetrics>).map(key => (
                <FactorCard key={key} metricKey={key} metric={data[key]} />
            ))}
        </div>
    );
});