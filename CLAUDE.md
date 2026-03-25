# CLAUDE.md — Click for Syria

This file gives Claude context about the project for every session. Read it before making any changes.

## What This Project Is

**Click for Syria** is a Chrome browser extension (Manifest V3) that detects when a user visits a platform that blocks access to Syrian users (e.g., ChatGPT, Figma, PayPal) and injects an interactive overlay that lets users take action — sending emails, LinkedIn outreach messages, or generating Instagram posts to advocacy contacts at those companies.

The project is an activism/advocacy tool tied to the December 2025 US sanctions lift on Syria and the ongoing effort to get tech platforms to re-enable access for Syrian users. The companion website is [unblocksyria.com](https://unblocksyria.com).

## Tech Stack

- **React 19 + TypeScript** — UI components
- **Vite + CRXJS** — Build tooling for Chrome extensions
- **Shadow DOM** — Isolates injected overlay CSS from host pages
- **chrome.storage.sync** — Persists user preferences (name) across devices
- **html-to-image** — Converts DOM to PNG for Instagram story download
- **Manifest V3** — Latest Chrome extension standard

## Project Structure

```
src/
  background.ts          # Service worker — monitors tabs, sends messages to content script
  content.tsx            # Content script — injected on blocked sites, hosts the overlay
  main.tsx / App.tsx     # Extension popup (click the icon) — just a name input
  SelectEmail.tsx        # Email drafting flow
  SelectLinkedin.tsx     # LinkedIn outreach flow
  GenerateInstaPost.tsx  # Instagram story image generator
  OutreachModal.tsx      # Copy-to-clipboard modal for LinkedIn messages
  ThankYou.tsx           # Success screen after email sent
  shared/sites.ts        # The core data: blocked sites, domains, and contact lists
manifest.config.ts       # Generates Chrome manifest dynamically from sites.ts
vite.config.ts           # Build config
```

## Key Architecture Decisions

See `DEVELOPMENT_LOG.md` for the full reasoning behind every decision. The short version:

1. **Shadow DOM** is used so the overlay never breaks the host site's CSS.
2. **Push/Pull messaging** between background worker and content script handles both direct navigation and SPA soft-navigation.
3. **No state library** — React hooks + chrome.storage is sufficient for this scope.
4. **CRXJS** generates the manifest dynamically so the `sites.ts` list is the single source of truth for which domains get the content script injected.

## Core Data File

`src/shared/sites.ts` is the most important file. Every blocked site, its domain, and its contacts live here. Adding a new company means adding one entry here — the manifest patterns, content script matching, and UI all derive from it automatically.

## Development Commands

```bash
npm install       # Install dependencies
npm run dev       # Dev server (hot reload with CRXJS)
npm run build     # Production build → dist/
npm run lint      # ESLint check
```

To load in Chrome: `chrome://extensions` → Developer Mode ON → Load Unpacked → select `dist/`

## Contributors

- Faris Siddiqui
- Yaseen Halabi
- sumaiyafarook
- manhamirza23 (manhamirzaa)

## Living Documentation — Your Responsibility

`DEVELOPMENT_LOG.md` is the canonical record of this project's development. **As Claude, you are responsible for keeping it up to date.**

After completing any meaningful task in this project, update `DEVELOPMENT_LOG.md` with:
- What was built or changed, and why
- Any trade-offs that were considered or made
- Decisions that were rejected and the reason
- New entries in the Version History when a version ships

You don't need to update it for trivial one-line fixes, but any feature, architectural change, new component, new blocked site added, or significant refactor should be logged.

**Style guide — this is critical for consistency:**
- Write in natural language, as if explaining your thought process out loud. Not bullet-point jargon, not a dry technical spec.
- Each decision should follow this pattern: what the decision was, why it was made (the actual reasoning, not just "it's better"), and what the trade-offs are.
- The audience is Faris reading this later to jog his memory — write to him, not to an external reader. It should feel personal and direct, like notes from someone who was in the room.
- Use code blocks sparingly and only when the code itself is the clearest way to explain something.
- Trade-offs should be honest. If something is a weak solution or has a known gap, say so plainly.
- Match the tone and depth of the existing entries. Read a few sections before adding anything new.

For the full development history, architectural trade-offs, and decision log, see [`DEVELOPMENT_LOG.md`](./DEVELOPMENT_LOG.md).
