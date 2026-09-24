> **⚠️ Superseded (2026-09-24).** This handoff describes the 2026-07 site:
> the cube hero, cube mini-modal and the dark/light theme toggle, all since
> removed or reworked. It's kept as design history only. For current
> direction and decisions, see `OOO-0x04-DESIGN-ROOM.md` in the repo root.

# Handoff: Out of Office — header/UX copy revisions + cube interactions

## Overview
This handoff covers targeted revisions on top of the existing `out_of_office` Svelte site (repo: `joethesaint/out_of_office`, branch `claude/pinterest-link-access-qym76c`): a header redesign (killed an Olympic-rings-looking mark and flight-board-style copy) and a set of cube interactions (click easter egg, idle sleep mode, drag-to-spin, cursor parallax) that the live README/TASKS.md flagged as never implemented.

## About the design file
`Out of Office.dc.html` in this folder is a **design reference**, built as a single self-contained HTML prototype — not production code to copy in verbatim. It recreates the real site's structure (HeaderBar, FooterBar, BootSequence, hero, ChaosLayer, DanfoBus/Boat, RotatingCube, and the six content sections) in plain HTML/inline-CSS/JS so the visual/interaction changes below could be iterated on quickly. **The actual implementation should happen in the existing Svelte codebase**, editing the real `.svelte` components — not by dropping this HTML file in.

## Fidelity
High-fidelity for layout, copy, and color — this prototype was built by reading every source file in the real repo (`src/App.svelte`, all of `src/lib/*.svelte`, `src/app.css`) and matching spacing, fonts, and hex values exactly.

**One explicit exception: the cube is a placeholder.** The real site's cube (`src/lib/RotatingCube.svelte`) is a 27-cubie Three.js Rubik's cube with real layer twists, a scramble→solve animation queue, glossy `MeshPhysicalMaterial`, and baked-gradient tile textures. This prototype's cube is a 6-face CSS 3D `transform-style: preserve-3d` box — it has no twist mechanics or true cubie structure. It's there only to prove out the **interaction logic** (click counter, idle timer, drag deltas, pointer parallax) design so it can be ported into the real Three.js component. Do not copy the cube's visual construction; do port the interaction logic described below.

## Changes in this handoff

### 1. Header redesign (`src/lib/HeaderBar.svelte`)
**Problem:** the right-hand "ooo" logomark used three overlapping stroked circles (blue/teal/black) that read as the Olympic rings, not a brand mark. The center block's copy ("NOW ACTIVE" tag / "ESCAPE" headline / "LAGOS TO TARKWA" subhead) read like a flight-departure scoreboard or event/competition name, disconnected from the rest of the site's voice.

**Fix:**
- Replace the three-circle SVG mark with a single small solid dot (`#d9a441`, ~8px, `border-radius:50%`) next to the existing "ooo" wordmark — reads as an "away" status indicator, consistent with `HeaderBar`'s own "STATUS: AWAY" block on the left.
- Change center-block copy to:
  - eyebrow tag: `AUTO-REPLY` (was `NOW ACTIVE`)
  - big word: `ENABLED` (was `ESCAPE`)
  - subhead: `MAINLAND → ISLAND` (was `LAGOS TO TARKWA`)
- Rationale: this now echoes `FooterBar.svelte`'s existing copy ("AUTO REPLY ENABLED") and the brand's own mainland/island framing from `concept.txt`, instead of inventing a fourth voice.

No layout/sizing changes — same three-block flex strip, same `clamp()` type scale.

### 2. Cube interactions (`src/lib/RotatingCube.svelte`)
Four interaction behaviors, all specified in `concept.txt` and tracked as unclaimed in `TASKS.md` (P1 section) — port the **logic**, not the CSS-cube visuals, into the real Three.js component:

**a. Click-to-reveal Auto-Reply Generator (10 clicks)**
- Maintain a click counter on the cube's pointerup (only counts as a "click" if pointer moved <3px from pointerdown — i.e. distinguish click from drag-release).
- At 10 clicks: reset counter to 0, open a modal dialog (`role="dialog" aria-label="Auto-Reply Generator"`), scoped to the cube's own stage container (`position:absolute; inset:0` on the cube stage, not `position:fixed` on the viewport).
- Modal shows one quote from a fixed array (pick a random index on open), a "Shuffle Reply" button (cycles to next quote), a "Copy" button (writes to clipboard via `navigator.clipboard.writeText`, button label flips to "Copied ✓" for ~1.8s), and a close (✕) button.
- Quote pool used in the prototype (safe to reuse or replace):
  1. "I'm currently unavailable. I'm at the beach pretending my problems don't exist."
  2. "Auto-reply active: gone to touch grass. Back soon."
  3. "Currently out of office and out of Wi-Fi range. Emotionally, too."
  4. "Status: away. Soul battery charging. Do not disturb."
  5. "I have left the group chat of adult responsibilities. Temporarily."

**b. Idle/sleep mode (5s inactivity)**
- Track global activity: `mousemove`, `touchstart`, `scroll`, `keydown` all reset a 5s timer.
- On timeout with no activity: cube enters "sleeping" — dim opacity to `0.55`, dampen auto-tumble amplitude to ~15% of normal, add a slow breathing `scale()` oscillation (±3% around 1.0), and show a small "zZz" label near the cube's top-right corner (`color: var(--blue)`, `font-family: var(--display)`, faint).
- Any activity immediately clears sleep state and resumes normal tumble.

**c. Drag-to-spin**
- `pointerdown` on the cube: capture the pointer (`setPointerCapture`), record start X/Y and current drag-offset rotation.
- `pointermove` while dragging: compute delta from start, apply as additional rotation (`rotationY += dx * 0.4`, `rotationX -= dy * 0.4` scaled to your unit system) on top of the auto-tumble/solve rotation — additive, not replacing.
- `pointerup`: end drag; if the pointer never moved >3px, treat it as a click (feeds into 2a's counter) instead of a drag.

**d. Cursor parallax (when idle and not dragging)**
- Compute pointer position normalized to the cube's bounding box, range -1..1 on each axis.
- Apply a small additive rotation offset (±6° max) so the cube subtly leans toward the cursor — disabled while dragging or sleeping.

## Design tokens (unchanged — reference only)
- `--bg:#f6f4f1` `--ink:#181818` `--blue:#00bfff` `--pink:#fc9ce0` `--pink-deep:#e0568f` `--accent:#08cabd`
- `--chaos-yellow:#ffc72c` `--chaos-red:#e5383b` `--sunset-orange:#ff7b4d` `--warm-sand:#e8c9a0` `--muted-green:#7c9473`
- Fonts: Fredoka (display), Space Grotesk (sans/body), Bungee (tags/stamps), Permanent Marker (handwritten), Fraunces (serif/event names) — all already self-hosted in `public/fonts/` in the real repo.
- New color introduced: `#d9a441` (muted amber, the new header status dot) — small enough to hardcode inline rather than add as a CSS variable, but add one if it's reused elsewhere.

## Assets
No new assets — reuses the real repo's existing flyer images (`docs/brand-reference/`) and self-hosted fonts. Nothing to source.

## Files
- `Out of Office.dc.html` — the full-site HTML prototype referenced above. Open directly in a browser; it's self-contained except for font/image paths, which assume it sits at the real repo's root (`public/fonts/...`, `docs/brand-reference/...`).
