# Salvage: retired branches

On 2026-09-24 the old working branches were deleted to clean up the repo.
**Nothing was lost.** Every branch's final commit is kept as an `archive/*`
tag, pushed to GitHub.

To look at one:
- `git log archive/<name>`
- `git show archive/<name>:path/to/file`

To revive one as a branch:
- `git switch -c <name> archive/<name>`

| Archive tag | What it was | Worth reusing |
|---|---|---|
| `archive/claude/kind-noether-fd8k8v` | Unmerged ticket-flow polish from Aug 2026: tiers centralised in one `tickets.js`, shared inclusions list, clearer tier copy, and the boarding-pass CTA routed into the shared drawer | **Yes, for sales step A (real 0x04 tiers).** `tickets.kind-noether.js` in this folder is its `src/lib/tickets.js`. Its `payForTicket()` fails loudly instead of issuing an unpaid pass. The tiers and prices are **0x03's**, so replace them. |
| `archive/claude/restore-phone-card-gm15yv` | Header with a hand-drawn sun/moon SVG theme toggle | Only if dark mode ever returns (it was removed on purpose) |
| `archive/claude/pinterest-link-access-qym76c` | The original Pinterest Rubik's-cube prototype era (old GitHub default branch) | History only |
| `archive/claude_dev`, `archive/gemini`, `archive/gemini_dev` | Earlier parallel agent branches (header redesigns, perf work). Everything in them is already in `main`'s history. | No |
| `archive/overhaul` | Work in progress from before v2: FeaturedShowcase, tappable boat/danfo, EventTrail rework, the v1 link, plus separate city/beach volume stores | Everything except the audio is already in `main`. The volume stores are here if file-based audio ever comes back. |
| `archive/v2` | The v2 integration branch | Already merged. Its one unmerged commit, the D1 design-room entry, was restored into `OOO-0x04-DESIGN-ROOM.md`. |
| `archive/v2-claude-shallows` | Stream B: shallows port and boat easter egg | Already in `main` (later adapted there). Its design-room report was restored. |
| `archive/v2-agy-interactions` | Stream C branch pointer | Already merged |
| `archive/v2-codex-foundation`, `-preview`, `-release`, `-audit` | Stream A foundation, preview, release and audit branches | Already merged |
| `archive/v2-codex-shallows` (local) and `archive/remote/v2-codex-shallows` (GitHub copy, which differed) | Codex's early shallows integration, plus a handoff-log commit | Already merged, except a "Codex Crossing HTML beside DeepSeek" preview commit |

Still live and **not** archived: `main` (the site) and `v1` (served at
`/v1/`, with sales closed). The `v1.0` tag still marks the original v1.
