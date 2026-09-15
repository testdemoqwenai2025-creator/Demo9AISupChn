# AI Supply Chain Advanced — Enterprise Platform

**Private Repository:** AISupChn9-Advance  
**Public Mirror:** [Demo9AISupChn](https://github.com/testdemoqwenai2025-creator/Demo9AISupChn)  
**Live URL:** https://testdemoqwenai2025-creator.github.io/Demo9AISupChn/spa/command-center

---

## Overview

AI Supply Chain Advanced is an enterprise-grade supply chain intelligence platform built with Next.js 16, React 19, TypeScript, and Tailwind CSS 4. It features a real-time command center dashboard with 21 enhancement modules, all running client-side on GitHub Pages — no backend server required.

## Architecture

```
AISupChn9-Advance (private)
    ├── src/                    # Next.js source code
    │   ├── app/                # App Router pages
    │   │   ├── command-center/ # Main dashboard page
    │   │   ├── login/          # Login page
    │   │   ├── dashboard/      # Dashboard route
    │   │   └── ...             # Other routes
    │   ├── components/         # React components
    │   │   ├── command-center/ # Dashboard components
    │   │   └── ui/             # shadcn/ui components
    │   └── lib/                # Utilities (stores, GitHub API)
    ├── js/                     # Enhancement scripts (vanilla JS)
    │   ├── order-management.js
    │   ├── tender-management.js
    │   ├── platform-analytics.js
    │   ├── cc-enhancements.js          # AI Expert chat
    │   ├── collaborative-cursors.js     # Phase 11
    │   ├── supply-chain-timemachine.js  # Phase 12
    │   ├── supply-chain-waze.js         # Phase 13
    │   ├── ai-concierge.js              # Phase 14
    │   ├── blockchain-audit.js          # Phase 15
    │   ├── mobile-fab-menu.js           # Phase 16
    │   ├── lazy-loader.js               # Phase 17
    │   ├── demo-identity.js             # Phase 18
    │   ├── white-label.js               # Phase 19
    │   ├── ai-doc-generator.js          # Phase 20
    │   └── simulated-risk-engine.js     # Phase 21
    ├── spa/                    # Built static export (Next.js output)
    │   ├── command-center.html # Main page
    │   ├── _next/              # JS/CSS chunks
    │   └── data/               # JSON data files
    ├── .github/workflows/      # CI/CD
    │   ├── sync-to-public.yml  # Mirror to Demo9AISupChn
    │   └── validate-pages.yml # Deploy to GitHub Pages
    └── next.config.ts          # basePath: /Demo9AISupChn/spa
```

## Build Pipeline

```bash
# 1. Install dependencies
npm install

# 2. Build from source
npm run build

# 3. Copy built files to spa/
cp -r out/* spa/

# 4. Add enhancement script tags to spa/command-center.html
#    (see js/ directory for available scripts)

# 5. Commit and push
git add -A && git commit -m "feat: ..." && git push

# Sync workflow automatically mirrors to Demo9AISupChn → GitHub Pages
```

## Completed Phases (1-21)

| Phase | Feature | Shortcut | Description |
|-------|---------|----------|-------------|
| 2A-2E | Core SPA | — | Login, order CRUD, audit trail, command palette, PWA |
| 3A-3E | Collaboration | — | AI insights, team collaboration, activity feed |
| 4 | Usage Metering | — | Push notifications, soft paywall |
| 5 | AI Expert Chat | E | 10 Q&A topics with fuzzy matching |
| 7 | Customization | — | Dashboard customization, ZIP export |
| 8 | GitHub as DB | — | Contents API for real-time data |
| 9 | 3D Globe | — | Three.js supply chain visualization |
| 10 | Conversational Agent | — | Voice input, NL navigation |
| 11 | Live Cursors | — | Real-time multi-user cursor tracking |
| 12 | Time Machine | M | Timeline scrubber (past ← present → future) |
| 13 | Supply Chain Waze | R | Crowdsourced intelligence + reputation |
| 14 | AI Concierge | C | Proactive AI alerts + recommendations |
| 15 | Blockchain Audit | B | SHA-256 hash chain audit trail |
| 16 | Mobile FAB | — | Collapsible floating button menu |
| 17 | Lazy-Loading | — | On-demand script loading |
| 18 | Demo Identity | — | User profiles (localStorage) |
| 19 | White-Label | Shift+W | Custom branding (colors, logo, name) |
| 20 | AI Docs | D | Document generation (PO, RFQ, compliance) |
| 21 | Risk Engine | — | Simulated real-time risk alerts |

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **3D:** Three.js
- **Database:** GitHub Contents API (Phase 8 pattern) + localStorage
- **Deployment:** GitHub Pages (static export)
- **Enhancement Scripts:** Vanilla JS (no React dependency)

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| O | Open Order Management |
| T | Open Tender Management |
| A | Open Platform Analytics |
| E | Open AI Expert Chat |
| M | Open Time Machine |
| R | Report Issue (Waze) |
| C | Open AI Concierge |
| B | Open Blockchain Audit |
| D | Open AI Document Generator |
| Shift+W | Open White-Label Settings |
| ESC | Close any modal |
| ⌘K | Open Command Palette |

## Live URLs

- **Command Center:** https://testdemoqwenai2025-creator.github.io/Demo9AISupChn/spa/command-center
- **Marketing Page:** https://testdemoqwenai2025-creator.github.io/Demo9AISupChn/
- **Login:** https://testdemoqwenai2025-creator.github.io/Demo9AISupChn/login

## Repository URLs

- **Private:** https://github.com/testdemoqwenai2025-creator/AISupChn9-Advance
- **Public:** https://github.com/testdemoqwenai2025-creator/Demo9AISupChn

## License

Demo project. All rights reserved.
