<script>
  import { onMount } from 'svelte';
  import CommunityApplication from './CommunityApplication.svelte';
  let applicationOpen = false;
  let field;
  let selected = null;
  let hovered = null;
  let infoOpen = false;
  let inView = false;
  let pageVisible = true;
  const photos = Array.from({ length: 6 }, (_, i) => ({
    src: null, alt: '', label: 'Memory ' + String(i + 1).padStart(2, '0'),
    angle: [-7,5,-3,6,-5,3][i], duration: [30,34,28,32,29,31][i],
    delay: [-5,-17,-10,-24,-2,-20][i]
  }));
  function outside(event) {
    if (!event.target.closest?.('.floating-photo')) selected = null;
    if (!event.target.closest?.('.motion-info')) infoOpen = false;
  }
  onMount(() => {
    const observer = new IntersectionObserver(([entry]) => inView = entry.isIntersecting);
    observer.observe(field);
    const visibility = () => pageVisible = !document.hidden;
    visibility();
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); document.removeEventListener('visibilitychange', visibility); };
  });
</script>

<svelte:window on:pointerdown={outside} on:keydown={(event) => { if (event.key === 'Escape') { selected = null; infoOpen = false; } }} />
<section class="rising-photos chapter" aria-labelledby="memories-title">
  <header>
    <p class="eyebrow">COMMUNITY &gt; CALENDAR INVITES</p>
    <h2 id="memories-title">The best memories are slightly blurry.</h2>
    <p>Music, art, games, shared snacks and the conversation you remember on Monday. Find your people, away from the everyday.</p>
    <button class="apply-button ui-action" type="button" on:click={() => applicationOpen = true}>Apply to join</button>
    <p class="hint">Application preview · submissions opening later.</p>
    <div class="motion-info" role="group" aria-label="Photo motion controls" on:pointerenter={(event) => { if (event.pointerType === 'mouse') infoOpen = true; }} on:pointerleave={() => infoOpen = false} on:focusin={() => infoOpen = true} on:focusout={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) infoOpen = false; }}>
      <button class="info-button" type="button" aria-label="Photo motion help" aria-expanded={infoOpen} aria-controls="motion-help" on:click={() => infoOpen = true}>i</button>
      <div class="info-popup" id="motion-help" hidden={!infoOpen}>
        <p class="hint" id="floating-hint">Tap a memory to hold it. Tap outside to let it float.</p>
      </div>
    </div>
  </header>
  <div class="photo-field" bind:this={field} class:stopped={!inView || !pageVisible || applicationOpen}>
    {#each photos as photo, i}
      <div class="floating-photo" class:held={selected === i || hovered === i}
        style={`--angle:${photo.angle}deg; --lane:${i}; --mobile-lane:${i % 3}; --duration:${photo.duration}s; --delay:${photo.delay}s`}>
        <button class="photo-print" type="button" aria-label={`Hold ${photo.label}`} aria-pressed={selected === i} aria-describedby="floating-hint"
          on:pointerenter={(event) => { if (event.pointerType === 'mouse') hovered = i; }}
          on:pointerleave={() => hovered = null}
          on:click={() => selected = selected === i ? null : i}>
          {#if photo.src}<img src={photo.src} alt={photo.alt} loading="lazy" width="400" height="480" draggable="false" />{:else}<span class="photo-placeholder">Photo to come</span>{/if}
          <span class="caption">{photo.label}</span>
        </button>
      </div>
    {/each}
  </div>
</section>
{#if applicationOpen}<CommunityApplication onClose={() => applicationOpen = false} />{/if}

<style>
  .rising-photos { overflow: clip; padding-bottom: 32px; }
  header { text-align: center; max-width: 480px; margin: 0 auto 24px; }
  header > p:not(.eyebrow) { color: var(--muted); }
  .hint { font-size: 12px; }
  .motion-info { position: relative; width: fit-content; margin: 8px auto 0; z-index: 20; }
  .info-button { width: 44px; height: 44px; border: 0; background: transparent; color: var(--muted); font: italic 20px Georgia, serif; cursor: pointer; border-radius: 50%; }
  .info-button::before { content: ''; position: absolute; inset: 10px; border: 1px solid currentColor; border-radius: 50%; pointer-events: none; }
  .info-popup { position: absolute; top: 100%; left: 50%; transform: translateX(-50%); width: min(260px, calc(100vw - 48px)); padding: 16px; border: 1px solid var(--border-soft-deep); border-radius: 12px; background: var(--card-surface); color: var(--ink); box-shadow: 0 12px 30px #0003; }
  .info-popup p { margin: 0 0 10px; }
  .apply-button { min-height: 48px; padding: 12px 28px; border: 0; border-radius: 28px; background: var(--ink); color: var(--bg); font: 600 14px var(--sans); cursor: pointer; }
  .photo-field { position: relative; --field-height: 680px; height: var(--field-height); max-width: 1200px; margin: auto; overflow: hidden; }
  .floating-photo { position: absolute; top: 100%; left: calc(var(--lane) * 15%); width: 24%; animation: photo-float var(--duration) linear var(--delay) infinite; }
  @keyframes photo-float {
    0% { transform: translateY(0); opacity: 0; }
    12%, 85% { opacity: 1; }
    100% { transform: translateY(calc(-1 * var(--field-height) - 100%)); opacity: 0; }
  }
  .floating-photo.held, .floating-photo:has(:focus-visible), .stopped .floating-photo { animation-play-state: paused; }
  .floating-photo.held, .floating-photo:has(:focus-visible) { z-index: 10; }
  .photo-print { display: block; width: 100%; padding: 10px 10px 0; border: 1px solid var(--border-soft-deep); background: var(--card-surface); color: var(--ink); box-shadow: 0 16px 34px #0002; transform: rotate(var(--angle)); transition: transform 350ms ease, box-shadow 350ms ease; cursor: pointer; }
  .held .photo-print, .photo-print:focus-visible { transform: rotate(0) scale(1.06); box-shadow: 0 24px 45px #0004; }
  .photo-placeholder, img { display: grid; place-items: center; width: 100%; aspect-ratio: 5 / 6; height: auto; object-fit: cover; background: var(--border-soft); color: var(--muted); font-size: 12px; }
  .caption { display: block; padding: 14px 4px; font: 13px var(--marker); }
  @media (max-width: 650px) {
    .photo-field { --field-height: 520px; margin-inline: -12px; }
    .floating-photo { width: 39%; left: calc(var(--mobile-lane) * 30%); }
    .photo-print { padding: 6px 6px 0; }
    .caption { font-size: 11px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .motion-info { display: none; }
    .photo-field { height: auto; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 28px; padding: 20px; }
    .floating-photo { animation: none; position: static; width: 100%; }
    .photo-print { transition: none; }
    .held .photo-print, .photo-print:focus-visible { transform: rotate(var(--angle)); }
  }
</style>
