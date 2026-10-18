<script>
  import { onMount } from 'svelte';

  import { editions } from './editions.js';
  import EditionArtwork from './EditionArtwork.svelte';
  import { editionPosters, openCanvasVideos } from './eventPhotos.js';
  import VideoDialog from './VideoDialog.svelte';

  // The deck shows each edition's poster (the trail keeps the event photos).
  const deck = editions.map((e) => editionPosters[e.code] ? { ...e, image: editionPosters[e.code].src, imageAlt: editionPosters[e.code].alt, imageRatio: editionPosters[e.code].ratio, imageKind: 'event' } : e);

  // Videos only exist for Open Canvas (0x02) so far.
  const videosByEdition = { '0x02': openCanvasVideos };
  let player;
  const openVideos = () => player.open();

  let active = 0;
  let pointer = null;
  let dragX = 0;
  let dragging = false;
  let reducedMotion = false;
  $: current = editions[active];

  onMount(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => reducedMotion = preference.matches;
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  });

  function goTo(index) {
    active = (index + editions.length) % editions.length;
    dragX = 0;
  }
  function onKeydown(event) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    goTo(event.key === 'Home' ? 0 : event.key === 'End' ? editions.length - 1 : active + (event.key === 'ArrowRight' ? 1 : -1));
  }
  function pointerDown(event) {
    if (!event.isPrimary || event.button !== 0 || event.target.closest('a, button')) return;
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
    if (dragging && Math.abs(dragX) > 55) goTo(active + (dragX < 0 ? 1 : -1));
    cancelDrag();
  }
  function cancelDrag() { pointer = null; dragX = 0; dragging = false; }
</script>

<section id="past-editions" class="archive chapter" aria-labelledby="archive-title">
  <div class="archive-inner">
    <div class="archive-intro">
      <p class="eyebrow">THE THINGS WE KEEP</p>
      <h2 id="archive-title">Three editions.<br />A little more room.</h2>
    </div>

    <div class="carousel" role="region" aria-roledescription="carousel" aria-label="Past editions">
      <div class="deck" role="group" aria-label="Swipe sideways to change edition" class:dragging on:pointerdown={pointerDown} on:pointermove={pointerMove} on:pointerup={pointerUp} on:pointercancel={cancelDrag} on:lostpointercapture={cancelDrag}>
        {#each deck as edition, i (edition.code)}
          {@const depth = (i - active + editions.length) % editions.length}
          <article class="edition-card" class:front={depth === 0} aria-hidden={depth !== 0} inert={depth !== 0} style={`--depth:${depth}; --rotation:${depth === 0 ? -1.5 : depth === 1 ? 4 : -5}deg; --tone:${edition.tone}; --card-w:${edition.imageKind === 'event' && edition.imageRatio < 1 ? `min(100%, calc(430px * ${edition.imageRatio} + 24px))` : '100%'}; --drag:${depth === 0 && !reducedMotion ? dragX : 0}px; z-index:${editions.length - depth}`}>
            <EditionArtwork {edition} natural />
            {#if videosByEdition[edition.code]}
              <button class="card-play" type="button" aria-label={`Watch ${edition.title} · ${videosByEdition[edition.code].length} clips`} on:click={openVideos}><span aria-hidden="true">▶</span> {videosByEdition[edition.code].length} clips</button>
            {/if}
            <div class="card-copy">
              <p class="edition-meta">{edition.code} <span aria-hidden="true">/</span> {edition.date}</p>
              <h3>{edition.title}</h3>
              <p class="location">{edition.location}</p>
              <p class="caption">{edition.note}</p>
            </div>
          </article>
        {/each}
      </div>
      <div class="controls" role="group" aria-label="Choose an edition">
        <button class="step ui-action" type="button" aria-label="Previous edition" on:keydown={onKeydown} on:click={() => goTo(active - 1)}><span aria-hidden="true">←</span></button>
        <div class="picks">
          {#each editions as edition, i}
            <button class="pick" class:selected={i === active} type="button" aria-label={`Show ${edition.title}${videosByEdition[edition.code] ? ' (has video)' : ''}`} aria-pressed={i === active} on:keydown={onKeydown} on:click={() => goTo(i)}><span aria-hidden="true">{String(i + 1).padStart(2, '0')}{#if videosByEdition[edition.code]}<span class="has-video">▶</span>{/if}</span></button>
          {/each}
        </div>
        <button class="step ui-action" type="button" aria-label="Next edition" on:keydown={onKeydown} on:click={() => goTo(active + 1)}><span aria-hidden="true">→</span></button>
      </div>
      <p class="swipe-hint">Swipe the cards, or use the arrows.</p>
      <p class="sr-only" role="status" aria-atomic="true">Edition {active + 1} of {editions.length}: {current.title}, {current.location}, {current.date}.</p>
    </div>

    <div id="edition-details" class="details">
      <p class="story-meta"><strong>{current.title}</strong><br />{current.location} · {current.date}</p>
      {#each current.story as paragraph}
        <p>{paragraph}</p>
      {/each}
      {#if videosByEdition[current.code]}
        <button class="watch-button ui-action" type="button" on:click={openVideos}><span aria-hidden="true">▶</span> Watch {current.title} · {videosByEdition[current.code].length} clips</button>
      {/if}
      <a class="text-link" href={`#/trail/${current.code}`}>View this edition in the trail <span aria-hidden="true">↗</span></a>
      <a class="text-link" href="#/trail">Explore the event trail <span aria-hidden="true">↗</span></a>
    </div>
  </div>
</section>

<VideoDialog bind:this={player} clips={openCanvasVideos} title="Open Canvas" meta="30 May 2026 · Jaekel House Garden" slug="open-canvas" />

<style>
  .watch-button { display: inline-flex; align-items: center; gap: 10px; min-height: 44px; margin: 4px 0 14px; padding: 10px 20px; border: 0; border-radius: 999px; background: var(--ink); color: var(--bg); font: 600 14px var(--sans); cursor: pointer; }
  .has-video { margin-left: 3px; font-size: 9px; color: var(--pink-deep); vertical-align: 2px; }
  .card-play { position: absolute; z-index: 3; top: 22px; right: 22px; display: inline-flex; align-items: center; gap: 6px; min-height: 36px; padding: 6px 14px; border: 0; border-radius: 999px; background: #181818d9; color: #fff; font: 600 12px var(--sans); cursor: pointer; }
  .card-play:focus-visible { outline: 2px solid var(--pink-deep); outline-offset: 2px; }
  /* One clips button per layout: beside the story on desktop, on the poster on
     phones (where the story is far below the card). */
  .card-play { display: none; }
  /* hidden for Safari < 16, which ignores `clip` and would zoom the whole page out to fit the overflow. */
  .archive { background: #e4e9e1; overflow: hidden; }
  @supports (overflow: clip) { .archive { overflow: clip; } }
  /* The chosen edition's story sits beside the cards, under the heading; on
     phones it follows the cards. */
  .archive-inner { max-width: 1140px; margin: auto; display: grid; grid-template-columns: 1fr 1fr; grid-template-areas: "intro carousel" "details carousel"; grid-template-rows: auto 1fr; column-gap: clamp(32px, 6vw, 88px); row-gap: 28px; align-items: start; }
  .archive-intro { grid-area: intro; }
  h2 { max-width: 520px; }
  .carousel { grid-area: carousel; min-width: 0; width: 100%; max-width: 470px; justify-self: center; }
  .deck { position: relative; display: grid; margin: 22px 18px 42px; touch-action: pan-y pinch-zoom; user-select: none; cursor: grab; }
  .deck.dragging { cursor: grabbing; }
  .edition-card { grid-area: 1 / 1; min-width: 0; width: var(--card-w); justify-self: center; align-self: end; padding: 12px; border: 1px solid #d1d2c6; border-radius: 5px; background: #faf8f2; box-shadow: 0 15px 32px -16px #243e3c45; transform: translate(var(--drag), calc(var(--depth) * 14px)) rotate(var(--rotation)) scale(calc(1 - var(--depth) * .025)); transform-origin: 50% 85%; transition: transform 550ms var(--ease-out-expo), box-shadow 250ms ease; }
  .dragging .front { transition: box-shadow 250ms ease; }
  .card-copy { padding: 20px 10px 14px; }
  .edition-meta { margin: 0 0 12px; font-size: 10px; letter-spacing: .09em; text-transform: uppercase; color: var(--muted); }
  .edition-meta span { margin: 0 10px; }
  h3 { margin: 0 0 12px; font: 400 clamp(23px, 2.7vw, 33px)/1.18 var(--serif); letter-spacing: -.025em; }
  .location { margin: 0; font-size: 13px; }
  .caption { margin: 10px 0 0; color: var(--muted); font-size: 13px; line-height: 1.6; }
  .controls { display: flex; justify-content: center; align-items: center; gap: clamp(10px, 3vw, 24px); }
  .step { min-width: 46px; min-height: 46px; border: 1px solid var(--deep); border-radius: 50%; background: transparent; color: var(--ink); font-size: 20px; cursor: pointer; }
  .picks { display: flex; gap: 4px; }
  .pick { width: 44px; min-height: 44px; border: 0; border-bottom: 2px solid transparent; border-radius: 0; background: none; color: var(--muted); font: 500 12px var(--sans); cursor: pointer; transition: color 180ms, border-color 180ms; }
  .pick.selected { color: var(--ink); border-color: var(--deep); }
  .swipe-hint { text-align: center; color: var(--muted); font-size: 12px; margin: 14px 0 6px; }
  .details .story-meta { font-size: 13px; color: var(--muted); }
  .details p:not(.story-meta) { line-height: 1.75; }
  .details { grid-area: details; max-width: 460px; font-size: 15px; }
  .details .text-link { display: flex; width: fit-content; }
  .details p { margin: 0 0 12px; }
  @media (hover: hover) and (pointer: fine) { .deck:not(.dragging):hover .front { transform: translateY(-4px) rotate(0deg); box-shadow: 0 22px 38px -18px #243e3c55; } }
  @media (max-width: 760px) {
    .archive-inner { grid-template-columns: minmax(0, 1fr); grid-template-areas: "intro" "carousel" "details"; grid-template-rows: none; row-gap: 24px; }
    .deck { margin-inline: 12px; }
    .card-play { display: inline-flex; }
    .watch-button { display: none; }
  }
  @media (prefers-reduced-motion: reduce) { .edition-card { transition: none; } .deck:not(.dragging):hover .front { transform: rotate(-1.5deg); } }
</style>
