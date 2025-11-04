import { memo, CSSProperties } from 'react';
import { Coordinates } from '../types';

interface MapViewProps {
    coordinates: Coordinates;
    locationName: string;
    // FIX: Use imported CSSProperties type to avoid React namespace error.
    style?: CSSProperties;
}

export const MapView = memo(({ coordinates, locationName, style }: MapViewProps) => {
    // Note: This assumes the API_KEY for Gemini also has Google Maps Embed API enabled.
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        return (
             <section className="report-section card" style={style}>
                <h3 className="section-title">Geographic Overview</h3>
                <div className="placeholder-text" style={{padding: '2rem 0'}}>
                    <p>API key is not configured. Map cannot be displayed.</p>
                </div>
            </section>
        );
    }
    
    const mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${coordinates.lat},${coordinates.lon}&zoom=10`;

    return (
        <section className="report-section card" style={style}>
            <h3 className="section-title">Geographic Overview</h3>
            <iframe
                title={`Map showing ${locationName}`}
                width="100%"
                height="350"
                style={{ border: 0, borderRadius: '8px' }}
                loading="lazy"
                allowFullScreen
                src={mapSrc}>
            </iframe>
        </section>
    );
});