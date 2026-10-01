<script>
  export let visible = false;
  let recordOut = false;
  const playlistUrl = 'https://open.spotify.com/embed/playlist/5uJnnaFGzzaBcunJz6HA0h?utm_source=generator&theme=0';
</script>

<section class="playlist-section" aria-labelledby="mixtape-title">
  <header class="section-heading">
    <p class="eyebrow">THE MOOD</p>
    <h2 class="heading" id="mixtape-title">Out of Office,<br>the mixtape</h2>
  </header>
  <div class="listening-card">
    <div class="sleeve-label"><span>OUT OF OFFICE · THE MIXTAPE</span><span class="edition-label">MADE FOR TIME AWAY</span></div>
    <div class="listening-body">
    <div class="art-panel">
    <button class="record-sleeve" class:revealed={visible} class:record-out={recordOut} type="button" aria-label="Slide the vinyl out of its sleeve" aria-pressed={recordOut} on:click={() => recordOut = !recordOut}>
      <span class="vinyl" aria-hidden="true"><span>OOO</span></span>
      <img class="cover-art" src="/images/mixtape-cover.png" width="1024" height="1024" loading="lazy" alt="Out of Office — The Mixtape. A pink paper boat on green water, printed on a worn cream record sleeve. Made for time away." />
    </button>
  </div>

  <div class="embed-wrapper" class:visible>
    <p class="player-label">THE LISTENING ROOM</p>
    <iframe 
      title="Out of Office Spotify Mixtape Playlist" 
      style="border-radius:12px" 
      src={visible ? playlistUrl : undefined}
      width="100%" 
      height="352" 
      frameBorder="0" 
      allowfullscreen="" 
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
      loading="lazy"
    ></iframe>
  </div>
    </div>
    <footer class="sleeve-footer"><p class="manifesto">Put the phone face down.</p><a class="spotify-link" href="https://open.spotify.com/playlist/5uJnnaFGzzaBcunJz6HA0h" target="_blank" rel="noopener noreferrer">Listen on Spotify <span aria-hidden="true">↗</span><span class="sr-only"> (opens a new tab)</span></a></footer>
  </div>
</section>

<style>
  .playlist-section {
    max-width: 1000px;
    margin: 0 auto;
    padding: 6rem 1.5rem;
  }

  @media (min-width: 800px) {
    .listening-body { grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); }
  }

  .eyebrow {
    font-family: var(--marker, "Permanent Marker", cursive);
    color: var(--pink-deep, #e0568f);
    text-transform: uppercase;
    font-size: 1rem;
    margin: 0 0 1rem;
    letter-spacing: 0.05em;
  }

  .heading {
    font-family: var(--serif, Georgia, serif);
    font-size: clamp(3rem, 5vw, 4.5rem);
    color: var(--deep, #1a332f);
    margin: 0 0 1.5rem;
    line-height: 1.05;
    letter-spacing: -0.02em;
  }

  .manifesto {
    font-size: .9rem;
    color: var(--muted, #6b6b6b);
    margin: 0;
  }

  .embed-wrapper {
    width: 100%;
    min-width: 0;
    background: #e9e8db;
    padding: 12px;
    border: 1px solid var(--border-soft-deep);
    border-radius: 16px;
    box-shadow: inset 0 2px 8px #00000012;
  }
  .section-heading { margin-bottom: 32px; }
  .listening-card { border: 1px solid var(--border-soft-deep); border-radius: 22px; background: var(--card-surface); box-shadow: 0 20px 50px #00000012, inset 0 1px 0 #ffffff30; }
  .sleeve-label, .sleeve-footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px 20px; padding: 18px clamp(16px, 3vw, 28px); }
  .sleeve-label { border-bottom: 1px solid var(--border-soft-deep); font-size: 10px; font-weight: 600; letter-spacing: .12em; }
  .edition-label { color: var(--muted); font-size: 9px; }
  .listening-body { display: grid; align-items: center; gap: 28px; padding: clamp(16px, 3vw, 28px); }
  .art-panel { min-width: 0; padding: 8px; }
  .sleeve-footer { border-top: 1px dashed var(--border-soft-deep); }
  .player-label { margin: 2px 0 12px; color: var(--muted); font-size: 10px; letter-spacing: .15em; }
  .record-sleeve { position: relative; width: 86%; max-width: 350px; margin: 36px 0 12px; isolation: isolate; }
  .cover-art { position: relative; z-index: 1; display: block; width: 100%; height: auto; aspect-ratio: 1; border-radius: 3px; box-shadow: 0 12px 26px #0003; transform: rotate(-3deg); }
  .vinyl { position: absolute; width: 94%; aspect-ratio: 1; right: -16%; top: 3%; border-radius: 50%; display: grid; place-items: center; background: repeating-radial-gradient(circle, #202422 0 2px, #101411 3px 4px); box-shadow: 0 8px 18px #0003; }
  .vinyl span { display: grid; place-items: center; width: 32%; aspect-ratio: 1; background: #e8a8bd; color: #243e3c; border-radius: 50%; font: 16px var(--serif); }
  .spotify-link { display: inline-flex; align-items: center; min-height: 44px; gap: 12px; color: var(--ink); font-size: 13px; text-underline-offset: 4px; }
  iframe { display: block; border: 0; }
  @media (min-width: 800px) { .embed-wrapper { align-self: center; } }
  .record-sleeve { display: block; width: 78%; border: 0; padding: 0; background: transparent; cursor: pointer; opacity: 0; transform: translateY(20px) rotate(-2deg); transition: opacity 650ms ease, transform 650ms var(--ease-out-expo); }
  .record-sleeve.revealed { opacity: 1; transform: translateY(0) rotate(0); }
  .cover-art { transition: transform 500ms var(--ease-out-expo), box-shadow 500ms ease; }
  .vinyl { transition: transform 650ms var(--ease-out-expo); }
  .record-out .vinyl { transform: translateX(16%) rotate(65deg); }
  .record-out .cover-art { transform: translateY(-5px) rotate(-6deg); box-shadow: 0 20px 34px #0004; }
  .record-sleeve:active .cover-art { transform: translateY(1px) rotate(-2deg) scale(.98); }
  .record-sleeve:focus-visible { outline: 3px solid var(--deep); outline-offset: 12px; border-radius: 4px; }
  @media (hover: hover) and (pointer: fine) {
    .record-sleeve:hover .vinyl { transform: translateX(16%) rotate(65deg); }
    .record-sleeve:hover .cover-art { transform: translateY(-5px) rotate(-6deg); box-shadow: 0 20px 34px #0004; }
  }
  @media (prefers-reduced-motion: reduce) {
    .record-sleeve, .record-sleeve.revealed { opacity: 1; transform: none; transition: none; }
    .cover-art, .vinyl { transition: none; }
  }
</style>
