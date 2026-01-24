import { blockedSites } from './shared/sites';

chrome.tabs.onUpdated.addListener((
    tabId,
    changeInfo,
    tab
) => {
    if (changeInfo.status === 'complete' && tab.url) {
        let url: URL;
        try {
            url = new URL(tab.url);
        } catch {
            return;
        }

        const hostname = url.hostname;
        const isBlocked = blockedSites.some(site => hostname.endsWith(site));

        if (isBlocked) {
            chrome.tabs.sendMessage(tabId, { type: 'SHOW_NOTICE', site: hostname });
        }
    }
});
