# Entelloq Command Centre

**One ecosystem. Infinite learning.**

The Command Centre is the front door to the entire Entelloq ecosystem — a single, elegant
launchpad where every Entelloq product is one click away. It is not a dashboard or an admin
panel; it is the operating hub that connects Physics, Quant, Biology, Research, Labs, Studio
and the developer platform into one unified experience.

**Live:** https://darshprasad-cmd.github.io/entelloq-command/

## What's inside

- **Landing** — the Entelloq wordmark over a live animated network that connects every
  product node, with soft aurora gradients and ambient particles.
- **Global search (⌘K / Ctrl K / `/`)** — a command palette that intelligently routes any
  query to the right application: *"Projectile Motion"* → Physics Entelloq,
  *"Black-Scholes"* → Quant Entelloq, *"Research on Quantum Computing"* → Entelloq Research.
- **Launch Grid** — every product as a premium glass card with logo, one-line description,
  status (Live / Beta / Coming Soon), version and a one-click Launch.
- **Quick Actions** — shortcuts straight into the most common destinations.
- **Workspace Switcher** — a macOS-style dock with magnification, pinned to the bottom of
  the viewport, for switching between applications from anywhere.
- **Recent Updates** — a changelog of what shipped across the network.
- **Launch transition** — a smooth, product-tinted handoff animation before entering an app.

## Architecture

The entire application is **one self-contained HTML file** — no build step, no framework,
no dependencies beyond two Google Fonts. Everything (design system, canvas engine, command
palette, dock, routing) is inline in [`index.html`](index.html).

All ecosystem data lives in a single `CONFIG` block at the top of the script:

| Constant   | Drives                                                            |
|------------|-------------------------------------------------------------------|
| `PRODUCTS` | Launch grid cards, dock icons, palette results, background nodes  |
| `TOPICS`   | Topic → product search routing ("Black Holes" → Physics)          |
| `UPDATES`  | The Recent Updates feed                                           |
| `QUICK`    | The quick-action chips under the hero search                      |

**To add or change a product** — edit one entry in `PRODUCTS` (name, description, accent
colour, status, version, URL, search keywords). Every surface of the Command Centre updates
automatically.

**Product URLs** are set in `PRODUCTS[].url`. Products marked `status: 'soon'` show a
"coming soon" toast instead of navigating, so nothing ever links to a dead page. When a
product goes live, flip its status to `'beta'` or `'live'` and confirm its URL.

## Design language

Dark ink (`#05070E`), glassmorphism, hairline borders, Space Grotesk display type over
Inter, and the Entelloq brand gradient (periwinkle `#7AA7FF` → violet `#A78BFA`) shared
with the [press & media kit](https://github.com/darshprasad-cmd/entelloq-networks).
Each product carries its own accent hue across cards, dock, palette and the background
network. Honours `prefers-reduced-motion`.

## Development

Open `index.html` in a browser. That's it.

```bash
python -m http.server 8600
```

---

© 2026 Entelloq Networks — built as one ecosystem.
