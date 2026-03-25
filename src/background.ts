// src/background.ts
import { blockedSites } from './shared/sites';
import { getSiteState } from './shared/storage';

interface ShowResult {
  show: boolean;
  startMinimized: boolean;
}

/**
 * Determines whether to show the overlay for a given domain, and whether
 * to start it minimized. Reads chrome.storage.sync (globalEnabled) and
 * chrome.storage.local (per-site state).
 */
async function shouldShowForDomain(domain: string): Promise<ShowResult> {
  // 1. Check global kill switch (strict equality — undefined !== false so fresh installs pass)
  const syncResult = await chrome.storage.sync.get('globalEnabled');
  if (syncResult.globalEnabled === false) {
    return { show: false, startMinimized: false };
  }

  // 2–4. Check per-site state
  const state = await getSiteState(domain);

  if (state?.permanentlyDisabled === true) {
    return { show: false, startMinimized: false };
  }

  if (state?.hideUntil != null && Date.now() < state.hideUntil) {
    return { show: true, startMinimized: true };
  }

  if (state?.dismissed === true) {
    return { show: true, startMinimized: true };
  }

  // 5. First visit or expired snooze — show maximized
  return { show: true, startMinimized: false };
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    let url: URL;
    try {
      url = new URL(tab.url);
    } catch {
      return;
    }

    const hostname = url.hostname.toLowerCase();
    const matchedSite = blockedSites.find(
      site => hostname === site.domain || hostname.endsWith('.' + site.domain)
    );

    if (!matchedSite) return;

    const { show, startMinimized } = await shouldShowForDomain(matchedSite.domain);
    if (!show) return;

    chrome.tabs.sendMessage(tabId, {
      type: 'SHOW_NOTICE',
      site: matchedSite.domain,
      contacts: matchedSite.contacts,
      startMinimized,
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CHECK_CURRENT_SITE' && sender.tab?.url) {
    const url = new URL(sender.tab.url);
    const hostname = url.hostname.toLowerCase();

    const matchedSite = blockedSites.find(
      site => hostname === site.domain || hostname.endsWith('.' + site.domain)
    );

    if (!matchedSite) {
      sendResponse({ shouldShow: false });
      return true;
    }

    // Async — must return true to keep message channel open
    shouldShowForDomain(matchedSite.domain).then(({ show, startMinimized }) => {
      sendResponse({
        shouldShow: show,
        site: matchedSite.domain,
        contacts: matchedSite.contacts,
        startMinimized,
      });
    });

    return true; // Keep channel open for async response
  }
});
