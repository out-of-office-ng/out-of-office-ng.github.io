# Out of Office — UX ideas from The Playground

Date: 2026-09-30
Status: Implemented on the local `codex/playground-ux` review branch. Not deployed. Approved event photos and photo crossfades remain pending.

References:
- https://www.entertheplayground.co/
- https://out-of-office-ng.github.io/
- https://github.com/out-of-office-ng/out-of-office-ng.github.io

## Evidence and scope

[FACT] This comparison used The Playground's downloaded HTML, compiled JavaScript and CSS, and OOO source at e71f702 plus its live JavaScript bundle. There was no usable browser in the review session. Motion settings and interaction handlers were inspected; rendered layouts, scrolling feel, keyboard behavior and touch behavior were not browser-tested.

[OPINION] Keep OOO's water, paper, postcards, stamps and escape identity. Adapt the reference's interaction patterns to make the existing journey more coherent. These recommendations should be revisited after a mobile browser review.

Follow OOO-0x04-LEAN-SCOPE.md: one atmospheric centrepiece, one homepage archive treatment, truthful event information, and a simple visitor journey. This document records ideas, not approval to implement every section or control.

## Where the water goes

[FACT] The current home route renders HeaderBar, then Shallows, then the content-start container. Shallows contains the water scene, headline, event status, pass action and optional auto-reply card. See src/App.svelte and src/lib/Shallows.svelte.

[OPINION] Keep the water in the opening hero at the top of the homepage. It is the arrival scene and the site's main atmospheric feature. Retain readable headline, a short explanation and an honest event-status action over a calm, high-contrast area. Keep the optional “Wander the water” interaction secondary.

As the visitor scrolls, the water hero leaves the viewport and the page moves into a warm paper background. The water should not remain fixed behind every section or return as another animated scene. Use OOO's colors and paper details to connect the later sections visually.

On a phone, prioritize the headline, explanation and next action; make exploration optional. Preserve the existing still-image fallback for slow loading or WebGL failure. Provide a still or appropriately reduced experience for reduced-motion preferences. Do not autoplay sound.

Proposed sequence:

1. Water hero: feel the escape, understand the invitation, see next-event status.
2. Short paper introduction: explain what an OOO gathering is; optionally use the existing postcard frame for real photographs.
3. One past-editions archive: a tactile postcard stack, replacing the homepage timeline if chosen.
4. Practical next-event details and concise FAQ: show only confirmed information.
5. Honest pass-status action and simple footer.

Community evidence should live in the introduction or archive if a separate section repeats their job. Keep playlist and auto-reply extras only where they contribute without interrupting the core journey.

## Patterns to adapt

### 1. Stacked past-event postcards — highest priority

[FACT] Playground's episode cards overlap with alternating small rotations, decreasing scale and opacity, horizontal drag, tap-to-advance and pagination dots. Position changes take 600ms. The stack auto-advances every 4.2 seconds. See downloaded app/page-aa888037e964a071.js, episode component.

[OPINION] Replace OOO's homepage MemoryTimeline with one postcard stack for 0x01, 0x02 and 0x03. Use real approved event photographs, edition stamps, confirmed location/date and a short caption. Keep the separate event-trail destination available for deeper reading.

On a 390px phone, show one readable active card with a little of the next card visible. Support swipe plus labelled previous/next controls and a clear “See this edition” action. Separate advancing a card from opening an edition. Keep inactive cards out of keyboard focus. Prefer visitor-controlled advancement to automatic cycling.

### 2. Tactile photo response

[FACT] Playground's floating hero photographs pause their animation on hover, straighten, scale to 1.1 and gain a stronger shadow. OOO's Postcard and Community polaroids currently have static rotations.

[OPINION] Use a smaller lift, slight enlargement and straightening on OOO photo cards. Give interactive cards equivalent focus feedback. On touch, offer a real action such as opening the memory; do not depend on hover to reveal essential information. Decorative photographs should not misleadingly look like buttons.

### 3. Photo crossfades in the existing frame

[FACT] Playground's about-photo frame keeps a 16:10 ratio and crossfades over 1.1 seconds. Its interval is normally 3.5 seconds, extended to 6.5 seconds for detected data-saving/slow connections. Reduced motion disables automatic cycling.

[OPINION] If useful, rotate a few real OOO images inside the existing postcard frame rather than adding another gallery section. Preserve dimensions to prevent layout jumps. Provide pause/manual controls for automatic cycling, reduce preloading on limited connections, and use a still image for reduced motion. Omit this if it duplicates the archive's purpose.

### 4. Shorter, sequenced scroll reveals

[FACT] Playground's shared reveal uses opacity and a 16px upward movement over 700ms, once, with a 25% visibility threshold. OOO's ScrollReveal moves entire wrappers upward 40px over 800ms; MemoryTimeline already staggers its entries.

[OPINION] Reduce OOO's reveal distance to roughly 12–16px. Reveal a heading, supporting copy and image in a brief sequence rather than moving a whole large section together. Start with 450–650ms transitions and 80–120ms staggering, then tune in a browser. Avoid stacking parent and child animations so content feels delayed. Ensure content remains available when animation is disabled.

### 5. Expanding FAQ rows

[FACT] Playground animates answer height and opacity over 350ms and rotates its indicator. OOO's ScheduleFAQ conditionally inserts/removes the answer without a comparable transition.

[OPINION] Add a short 200–300ms expansion/collapse and indicator transition. Preserve aria-expanded and associate each answer with its button. Keep the answer readable during layout changes and disable motion when requested. Remove empty schedule tabs and unconfirmed logistics before polishing them.

### 6. Consistent button feedback

[FACT] Playground applies a small upward hover movement and slight pressed-state compression to several buttons. OOO currently mixes color, opacity, translation and scale treatments.

[OPINION] Standardize working actions: subtle hover lift, slight press compression, clear keyboard focus and explicit disabled/loading states where needed. A starting point is 1–2px lift and scale 0.98 on press, taking 150–200ms. Do not animate a control as if it works before wiring its action.

### 7. Navigation that stays useful after the hero

[FACT] Playground uses a fixed header and a mobile overlay with staggered link entrances. OOO's HeaderBar receives overlay on the homepage, which makes it absolutely positioned.

[OPINION] Keep a compact header available beyond the hero with About, Past Editions and Next Event destinations. A small opaque or translucent background can keep text readable after leaving the water. Favor direct destinations; only introduce a mobile menu if it actually helps fit the navigation. Simplify existing status controls rather than accumulating more controls. If links animate, keep the stagger brief and respect reduced motion.

### 8. Distinct chapters in a natural scroll

[FACT] Playground uses large sections, contrasting backgrounds and mandatory vertical scroll snapping with snap-stop: always.

[OPINION] Borrow the chapter structure through color, spacing and composition: water, warm paper, photographic memories, practical details. Keep natural vertical scrolling in OOO, especially on mobile and around long FAQ content. Do not copy mandatory full-page snapping.

## Effects to use cautiously or leave out

- Automatic archive cycling can move content while someone is reading. Prefer manual control.
- Repeated floating photographs, moving gradients and animated background grids would compete with OOO's water.
- Playground has a pointer-reactive portrait wall that changes opacity, grayscale and scale near the cursor. It is an optional reference, not a recommended new OOO section: it needs real approved portraits and a purposeful touch equivalent.
- Do not replace OOO's distinct palette, copy or assets with Playground branding or attendee photos.
- Do not add a second homepage archive alongside the existing timeline. Replace the treatment if the stack is chosen.

## Suggested implementation order

1. Gather approved OOO event photographs; replace placeholders and resolve nonfunctional controls and conflicting event information.
2. Build the postcard archive in place of the homepage timeline.
3. Refine existing scroll reveals and unify button/card feedback.
4. Animate the FAQ and improve navigation beyond the hero.
5. Consider the postcard crossfade only after checking whether the archive already provides enough photographic storytelling.

## Verification before release

Check the affected journey in a real browser at desktop and 390px phone widths. Verify natural vertical scrolling, swipe without blocking page scrolling, keyboard navigation, visible focus, readable inactive/active states, reduced motion, slow/failed media and WebGL failure. Confirm closed sales remain truthful; exact 0x04 date, venue, programme and prices are TBA. Evaluate performance on a modest phone rather than inferring it from framework choice.

--codex

### 2026-09-30 · Reference pass · IMPLEMENTED

[FACT] The header now follows the downloaded Last escape reference: a compact cream pill with the Out of Office mark, an AWAY status link, opt-in sound control, and the pass action. AWAY routes to `#/about` so the deployed site resolves to the existing About page.
[FACT] The homepage mounts the existing Spotify mixtape section after the manual edition carousel. The carousel remains manual, keyboard accessible, swipeable and reduced-motion safe; it uses the shared verified edition data rather than unapproved event photography.
[FACT] `npm run build` and `git diff --check` pass. A browser smoke check confirms the header, About hash route, mixtape iframe and three edition cards render at 390px.

--codex

### 2026-10-01 · Photo showcase · IMPLEMENTED

[FACT] Added `PhotoShowcaseCarousel.svelte` as a separate homepage chapter. It keeps the edition archive for edition navigation and adds the Last escape style for showcasing approved event photos: one active center card, perspective side cards, circular controls and six-position pagination.
[DECISION] The new cards currently use explicit photo placeholders and verified 0x03 metadata. Approved images can be added to the showcase data without changing the interaction or layout.
[FACT] `npm run build` and `git diff --check` pass with no Svelte/Vite warnings.

--codex

## Implementation — 2026-09-30

The owner authorized implementation after this note was saved. The implementation lives on `codex/playground-ux` in a separate worktree.

- Water remains the opening scene, with readable phone copy, opt-in sound, and a still image for reduced motion.
- `EditionArchive.svelte` replaces the homepage timeline with manual stacked cards, previous/next buttons, selectors, keyboard navigation, swipe and edition details. No automatic cycling.
- The intro now explains the gathering; the placeholder Community block and standalone Playlist are no longer mounted. Their files remain archived in the repo.
- Persistent navigation links to introduction, archive and next-event details. A small footer closes the journey.
- Scroll reveals use 14px/550ms; the introduction sequences its copy. Explicit action buttons share subtle hover/press feedback.
- FAQ answers expand/collapse over 250ms and use confirmed 0x04 facts. The old speculative schedule and empty tabs are gone from the homepage.
- Pass actions say “Pass update” while sales are closed. The boarding card is labelled a preview, and dialogs trap/restore keyboard focus.
- Approved event photography is still unavailable. The archive uses original typographic edition artwork; its image slots are ready. Photo crossfades remain deferred rather than rotating stock images or unrelated flyers.

Browser verification results are recorded in the design-room log. Chromium checks passed at 320, 390, 768 and 1440px, including navigation, card controls, keyboard access, FAQ, modal focus, closed sales, reduced motion and WebGL failure. Separate touch checks passed for horizontal card swipes and vertical page scrolling. Live GPU water rendering could not be verified because the automated browser crashed when enabling graphics.

--codex

## Event trail follow-through — 2026-09-30

The owner also requested the event trail fix. `#/trail` now follows the same paper-and-postcard design as the homepage. Past events use shared facts from `src/lib/editions.js` and shared `EditionArtwork.svelte`; future approved photos go in that data file. Unverified flyer assignments, generic About-page “recaps”, and the nonfunctional signup promise were removed.

Each edition has a direct URL (`#/trail/0x01` through `#/trail/0x04`). The desktop edition index becomes a compact sticky row on phones. Jump links position and focus the card below navigation, including when selecting the current hash again. Initial positioning waits for fonts, avoiding shifted deep links on reload. 0x04 shows only confirmed November/TBA status and opens the existing pass-update drawer.

Verification: `scripts/check-trail.mjs` passes at 320, 390, 768 and 1440px, including direct visits/reloads, back/forward, repeat jumps, current-link semantics, keyboard/modal focus, no horizontal overflow, normal motion, and runtime reduced-motion changes. The production build has zero warnings. Browser screenshots are saved locally under `.dump/trail-review/`.

--codex
