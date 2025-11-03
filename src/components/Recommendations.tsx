import { memo } from 'react';
import { Recommendation } from '../types';

interface RecommendationsProps {
    data: Recommendation[];
    style?: React.CSSProperties;
    className?: string;
}

export const Recommendations = memo(({ data, style, className }: RecommendationsProps) => {
    const sectionClasses = ['report-section', 'card', className].filter(Boolean).join(' ');
    
    return (
        <section className={sectionClasses} style={style}>
            <h3 className="section-title">Recommendations</h3>
            <div className="recommendations-grid">
                {data.map((rec, i) => (
                    <div key={i} className="recommendation-card" style={{ animationDelay: `${i * 50}ms` }}>
                        <div className="recommendation-icon">
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                             </svg>
                        </div>
                        <div>
                            <h4 className="recommendation-title">{rec.title}</h4>
                            <p className="recommendation-description">{rec.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
});