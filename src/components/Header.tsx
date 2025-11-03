import { memo } from 'react';

export const Header = memo(() => (
    <header>
        <div className="logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C7.03 2 3 6.03 3 11C3 16.05 12 22 12 22C12 22 21 16.05 21 11C21 6.03 16.97 2 12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 12C7 12 8.5 14 12 14C15.5 14 17 12 17 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M7 15C7 15 8.5 17 12 17C15.5 17 17 15 17 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <div className="header-text">
            <h1>Groundwater Predictor</h1>
            <p>Advanced Hydrogeological Forecasting</p>
        </div>
    </header>
));