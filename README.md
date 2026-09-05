# Entelloq Networks — entelloq.com

**One ecosystem. Infinite learning.**
*Intelligence · Innovation · Impact — pronounced en-TELL-ock.*

The corporate website of Entelloq Networks. It answers three questions in fifteen
seconds — *What is Entelloq? Which product do I need? How do I get there?* — and routes
visitors to the right product in one click.

**Live:** https://entelloq.com (GitHub Pages; fallback https://darshprasad-cmd.github.io/entelloq-command/)

## Sections

- **Hero** — "Building AI-powered learning and research ecosystems." with a
  recognised-by bar (South Asian Herald, The Legal Lock).
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
- **Light/dark** — light-first with a persisted dark toggle.

## Architecture

One self-contained HTML file, no build step, no external assets — the real brand mark,
lockup banner and three product screenshots are embedded as base64. All ecosystem data
lives in a CONFIG block (`PRODUCTS`, `TOPICS`, `ACTIONS`, `STATS`, `UPDATES`); adding a
product is one entry plus a screenshot.

**Product URLs**: Quant, Physics and Biology are available at their respective `quant.entelloq.com`, `physics.entelloq.com` and `biology.entelloq.com` subdomains.

## Development

Open `index.html` in a browser. That's it.

---

© 2026 Entelloq Networks. All rights reserved.

### Connected product navigation

`network.css` styles the three equal launch cards and responsive company homepage. The bottom-left Entelloq launcher includes all three apps and founder details. Run `node scripts/check-network.cjs` before publishing.
