---
name: beach-event-site
description: Design, build, or review the Out of Office Lagos beach-party website and event journey. Use for its pages, event copy, tickets, archive, water scene, motion, sound, and mobile experience; not for unrelated sites.
---

# Out of Office beach-event site

Make the site feel like an invitation to step away from Lagos and spend time with people. Keep it lively and tactile without making unconfirmed event details look real.

## Ground truth

- Read `OOO-0x04-DESIGN-ROOM.md` and the current components before changing the experience. Follow the owner's latest instruction over older notes. The design-room event table governs edition facts; `src/lib/sales.js` governs whether checkout is open.
- The event history is 0x01 Post-NYSC Hangout, 0x02 Open Canvas, and 0x03 Release and Unwind. The next edition is **OOO 0x04, planned for November 2026**. Its exact date, venue, programme, pass tiers, and prices remain unannounced until the owner supplies them.
- Past flyers in `docs/brand-reference/` can support claims about those past editions. They do not establish 0x04 details. Do not present stock photos, invented attendance figures, testimonials, schedules, transport, or perks as facts.

## Experience rules

- Lead with the feeling of leaving the routine, then make the practical event status easy to find. Use the site's auto-reply voice: warm, dry Lagos humour, short human sentences. Avoid generic luxury-resort language and dashboard-style interface copy.
- Build on the paper/zine vocabulary in the design room: numbered archive, boarding-pass preview, and water arrival. The current page shell may be an experiment; inspect `src/App.svelte` before making layout claims. Brand colours and locally hosted fonts live in `tokens.css` and `src/app.css`; use those tokens before adding new colours or fonts. Preserve the active route and section structure unless the owner requests a redesign.
- Treat beach and boat imagery as the brand's escape metaphor. Do not imply that 0x04 is at Tarkwa Bay, includes a boat ride, or has a specific timetable while its venue and programme are TBA.
- Put the current event month/status, venue status, and ticket status where a phone visitor can scan them. A CTA must lead to a real destination or state. When sales are closed, describe the pass as a preview and never issue a simulated paid ticket.
- Archive cards should identify previous editions accurately. If approved event photos are unavailable, use clearly designed archive art rather than unrelated people presented as attendees. Carousels need visible manual controls, keyboard reachability, and no unpausable autoplay.
- The water scene may provide atmosphere, but the text and controls must remain usable if WebGL, audio, or a remote embed fails. Lazy-load expensive scenes, release resources when removed, and keep a static visual fallback. Do not start sound without a visitor action; respect mute and reduced-motion preferences.
- Design for a phone held outdoors: readable text and contrast in bright light, comfortable tap targets, no hover-only action, no horizontal overflow, and a useful first view before heavy effects load.

## Before calling it done

- Check the build for Svelte/Vite warnings. Walk the home page and `#/trail` in a real browser at phone and desktop widths; include keyboard focus, the carousel, pass drawer, water modes, and a reduced-motion pass when those areas change.
- Report what was verified and what remains unconfirmed. A successful local build is not proof of a live deployment; if deployment was requested, check the workflow and the served page.
- Sign design-room log entries and commit bodies with your agent's tag (`--codex`, `--claude`, or `--agy`). Preserve the `v1` archive. Do not push `main` merely to preview a design; use the branch preview unless the owner asks to deploy.

This skill supplies project-specific decisions. Use Hallmark for a requested visual audit or redesign and the Council Method when reconciling multiple AI proposals; do not copy their full procedures here.
