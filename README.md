# Entelloq Networks — entelloq.com

**One ecosystem. Infinite learning.**
*Intelligence · Innovation · Impact — pronounced en-TELL-ock.*

This is the website of the **mother company**: an airport terminal, not a shopping mall.
Its whole job is to answer three questions within 15 seconds — *What is Entelloq? Which
product do I need? How do I get there?* — and then route you to the right subdomain in
one click. It never competes with the apps; it launches them.

**Live:** https://darshprasad-cmd.github.io/entelloq-command/

## What's inside

- **Hero** — "Building AI-powered learning and research ecosystems", over a live animated
  network connecting every product, with global search and try-me hint chips.
- **Product Launchpad** ⭐ — the heart of the site. A radial map of all 8 products around
  the Entelloq hub; hovering a node expands a preview (description, feature bullets,
  Launch →) in the hub, clicking routes straight to the product's subdomain. Falls back
  to a tap-friendly grid on mobile.
- **Featured Apps** — large cards for the flagships (Physics, Quant, Bio) with status,
  users, latest update and stars.
- **Why Entelloq** — Learn / Research / Build.
- **Research Hub** — latest paper, article and experiment.
- **Community** — honest network stats with scroll-triggered count-up.
- **Developers** — Documentation, API Reference, Status, GitHub.
- **Latest Updates** — a shipping timeline.
- **About** — mission, vision, founder (Darsh Prasad), company timeline, and the full
  brand lockup.
- ⭐ **Command palette** — Ctrl K / ⌘K / `/`. Smart routing: *Projectile Motion* →
  Physics, *Black-Scholes* / *CAPM* → Quant, *DNA* / *Genome* → Bio, *Quantum Research* →
  Research, *docs* → Documentation.
- ⭐ **App switcher** — the nav's "Launch App →" button and a floating **◉ Apps** button
  open a switcher where every app is one click away.
- **Light/dark** — white-with-graphite by default, seamless dark toggle, persisted.

## The real logo

The actual Entelloq Networks brand art (the sentinel head-in-ring mark and the full
lockup banner) is embedded in the file as base64 — the mark once (reused everywhere via
JS, including the favicon), the banner once in About. No external image requests.

## Architecture

The entire site is **one self-contained HTML file** — no build step, no framework.
All ecosystem data lives in a CONFIG block at the top of the script:

| Constant         | Drives                                                        |
|------------------|---------------------------------------------------------------|
| `PRODUCTS`       | Launchpad map, app switcher, footer, search routing, canvas   |
| `TOPICS`         | Topic → product routing ("CAPM" → Quant)                      |
| `FEATURED`       | The three flagship cards                                      |
| `RESEARCH_ITEMS` | The Research Hub cards                                        |
| `STATS`          | Community numbers                                             |
| `UPDATES`        | The updates timeline                                          |

**To add a product**: one entry in `PRODUCTS` (name, accent, description, bullets,
status, version, URL, keywords). Products with `status:'soon'` toast instead of
navigating, so nothing links to a dead page.

**Product URLs**: Quant is live at `quant.entelloq.com`; Physics and Biology point at
their future subdomains — update when deployed.

## Development

Open `index.html` in a browser. That's it.

---

© 2026 Entelloq Networks — founded by Darsh Prasad.
