# Development Log — Click for Syria

A living document tracking every significant decision, trade-off, and architectural choice made during the development of this project. The goal is to capture the *why* behind everything so I can go back and remember how and why I built each part — useful for walking through the project, explaining my process, and understanding the reasoning behind specific choices.

---

## Table of Contents

1. [Project Origin & Purpose](#1-project-origin--purpose)
2. [Tech Stack Decisions](#2-tech-stack-decisions)
3. [Architecture Decisions](#3-architecture-decisions)
4. [Feature Decisions](#4-feature-decisions)
5. [Data & Content Decisions](#5-data--content-decisions)
6. [Build & Tooling Decisions](#6-build--tooling-decisions)
7. [Known Trade-offs & Deferred Work](#7-known-trade-offs--deferred-work)
8. [Version History](#8-version-history)
9. [Future Considerations](#9-future-considerations)

---

## 1. Project Origin & Purpose

**Date:** January 2026

**Context:** In December 2025, the US Treasury lifted sanctions on Syria following a change in government. The EU aligned shortly after. Despite this, major tech platforms — OpenAI, Figma, PayPal, Slack, Udemy, GitLab, Coursera, Apple App Store, and others — continued to block access for users in Syria. Not because of new policy, but because of outdated compliance rules, inertia, and a lack of prioritization.

**The Problem:** Syrian citizens rebuilding their country couldn't access critical tools for education, work, communication, and finance. The policy barrier was gone, but the technical and corporate barriers remained.

**The Solution:** A browser extension that intercepts visits to these blocked platforms and gives users a one-click path to contact decision-makers at those companies via email, LinkedIn, and social media.

**Why an extension specifically?** The extension model puts the action exactly where the friction is — at the moment a user hits a blocked service. No separate app to open, no context switching. The frustration of being blocked becomes the trigger for advocacy.

**Companion site:** [unblocksyria.com](https://unblocksyria.com) — broader resources and awareness beyond the extension.

---

## 2. Tech Stack Decisions

### React 19 + TypeScript

**Decision:** Use React with TypeScript for all UI components.

**Why:** The UI has multiple views with shared state (home → email → linkedin → insta → thankyou), which maps naturally to React's component model. TypeScript was important specifically because Chrome's extension APIs are easy to mistype — the three-context architecture (popup, background, content script) involves message passing between isolated environments, and typed message interfaces caught several bugs at compile time that would have been painful to debug at runtime. React 19 was current and the team had existing familiarity.

**Trade-offs:**
- React adds ~130KB to the extension bundle. Vanilla JS would be lighter. We accepted this because dev speed and maintainability mattered more than bundle size for an advocacy tool where iteration speed was critical.
- React inside a Shadow DOM requires a non-standard CSS setup — styles can't be loaded the normal way. This added setup complexity (covered in Architecture section).

### Vite

**Decision:** Use Vite as the build tool.

**Why:** Fast HMR during development, native ESM support, and the CRXJS plugin (which handles the Chrome extension build pipeline) is Vite-native. Without HMR, every code change requires a full rebuild, manually reloading the extension in `chrome://extensions`, and reloading the test page — a slow loop. CRXJS + Vite makes the extension update in place on save.

**Trade-offs:** Vite 7 (latest at build time) had some rough edges with CRXJS. A few config details required careful plugin ordering.

### No External State Library

**Decision:** React's built-in `useState`/`useEffect` hooks plus `chrome.storage.sync` for persistence — no Redux, no Zustand.

**Why:** The state surface is small: current view, user name, minimized state, dismissed state, and which site is active. Adding a state library here would be the wrong level of abstraction. `chrome.storage.sync` handles the only truly persistent state (the user's name), and it syncs across Chrome profiles and devices automatically.

**Trade-offs:** If the app grows — more views, more cross-component state — prop-drilling will become a problem and something like Zustand would be worth adding at that point.

---

## 3. Architecture Decisions

### Chrome Extension Manifest V3 (MV3)

**Decision:** Build on MV3, not the legacy MV2.

**Why:** MV2 is deprecated. Chrome began phasing it out in 2024, and extensions can no longer be submitted to the Chrome Web Store using MV2. MV3 is the correct long-term foundation.

**What this changed about the architecture:** MV3 replaces persistent background pages with service workers. Service workers are stateless and can be terminated at any time by the browser. This meant I couldn't rely on the background script holding in-memory state between events — everything has to be derived fresh from the current tab URL when needed. This directly shaped the Push/Pull messaging pattern described below.

### Shadow DOM for the Overlay

**Decision:** Inject the overlay React app into a Shadow DOM root, not directly into the page's DOM.

**Why:** Host websites have their own CSS — broad selectors, global resets, custom font stacks. Without Shadow DOM isolation, the extension overlay inherits those styles and breaks unpredictably on every site it runs on. ChatGPT looks different from Figma which looks different from PayPal. Shadow DOM creates a hard boundary: styles inside don't leak out, and styles outside don't leak in.

**How it's structured:**
```
document.body
  └── #click-for-syria-host  (element I create)
       └── shadowRoot         (Shadow DOM boundary)
            ├── <style>        (all CSS injected inline here)
            └── <div id="root"> (React mounts here)
```

**The CSS problem this created:** Normally, CSS imported in a React component gets injected into `<head>`. That doesn't work inside a Shadow DOM — `<head>` is outside the boundary. The solution was Vite's `?inline` import modifier, which returns a CSS file as a plain string instead of auto-injecting it:

```typescript
import emailStyles from './SelectEmail.css?inline'
// emailStyles is now a string — inject it manually
const style = document.createElement('style')
style.textContent = emailStyles
shadowRoot.appendChild(style)
```

Every component's CSS is imported this way and injected at mount time.

**Trade-offs:** More setup than a standard React app, but the result is an overlay that works identically on every blocked site regardless of the host page's styles. Worth it.

### Push/Pull Messaging Pattern (Background ↔ Content Script)

**Decision:** Use a two-way communication pattern between the background service worker and the content script, rather than relying solely on the background pushing messages.

**Why this was needed:** There are two distinct timing scenarios when a user visits a blocked site, and each one creates a different failure mode:

1. **Normal navigation** — the page loads fresh. The background fires `chrome.tabs.onUpdated`. It detects the domain and sends `SHOW_NOTICE` to the content script. But the content script might not have registered its listener yet — the message arrives and is lost.

2. **SPA navigation** — sites like ChatGPT are Single Page Applications. The user navigates from `/auth` to `/chat` without a full page reload. The background fires `onUpdated`, but the content script was already loaded on the initial page load and misses the event.

**The solution:**
- **Push:** Background sends `SHOW_NOTICE` to the content script when it detects a matching URL on tab update. Handles normal navigation when timing works out.
- **Pull:** Content script sends `CHECK_CURRENT_SITE` to the background immediately on its own initialization. The background checks the active tab's URL and responds. This handles both the race condition and SPA navigation.

Both mechanisms together mean the overlay shows reliably regardless of how the user arrived at the page.

**Trade-offs:** More code in both `background.ts` and `content.tsx`, and requires careful deduplication to avoid showing the overlay twice. But it's the only reliable solution given how extension messaging and SPA navigation interact.

### Dynamic Manifest Generation

**Decision:** Generate `manifest.json` at build time from `manifest.config.ts`, which imports `sites.ts`.

**Why:** The Chrome manifest needs a static list of URL match patterns declaring where to inject the content script. Without automation, every time a new company is added to `sites.ts`, you'd also have to manually update the manifest's `matches` array. That's two places to keep in sync — a maintenance burden that will inevitably cause bugs (content script not injecting on a site that's in the data, or injecting on a site that's been removed).

CRXJS accepts a TypeScript manifest config evaluated at build time, so the blocked sites array can be imported and the patterns generated automatically:

```typescript
// manifest.config.ts
import { blockedSites } from './src/shared/sites'
matches: blockedSites.map(s => `*://*.${s.domain}/*`)
// → ["*://*.chatgpt.com/*", "*://*.figma.com/*", ...]
```

Now `sites.ts` is the only place to touch when adding a new platform.

**Trade-offs:** Requires a full rebuild whenever `sites.ts` changes, since the manifest is generated at build time. Acceptable for this use case. Also creates a dependency on CRXJS — if we ever migrate away from it, the manifest generation logic needs to be rebuilt.

### Asset Loading in Content Scripts

**Decision:** Use `chrome.runtime.getURL()` for all image assets referenced in the content script.

**Why:** Content scripts run in the context of the host page. A path like `/assets/openai.jpg` resolves relative to the *host website*, not the extension bundle — so it breaks. `chrome.runtime.getURL('assets/openai.jpg')` returns the correct `chrome-extension://[id]/assets/openai.jpg` URL.

**Requirement:** Assets loaded this way must be listed as `web_accessible_resources` in the manifest, otherwise Chrome blocks them. CRXJS handles this automatically for assets in `public/`.

---

## 4. Feature Decisions

### Three Outreach Channels (Email, LinkedIn, Instagram)

**Decision:** Support three distinct outreach flows rather than just one.

**Why:** Different users are comfortable with different platforms. More importantly, reaching decision-makers through multiple vectors increases the chance that someone responds. Email is direct and formal. LinkedIn reaches specific people (policy, legal, leadership) in a professional context. Instagram amplifies awareness to a broader audience, beyond just the companies themselves.

**Trade-offs:** Three flows means three components to maintain. The LinkedIn flow is also the weakest UX — users have to manually open LinkedIn, find the contact, and paste the message — because LinkedIn's API doesn't allow third-party DMs. It's more of a "prompt + copy text" tool than true automation. Worth keeping for the channel value, but worth being honest about the friction.

### Pre-filled, Editable Outreach Templates

**Decision:** Pre-write the email subject, body, and LinkedIn message — but make them editable before sending.

**Why:** Zero friction for users who want to act immediately. The templates reference the December 2025 OFAC sanctions lift by name and link to unblocksyria.com, which grounds the ask in specific policy reality and makes it harder for recipients to dismiss. Users who want to personalize further still can.

**Trade-offs:** Template text goes stale. If the political situation changes or specific contacts move roles, the templates need updating. Pre-filled emails can also feel impersonal to recipients — but the tradeoff is that significantly more people will send a templated message than write one from scratch.

### Gmail Compose Link (Not `mailto:`)

**Decision:** Open Gmail using the `https://mail.google.com/mail/?view=cm&to=...&su=...&body=...` URL scheme instead of `mailto:`.

**Why:** `mailto:` opens whatever the system default email client is — often Apple Mail on macOS, or nothing if no client is configured. The Gmail URL opens Gmail directly in a new tab with everything pre-filled. Given the likely audience for this extension, optimizing for Gmail is the right default.

**Trade-offs:** Users without Gmail accounts land on a Gmail sign-in page. A future improvement could detect the user's email provider and adapt accordingly.

### Instagram Post as a Downloadable PNG

**Decision:** Generate a 1080×1920 Instagram Story image from a DOM element using `html-to-image`, and offer it as a PNG download.

**Why:** Instagram's API doesn't allow third-party apps to post directly. The only viable path is generating the image and having the user upload it themselves. `html-to-image` lets the post template be designed in React/CSS (familiar tooling, easy to iterate visually) and exported as a pixel-accurate PNG — much simpler than building the same thing with the canvas API.

**Trade-offs:** Extra friction for the user (download → open Instagram → post). The image is also a static template with no in-image text customization. `html-to-image` can be slow on complex DOM trees and has known edge cases with certain CSS properties — the template was kept simple specifically to avoid those.

### Thank You Screen

**Decision:** Show a success screen after the email flow completes.

**Why:** Gives clear confirmation that the action was taken, and provides a moment of emotional closure — the user did something meaningful. The Syrian flag in the background reinforces the human element of the cause.

**Why only after email:** The Thank You screen only follows the email flow because that's the only flow where we can infer the action was attempted (the Gmail tab opened). LinkedIn and Instagram involve external steps we can't detect. Adding a manual "I sent it" confirmation button to those flows would solve this — deferred to v1.1.

### User Name Input (Popup)

**Decision:** Let users enter their name in the extension popup, stored via `chrome.storage.sync`.

**Why:** Emails and LinkedIn messages are personalized with the sender's name. `chrome.storage.sync` syncs across Chrome profiles and devices automatically, so it's set once and available everywhere.

**Trade-offs:** It's optional — templates fall back gracefully if no name is entered. That's the right default: don't block action on configuration.

---

## 5. Data & Content Decisions

### `src/shared/sites.ts` as Single Source of Truth

**Decision:** All blocked site data — domains, display names, contacts — lives in one TypeScript file imported by both the manifest config and the UI.

**Why:** Avoids the sync problem between config and runtime data. Typed with TypeScript interfaces (`BlockedSite`, `Contact`) so mistakes are caught at build time. Adding a new company is one entry in one file — the manifest patterns, content script matching, and all UI derive from it automatically.

**Trade-offs:** Requires a rebuild to update data. If contact information changes (someone leaves a company, an email bounces), the extension needs a new release. The right fix is to fetch contact data from a hosted JSON endpoint at unblocksyria.com, allowing updates without an extension release. This was deferred because it adds backend complexity and v1.0.0 was built as a one-day MVP.

### Companies Covered in v1.0.0

Chosen based on: high user impact, confirmed blocking of Syrian IPs, and identifiable policy/compliance contacts.

| Company | Why Included |
|---------|-------------|
| OpenAI / ChatGPT | High-impact AI tools, confirmed blocked |
| Figma | Critical design tool for professionals |
| PayPal | Essential for financial access |
| Anthropic / Claude | AI tools, same category as OpenAI |
| Gemini (Google) | AI tools, policy contacts at Google available |
| Slack | Business communication |
| Udemy / Coursera | Education platforms |
| Apple App Store | Blocks entire iOS ecosystem |
| GitLab | Dev tooling, source control |

**Left out (and why):**
- Google Search / YouTube: Not clearly blocked, more nuanced situation
- AWS / Azure / GCP: Partial blocks, harder to identify actionable contacts
- GitHub: Reported to have re-enabled access after an earlier sanctions lift — needs verification before adding

### Contact Selection

All contacts are policy, legal, trust & safety, or executive-level roles — people with the authority or influence to make the policy change, not generic support addresses. Contacts were researched manually for v1.0.0. No verification process exists yet; this is a known gap.

---

## 6. Build & Tooling Decisions

### CRXJS Vite Plugin

**Decision:** Use `@crxjs/vite-plugin` to handle the Chrome extension build pipeline.

**Why:** Generates `manifest.json` from a TypeScript config, handles content script / background worker / popup bundling in a single Vite build, provides HMR for extension development, and automatically manages `web_accessible_resources` declarations. It's the most complete solution in the Vite ecosystem for this.

**Trade-offs:** CRXJS is community-maintained, not an official Google product. There have been periods of slower maintenance. Also locks the project into Vite as the build tool — which is fine, but worth noting.

### ESLint

**Decision:** Flat ESLint config format (`eslint.config.js`) with typescript-eslint and the react-hooks plugin.

**Why:** The react-hooks plugin catches missing `useEffect` dependencies at lint time, which is a common source of subtle bugs. Flat config is the current ESLint standard (legacy `.eslintrc` is deprecated).

---

## 7. Known Trade-offs & Deferred Work

Things knowingly not done in v1.0.0 and why:

| Issue | Why Deferred | Future Path |
|-------|-------------|-------------|
| Contact data goes stale | No backend needed for v1.0 | Fetch from hosted JSON at unblocksyria.com |
| LinkedIn/Instagram require manual steps | Platform API restrictions | No good alternative without native app |
| Only email has a ThankYou screen | Can't detect LinkedIn/Instagram completion | Add "I sent it" confirmation buttons |
| Chrome only | Ship fast, largest market share | Port to Firefox with webextension-polyfill |
| papaparse included but unused | Planned for CSV contact import | Use it or remove it in v1.1 |
| No analytics | Privacy-first, keep scope minimal | Anonymized counters for impact tracking |
| Static outreach templates | No time to build template editing | Let users preview and edit before sending |

---

## 8. Version History

### v1.0.0 — January 25, 2026

Built in a single day.

**What shipped:**
- Shadow DOM overlay injection on 12 blocked platforms
- Email outreach with pre-filled Gmail compose link
- LinkedIn outreach with contact list + copy-to-clipboard message
- Instagram story image generator (1080×1920 PNG download)
- Thank You screen after email flow
- User name input (popup) via `chrome.storage.sync`
- Dynamic manifest generation from `sites.ts`
- Packaged as `click-for-syria-v1.0.0.zip`

**Contributors:**
- **Faris Siddiqui** — Core architecture, popup, email flow, Thank You page, build/packaging
- **Yaseen Halabi** — Initial extension setup, Instagram post generator, bug fixes
- **sumaiyafarook** — Extension popup styling, company data additions
- **manhamirza23 / manhamirzaa** — userName feature, LinkedIn outreach, contact data updates

---

## 9. Future Considerations

- **Remote contact data** — Fetch site/contact data from a hosted JSON endpoint so it can be updated without shipping a new extension version. Highest-impact improvement.
- **Firefox support** — Port using `webextension-polyfill`. Main changes: `chrome.*` → `browser.*`, some Shadow DOM handling differences.
- **ThankYou for all flows** — Add "I sent it" confirmation buttons to LinkedIn and Instagram flows.
- **Expanded platform coverage** — GitHub (needs access verification), AWS, Microsoft 365, Adobe CC.
- **Localization** — Arabic language support for the overlay and templates.
- **Analytics** — Anonymized counters to understand which outreach paths are actually being used and measure impact.
- **Platform status tracking** — A `status: 'blocked' | 'unblocked' | 'partial'` field per site in `sites.ts` to track which companies have responded and updated their policies.

---

*Updated by Claude as development continues. Log significant decisions, new features, and anything worth remembering.*
