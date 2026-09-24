<script>
  import MorphText from './MorphText.svelte';
  import { createDialKit } from 'dialkit/svelte';

  export let visible = false;

  // Register Dialkit animation configuration for timeline transitions
  const timelineAnim = createDialKit('timeline-anim', {
    springStiffness: [120, 10, 300],
    springDamping: [14, 1, 40],
    staggerDelay: [130, 50, 400]
  });

  const MEMORIES = [
    {
      stamp: 'OOO 0x01',
      title: 'The Post-NYSC Hangout',
      meta: 'Tarkwa Bay Beach · Apr 11 · 12pm till daybreak',
      note: 'The calming embrace of ocean waves. The soothing breeze. The tranquility of nature.',
      color: 'var(--sunset-orange)',
    },
    {
      stamp: 'OOO 0x02',
      title: 'Open Canvas',
      meta: 'Jaekel House Garden · May 30',
      note: 'You don’t need to know how to paint. Just come with an open mind to create.',
      color: 'var(--blue)',
      href: '#open-canvas-event',
    },
    {
      stamp: 'OOO 0x03',
      title: 'Release and Unwind',
      meta: 'Tarkwa Bay Beach · Aug 15–16 · overnight beach camp',
      note: 'Took a break from the Lagos palava.',
      color: 'var(--pink-deep)',
    },
    {
      stamp: 'OOO 0x04',
      title: '???',
      meta: 'Up next · Date TBA',
      note: 'The next escape is loading. Stay tuned.',
      pending: true,
      color: 'var(--muted-green)',
    },
  ];
</script>

<section class="timeline">
  <div class="text-content">
    <p class="eyebrow"><MorphText text="Memory timeline" /></p>
    <h2 class="heading">Every escape gets a stamp.</h2>
    <a href="#/trail" class="trail-cta" aria-label="See the full event trail">
      <span class="trail-cta-dot"></span>
      See full trail
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </a>
  </div>

  <ol class="list">
    {#each MEMORIES as m, i}
      <li
        id={m.title.toLowerCase().includes('canvas') ? 'open-canvas-event' : undefined}
        class="entry"
        class:pending={m.pending}
        class:visible
        class:linked={!!m.href}
        style="--i: {i};"
      >
        <svelte:element
          this={m.href ? 'a' : 'div'}
          href={m.href || undefined}
          class="entry-inner"
          aria-label={m.href ? m.title : undefined}
        >
          <span class="stamp" style="--stamp-color: {m.pending ? '#b8b2a8' : m.color}; --stamp-rotate: {i % 2 ? 6 : -7}deg;">
            <span class="stamp-brand">OOO</span>
            <span class="stamp-num">{m.stamp.replace('OOO ', '')}</span>
          </span>
          <div class="details">
            <span class="title">{m.title}</span>
            <span class="meta">{m.meta}</span>
            <span class="note">{m.note}</span>
            {#if m.href}
              <span class="visit-hint">View ↗</span>
            {/if}
          </div>
        </svelte:element>
      </li>
    {/each}
  </ol>
</section>

<style>
  .timeline {
    max-width: 1000px;
    margin: 0 auto;
    padding: clamp(3rem, 10vh, 6rem) 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }
  
  @media (min-width: 768px) {
    .timeline {
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
      gap: 5rem;
    }
    .text-content {
      flex: 1 1 40%;
      position: sticky;
      top: 8rem;
    }
    .list {
      flex: 1 1 60%;
    }
  }

  .eyebrow {
    margin: 0 0 0.5rem;
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .heading {
    margin: 0 0 1rem;
    font-weight: 700;
    font-size: clamp(1.6rem, 4.5vw, 2.4rem);
    color: var(--ink);
    line-height: 1.15;
  }

  /* Candy-crush trail CTA — a subtle inline pill-link */
  .trail-cta {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    margin-top: 0.75rem;
    padding: 0.35rem 0.85rem 0.35rem 0.6rem;
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    color: var(--ink);
    background: var(--card-surface);
    border: 1px solid var(--border-soft-deep);
    border-radius: 999px;
    transition: background 0.25s var(--ease-out-expo), border-color 0.25s ease, transform 0.25s var(--ease-out-expo), box-shadow 0.25s ease;
    backdrop-filter: blur(8px);
  }
  .trail-cta:hover {
    background: var(--blue);
    border-color: var(--blue);
    color: #fff;
    transform: translateY(-2px) scale(1.03);
    box-shadow: 0 6px 20px rgba(0, 191, 255, 0.28);
  }
  .trail-cta-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--pink-deep);
    animation: dotPulse 2.5s infinite ease-in-out;
  }
  @keyframes dotPulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.7); }
  }

  .list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    border-left: 2px solid var(--border-soft);
  }

  .entry {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 0;
    margin-left: -2px;
    border-left: 2px solid var(--blue);
    position: relative;
    opacity: 0;
    transform: translateX(-16px);
    transition: opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo), background 0.4s var(--ease-out-expo);
    transition-delay: calc(var(--i, 0) * 130ms);
    border-radius: 0 16px 16px 0;
    overflow: hidden;
  }
  .entry-inner {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 0.5rem 1rem 0.5rem 1.5rem;
    width: 100%;
    text-decoration: none;
    color: inherit;
    border-radius: 0 16px 16px 0;
    transition: background 0.3s var(--ease-out-expo), transform 0.3s var(--ease-out-expo);
  }
  .entry.visible {
    opacity: 1;
    transform: translateX(0);
  }
  .entry.linked .entry-inner:hover {
    background: rgba(0, 191, 255, 0.06);
    transform: translateX(6px);
  }
  .entry.pending {
    border-left-color: var(--border-soft-deep);
  }

  .visit-hint {
    display: inline-block;
    margin-top: 0.35rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--accent);
    opacity: 0;
    transform: translateX(-6px);
    transition: opacity 0.25s ease, transform 0.25s var(--ease-out-expo);
  }
  .entry.linked .entry-inner:hover .visit-hint {
    opacity: 1;
    transform: translateX(0);
  }

  /* Passport-stamp treatment: circular ink-stamp look (double ring, rotated,
     transparent center) rather than a plain rounded-rect badge — per
     concept.txt's "Passport Stamp" visual metaphor for each event. */
  .stamp {
    flex: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 3.6rem;
    height: 3.6rem;
    border-radius: 50%;
    border: 2px solid var(--stamp-color, var(--blue));
    outline: 1px dashed var(--stamp-color, var(--blue));
    outline-offset: 3px;
    color: var(--stamp-color, var(--blue));
    background: transparent;
    transform: rotate(var(--stamp-rotate, -6deg));
    text-align: center;
    transition: transform 0.4s var(--ease-out-expo), background 0.4s var(--ease-out-expo), color 0.4s var(--ease-out-expo);
  }
  .entry.visible:hover .stamp {
    transform: rotate(var(--stamp-rotate, -6deg)) scale(1.15);
    background: var(--stamp-color, var(--blue));
    color: var(--bg);
  }
  .stamp-brand {
    font-size: 0.42rem;
    letter-spacing: 0.08em;
  }
  .stamp-num {
    font-size: 0.7rem;
    line-height: 1.2;
  }
  .entry.pending .stamp {
    opacity: 0.7;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    padding-bottom: 0.5rem;
  }
  .title {
    font-weight: 700;
    font-size: clamp(1.2rem, 3.5vw, 1.5rem);
    color: var(--ink);
  }
  .meta {
    font-size: 0.85rem;
    color: var(--pink-deep);
    font-weight: 500;
  }
  .note {
    font-size: 0.9rem;
    color: var(--muted);
    margin-top: 0.15rem;
  }
</style>
