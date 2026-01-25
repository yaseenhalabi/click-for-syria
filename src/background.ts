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
        const matchedSite = blockedSites.find(site => hostname.endsWith(site.domain));

        if (matchedSite) {
            chrome.tabs.sendMessage(tabId, {
                type: 'SHOW_NOTICE',
                site: matchedSite.domain,
                contacts: matchedSite.contacts
            });
        }
    }
});
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'CHECK_CURRENT_SITE' && sender.tab?.url) {
        const url = new URL(sender.tab.url);
        const hostname = url.hostname.toLowerCase();
        
        const matchedSite = blockedSites.find(site => 
            hostname === site.domain || hostname.endsWith('.' + site.domain)
        );

        if (matchedSite) {
            sendResponse({ 
                shouldShow: true, 
                site: matchedSite.domain, 
                contacts: matchedSite.contacts 
            });
        }
    }
    return true; // Keep the message channel open for the async response
});
