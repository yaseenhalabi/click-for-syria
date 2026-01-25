import React, { useEffect, useState } from "react";
import "./SelectLinkedin.css";
// Assets are passed as props to ensure they work in both Content Script and Popup contexts
import type { Contact as SharedContact } from "./shared/sites";
import OutreachModal from "./OutreachModal";

interface SelectLinkedinProps {
    onBack: () => void;
    contacts?: SharedContact[];
    logoUrl?: string;
    backgroundUrl?: string; // For the footer button background
    userName?: string;
}

const SelectLinkedin: React.FC<SelectLinkedinProps> = ({ onBack, contacts = [], logoUrl, backgroundUrl, userName: userNameProp }) => {
    // Filter contacts that have a LinkedIn URL
    const linkedinContacts = contacts.filter(c => c.linkedin);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userName, setUserName] = useState(userNameProp || "[Your Name]");
    
    useEffect(() => {
        if (typeof chrome !== "undefined" && chrome.storage?.sync) {
            chrome.storage.sync.get(["userName"], (result) => {
                if (typeof result.userName === "string" && result.userName.trim()) {
                    setUserName(result.userName);
                }
            });
        }
    }, []);
    // Update userName if prop changes
    useEffect(() => {
        if (userNameProp) {
            setUserName(userNameProp);
        }
    }, [userNameProp]);

    // Default outreach message
    const outreachMessage = `Dear [Name],

I am writing to inquire about [Company Name]'s plans regarding service access in Syria.

Following the lifting of the comprehensive trade embargo on Syria by the U.S. Treasury in December 2025, and subsequent alignment by the EU, Syria is no longer under broad sanctions programs that necessitate a complete block of digital services.

For reference:
U.S. Treasury: https://ofac.treasury.gov/media/934736/download?inline
OFAC Sanctions Programs: https://ofac.treasury.gov/sanctions-programs-and-country-information

Access to platforms like yours is vital for Syrians rebuilding their lives and economy.

I would appreciate if you could look into enabling access for users in Syria.

Best regards,
${userName}`;

    const handleGenerateOutreach = () => {
        setIsModalOpen(true);
    };

    return (
        <div className="select-linkedin-container">
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

            <h2 className="page-title">Recommended Profiles</h2>

            <div className="profiles-list">
                {linkedinContacts.map((contact, index) => (
                    <a
                        key={index}
                        href={contact.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-card"
                    >
                        {/* Linkedin Logo Icon - Simple SVG placeholder or from assets if we had one passed, using SVG for now to match style */}
                        <svg className="linkedin-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0077B5">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                        <span className="profile-name">{contact.name}</span>
                    </a>
                ))}
                {linkedinContacts.length === 0 && (
                    <div style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                        No LinkedIn profiles available for this site.
                    </div>
                )}
            </div>

            <footer className="footer-action">
                <button
                    className="generate-btn"
                    onClick={handleGenerateOutreach}
                    style={{
                        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundColor: '#007a33' // Default green fallback
                    }}
                >
                    {/* Document/File Icon for "Generate Message" */}
                    <svg className="btn-icon-docs" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M14 2V8H20" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 13H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 17H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10 9H8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Generate Outreach Message
                </button>
            </footer>

            <OutreachModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialText={outreachMessage}
            />
        </div>
    );
};

export default SelectLinkedin;
