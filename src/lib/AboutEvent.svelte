<script>
  import AsciiFire from './AsciiFire.svelte';
</script>

<div class="about-page">
  <div class="header">
    <button class="back-btn" on:click={() => window.location.hash = '#/'}>
      &larr; Return to Lagos
    </button>
  </div>

  <div class="content">
    <div class="text-col">
      <h1 class="title">What We Are</h1>
      <p class="manifesto">
        Out of Office is a temporary rebellion against Lagos life. 
        It is not just a vacation; it's permission to disconnect from the madness.
      </p>
      <p class="manifesto">
        We are a community-driven escape from the traffic, the hustle, the economy, 
        and the constant pressure to grind. A momentary suspension of stress, lit by a 
        digital bonfire of ignored emails and paused notifications.
      </p>
      <p class="manifesto signature">
        Gone to touch grass. Back soon.
      </p>
      <a class="archive-link" href="/v1/">See where it started: Out of Office v1 &rarr;</a>
    </div>
    
    <div class="fire-col">
      <AsciiFire />
    </div>
  </div>
</div>

<style>
  .about-page {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: #0a0b0c; /* AsciiGen Obsidian */
    color: #e6e6dc; /* AsciiGen Limestone */
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .header {
    padding: 2rem;
  }
  .back-btn {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #e6e6dc;
    padding: 0.6rem 1.2rem;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s ease, transform 0.2s ease;
  }
  .back-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-4px);
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rem;
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  @media (min-width: 800px) {
    .content {
      flex-direction: row;
      justify-content: space-between;
    }
    .text-col {
      flex: 1;
      padding-right: 4rem;
    }
    .fire-col {
      flex: 1.2;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
  .title {
    font-size: clamp(2.5rem, 6vw, 4rem);
    color: var(--chaos-yellow, #d9a441);
    margin-top: 0;
    margin-bottom: 2rem;
  }
  .manifesto {
    font-size: 1.2rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    color: rgba(230, 230, 220, 0.85);
  }
  .signature {
    color: var(--pink-deep, #fc9ce0);
    font-size: 1.5rem;
    margin-top: 2rem;
    transform: rotate(-2deg);
  }
  .archive-link {
    display: inline-block;
    margin-top: 1.5rem;
    color: rgba(230, 230, 220, 0.6);
    font-size: 0.95rem;
    text-decoration: underline;
    text-underline-offset: 3px;
    transition: color 0.2s ease;
  }
  .archive-link:hover,
  .archive-link:focus-visible {
    color: var(--chaos-yellow, #d9a441);
  }
</style>
