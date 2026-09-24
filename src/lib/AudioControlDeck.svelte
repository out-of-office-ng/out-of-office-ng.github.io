<script>
  import { muted, toggleMute, beachUserVol, cityUserVol } from './ambientSound.js';
  import { addToast } from './toastStore.js';

  let isOpen = false;
  let isMutedVal = false;
  let beachVol = 80;
  let cityVol = 40;

  muted.subscribe((v) => (isMutedVal = v));
  beachUserVol.subscribe((v) => (beachVol = v));
  cityUserVol.subscribe((v) => (cityVol = v));

  function handleMuteToggle() {
    toggleMute();
    addToast({
      title: isMutedVal ? 'Audio Unmuted 🔊' : 'Audio Muted 🔇',
      description: isMutedVal ? 'Soundscape active.' : 'All audio silenced.',
      type: 'info'
    });
  }

  function handleBeachVol(e) {
    beachUserVol.set(Number(e.target.value));
  }

  function handleCityVol(e) {
    cityUserVol.set(Number(e.target.value));
  }
</script>

<div class="deck-wrap">
  <button
    class="deck-trigger"
    on:click={() => (isOpen = !isOpen)}
    aria-label="Sound Controls Popover"
    title="Sound Controls & Audio Deck"
  >
    <span class="trigger-icon">{isMutedVal ? '🔇' : '🎵'}</span>
    <span class="trigger-label">SOUND DECK</span>
  </button>

  {#if isOpen}
    <div class="popover-card" role="dialog" aria-label="Audio Controls">
      <div class="popover-header">
        <span class="p-tag">SOUNDSCAPE MIXER</span>
        <h4 class="p-title">Audio Controls</h4>
      </div>

      <div class="popover-body">
        <div class="row-between">
          <span class="row-label">Master Mute</span>
          <button class="switch-btn" class:active={isMutedVal} on:click={handleMuteToggle} aria-label="Toggle Master Mute">
            <span class="switch-thumb"></span>
          </button>
        </div>

        <div class="slider-group">
          <div class="slider-label">
            <span>🌊 Beach Waves Ambience</span>
            <span>{isMutedVal ? '0%' : beachVol + '%'}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            disabled={isMutedVal}
            value={beachVol}
            on:input={handleBeachVol}
            class="slider"
          />
        </div>

        <div class="slider-group">
          <div class="slider-label">
            <span>🚌 Lagos City Noise</span>
            <span>{isMutedVal ? '0%' : cityVol + '%'}</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            disabled={isMutedVal}
            value={cityVol}
            on:input={handleCityVol}
            class="slider"
          />
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  .deck-wrap {
    position: relative;
    display: inline-block;
  }

  .deck-trigger {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    background: var(--card-surface);
    color: var(--ink);
    border: 1.5px solid var(--border-soft-deep);
    padding: 0.4rem 0.8rem;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s ease, border-color 0.2s ease;
  }

  .deck-trigger:hover {
    transform: translateY(-2px);
    border-color: var(--blue, #00bfff);
  }

  .trigger-icon {
    font-size: 0.9rem;
  }

  .trigger-label {
    letter-spacing: 0.05em;
  }

  .popover-card {
    position: absolute;
    top: calc(100% + 0.6rem);
    right: 0;
    z-index: 999;
    width: 280px;
    background: var(--card-surface);
    color: var(--ink);
    border: 1px solid var(--border-soft-deep);
    border-radius: 14px;
    padding: 1rem;
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
    animation: popIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .popover-header {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .p-tag {
    font-size: 0.6rem;
    font-weight: 700;
    color: var(--blue, #00bfff);
    text-transform: uppercase;
  }

  .p-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
  }

  .popover-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .row-between {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .row-label {
    font-size: 0.85rem;
    font-weight: 600;
  }

  .switch-btn {
    width: 44px;
    height: 24px;
    background: var(--border-soft-deep);
    border-radius: 999px;
    border: none;
    padding: 2px;
    cursor: pointer;
    transition: background 0.2s ease;
    display: flex;
    align-items: center;
  }

  .switch-btn.active {
    background: var(--chaos-red, #e5383b);
  }

  .switch-thumb {
    width: 20px;
    height: 20px;
    background: #fff;
    border-radius: 50%;
    transition: transform 0.2s ease;
  }

  .switch-btn.active .switch-thumb {
    transform: translateX(20px);
  }

  .slider-group {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
  }

  .slider-label {
    display: flex;
    justify-content: space-between;
    font-size: 0.78rem;
    font-weight: 600;
  }

  .slider {
    width: 100%;
    accent-color: var(--blue, #00bfff);
    cursor: pointer;
  }

  @keyframes popIn {
    from { opacity: 0; transform: translateY(-8px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @media (max-width: 768px) {
    .trigger-label {
      display: none;
    }
    .deck-trigger {
      padding: 0.4rem;
      border-radius: 50%;
      width: 32px;
      height: 32px;
      justify-content: center;
    }
  }
</style>
