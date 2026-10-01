<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { muted, toggleMute } from './ambientSound.js';
  import { NEXT_EVENT, SALES_MODE } from './sales.js';

  export let onOpenOooGen = () => {};
  export let onScrollToContent = () => {};
  export let onScrollToShowcase = () => {};

  let section;
  let stage;
  let wanderButton;
  let exploreCard;
  let scene = null;
  let status = 'idle';
  let message = '';
  let destroyed = false;
  let viewMode = 'preview';
  let stillWater = false;

  async function showView(nextMode) {
    viewMode = nextMode;
    scene?.setMode(nextMode);
    await tick();
    if (nextMode === 'explore') exploreCard?.focus();
    else wanderButton?.focus();
  }

  function onKeydown(event) {
    if (event.key === 'Escape' && viewMode === 'explore') {
      event.preventDefault();
      showView('preview');
    }
  }

  let isMuted = false;
  const unsubMuted = muted.subscribe((value) => {
    isMuted = value;
    scene?.setSound(!value);
  });

  function handleStatus(next) {
    if (next.kind === 'sound-failed') return;
    status = next.kind;
    message = next.message || '';
    if ((status === 'failed' || status === 'context-lost') && viewMode === 'explore') showView('preview');
  }

  async function mountScene() {
    if (scene || status === 'loading' || destroyed) return;
    status = 'loading';
    try {
      const { createShallows } = await import('./shallows/createShallows.js');
      if (destroyed || stillWater) { status = 'idle'; return; }
      if (scene) return;
      scene = createShallows(stage, {
        sound: !isMuted,
        initialMode: viewMode,
        onStatus: handleStatus,
        onBoatEgg: onOpenOooGen,
      });
    } catch (error) {
      console.error('[shallows]', error);
      status = 'failed';
      message = 'The water could not load here.';
    }
  }

  let nearObserver;
  onMount(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotion = () => {
      stillWater = preference.matches;
      if (stillWater) {
        scene?.dispose();
        scene = null;
        status = 'idle';
        viewMode = 'preview';
      } else mountScene();
    };
    stillWater = preference.matches;
    preference.addEventListener('change', updateMotion);
    nearObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        nearObserver.disconnect();
        if (!stillWater) mountScene();
      }
    }, { rootMargin: '100% 0px' });
    nearObserver.observe(section);
    return () => preference.removeEventListener('change', updateMotion);
  });

  onDestroy(() => {
    destroyed = true;
    unsubMuted();
    nearObserver?.disconnect();
    scene?.dispose();
    scene = null;
  });
</script>

<svelte:window on:keydown={onKeydown} />

<section id="shallows" class="hero" class:exploring={viewMode === 'explore'} class:scene-unavailable={status === 'failed' || status === 'context-lost'} bind:this={section} aria-label="Out of Office water">
  <div class="stage" bind:this={stage}>
    <picture class="water-still" aria-hidden="true">
      <source media="(max-width: 700px)" srcset="/hero-water-mobile.jpg" />
      <img src="/hero-water-desktop.jpg" alt="" fetchpriority="high" decoding="async" />
    </picture>
  </div>

  {#if viewMode === 'preview'}
    <div class="preview-wash" aria-hidden="true"></div>
    <div class="hero-copy">
      <p class="eyebrow">OUT OF OFFICE</p>
      <h1 tabindex="-1">Away from<br />the everyday.</h1>
      <p class="description">Lagos hangouts for music, art,<br />games, and a little time off.</p>
      <p class="event-status">{NEXT_EVENT.code} <span aria-hidden="true">·</span> {NEXT_EVENT.when}<br /><span class="date-tba">Date and venue TBA</span></p>
      <button type="button" class="primary-button ui-action" on:click={onScrollToShowcase}>Explore the last escape</button>
    </div>

    <aside class="auto-reply" aria-label="An Out of Office auto-reply">
      <span class="tape" aria-hidden="true"></span>
      <p class="subject"><span>Subject</span><br />Auto-reply: back when my social battery gets recharged</p>
      <p class="mail-body">I am currently away from emails, responsibilities, and Lagos stress.</p>
      <button type="button" class="write-link" on:click={onOpenOooGen}>Write your own <span aria-hidden="true">→</span></button>
      <span class="postmark" aria-hidden="true"><span>OUT OF OFFICE</span><strong>0x04</strong></span>
    </aside>

    <button type="button" class="scroll-cue" aria-label="Scroll to the rest of the page" on:click={onScrollToContent}>↓</button>
    {#if !stillWater}
    <button type="button" class="wander-button ui-action" bind:this={wanderButton} disabled={stillWater || status !== 'ready'} on:click={() => showView('explore')}>
      Wander the water
    </button>
    {/if}
  {:else}
    <div class="explore-card" tabindex="-1" bind:this={exploreCard}>
      <p class="explore-hint">Drag to wander. Tap to ripple.</p>
      <div class="explore-actions">
        <button type="button" class="back-button" on:click={() => showView('preview')}>Back to the page</button>
        <button type="button" on:click={() => scene?.resetView()}>Reset view</button>
      </div>
    </div>
  {/if}

  {#if status === 'loading'}
    <p class="scene-status loading-status" role="status">The water is loading…</p>
  {:else if status === 'failed' || status === 'context-lost'}
    <p class="scene-status" role="status">{message}</p>
  {/if}
</section>

<style>
  /* Hallmark · macrostructure: Crossing water hero · tone: calm · anchor hue: deep water */
  /* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
  .hero {
    --hero-ink: var(--color-ink, #243e3c);
    --hero-deep: var(--color-deep, #376a65);
    --hero-paper: var(--color-paper, #f2f0e9);
    --hero-card: #faf8f2;
    --hero-muted: #586a67;
    --hero-line: #cdc9b8;
    --hero-dash: #b4b1a0;
    --hero-tape: rgb(122 174 168 / .6);
    --hero-shadow: rgb(36 62 60 / .14);
    --hero-card-shadow: rgb(36 62 60 / .12);
    /* Site-wide Gelasio (app.css, owner pick T1) — no separate hero copy. */
    --hero-display: var(--serif, 'Gelasio', Georgia, serif);
    --hero-body: system-ui, -apple-system, 'Segoe UI', sans-serif;
    position: relative;
    isolation: isolate;
    height: 100svh;
    min-height: 590px;
    overflow: hidden;
    color: var(--hero-ink);
    background: var(--hero-paper);
    font-family: var(--hero-body);
  }
  .stage { position: absolute; inset: 0; z-index: 0; }
  .water-still, .water-still img { display: block; width: 100%; height: 100%; }
  .water-still { position: absolute; inset: 0; }
  .water-still img { object-fit: cover; object-position: center; }
  .stage :global(.shallows-canvas) { position: absolute; inset: 0; display: block; width: 100%; height: 100%; pointer-events: none; }
  .exploring .stage :global(.shallows-canvas) { pointer-events: auto; }
  .scene-unavailable .stage :global(.shallows-canvas) { visibility: hidden; }
  .stage :global(.shallows-canvas:focus-visible) { outline: 3px solid var(--hero-paper); outline-offset: -6px; }
  .preview-wash {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: linear-gradient(90deg, color-mix(in srgb, var(--hero-paper) 95%, transparent) 0%, color-mix(in srgb, var(--hero-paper) 92%, transparent) 38%, transparent 64%);
  }
  .hero-copy { position: absolute; z-index: 2; top: clamp(160px, 22.8vh, 205px); left: clamp(30px, 8vw, 115px); width: min(700px, calc(100% - 60px)); }
  .eyebrow { margin: 0; color: var(--hero-muted); font-family: var(--hero-body); font-size: 12px; font-weight: 600; letter-spacing: .26em; text-transform: uppercase; }
  h1 { margin: 10px 0 22px; font-family: var(--hero-display); font-size: clamp(67px, 7.78vw, 112px); line-height: .95; letter-spacing: -.04em; font-weight: 400; overflow-wrap: anywhere; }
  .description { margin: 0; max-width: 380px; font-size: 17px; line-height: 1.7; }
  .event-status { margin: 26px 0 28px; font-size: 16px; font-weight: 500; }
  .event-status span { margin: 0 .12em; }
  .event-status .date-tba { display: inline-block; margin: 5px 0 0; color: var(--hero-muted); font-size: 12px; font-weight: 400; }
  button { cursor: pointer; font: inherit; }
  button:focus-visible, .explore-card:focus-visible { outline: 3px solid var(--hero-ink); outline-offset: 4px; }
  .primary-button { height: 50px; padding: 0 28px; border: 2px solid var(--hero-deep); border-radius: 99px; background: var(--hero-deep); color: var(--hero-card); font-size: 16px; font-weight: 500; white-space: nowrap; }
  .primary-button:hover { background: var(--hero-ink); border-color: var(--hero-ink); }
  .auto-reply { position: absolute; z-index: 2; top: 33.3%; right: clamp(50px, 11.25vw, 162px); width: min(470px, 34vw); padding: 30px; transform: rotate(1.6deg); border: 1px solid var(--hero-line); border-radius: 6px; background: color-mix(in srgb, var(--hero-card) 96%, transparent); box-shadow: 0 18px 40px var(--hero-shadow); }
  .tape { position: absolute; top: -14px; left: calc(50% - 48px); width: 96px; height: 28px; transform: rotate(-3deg); background: var(--hero-tape); }
  .subject { margin: 0 0 16px; padding-bottom: 14px; border-bottom: 1px dashed var(--hero-dash); font-size: 16px; line-height: 1.35; font-weight: 500; }
  .subject span { color: var(--hero-muted); font-size: 13px; font-weight: 400; }
  .mail-body { margin: 0; max-width: 30ch; font-family: var(--hero-display); font-size: 24px; line-height: 1.4; letter-spacing: -.01em; font-weight: 400; }
  .write-link { margin-top: 18px; padding: 0; border: 0; background: none; color: var(--hero-deep); font-size: 14px; font-weight: 500; text-decoration: underline; text-underline-offset: 4px; }
  .postmark { position: absolute; right: -14px; bottom: -24px; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 104px; height: 104px; transform: rotate(-11deg); border: 3px double var(--hero-deep); border-radius: 50%; background: color-mix(in srgb, var(--hero-card) 85%, transparent); color: var(--hero-deep); font-family: var(--bungee); text-align: center; line-height: 1.1; }
  .postmark > span { font-size: 9px; letter-spacing: .08em; }
  .postmark strong { margin-top: 4px; font-size: 26px; font-weight: 400; }
  .wander-button { position: absolute; z-index: 3; right: clamp(16px, 4.45vw, 64px); bottom: max(40px, env(safe-area-inset-bottom)); height: 46px; padding: 0 16px; border: 2px solid var(--hero-ink); border-radius: 99px; background: color-mix(in srgb, var(--hero-card) 94%, transparent); color: var(--hero-ink); font-size: 13px; font-weight: 500; white-space: nowrap; }
  .wander-button:hover { background: var(--hero-card); }
  .wander-button:disabled { opacity: .5; cursor: not-allowed; }
  .scroll-cue { position: absolute; z-index: 2; bottom: 30px; left: 50%; width: 44px; height: 44px; transform: translateX(-50%); border: 0; background: transparent; color: var(--hero-ink); font-size: 26px; }
  .explore-card { position: absolute; z-index: 2; bottom: max(80px, env(safe-area-inset-bottom)); left: clamp(16px, 4.45vw, 64px); width: min(380px, calc(100% - 32px)); padding: 22px; border: 1px solid var(--hero-line); border-radius: 14px; background: color-mix(in srgb, var(--hero-card) 94%, transparent); box-shadow: 0 12px 32px var(--hero-card-shadow); }
  .explore-hint { margin: 0 0 16px; font-size: 16px; line-height: 1.4; }
  .explore-actions { display: flex; flex-wrap: wrap; gap: 10px; }
  .explore-actions button { min-height: 46px; padding: 0 19px; border: 2px solid var(--hero-ink); border-radius: 99px; background: transparent; color: var(--hero-ink); font-size: 15px; font-weight: 500; white-space: nowrap; }
  .explore-actions .back-button { background: var(--hero-deep); border-color: var(--hero-deep); color: var(--hero-card); }
  .explore-actions button:hover { background: var(--hero-ink); color: var(--hero-card); }
  .scene-status { position: absolute; z-index: 4; top: 102px; right: 30px; max-width: 220px; margin: 0; padding: 7px 11px; border-radius: 5px; background: var(--hero-card); font-size: .75rem; }
  .loading-status { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
  @media (max-width: 1100px) {
    .auto-reply { top: auto; right: 24px; bottom: 92px; width: min(360px, 42vw); padding: 20px; }
    .mail-body { font-size: 19px; }
    .postmark { width: 78px; height: 78px; right: -10px; bottom: -18px; }
    .postmark > span { font-size: 7px; }
    .postmark strong { font-size: 19px; }
  }
  @media (max-width: 700px) {
    .hero { min-height: 720px; }
    .water-still img { object-position: center; }
    .preview-wash { background: linear-gradient(180deg, color-mix(in srgb, var(--hero-paper) 94%, transparent) 0%, color-mix(in srgb, var(--hero-paper) 72%, transparent) 42%, color-mix(in srgb, var(--hero-paper) 20%, transparent) 68%, transparent 88%); }
    .hero-copy { top: 155px; left: 20px; width: calc(100% - 40px); }
    h1 { margin: 10px 0 18px; font-size: clamp(42px, 13.33vw, 52px); }
    .description { display: block; font-size: 14px; line-height: 1.7; margin: 0 0 18px; }
    .event-status { margin: 0 0 24px; font-size: 15px; }
    .auto-reply { left: 20px; right: 20px; bottom: 82px; width: auto; padding: 16px; transform: rotate(1deg); }
    .auto-reply .mail-body { max-width: 28ch; font-size: 16px; }
    .auto-reply .subject { margin-bottom: 8px; padding-bottom: 8px; font-size: 13px; }
    .auto-reply .write-link { margin-top: 10px; font-size: 12px; }
    .auto-reply .postmark { display: none; }
    .scroll-cue { display: none; }
    .wander-button { right: 16px; bottom: max(28px, env(safe-area-inset-bottom)); }
    .scene-status { top: auto; right: auto; left: 20px; bottom: 82px; }
  }
  @media (max-width: 350px) {
    .hero-copy { left: 16px; width: calc(100% - 32px); }
    h1 { font-size: clamp(39px, 13.1vw, 44px); }
    .event-status { font-size: 14px; }
    .explore-card { padding: 18px; }
    .explore-actions button { padding: 0 14px; font-size: 14px; }
  }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition: none !important; } }
</style>
