<script>
  import { onMount, onDestroy, tick } from 'svelte';
  import { muted } from './ambientSound.js';

  export let onOpenDrawer = () => {};
  export let onOpenOooGen = () => {};
  export let onScrollToContent = () => {};

  let section;
  let stage;
  let wanderButton;
  let exploreCard;
  let scene = null;
  let status = 'idle';
  let message = '';
  let destroyed = false;
  let viewMode = 'preview';

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
      if (destroyed) return;
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
    nearObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        nearObserver.disconnect();
        mountScene();
      }
    }, { rootMargin: '100% 0px' });
    nearObserver.observe(section);
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

<section id="shallows" class="hero" class:exploring={viewMode === 'explore'} bind:this={section} aria-label="Out of Office water">
  <div class="stage" bind:this={stage}></div>

  {#if viewMode === 'preview'}
    <div class="preview-wash" aria-hidden="true"></div>
    <div class="hero-copy">
      <p class="eyebrow">OUT OF OFFICE</p>
      <h1>Away from<br />the everyday.</h1>
      <p class="description">A little space to slow down.<br />Leave the rush on the other side.</p>
      <p class="event-status">0x04 <span aria-hidden="true">·</span> November <span aria-hidden="true">·</span> date TBA</p>
      <button type="button" class="primary-button" on:click={onOpenDrawer}>Get your pass <span aria-hidden="true">↗</span></button>
    </div>

    <aside class="auto-reply" aria-label="An Out of Office auto-reply">
      <span class="tape" aria-hidden="true"></span>
      <p class="mail-label">THE AUTO REPLY</p>
      <p class="subject"><span>Subject</span><br />Auto-reply: back when my social battery gets recharged</p>
      <p class="mail-body">I am currently away from emails, responsibilities, and Lagos stress.</p>
      <button type="button" class="write-link" on:click={onOpenOooGen}>Write your own <span aria-hidden="true">→</span></button>
      <span class="postmark" aria-hidden="true">OUT OF<br />OFFICE<br /><strong>0x04</strong></span>
    </aside>

    <button type="button" class="scroll-cue" aria-label="Scroll to the rest of the page" on:click={onScrollToContent}>↓</button>
    <button type="button" class="wander-button" bind:this={wanderButton} disabled={status === 'failed' || status === 'context-lost'} on:click={() => showView('explore')}>
      Wander the water <span aria-hidden="true">↗</span>
    </button>
  {:else}
    <div class="explore-card" tabindex="-1" bind:this={exploreCard}>
      <p class="eyebrow">TAKE A MOMENT</p>
      <p class="explore-hint">Drag to wander.<br />Tap to ripple.</p>
      <div class="explore-actions">
        <button type="button" on:click={() => showView('preview')}>← Back to the page</button>
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
  .hero {
    --water-ink: var(--color-ink, #243e3c);
    --water-deep: var(--color-deep, #376a65);
    --water-paper: var(--color-paper, #f2efe8);
    position: relative;
    isolation: isolate;
    height: 100svh;
    min-height: 590px;
    overflow: hidden;
    color: var(--water-ink);
    background: linear-gradient(145deg, #e5eae2 5%, #92bcb3 55%, #376a65 100%);
  }
  .stage { position: absolute; inset: 0; z-index: 0; }
  .stage :global(.shallows-canvas) { display: block; width: 100%; height: 100%; pointer-events: none; }
  .exploring .stage :global(.shallows-canvas) { pointer-events: auto; }
  .stage :global(.shallows-canvas:focus-visible) { outline: 3px solid var(--water-paper); outline-offset: -6px; }
  .preview-wash {
    position: absolute; inset: 0; z-index: 1; pointer-events: none;
    background: linear-gradient(90deg, var(--water-paper) 0%, color-mix(in srgb, var(--water-paper) 94%, transparent) 20%, color-mix(in srgb, var(--water-paper) 69%, transparent) 46%, transparent 79%);
  }
  .hero-copy { position: absolute; z-index: 2; top: clamp(146px, 22vh, 226px); left: clamp(26px, 6vw, 100px); max-width: min(59vw, 770px); }
  .eyebrow { margin: 0; font-family: var(--marker); font-size: clamp(.82rem, 1.2vw, 1rem); letter-spacing: .025em; }
  h1 { margin: 19px 0 20px; font-family: var(--serif); font-size: clamp(4.3rem, 7.7vw, 8.6rem); line-height: .99; letter-spacing: -.065em; font-weight: 700; }
  .description { margin: 0 0 27px; font-size: clamp(1rem, 1.25vw, 1.22rem); line-height: 1.48; }
  .event-status { margin: 0 0 20px; font-family: var(--bungee); font-size: clamp(.85rem, 1.15vw, 1rem); letter-spacing: .01em; }
  .event-status span { margin: 0 .28em; }
  button { cursor: pointer; font: inherit; }
  button:focus-visible, .explore-card:focus-visible { outline: 3px solid var(--water-ink); outline-offset: 4px; }
  .primary-button { min-height: 47px; padding: 12px 23px; border: 1px solid var(--water-deep); border-radius: 99px; background: var(--water-deep); color: #faf8f2; font-weight: 700; }
  .primary-button:hover { background: var(--water-ink); }
  .auto-reply { position: absolute; z-index: 2; top: 38%; right: clamp(38px, 7vw, 124px); width: clamp(330px, 30vw, 465px); padding: 28px 30px 27px; transform: rotate(3deg); border: 1px solid #cad3cc; border-radius: 9px; background: #f8f7f2; box-shadow: 0 20px 45px #17393727; }
  .tape { position: absolute; top: -17px; left: 38%; width: 105px; height: 29px; transform: rotate(-4deg); background: #77aaa4c7; }
  .mail-label { margin: 0 0 20px; font-family: var(--marker); font-size: .82rem; color: var(--water-deep); }
  .subject { padding-bottom: 15px; border-bottom: 1px solid #cbd4cf; font-size: 1.02rem; line-height: 1.36; font-weight: 700; }
  .subject span { color: #586a67; font-size: .8rem; font-weight: 400; }
  .mail-body { max-width: 290px; font-family: var(--serif); font-size: clamp(1.3rem, 1.6vw, 1.7rem); line-height: 1.3; }
  .write-link { padding: 0; border: 0; background: none; color: var(--water-deep); font-weight: 700; text-decoration: underline; text-underline-offset: 4px; }
  .postmark { position: absolute; right: -25px; bottom: -35px; display: grid; place-content: center; width: 98px; height: 98px; transform: rotate(-13deg); border: 3px double var(--water-deep); border-radius: 50%; color: var(--water-deep); font-family: var(--bungee); font-size: .68rem; text-align: center; line-height: 1.1; }
  .postmark strong { font-size: 1.2rem; }
  .wander-button { position: absolute; z-index: 3; right: clamp(24px, 4vw, 60px); bottom: max(30px, env(safe-area-inset-bottom)); min-height: 46px; padding: 11px 20px; border: 1px solid var(--water-ink); border-radius: 99px; background: #f8f7f2e8; color: var(--water-ink); font-weight: 700; box-shadow: 0 3px 12px #17393719; }
  .wander-button:hover { background: #fff; }
  .wander-button:disabled { opacity: .5; cursor: not-allowed; }
  .scroll-cue { position: absolute; z-index: 2; bottom: 27px; left: 50%; width: 44px; height: 44px; transform: translateX(-50%); border: 0; background: transparent; color: var(--water-ink); font-size: 2rem; }
  .explore-card { position: absolute; z-index: 2; bottom: max(28px, env(safe-area-inset-bottom)); left: clamp(22px, 5vw, 80px); max-width: calc(100% - 44px); padding: 23px 27px; border: 1px solid #cad3cc; border-radius: 12px; background: #f8f7f2ed; box-shadow: 0 12px 32px #17393730; }
  .explore-hint { margin: 12px 0 21px; font-family: var(--serif); font-size: clamp(1.5rem, 2.2vw, 2.2rem); line-height: 1.15; }
  .explore-actions { display: flex; flex-wrap: wrap; gap: 8px; }
  .explore-actions button { min-height: 42px; padding: 8px 12px; border: 1px solid var(--water-deep); border-radius: 99px; background: transparent; color: var(--water-deep); font-size: .84rem; font-weight: 700; }
  .explore-actions button:hover { background: var(--water-deep); color: #fff; }
  .scene-status { position: absolute; z-index: 4; top: 102px; right: 30px; max-width: 220px; margin: 0; padding: 7px 11px; border-radius: 5px; background: #f8f7f2dd; font-size: .75rem; }
  .loading-status { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
  @media (max-width: 1100px) {
    .auto-reply { display: none; }
  }
  @media (max-width: 700px) {
    .hero { min-height: 600px; }
    .preview-wash { background: linear-gradient(180deg, var(--water-paper) 0%, color-mix(in srgb, var(--water-paper) 98%, transparent) 32%, color-mix(in srgb, var(--water-paper) 77%, transparent) 51%, transparent 75%); }
    .hero-copy { top: clamp(114px, 16vh, 152px); left: 24px; max-width: calc(100% - 48px); }
    h1 { margin: 14px 0 14px; font-size: clamp(3.35rem, 11.5vw, 5.2rem); line-height: 1.01; }
    .description { display: none; }
    .event-status { margin-bottom: 15px; font-size: .82rem; }
    .auto-reply, .scroll-cue { display: none; }
    .wander-button { right: 21px; bottom: max(22px, env(safe-area-inset-bottom)); }
    .explore-card { left: 20px; bottom: max(22px, env(safe-area-inset-bottom)); }
    .scene-status { top: auto; right: auto; left: 24px; bottom: 81px; }
  }
  @media (max-width: 365px) {
    .hero-copy { left: 18px; max-width: calc(100% - 36px); }
    h1 { font-size: 3rem; }
  }
  @media (prefers-reduced-motion: reduce) { *, *::before, *::after { scroll-behavior: auto !important; transition: none !important; } }
</style>
