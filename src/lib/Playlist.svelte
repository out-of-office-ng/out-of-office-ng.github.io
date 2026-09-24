<script>
  export let visible = false;
</script>

<section class="playlist-section">
  <div class="text-content">
    <p class="eyebrow">THE MOOD</p>
    <h2 class="heading">Out of Office,<br>the mixtape</h2>
    <p class="manifesto">Put the phone face down.</p>
  </div>

  <div class="embed-wrapper" class:visible>
    <iframe 
      title="Out of Office Spotify Mixtape Playlist" 
      style="border-radius:12px" 
      src="https://open.spotify.com/embed/playlist/5uJnnaFGzzaBcunJz6HA0h?utm_source=generator&theme=0" 
      width="100%" 
      height="352" 
      frameBorder="0" 
      allowfullscreen="" 
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
      loading="lazy"
    ></iframe>
  </div>
</section>

<style>
  .playlist-section {
    max-width: 1000px;
    margin: 0 auto;
    padding: 6rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rem;
  }

  @media (min-width: 800px) {
    .playlist-section {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
    }
    .text-content {
      flex: 1;
      padding-top: 2rem;
      padding-right: 2rem;
    }
    .embed-wrapper {
      flex: 1.2;
      width: 100%;
    }
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
    font-size: 1.2rem;
    color: var(--muted, #6b6b6b);
    margin: 0;
  }

  .embed-wrapper {
    background: #e9e8db;
    padding: 1rem;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }
</style>
