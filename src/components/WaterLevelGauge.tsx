import { memo, useMemo, CSSProperties } from 'react';
import { WaterLevelIndex } from '../types';

interface WaterLevelGaugeProps {
    data: WaterLevelIndex;
    // FIX: Use imported CSSProperties type to avoid React namespace error.
    style?: CSSProperties;
}

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0;
    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
};

export const WaterLevelGauge = memo(({ data, style }: WaterLevelGaugeProps) => {
    const normalizedData = useMemo(() => {
        const score = Math.max(0, Math.min(100, data.score));
        let derivedCondition: 'Safe' | 'Moderate' | 'Danger';
        if (score >= 70) derivedCondition = 'Safe';
        else if (score >= 40) derivedCondition = 'Moderate';
        else derivedCondition = 'Danger';
        return { score, condition: derivedCondition };
    }, [data]);

    const angle = (normalizedData.score / 100) * 180;
    const valueArcPath = describeArc(100, 100, 75, 0, angle);
    const needleRotation = -90 + angle;
    
    return (
        <section className="water-level-index card" style={style} role="meter" aria-label={`Current water level is ${normalizedData.condition} with a score of ${normalizedData.score} out of 100.`} aria-valuenow={normalizedData.score} aria-valuemin={0} aria-valuemax={100}>
            <h3 className="section-title water-level-title">Current Water Level Index</h3>
            <div className="gauge-container">
                <svg viewBox="0 0 200 120" className="gauge-svg">
                    {/* Gauge Background */}
                    <path d={describeArc(100, 100, 75, 0, 180)} className="gauge-background-arc" />
                    
                    {/* Value Arc */}
                    <path d={valueArcPath} className={`gauge-value-arc condition-${normalizedData.condition.toLowerCase()}`} />
                    
                    {/* Tick Marks */}
                    <g className="gauge-ticks">
                        {Array.from({ length: 11 }).map((_, i) => {
                            const tickAngle = (i * 18);
                            const start = polarToCartesian(100, 100, 85, tickAngle);
                            const end = polarToCartesian(100, 100, 90, tickAngle);
                            return <line key={i} x1={start.x} y1={start.y} x2={end.x} y2={end.y} />;
                        })}
                    </g>

                    {/* Scale Labels */}
                    <text x="20" y="115" className="gauge-scale-label">Low</text>
                    <text x="180" y="115" className="gauge-scale-label">High</text>
                    
                    {/* Center Readout Background */}
                    <circle cx="100" cy="100" r="60" className="gauge-center-dial" />

                    {/* Needle */}
                    <g className="gauge-needle" style={{ transform: `rotate(${needleRotation}deg)` }}>
                         <path d="M 100 25 L 96 102 L 104 102 Z" className="gauge-needle-path" />
                         <circle cx="100" cy="100" r="5" className="gauge-needle-pivot" />
                    </g>
                </svg>
                <div className="gauge-label-center">
                    <div className="gauge-score">{normalizedData.score}</div>
                    <div className={`gauge-condition condition-${normalizedData.condition.toLowerCase()}`}>{normalizedData.condition}</div>
                </div>
            </div>
        </section>
    );
});