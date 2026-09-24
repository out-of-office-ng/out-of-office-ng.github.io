<script>
  export let onBoard = () => {};
</script>

<section class="jetty" aria-labelledby="hero-title">
  <div class="masthead">
    <span>An auto-reply for real life</span>
    <span>Lagos, Nigeria</span>
  </div>
  <div class="hero-layout">
    <div class="wordmark">
      <p class="edition">No. 04 <span>November 2026</span></p>
      <h1 id="hero-title"><span>OUT</span><span class="connector">of</span><span>OFFICE</span></h1>
    </div>
    <div class="departure">
      <p class="departure-label">Your next escape</p>
      <h2>Gone to touch grass.<br />Back soon.</h2>
      <p class="body">Away from emails, responsibilities,<br class="desktop-break" /> and Lagos stress.</p>
      <button on:click={onBoard}>Find your boarding pass <span aria-hidden="true">↗</span></button>
      <p class="date">November · Exact date & venue TBA</p>
      <div class="postscript">
        <span aria-hidden="true">P.S.</span>
        <p>Auto replies enabled.<br />Stress disabled.</p>
      </div>
    </div>
  </div>
  <div class="shoreline">
    <span>Leaving yellow Lagos. Entering blue Lagos.</span>
    <span>The shallows wait at the end <span aria-hidden="true">↓</span></span>
  </div>
</section>

<style>
  /* Hallmark · macrostructure: paper jetty / split wordmark · tone: analog · anchor hue: deep water */
  /* Hallmark · pre-emit critique: P5 H5 E4 S5 R5 V4 */
  .jetty { max-width: 1440px; margin: 0 auto; padding: 60px clamp(24px, 6vw, 96px) 32px; color: var(--ink); }
  .masthead, .shoreline { display: flex; justify-content: space-between; gap: 20px; font: 500 11px/1.5 var(--sans); }
  .masthead { border-bottom: 1px solid var(--border-dashed); padding-bottom: 16px; letter-spacing: .1em; text-transform: uppercase; }
  .hero-layout { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr); align-items: center; gap: clamp(28px, 7vw, 112px); padding: 40px 0 56px; }
  .edition { display: flex; gap: 20px; align-items: baseline; margin: 0 0 24px; font: 700 15px/1.5 var(--sans); }
  .edition span { font-size: 12px; font-weight: 400; }
  h1 { display: flex; flex-direction: column; align-items: start; margin: 0; font: 400 clamp(76px, 11vw, 158px)/1.04 var(--wild); letter-spacing: -.035em; color: var(--deep); min-width: 0; overflow-wrap: anywhere; }
  .connector { font: 400 clamp(24px, 3.8vw, 48px)/1.3 var(--marker); color: var(--ink); margin: 0 0 0 12px; }
  .departure { padding-top: 36px; }
  .departure-label { font: 500 11px/1.5 var(--sans); letter-spacing: .16em; text-transform: uppercase; color: var(--muted); }
  h2 { margin: 20px 0; font: 700 clamp(28px, 3vw, 42px)/1.18 var(--serif); letter-spacing: -.025em; min-width: 0; overflow-wrap: anywhere; }
  .body { margin: 0 0 32px; font: 400 16px/1.8 var(--sans); }
  button { display: inline-flex; gap: 24px; align-items: center; justify-content: space-between; min-height: 52px; padding: 14px 20px; background: var(--deep); color: var(--bg); border: 1px solid var(--deep); font: 500 13px/1.5 var(--sans); cursor: pointer; white-space: nowrap; }
  button:hover { transform: translateY(-2px); }
  button:active { transform: translateY(1px); }
  button:focus-visible { outline: 3px solid var(--ink); outline-offset: 4px; }
  .date { font: 400 11px/1.6 var(--sans); color: var(--muted); margin-top: 12px; }
  .postscript { display: flex; align-items: baseline; gap: 16px; margin-top: 40px; padding-top: 20px; border-top: 1px dashed var(--border-dashed); }
  .postscript > span { font: 400 22px/1.5 var(--marker); color: var(--deep); }
  .postscript p { margin: 0; font: 400 13px/1.6 var(--sans); }
  .shoreline { border-top: 1px solid var(--border-dashed); padding-top: 20px; color: var(--muted); }
  @media (max-width: 700px) {
    .jetty { padding-top: 44px; }
    .masthead { font-size: 9px; gap: 12px; }
    .hero-layout { grid-template-columns: minmax(0, 1fr); gap: 12px; padding-top: 28px; padding-bottom: 32px; }
    h1 { font-size: clamp(72px, 18vw, 124px); }
    .edition { margin-bottom: 16px; }
    .departure { padding-top: 16px; }
    h2 { font-size: 30px; }
    .body { font-size: 14px; margin-bottom: 24px; }
    .postscript { margin-top: 28px; }
    .shoreline { flex-direction: column; gap: 8px; }
  }
  @media (prefers-reduced-motion: reduce) { button:hover, button:active { transform: none; } }
</style>
