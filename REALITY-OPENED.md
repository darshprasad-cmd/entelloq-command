# Reality, opened — historical gateway design

This design was superseded on 16 October 2026 at the user's request. See `CLASSIC-REALISM.md` for the restored launch layout and current validation commands. The aperture runtime and its scene-specific tests are retired; this document preserves the previous design record only.

## Storyboard

1. **Opening:** an asymmetrical graphite stage, an original illuminated aperture on the right, monumental ivory headline on the left. Immediate product chooser and authentic footage link. A visible motion control sits in the navigation.
2. **First scroll, revised from the supplied recording:** a short pinned stage drives a substantial camera push (1 to 2.9 times scale with a nine-degree tilt) through the luminous aperture. The headline yields and a circular reveal opens into two full-screen scientific worlds. They separate into Physics and Biology destinations before normal scrolling resumes. No scroll interception or invented measurements. Automatic orbit tracing and camera movement use a separate illustrative clock.
3. **Peak reveal:** each world resolves into an actual product screenshot; both entry actions remain visible. The next section gives the existing product controls and real silent recordings space to explain the software.
4. **Quiet chapters:** guided entry, a clear learning approach, preserved founder/company story and verified existing press. An FAQ and large final invitation complete the experience.
5. **Mobile:** type comes first, a separately framed aperture underneath. The camera journey is shorter and world windows stack vertically. Motion can be paused and reduced-motion removes the pinned travel, keeping the finished static composition and the full story below.

## Preservation inventory

- Existing logo, Physics and Biology product configuration, working app destinations and product tabs.
- Login/product chooser, guest entry inside each application, exact hand tutorial links, search shortcuts, assistant, ecosystem switcher, appearance choice.
- Founder portrait and biography, company banner, mission, milestones, press destinations and social/contact links.
- Six existing authentic silent recordings and their posters/provenance. Generated imagery is illustrative and distinct from product captures.
- Immutable preservation baseline. Only authorized visual/copy changes receive explicit exceptions.
- No internal application, model, authentication, provider, saved-progress or deployment changes.

## Roster verification

The current corporate source and deployed homepage promote Physics and Biology. Quant was deliberately removed from this corporate roster in the previous accepted revision; its legacy URL still responds, which does not reverse that decision. Chemistry has a local product but its public subdomain did not resolve on inspection. This redesign preserves the two advertised products.

## Engineering and budgets

Static HTML, existing CSS/JavaScript, native Canvas and native scrolling; no new dependencies. Hero posters target <400 KB each, responsive derivatives below 120 KB on mobile where feasible; initial local non-font transfer target <1 MB. Below-fold media uses lazy loading, no video transfer before intersection, and offscreen/hidden-tab pause. The moving orbit uses a cropped 440 by 340 reference-pixel canvas at DPR 1.5 maximum, 30 fps, and no mobile canvas allocation. Ambient frames change only the orbit and artwork transform; page geometry is cached after resizing or content changes. The orbit stops when the image fades out as well as offscreen or hidden. The existing founder and company images are byte-identical external files, genuinely deferred rather than embedded in the initial HTML. These are laboratory budgets, not real-user Core Web Vitals claims.


## Bounded performance observations

The 14 October single-browser local Chromium sample used a fresh cache, no network throttle, 1440 px at normal CPU and a 390 px viewport with 4x simulated CPU slowdown. Initial same-origin transfer was approximately 853 KB / 819 KB; six videos remained unloaded. LCP was 336 / 608 ms and CLS 0.0013 / 0.0019. A two-second scroll had no long tasks in either sample; frame p95 was 33.2 / 16.7 ms. Offscreen observations recorded zero script, style or layout work over two seconds. These are bounded local observations, not field performance, physical device or universal frame-rate guarantees. The repeatable profiler is `qa/reality-opened/performance.cjs`.
