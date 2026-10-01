<script>
  import { editions } from './editions.js';
  import { NEXT_EVENT, SALES_MODE } from './sales.js';
  import EditionArtwork from './EditionArtwork.svelte';
  import ScrollReveal from './ScrollReveal.svelte';

  export let onOpenDrawer = () => {};
  export let activeEdition = null;

  // A repeated hash does not dispatch hashchange. Keep the current edition's
  // jump link useful after someone has scrolled elsewhere. --codex
  function repeatJump(event, code) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (window.location.hash !== `#/trail/${code}`) return;
    event.preventDefault();
    const target = document.getElementById(`edition-${code}`);
    target?.scrollIntoView({ behavior: 'instant', block: 'start' });
    target?.focus({ preventScroll: true });
  }
</script>

<div class="trail-page">
  <nav class="trail-nav" aria-label="Event trail navigation">
    <a class="back-link" href="#/" aria-label="Back to home"><span aria-hidden="true">←</span> Out of Office</a>
    <a class="next-link text-link" href="#/trail/0x04" on:click={(event) => repeatJump(event, '0x04')}>Next escape <span aria-hidden="true">↗</span></a>
  </nav>

  <main class="trail-main">
    <header class="trail-heading">
      <p class="eyebrow">THE THINGS WE KEEP</p>
      <h1 tabindex="-1">A little time away.<br /><em>A trail of memories.</em></h1>
      <p class="intro">From the beach to the garden and back again. Three editions of stepping out of the everyday.</p>
      <p class="handwritten">Every escape gets a stamp.</p>
    </header>

    <div class="trail-layout">
      <aside class="edition-index">
        <nav aria-label="Jump to an edition">
          <span class="index-label">THE TRAIL</span>
          {#each editions as edition}
            <a href={`#/trail/${edition.code}`} on:click={(event) => repeatJump(event, edition.code)} aria-current={activeEdition === edition.code ? 'location' : undefined} aria-label={`${edition.code}: ${edition.title}`}>
              <span class="index-code">{edition.code}</span><span class="index-name">{edition.word.replace('.', '')}</span>
            </a>
          {/each}
          <a href="#/trail/0x04" on:click={(event) => repeatJump(event, '0x04')} class="index-next" aria-current={activeEdition === '0x04' ? 'location' : undefined} aria-label="0x04: The next escape"><span class="index-code">0x04</span><span class="index-name">Up next</span></a>
        </nav>
      </aside>

      <ol class="trail" aria-label="Out of Office editions in chronological order">
        {#each editions as edition}
          <li>
            <ScrollReveal>
              <article class="trail-card" id={`edition-${edition.code}`} tabindex="-1" aria-labelledby={`title-${edition.code}`}>
                <div class="paper-image"><EditionArtwork {edition} /></div>
                <div class="card-copy">
                  <p class="card-kicker"><span>OOO {edition.code}</span><span class="past-label">Past edition</span></p>
                  <h2 id={`title-${edition.code}`}>{edition.title}</h2>
                  <p class="card-note">{edition.note}</p>
                  <dl class="edition-facts">
                    <div><dt>WHEN</dt><dd><time datetime={edition.dateTime}>{edition.date}</time></dd></div>
                    <div><dt>WHERE</dt><dd>{edition.location}</dd></div>
                  </dl>
                </div>
              </article>
            </ScrollReveal>
          </li>
        {/each}
        <li>
          <ScrollReveal>
            <article class="next-card" id="edition-0x04" tabindex="-1" aria-labelledby="title-0x04">
              <div class="next-stamp" aria-hidden="true"><span>OUT OF OFFICE</span><strong>0x04</strong><span>ROOM FOR WHAT'S NEXT</span></div>
              <div class="next-copy">
                <p class="eyebrow">THE NEXT CHAPTER</p>
                <h2 id="title-0x04">More time<br />for real life.</h2>
                <p class="next-date">{NEXT_EVENT.code} <span aria-hidden="true">·</span> {NEXT_EVENT.when}</p>
                <p class="next-detail">{NEXT_EVENT.detail}</p>
                <p class="sales-note">{SALES_MODE === 'open' ? 'Pass details are available below.' : 'Passes are not on sale yet.'}</p>
                <button class="pass-button ui-action" type="button" on:click={onOpenDrawer}>{SALES_MODE === 'open' ? 'See pass details' : 'See the pass update'} <span aria-hidden="true">↗</span></button>
              </div>
            </article>
          </ScrollReveal>
        </li>
      </ol>
    </div>

    <footer class="trail-footer">
      <p>Lagos, with love.</p>
      <a class="text-link" href="#/">Back to the water <span aria-hidden="true">↗</span></a>
    </footer>
  </main>
</div>

<style>
  .trail-page { min-height: 100vh; background: var(--bg); color: var(--ink); }
  .trail-nav { position: sticky; top: 0; z-index: 50; display: flex; justify-content: space-between; align-items: center; gap: 20px; min-height: 76px; padding: 12px max(24px, calc((100vw - 1160px) / 2)); border-bottom: 1px solid var(--border-soft); background: #f2f0e9f5; backdrop-filter: blur(12px); }
  .back-link { display: inline-flex; align-items: center; min-height: 44px; gap: 12px; color: var(--ink); font: 600 13px var(--sans); text-decoration: none; }
  .back-link:hover { text-decoration: underline; text-underline-offset: 5px; }
  .trail-main { max-width: 1208px; padding: 0 24px; margin: auto; }
  .trail-heading { padding: clamp(64px, 7vw, 100px) 0 clamp(48px, 6vw, 80px); }
  h1 { margin: 0; font: 400 clamp(40px, 5.8vw, 76px)/1.06 var(--serif); letter-spacing: -.045em; }
  h1 em { font-weight: 400; color: var(--deep); }
  .intro { margin: 28px 0 0; max-width: 430px; color: var(--muted); font-size: 16px; line-height: 1.8; }
  .handwritten { margin: 28px 0 0; color: var(--pink-deep); font: 400 15px/1.6 var(--marker); }
  .trail-layout { display: grid; grid-template-columns: 140px minmax(0, 1fr); gap: 40px; align-items: start; }
  .edition-index { position: sticky; top: 104px; }
  .edition-index nav { display: flex; flex-direction: column; gap: 10px; }
  .index-label { color: var(--muted); font-size: 9px; letter-spacing: .18em; padding: 0 12px 12px; }
  .edition-index a { display: flex; align-items: center; gap: 12px; padding: 8px 12px; min-height: 48px; color: var(--ink); border: 1px solid transparent; border-radius: 4px; text-decoration: none; transition: background 180ms, border-color 180ms; }
  .edition-index a:hover, .edition-index a[aria-current] { border-color: var(--border-soft-deep); background: #e4e9e1; }
  .index-code { font: 400 14px var(--serif); }
  .index-name { font-size: 11px; color: var(--muted); }
  .edition-index .index-next { border-top: 1px dashed var(--border-soft-deep); border-radius: 0; margin-top: 8px; padding-top: 18px; }
  .trail { position: relative; list-style: none; margin: 0; padding: 0 0 0 28px; display: flex; flex-direction: column; gap: 48px; min-width: 0; }
  .trail::before { content: ''; position: absolute; top: 28px; bottom: 80px; left: 0; border-left: 1px dashed var(--border-soft-deep); }
  .trail > li { position: relative; min-width: 0; }
  .trail > li::before { content: ''; position: absolute; top: 28px; left: -33px; width: 10px; height: 10px; border-radius: 50%; background: var(--deep); box-shadow: 0 0 0 6px var(--bg); }
  .trail-card { min-width: 0; display: grid; grid-template-columns: minmax(0, .95fr) minmax(0, 1fr); gap: 28px; padding: 16px; background: #faf8f2; border: 1px solid #d1d2c6; border-radius: 6px; box-shadow: 0 14px 30px -22px #243e3c50; scroll-margin-top: 110px; }
  .paper-image { align-self: center; padding: 6px; background: #f2f0e9; transform: rotate(-2deg); transition: transform 300ms var(--ease-out-expo); }
  .trail > li:nth-child(2) .paper-image { transform: rotate(2deg); }
  .card-copy { padding: 18px 12px 18px 0; align-self: center; min-width: 0; }
  .card-kicker { margin: 0 0 24px; display: flex; flex-wrap: wrap; gap: 8px 16px; justify-content: space-between; font-size: 10px; letter-spacing: .09em; }
  .past-label { color: var(--muted); letter-spacing: .02em; }
  h2 { margin: 0; font: 400 clamp(27px, 3vw, 39px)/1.13 var(--serif); letter-spacing: -.035em; }
  .card-note { margin: 18px 0 26px; color: var(--muted); font-size: 14px; line-height: 1.75; }
  .edition-facts { margin: 0; border-top: 1px dashed var(--border-soft-deep); padding-top: 20px; display: grid; gap: 16px; }
  dt { color: var(--muted); font-size: 9px; letter-spacing: .13em; }
  dd { margin: 5px 0 0; font-size: 13px; }
  .next-card { position: relative; overflow: hidden; padding: clamp(28px, 5vw, 60px); border: 1px solid var(--deep); border-radius: 6px; background: var(--deep); color: #faf8f2; scroll-margin-top: 110px; }
  .next-copy { position: relative; z-index: 1; }
  .next-copy .eyebrow { color: #faf8f2; }
  .next-copy h2 { font-size: clamp(38px, 4.8vw, 60px); }
  .next-date { font-size: 16px; margin: 28px 0 12px; }
  .next-date span { margin: 0 6px; }
  .next-detail, .sales-note { max-width: 340px; font-size: 14px; line-height: 1.7; }
  .sales-note { margin: 0 0 26px; }
  .next-stamp { position: absolute; right: -15px; top: 28px; width: 180px; height: 180px; border: 4px double #faf8f244; color: #faf8f244; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; transform: rotate(15deg); font-size: 9px; letter-spacing: .09em; pointer-events: none; }
  .next-stamp strong { font: 400 64px/1.2 var(--serif); }
  .next-stamp span:last-child { font-size: 7px; }
  .pass-button { display: inline-flex; align-items: center; justify-content: center; gap: 18px; min-height: 48px; padding: 12px 22px; border: 1px solid #faf8f2; border-radius: 30px; background: #faf8f2; color: var(--deep); font: 500 13px var(--sans); cursor: pointer; }
  .next-card :global(:focus-visible) { outline-color: #faf8f2; }
  .next-card:focus-visible { outline-color: var(--ink); }
  .trail-footer { display: flex; justify-content: space-between; align-items: center; gap: 20px; margin-top: 64px; padding: 32px 0; border-top: 1px solid var(--border-soft-deep); }
  .trail-footer p { font: 400 14px var(--marker); color: var(--pink-deep); }
  @media (hover: hover) and (pointer: fine) { .trail-card:hover .paper-image { transform: rotate(0deg); } }
  @media (max-width: 980px) {
    .trail-layout { grid-template-columns: 100px minmax(0, 1fr); gap: 24px; }
    .index-name { display: none; }
    .trail-card { grid-template-columns: minmax(0, 1fr); gap: 8px; }
    .card-copy { padding: 20px 12px; }
    .edition-facts { grid-template-columns: 1fr 1fr; }
    .paper-image { max-width: 100%; }
  }
  @media (max-width: 600px) {
    .trail-nav { min-height: 68px; gap: 12px; padding: 10px 20px; }
    .back-link { font-size: 12px; gap: 8px; }
    .next-link { font-size: 12px; gap: 8px; }
    .trail-main { padding: 0 20px; }
    .trail-heading { padding: 48px 0 32px; }
    .intro { font-size: 14px; }
    .trail-layout { display: block; }
    .edition-index { top: 68px; z-index: 40; background: var(--bg); padding: 8px 0 12px; margin: 0 -4px 28px; border-bottom: 1px solid var(--border-soft-deep); }
    .edition-index nav { flex-direction: row; justify-content: space-between; gap: 4px; }
    .index-label { display: none; }
    .edition-index a { min-height: 44px; padding: 8px 12px; }
    .edition-index .index-next { margin: 0; padding: 8px 12px; border: 1px dashed var(--deep); border-radius: 4px; }
    .trail { padding-left: 0; gap: 32px; }
    .trail::before, .trail > li::before { display: none; }
    .trail-card { padding: 10px; scroll-margin-top: 152px; }
    .card-copy { padding: 20px 10px 16px; }
    .edition-facts { grid-template-columns: 1fr; gap: 14px; }
    .next-card { padding: 28px 22px; scroll-margin-top: 152px; }
    .next-stamp { width: 140px; height: 140px; right: -55px; top: 16px; opacity: .6; }
    .next-stamp strong { font-size: 44px; }
    .trail-footer { align-items: flex-start; flex-direction: column; gap: 8px; margin-top: 40px; }
  }
  @media (prefers-reduced-motion: reduce) { .paper-image, .trail > li:nth-child(2) .paper-image, .trail-card:hover .paper-image { transform: none; transition: none; } }
</style>
