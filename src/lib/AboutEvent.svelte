<script>
  import AsciiFire from './AsciiFire.svelte';
  import { NEXT_EVENT } from './sales.js';
  const COMMUNITY_URL = 'https://chat.whatsapp.com/IGeVwvbkusyFPIPA2saXKs';
  const v1ArchiveUrl = `${import.meta.env.BASE_URL}v1/`;
</script>

<div class="about-page">
  <div class="header">
    <button class="back-btn" on:click={() => window.location.hash = '#/'}>
      &larr; Back to Out of Office
    </button>
  </div>

  <div class="content">
    <div class="text-col">
      <h1 class="title">What we are</h1>
      <p class="manifesto">
        Out of Office is a Lagos community that makes room for a day off: music, art,
        games and good company, away from the traffic, the deadlines and the pressure to grind.
      </p>
      <p class="manifesto">
        So far there have been three editions: The First Hangout, Open Canvas, and Release
        and Unwind. The next one is planned for {NEXT_EVENT.when}. It's for anyone who wants
        a little more room to create, connect and just be.
      </p>
      <p class="manifesto">For a few hours, the emails can wait.</p>
      <p class="manifesto signature">
        Gone to touch grass. Back soon.
      </p>
      <a class="community-link" href={COMMUNITY_URL} target="_blank" rel="noopener noreferrer">Join the community on WhatsApp <span class="sr-only">(opens in a new tab)</span><span aria-hidden="true">&rarr;</span></a>
      <a class="archive-link" href={v1ArchiveUrl}>See where it started: Out of Office v1 &rarr;</a>
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
    /* This page is always dark, so use the dark-theme pink in both themes;
       the light-theme --pink-deep was 2.8:1 on #0a0b0c. */
    color: #eeacc5;
    font-size: 1.5rem;
    margin-top: 2rem;
    transform: rotate(-2deg);
  }
  .community-link {
    display: flex;
    align-items: center;
    gap: 8px;
    width: fit-content;
    min-height: 44px;
    margin-top: 1rem;
    color: var(--chaos-yellow, #d9a441);
    font-size: 1.05rem;
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .community-link:hover,
  .community-link:focus-visible { color: #f0c46a; }
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
