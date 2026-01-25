import React, { useState, useRef, useEffect } from 'react';
import './OutreachModal.css';

interface OutreachModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialText: string;
}

const OutreachModal: React.FC<OutreachModalProps> = ({ isOpen, onClose, initialText }) => {
    const [text, setText] = useState(initialText);
    const [showCopied, setShowCopied] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);

    // Update text when initialText changes (e.g. reopening)
    useEffect(() => {
        setText(initialText);
    }, [initialText]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers or if navigator.clipboard is blocked
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setShowCopied(true);
                setTimeout(() => setShowCopied(false), 2000);
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        }
    };

    // Handle click outside to close
    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="outreach-modal-overlay" onClick={handleOverlayClick}>
            <div className="outreach-modal-content" ref={modalRef}>
                <textarea
                    className="outreach-text-area"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <button className="copy-btn" onClick={handleCopy} aria-label="Copy to clipboard">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>

                {showCopied && <div className="copied-toast">Copied To Clipboard</div>}
            </div>
        </div>
    );
};

export default OutreachModal;
