<script>
  import { onMount } from 'svelte';
  import { editionCovers, flyers, openCanvasPhotos, releaseUnwindPhotos } from './eventPhotos.js';
  let field;
  let selected = null;
  let hovered = null;
  let infoOpen = false;
  let inView = false;
  let pageVisible = true;
  // Every event photo, interleaved so editions mix. Each lane's photos are
  // evenly spaced in time (negative delays), so the field is already full the
  // moment it scrolls into view and prints in one lane never collide.
  const cover = (code, edition) => ({ src: editionCovers[code].src, alt: editionCovers[code].alt, edition });
  const oc = [...openCanvasPhotos, cover('0x02', 'Open Canvas')];
  const ru = [...releaseUnwindPhotos, cover('0x03', 'Release and Unwind')];
  const mix = [cover('0x01', 'The First Hangout')];
  for (let i = 0; i < Math.max(oc.length, ru.length); i++) mix.push(...[oc[i], ru[i]].filter(Boolean));
  // Flyers spread through the mix; two land in the first nine that phones show.
  mix.splice(3, 0, flyers.firstHangout1);
  mix.splice(7, 0, flyers.openCanvas);
  mix.splice(12, 0, flyers.releaseUnwind);
  mix.splice(16, 0, flyers.firstHangout2);
  const LANES = 7, MOBILE_LANES = 3, MOBILE_COUNT = 9;
  const perLane = (lane, lanes, count) => Math.ceil((count - lane) / lanes);
  const photos = mix.map((photo, i) => {
    const lane = i % LANES, duration = 30 + lane * 1.3;
    const mobileLane = i % MOBILE_LANES, mobileDuration = 36 + mobileLane * 2;
    return {
      ...photo,
      label: photo.edition,
      angle: [-7, 5, -3, 6, -5, 3, -4, 7][i % 8],
      lane, duration,
      delay: -((duration * Math.floor(i / LANES)) / perLane(lane, LANES, mix.length) + lane * 3.7) % duration,
      mobileLane, mobileDuration,
      mobileDelay: -((mobileDuration * Math.floor(i / MOBILE_LANES)) / perLane(mobileLane, MOBILE_LANES, MOBILE_COUNT) + mobileLane * 5) % mobileDuration,
      mobileHidden: i >= MOBILE_COUNT,
    };
  });
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
    <p class="eyebrow">FROM OUR EDITIONS</p>
    <h2 id="memories-title">We're creating more than events.</h2>
    <p>Through thoughtfully curated hangouts, creative experiences, outdoor retreats, and community gatherings, we create spaces where everyone has room to participate, express themselves, feel included, and make meaningful connections.</p>
    <p>We're creating room to live, feel, connect, and experience life differently.</p>
    <a class="apply-button ui-action" href="#passes">See 0x04 status</a>
    <p class="hint">November 2026 · exact date and venue to be announced.</p>
    <div class="motion-info" role="group" aria-label="Photo motion controls" on:pointerenter={(event) => { if (event.pointerType === 'mouse') infoOpen = true; }} on:pointerleave={() => infoOpen = false} on:focusin={() => infoOpen = true} on:focusout={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) infoOpen = false; }}>
      <button class="info-button" type="button" aria-label="Photo motion help" aria-expanded={infoOpen} aria-controls="motion-help" on:click={() => infoOpen = true}>i</button>
      <div class="info-popup" id="motion-help" hidden={!infoOpen}>
        <p class="hint">Tap a photo to hold it. Tap outside to let it float.</p>
      </div>
    </div>
  </header>
  <div class="photo-field" bind:this={field} class:stopped={!inView || !pageVisible}>
    {#each photos as photo, i}
      <div class="floating-photo" class:held={selected === i || hovered === i} class:mobile-hidden={photo.mobileHidden}
        style={`--angle:${photo.angle}deg; --lane:${photo.lane}; --mobile-lane:${photo.mobileLane}; --duration:${photo.duration}s; --delay:${photo.delay.toFixed(2)}s; --m-duration:${photo.mobileDuration}s; --m-delay:${photo.mobileDelay.toFixed(2)}s`}>
        <button class="photo-print" type="button" aria-label={`Hold ${photo.label} photo`} aria-pressed={selected === i}
          on:pointerenter={(event) => { if (event.pointerType === 'mouse') hovered = i; }}
          on:pointerleave={() => hovered = null}
          on:click={() => selected = selected === i ? null : i}>
          <img src={photo.src} alt={photo.alt} loading="lazy" width="400" height="480" draggable="false" />
          <span class="caption">{photo.label}</span>
        </button>
      </div>
    {/each}
  </div>
</section>

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
  .apply-button { display: inline-flex; align-items: center; justify-content: center; min-height: 48px; padding: 12px 28px; border: 0; border-radius: 28px; background: var(--ink); color: var(--bg); font: 600 14px var(--sans); text-decoration: none; cursor: pointer; }
  .photo-field { position: relative; --field-height: 900px; height: var(--field-height); max-width: 1200px; margin: auto; overflow: hidden; }
  .floating-photo { position: absolute; top: 100%; left: calc(var(--lane) * 13.4%); width: 19.6%; animation: photo-float var(--duration) linear var(--delay) infinite; }
  @keyframes photo-float {
    0% { transform: translateY(0); opacity: 0; }
    12%, 85% { opacity: 1; }
    100% { transform: translateY(calc(-1 * var(--field-height) - 100%)); opacity: 0; }
  }
  .floating-photo.held, .floating-photo:has(:focus-visible), .stopped .floating-photo { animation-play-state: paused; }
  .floating-photo.held, .floating-photo:has(:focus-visible) { z-index: 10; }
  .photo-print { display: block; width: 100%; padding: 10px 10px 0; border: 1px solid var(--border-soft-deep); background: var(--card-surface); color: var(--ink); box-shadow: 0 16px 34px #0002; transform: rotate(var(--angle)); transition: transform 350ms ease, box-shadow 350ms ease; cursor: pointer; }
  .held .photo-print, .photo-print:focus-visible { transform: rotate(0) scale(1.06); box-shadow: 0 24px 45px #0004; }
  .photo-print img { display: block; width: 100%; aspect-ratio: 5 / 6; height: auto; object-fit: cover; background: var(--border-soft); }
  .caption { display: block; padding: 14px 4px; font: 13px var(--marker); }
  @media (max-width: 650px) {
    .photo-field { --field-height: 620px; margin-inline: -12px; }
    .floating-photo { width: 39%; left: calc(var(--mobile-lane) * 30%); animation-duration: var(--m-duration); animation-delay: var(--m-delay); }
    .floating-photo.mobile-hidden { display: none; }
    .photo-print { padding: 6px 6px 0; }
    .caption { font-size: 11px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .motion-info { display: none; }
    .photo-field { height: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 28px; padding: 20px; }
    .floating-photo.mobile-hidden { display: block; }
    .floating-photo { animation: none; position: static; width: 100%; }
    .photo-print { transition: none; }
    .held .photo-print, .photo-print:focus-visible { transform: rotate(var(--angle)); }
  }
</style>
