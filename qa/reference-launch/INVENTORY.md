# Launch-page preservation inventory

Baseline: `origin/main` / commit `2ca3670`, captured before the reference-image redesign on 2026-09-06. `baseline.html` is the unchanged original source; `baseline.contract.json` holds readable content, destinations, configuration, and image hashes.

Run `node qa/reference-launch/preservation.cjs` from the site directory. An optional file argument checks another HTML copy. The contract permits visual and color changes while protecting content, routes, controls, screenshots, and founder assets. It is a source-level regression check; a real browser must additionally verify visibility, responsive layout, keyboard operation, and navigation.

## Visible information to keep

- Hero: three connected apps, curiosity and understanding; Physics explores motion/forces/waves through changeable models, Quant explores markets and virtual-capital decision making, Biology offers living systems, lessons, virtual labs and dissection. Direct app links, explore-products link, founder entry point. The copy may be reframed for the new hero without losing these purposes.
- Recognition strip: South Asian Herald and The Legal Lock / Journals LLP; both external recognition destinations remain usable.
- Products: all three tabs with status, product name, creed, description, four capabilities, real product screenshot and open-app link. Quant is Live, Physics Early access, Biology Open access in current product config.
  - Quant: market simulator, AI trade coach, plain-English lessons, live market data; virtual capital at real prices; coach uses live data, news and position size.
  - Physics: live simulations, concept graph, specialist AI minds, six lenses; JEE, NEET, AP, A-Levels, IB, Olympiad.
  - Biology: dissection lab, tree-of-life atlas, body systems, Biology Universe; evolution and gesture-controlled dissection.
- Tutorials: Physics hand-motion Sandbox (`https://physics.entelloq.com/?tutorial=hands`) and Biology hand dissection (`https://biology.entelloq.com/app.html?tutorial=dissection`). Keep navigation/control instructions, replay guidance, camera-off instruction, and note: guides work without camera; Biology hand tracking needs a desktop webcam; mouse/touch available.
- Newsroom: six cards and their destinations: 700 Quant users → momentum; Herald feature by Vivek Das → external article; Legal Lock recognition → LinkedIn announcement; Ultimate release with 21 simulations/89 concepts/6 lenses → Physics; Biology dissection/atlas/Universe → Biology; free July 2026 Quant launch → Quant.
- Platform: bottom-left logo moves among the three apps and company home; intelligent routing launcher; AI restores confidence and intuition; free early access with mission/get-started actions.
- Momentum: 700+ registered Quant users since July 2026; 21+ live physics simulations; 89+ concepts mapped; 3.8 Gyr evolution; 6 explanatory lenses; 50+ news sources for the trade coach. Each metric routes to its product. Keep the surrounding launch/date context.
- Founder: original current portrait, Darsh Prasad name/title, GitHub/contact/Herald links, full two-paragraph origin and authorship story, confidence-to-think quote with Herald July 2026 attribution.
- Company: pronunciation en-TELL-ock; Intelligence / Innovation / Impact mission, connected-worlds vision, EN/TEL/LOQ meaning; embedded illustrated name banner; all six Jul/Aug 2026 milestones and descriptions.
- Closing CTA: all products free in early access, get-started launcher, email contact.
- Footer: One ecosystem. Infinite learning.; Intelligence / Innovation / Impact.; three product links; Newsroom, Leadership, About, Momentum; LinkedIn, X, Instagram, GitHub, Contact, Press; 2026 copyright and pronunciation.

## Functional contract and interaction checks

1. Product menu works with click/touch and pointer hover; comparison link lands on products. Product tabs switch the full panels. Screenshot launch controls support Enter/Space.
2. Search opens through both entry buttons, Ctrl/Command+K and `/`; arrow keys select, Enter acts, Escape closes. Preserve 16 topic routes, all product keyword aliases, and four company/press actions. Search includes grouped results and an empty state.
3. Get-started / Launch app buttons open the three-app dialog with focus placement, Tab containment, Escape/backdrop dismissal, and focus return. All app destinations remain the existing subdomains; launch feedback resets after back navigation.
4. Bottom-left ecosystem logo opens the separate four-destination switcher (company + three apps), marks the current company page, exposes founder story/contact and social links, supports close/Escape/outside click/focus departure.
5. Assistant remains usable: open/close, editable input, suggested chips, conversation log, answer actions, topic routing, all 17 intents (greeting, company, choose, all, exams, three products, pricing, founder, press, pronunciation, start, updates, contact, thanks, bye). It runs locally with no service credential requirement. On mobile it is a focus-contained sheet.
6. Preserve persisted light/dark preference and accessible theme action, even if the new visual defaults to dark.
7. Existing statistics and reveal effects respect reduced-motion preference. New scroll effects must keep content visible with reduced motion and if animation initialization fails. Avoid adding a second scroll container or intercepting wheel/touch navigation.
8. Mobile widths must retain access to every section and destination, even where desktop navigation becomes compact. Check that the two floating launchers do not cover content or each other, including when panels are open.

## Reference-image pitfalls

- Treat the screenshot as visual direction. Its 500K+ learners, 1,000+ simulations, and 50+ projects are not supported by the current site. Use existing proof data instead of importing those claims.
- The reference's film and 1:52 duration do not correspond to an existing video feature. Do not add a nonfunctional film action or invent a duration. A working new overview is acceptable if implemented and described accurately.
- There is no company-level login form. A Log in action should offer actual app destinations; it must not lead to a placeholder.
- New nav labels such as Our Mission, Research, Community and About need real destinations; keep the present Tutorials, Newsroom and Leadership discoverable. Do not remove existing sections to make the first screen resemble the image.
- Old script depends on `.brand img`, `#hero-shot`, `#theme-btn` and the listed dialog/render targets. Replacing the hero/nav can throw early and prevent all subsequent products/search/assistant setup. Retain or deliberately update those dependencies.
- Current assistant prose still calls Biology private beta although product config says Open access. This is existing stale copy, not a missing-feature requirement; correcting current availability is reasonable, while retaining its capabilities and routes. Current newsroom `BETA` and company Aug 2026 private-beta milestone are historical context.
- Large Earth imagery and tall product cards can overwhelm mobile or hide low-contrast secondary copy. Use intentional crop/aspect ratios, readable overlays, appropriate image loading, and composited transform/opacity motion.

## Scope of the automated baseline

The check protects seven section bodies, all original direct destinations, full content-bearing config records (allowing accent/icon styling changes), product screenshot/logo hashes, founder and company-banner image hashes, assistant intent/keyword/action coverage, and required interaction hooks. It compiles all classic inline scripts. Hero presentation and headline are intentionally free to change. Exact assistant prose is captured for human review, with capability-specific informational values also retained in this inventory; the checker allows availability/copy corrections while preserving intents and destinations.
