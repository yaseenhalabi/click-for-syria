// src/App.tsx
import { useState, useEffect } from 'react';
import logoImagePath from './assets/click-for-syria.png';
import { blockedSites } from './shared/sites';
import { getSiteState, setSiteState, getAllSiteStates } from './shared/storage';
import type { SiteState } from './shared/storage';
import './App.css';

function App() {
  // ── Asset URL helper ─────────────────────────────────────────────────
  const getAssetUrl = (assetPath: string) => {
    if (assetPath.startsWith('data:')) return assetPath;
    return chrome.runtime.getURL(assetPath);
  };
  const logoImage = getAssetUrl(logoImagePath);

  // ── State ────────────────────────────────────────────────────────────
  const [userName, setUserName] = useState('');
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [disabledSites, setDisabledSites] = useState<Record<string, SiteState>>({});

  // Banner state — current active tab site, if permanently disabled
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [activeTabId, setActiveTabId] = useState<number | null>(null);
  const [activeSiteDisabled, setActiveSiteDisabled] = useState(false);

  // ── Load all data on mount ───────────────────────────────────────────
  useEffect(() => {
    // User name and global toggle
    chrome.storage.sync.get(['userName', 'globalEnabled'], (result) => {
      if (typeof result.userName === 'string') setUserName(result.userName);
      setGlobalEnabled(result.globalEnabled !== false);
    });

    // All disabled sites
    getAllSiteStates().then((states) => {
      const disabled: Record<string, SiteState> = {};
      for (const [domain, state] of Object.entries(states)) {
        if (state.permanentlyDisabled) disabled[domain] = state;
      }
      setDisabledSites(disabled);
    });

    // Active tab — for banner
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab?.url || !tab.id) return;

      let hostname: string;
      try {
        hostname = new URL(tab.url).hostname.toLowerCase();
      } catch {
        return;
      }

      const matchedSite = blockedSites.find(
        (s) => hostname === s.domain || hostname.endsWith('.' + s.domain)
      );
      if (!matchedSite) return;

      setActiveDomain(matchedSite.domain);
      setActiveTabId(tab.id);

      getSiteState(matchedSite.domain).then((state) => {
        setActiveSiteDisabled(state?.permanentlyDisabled === true);
      });
    });
  }, []);

  // ── Handlers ─────────────────────────────────────────────────────────
  const handleNameChange = (val: string) => {
    setUserName(val);
    chrome.storage.sync.set({ userName: val });
  };

  const handleToggleGlobal = (enabled: boolean) => {
    setGlobalEnabled(enabled);
    chrome.storage.sync.set({ globalEnabled: enabled });
  };

  const handleReenableBanner = async () => {
    if (!activeDomain) return;
    await setSiteState(activeDomain, {
      permanentlyDisabled: false,
      dismissed: false,
      hideUntil: null,
    });
    setActiveSiteDisabled(false);
    setDisabledSites((prev) => {
      const next = { ...prev };
      delete next[activeDomain];
      return next;
    });
    // Send SHOW_NOTICE to the live tab so overlay appears immediately
    if (activeTabId != null) {
      const site = blockedSites.find((s) => s.domain === activeDomain);
      if (site) {
        chrome.tabs.sendMessage(activeTabId, {
          type: 'SHOW_NOTICE',
          site: activeDomain,
          contacts: site.contacts,
          startMinimized: false,
        });
      }
    }
  };

  const handleReenableFromList = async (domain: string) => {
    await setSiteState(domain, {
      permanentlyDisabled: false,
      dismissed: false,
      hideUntil: null,
    });
    setDisabledSites((prev) => {
      const next = { ...prev };
      delete next[domain];
      return next;
    });
    if (domain === activeDomain) setActiveSiteDisabled(false);
  };

  const disabledDomains = Object.keys(disabledSites);

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <header className="popup-header">
        <img src={logoImage} alt="Click for Syria" />
      </header>

      {/* Banner — only if active site is permanently disabled */}
      {activeSiteDisabled && activeDomain && (
        <div className="popup-banner">
          <div className="popup-banner-text">
            <strong>Disabled on {activeDomain}</strong>
            Click for Syria won't show here
          </div>
          <button className="popup-banner-link" onClick={handleReenableBanner}>
            Re-enable →
          </button>
        </div>
      )}

      {/* Global toggle */}
      <div className="popup-section">
        <div className="toggle-row">
          <span className="toggle-row-label">Extension enabled</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={globalEnabled}
              onChange={(e) => handleToggleGlobal(e.target.checked)}
            />
            <div className="toggle-track" />
            <div className="toggle-thumb" />
          </label>
        </div>
      </div>

      {/* Your Details */}
      <div className="popup-section">
        <div className="popup-section-label">Your Details</div>
        <input
          type="text"
          className="popup-input"
          placeholder="Your name"
          value={userName}
          onChange={(e) => handleNameChange(e.target.value)}
        />
        {userName && <div className="popup-input-saved">✓ Saved</div>}
      </div>

      {/* Disabled sites — only if any */}
      {disabledDomains.length > 0 && (
        <div className="popup-section">
          <div className="popup-section-label">Disabled Sites</div>
          {disabledDomains.map((domain) => (
            <div key={domain} className="disabled-site-row">
              <span className="disabled-site-domain">{domain}</span>
              <button
                className="reenable-btn"
                onClick={() => handleReenableFromList(domain)}
              >
                Re-enable
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="popup-footer">
        <button
          className="popup-footer-link"
          onClick={() => chrome.tabs.create({ url: 'https://unblocksyria.com/en' })}
        >
          unblocksyria.com ↗
        </button>
      </div>
    </div>
  );
}

export default App;
