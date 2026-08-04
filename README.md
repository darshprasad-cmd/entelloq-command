# Entelloq Networks — entelloq.com

**One ecosystem. Infinite learning.**
*Intelligence · Innovation · Impact — pronounced en-TELL-ock.*

The website of the mother company — an airport terminal, not a shopping mall. It answers
three questions in fifteen seconds (*What is Entelloq? Which app do I need? How do I get
there?*) and routes you to the right subdomain in one click.

**Live:** https://darshprasad-cmd.github.io/entelloq-command/

## What's inside

- **Hero** — "The platform that doesn't just teach. It helps you finally understand." —
  with the *South Asian Herald* press badge, global search and try-me hint chips, over a
  live animated network connecting the apps.
- **Product Launchpad** — Physics, Quant and Bio orbit the Entelloq hub; hover a node and
  the hub becomes a preview, click and you're there.
- **The Apps** — real screenshots of each product in browser-frame cards (taken from the
  actual apps), with the standout features as chips: Physics ("Physics, finally
  engineered." — 21+ live simulations, 89+ concepts), Quant ("Learn to trade with an AI
  coach, using zero real money."), Bio ("All of life, on one map you can touch.").
- **Press** — the South Asian Herald feature (July 30, 2026, by Vivek Das) with pull
  quotes, linked to the article.
- **Philosophy** — the founder's creed as a quote band plus three principle cards, all
  drawn from the press feature.
- **Founder** — Darsh Prasad's story: the physics-classroom observation, the markets
  pattern, and the environment he's building; contact links and the press feature.
- **Numbers, Updates, About** — honest stats with count-up, a shipping timeline, and
  mission/vision/name-meaning with the full brand lockup.
- ⭐ **Command palette** (Ctrl K / ⌘K / `/`) — smart routing: *Projectile Motion* /
  *Newton's Laws* → Physics, *Black-Scholes* / *CAPM* → Quant, *DNA* / *Genome* → Bio,
  plus company destinations (press feature, founder).
- ⭐ **App switcher** — nav "Launch App →" and the floating **◉ Apps** button.
- **Light/dark** — white-with-graphite by default, seamless persisted dark toggle.

## The real assets

The actual Entelloq brand art (sentinel head-in-ring mark + full lockup banner) and three
real product screenshots are embedded as base64 — zero external image requests. The mark
is embedded once and reused everywhere (including the favicon) via JS.

## Architecture

One self-contained HTML file, no build step. All ecosystem data lives in a CONFIG block:
`PRODUCTS` (drives launchpad, showcase rows, switcher, footer, search, canvas), `TOPICS`
(topic → app routing), `ACTIONS` (company destinations in the palette), `STATS`,
`UPDATES`. Add an app = one entry in `PRODUCTS` plus a screenshot.

**Product URLs**: Quant is live at `quant.entelloq.com`; Physics and Biology point at
their future subdomains — update when deployed.

## Development

Open `index.html` in a browser. That's it.

---

© 2026 Entelloq Networks — founded by Darsh Prasad.
