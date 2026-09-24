<script>
  /* The shallows — the arrival at the end of the Crossing (see
   * OOO-0x04-DESIGN-ROOM.md §4). The page is the boat ride; this is the shore.
   *
   * The section's gradient paints instantly and doubles as the loading state
   * and the no-WebGL fallback. The Three.js scene is only fetched once the
   * section comes within about a viewport of the screen, so it never competes
   * with the hero for first paint.
   */
  import { onMount, onDestroy } from 'svelte';
  import { muted } from './ambientSound.js';

  export let onOpenDrawer = () => {};
  // 10 taps on the paper boat → the auto-reply generator (design room D4).
  export let onOpenOooGen = () => {};

  let section;
  let stage;
  let scene = null;
  let status = 'idle'; // idle | loading | ready | failed | context-lost
  let message = '';
  let hintFaded = false;
  let arrived = false;
  let destroyed = false;
  let viewMode = 'preview';

  function showView(nextMode) {
    viewMode = nextMode;
    scene?.setMode(nextMode);
  }

  let isMuted = false;
  const unsubMuted = muted.subscribe((m) => {
    isMuted = m;
    scene?.setSound(!m);
  });

  function handleStatus(s) {
    if (s.kind === 'sound-failed') return; // header mute stays the control
    status = s.kind;
    message = s.message || '';
  }

  async function mountScene() {
    if (scene || status === 'loading' || destroyed) return;
    status = 'loading';
    try {
      const { createShallows } = await import('./shallows/createShallows.js');
      if (destroyed) return;
      scene = createShallows(stage, {
        sound: !isMuted,
        initialMode: viewMode,
        onStatus: handleStatus,
        onInteract: () => (hintFaded = true),
        onBoatEgg: () => onOpenOooGen(),
      });
    } catch (err) {
      console.error('[shallows]', err);
      status = 'failed';
      message = 'The water could not load here.';
    }
  }

  let nearObserver;
  let arriveObserver;
  onMount(() => {
    // Fetch + build the scene a viewport early so it's ready on arrival.
    nearObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          nearObserver.disconnect();
          mountScene();
        }
      },
      { rootMargin: '100% 0px' }
    );
    nearObserver.observe(section);

    arriveObserver = new IntersectionObserver(
      (entries) => (arrived = entries[0].isIntersecting),
      { threshold: 0.35 }
    );
    arriveObserver.observe(section);
  });

  onDestroy(() => {
    destroyed = true;
    unsubMuted();
    nearObserver?.disconnect();
    arriveObserver?.disconnect();
    scene?.dispose();
    scene = null;
  });
</script>

<section
  id="shallows"
  class="shallows"
  class:arrived
  class:preview={viewMode === 'preview'}
  bind:this={section}
  aria-labelledby="shallows-title"
>
  <div class="stage" bind:this={stage}></div>

  <div class="view-switch" role="group" aria-label="Water view">
    <button type="button" aria-pressed={viewMode === 'preview'} on:click={() => showView('preview')}>Background preview</button>
    <button type="button" aria-pressed={viewMode === 'explore'} disabled={status === 'failed' || status === 'context-lost'} on:click={() => showView('explore')}>Explore water</button>
  </div>

  {#if viewMode === 'preview'}
    <div class="preview-wash" aria-hidden="true"></div>
    <div class="background-copy">
      <p class="eyebrow">Out of Office &nbsp;/&nbsp; No. 04</p>
      <h2 id="shallows-title">Out of office.<br />Into blue Lagos.</h2>
      <p>Auto replies enabled.<br />Stress disabled.</p>
      <button type="button" class="cta" on:click={onOpenDrawer}>View boarding pass →</button>
    </div>
  {:else}
    <div class="intro-card">
      <p class="eyebrow">Out of office &nbsp;/&nbsp; No. 04</p>
      <h2 id="shallows-title">The shallows.</h2>
      <p class="caption" class:faded={hintFaded}>
        The waves come in sets — restless, then still.<br />
        Drag sideways to wander. Tap to ripple.
      </p>
      <button type="button" class="cta" on:click={onOpenDrawer}>Claim your pass →</button>
    </div>
  {/if}

  {#if status === 'loading'}
    <p class="status" role="status">The water is loading…</p>
  {:else if status === 'failed' || status === 'context-lost'}
    <p class="status" role="status">{message}</p>
  {/if}

  <p class="finale-line">Leaving yellow Lagos. Entering blue Lagos.</p>
</section>

<style>
  /* Hallmark · macrostructure: water arrival · tone: atmospheric · anchor hue: deep water */
  /* Hallmark · pre-emit critique: P5 H4 E4 S5 R4 V4 */
  .shallows {
    /* Water palette (design room §4). Local until stream A lands the
       site-wide tokens; each falls back to the literal value. */
    --sh-ink: var(--ink-water, #243e3c);
    --sh-deep: var(--deep, #376a65);
    --sh-paper: #f6f5e9;

    position: relative;
    height: 100svh;
    min-height: 560px;
    overflow: hidden;
    color: var(--sh-ink);
    background: linear-gradient(165deg, #dce7df, #7aaea8 58%, #376a65);
    isolation: isolate;
  }

  .stage {
    position: absolute;
    inset: 0;
    z-index: 0;
  }
  .stage :global(.shallows-canvas) {
    display: block;
    width: 100%;
    height: 100%;
    outline-offset: -5px;
  }
  .stage :global(.shallows-canvas:focus-visible) {
    outline: 2px solid var(--sh-paper);
  }

  .view-switch {
    position: absolute;
    z-index: 3;
    top: clamp(80px, 10vh, 104px);
    right: clamp(18px, 3vw, 44px);
    display: flex;
    background: var(--bg);
    border: 1px solid var(--sh-ink);
  }
  .view-switch button {
    min-height: 44px;
    padding: 10px 14px;
    border: 0;
    border-bottom: 3px solid transparent;
    background: transparent;
    color: var(--sh-ink);
    font-family: var(--sans);
    font-size: 0.72rem;
    font-weight: 700;
    white-space: nowrap;
    cursor: pointer;
  }
  .view-switch button[aria-pressed='true'] {
    border-bottom-color: var(--sh-deep);
  }
  .view-switch button:focus-visible {
    outline: 3px solid var(--sh-deep);
    outline-offset: 3px;
  }
  .view-switch button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .preview-wash {
    position: absolute;
    z-index: 1;
    inset: 0;
    background: linear-gradient(90deg, color-mix(in srgb, var(--bg) 93%, transparent), color-mix(in srgb, var(--bg) 75%, transparent) 45%, transparent 80%);
    pointer-events: none;
  }
  .background-copy {
    position: absolute;
    z-index: 2;
    top: clamp(180px, 25vh, 260px);
    left: clamp(24px, 6vw, 96px);
    width: min(610px, calc(100% - 48px));
  }
  .background-copy h2 {
    margin: 12px 0 22px;
    font-family: var(--serif);
    font-size: clamp(44px, 6vw, 84px);
    line-height: 1.02;
    font-weight: 700;
    letter-spacing: -0.05em;
    overflow-wrap: anywhere;
  }
  .background-copy > p:not(.eyebrow) {
    font-family: var(--sans);
    font-size: clamp(14px, 1.5vw, 18px);
    line-height: 1.6;
  }

  .intro-card {
    position: absolute;
    z-index: 1;
    left: clamp(18px, 2.6vw, 40px);
    bottom: clamp(96px, 13vh, 132px);
    max-width: min(360px, 44vw);
    padding: clamp(18px, 2vw, 26px) clamp(20px, 2.2vw, 28px);
    background: linear-gradient(160deg, #f7f3e5e6, #e8efe2cc);
    border: 1px solid #ffffff96;
    border-radius: 18px;
    box-shadow: 0 14px 44px #0e2b231a, inset 0 1px 0 #ffffffb0;
    backdrop-filter: blur(14px) saturate(115%);
    -webkit-backdrop-filter: blur(14px) saturate(115%);
    opacity: 0;
    transform: translateY(10px);
    transition: opacity 0.8s ease-out, transform 0.8s ease-out;
  }
  .shallows.arrived .intro-card {
    opacity: 1;
    transform: translateY(0);
  }

  .eyebrow {
    margin: 0 0 10px;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.26em;
    text-transform: uppercase;
    /* ink at ~0.8 on the card: ≥4.5:1 (card is near-opaque paper) */
    color: color-mix(in srgb, var(--sh-ink) 82%, transparent);
  }

  h2 {
    margin: 0;
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 600;
    font-size: clamp(26px, 3.2vw, 42px);
    line-height: 1.05;
    letter-spacing: -0.042em;
  }

  .caption {
    margin: 12px 0 0;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.78rem;
    line-height: 1.8;
    color: color-mix(in srgb, var(--sh-ink) 85%, transparent);
    transition: opacity 0.5s ease;
  }
  .caption.faded {
    opacity: 0;
  }

  .cta {
    margin-top: 16px;
    border: none;
    border-radius: 999px;
    padding: 0.7rem 1.3rem;
    background: var(--sh-deep);
    color: var(--sh-paper); /* 5.61:1 */
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 6px 20px rgba(55, 106, 101, 0.3);
    transition: background 0.2s ease;
  }
  .cta:hover {
    background: #2b5753;
    transform: none;
  }
  .cta:focus-visible {
    outline: 2px solid var(--sh-ink);
    outline-offset: 3px;
  }

  .status {
    position: absolute;
    z-index: 1;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    margin: 0;
    padding: 0.8rem 1.2rem;
    border-radius: 14px;
    background: #f5f6eceb;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.85rem;
    text-align: center;
    max-width: calc(100% - 48px);
  }

  .finale-line {
    position: absolute;
    z-index: 1;
    left: 0;
    right: 0;
    bottom: max(clamp(14px, 4vh, 28px), env(safe-area-inset-bottom));
    margin: 0;
    text-align: center;
    font-family: 'Space Grotesk', system-ui, sans-serif;
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    /* The sand at the bottom of the frame is light, so white text washed
       out; ink with a paper halo reads on both sand and deeper water. */
    color: var(--sh-ink);
    text-shadow: 0 0 6px rgba(247, 243, 229, 0.95), 0 0 14px rgba(247, 243, 229, 0.8);
    pointer-events: none;
  }

  @media (max-width: 600px) {
    .view-switch {
      top: 82px;
      right: 18px;
    }
    .view-switch button {
      padding: 8px 10px;
      font-size: 0.65rem;
    }
    .preview-wash {
      background: linear-gradient(180deg, color-mix(in srgb, var(--bg) 94%, transparent), color-mix(in srgb, var(--bg) 80%, transparent) 52%, transparent 78%);
    }
    .background-copy {
      top: 175px;
    }
    .background-copy h2 {
      font-size: clamp(38px, 10vw, 56px);
    }
    .intro-card {
      max-width: min(300px, calc(100vw - 36px));
      bottom: clamp(84px, 12vh, 108px);
    }
  }
</style>
