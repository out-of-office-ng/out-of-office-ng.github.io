# OOO 0x04 — Design Room

> **Shared brief for three design engineers: `--claude`, `--agy`, `--codex`.**
> Read this whole file before touching code. It's written so that an AI
> that has never seen the project can understand what we're building, why,
> and how we work together. Append to the log at the bottom; don't rewrite
> other agents' entries.
>
> Opened 2026-09-24 by --claude. Owner: the human repo owner (joethesaint).
> The owner makes every final call.

---

## 0. The rules of this room (read first)

1. **Sign everything.** Every log entry, every critique, every decision
   proposal ends with your tag on its own line: `--claude`, `--agy` or
   `--codex`. Also put the tag in the body of **every git commit** you make
   (e.g. a last line `--codex`). This is how the owner audits who did what.
   Unsigned work doesn't count as having been discussed.
2. **Critique hard, but only with evidence.** We're here to get the best
   result, not to win arguments or talk each other down. Every critique must
   carry one of these labels:
   - `[FACT]`: verifiable, and say how you checked it (a measured contrast
     ratio, a `file:line`, a build log, a Lighthouse number, a spec clause
     like "WCAG 2.2 SC 1.4.3").
   - `[PRACTICE]`: an established best practice, and name the source (MDN,
     WAI-ARIA APG, web.dev, library docs).
   - `[OPINION]`: taste or judgement. That's allowed, but it's weighed below
     facts, and you should say what evidence would change your mind.

   If you disagree, propose an alternative and state its cost. "This is
   bad" without an alternative isn't a critique.
3. **Don't silently undo another agent's work.** Raise it in the log first,
   with evidence. If the owner or the other agents agree, then change it.
4. **Claims about the code must be checked against the code.** Never
   describe a file you haven't opened. If you ran something, say so. If you
   didn't, say "not verified".
5. **Honesty in content.** Don't invent stats, testimonials, photos, dates
   or prices and present them as real. Stock photos are placeholders until
   they're replaced. Event facts come only from the owner (section 2).
6. **Git safety.**
   - Work on branches cut from `v2`, named `v2-<agent>-<topic>` (e.g.
     `v2-codex-tokens`).
   - **Never push to `main`.** Pushing to `main` deploys the live site
     (GitHub Pages) and syncs the owner's portfolio repo.
   - Never touch the `v1` branch or the `v1.0` tag: they're the frozen
     archive served live at `/v1/`.
   - No force-pushes and no history rewrites on shared branches.
   - Merging into `v2` needs a green build and a signed log entry.
7. **Quality bar for merging into `v2`.**
   - `npm run build` passes with **zero** Svelte/Vite warnings. `v2`
     currently builds clean, so keep it that way.
   - You checked it in a real browser and noted how (screenshot,
     Playwright script, manual).
   - Keyboard and screen reader reachability are kept.
   - `prefers-reduced-motion` is respected.
   - Works at 390px wide with no horizontal page scroll.
8. **Scratch files.** Owner notes and throwaway material live in `.dump/`
   (gitignored). Read them for background, but this file is the source of
   truth. If they conflict, this file wins; if this file is wrong, fix it
   here with a signed log entry.

---

## 1. What Out of Office is

**Out of Office** is a Lagos hangout series. The brand is an auto-reply for
real life: *"I am currently away from emails, responsibilities, and Lagos
stress. I will return when my soul battery is charged."*

It isn't a luxury holiday. It's a small, temporary rebellion against Lagos
pressure: traffic, hustle culture, the economy, relentless notifications,
"when are you getting married?". People come for music, art, board games,
shared snacks, sunsets, and conversations you still remember on Monday. No
hierarchy, strangers becoming friends.

**The central metaphor: leaving yellow Lagos, entering blue Lagos.**
- *Yellow Lagos*: danfo buses, chaos-yellow `#FFC72C`, traffic red,
  concrete grey, notification noise.
- *Blue Lagos*: Tarkwa Bay, reached by a ~15-minute boat ride from the
  Marina jetty. Ocean, sand, slower time.

The original concept notes (`concept.txt`, tracked in the repo) describe the
website as a journey: a desktop drowning in Slack/WhatsApp/calendar popups →
"OUT OF OFFICE activated" → everything fades → ocean sound → a boat crosses →
you arrive at Tarkwa Bay. Note that `concept.txt` explicitly says *"Instead
of a Rubik cube"*. The cube that later became the v1 hero was a detour from
that original idea.

**Voice:** auto-reply language, dry Lagos humour, warm, never corporate.
Examples already on the site: "Gone to touch grass. Back soon." · "Auto
replies enabled. Stress disabled." · "Your ticket out of yellow Lagos."

**Visual world:** zine/print. Boarding passes, passport stamps, polaroids,
marker script, paper grain, postcards. Tactile and analog. We deliberately
removed SaaS furniture (toasts, ⌘K palette, dark-mode toggle, audio mixer),
because a site about escaping screens shouldn't look like a dashboard.

---

## 2. The event we're selling: OOO 0x04 (November 2026)

| # | Name | Where | When | Status |
|---|---|---|---|---|
| 0x01 | The Post-NYSC Hangout | Tarkwa Bay Beach | Apr 11, 2025 · 12pm till daybreak | done |
| 0x02 | Open Canvas | Jaekel House Garden | May 30, 2025 | done |
| 0x03 | Release and Unwind | Tarkwa Bay Beach | Aug 15–16, 2026 · overnight beach camp | done |
| **0x04** | **TBA** | **TBA** | **November 2026, exact date TBA** | **up next: this site's job** |

Rules for 0x04 content:
- The number is **0x04** / "No. 04". Some owner notes still say "No. 03".
  That's stale, so correct it wherever you see it.
- Say "November" but **no exact day** until the owner gives one.
  `EVENT_DATE` in `src/App.svelte` switches the countdown on when it's set.
- Venue, tiers and prices for 0x04 are **not known yet**.
- ⚠️ **Open blocker:** the live Paystack checkout (live key) still sells
  0x03's tiers (₦15,000 Explorer / ₦20,000 Retreat, with Tarkwa Bay tent
  perks). They're only relabelled "0x04 · Date TBA" on `v2`. **Nobody ships
  v2 until the owner decides:** real 0x04 tiers, a free waitlist, or
  purchases turned off.

---

## 3. The codebase: facts as of `v2` @ `8795bf5`

**Stack:**
- Svelte 5 (`^5.56`) with legacy `export let` syntax throughout. Keep to
  it; don't mix in runes piecemeal.
- Vite 8, `three@^0.185.1`.
- Hash routing (`#/`, `#/about`, `#/trail`), with no router library.
- Fonts are self-hosted in `public/fonts/`: Fraunces, Space Grotesk,
  Fredoka, Bungee, Permanent Marker, Back Wild. Don't add Google Fonts
  links.

**Deploy:**
- `.github/workflows/deploy-pages.yml`: every push to `main` builds the
  root site **and** builds the `v1` branch into `/v1/`.
- The live site is https://out-of-office-ng.github.io/, and v1 is archived
  at https://out-of-office-ng.github.io/v1/.
- A second workflow syncs `main` into the owner's portfolio repo under
  `/out-of-office/`.

**Branches:**

| Branch | What it is |
|---|---|
| `main` | Live site = v1 (Paystack, countdown, cube hero) plus the `/v1/` workflow |
| `v1` / tag `v1.0` | Frozen v1 archive |
| `v2` | The redesign. **All our work branches from here.** |
| `overhaul` | Old work-in-progress branch, already merged into `v2` except its audio |
| `origin/claude/kind-noether-fd8k8v` | Unmerged ticket-flow polish (shared `tickets.js`, clearer tier copy). Useful once 0x04 tiers exist. |

**What `v2` already did** (see `TASKS.md` → P5):
- **Removed:** CommandPalette, the toast system, AudioControlDeck,
  ScrollToTop, dark mode/`theme.js`, and the cube's own mini-modal.
- **Feedback is inline:** field errors, "Copied ✓".
- **Header has 4 controls:** brand · ONLINE/AWAY · mute · OOO PASS →.
- **`src/lib/calm.js`:** one 0..1 value = max(page scroll, AWAY toggle).
  Toggling AWAY bursts the chaos popups, drains the notification pill and
  the stress meter, solves the cube, flips `MorphText` eyebrows to
  handwriting, and crossfades the audio.
- **0x03 is marked done** on the trail and timeline; 0x04 is "up next".
- **The hero** shows "OOO 0x04 · Up next" with a "Date TBA" chip.
- **The Lagos Survival Stats easter egg** is a click on the stress meter.
  The cube's 10-click easter egg opens the one auto-reply generator.
- **From `overhaul`:** the FeaturedShowcase 3D carousel (**placeholder
  content**), tappable boat/danfo, full-bleed EventTrail cards, and a "v1 →"
  link on `#/about`.
- The build has zero warnings.

**Component map (`src/lib/`):**

| Group | Components |
|---|---|
| Hero (v1-era) | `RotatingCube` (Three.js 27-cubie, scroll-solves), `ChaosLayer` (10 popup cards), `DanfoBus`, `Boat` (SVG), `StressMeter`, `ZineDecorations`, `FooterBar` |
| Page sections | `Postcard`, `EscapeMetrics`, `Community` (polaroids, currently **Pexels stock photos**), `MemoryTimeline` (stamps), `FeaturedShowcase`, `Playlist`, `Tickets` (boarding pass), `ScheduleFAQ` |
| Overlays | `RsvpDrawer` (3-step Paystack claim), `OooGeneratorModal` |
| Routes | `AboutEvent` + `AsciiFire` (`#/about`, a deliberately dark bonfire page), `EventTrail` (`#/trail`) |
| Plumbing | `BootSequence` (plays once per session; ends with a rising wave), `AmbientSound` + `ambientSound.js` (file-based audio + the `muted` store), `MorphText` (corporate→handwritten eyebrows), `ScrollReveal`, `scrollProgress.js`, `motion.js` |

**Assets:**
- Real event flyers and postcards are in `docs/brand-reference/`.
- **There are no real event photos in the repo yet.** The owner needs to
  supply them.
- `public/audio/beach-waves.m4a` is 181 MB, untracked and gitignored.
  Never commit it: GitHub rejects files over 100 MB.

---

## 4. Where we're going: "The Crossing" (--claude's proposal, open for critique)

Two notes from another AI (now in `.dump/`) explored replacing the hero with
a WebGL water scene, **"The shallows"** (`deepseek_1.html` in the repo root,
untracked, ~1,700 lines, Three.js). Its first idea put the water in the
hero. Its second moved the water to the end of the page as the destination,
reasoning that the water in frame one skips the journey `concept.txt`
describes. I agree with the move to the end. Below is my synthesis, which
isn't the same as either note.

**Big idea:** the page is the 15-minute boat ride. You start on dry paper
land at the jetty, and each section is a stretch of the crossing. The
boarding pass is the last thing on land, and then you're in the water.
Scroll is the journey, and the shallows are the arrival.

| # | Stretch | Section | Notes |
|---|---|---|---|
| 0 | The noise | `BootSequence` (once per session) | Keep. This is where "Scene 1: the notification desktop" from `concept.txt` lives: a short chaos → "auto-reply activated" beat. |
| 1 | The jetty | New **paper hero**: "OUT *of* OFFICE", "No. 04 · November", tagline, "Date TBA" chip, CTA → boarding pass | Plain HTML/CSS, which makes it the LCP element. No WebGL at the top. A small hint that there's water at the end (e.g. "The shallows wait at the end ↓"). |
| 2 | Leaving | The auto reply (`EscapeMetrics`) | Stats must be obviously playful or real (rule 5). |
| 3 | Looking back | **Previous escapes**: one carousel, **real photos from 0x01–0x03 only** | Merge `FeaturedShowcase` and the proposed "BeachCarousel" into one component. Delete the other. |
| 4 | Stamps | `MemoryTimeline` (0x01–0x03 done, 0x04 up next) | Already correct on `v2`. |
| 5 | Soundtrack | `Playlist` | Keep. |
| 6 | Last thing on land | `Tickets` (boarding pass) → `RsvpDrawer` | Waits on the Paystack decision (section 2). |
| 7 | Arrival | **`ShallowsScene`**: full viewport, lazy-mounted, intro card "Out of office / No. 04 · The shallows." plus a secondary "Claim your pass" CTA | The payoff. Closing line: "Leaving yellow Lagos. Entering blue Lagos." |
| — | Always | Header (brand · status · mute · OOO PASS →) | OOO PASS stays the always-reachable conversion path. The design must not depend on people reaching the bottom of the page. |

**What happens to the v1-era hero pieces** (proposal): `RotatingCube`
(hero use), `ChaosLayer`, `DanfoBus`, the SVG `Boat`, `StressMeter`, the
cube companion, the "Activated" section, and the 150vh scroll pin all leave
the hero. The shallows takes over their jobs:
- The water's wave envelope ("restless sets, then still lulls") replaces
  the stress meter, without any extra UI.
- The pink paper boat in the water replaces the SVG boat.
- Arriving at the water is the "activated" moment.

**The ONLINE/AWAY toggle becomes the "chaos rain" (from the owner's
notes):**
- The default is **AWAY**: the site is calm, because you're out of office.
- Flipping to **ONLINE** rains ~6 notification cards (WhatsApp from the
  boss, Slack incident, compliance email, 15-minute sync, GTBank debit
  alert, low battery) over whatever you're looking at.
- Clicking a card bursts it, and flipping back to AWAY bursts them all.
- **If you leave it ONLINE for ~8 s, the site mutes the chaos itself and
  flips back to AWAY**, with the status note "Auto-reply re-enabled." The
  auto-reply always wins.
- Chaos yellow and red then appear **only** inside this rain, so the palette
  itself tells the story.
- `ChaosLayer`'s card content and burst animation can be reused. `calm.js`
  either shrinks to the scroll-driven `MorphText` progress or goes entirely;
  argue it out in the log.

**Palette: shift the whole site to the water palette, with the contrast
failures fixed.** The water's colours become the site's tokens in
`src/app.css`. These are measured with WCAG relative luminance
`[FACT computed by --claude]`:

| Token (proposed) | Value | On paper `#f2f0e9` | Allowed use |
|---|---|---|---|
| `--bg` paper | `#f2f0e9` | — | page |
| `--ink` deep-water ink | `#243e3c` | 10.07:1 ✅ | all text |
| `--deep` | `#376a65` | 5.40:1 ✅ | text, buttons (paper text on it: 5.61:1 ✅) |
| `--seafoam` | `#7aaea8` | **2.18:1 ❌** | **fills and decoration only, never text** |
| `--boat` pink | `#d45a82` | 3.30:1 | large text (≥24px, or ≥18.66px bold) and decoration only |
| muted ink | `#243e3c` at ≥0.75 alpha (`#586a67`) | 5.01:1 ✅ | secondary text. **0.62 alpha measures 3.53:1 and fails** |

For comparison, today's `--blue` `#00bfff` on cream measures 1.93:1, so the
current eyebrows already fail SC 1.4.3. The proposed notes used seafoam
eyebrow text; that's rejected on contrast.

**Porting "The shallows" (`deepseek_1.html` → `src/lib/ShallowsScene.svelte`):**

What to keep in the scene:
- **The layer/refraction composite.** The final pass renders only sky and
  water; boat, fish and rocks come through the refraction render target,
  composited by a depth test in the water shader. **Don't "fix" this by
  adding objects to the visible layer.**
- The procedural WebAudio ocean, synced to the surf fronts. It replaces
  file-based beach audio completely.
- The safeguards: dynamic resolution with a pixel budget, pausing on
  `visibilitychange` and `IntersectionObserver`, WebGL context-loss
  handling, `pagehide`/bfcache disposal, and reduced-motion (paused by
  default, but input still renders single frames).

Required changes:
1. **Remove the custom wheel zoom.** It calls `preventDefault` on `wheel`,
   which stops page scrolling while the cursor is over a full-viewport
   section. Orbit is drag-only.
2. **Touch.** `[FACT]` Three's `OrbitControls.connect()` sets
   `domElement.style.touchAction = 'none'`
   (`node_modules/three/examples/jsm/controls/OrbitControls.js:508`, r185),
   so you **must set `touch-action: pan-y` after creating the controls**.
   Otherwise the page can't be scrolled past the scene on phones.
   Horizontal drag orbits, vertical swipe scrolls, and a tap makes a
   ripple.
3. **Bundle Three locally.** Drop the importmap and the unpkg
   `three@0.160.0`; use `import * as THREE from 'three'` (the repo is on
   r185, which is already a shared `three-vendor` chunk). The scene patches
   shader chunks (`colorspace_fragment`, `tonemapping_fragment`), so
   **verify it renders on r185**. That's not verified yet.
4. **Remove the demo UI:** the toolbar, the quality picker (quality stays
   on `auto`), `body[data-mode]`, `#preview-copy`, and `hideIntroOnce`. The
   intro card stays, because it holds a CTA. Only the hint line fades.
5. **Sound follows the shared `muted` store** in `ambientSound.js`. The
   `AudioContext` only starts after a user gesture, and only while the
   scene is in view.
6. **Mount lazily:** dynamic `import()` when the section comes within ~1
   viewport (`IntersectionObserver` with a `rootMargin`). The section's CSS
   gradient (`#dce7df → #7aaea8 → #376a65`) is both the loading state and
   the no-WebGL fallback. A "The water is loading…" line replaces
   `#notice`.
7. **Fonts:** Georgia → Fraunces, system-ui → Space Grotesk. The canvas is
   `aria-hidden`, and the intro card carries the real text.
8. **Keep only one WebGL scene running at a time.** If the cube survives
   anywhere, it must stop rendering while the shallows are on screen.

**The cube: open question, and --claude's lean.** A docked 10-click cube
companion would keep a second WebGL renderer alive on every page. My lean:
retire the cube from default view and **move the 10-click egg to the pink
paper boat** in the shallows (tap it 10 times → the auto-reply generator).
The boat is the auto-reply in physical form. The risk is that taps also make
ripples; the boat needs hit-testing so it doesn't double-fire. Critique
welcome.

**Audio:**
- Delete `AmbientSound.svelte`'s file-based beds and any need for
  `public/audio/`.
- **Don't autoplay city noise.** `[PRACTICE]` Browsers block audio
  autoplay without a user gesture (MDN "Autoplay guide"), and ambient
  street noise on a calm-brand site is questionable in its own right.
- The mute button stays, as the single control shared with the scene.

---

## 5. Open decisions (owner decides, agents argue with evidence)

| ID | Question | Options | Status |
|---|---|---|---|
| D1 | 0x04 tickets | real tiers / free waitlist / off | **open: blocks shipping** |
| D2 | Water placement | end-of-page destination (proposed) / hero / whole page | leaning end, per owner notes |
| D3 | Palette | site-wide water palette with the contrast fixes above (proposed) / hero only | leaning site-wide |
| D4 | The cube | retire + boat egg (--claude lean) / docked companion / remove fully | open |
| D5 | Default status | AWAY with chaos rain on ONLINE (proposed) / keep today's ONLINE→AWAY calm | leaning AWAY + rain |
| D6 | Carousel | one "Previous escapes" component: port the owner's BeachCarousel logic vs keep `FeaturedShowcase` | open, needs a code review from both sides |
| D7 | Real photos | owner to supply 0x01–0x03 photos; stock stays placeholder only | waiting on owner |
| D8 | `EscapeMetrics` / Survival Stats numbers | label them clearly as jokes / replace with real numbers / cut | open |

---

## 6. Workstreams (proposed split; the owner may reassign)

Claim a stream by signing a log entry. Each stream lands as its own branch
from `v2`.

- **A · Foundation (proposed: --codex)**
  - Token swap in `app.css` with contrast-checked values (section 4 table).
  - Restructure `App.svelte` into the Crossing order.
  - The new paper hero.
  - Remove the orphaned hero components (per D4/D5).
  - Delete dead code.
  - Keep BootSequence.
- **B · The shallows (proposed: --claude)**
  - Port `ShallowsScene.svelte` per the 8 required changes.
  - Lazy mount, fallback and loading state.
  - Audio on the `muted` store.
  - Test the performance and mobile touch behaviour.
- **C · Interactions & content (proposed: --agy)**
  - Chaos rain + the status toggle rework.
  - Carousel consolidation (D6).
  - Boat or cube easter egg (D4).
  - 0x04 copy pass (No. 04, November).
  - Ticket flow once D1 is decided (consider `kind-noether`'s `tickets.js`).

Streams touch each other at `App.svelte`, `app.css` and `HeaderBar.svelte`.
**Stream A owns `App.svelte` structure and `app.css` tokens.** The others
make small, clearly signed edits there, or ask A.

**Definition of done for the whole redesign:**
- Zero-warning build.
- Lighthouse run on mobile with numbers posted in the log (no LCP
  regression from WebGL).
- Keyboard-only walkthrough of the whole page.
- Reduced-motion walkthrough.
- 390px and 1440px screenshots.
- The Paystack decision implemented.
- `TASKS.md` updated.
- The owner approves before anything goes to `main`.

---

## 7. What's in `.dump/` (background only, gitignored)

- `suggestion-not-compulsory.txt`: owner-shared AI notes. Answers the four
  earlier decisions (site-wide palette, chaos rain, water at the end,
  carousel as "Previous escapes"). Includes a full HTML preview of that
  direction, with CSS stand-in water and the owner's carousel logic.
- `ideas`: the first AI review of "The shallows". Water in the hero, a list
  of code strengths, and the port deltas. Superseded by the water-at-the-end
  direction.
- `changes-to-be-iscarded-after.txt` / `commit_instructions.txt`: the v2
  strip-down spec. It's already implemented on `v2`, and the two files are
  near-identical.
- In the repo root, still untracked: `deepseek_1.html` (the shallows
  source, the one to port) and `deepseek_2.html` (an earlier "Take a
  moment" variant: cream boat, no wave sets, generic copy; not chosen).

---

## 8. Log

Append new entries at the bottom, newest last. Format:

```
### YYYY-MM-DD HH:MM · <topic> · <PROPOSAL | CRITIQUE | DECISION-REQUEST | DONE | QUESTION>
<body with [FACT]/[PRACTICE]/[OPINION] labels where you make claims>
--<agent>
```

### 2026-09-24 · Room opened · PROPOSAL
I opened this room and wrote sections 1–7 from the owner's notes and from
reading the code on `v2` @ `8795bf5`.

- The contrast ratios in section 4 were computed with the WCAG 2.x relative
  luminance formula.
- The `OrbitControls` touch-action line was read from the installed r185
  source.
- The shallows port on r185 has **not** been test-rendered yet.
- "The Crossing" (section 4) is my proposal, not a decision. I'd most like
  challenges on D4 (moving the easter egg to the boat) and on whether the
  chaos-rain auto-mute timing (8 s) is right.

I'm proposing to take stream B.
--claude
