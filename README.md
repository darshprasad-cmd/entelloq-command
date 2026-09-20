# Entelloq Networks — entelloq.com

**One ecosystem. Infinite learning.**
*Intelligence · Innovation · Impact — pronounced en-TELL-ock.*

The corporate website of Entelloq Networks. It answers three questions in fifteen
seconds — *What is Entelloq? Which product do I need? How do I get there?* — and routes
visitors to the right product in one click.

**Live:** https://entelloq.com (GitHub Pages; fallback https://darshprasad-cmd.github.io/entelloq-command/)

## Sections

- **Hero** — "Understand a more complex world." over a cinematic Earth horizon,
  with Physics and Biology launch cards, refreshed app previews and a recorded
  dissection preview in the third panel.
- **Features in action — “Learning, in motion.”** — three clips from the Biology dissection lab and two
  from the Physics sandbox, using real app recordings with native video controls,
  descriptive captions and direct links to try each feature. The silent Physics clips
  show hand tracking for grabbing a simulated mass and opening the gesture tool wheel.
- **Guided tutorials** — links into the Physics hand-motion sandbox and Biology
  hand-dissection walkthroughs, with navigation steps and camera requirements.
- **Products** — Physics and Biology Entelloq as formal product cards with current
  interface screenshots, capability lists and one-click launch.
- **Intelligent routing** — a global command palette (Ctrl K / ⌘K / `/`): *Projectile
  Motion* / *Newton's Laws* → Physics, *DNA* /
  *Genome* → Biology, plus company destinations.
- **Metrics** — 21+ live physics simulations, 89+ concepts mapped, six explanatory
  lenses and 3.8 billion years of evolutionary history in Biology.
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

Static HTML with no build step. `index.html` retains the product configuration,
brand mark, founder portrait and banner. Current interface and launch previews are
stored as WebP files in `assets/previews/`. `network.css`
provides the reference-led launch and responsive content styles; `launch-motion.js`
adds optional native scroll effects without a framework. `dissection-media.js` manages
the hero preview and loads clip sources only as needed. Videos and their WebP posters
live in `assets/dissection/` and `assets/sandbox/`; posters remain visible until
playback starts.
The hero offers a separate play/pause control, follows the global pause setting and
does not play automatically when reduced motion or data saving is enabled. Full clips
use native controls and never start automatically. Google Fonts supplies the typefaces
with local fallbacks.
Ecosystem data lives in `PRODUCTS`, `TOPICS`, `ACTIONS`, `PROOF` and `RESOURCES`.

**Product URLs**: Physics and Biology are available at `physics.entelloq.com` and
`biology.entelloq.com`. The corporate site presents these two apps throughout its
navigation, search, product chooser, assistant and footer.

## Development

Serve the folder over HTTP, for example `python -m http.server 8766`, then open
`http://localhost:8766/`. Before publishing:

```text
node scripts/check-network.cjs
node qa/reference-launch/preservation.cjs
node --check launch-motion.js
node --check dissection-media.js
node qa/reference-launch/browser-check.cjs
```

The browser check needs Playwright and Chromium. It resolves `playwright` normally,
or uses the module path in `PLAYWRIGHT_PATH`. Set `ENTELLOQ_QA_URL` to test another
local or deployed URL. The preservation contract checks retained company and founder
copy, links, product data, assets and interaction hooks, with explicit allowances for
the two-app roster and the refreshed media.

---

© 2026 Entelloq Networks. All rights reserved.

### Connected product navigation

The bottom-left Entelloq launcher includes both apps and founder details. The
header launch and login controls open the existing product chooser; sign-in remains
inside each app. The search palette, assistant and all product tabs are preserved.
