import React, { useRef, useCallback } from "react";
import * as htmlToImage from "html-to-image";
import "./GenerateInstaPost.css";

interface GenerateInstaPostProps {
    onBack: () => void;
    serviceName: string;
    serviceLogoUrl?: string;
    instaBackgroundUrl?: string;
    logoUrl?: string; // App logo for header
    backgroundUrl?: string; // For the wave background on button
}

const GenerateInstaPost: React.FC<GenerateInstaPostProps> = ({
    onBack,
    serviceName,
    serviceLogoUrl,
    instaBackgroundUrl,
    logoUrl,
    backgroundUrl,
}) => {
    const domEl = useRef<HTMLDivElement>(null);

    const downloadImage = useCallback(() => {
        if (domEl.current) {
            htmlToImage
                .toPng(domEl.current, {
                    width: 1080,
                    height: 1350,
                    style: {
                        transform: "scale(1)",
                        transformOrigin: "top left",
                    },
                })
                .then((dataUrl: string) => {
                    const link = document.createElement("a");
                    link.download = `UnblockSyria-${serviceName}.png`;
                    link.href = dataUrl;
                    link.click();
                })
                .catch((err: Error) => {
                    console.error("Failed to generate image", err);
                });
        }
    }, [serviceName]);

    const previewScale = 0.35;

    return (
        <div className="generate-insta-container">
            <header className="header">
                <button onClick={onBack} className="back-button" aria-label="Go back">
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
                <div className="logo-container">
                    {logoUrl && <img src={logoUrl} alt="Click For Syria" className="header-logo" />}
                </div>
            </header>

            <main className="main-content">
                <h2 className="page-title">Post this on your Instagram Story!</h2>

                <div className="preview-view-container">
                    <div style={{
                        width: `${1080 * previewScale}px`,
                        height: `${1350 * previewScale}px`,
                        overflow: "hidden",
                        position: "relative"
                    }}>
                        <div
                            className="insta-export-node"
                            ref={domEl}
                            style={{
                                width: "1080px",
                                height: "1350px",
                                backgroundImage: instaBackgroundUrl ? `url(${instaBackgroundUrl})` : "none",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                textAlign: "center",
                                color: "#333",
                                transform: `scale(${previewScale})`,
                                transformOrigin: "top left",
                            }}
                        >
                            {serviceLogoUrl && (
                                <img
                                    src={serviceLogoUrl}
                                    alt={serviceName}
                                    style={{
                                        marginBottom: "50px",
                                        width: "300px",
                                        opacity: 0.9,
                                        zIndex: 10,
                                    }}
                                />
                            )}

                            <div
                                style={{
                                    backgroundColor: "rgba(255, 255, 255, 0.85)",
                                    padding: "50px",
                                    borderRadius: "20px",
                                    width: "80%",
                                    maxWidth: "800px",
                                }}
                            >
                                <h1
                                    style={{
                                        color: "#207814",
                                        fontSize: "80px",
                                        margin: "0 0 20px 0",
                                        fontFamily: "Inter, sans-serif",
                                        fontWeight: 700,
                                    }}
                                >
                                    {serviceName}
                                </h1>
                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "35px", margin: "10px 0" }}>
                                    is currently banned in Syria
                                </p>
                                <p style={{ fontFamily: "Inter, sans-serif", fontSize: "28px", color: "#666", margin: "10px 0" }}>
                                    Share this to spread the word
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="footer-action">
                <button
                    className="generate-btn"
                    onClick={downloadImage}
                    style={{
                        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#007a33' // Default green fallback
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download Story Image
                </button>
            </footer>
        </div>
    );
};

export default GenerateInstaPost;
