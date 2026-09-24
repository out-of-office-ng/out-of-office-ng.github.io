# Out of Office

The site for **Out of Office**, a Lagos hangout series. It's an auto-reply for
real life: a small rebellion against Lagos pressure, with music, art, games,
sunsets and the ocean. The brand story is *leaving yellow Lagos, entering
blue Lagos* (Tarkwa Bay).

- **Live:** https://out-of-office-ng.github.io/
- **v1 archive:** https://out-of-office-ng.github.io/v1/ (the original cube
  site, frozen, with ticket sales closed)

## Where things are

| You want | Go to |
|---|---|
| What we're building, the brand, event facts, decisions and the agent log | [`OOO-0x04-DESIGN-ROOM.md`](OOO-0x04-DESIGN-ROOM.md). **Read this first.** |
| The next version, screen by screen (the "Crossing" deck, documented) | [`docs/design/crossing/SPEC.md`](docs/design/crossing/SPEC.md) |
| The task board | [`TASKS.md`](TASKS.md) |
| The original brand concept | [`concept.txt`](concept.txt) |
| Real flyers, postcards and brand assets | [`docs/brand-reference/`](docs/brand-reference/) |
| Retired branches and what's reusable in them | [`docs/salvage/`](docs/salvage/README.md) |

## Current event

**OOO 0x04, November 2026.** The date and venue are TBA. Ticket sales are
**closed** until they're announced. One switch in
[`src/lib/sales.js`](src/lib/sales.js) controls this: `'closed'` now, then
`'waitlist'`, then `'open'` with real 0x04 tiers. Past events are 0x01–0x03
(see the design room, §2).

## Stack

- Svelte 5 (legacy `export let` syntax) + Vite 8.
- Three.js r185, used for the water scene (`src/lib/shallows/`) and the
  Rubik's cube (`src/lib/RotatingCube.svelte`).
- Hash routes: `#/` home, `#/about` (What We Are), `#/trail` (event trail).
- Fonts are self-hosted in `public/fonts/`.
- Payments go through Paystack Inline. The public key comes from
  `VITE_PAYSTACK_PUBLIC_KEY` (see `.env.example`); it's a CI secret, never
  committed.
- Standalone prototypes served as-is live in `public/`
  (`deepseek_1.html` is "The shallows" water scene; `deepseek_2.html` is an
  earlier variant).

```bash
npm install
npm run dev       # http://127.0.0.1:5173
npm run build     # must finish with zero Svelte warnings
npm run preview
```

## Deploying

Every push to **`main`** deploys the live site
(`.github/workflows/deploy-pages.yml`). The same run also builds the `v1`
branch into `/v1/`. A second workflow syncs `main` into the owner's
portfolio repo under `/out-of-office/`.

Because of that:
- Work on a branch in its own git worktree.
- Get the owner's approval before anything reaches `main`.
- Never push `v1` except for safety fixes.
- Never move the `v1.0` tag.
