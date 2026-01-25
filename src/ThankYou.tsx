import React from 'react';
import './ThankYou.css';

interface ThankYouProps {
    onBack: () => void;
    logoUrl?: string;
    flagImageUrl?: string;
}

const ThankYou: React.FC<ThankYouProps> = ({ onBack, logoUrl, flagImageUrl }) => {
    return (
        <div className="thank-you-container">
            <header className="thank-you-header">
                <button onClick={onBack} className="thank-you-back-button" aria-label="Go back">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="black"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M19 12H5" />
                        <path d="M12 19l-7-7 7-7" />
                    </svg>
                    <span>Back</span>
                </button>
                <div className="thank-you-logo-container">
                    {logoUrl && <img src={logoUrl} alt="Click For Syria" className="thank-you-header-logo" />}
                </div>
            </header>

            <main className="thank-you-main">
                {flagImageUrl && (
                    <img
                        src={flagImageUrl}
                        alt="Syrian Flag Waving"
                        className="thank-you-background-image"
                    />
                )}
                <div className="thank-you-content">
                    <h1 className="thank-you-title">Thank you for helping Syria rebuild!</h1>
                </div>
            </main>
        </div>
    );
};

export default ThankYou;
