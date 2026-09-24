<script>
  import { onMount } from 'svelte';
  import { muted, toggleMute } from './ambientSound.js';

  export let onOpenDrawer = () => {};
  export let onStatusChange = (onlineState) => {};
  export let scrollState = 'transparent'; // 'transparent' | 'frosted' | 'cream'

  let isOnline = true;
  let statusToast = false;
  let statusMessage = '';

  function toggleStatus() {
    isOnline = !isOnline;
    onStatusChange(isOnline);
    statusMessage = isOnline
      ? 'ONLINE ⚡ — Connected and receiving workspace alerts.'
      : 'AWAY 🌴 — Muting notifications. Making room for life.';
    statusToast = true;
    setTimeout(() => { statusToast = false; }, 3200);
  }

  // Sync the parent's isOnline (drives notification count + ChaosLayer)
  // with our default of ONLINE on load — without popping the toggle toast.
  onMount(() => {
    onStatusChange(isOnline);
  });
</script>

<header class="bar-container {scrollState}">
  <div class="bar">
    <!-- Left: Brand -->
    <a href="#/about" class="brand-link" title="What We Are">
      OUT OF OFFICE
    </a>

    <!-- Left-Middle: Minimal Status Dot -->
    <button 
      type="button" 
      class="status-pill" 
      class:online={isOnline}
      on:click={toggleStatus} 
      aria-pressed={isOnline}
      title="Toggle status"
    >
      <span class="live-dot" aria-hidden="true"></span>
      <span class="status-label">{isOnline ? 'ONLINE' : 'AWAY'}</span>
    </button>

    <div class="spacer" aria-hidden="true"></div>

    <!-- Right: Actions -->
    <nav class="actions-wrap">
      <button type="button" class="action-pill" on:click={onOpenDrawer}>
        OOO PASS
      </button>

      <button
        type="button"
        class="action-pill"
        on:click={toggleMute}
        title="Toggle Sound"
      >
        {#if $muted} UNMUTE {:else} MUTE {/if}
      </button>
    </nav>
  </div>

  {#if statusToast}
    <div class="status-toast" class:online={isOnline}>
      {statusMessage}
    </div>
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

  /* Status Toast */
  .status-toast {
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
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
    white-space: nowrap;
    animation: fadeIn 0.2s ease-out;
  }
  .status-toast.online {
    background: var(--chaos-yellow);
    color: var(--bg);
  }

  @keyframes fadeIn {
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
