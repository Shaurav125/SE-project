import { memo, useState, MouseEvent } from 'react';
import { RainfallDataPoint } from '../types';

interface RainfallChartProps {
    data: RainfallDataPoint[];
}

export const RainfallChart = memo(({ data }: RainfallChartProps) => {
    const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string }>({ visible: false, x: 0, y: 0, content: '' });
    
    if (!data || data.length === 0) {
        return (
            <div className="chart-container card">
                <h3 className="section-title">Annual Rainfall</h3>
                <div className="placeholder-text" style={{padding: '2rem 0', minHeight: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>
                    <p>Rainfall data not available.</p>
                </div>
            </div>
        );
    }

    const size = { width: 300, height: 180 };
    const margin = { top: 10, right: 10, bottom: 20, left: 35 }; // Wider left margin for labels
    const chart = { width: size.width - margin.left - margin.right, height: size.height - margin.top - margin.bottom };

    const minYear = Math.min(...data.map(d => d.year));
    const maxYear = Math.max(...data.map(d => d.year));
    const maxRainfall = Math.max(...data.map(d => d.rainfall), 0);
    
    const yearCount = data.length;
    const barWidth = chart.width / yearCount * 0.7; // 70% of available space for the bar

    const xScale = (year: number) => {
        const sortedData = [...data].sort((a, b) => a.year - b.year);
        const index = sortedData.findIndex(d => d.year === year);
        const bandWidth = chart.width / yearCount;
        return margin.left + index * bandWidth + (bandWidth - barWidth) / 2;
    };
    const yScale = (rainfall: number) => margin.top + chart.height - (rainfall / maxRainfall) * chart.height;

    const handleMouseOver = (e: MouseEvent<SVGRectElement>, d: RainfallDataPoint) => {
        setTooltip({
            visible: true,
            x: xScale(d.year) + barWidth / 2,
            y: yScale(d.rainfall),
            content: `<strong>${d.year}:</strong> ${d.rainfall} mm`
        });
    };
    
    const handleMouseOut = () => setTooltip({ ...tooltip, visible: false });
    
    const yAxisTicks = [0, Math.round(maxRainfall / 2), maxRainfall];

    return (
        <div className="chart-container card rainfall-chart">
            <h3 className="section-title">Annual Rainfall (mm)</h3>
            <svg viewBox={`0 0 ${size.width} ${size.height}`} aria-label={`Bar chart showing annual rainfall from ${minYear} to ${maxYear}`}>
                <g className="line-chart-grid" aria-hidden="true">
                    {yAxisTicks.map(val => (
                        <line key={val} x1={margin.left} y1={yScale(val)} x2={size.width - margin.right} y2={yScale(val)} />
                    ))}
                </g>
                <g className="line-chart-axis line-chart-axis-y" aria-hidden="true">
                    {yAxisTicks.map(val => (
                        <text key={val} x={margin.left - 5} y={yScale(val) + 4} textAnchor="end">{val}</text>
                    ))}
                </g>
                 <g className="line-chart-axis line-chart-axis-x" aria-hidden="true">
                    <text x={xScale(minYear) + barWidth / 2} y={size.height - margin.bottom + 15} textAnchor="middle">{minYear}</text>
                    <text x={xScale(maxYear) + barWidth / 2} y={size.height - margin.bottom + 15} textAnchor="middle">{maxYear}</text>
                </g>
                {data.map((d, i) => (
                    <rect
                        key={i}
                        x={xScale(d.year)}
                        y={yScale(d.rainfall)}
                        width={barWidth}
                        height={chart.height + margin.top - yScale(d.rainfall)}
                        className="bar-chart-bar"
                        onMouseOver={(e) => handleMouseOver(e, d)}
                        onMouseOut={handleMouseOut}
                        aria-label={`Year: ${d.year}, Rainfall: ${d.rainfall} mm`}
                    />
                ))}
            </svg>
            <div className={`chart-tooltip ${tooltip.visible ? 'visible' : ''}`} style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }} dangerouslySetInnerHTML={{ __html: tooltip.content }} role="tooltip" />
        </div>
    );
});