<script>
  /* Hallmark · component: 3D cylindrical carousel · genre: playful
   * theme: existing project tokens (Escape palette, Fraunces/Space Grotesk/Bungee)
   * states: default · hover · focus · active(drag) · disabled(reduced-motion) · loading(n/a) · error(n/a) · success(n/a)
   *
   * Content is placeholder — every field below is marked with an em dash
   * or "placeholder" and must be swapped for real copy via the `items` prop
   * before shipping. See hallmark's honest-copy rule: no invented metrics.
   */
  import { onMount, onDestroy } from "svelte";
  import MorphText from "./MorphText.svelte";

  /** @type {Array<{badge?:string,title:string,meta:string,rating?:string,description:string,price?:string,image?:string}>} */
  export let items = [];
  export let eyebrow = "Featured showcase";
  export let heading = "Spin through the picks";

  const PLACEHOLDER_ITEMS = Array.from({ length: 6 }, (_, i) => ({
    badge: "— badge —",
    title: `— card ${i + 1} title —`,
    meta: "— location / context —",
    rating: "—",
    description: "Placeholder description — swap this copy for the real thing before shipping.",
    price: "— price —",
    image: "",
  }));

  $: cards = items.length ? items : PLACEHOLDER_ITEMS;
  $: count = cards.length;
  $: anglePerCard = count ? 360 / count : 0;

  let wheelEl;
  let stageEl;
  let cardWidth = 280;
  let radius = 420;

  // rotation is the live, continuous ring angle in degrees.
  let rotation = 0;
  let activeIndex = 0;
  let isDragging = false;
  let isTransitioning = false;
  let prefersReducedMotion = false;
  let paused = false;

  let dragStartX = 0;
  let dragStartRotation = 0;
  let dragMoved = false;

  let autoplayTimer;
  const AUTOPLAY_MS = 4500;

  function computeRadius() {
    if (!count) return;
    // Standard regular-polygon radius so adjacent cards just clear each other.
    radius = Math.round((cardWidth / 2) / Math.tan(Math.PI / count));
  }

  function normalizeAngle(deg) {
    let a = deg % 360;
    if (a < 0) a += 360;
    return a;
  }

  function syncActiveIndex() {
    const raw = normalizeAngle(-rotation) / anglePerCard;
    activeIndex = Math.round(raw) % count;
  }

  function goTo(index, { instant = false } = {}) {
    if (!count) return;
    const target = ((index % count) + count) % count;
    isTransitioning = !instant && !prefersReducedMotion;
    rotation = -target * anglePerCard;
    activeIndex = target;
  }

  function goNext() {
    goTo(activeIndex + 1);
  }
  function goPrev() {
    goTo(activeIndex - 1);
  }

  function restartAutoplay() {
    clearInterval(autoplayTimer);
    if (prefersReducedMotion) return;
    autoplayTimer = setInterval(() => {
      if (!paused && !isDragging) goNext();
    }, AUTOPLAY_MS);
  }

  function onPointerEnter() {
    paused = true;
  }
  function onPointerLeaveStage() {
    paused = false;
    if (isDragging) endDrag();
  }

  function onPointerDown(e) {
    isDragging = true;
    dragMoved = false;
    isTransitioning = false;
    dragStartX = e.clientX;
    dragStartRotation = rotation;
    wheelEl?.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 3) dragMoved = true;
    // Convert horizontal drag px into degrees; card-width driven so drag feel
    // stays consistent across viewport sizes.
    const sensitivity = 0.28;
    rotation = dragStartRotation + dx * sensitivity;
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    if (dragMoved) {
      syncActiveIndex();
      goTo(activeIndex);
    }
  }

  function onPointerUp() {
    endDrag();
  }

  function onCardClick(e, i) {
    if (dragMoved) {
      // Suppress the click that follows a drag release.
      dragMoved = false;
      return;
    }
    if (i !== activeIndex) {
      goTo(i);
    }
  }

  function onDetailsClick(item) {
    alert(`${item.title}\n\n${item.meta}\n${item.description}`);
  }

  // Two-finger trackpad swipe: wheel events with a horizontal-dominant delta
  // and no ctrlKey (ctrlKey means pinch-zoom, not a swipe). Debounced so one
  // physical swipe gesture maps to one card step, not a dozen.
  let wheelCooldown = false;
  let wheelAccumX = 0;
  function onWheel(e) {
    if (e.ctrlKey) return;
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (wheelCooldown) return;
    wheelAccumX += e.deltaX;
    const THRESHOLD = 40;
    if (Math.abs(wheelAccumX) > THRESHOLD) {
      wheelAccumX > 0 ? goNext() : goPrev();
      wheelAccumX = 0;
      wheelCooldown = true;
      setTimeout(() => (wheelCooldown = false), 350);
    }
  }

  function onKeydown(e) {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    }
  }

  function cardStyle(i) {
    const baseAngle = i * anglePerCard;
    const liveAngle = normalizeAngle(baseAngle + rotation);
    // Signed diff from front-and-center (-180..180) drives fade/dim.
    let diff = liveAngle;
    if (diff > 180) diff -= 360;
    const absDiff = Math.abs(diff);
    const opacity = Math.max(0.28, 1 - absDiff / 180);
    const brightness = Math.max(0.55, 1 - absDiff / 260);
    const isFront = i === activeIndex;
    const cardHeight = cardWidth * (4 / 3);
    return {
      transform: `rotateY(${baseAngle}deg) translateZ(${radius}px)`,
      opacity,
      filter: `brightness(${brightness})`,
      zIndex: Math.round(1000 - absDiff),
      isFront,
      marginLeft: -cardWidth / 2,
      marginTop: -cardHeight / 2,
    };
  }

  let resizeObserver;
  onMount(() => {
    prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    computeRadius();
    restartAutoplay();
    resizeObserver = new ResizeObserver(() => {
      cardWidth = stageEl ? Math.min(300, stageEl.clientWidth * 0.6) : cardWidth;
      computeRadius();
    });
    if (stageEl) resizeObserver.observe(stageEl);
    window.addEventListener("pointerup", onPointerUp);
  });
  onDestroy(() => {
    clearInterval(autoplayTimer);
    resizeObserver?.disconnect();
    window.removeEventListener("pointerup", onPointerUp);
  });
</script>

<section class="showcase">
  <div class="text-content">
    <p class="eyebrow"><MorphText text={eyebrow} /></p>
    <h2 class="heading">{heading}</h2>
  </div>

  <!-- WAI-ARIA carousel pattern: a focusable region that takes arrow keys.
       Svelte's lint treats region as non-interactive, so it's silenced here. -->
  <!-- svelte-ignore a11y_no_noninteractive_tabindex a11y_no_noninteractive_element_interactions -->
  <div
    class="stage"
    class:reduced={prefersReducedMotion}
    bind:this={stageEl}
    role="region"
    aria-roledescription="carousel"
    aria-label={heading}
    tabindex="0"
    on:pointerenter={onPointerEnter}
    on:pointerleave={onPointerLeaveStage}
    on:keydown={onKeydown}
    on:wheel={onWheel}
  >
    <div
      class="wheel"
      bind:this={wheelEl}
      class:transitioning={isTransitioning}
      class:dragging={isDragging}
      style="transform: rotateY({-rotation}deg);"
      role="presentation"
      on:pointerdown={onPointerDown}
      on:pointermove={onPointerMove}
      on:pointerup={onPointerUp}
      on:pointercancel={onPointerUp}
      on:transitionend={() => (isTransitioning = false)}
    >
      {#each cards as item, i (i)}
        {@const s = cardStyle(i)}
        <article
          class="card"
          class:front={s.isFront}
          style="transform: {s.transform}; opacity: {s.opacity}; filter: {s.filter}; z-index: {s.zIndex}; width: {cardWidth}px; margin-left: {s.marginLeft}px; margin-top: {s.marginTop}px;"
          on:click={(e) => onCardClick(e, i)}
          aria-hidden={!s.isFront}
        >
          <div class="card-media" style={item.image ? `background-image:url(${item.image})` : ""}>
            {#if !item.image}
              <span class="media-placeholder">— image —</span>
            {/if}
            {#if item.badge}
              <span class="badge">{item.badge}</span>
            {/if}
          </div>
          <div class="card-body">
            <div class="card-top">
              <h3 class="card-title">{item.title}</h3>
              {#if item.rating}<span class="rating">★ {item.rating}</span>{/if}
            </div>
            <p class="card-meta">{item.meta}</p>
            <p class="card-desc">{item.description}</p>
            <div class="card-foot">
              {#if item.price}<span class="price">{item.price}</span>{/if}
              <button class="btn-details" on:click|stopPropagation={() => onDetailsClick(item)}>
                Details
              </button>
            </div>
          </div>
        </article>
      {/each}
    </div>
  </div>

  <div class="controls">
    <button class="arrow" aria-label="Previous card" on:click={goPrev}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>
    </button>
    <div class="dots" role="tablist" aria-label="Choose card">
      {#each cards as _, i (i)}
        <button
          class="dot"
          class:active={i === activeIndex}
          role="tab"
          aria-selected={i === activeIndex}
          aria-label={`Go to card ${i + 1}`}
          on:click={() => goTo(i)}
        ></button>
      {/each}
    </div>
    <button class="arrow" aria-label="Next card" on:click={goNext}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>
    </button>
  </div>
</section>

<style>
  .showcase {
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(3rem, 10vh, 6rem) 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2.5rem;
    overflow-x: clip;
  }

  .text-content {
    text-align: center;
  }

  .eyebrow {
    margin: 0 0 0.5rem;
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--muted);
    font-family: var(--sans);
  }

  .heading {
    margin: 0;
    font-family: var(--display);
    font-weight: 900;
    font-style: normal;
    font-size: clamp(2rem, 5vw, 3.2rem);
    line-height: 1.05;
    color: var(--ink);
    overflow-wrap: anywhere;
    min-width: 0;
  }

  .stage {
    position: relative;
    height: clamp(360px, 52vw, 480px);
    perspective: 1400px;
    perspective-origin: 50% 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    touch-action: pan-y;
    outline: none;
    cursor: grab;
  }
  .stage:active {
    cursor: grabbing;
  }
  .stage:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 6px;
    border-radius: 12px;
  }

  .wheel {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 1px;
    transform-style: preserve-3d;
    will-change: transform;
  }
  .wheel.transitioning {
    transition: transform 0.6s var(--ease-out-expo);
  }
  .wheel.dragging {
    cursor: grabbing;
  }

  .card {
    position: absolute;
    top: 50%;
    left: 50%;
    aspect-ratio: 3 / 4;
    background: var(--card-surface);
    border: 1px solid var(--border-soft);
    border-radius: 18px;
    box-shadow: 0 14px 30px rgba(0, 0, 0, 0.14);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    backface-visibility: hidden;
    transition: opacity 0.5s var(--ease-standard), filter 0.5s var(--ease-standard);
    cursor: pointer;
  }
  .card.front {
    cursor: default;
    box-shadow: 0 22px 48px rgba(0, 0, 0, 0.22);
  }

  .card-media {
    position: relative;
    height: 45%;
    background: linear-gradient(135deg, var(--warm-sand), var(--pink));
    background-size: cover;
    background-position: center;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .media-placeholder {
    font-family: var(--sans);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    color: var(--ink);
    opacity: 0.55;
    text-transform: uppercase;
  }
  .badge {
    position: absolute;
    top: 0.6rem;
    left: 0.6rem;
    font-family: var(--bungee);
    font-size: 0.6rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.3rem 0.55rem;
    background: var(--ink);
    color: var(--cream);
    border-radius: 999px;
  }

  .card-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    padding: 0.9rem 1rem 1rem;
    min-width: 0;
  }

  .card-top {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 0.5rem;
  }
  .card-title {
    margin: 0;
    font-family: var(--serif);
    font-weight: 900;
    font-style: normal;
    font-size: 1.05rem;
    line-height: 1.15;
    overflow-wrap: anywhere;
    min-width: 0;
  }
  .rating {
    flex-shrink: 0;
    font-family: var(--sans);
    font-size: 0.8rem;
    color: var(--sunset-orange);
    font-weight: 600;
  }

  .card-meta {
    margin: 0;
    font-family: var(--sans);
    font-size: 0.75rem;
    letter-spacing: 0.03em;
    color: var(--muted);
    text-transform: uppercase;
  }

  .card-desc {
    margin: 0;
    font-family: var(--sans);
    font-size: 0.85rem;
    line-height: 1.4;
    color: var(--ink);
    opacity: 0.85;
    flex: 1;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .card-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 0.2rem;
  }
  .price {
    font-family: var(--sans);
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--ink);
  }

  .btn-details {
    font-family: var(--sans);
    font-weight: 600;
    font-size: 0.8rem;
    padding: 0.5rem 0.9rem;
    border-radius: 999px;
    border: 1px solid var(--ink);
    background: transparent;
    color: var(--ink);
    cursor: pointer;
  }
  .btn-details:hover {
    background: var(--ink);
    color: var(--cream);
  }
  .btn-details:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }
  .btn-details:active {
    transform: translateY(1px) scale(0.97);
  }

  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1.25rem;
  }

  .arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 999px;
    border: 1px solid var(--border-soft-deep);
    background: var(--card-surface);
    color: var(--ink);
    cursor: pointer;
    flex-shrink: 0;
  }
  .arrow:hover {
    border-color: var(--ink);
  }
  .arrow:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 2px;
  }
  .arrow:active {
    transform: translateY(1px) scale(0.95);
  }

  .dots {
    display: flex;
    gap: 0.5rem;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    border: none;
    background: var(--border-soft-deep);
    cursor: pointer;
    padding: 0;
  }
  .dot.active {
    width: 22px;
    background: var(--blue);
  }
  .dot:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 3px;
  }

  @media (prefers-reduced-motion: reduce) {
    .wheel {
      transition: none !important;
    }
    .card {
      transition: none !important;
    }
  }

  @media (max-width: 640px) {
    .stage {
      height: clamp(320px, 78vw, 400px);
    }
  }
</style>
