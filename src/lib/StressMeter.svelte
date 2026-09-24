<script>
  // Concept 3 (concept.txt): "Floating overlay assistant ... almost like a
  // Tamagotchi ... Homepage: Stress Level ██████████ ... As user scrolls:
  // Stress Level ██░░░░░░░░ ... Then: Mental State: Out of Office."
  // Lives on the site the whole time, not just during the hero — reuses the
  // same hero `progress` App.svelte already drives the cube and notification
  // counter with, so all three read as one consistent taper rather than
  // three separately-invented timelines.
  import { onDestroy } from 'svelte';

  export let progress = 0; // 0..1, hero scroll progress (App.svelte's smoothedProgress)
  export let activated = false;

  const SEGMENTS = 10;
  $: stressPct = Math.round((1 - progress) * 100);
  $: filledSegments = Math.round((1 - progress) * SEGMENTS);
  $: stage = stressPct === 0 ? "zero" : progress < 0.25 ? "high" : "mid";

  // The old `oo` keyboard egg, relocated: click the meter for Lagos
  // Survival Stats. Inline reveal — no toast.
  let showStats = false;
  let statsTimer;
  function toggleStats() {
    showStats = !showStats;
    clearTimeout(statsTimer);
    if (showStats) statsTimer = setTimeout(() => (showStats = false), 6000);
  }
  onDestroy(() => clearTimeout(statsTimer));
</script>

<button
  type="button"
  class="stress-meter"
  data-stage={stage}
  on:click={toggleStats}
  aria-expanded={showStats}
  title="Lagos Survival Stats"
  aria-label={activated
    ? "Mental state: Out of Office. Show Lagos survival stats."
    : `Stress level: ${stressPct} percent. Show Lagos survival stats.`}
>
  {#if activated}
    <p class="meter-label state">Mental State: Out of Office</p>
  {:else}
    <p class="meter-label">Stress Level</p>
    <div class="bar" aria-hidden="true">
      {#each Array(SEGMENTS) as _, i (i)}
        <span class="seg" class:filled={i < filledSegments}></span>
      {/each}
    </div>
    <p class="meter-pct" aria-hidden="true">{stressPct}%</p>
  {/if}

  {#if showStats}
    <div class="stats-panel" role="status">
      <p class="stats-title">Lagos Survival Stats</p>
      <ul>
        <li>Traffic avoided: <strong>3 hours</strong></li>
        <li>Emails ignored: <strong>17</strong></li>
        <li>Stress reduced: <strong>68%</strong></li>
      </ul>
    </div>
  {/if}
</button>

<style>
  .stress-meter {
    position: fixed;
    left: clamp(1rem, 4vw, 1.75rem);
    bottom: clamp(1.5rem, 5vh, 3rem);
    z-index: 100;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.3rem;
    padding: 0.6rem 0.85rem;
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.55);
    backdrop-filter: blur(14px) saturate(160%);
    -webkit-backdrop-filter: blur(14px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.55);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.1);
    /* It's a <button> now (click for stats) — reset UA button styling and
       the global hover-bounce so it still reads as a glass readout. */
    font: inherit;
    color: inherit;
    text-align: left;
    cursor: pointer;
  }
  .stress-meter:hover,
  .stress-meter:active {
    transform: none;
  }
  .stress-meter:focus-visible {
    outline: 2px solid var(--blue, #00bfff);
    outline-offset: 3px;
  }

  .stats-panel {
    position: absolute;
    bottom: calc(100% + 0.6rem);
    left: 0;
    min-width: 15rem;
    background: var(--card-surface);
    border: 2px solid var(--blue, #00bfff);
    border-radius: 12px;
    padding: 0.8rem 1rem;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
    pointer-events: none;
    animation: statsIn 0.25s var(--ease-out-expo);
  }
  @keyframes statsIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .stats-title {
    margin: 0 0 0.4rem;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--blue);
  }
  .stats-panel ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    font-size: 0.72rem;
    color: var(--ink);
  }
  .stats-panel li {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
  }
  .stats-panel li strong {
    color: var(--accent);
  }

  .meter-label {
    margin: 0;
    font-weight: 700;
    font-size: 0.62rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--ink, #181818);
  }
  .meter-label.state {
    color: var(--blue, #00bfff);
    max-width: 14ch;
  }

  .bar {
    display: flex;
    gap: 2px;
  }
  .seg {
    width: 7px;
    height: 14px;
    border-radius: 2px;
    background: rgba(24, 24, 24, 0.15);
    transition: background var(--dur-base, 0.3s) var(--ease-standard, ease);
  }
  .seg.filled {
    background: var(--chaos-red, #e53838);
  }
  .stress-meter[data-stage="mid"] .seg.filled {
    background: #b8860b;
  }
  .stress-meter[data-stage="zero"] .seg.filled {
    background: var(--blue, #00bfff);
  }

  .meter-pct {
    margin: 0;
    font-weight: 700;
    font-size: 0.7rem;
    font-variant-numeric: tabular-nums;
    color: var(--ink, #181818);
  }

  @media (max-width: 700px) {
    .stress-meter {
      display: none;
    }
  }
</style>
