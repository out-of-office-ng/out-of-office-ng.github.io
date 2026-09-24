<script>
  import { onDestroy } from 'svelte';
  import { muted, toggleMute } from './ambientSound.js';

  export let onOpenDrawer = () => {};
  export let onStatusChange = (onlineState) => {};
  export let scrollState = 'transparent'; // 'transparent' | 'frosted' | 'cream'

  // AWAY is the site's fast lane to calm (see calm.js). The one-line
  // status note is inline feedback attached to its own control, not a
  // toast system.
  let isOnline = false;
  let statusNote = false;
  let statusMessage = '';
  let noteTimer;
  let autoMuteTimer;

  function toggleStatus() {
    isOnline = !isOnline;
    onStatusChange(isOnline);
    statusMessage = isOnline
      ? 'ONLINE ⚡ — Reconnected. The noise is back.'
      : 'AWAY 🌴 — Muted. Gone to touch grass.';
    statusNote = true;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => (statusNote = false), 3200);
    
    clearTimeout(autoMuteTimer);
    if (isOnline) {
      autoMuteTimer = setTimeout(() => {
        if (isOnline) {
          isOnline = false;
          onStatusChange(false);
          statusMessage = 'AWAY 🌴 — Auto-reply re-enabled.';
          statusNote = true;
          clearTimeout(noteTimer);
          noteTimer = setTimeout(() => (statusNote = false), 3200);
        }
      }, 8000);
    }
  }
  onDestroy(() => clearTimeout(noteTimer));
</script>

<header class="bar-container {scrollState}">
  <div class="bar">
    <a href="#/about" class="brand-link" title="What We Are">
      OUT OF OFFICE
    </a>

    <button
      type="button"
      class="status-pill"
      class:online={isOnline}
      on:click={toggleStatus}
      aria-label={isOnline ? 'Status: online. Set to away' : 'Status: away. Set to online'}
      title={isOnline ? 'Go AWAY — mute the chaos' : 'Back ONLINE'}
    >
      <span class="live-dot" aria-hidden="true"></span>
      <span class="status-label">{isOnline ? 'ONLINE' : 'AWAY'}</span>
    </button>

    <div class="spacer" aria-hidden="true"></div>

    <nav class="actions-wrap">
      <button
        type="button"
        class="action-pill icon-pill"
        on:click={toggleMute}
        aria-pressed={!$muted}
        aria-label={$muted ? 'Unmute ambient sound' : 'Mute ambient sound'}
        title={$muted ? 'Sound off' : 'Sound on'}
      >
        <span aria-hidden="true">{$muted ? '🔇' : '🔊'}</span>
      </button>

      <button type="button" class="action-pill pass-pill" on:click={onOpenDrawer}>
        OOO PASS →
      </button>
    </nav>
  </div>

  {#if statusNote}
    <div class="status-note" class:online={isOnline} role="status">{statusMessage}</div>
  {/if}
</header>

<style>
  /* Hallmark N5 Floating Pill Navigation */
  .bar-container {
    position: sticky;
    top: calc(1rem + env(safe-area-inset-top));
    z-index: 1000;
    width: calc(100% - 2rem);
    max-width: 1000px;
    margin: 0 auto;
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 999px;
    transition: background 0.3s ease, 
                border-color 0.3s ease, 
                box-shadow 0.3s ease;
  }

  /* Keyboard Focus Rings */
  button:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--blue);
    outline-offset: 4px;
  }

  /* State 1: Transparent (0-80px) */
  .bar-container.transparent .bar {
    background: transparent;
    border: 1px solid transparent;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  /* State 2: Frosted / Blur (80px - 500px) */
  .bar-container.frosted .bar {
    background: color-mix(in srgb, var(--card-surface) 60%, transparent);
    backdrop-filter: blur(12px) saturate(140%);
    -webkit-backdrop-filter: blur(12px) saturate(140%);
    border: 1px solid var(--border-soft);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  }

  /* State 3: Solid Cream (Past 500px) */
  .bar-container.cream .bar {
    background: var(--bg);
    border: 1px solid var(--border-soft-deep);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .brand-link {
    font-family: var(--sans);
    font-size: 0.75rem;
    font-weight: 800;
    letter-spacing: 0.05em;
    color: var(--ink);
    text-decoration: none;
    padding-left: 0.5rem;
    white-space: nowrap;
    border-radius: 999px;
  }

  .spacer {
    flex: 1 1 auto;
  }

  /* Status */
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    border-radius: 999px;
    background: transparent;
    border: 1px solid transparent;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  .status-pill:hover {
    background: var(--border-soft);
  }

  .live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--muted);
    transition: background 0.2s ease;
  }
  .status-pill.online .live-dot {
    background: var(--chaos-yellow);
    box-shadow: 0 0 8px var(--chaos-yellow);
  }

  .status-label {
    font-family: var(--sans);
    font-size: 0.6rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--muted);
  }
  .status-pill.online .status-label {
    color: var(--ink);
  }

  /* Actions */
  .actions-wrap {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .action-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.75rem;
    font-family: var(--sans);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--ink);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s ease, transform 0.2s ease;
    white-space: nowrap;
  }
  .action-pill:hover {
    background: var(--border-soft);
  }

  .icon-pill {
    font-size: 0.85rem;
    padding: 0.4rem 0.55rem;
  }

  .pass-pill {
    background: var(--ink);
    color: var(--bg);
  }
  .pass-pill:hover {
    background: var(--ink);
    opacity: 0.88;
  }

  .status-note {
    position: absolute;
    top: calc(100% + 0.75rem);
    left: 50%;
    transform: translateX(-50%);
    background: var(--ink);
    color: var(--bg);
    border-radius: 8px;
    padding: 0.5rem 1rem;
    font-family: var(--sans);
    font-size: 0.75rem;
    font-weight: 600;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
    white-space: nowrap;
    animation: noteIn 0.2s ease-out;
  }
  .status-note.online {
    background: var(--chaos-yellow);
    color: var(--ink);
  }
  @keyframes noteIn {
    from { opacity: 0; transform: translate(-50%, -6px); }
    to { opacity: 1; transform: translate(-50%, 0); }
  }

  @media (max-width: 768px) {
    .action-pill {
      padding: 0.5rem 0.5rem;
      font-size: 0.55rem;
    }
  }
</style>
