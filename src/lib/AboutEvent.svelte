<script>
  import AsciiFire from './AsciiFire.svelte';
</script>

<div class="about-page">
  <div class="header">
    <button class="back-btn" on:click={() => window.location.hash = '#/'}>
      &larr; Back to the page
    </button>
  </div>

  <div class="content">
    <div class="text-col">
      <h1 class="title">What we are</h1>
      <p class="manifesto">
        Out of Office is a temporary rebellion<br>
        against Lagos life. It is not just a vacation;<br>
        it’s permission to disconnect from the<br>
        madness.
      </p>
      <p class="signature">
        Gone to touch grass. Back soon.
      </p>
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
    background: var(--bg, #f6f4f1);
    color: var(--ink, #181818);
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .header {
    padding: 2.5rem 3rem;
  }
  .back-btn {
    background: none;
    border: none;
    color: var(--deep, #376a65);
    padding: 0;
    cursor: pointer;
    font-size: 0.9rem;
    font-family: var(--sans, system-ui, sans-serif);
    text-decoration: underline;
    text-underline-offset: 4px;
    transition: color 0.2s ease;
  }
  .back-btn:hover {
    color: var(--ink, #181818);
  }
  .content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4rem;
    padding: 2rem 3rem;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }
  @media (min-width: 800px) {
    .content {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    .text-col {
      flex: 1;
      padding-right: 2rem;
    }
    .fire-col {
      flex: 1;
      display: flex;
      justify-content: flex-end;
    }
  }
  .title {
    font-family: var(--serif, Georgia, serif);
    font-size: clamp(3rem, 6vw, 4.5rem);
    font-weight: 500;
    color: #1a332f;
    margin-top: 0;
    margin-bottom: 2rem;
    letter-spacing: -0.03em;
  }
  .manifesto {
    font-family: var(--serif, Georgia, serif);
    font-size: clamp(1.2rem, 2vw, 1.6rem);
    line-height: 1.5;
    margin-bottom: 2.5rem;
    color: #1a332f;
  }
  .signature {
    font-family: var(--marker, "Permanent Marker", cursive);
    color: var(--pink-deep, #e0568f);
    font-size: 1.4rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 2rem;
  }
</style>
