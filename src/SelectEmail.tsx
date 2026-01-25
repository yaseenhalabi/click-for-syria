import React, { useState, useEffect } from "react";
import "./SelectEmail.css";
// Assets are passed as props to ensure they work in both Content Script and Popup contexts
import type { Contact as SharedContact } from "./shared/sites";

interface SelectEmailProps {
    onBack: () => void;
    contacts?: SharedContact[];
    logoUrl?: string;
    backgroundUrl?: string; // For the wave background
    onSuccess?: () => void;
}

const SelectEmail: React.FC<SelectEmailProps> = ({ onBack, contacts = [], logoUrl, backgroundUrl, onSuccess }) => {
    // We need to map SharedContact to a format we can use, specifically ensuring unique IDs.
    // SharedContact has { name, role?, email?, linkedin? }

    const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());

    // Initialize selection - select all valid emails by default? or just the first one?
    // Let's select all by default as per typical user intent in this app.
    useEffect(() => {
        const allEmails = contacts.filter(c => c.email).map(c => c.email as string);
        setSelectedEmails(new Set(allEmails));
    }, [contacts]);

    const toggleSelection = (email: string) => {
        const newSelection = new Set(selectedEmails);
        if (newSelection.has(email)) {
            newSelection.delete(email);
        } else {
            newSelection.add(email);
        }
        setSelectedEmails(newSelection);
    };

    const handleGenerateDraft = () => {
        if (selectedEmails.size === 0) {
            alert("Please select at least one contact.");
            return;
        }

        const emailList = Array.from(selectedEmails);
        const to = emailList.join(',');
        const subject = "Request to Enable Service Access in Syria";
        const body = `Dear Team,

    I am writing to request that service access be enabled for users in Syria.

Following the lifting of the comprehensive trade embargo on Syria announced by the U.S.Treasury in December 2025, all sanctions on Syria have now been lifted by both the United States and the European Union.Syria is no longer listed under OFAC's embargoed countries.

For reference:
1 - U.S.Treasury announcement: https://ofac.treasury.gov/media/934736/download?inline
2 - OFAC sanctions programs overview: https://ofac.treasury.gov/sanctions-programs-and-country-information

I have also attached relevant supporting documentation from https://unblocksyria.com/resources.

Several other companies have already enabled access.As millions of Syrians work to rebuild their country, access to global digital services is increasingly important.

I kindly request a review of the current restriction and would appreciate confirmation on whether Syria can now be onboarded and supported on your platform.

Best regards,
    [Your Name]`;

        // Use Gmail link for better experience if possible, or mailto
        const gmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        window.open(gmailLink, '_blank');
        onSuccess?.();
    };

    return (
        <div className="select-email-container">
            <header className="header">
                <button onClick={onBack} className="back-button" aria-label="Go back">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="black" // Enforce black color
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
                <h2 className="page-title">Select Emails:</h2>
                <div className="email-list">
                    {contacts.length === 0 ? (
                        <p>No contacts available for this service.</p>
                    ) : (
                        contacts.map((contact, index) => {
                            if (!contact.email) return null;
                            const isSelected = selectedEmails.has(contact.email);
                            // Use email as key if unique, otherwise index fallback
                            const key = contact.email || index.toString();

                            return (
                                <div
                                    key={key}
                                    className={`email-card ${isSelected ? "selected" : ""}`}
                                    onClick={() => toggleSelection(contact.email!)}
                                >
                                    <div className="card-row">
                                        <div className="icon-wrapper">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </div>
                                        <span className="email-text">{contact.email}</span>
                                    </div>
                                    <div className="card-row">
                                        <div className="icon-wrapper">
                                            <svg
                                                width="20"
                                                height="20"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            >
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                <circle cx="12" cy="7" r="4" />
                                            </svg>
                                        </div>
                                        <span className="role-text">{contact.role || contact.name}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            <footer className="footer-action">
                <button
                    className="generate-btn"
                    onClick={handleGenerateDraft}
                    style={{
                        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#007a33' // Default green fallback
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="btn-icon">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 16 16 12 12 8"></polyline>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                    Generate Email Draft
                </button>
            </footer>
        </div>
    );
};

export default SelectEmail;
