# OOO 0x04 — lean site rules

> Owner direction, 2026-09-24: keep this a beach-party invitation, not a software product. This is the scope guard for the current redesign. The owner can change it; an agent cannot quietly expand it. Read with `OOO-0x04-DESIGN-ROOM.md` and check the current code before editing.

## The job

As a visitor scrolls on a phone, they should feel the escape, understand what Out of Office is, see evidence of previous gatherings, learn what is actually known about 0x04, and find the next honest action. Every section or control must serve at least one of those jobs. A feature that is only clever, gamified, or visually busy is not enough reason to keep it.

## Locked for this phase

1. **One journey.** Lead with the water/beach arrival, then a short human explanation, one clear view of past editions, practical 0x04 details, and a pass-status CTA. A simple footer can close it. Do not stack a second hero, multiple archives, or repeat the same pitch in several sections.
2. **A party site, not an app.** Keep the printed/zine voice and visual devices where they help recognition. The interface should feel like an invitation, not a dashboard. A simple brand link, navigation, and pass-status link are enough for the header.
3. **Truth beats conversion theatre.** OOO 0x04 is planned for November 2026. Exact date, venue, programme, tiers, and prices are TBA. Sales remain closed in `src/lib/sales.js`. A boarding pass is a preview, never an issued ticket. Past flyers and beach imagery do not establish a 0x04 venue or boat route.
4. **One atmospheric centrepiece.** The water scene may carry the emotional weight. Do not add another always-running 3D scene, a competing animation system, or autoplay sound. The words and next action must remain usable on a phone if the scene fails or loads slowly.
5. **Every control must earn its place.** It needs a visitor-facing purpose, a working result, and an accessible state. Prefer a direct link or one clear button over a drawer, mode, badge, or game mechanic. New features should replace something when they serve the same job, not accumulate beside it.

## Parked, not to be reintroduced by an agent

- Command palette, toast stack, dark-mode/theme switch, audio mixer, productivity dashboard chrome, notification counters, stress meters, fake analytics, onboarding sequence, and achievement/unlock mechanics.
- ONLINE/AWAY as a site-wide simulation, chaos popups, extra easter eggs, and a second interactive renderer. They may be pitched as isolated ideas, but stay out of the lean page until the owner explicitly brings one back.
- More than one past-events component at a time. Use a single archive treatment; choose carousel **or** timeline if both are proposed.
- Stock people photos presented as OOO attendees, made-up testimonials or numerical results, fabricated schedules, transport, perks, prices, and fake paid-pass fallbacks.

Existing files may still contain parked experiments. Their presence in the repo is not approval to wire them into the page. Do not delete archived components solely because they are parked.

## Supporting content: include only if it adds distinct value

- **Community:** use real approved photos or concise, truthful copy. If it repeats the archive or the introduction, fold it into one of them.
- **Playlist:** keep only if it is an intentional part of the party invitation and the embed/link works on mobile; it must not block or delay the page.
- **Auto-reply generator:** a small optional extra after the core journey works, never a required step to understand or access 0x04 information.
- **FAQ:** answer real visitor questions about current status. Do not fill unknowns with imaginative logistics.

These are review choices, not permission to add all four. Show the owner what each contributes before keeping it.

## Change and review rule

Before adding a section or control, state which core job it serves, what existing element it replaces or why the page needs both, and what the visitor sees on a 390px phone. If it changes the locked journey or revives a parked item, put a signed proposal in the design room and wait for the owner's direction. Otherwise implement within scope and verify the affected path in a real browser, including keyboard access, reduced motion, slow/failing media, and the closed-sales state.

**Current evidence:** Agy's `4b21f7f` reduced `src/App.svelte` to a water-led hero plus Postcard, Playlist, MemoryTimeline, FAQ, and Tickets; `ab7eea8` later restored Community. There is no `.mmd` file in the workspace or tracked Git history. This document records the owner's lean direction and makes the boundary explicit; it does not claim to transcribe a missing diagram.

--codex
