<script>
  export let visible = false;
  export let showSticky = false;
  export let onOpenDrawer = () => {};

  let selectedTier = 'explorer';
</script>

<section class="tickets-section">
  <div class="header-text" class:visible>
    <p class="eyebrow">BOARDING PASS</p>
    <h2 class="heading">Your ticket out.</h2>
    <p class="subheading">Come for the experience. Leave with the memories.</p>
  </div>

  <div class="pass-container" class:visible>
    <div class="pass-card">
      <div class="pass-left">
        <div class="pass-header">
          <span>OUT OF OFFICE AIR & MARINE</span>
          <span>FLIGHT <strong>OOO-0x04</strong></span>
        </div>
        
        <div class="route-display">
          <div class="city-box yellow">
            <h2>LOS</h2>
            <div class="city-name">LAGOS</div>
          </div>
          <div class="flight-path">
            <svg class="boat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14l8-4 8 4M2 18h20l-2 4H4l-2-4z"/></svg>
            <div class="flight-type">NON-STOP ESCAPE</div>
          </div>
          <div class="city-box white">
            <h2>OOO</h2>
            <div class="city-name">[VENUE TBA]</div>
          </div>
        </div>

        <div class="pass-details">
          <div class="detail-block">
            <label>PASSENGER</label>
            <div>LAGOS ESCAPER</div>
          </div>
          <div class="detail-block">
            <label>DATE</label>
            <div>NOVEMBER &middot; TBA</div>
          </div>
          <div class="detail-block">
            <label>BOARDING</label>
            <div>IMMEDIATELY</div>
          </div>
        </div>

        <div class="special-instructions">
          <label>SPECIAL INSTRUCTIONS</label>
          <div>Mute work Slack &middot; Leave problems at the door</div>
        </div>
      </div>
      
      <div class="pass-perforation"></div>

      <div class="pass-right">
        <div class="stub-header">STUB COPY</div>
        <div class="seat-badge">SEAT: 1A</div>
        <div class="barcode"></div>
        
        <div class="tier-selector">
          <button 
            class="tier-btn" 
            class:active={selectedTier === 'explorer'}
            on:click={() => selectedTier = 'explorer'}>
            <span class="tier-name">Explorer</span>
            <span class="tier-price">&#8358;15,000</span>
          </button>
          <button 
            class="tier-btn" 
            class:active={selectedTier === 'retreat'}
            on:click={() => selectedTier = 'retreat'}>
            <span class="tier-name">Retreat</span>
            <span class="tier-price">&#8358;20,000</span>
          </button>
        </div>

        <button class="claim-btn" on:click={onOpenDrawer}>
          Claim {selectedTier === 'explorer' ? 'Explorer' : 'Retreat'} Pass &rarr;
        </button>
        <div class="secure-text">Secured by Paystack</div>
      </div>
    </div>
  </div>
</section>

<style>
  .tickets-section {
    padding: 6rem 1.5rem;
    max-width: 1000px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .header-text {
    text-align: center;
    margin-bottom: 3rem;
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
    font-size: clamp(3rem, 6vw, 4.5rem);
    color: var(--deep, #1a332f);
    margin: 0 0 1rem;
    line-height: 1.1;
  }
  .subheading {
    color: var(--muted, #6b6b6b);
    font-size: 1.1rem;
    margin: 0;
  }
  
  .pass-container {
    width: 100%;
    filter: drop-shadow(0 20px 40px rgba(0,0,0,0.08));
  }
  
  .pass-card {
    background: var(--bg, #f6f4f1);
    border: 2px solid var(--deep, #376a65);
    border-radius: 16px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
  
  @media (min-width: 800px) {
    .pass-card {
      flex-direction: row;
    }
  }

  .pass-left {
    flex: 1;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .pass-header {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--ink, #181818);
    border-bottom: 2px solid var(--deep, #376a65);
    padding-bottom: 0.8rem;
  }

  .route-display {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  .city-box {
    border: 2px solid var(--ink, #181818);
    border-radius: 8px;
    text-align: center;
    overflow: hidden;
    width: 140px;
  }
  .city-box.yellow {
    background: var(--chaos-yellow, #ffc72c);
  }
  .city-box.white {
    background: transparent;
  }
  .city-box h2 {
    margin: 0;
    font-family: var(--serif, Georgia, serif);
    font-size: 2.5rem;
    padding: 1rem 0;
    font-weight: 500;
  }
  .city-name {
    background: var(--ink, #181818);
    color: #fff;
    font-weight: 700;
    font-size: 0.8rem;
    padding: 0.4rem 0;
    letter-spacing: 0.1em;
  }

  .flight-path {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
  }
  .flight-path::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--deep, #376a65);
    z-index: 0;
  }
  .boat-icon {
    width: 24px;
    height: 24px;
    background: var(--bg, #f6f4f1);
    padding: 0 10px;
    z-index: 1;
    color: var(--deep, #376a65);
    margin-bottom: 0.5rem;
  }
  .flight-type {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--deep, #376a65);
    margin-top: 0.5rem;
  }

  .pass-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    background: #efeee5;
    padding: 1.5rem;
    border-radius: 8px;
  }
  .detail-block label {
    display: block;
    font-size: 0.7rem;
    color: var(--muted, #6b6b6b);
    letter-spacing: 0.05em;
    margin-bottom: 0.4rem;
  }
  .detail-block div {
    font-weight: 700;
    font-size: 1rem;
    color: var(--ink, #181818);
  }

  .special-instructions label {
    display: block;
    font-size: 0.7rem;
    color: var(--muted, #6b6b6b);
    letter-spacing: 0.05em;
    margin-bottom: 0.4rem;
  }
  .special-instructions div {
    font-weight: 700;
    color: var(--deep, #376a65);
  }

  .pass-perforation {
    width: 100%;
    height: 2px;
    border-top: 2px dashed var(--deep, #376a65);
    position: relative;
  }
  @media (min-width: 800px) {
    .pass-perforation {
      width: 2px;
      height: auto;
      border-top: none;
      border-left: 2px dashed var(--deep, #376a65);
    }
  }

  .pass-right {
    width: 100%;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  @media (min-width: 800px) {
    .pass-right {
      width: 320px;
    }
  }

  .stub-header {
    text-align: center;
    font-size: 0.8rem;
    letter-spacing: 0.1em;
    color: var(--muted, #6b6b6b);
  }

  .seat-badge {
    background: var(--ink, #243e3c);
    color: #fff;
    text-align: center;
    padding: 0.8rem;
    border-radius: 6px;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  .barcode {
    height: 40px;
    background: repeating-linear-gradient(
      90deg,
      var(--ink, #181818),
      var(--ink, #181818) 2px,
      transparent 2px,
      transparent 4px,
      var(--ink, #181818) 4px,
      var(--ink, #181818) 8px,
      transparent 8px,
      transparent 10px
    );
    opacity: 0.8;
  }

  .tier-selector {
    display: flex;
    gap: 0.5rem;
  }
  .tier-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.8rem;
    border: 1px solid var(--border, #d1ccc3);
    background: transparent;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .tier-btn.active {
    background: #e2e8e4;
    border-color: var(--deep, #376a65);
  }
  .tier-name {
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--ink, #181818);
  }
  .tier-price {
    font-size: 0.8rem;
    color: var(--muted, #6b6b6b);
  }

  .claim-btn {
    background: var(--deep, #376a65);
    color: #fff;
    border: none;
    padding: 1.2rem;
    border-radius: 30px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .claim-btn:hover {
    opacity: 0.9;
  }

  .secure-text {
    text-align: center;
    font-size: 0.75rem;
    color: var(--muted, #6b6b6b);
  }
</style>
