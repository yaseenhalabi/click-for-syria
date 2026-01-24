import { createRoot } from 'react-dom/client';


chrome.runtime.onMessage.addListener((
    message: { type: string; site: string },
    _sender: chrome.runtime.MessageSender,
    _sendResponse: (response?: any) => void
) => {
    if (message.type === 'SHOW_NOTICE') {
        const existingRoot = document.getElementById('click-for-syria-host');
        if (existingRoot) return;

        const host = document.createElement('div');
        host.id = 'click-for-syria-host';
        document.body.appendChild(host);

        const shadow = host.attachShadow({ mode: 'open' });
        const root = createRoot(shadow);

        root.render(<Notification site={message.site} />);
    }
});

const Notification = ({ site }: { site: string }) => {
    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            padding: '16px',
            backgroundColor: '#fff',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 2147483647, // Max z-index
            fontFamily: 'system-ui, sans-serif',
            color: '#333'
        }}>
            Did you know {site} is blocked in Syria?
            <div style={{ marginTop: '12px' }}>
                <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent('Request to Enable Service Access in Syria')}&body=${encodeURIComponent(`Dear Team,\n\nI am writing to request that service access be enabled for users in Syria.\n\nFollowing the lifting of the comprehensive trade embargo on Syria announced by the U.S. Treasury in December 2025, all sanctions on Syria have now been lifted by both the United States and the European Union. Syria is no longer listed under OFAC's embargoed countries.\n\nFor reference:\n1- U.S. Treasury announcement: https://ofac.treasury.gov/media/934736/download?inline\n2- OFAC sanctions programs overview: https://ofac.treasury.gov/sanctions-programs-and-country-information\n\nI have also attached relevant supporting documentation from https://unblocksyria.com/resources.\n\nSeveral other companies have already enabled access. As millions of Syrians work to rebuild their country, access to global digital services is increasingly important.\n\nI kindly request a review of the current restriction and would appreciate confirmation on whether Syria can now be onboarded and supported on your platform.\n\nBest regards,\n[Your Name]`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        backgroundColor: '#ea4335',
                        color: '#fff',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 500
                    }}
                >
                    Go to Gmail
                </a>
            </div>
        </div>
    );
};
