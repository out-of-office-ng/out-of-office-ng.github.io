<script>
  /* One page of the Out of Office archive at a time. Event photos can be
     supplied through `items` once the owner has approved them. */
  export let items = [];
  export let eyebrow = 'Previous escapes';
  export let heading = 'Moments from the journey';

  const HISTORY = [
    {
      title: 'OOO 0x01',
      meta: 'The Post-NYSC Hangout',
      description: 'Tarkwa Bay Beach · Apr 11, 2025 · 12pm till daybreak',
      number: '01',
      tone: 'var(--water-sky)',
    },
    {
      title: 'OOO 0x02',
      meta: 'Open Canvas',
      description: 'Jaekel House Garden · May 30, 2025',
      number: '02',
      tone: 'var(--warm-sand)',
    },
    {
      title: 'OOO 0x03',
      meta: 'Release and Unwind',
      description: 'Tarkwa Bay Beach · Aug 15–16, 2026 · overnight camp',
      number: '03',
      tone: 'var(--seafoam)',
    },
  ];

  let activeIndex = 0;
  $: cards = items.length ? items : HISTORY;
  $: if (activeIndex >= cards.length) activeIndex = 0;
  $: current = cards[activeIndex] ?? HISTORY[0];

  function goTo(index) {
    activeIndex = (index + cards.length) % cards.length;
  }
</script>

<section class="showcase" aria-labelledby="showcase-title">
  <div class="section-heading">
    <p class="eyebrow">{eyebrow}</p>
    <h2 id="showcase-title">{heading}</h2>
    <p class="intro">A few postcards from the road so far.</p>
  </div>

  <div class="carousel" role="region" aria-roledescription="carousel" aria-label="Previous Out of Office events">
    <article class="record">
      <div class="record-art" style:--archive-tone={current.tone ?? 'var(--water-sky)'} aria-hidden="true">
        {#if current.image}
          <img src={current.image} alt="" loading="lazy" />
        {:else}
          <span class="record-art-label">OUT OF OFFICE / THE ARCHIVE</span>
          <span class="record-number">{current.number ?? String(activeIndex + 1).padStart(2, '0')}</span>
          <span class="record-art-footer">A little time away, kept on paper.</span>
        {/if}
      </div>
      <div class="record-copy">
        <p class="record-kicker">ESCAPE {String(activeIndex + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}</p>
        <h3>{current.meta ?? current.title}</h3>
        <p class="record-fact">{current.description}</p>
        <a href="#/trail" class="trail-link">See the full trail <span aria-hidden="true">↗</span></a>
      </div>
    </article>

    <div class="controls" role="group" aria-label="Choose a previous escape">
      <button type="button" class="step" aria-label="Previous escape" on:click={() => goTo(activeIndex - 1)}>← <span>Previous</span></button>
      <div class="picks">
        {#each cards as item, i (i)}
          <button type="button" class:active={i === activeIndex} aria-pressed={i === activeIndex} aria-label={`Show ${item.meta ?? item.title}`} on:click={() => goTo(i)}>{String(i + 1).padStart(2, '0')}</button>
        {/each}
      </div>
      <button type="button" class="step" aria-label="Next escape" on:click={() => goTo(activeIndex + 1)}><span>Next</span> →</button>
    </div>
    <p class="sr-only" role="status">Showing {current.meta ?? current.title}, {activeIndex + 1} of {cards.length}</p>
  </div>
</section>

<style>
  /* Hallmark · macrostructure: archival folio · tone: analog · anchor hue: deep water */
  /* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V5 */
  .showcase { max-width: 1280px; margin: 0 auto; padding: clamp(72px, 9vw, 128px) clamp(24px, 6vw, 80px); color: var(--ink); }
  .section-heading { margin-bottom: clamp(28px, 5vw, 56px); }
  .eyebrow { margin: 0 0 12px; color: var(--deep); font: 700 11px/1.5 var(--sans); text-transform: uppercase; letter-spacing: .15em; }
  h2 { margin: 0; max-width: 740px; font: 700 clamp(34px, 5vw, 62px)/1.12 var(--serif); letter-spacing: -.035em; overflow-wrap: anywhere; }
  .intro { margin: 16px 0 0; color: var(--muted); font: 400 15px/1.6 var(--sans); }
  .carousel { min-width: 0; }
  .record { display: grid; grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr); border: 1px solid var(--ink); background: var(--bg); min-height: 440px; }
  .record-art { display: flex; flex-direction: column; justify-content: space-between; min-width: 0; padding: clamp(22px, 3vw, 40px); background: var(--archive-tone); overflow: hidden; }
  .record-art img { width: 100%; height: 100%; object-fit: cover; }
  .record-art-label, .record-art-footer { font: 700 10px/1.5 var(--sans); letter-spacing: .12em; }
  .record-art-label { align-self: flex-start; border-bottom: 1px solid var(--ink); padding-bottom: 8px; }
  .record-art-footer { max-width: 180px; }
  .record-number { align-self: center; font: 700 clamp(130px, 19vw, 270px)/.9 var(--serif); letter-spacing: -.09em; }
  .record-copy { display: flex; flex-direction: column; align-items: flex-start; min-width: 0; padding: clamp(28px, 5vw, 66px); }
  .record-kicker { margin: 0 0 auto; font: 700 11px/1.5 var(--sans); letter-spacing: .15em; }
  h3 { margin: 40px 0 22px; font: 700 clamp(32px, 4vw, 58px)/1.1 var(--serif); letter-spacing: -.035em; overflow-wrap: anywhere; }
  .record-fact { margin: 0 0 36px; font: 400 clamp(14px, 1.5vw, 18px)/1.6 var(--sans); }
  .trail-link { margin-top: auto; display: inline-flex; gap: 22px; align-items: center; min-height: 44px; border-bottom: 1px solid var(--ink); font: 700 13px/1.5 var(--sans); text-decoration: none; white-space: nowrap; }
  .controls { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-top: 22px; }
  .step, .picks button { min-width: 44px; min-height: 44px; border: 1px solid var(--border-soft-deep); background: var(--bg); color: var(--ink); font: 700 12px/1.5 var(--sans); cursor: pointer; white-space: nowrap; }
  .step { display: inline-flex; justify-content: center; align-items: center; gap: 10px; padding: 10px 16px; }
  .picks { display: flex; gap: 6px; }
  .picks button.active { background: var(--deep); border-color: var(--deep); color: var(--bg); }
  .step:hover, .picks button:not(.active):hover { border-color: var(--deep); transform: none; }
  .step:focus-visible, .picks button:focus-visible, .trail-link:focus-visible { outline: 3px solid var(--deep); outline-offset: 3px; }
  .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
  @media (max-width: 700px) {
    .record { grid-template-columns: minmax(0, 1fr); }
    .record-art { min-height: 230px; }
    .record-number { font-size: clamp(120px, 34vw, 180px); }
    .record-copy { min-height: 290px; }
    h3 { margin: 32px 0 16px; }
    .controls { gap: 6px; }
    .step { padding: 8px 10px; }
    .step span { display: none; }
  }
</style>
