<script>
  import { onDestroy } from 'svelte';
  import { SALES_MODE } from './sales.js';
  export let visible = false;
  export let onOpenDrawer = () => {};

  let selectedTier = 'explorer';
  let isRipping = false;
  let ripTimer;
  onDestroy(() => clearTimeout(ripTimer));

  function openPass() {
    clearTimeout(ripTimer);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    isRipping = !reduced;
    const delay = reduced ? 0 : 360;
    ripTimer = setTimeout(() => {
      isRipping = false;
      onOpenDrawer();
    }, delay);
  }
</script>

<section id="passes" class="tickets-section">
  <div class="header-text" class:visible>
    <p class="eyebrow">OOO 0x04 · PASS STATUS</p>
    <h2 class="heading">Passes aren't on sale yet.</h2>
    <p class="subheading">This is a preview. Come back here for the confirmed date, venue and pass details.</p>
  </div>

  <div class="pass-container" class:visible>
    <div class="pass-card" class:ripping={isRipping} aria-busy={isRipping}>
      <div class="pass-left">
        <div class="pass-header">
          <span>OUT OF OFFICE · PASS PREVIEW</span>
          <span>EDITION <strong>OOO-0x04</strong></span>
        </div>
        
        <div class="route-display">
          <div class="city-box yellow">
            <h2>LOS</h2>
            <div class="city-name">LAGOS</div>
          </div>
          <div class="flight-path">
            <!-- Danfo (Lagos yellow minibus) on the route line. Decorative: the
                 body bounces on its suspension and the wheels turn. -->
            <svg class="danfo" viewBox="0 0 96 56" aria-hidden="true" focusable="false">
              <g class="danfo-body">
                <rect x="30" y="2" width="30" height="8" rx="2" fill="#181818" />
                <rect x="33" y="4" width="24" height="3" rx="1" fill="#f6f4f1" />
                <rect x="4" y="9" width="88" height="31" rx="8" fill="#ffcc00" stroke="#181818" stroke-width="3" />
                <rect x="12" y="14" width="64" height="13" rx="3" fill="#181818" />
                <rect x="15" y="16" width="17" height="9" rx="1.5" fill="#6d7a84" />
                <rect x="36" y="16" width="17" height="9" rx="1.5" fill="#6d7a84" />
                <rect x="57" y="16" width="16" height="9" rx="1.5" fill="#6d7a84" />
                <path d="M80 14h7a3 3 0 0 1 3 3v9h-10z" fill="#9fd3e6" stroke="#181818" stroke-width="2" />
                <rect x="4" y="30" width="88" height="3" fill="#181818" />
                <rect x="4" y="35" width="88" height="2.5" fill="#181818" />
                <rect x="87" y="31" width="5" height="4" rx="1" fill="#fff4b0" />
              </g>
              <g class="wheel" style="transform-origin: 24px 44px"><circle cx="24" cy="44" r="8" fill="#181818" /><circle cx="24" cy="44" r="3.5" fill="#d8d8d8" /><rect x="23" y="37.5" width="2" height="4" fill="#d8d8d8" /></g>
              <g class="wheel" style="transform-origin: 72px 44px"><circle cx="72" cy="44" r="8" fill="#181818" /><circle cx="72" cy="44" r="3.5" fill="#d8d8d8" /><rect x="71" y="37.5" width="2" height="4" fill="#d8d8d8" /></g>
            </svg>
            <div class="flight-type">NON-STOP ESCAPE</div>
          </div>
          <div class="city-box white">
            <h2>OOO</h2>
            <div class="city-name">[VENUE TBA]</div>
          </div>
        </div>

        <div class="pass-details">
          <div class="detail-block">
            <span class="detail-label">PASSENGER</span>
            <div>LAGOS ESCAPER</div>
          </div>
          <div class="detail-block">
            <span class="detail-label">DATE</span>
            <div>NOVEMBER &middot; TBA</div>
          </div>
          <div class="detail-block">
            <span class="detail-label">BOARDING</span>
            <div>{SALES_MODE === 'open' ? 'IMMEDIATELY' : 'DATE TBA'}</div>
          </div>
        </div>

        <div class="special-instructions">
          <span class="detail-label">SPECIAL INSTRUCTIONS</span>
          <div>Mute work Slack &middot; Leave problems at the door</div>
        </div>
      </div>
      
      <div class="pass-perforation"></div>

      <div class="pass-right">
        {#if SALES_MODE === 'open'}
          <div class="stub-header">STUB COPY</div>
          <div class="seat-badge">SEAT: 1A</div>
          <div class="barcode"></div>
          <div class="tier-selector">
            <button class="tier-btn" class:active={selectedTier === 'explorer'} on:click={() => selectedTier = 'explorer'}>
              <span class="tier-name">Explorer</span>
              <span class="tier-price">&#8358;15,000</span>
            </button>
            <button class="tier-btn" class:active={selectedTier === 'retreat'} on:click={() => selectedTier = 'retreat'}>
              <span class="tier-name">Retreat</span>
              <span class="tier-price">&#8358;20,000</span>
            </button>
          </div>
          <button class="claim-btn ui-action" on:click={openPass}>
            Claim {selectedTier === 'explorer' ? 'Explorer' : 'Retreat'} Pass &rarr;
          </button>
          <div class="secure-text">Secured by Paystack</div>
        {:else}
          <div class="stub-header">PREVIEW · NOT AN ISSUED PASS</div>
          <div class="seat-badge">0x04 · NOVEMBER</div>
          <p class="closed-copy">The date and venue are still to be announced. Passes are not on sale yet.</p>
          <button class="claim-btn ui-action" on:click={openPass}>See 0x04 status &rarr;</button>
        {/if}
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
    position: relative;
    transition: box-shadow 360ms ease;
  }
  .pass-card.ripping { box-shadow: 0 26px 42px rgba(36, 62, 60, .18); }
  
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
    transition: transform 360ms cubic-bezier(.22, 1, .36, 1);
  }

  .pass-header {
    flex-wrap: wrap; gap: 12px;
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
  .danfo {
    width: clamp(64px, 8vw, 92px);
    height: auto;
    padding: 0 8px;
    background: var(--bg, #f6f4f1);
    z-index: 1;
    margin-bottom: 0.35rem;
    overflow: visible;
  }
  /* Bouncy ride: body bobs on the suspension, wheels roll. The global
     reduced-motion rule in app.css stops both. */
  .danfo-body { animation: danfo-bounce 0.9s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
  .wheel { animation: danfo-roll 0.8s linear infinite; }
  @keyframes danfo-bounce {
    0%, 100% { transform: translateY(0) rotate(0deg); }
    30% { transform: translateY(-3px) rotate(-1.5deg); }
    60% { transform: translateY(-1px) rotate(1deg); }
  }
  @keyframes danfo-roll { to { transform: rotate(360deg); } }
  .flight-type {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--deep, #376a65);
    margin-top: 0.5rem;
  }

  .pass-details {
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    background: #efeee5;
    padding: 1.5rem;
    border-radius: 8px;
  }
  .detail-block .detail-label {
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

  .special-instructions .detail-label {
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
    transition: transform 360ms cubic-bezier(.22, 1, .36, 1), opacity 360ms ease;
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
    transition: transform 360ms cubic-bezier(.22, 1, .36, 1);
  }
  .pass-card.ripping .pass-right { transform: translateX(12px) rotate(.45deg); }
  .pass-card.ripping .pass-perforation { transform: scaleY(1.3); opacity: .55; }
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
  .closed-copy { margin: 0; line-height: 1.5; color: var(--ink, #243e3c); }

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
  @media (max-width: 580px) {
    .tickets-section { padding: 64px 24px; }
    .pass-left, .pass-right { padding: 20px; min-width: 0; }
    .pass-details { grid-template-columns: 1fr; padding: 16px; }
    .route-display { gap: 8px; }
    .city-box { width: 82px; flex-shrink: 0; }
    .city-box h2 { font-size: 28px; }
    .city-name { font-size: 9px; }
    .flight-type { font-size: 8px; text-align: center; }
    .header-text { text-align: left; width: 100%; }
    .heading { font-size: 40px; }
    .pass-card.ripping .pass-right { transform: translateY(8px) rotate(.35deg); }
  }
  @media (prefers-reduced-motion: reduce) {
    .pass-card, .pass-left, .pass-right, .pass-perforation { transition: none; }
  }
</style>
