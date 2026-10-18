<script>
  import { onDestroy, onMount, tick } from 'svelte';
  import { releaseUnwindPhotos } from './eventPhotos.js';

  // Photos only, no titles on screen: the pictures speak for themselves
  // (Charisa, 18 Oct). Screen readers get each photo's alt text.
  const slides = releaseUnwindPhotos.map((photo, index) => ({ ...photo, label: `Photo ${String(index + 1).padStart(2, '0')}` }));

  let active = 0;
  let reducedMotion = false;
  let pointer = null;
  let dragX = 0;
  let dragging = false;
  let lightboxOpen = false;
  let lightboxClose;
  let opener;
  onDestroy(() => { document.body.style.overflow = ''; });

  onMount(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => reducedMotion = preference.matches;
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  });

  function goTo(index) {
    active = (index + slides.length) % slides.length;
    dragX = 0;
  }

  function onWindowKeydown(event) {
    if (!document.activeElement?.closest('#photo-showcase')) return;
    if (event.key === 'Escape' && lightboxOpen) {
      closeLightbox();
      return;
    }
    if (lightboxOpen || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? slides.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1));
  }

  async function openLightbox(event) {
    opener = event.currentTarget;
    lightboxOpen = true;
    document.body.style.overflow = 'hidden';
    await tick();
    lightboxClose?.focus();
  }

  function closeLightbox() {
    lightboxOpen = false;
    document.body.style.overflow = '';
    tick().then(() => opener?.focus());
  }

  function trapLightbox(event) {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    lightboxClose?.focus();
  }

  function pointerDown(event) {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('button')) return;
    pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function pointerMove(event) {
    if (!pointer || event.pointerId !== pointer.id) return;
    const x = event.clientX - pointer.x;
    const y = event.clientY - pointer.y;
    if (!dragging && Math.abs(y) > Math.abs(x) && Math.abs(y) > 8) {
      cancelDrag();
      return;
    }
    if (Math.abs(x) > 8) dragging = true;
    if (dragging) dragX = Math.max(-120, Math.min(120, x));
  }

  function pointerUp(event) {
    if (!pointer || event.pointerId !== pointer.id) return;
    if (dragging && Math.abs(dragX) > 48) goTo(active + (dragX < 0 ? 1 : -1));
    cancelDrag();
  }

  function cancelDrag() {
    pointer = null;
    dragX = 0;
    dragging = false;
  }

</script>

<svelte:window on:keydown={onWindowKeydown} />

<section class="showcase chapter" id="photo-showcase" aria-labelledby="showcase-title">
  <div class="showcase-heading">
    <p class="eyebrow">OUR COMMUNITY</p>
    <h2 id="showcase-title">Different people. Shared experiences. Room for everyone.</h2>
    <p class="showcase-intro">Moments from Release and Unwind at Tarkwa Bay.</p>
  </div>

  <div class="showcase-carousel" role="region" aria-roledescription="carousel" aria-label="Photos from Release and Unwind">
    <div class="showcase-stage" role="group" aria-label="Swipe to change photo. Use the arrow keys when focused." tabindex="-1" class:dragging on:pointerdown={pointerDown} on:pointermove={pointerMove} on:pointerup={pointerUp} on:pointercancel={cancelDrag} on:lostpointercapture={cancelDrag}>
      {#each slides as slide, index (slide.label)}
        {@const offset = (index - active + slides.length) % slides.length}
        {@const signedOffset = offset <= slides.length / 2 ? offset : offset - slides.length}
        <article class="showcase-card" class:active={offset === 0} aria-hidden={offset !== 0} inert={offset !== 0} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`} style={`--offset:${signedOffset}; --order:${slides.length - Math.abs(signedOffset)}; --drag:${offset === 0 && !reducedMotion ? dragX : 0}px; --motion:${reducedMotion ? '0ms' : '520ms'}`}>
          <button class="photo-open" type="button" aria-label={`Enlarge photo: ${slide.alt}`} on:click={openLightbox}>
            <div class="photo-slot">
              <img src={slide.src} alt={slide.alt} loading={offset === 0 ? 'eager' : 'lazy'} width="1280" height="720" />
            </div>
          </button>
        </article>
      {/each}
    </div>

    <div class="showcase-controls" role="group" aria-label="Choose a showcase photo">
      <button class="step ui-action" type="button" aria-label="Previous photo" on:click={() => goTo(active - 1)}><span aria-hidden="true">←</span></button>
      <div class="picks">
        {#each slides as slide, index}
          <button class="pick" class:current={index === active} type="button" aria-label={`Show ${slide.label} of ${slides.length}`} aria-current={index === active ? 'true' : undefined} aria-pressed={index === active} on:click={() => goTo(index)}><span aria-hidden="true"></span></button>
        {/each}
      </div>
      <button class="step ui-action" type="button" aria-label="Next photo" on:click={() => goTo(active + 1)}><span aria-hidden="true">→</span></button>
    </div>
    <p class="sr-only" role="status" aria-atomic="true">Photo {active + 1} of {slides.length}.</p>
  </div>
</section>

{#if lightboxOpen}
  <div class="lightbox" role="presentation" on:click={(event) => event.target === event.currentTarget && closeLightbox()}>
    <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="Photo from Release and Unwind" tabindex="-1" on:keydown={trapLightbox}>
      <button class="lightbox-close" bind:this={lightboxClose} type="button" aria-label="Close photo" on:click={closeLightbox}>×</button>
      <div class="lightbox-image">
        <img src={slides[active].src} alt={slides[active].alt} />
      </div>
    </div>
  </div>
{/if}

<style>
  /* hidden for Safari < 16, which ignores `clip` and would zoom the whole page out to fit the overflow. */
  .showcase { background: #f2eee2; overflow: hidden; }
  @supports (overflow: clip) { .showcase { overflow: clip; } }
  .showcase-heading { max-width: 720px; margin: 0 auto 34px; text-align: center; }
  .showcase-heading h2 { margin: 6px 0 10px; font: 400 clamp(36px, 5vw, 58px)/1.05 var(--serif); letter-spacing: -.04em; text-wrap: balance; }
  .showcase-intro { margin: 0 auto; color: var(--muted); font-size: 15px; }
  .showcase-carousel { max-width: 980px; margin: 0 auto; }
  .showcase-stage { position: relative; height: 448px; outline: none; perspective: 1200px; touch-action: pan-y pinch-zoom; user-select: none; cursor: grab; }
  .showcase-stage.dragging { cursor: grabbing; }
  .showcase-card { position: absolute; top: 0; left: 50%; width: min(410px, 72vw); height: 440px; padding: 0; overflow: hidden; border: 1px solid #cdc9b8; border-radius: 22px; background: #faf8f2; box-shadow: 0 24px 50px #243e3c29; transform: translateX(calc(-50% + var(--offset) * 260px + var(--drag))) rotateY(calc(var(--offset) * -30deg)) scale(calc(1 - min(abs(var(--offset)), 2) * .13)); opacity: calc(1 - min(abs(var(--offset)), 2) * .2); transition: transform var(--motion) var(--ease-out-expo), opacity var(--motion) ease; transform-origin: center 80%; z-index: var(--order); }
  .showcase-stage.dragging .showcase-card { transition: none; }
  .showcase-card:not(.active) { pointer-events: none; }
  .photo-open { display: block; width: 100%; height: 100%; padding: 0; border: 0; background: none; color: inherit; text-align: left; cursor: zoom-in; }
  .photo-open:focus-visible { outline: 2px solid var(--pink-deep); outline-offset: -5px; }
  .photo-slot { height: 100%; overflow: hidden; background: #e6e2d3; }
  .photo-slot img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .showcase-controls { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 18px; }
  .step { display: grid; place-items: center; width: 44px; height: 44px; border: 1.5px solid var(--deep); border-radius: 50%; background: #faf8f2; color: var(--deep); font-size: 19px; cursor: pointer; transition: transform 150ms ease, background 150ms ease, box-shadow 150ms ease; }
  .step:focus-visible { outline: 2px solid var(--deep); outline-offset: 4px; }
  .step:hover { background: #e6ebe3; }
  .step:active { transform: translateY(1px) scale(.9); box-shadow: inset 0 2px 4px #243e3c2e; }
  .picks { display: flex; align-items: center; gap: 8px; }
  .pick { display: grid; place-items: center; width: 44px; height: 44px; padding: 0; border: 0; border-radius: 999px; background: transparent; cursor: pointer; transition: transform 150ms ease; }
  .pick span { display: block; width: 8px; height: 8px; border-radius: 999px; background: #b4b1a0; transition: transform 150ms ease, background 150ms ease, width 150ms ease; }
  .pick:focus-visible { outline: 2px solid var(--deep); outline-offset: 5px; }
  .pick:active { transform: scale(.88); }
  .pick.current span { width: 22px; background: #376a65; }
  .lightbox { position: fixed; z-index: 100; inset: 0; display: grid; place-items: center; padding: 24px; background: #172725d9; }
  .lightbox-dialog { position: relative; width: min(760px, 100%); padding: 18px; border-radius: 18px; background: #faf8f2; box-shadow: 0 24px 80px #0006; }
  .lightbox-close { position: absolute; z-index: 1; top: 10px; right: 12px; width: 40px; height: 40px; border: 0; border-radius: 50%; background: #243e3c; color: #faf8f2; font-size: 26px; line-height: 1; cursor: pointer; }
  .lightbox-image { display: grid; place-items: center; min-height: 360px; border-radius: 10px; background: repeating-linear-gradient(135deg, #e6e2d3 0 12px, #ded9c8 12px 24px); color: #586a67; text-align: center; }
  .lightbox-image img { width: 100%; max-height: 70vh; object-fit: contain; border-radius: 10px; }
  @media (max-width: 650px) {
    .showcase-stage { height: 410px; }
    .showcase-card { width: min(360px, 82vw); height: 402px; }
    .showcase-card { transform: translateX(calc(-50% + var(--offset) * 170px + var(--drag))) rotateY(calc(var(--offset) * -20deg)) scale(calc(1 - min(abs(var(--offset)), 2) * .1)); }
  }
  @media (prefers-reduced-motion: reduce) { .showcase-card { transition: none; } }
</style>
