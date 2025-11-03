import { memo, useState, useRef, MouseEvent } from 'react';
import { HistoricalDataPoint } from '../types';

// --- SVG Path Smoothing Functions ---
const line = (
    pointA: { x: number; y: number },
    pointB: { x: number; y: number },
) => {
    const lengthX = pointB.x - pointA.x;
    const lengthY = pointB.y - pointA.y;
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX),
    };
};

const controlPoint = (
    current: { x: number; y: number },
    previous: { x: number; y: number } | undefined,
    next: { x: number; y: number } | undefined,
    reverse?: boolean,
) => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2;
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current.x + Math.cos(angle) * length;
    const y = current.y + Math.sin(angle) * length;
    return [x, y];
};

const svgPath = (
    points: { x: number; y: number }[],
    command: (
        point: { x: number; y: number },
        i: number,
        a: { x: number; y: number }[],
    ) => string,
) => {
    return points.reduce(
        (acc, point, i, a) =>
            i === 0
                ? `M ${point.x},${point.y}`
                : `${acc} ${command(point, i, a)}`,
        '',
    );
};

const lineCommand = (
    point: { x: number; y: number },
    i: number,
    a: { x: number; y: number }[],
) => {
    const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
    const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point.x},${point.y}`;
};
// --- End SVG Path Smoothing ---

interface HistoricalTrendChartProps {
    data: HistoricalDataPoint[];
    predictionData: HistoricalDataPoint[];
}

export const HistoricalTrendChart = memo(
    ({ data, predictionData }: HistoricalTrendChartProps) => {
        const [tooltip, setTooltip] = useState<{
            visible: boolean;
            x: number;
            y: number;
            content: string;
        }>({ visible: false, x: 0, y: 0, content: '' });
        const svgRef = useRef<SVGSVGElement>(null);

        if (!data || data.length < 2) {
            return (
                <div className="chart-container card">
                    <h3 className="section-title">Historical & Predicted Trend</h3>
                    <div
                        className="placeholder-text"
                        style={{
                            padding: '2rem 0',
                            minHeight: '180px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                        }}
                    >
                        <p>Insufficient historical data for trend analysis.</p>
                    </div>
                </div>
            );
        }

        const allData = [...data, ...predictionData];
        const lastHistoricalPoint = data[data.length - 1];
        const fullPredictionData =
            predictionData.length > 0
                ? [lastHistoricalPoint, ...predictionData]
                : [];

        const minYear =
            allData.length > 0 ? Math.min(...allData.map((d) => d.year)) : 0;
        const maxYear =
            allData.length > 0 ? Math.max(...allData.map((d) => d.year)) : 0;

        if (minYear === maxYear) {
            return (
                <div className="chart-container card">
                    <h3 className="section-title">Historical & Predicted Trend</h3>
                    <div
                        className="placeholder-text"
                        style={{
                            padding: '2rem 0',
                            minHeight: '180px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
                        }}
                    >
                        <p>Insufficient data range for trend analysis.</p>
                    </div>
                </div>
            );
        }

        const size = { width: 300, height: 180 };
        const margin = { top: 10, right: 10, bottom: 20, left: 25 };
        const chart = {
            width: size.width - margin.left - margin.right,
            height: size.height - margin.top - margin.bottom,
        };

        const xScale = (year: number) =>
            margin.left +
            ((year - minYear) / (maxYear - minYear)) * chart.width;
        const yScale = (score: number) =>
            margin.top + chart.height - (score / 100) * chart.height;

        const historicalPoints = data.map((d) => ({
            x: xScale(d.year),
            y: yScale(d.score),
        }));
        const historicalLinePath = svgPath(historicalPoints, lineCommand);
        const areaPath = `${historicalLinePath} L ${xScale(lastHistoricalPoint.year)},${size.height - margin.bottom} L ${xScale(data[0].year)},${size.height - margin.bottom} Z`;

        const predictionPoints = fullPredictionData.map((d) => ({
            x: xScale(d.year),
            y: yScale(d.score),
        }));
        const predictionLinePath = svgPath(predictionPoints, lineCommand);

        const handleMouseOver = (
            e: MouseEvent<SVGCircleElement>,
            d: HistoricalDataPoint,
            isPrediction: boolean,
        ) => {
            setTooltip({
                visible: true,
                x: xScale(d.year),
                y: yScale(d.score),
                content: `<strong>${d.year}${isPrediction ? ' (Predicted)' : ''}:</strong> ${d.score}/100`,
            });
        };

        const handleMouseOut = () => setTooltip({ ...tooltip, visible: false });

        return (
            <div className="chart-container card historical-trend-chart">
                <h3 className="section-title">Historical & Predicted Trend</h3>
                <svg
                    ref={svgRef}
                    viewBox={`0 0 ${size.width} ${size.height}`}
                    aria-label={`Line chart showing historical and predicted water level from ${minYear} to ${maxYear}`}
                >
                    <g className="line-chart-grid" aria-hidden="true">
                        {[0, 25, 50, 75, 100].map((val) => (
                            <line
                                key={val}
                                x1={margin.left}
                                y1={yScale(val)}
                                x2={size.width - margin.right}
                                y2={yScale(val)}
                            />
                        ))}
                    </g>
                    <g
                        className="line-chart-axis line-chart-axis-y"
                        aria-hidden="true"
                    >
                        {[0, 50, 100].map((val) => (
                            <text
                                key={val}
                                x={margin.left - 5}
                                y={yScale(val) + 4}
                                textAnchor="end"
                            >
                                {val}
                            </text>
                        ))}
                    </g>
                    <g
                        className="line-chart-axis line-chart-axis-x"
                        aria-hidden="true"
                    >
                        {[minYear, maxYear].map((val) => (
                            <text
                                key={val}
                                x={xScale(val)}
                                y={size.height - margin.bottom + 15}
                                textAnchor="middle"
                            >
                                {val}
                            </text>
                        ))}
                    </g>
                    <path d={areaPath} className="line-chart-area" />
                    <path d={historicalLinePath} className="line-chart-line" />
                    {predictionData.length > 0 && (
                        <path
                            d={predictionLinePath}
                            className="line-chart-line prediction"
                        />
                    )}
                    {data.map((d, i) => (
                        <circle
                            key={`hist-${i}`}
                            cx={xScale(d.year)}
                            cy={yScale(d.score)}
                            r="4"
                            className="line-chart-point"
                            onMouseOver={(e) => handleMouseOver(e, d, false)}
                            onMouseOut={handleMouseOut}
                            aria-label={`Year: ${d.year}, Score: ${d.score}`}
                        />
                    ))}
                    {predictionData.map((d, i) => (
                        <circle
                            key={`pred-${i}`}
                            cx={xScale(d.year)}
                            cy={yScale(d.score)}
                            r="4"
                            className="line-chart-point prediction"
                            onMouseOver={(e) => handleMouseOver(e, d, true)}
                            onMouseOut={handleMouseOut}
                            aria-label={`Predicted Year: ${d.year}, Predicted Score: ${d.score}`}
                        />
                    ))}
                </svg>
                <div className="chart-legend">
                    <div className="legend-item">
                        <span className="legend-swatch historical"></span>Historical
                    </div>
                    <div className="legend-item">
                        <span className="legend-swatch prediction"></span>Predicted
                    </div>
                </div>
                <div
                    className={`chart-tooltip ${tooltip.visible ? 'visible' : ''}`}
                    style={{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }}
                    dangerouslySetInnerHTML={{ __html: tooltip.content }}
                    role="tooltip"
                />
            </div>
        );
    },
);
