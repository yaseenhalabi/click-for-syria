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
                    href={`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(`Unblock ${site} in Syria`)}&body=${encodeURIComponent(`To whom it may concern,\n\nI am writing to advocate for the unblocking of ${site} in Syria. Access to this platform is essential for education, communication, and development.\n\nPlease consider removing the restrictions on this domain.\n\nSincerely,\n[Your Name]`)}`}
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
