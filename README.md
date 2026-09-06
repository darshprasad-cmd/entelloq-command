# Entelloq Networks — entelloq.com

**One ecosystem. Infinite learning.**
*Intelligence · Innovation · Impact — pronounced en-TELL-ock.*

The corporate website of Entelloq Networks. It answers three questions in fifteen
seconds — *What is Entelloq? Which product do I need? How do I get there?* — and routes
visitors to the right product in one click.

**Live:** https://entelloq.com (GitHub Pages; fallback https://darshprasad-cmd.github.io/entelloq-command/)

## Sections

- **Hero** — "Understand a more complex world." over a cinematic Earth horizon,
  with photographic Physics, Biology and Quant launch cards and actual product metrics.
- **Guided tutorials** — links into the Physics hand-motion sandbox and Biology
  hand-dissection walkthroughs, with navigation steps and camera requirements.
- **Products** — Physics, Quant and Biology Entelloq as formal product cards with real
  interface screenshots, capability lists and one-click launch.
- **Intelligent routing** — a global command palette (Ctrl K / ⌘K / `/`): *Projectile
  Motion* / *Newton's Laws* → Physics, *Black-Scholes* / *CAPM* → Quant, *DNA* /
  *Genome* → Biology, plus company destinations.
- **Metrics** — 700+ registered users (Quant, since July 2026), 21+ live simulations,
  89+ concepts mapped, 3 products.
- **Recognition** — the South Asian Herald feature (July 30, 2026, by Vivek Das) and
  The Legal Lock's recognition for innovation in physics and science education.
- **Leadership** — founder Darsh Prasad: the founding story and contact links.
- **Company** — mission, vision, the meaning of the name, and milestones.
- **Newsroom** — latest updates across the ecosystem.
- **Launch app** — nav button opens an application switcher; every product is one click
  away from anywhere.
- **Light/dark** — dark on first visit, with a persisted appearance toggle in the footer.
  The cinematic launch scene remains dark in both appearances.
- **Scroll motion** — subtle Earth and card-image parallax, section entrances and
  reading progress. Respects reduced motion and a persisted pause control.

## Architecture

Static HTML with no build step. `index.html` retains the original product configuration,
brand mark, founder portrait, banner and embedded interface screenshots. `network.css`
provides the reference-led launch and responsive content styles; `launch-motion.js`
adds optional native scroll effects without a framework. Four optimized WebP images in
`assets/launch/` total about 535 KiB. Google Fonts supplies the typefaces with local fallbacks.
Ecosystem data lives in `PRODUCTS`, `TOPICS`, `ACTIONS`, `PROOF` and `RESOURCES`.

**Product URLs**: Quant, Physics and Biology are available at their respective `quant.entelloq.com`, `physics.entelloq.com` and `biology.entelloq.com` subdomains.

## Development

Serve the folder over HTTP, for example `python -m http.server 8766`, then open
`http://localhost:8766/`. Before publishing:

```text
node scripts/check-network.cjs
node qa/reference-launch/preservation.cjs
node --check launch-motion.js
node qa/reference-launch/browser-check.cjs
```

The browser check needs Playwright and Chromium. It resolves `playwright` normally,
or uses the module path in `PLAYWRIGHT_PATH`. Set `ENTELLOQ_QA_URL` to test another
local or deployed URL. The preservation contract is pinned to the site before this
redesign and checks copy, links, product data, founder assets and interaction hooks.

---

© 2026 Entelloq Networks. All rights reserved.

### Connected product navigation

The bottom-left Entelloq launcher includes all three apps and founder details. The
header launch and login controls open the existing product chooser; sign-in remains
inside each app. The search palette, assistant and all product tabs are preserved.
