import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import logoImagePath from './assets/click-for-syria.png';
import miniLogoPath from './assets/click_for_syria_mini_logo.png';
import syrianFlagPath from './assets/syrian-flag.png';
import gmailLogoPath from './assets/gmail.png';
import instagramLogoPath from './assets/instagram.png';
import linkedinLogoPath from './assets/linkedin.png';
import waveBackgroundPath from './assets/wave-haikei.png';
import { blockedSites } from './shared/sites';
import type { Contact } from './shared/sites';
import SelectEmail from './SelectEmail';
import SelectLinkedin from './SelectLinkedin';
import GenerateInstaPost from './GenerateInstaPost';
import ThankYou from './ThankYou';
// @ts-ignore
import selectEmailStyles from './SelectEmail.css?inline';
// @ts-ignore
import selectLinkedinStyles from './SelectLinkedin.css?inline';
// @ts-ignore
import generateInstaStyles from './GenerateInstaPost.css?inline';
// @ts-ignore
import outreachModalStyles from './OutreachModal.css?inline';
// @ts-ignore
import thankYouStyles from './ThankYou.css?inline';

// Helper to get proper URL for assets - handles both inlined data URLs and file paths
const getAssetUrl = (assetPath: string) => {
    // If it's already a data URL (inlined by Vite), use it directly
    if (assetPath.startsWith('data:')) {
        return assetPath;
    }
    // Otherwise, get the extension URL
    return chrome.runtime.getURL(assetPath);
};

// Get the proper extension URL for assets
const logoImage = getAssetUrl(logoImagePath);
const miniLogoImage = getAssetUrl(miniLogoPath);
const syrianFlagImage = getAssetUrl(syrianFlagPath);
const gmailLogo = getAssetUrl(gmailLogoPath);
const instagramLogo = getAssetUrl(instagramLogoPath);
const linkedinLogo = getAssetUrl(linkedinLogoPath);
const waveBackgroundImage = getAssetUrl(waveBackgroundPath);
import flagWavingPath from './assets/syrian-flag-waving.jpg';
import instaBackgroundPath from './assets/insta-background.png';
const flagWavingImage = getAssetUrl(flagWavingPath);
const instaBackgroundImage = getAssetUrl(instaBackgroundPath);


// 1. Function to trigger the render logic (extracted for reuse)
const showNotice = (site: string, contacts: any[]) => {
    const existingRoot = document.getElementById('click-for-syria-host');
    if (existingRoot) return;

    const host = document.createElement('div');
    host.id = 'click-for-syria-host';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    const root = createRoot(shadow);

    // Inject styles for SelectEmail
    const styleSheet = document.createElement("style");
    styleSheet.innerText = selectEmailStyles;
    shadow.appendChild(styleSheet);

    // Inject styles for SelectLinkedin
    const linkedinStyleSheet = document.createElement("style");
    linkedinStyleSheet.innerText = selectLinkedinStyles;
    shadow.appendChild(linkedinStyleSheet);

    // Inject styles for GenerateInstaPost
    const instaStyleSheet = document.createElement("style");
    instaStyleSheet.innerText = generateInstaStyles;
    shadow.appendChild(instaStyleSheet);

    // Inject global box-sizing reset for Shadow DOM
    const resetStyle = document.createElement("style");
    resetStyle.innerText = `
        * { box-sizing: border-box; }
    `;
    shadow.appendChild(resetStyle);

    // Inject styles for OutreachModal
    const modalStyleSheet = document.createElement("style");
    modalStyleSheet.innerText = outreachModalStyles;
    shadow.appendChild(modalStyleSheet);

    // Inject styles for ThankYou
    const thankYouStyleSheet = document.createElement("style");
    thankYouStyleSheet.innerText = thankYouStyles;
    shadow.appendChild(thankYouStyleSheet);

    /*
    const unmount = () => {
        root.unmount();
        host.remove();
    };
    */
    root.render(<InjectedApp site={site} contacts={contacts} />);
};

// 2. Listen for "Push" notices from background (for SPA navigation)
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'SHOW_NOTICE') {
        showNotice(message.site, message.contacts);
    }
});

// 3. The "Pull" fix: Ask the background script if we should show something RIGHT NOW
// This fixes the landing page issue because it runs as soon as the script loads.
chrome.runtime.sendMessage({ type: 'CHECK_CURRENT_SITE' }, (response) => {
    if (response && response.shouldShow) {
        showNotice(response.site, response.contacts);
    }
});

const InjectedApp = ({ site, contacts }: { site: string; contacts: Contact[] }) => {
    const [currentView, setCurrentView] = useState<'home' | 'email' | 'linkedin' | 'insta' | 'thankyou'>('home');
    const [userName, setUserName] = useState("[Your Name]");
    useEffect(() => {
        chrome.storage.sync.get(['userName'], (result) => {
            if (typeof result.userName === 'string' && result.userName.trim()) {
                setUserName(result.userName);
            }
        });
    }, []);

    // Get service name from blockedSites, fallback to domain
    const blockedSite = blockedSites.find(s => site.includes(s.domain) || s.domain.includes(site));
    const serviceName = blockedSite?.name || site;

    // State for service image
    const [serviceImageLoaded, setServiceImageLoaded] = useState(false);
    const [serviceImageUrl, setServiceImageUrl] = useState<string | null>(null);

    const [isMinimized, setIsMinimized] = useState(() => {
        return sessionStorage.getItem('click-for-syria-minimized') === 'true';
    });
    const [isDismissed, setIsDismissed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);


    const handleHide = () => {
        setIsMinimized(true);
        sessionStorage.setItem('click-for-syria-minimized', 'true');
    };

    const handleRestore = () => {
        setIsMinimized(false);
        sessionStorage.setItem('click-for-syria-minimized', 'false');
    };

    // Try to load the service image dynamically
    useEffect(() => {
        if (blockedSite?.name) {
            const imageName = blockedSite.name.replace(/\s+/g, '-') + '.jpg';
            const imageUrl = chrome.runtime.getURL(`assets/${imageName}`);

            // Test if image exists by trying to load it
            const img = new Image();
            img.onload = () => {
                setServiceImageUrl(imageUrl);
                setServiceImageLoaded(true);
            };
            img.onerror = () => {
                setServiceImageLoaded(false);
                setServiceImageUrl(null);
            };
            img.src = imageUrl;
        }
    }, [blockedSite?.name]);

    if (isDismissed) {
        return null;
    }


    if (isMinimized) {
        return (
            <div
                onClick={handleRestore}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    backgroundColor: '#fff',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    zIndex: 2147483647,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease',
                    border: '2px solid white', // Ensures white circle appearance
                    transform: isHovered ? 'scale(1.1)' : 'scale(1)'
                }}
            >
                {/* The 'x' button */}
                {isHovered && (
                    <div
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent restoring when clicking 'x'
                            setIsDismissed(true);
                        }}
                        style={{
                            position: 'absolute',
                            top: '-5px',
                            left: '-5px',
                            width: '20px',
                            height: '20px',
                            backgroundColor: '#e0e0e0', // Light grey circle
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#666', // Dark grey 'x'
                            fontSize: '12px',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            zIndex: 10
                        }}
                    >
                        ✕
                    </div>
                )}
                <img
                    src={miniLogoImage}
                    alt="Restored"
                    style={{
                        width: '70%',
                        height: '70%',
                        objectFit: 'contain',
                        borderRadius: '0'
                    }}
                />
            </div>
        );
    }

    if (currentView === 'email') {
        return (
            <div style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 2147483647,
                backgroundColor: '#fff', // Ensure background for visibility
                borderRadius: '24px', // Increased from 16px
                boxShadow: '0 12px 48px rgba(0,0,0,0.25)', // Increased shadow
                // SelectEmail container has max-width 600px handled by CSS, but we need a wrapper to position it fixed like the notification
                width: '600px',
                maxWidth: 'calc(100vw - 60px)', // Ensure it doesn't touch edges on small screens
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)', // Subtle border
                boxSizing: 'border-box'
            }}>
                <SelectEmail
                    onBack={() => setCurrentView('home')}
                    contacts={contacts}
                    logoUrl={logoImage}
                    backgroundUrl={waveBackgroundImage}
                    onSuccess={() => setCurrentView('thankyou')}
                    userName={userName}
                />
            </div>
        );
    }

    if (currentView === 'linkedin') {
        return (
            <div style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 2147483647,
                backgroundColor: '#fff', // Ensure background for visibility
                borderRadius: '24px', // Increased from 16px
                boxShadow: '0 12px 48px rgba(0,0,0,0.25)', // Increased shadow
                // SelectLinkedin container has max-width 600px handled by CSS, but we need a wrapper to position it fixed like the notification
                width: '600px',
                maxWidth: 'calc(100vw - 60px)', // Ensure it doesn't touch edges on small screens
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)', // Subtle border
                boxSizing: 'border-box'
            }}>
                <SelectLinkedin
                    onBack={() => setCurrentView('home')}
                    contacts={contacts}
                    logoUrl={logoImage}
                    backgroundUrl={waveBackgroundImage}
                />
            </div>
        );
    }

    if (currentView === 'insta') {
        return (
            <div style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 2147483647,
                backgroundColor: '#fff',
                borderRadius: '24px',
                boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
                width: '600px',
                maxWidth: 'calc(100vw - 60px)',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)',
                boxSizing: 'border-box'
            }}>
                <GenerateInstaPost
                    onBack={() => setCurrentView('home')}
                    serviceName={serviceName}
                    serviceLogoUrl={serviceImageUrl || undefined}
                    instaBackgroundUrl={instaBackgroundImage}
                    logoUrl={logoImage}
                    backgroundUrl={waveBackgroundImage}
                />
            </div>
        );
    }

    if (currentView === 'thankyou') {
        return (
            <div style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 2147483647,
                backgroundColor: '#fff',
                borderRadius: '24px',
                boxShadow: '0 12px 48px rgba(0,0,0,0.25)',
                width: '600px',
                maxWidth: 'calc(100vw - 60px)',
                overflow: 'hidden',
                border: '1px solid rgba(0,0,0,0.05)',
                boxSizing: 'border-box'
            }}>
                <ThankYou
                    onBack={() => setCurrentView('email')}
                    logoUrl={logoImage}
                    flagImageUrl={flagWavingImage}
                />
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            backgroundColor: '#fff',
            border: '1px solid rgba(0,0,0,0.05)', // Subtle border instead of #e0e0e0
            borderRadius: '24px', // Increased from 12px
            boxShadow: '0 12px 48px rgba(0,0,0,0.25)', // Stronger shadow
            zIndex: 2147483647,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#333',
            overflow: 'hidden',
            width: '600px',
            maxWidth: 'calc(100vw - 60px)', // Ensure 30px margin on both sides if screen is small
            boxSizing: 'border-box'
        }}>
            {/* Top Bar */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '16px 24px',
                borderBottom: '1px solid #eee',
                backgroundColor: '#fafafa'
            }}>
                {/* Show me later - Left side */}
                <span
                    onClick={handleHide}
                    style={{
                        position: 'absolute',
                        left: '24px',
                        fontSize: '14px',
                        color: '#666',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        transition: 'color 0.2s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#333')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#666')}
                >
                    Hide
                </span>

                {/* Logo - Center */}
                <img
                    src={logoImage}
                    alt="Click for Syria"
                    style={{
                        height: '28px',
                        width: 'auto'
                    }}
                />
            </div>

            {/* Main Content */}
            <div style={{
                padding: '24px 32px',
                textAlign: 'center'
            }}>
                {/* Main Heading */}
                <h1 style={{
                    fontSize: '32px',
                    fontWeight: 400,
                    margin: '0 0 32px 0',
                    lineHeight: 1.3,
                    color: '#1a1a1a'
                }}>
                    Did you know that <strong> {serviceName} </strong> is{' '}
                    <span style={{ color: '#ce1126', fontWeight: 700 }}>blocked</span>{' '}
                    for Syrians?
                </h1>

                {/* Service Logo and Syrian Flag Images */}
                <div style={{
                    marginBottom: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                }}>
                    {serviceImageLoaded && serviceImageUrl && (
                        <img
                            src={serviceImageUrl}
                            alt={serviceName}
                            style={{
                                width: '100px',
                                height: 'auto',
                                borderRadius: '4px'
                            }}
                        />
                    )}
                    <img
                        src={syrianFlagImage}
                        alt="Syrian Flag"
                        style={{
                            width: '120px',
                            height: 'auto',
                            borderRadius: '4px'
                        }}
                    />
                </div>

                {/* Subheading */}
                <h2 style={{
                    fontSize: '20px',
                    fontWeight: 700,
                    margin: '0 0 24px 0',
                    color: '#1a1a1a'
                }}>
                    You can help unblock it!
                </h2>

                {/* Action Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '0',
                    justifyContent: 'center'
                }}>
                    {/* Send Email Button */}
                    <button
                        onClick={() => setCurrentView('email')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '14px 24px',
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px 0 0 8px',
                            color: '#1a1a1a',
                            fontSize: '15px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fff';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                        }}
                    >
                        <img src={gmailLogo} alt="Gmail" style={{ width: '20px', height: '20px' }} />
                        Send Email
                    </button>

                    {/* Generate Post Button */}
                    <button
                        onClick={() => setCurrentView('insta')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '14px 24px',
                            backgroundColor: '#fff',
                            borderTop: '1px solid #e0e0e0',
                            borderBottom: '1px solid #e0e0e0',
                            borderLeft: 'none',
                            borderRight: 'none',
                            borderRadius: '0',
                            color: '#1a1a1a',
                            fontSize: '15px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fff';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                        }}
                    >
                        <img src={instagramLogo} alt="Instagram" style={{ width: '20px', height: '20px' }} />
                        Generate Post
                    </button>

                    {/* Send Linkedin Button */}
                    <button
                        onClick={() => setCurrentView('linkedin')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '14px 24px',
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '0 8px 8px 0',
                            color: '#1a1a1a',
                            fontSize: '15px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f5f5f5';
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.12)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#fff';
                            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)';
                        }}
                    >
                        <img src={linkedinLogo} alt="LinkedIn" style={{ width: '20px', height: '20px' }} />
                        Send Linkedin
                    </button>
                </div>
            </div>
        </div>
    );
};
