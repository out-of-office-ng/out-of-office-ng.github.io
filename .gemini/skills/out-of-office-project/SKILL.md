---
name: out-of-office-project
description: Project context and repository workflow for the Out of Office Lagos Svelte site. Use when editing or discussing this repository; load the beach-event-site skill for its event experience and content rules.
---

# Out of Office — project context

This is a Svelte 5 + Vite + Three.js site for a Lagos gathering series. Its live page is served from `main` at `https://out-of-office-ng.github.io/`; the frozen older site is on `v1` and at `/v1/`. Pushing `main` also syncs the owner's portfolio, so treat a deployment request as a separate action from an ordinary edit.

## Start from the checkout you actually have

- Check `git branch --show-current`, `git status`, and the current remote state before editing. This is a shared workspace: another agent may move a branch or edit a file while you work. Preserve uncommitted work; use a separate worktree when needed.
- Read `OOO-0x04-DESIGN-ROOM.md` for the current brief and decision log. Inspect `src/App.svelte` and the affected components before describing the active layout. Earlier versions used a scroll-pinned cube and phone-shaped card; those are **v1 history, not a standing rule for the current site**.
- Use [the shared beach-event skill](../../.agents/skills/beach-event-site/SKILL.md) for event facts, copy, beach imagery, tickets, mobile behaviour, motion, sound, and review checks. It applies across the current design experiments without fixing one layout in advance.

## Repository facts that remain useful

- Hash routes use `#/`, `#/about`, and `#/trail`. The current sales switch is `src/lib/sales.js`; read it before changing any pass or checkout entry point.
- Brand tokens are in `tokens.css` and `src/app.css`. Fonts are served from `public/fonts/`; do not add a font CDN to recreate the existing typography.
- `docs/brand-reference/` contains flyers for **past** events. They are not evidence for OOO 0x04's venue, date, tiers, or prices.
- `.github/workflows/deploy-pages.yml` builds the root site and the `v1` archive. `.github/workflows/deploy-to-portfolio.yml` syncs a `main` build to the portfolio. Keep the archive intact.

## Finish the scoped work

Run checks appropriate to the change. For UI work, verify the affected flow in a real browser at phone width and desktop width, then report what ran. Re-fetch before a push, review new commits, and reconcile conflicts intentionally; do not automatically stash, pull, or discard another agent's edits. Sign design-room entries and commits with your own agent tag.
