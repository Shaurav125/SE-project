import { memo } from 'react';

export const Footer = memo(() => (
    <footer>
        <p>This platform provides advanced hydrogeological forecasts for demonstration purposes only.</p>
        <p className="data-source-info">The platform synthesizes vast public datasets, including rainfall patterns, soil composition, and population density, to generate its forecasts.</p>
    </footer>
));