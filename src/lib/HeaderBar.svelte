<script>
  import { isDark, toggleTheme } from './theme.js';
  import AudioControlDeck from './AudioControlDeck.svelte';

  export let onOpenCmdK = () => {};
  export let onOpenDrawer = () => {};
  export let onOpenOooGen = () => {};
  export let onStatusChange = (onlineState) => {};

  let isOnline = false;
  let statusToast = false;
  let statusMessage = '';

  function toggleStatus() {
    isOnline = !isOnline;
    onStatusChange(isOnline);
    statusMessage = isOnline 
      ? 'STATUS: ONLINE ⚡ — Live popups & notifications active!' 
      : 'STATUS: AWAY 🌴 — Disconnected & popups muted.';
    statusToast = true;
    setTimeout(() => { statusToast = false; }, 3200);
  }
</script>

<header class="bar-container">
  <div class="bar">
    <!-- Left: Brand -->
    <a href="#/about" class="brand-link" title="What We Are">
      OOO LAGOS
    </a>

    <!-- Left-Middle: Minimal Status Dot -->
    <button 
      type="button" 
      class="status-pill" 
      class:online={isOnline}
      on:click={toggleStatus} 
      title="Toggle status"
    >
      <span class="live-dot" aria-hidden="true"></span>
      <span class="status-label">{isOnline ? 'ONLINE' : 'AWAY'}</span>
    </button>

    <div class="spacer" aria-hidden="true"></div>

    <!-- Right: Actions -->
    <nav class="actions-wrap">
      <button type="button" class="action-pill" on:click={onOpenDrawer}>
        EVENT PASS
      </button>

      <button type="button" class="action-pill" on:click={onOpenOooGen}>
        AUTO-REPLY
      </button>

      <div class="audio-deck-wrap">
        <AudioControlDeck />
      </div>

      <button
        type="button"
        class="action-pill theme-pill"
        on:click={toggleTheme}
        title="Toggle Theme"
      >
        {#if $isDark} DAY {:else} NIGHT {/if}
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
    top: 1rem;
    z-index: 1000;
    width: calc(100% - 2rem);
    max-width: 1000px;
    margin: 0 auto;
  }

  .bar {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 0.75rem;
    background: color-mix(in srgb, var(--card-surface) 65%, transparent);
    backdrop-filter: blur(16px) saturate(180%);
    -webkit-backdrop-filter: blur(16px) saturate(180%);
    border: 1px solid var(--border-soft);
    border-radius: 999px;
    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
    transition: background 0.3s ease, border-color 0.3s ease;
  }
  .bar:hover {
    background: color-mix(in srgb, var(--card-surface) 95%, transparent);
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
  }

  .spacer {
    flex: 1 1 auto;
  }

  /* Status */
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.6rem;
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
    transition: background 0.3s ease;
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
    padding: 0.4rem 0.8rem;
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
  
  .audio-deck-wrap {
    display: flex;
    align-items: center;
    margin: 0 0.25rem;
  }

  /* Status Toast */
  .status-toast {
    position: absolute;
    top: calc(100% + 12px);
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
    animation: fadeIn 0.25s ease-out;
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
      padding: 0.4rem 0.5rem;
      font-size: 0.55rem;
    }
  }
</style>
