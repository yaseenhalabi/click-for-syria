// src/shared/storage.ts

export interface SiteState {
  dismissed: boolean;
  hideUntil: number | null;
  permanentlyDisabled: boolean;
}

// Always use this to build storage keys — never hardcode "site:X" elsewhere
export const siteKey = (domain: string): string => `site:${domain}`;

/**
 * Returns the stored state for a domain, or null if no entry exists (first visit).
 */
export const getSiteState = async (domain: string): Promise<SiteState | null> => {
  const key = siteKey(domain);
  const result = await chrome.storage.local.get(key);
  if (!result[key]) return null;
  return result[key] as SiteState;
};

/**
 * Merges a partial update into the existing state for a domain.
 * If no entry exists, creates one with sensible defaults before merging.
 */
export const setSiteState = async (domain: string, update: Partial<SiteState>): Promise<void> => {
  const key = siteKey(domain);
  const existing = await getSiteState(domain);
  const base: SiteState = existing ?? {
    dismissed: false,
    hideUntil: null,
    permanentlyDisabled: false,
  };
  await chrome.storage.local.set({ [key]: { ...base, ...update } });
};

/**
 * Returns all per-site states as a domain→state map.
 * Strips the "site:" prefix from keys so callers get plain domain strings.
 */
export const getAllSiteStates = async (): Promise<Record<string, SiteState>> => {
  const all = await chrome.storage.local.get(null);
  const result: Record<string, SiteState> = {};
  for (const [key, value] of Object.entries(all)) {
    if (/^site:/.test(key)) {
      const domain = key.replace(/^site:/, '');
      result[domain] = value as SiteState;
    }
  }
  return result;
};
