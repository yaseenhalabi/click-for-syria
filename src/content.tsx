import { createRoot } from 'react-dom/client';
import { useState, useEffect } from 'react';
import logoImagePath from './assets/click-for-syria.png';
import syrianFlagPath from './assets/syrian-flag.png';
import gmailLogoPath from './assets/gmail.png';
import instagramLogoPath from './assets/instagram.png';
import linkedinLogoPath from './assets/linkedin.png';
import { blockedSites } from './shared/sites';

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
const syrianFlagImage = getAssetUrl(syrianFlagPath);
const gmailLogo = getAssetUrl(gmailLogoPath);
const instagramLogo = getAssetUrl(instagramLogoPath);
const linkedinLogo = getAssetUrl(linkedinLogoPath);

let unmountCallback: (() => void) | null = null;

// 1. Function to trigger the render logic (extracted for reuse)
const showNotice = (site: string, contacts: any[]) => {
    const existingRoot = document.getElementById('click-for-syria-host');
    if (existingRoot) return;

    const host = document.createElement('div');
    host.id = 'click-for-syria-host';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    const root = createRoot(shadow);

    unmountCallback = () => {
        root.unmount();
        host.remove();
        unmountCallback = null;
    };

    root.render(<Notification site={site} contacts={contacts} onHide={unmountCallback} />);
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

const Notification = ({ site, contacts, onHide }: { site: string; contacts: any[]; onHide: () => void }) => {
    // Log contacts for debugging/verification purposes since they aren't displayed yet
    console.log(`Contacts for ${site}:`, contacts);

    // Get service name from blockedSites, fallback to domain
    const blockedSite = blockedSites.find(s => site.includes(s.domain) || s.domain.includes(site));
    const serviceName = blockedSite?.name || site;

    // State for service image
    const [serviceImageLoaded, setServiceImageLoaded] = useState(false);
    const [serviceImageUrl, setServiceImageUrl] = useState<string | null>(null);

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

    const emailBody = `Dear Team,\n\nI am writing to request that service access be enabled for users in Syria.\n\nFollowing the lifting of the comprehensive trade embargo on Syria announced by the U.S. Treasury in December 2025, all sanctions on Syria have now been lifted by both the United States and the European Union. Syria is no longer listed under OFAC's embargoed countries.\n\nFor reference:\n1- U.S. Treasury announcement: https://ofac.treasury.gov/media/934736/download?inline\n2- OFAC sanctions programs overview: https://ofac.treasury.gov/sanctions-programs-and-country-information\n\nI have also attached relevant supporting documentation from https://unblocksyria.com/resources.\n\nSeveral other companies have already enabled access. As millions of Syrians work to rebuild their country, access to global digital services is increasingly important.\n\nI kindly request a review of the current restriction and would appreciate confirmation on whether Syria can now be onboarded and supported on your platform.\n\nBest regards,\n[Your Name]`;

    const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contacts.map(c => c.email).join(','))}&su=${encodeURIComponent('Request to Enable Service Access in Syria')}&body=${encodeURIComponent(emailBody)}`;
    
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            backgroundColor: '#fff',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            zIndex: 2147483647,
            fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            color: '#333',
            overflow: 'hidden',
            width: '600px',
            maxWidth: '90vw'
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
                    onClick={onHide}
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
                    Show me later
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
                    <a
                        href={gmailLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '14px 24px',
                            backgroundColor: '#fff',
                            border: '1px solid #e0e0e0',
                            borderRadius: '8px 0 0 8px',
                            textDecoration: 'none',
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
                    </a>

                    {/* Generate Post Button */}
                    <button
                        onClick={() => {
                            // TODO: Implement Instagram post generation
                            console.log('Generate Instagram post');
                        }}
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
                        onClick={() => {
                            // TODO: Implement LinkedIn sharing
                            console.log('Send to LinkedIn');
                        }}
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
