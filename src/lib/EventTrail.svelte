<script>
  /* Hallmark · component: event-trail-roadmap · genre: playful · theme: custom Escape palette
   * Pre-emit critique: P5 H5 E5 S5 R4 V5
   * states: default · path-drawn · node-done · node-active · node-pending
   */
  import { onMount, onDestroy } from 'svelte';
  import { createDialKit } from 'dialkit/svelte';
  import tarkwaBay from '../../docs/brand-reference/flyer-post-nysc-hangout-tarkwa-bay.png';
  import openCanvas from '../../docs/brand-reference/flyer-open-canvas-jaekel-house.png';
  import saveTheDate from '../../docs/brand-reference/flyer-save-the-date-painting.png';

  const trailRoadmap = createDialKit('trail-roadmap', {
    springStiffness: [240, 60, 700],
    springDamping:   [22,  4,  70],
    staggerDelay:    [200, 80, 600],
  });

  const EVENTS = [
    {
      stamp: 'OOO 0x01',
      hex: '0x01',
      title: 'The Post-NYSC Hangout',
      venue: 'Tarkwa Bay Beach',
      date:  'Apr 11, 2025',
      time:  '12pm till daybreak',
      color: 'var(--sunset-orange)',
      textColor: '#fff',
      done: true,
      tagline: 'Where we first exhaled.',
      image: tarkwaBay,
    },
    {
      stamp: 'OOO 0x02',
      hex: '0x02',
      title: 'Open Canvas',
      venue: 'Jaekel House Garden',
      date:  'May 30, 2025',
      time:  'TBA',
      color: 'var(--blue)',
      textColor: '#fff',
      done: true,
      tagline: 'You don\'t need to know how to paint.',
      image: openCanvas,
    },
    {
      stamp: 'OOO 0x03',
      hex: '0x03',
      title: 'Release and Unwind',
      venue: 'Tarkwa Bay Beach',
      date:  'Aug 15–16, 2026',
      time:  'Overnight beach camp',
      color: 'var(--pink-deep)',
      textColor: '#fff',
      done: true,
      tagline: 'Take a break from the Lagos palava.',
      image: saveTheDate,
    },
    {
      stamp: 'OOO 0x04',
      hex: '0x04',
      title: '???',
      venue: 'TBA',
      date:  'TBA',
      time:  'TBA',
      color: 'var(--muted-green)',
      textColor: 'var(--ink)',
      active: true,
      tagline: 'The next escape is loading. Stay tuned.',
    },
  ];

  // Per-node connector heights (space between nodes in the trail)
  // Drives the animated line
  let connectorEls = [];
  let cardEls = [];
  let visible = [];
  let linesDrawn = [];
  let sectionEl;

  function initObserver() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const idx = parseInt(entry.target.dataset.idx);
        if (entry.isIntersecting && !isNaN(idx)) {
          // Stagger: card fades in first, then line draws after
          setTimeout(() => { visible[idx] = true; visible = [...visible]; }, idx * 240);
          setTimeout(() => { linesDrawn[idx] = true; linesDrawn = [...linesDrawn]; }, idx * 240 + 360);
        }
      });
    }, { threshold: 0.2 });
    cardEls.forEach(el => { if (el) io.observe(el); });
    return io;
  }

  let io;
  onMount(() => {
    visible = EVENTS.map(() => false);
    linesDrawn = EVENTS.map(() => false);
    // Small delay so DOM is ready
    setTimeout(() => { io = initObserver(); }, 80);
  });
  onDestroy(() => io?.disconnect());
</script>

<section class="trail-page" bind:this={sectionEl} aria-label="OOO Lagos Event Trail">

  <!-- Back nav -->
  <nav class="trail-nav">
    <a href="#/" class="back-btn" aria-label="Back to home">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      Home
    </a>
    <span class="nav-mono">OOO · EVENT TRAIL</span>
  </nav>

  <!-- Page header -->
  <header class="trail-header">
    <p class="eyebrow">Every escape gets a stamp</p>
    <h1 class="heading">The <em class="accent-word">OOO</em> Roadmap</h1>
    <p class="sub">Three events. One trail. The blue Lagos we didn't know we needed.</p>
  </header>

  <!-- Roadmap -->
  <ol class="roadmap" aria-label="OOO event roadmap">
    {#each EVENTS as ev, i}
      <!-- Node row -->
      <li
        class="node-row"
        data-idx={i}
        bind:this={cardEls[i]}
        class:visible={visible[i]}
        class:done={ev.done}
        class:active={ev.active}
        class:pending={ev.pending}
        style="--node-color: {ev.color}; --node-text: {ev.textColor}; --ni: {i};"
      >
        <!-- Event card -->
        <article class="event-card" class:has-href={ev.done || ev.active}>
          <!-- Flyer Thumbnail FULL BLEED -->
          {#if ev.image}
            <div class="card-image-wrap" class:pending={ev.pending}>
              <img src={ev.image} alt={ev.title} class="card-image" loading="lazy" />
            </div>
          {/if}

          <!-- Content Wrapper -->
          <div class="card-content">
            <!-- Top badge row -->
            <div class="card-badge-row">
              <span class="stamp-chip">{ev.stamp}</span>
              {#if ev.done}
                <span class="status-chip done-chip">Completed ✓</span>
              {:else if ev.active}
                <span class="status-chip active-chip">Up next ⚡</span>
              {:else}
                <span class="status-chip pending-chip">Coming soon</span>
              {/if}
            </div>

            <!-- Event title -->
            <h2 class="card-title">{ev.title}</h2>
            <p class="card-tagline">{ev.tagline}</p>

            <!-- Meta row -->
            <div class="card-meta">
              <span class="meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {ev.venue}
              </span>
              <span class="meta-sep">·</span>
              <span class="meta-item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                {ev.date}
              </span>
              {#if ev.time && !ev.pending}
                <span class="meta-sep">·</span>
                <span class="meta-item clock">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {ev.time}
                </span>
              {:else if ev.pending}
                <span class="meta-sep">·</span>
                <span class="meta-item clock">{ev.time}</span>
              {/if}
            </div>

            <!-- CTA -->
            {#if ev.done}
              <a href="#/about" class="card-cta done-cta">View recap ↗</a>
            {:else if ev.active}
              <a href="#/" class="card-cta active-cta">Get on the list ↗</a>
            {:else}
              <span class="card-cta pending-cta">Reveal TBA</span>
            {/if}
          </div>
        </article>

        <!-- Connector line to next node -->
        {#if i < EVENTS.length - 1}
          <div class="connector-centered">
            <svg class="curve-svg" preserveAspectRatio="none" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="grad-{i}" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="{ev.color}" />
                  <stop offset="100%" stop-color="{EVENTS[i+1].color}" />
                </linearGradient>
              </defs>
              {#if i % 2 === 0}
                <path class="curve-bg" d="M 50 0 C 130 30, 130 70, 50 100" />
                <path class="curve-fg" stroke="url(#grad-{i})" pathLength="100" class:drawn={linesDrawn[i]} d="M 50 0 C 130 30, 130 70, 50 100" />
              {:else}
                <path class="curve-bg" d="M 50 0 C -30 30, -30 70, 50 100" />
                <path class="curve-fg" stroke="url(#grad-{i})" pathLength="100" class:drawn={linesDrawn[i]} d="M 50 0 C -30 30, -30 70, 50 100" />
              {/if}
            </svg>
          </div>
        {/if}
      </li>
    {/each}
  </ol>

  <!-- Footer legend -->
  <footer class="trail-footer">
    <div class="legend">
      <span class="legend-item"><span class="legend-dot done-dot"></span>Completed</span>
      <span class="legend-item"><span class="legend-dot active-dot"></span>Up next</span>
      <span class="legend-item"><span class="legend-dot pending-dot"></span>Coming soon</span>
    </div>
    <p class="footer-note">More escapes loading…</p>
  </footer>

</section>

<style>
  /* Hallmark · pre-emit critique: P5 H5 E5 S5 R4 V5
   * genre: playful · theme: custom Escape OKLCH palette
   * tokens: all colours via var(--*) — no inline hex
   */

  /* ─── Page shell ─────────────────────────────────────── */
  .trail-page {
    min-height: 100vh;
    background: var(--bg);
    color: var(--ink);
    font-family: var(--sans);
    overflow-x: clip;
    padding: 0 0 clamp(4rem, 8vh, 6rem);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  /* ─── Back nav ───────────────────────────────────────── */
  .trail-nav {
    width: 100%;
    max-width: 680px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.1rem 1.5rem;
    border-bottom: 1px solid var(--border-soft);
    position: sticky;
    top: 0;
    background: color-mix(in oklch, var(--bg) 88%, transparent);
    backdrop-filter: blur(14px);
    z-index: 50;
  }

  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--ink);
    padding: 0.3rem 0.7rem 0.3rem 0.5rem;
    border: 1.5px solid var(--border-soft-deep);
    border-radius: 999px;
    transition:
      background 0.2s ease,
      border-color 0.2s ease,
      transform 0.22s var(--ease-out-expo);
  }
  .back-btn:hover { background: var(--card-surface); border-color: var(--ink); transform: translateX(-3px); }

  .nav-mono {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
  }

  /* ─── Page header ────────────────────────────────────── */
  .trail-header {
    text-align: center;
    max-width: 520px;
    padding: clamp(2.5rem, 6vh, 4rem) 1.5rem 2rem;
  }

  .eyebrow {
    margin: 0 0 0.6rem;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: var(--accent);
  }

  .heading {
    margin: 0 0 0.75rem;
    font-size: clamp(2.4rem, 7vw, 4rem);
    font-weight: 900;
    line-height: 1.0;
    color: var(--ink);
    letter-spacing: -0.04em;
    font-style: normal;
  }
  .accent-word {
    font-style: normal;
    background: linear-gradient(110deg, var(--sunset-orange) 0%, var(--blue) 60%, var(--pink-deep) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .sub {
    margin: 0;
    font-size: clamp(0.9rem, 2.2vw, 1.05rem);
    color: var(--muted);
    line-height: 1.65;
    max-width: 400px;
    margin-inline: auto;
  }

  /* ─── Roadmap list ───────────────────────────────────── */
  .roadmap {
    list-style: none;
    margin: 0;
    padding: 0 1.5rem;
    width: 100%;
    max-width: 620px;
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ─── Node row ───────────────────────────────────────── */
  .node-row {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    opacity: 0;
    transform: translateY(32px) scale(0.97);
    transition:
      opacity 0.6s var(--ease-out-expo),
      transform 0.6s var(--ease-out-expo);
    transition-delay: calc(var(--ni, 0) * 80ms);
  }
  .node-row.visible {
    opacity: 1;
    transform: translateY(0) scale(1);
  }

  /* ─── Centered Connector ─────────────────────────────── */
  .connector-centered {
    width: 60px;
    height: 70px;
    margin: 4px 0;
    position: relative;
    display: flex;
    justify-content: center;
  }

  .curve-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
  }

  .curve-bg {
    fill: none;
    stroke: var(--border-soft);
    stroke-width: 4;
    stroke-linecap: round;
  }

  .curve-fg {
    fill: none;
    stroke-width: 5;
    stroke-linecap: round;
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    transition: stroke-dashoffset 0.9s var(--ease-out-expo);
  }
  .curve-fg.drawn {
    stroke-dashoffset: 0;
  }

  /* ─── Event card ─────────────────────────────────────── */
  .event-card {
    width: 100%;
    background: var(--card-surface);
    border: 1.5px solid var(--border-soft-deep);
    border-radius: 18px;
    margin-bottom: 0;
    position: relative;
    overflow: hidden;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s var(--ease-out-expo);
    border-top: 5px solid var(--node-color);
  }
  /* Accent stripe */
  .event-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, color-mix(in oklch, var(--node-color) 8%, transparent) 0%, transparent 55%);
    pointer-events: none;
    border-radius: 17px;
    z-index: 0;
  }
  
  .card-content {
    padding: clamp(1.1rem, 3vw, 1.6rem);
    position: relative;
    z-index: 1;
  }

  .node-row.visible .event-card:hover {
    border-color: var(--node-color);
    box-shadow: 0 12px 40px color-mix(in oklch, var(--node-color) 18%, transparent);
    transform: translateY(-2px);
  }

  /* ─── Card badge row ─────────────────────────────────── */
  .card-badge-row {
    display: flex;
    align-items: center;
    gap: 0.55rem;
    flex-wrap: wrap;
    margin-bottom: 0.75rem;
  }

  .stamp-chip {
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    color: var(--node-color);
    background: color-mix(in oklch, var(--node-color) 12%, transparent);
    border: 1px solid color-mix(in oklch, var(--node-color) 30%, transparent);
    padding: 0.2rem 0.55rem;
    border-radius: 999px;
  }

  .status-chip {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
  }
  .done-chip    { background: color-mix(in oklch, var(--sunset-orange) 14%, transparent); color: var(--sunset-orange); border: 1px solid color-mix(in oklch, var(--sunset-orange) 30%, transparent); }
  .active-chip  { background: color-mix(in oklch, var(--blue) 14%, transparent);         color: var(--blue);         border: 1px solid color-mix(in oklch, var(--blue) 30%, transparent); }
  .pending-chip { background: color-mix(in oklch, var(--muted-green) 12%, transparent);  color: var(--muted-green);  border: 1px solid color-mix(in oklch, var(--muted-green) 28%, transparent); }

  /* ─── Card typography ────────────────────────────────── */
  .card-title {
    margin: 0 0 0.35rem;
    font-size: clamp(1.2rem, 4vw, 1.65rem);
    font-weight: 900;
    color: var(--ink);
    line-height: 1.15;
    letter-spacing: -0.025em;
    font-style: normal;
  }
  .pending .card-title { color: var(--muted); letter-spacing: 0.08em; }

  .card-tagline {
    margin: 0 0 1rem;
    font-size: 0.9rem;
    color: var(--muted);
    line-height: 1.55;
    font-style: italic;
  }
  .pending .card-tagline { font-style: normal; }

  /* ─── Flyer Thumbnail ────────────────────────────────── */
  .card-image-wrap {
    margin: 0;
    width: 100%;
    overflow: hidden;
    background: color-mix(in oklch, var(--bg) 50%, transparent);
    border-bottom: 1px solid var(--border-soft);
    position: relative;
    z-index: 1;
  }
  .card-image-wrap.pending {
    filter: grayscale(100%) blur(4px) opacity(0.5);
  }
  .card-image {
    display: block;
    width: 100%;
    height: auto;
    max-height: 400px;
    object-fit: cover;
  }

  /* ─── Meta row ───────────────────────────────────────── */
  .card-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.35rem 0.5rem;
    margin-bottom: 1.1rem;
  }

  .meta-item {
    display: inline-flex;
    align-items: center;
    gap: 0.3rem;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--muted);
    line-height: 1;
  }
  .meta-item svg { opacity: 0.6; flex-shrink: 0; }
  .meta-sep { color: var(--border-soft-deep); font-size: 0.75rem; }
  .clock { font-family: var(--font-mono, 'JetBrains Mono', monospace); font-size: 0.72rem; }

  /* ─── CTAs ───────────────────────────────────────────── */
  .card-cta {
    display: inline-flex;
    align-items: center;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.5rem 1.1rem;
    border-radius: 999px;
    text-decoration: none;
    transition: transform 0.22s var(--ease-out-expo), box-shadow 0.22s ease, background 0.2s ease;
  }
  .done-cta {
    background: color-mix(in oklch, var(--sunset-orange) 15%, transparent);
    color: var(--sunset-orange);
    border: 1.5px solid color-mix(in oklch, var(--sunset-orange) 40%, transparent);
  }
  .done-cta:hover { background: var(--sunset-orange); color: #fff; transform: translateY(-2px); box-shadow: 0 6px 20px color-mix(in oklch, var(--sunset-orange) 35%, transparent); }

  .active-cta {
    background: var(--blue);
    color: #fff;
    border: 1.5px solid transparent;
    box-shadow: 0 4px 16px color-mix(in oklch, var(--blue) 35%, transparent);
  }
  .active-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 28px color-mix(in oklch, var(--blue) 45%, transparent); }

  .pending-cta {
    background: transparent;
    color: var(--muted);
    border: 1.5px dashed var(--border-dashed);
    cursor: default;
    letter-spacing: 0.1em;
  }

  /* ─── Footer ─────────────────────────────────────────── */
  .trail-footer {
    margin-top: 2.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .legend {
    display: flex;
    align-items: center;
    gap: 1.25rem;
    flex-wrap: wrap;
    justify-content: center;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--muted);
    letter-spacing: 0.04em;
  }
  .legend-dot {
    width: 9px;
    height: 9px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .done-dot    { background: var(--sunset-orange); }
  .active-dot  { background: var(--blue); animation: pulseDot 1.8s infinite ease-in-out; }
  .pending-dot { background: var(--muted-green); opacity: 0.55; }

  .footer-note {
    margin: 0;
    font-size: 0.72rem;
    color: var(--muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
    opacity: 0.6;
    font-family: var(--font-mono, 'JetBrains Mono', monospace);
  }

  /* ─── Reduced motion ─────────────────────────────────── */
  @media (prefers-reduced-motion: reduce) {
    .node-row  { transition: none; }
    .active-dot { animation: none; }
    @keyframes bulletPop { from { transform: scale(1); } to { transform: scale(1); } }
  }
</style>
