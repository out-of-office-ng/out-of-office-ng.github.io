<script>
  import { SALES_MODE } from './sales.js';
  import ThemeControl from './ThemeControl.svelte';
  import { muted, toggleMute } from './ambientSound.js';
  export let onOpenDrawer = () => {};
</script>

<header class="site-header">
  <div class="header-left">
    <a class="brand" href="#top" aria-label="Out of Office, back to top">OUT OF OFFICE</a>
    <a class="status-link" href="#/about" aria-label="Away, read about Out of Office"><span class="status-dot" aria-hidden="true"></span>AWAY</a>
  </div>
  <div class="header-actions">
    <ThemeControl />
    <button class="sound-button" type="button" on:click={toggleMute} aria-label={$muted ? 'Sound is off. Turn on' : 'Sound is on. Turn off'} aria-pressed={!$muted}>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h4l5 4V6l-5 4H4Z" /><path class="sound-wave" d="M16 9.2a4 4 0 0 1 0 5.6M18.5 6.8a7.5 7.5 0 0 1 0 10.4" /></svg>
    </button>
    <button class="pass-button ui-action" type="button" on:click={onOpenDrawer}>{SALES_MODE === 'open' ? 'OOO pass' : 'Pass update'} <span aria-hidden="true">→</span></button>
  </div>
</header>

<style>
  .site-header { position: fixed; z-index: 50; top: max(16px, env(safe-area-inset-top)); left: 50%; transform: translateX(-50%); width: calc(100% - 32px); max-width: 966px; height: 56px; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 0 6px 0 22px; border: 1px solid #cdc9b890; border-radius: 999px; background: rgba(250, 248, 242, .56); box-shadow: 0 8px 24px #243e3c12, inset 0 1px 0 #fff8; -webkit-backdrop-filter: blur(18px) saturate(1.12); backdrop-filter: blur(18px) saturate(1.12); }
  .header-left, .header-actions { display: flex; align-items: center; }
  .header-left { gap: 14px; min-width: 0; }
  .brand { flex-shrink: 0; color: var(--ink); font: 700 13px/1 var(--sans); letter-spacing: .04em; text-decoration: none; }
  .status-link { display: inline-flex; align-items: center; gap: 6px; color: var(--muted); font-size: 10px; letter-spacing: .12em; text-decoration: none; }
  .status-link:hover { color: var(--ink); }
  .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #df6c56; box-shadow: 0 0 0 3px #df6c5624; }
  .header-actions { gap: 4px; }
  .sound-button { display: grid; place-items: center; width: 44px; height: 44px; border: 0; border-radius: 50%; background: transparent; color: var(--ink); cursor: pointer; }
  .sound-button:hover, .sound-button:focus-visible { background: #243e3c0c; }
  .sound-button svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.6; }
  .sound-button svg path:first-child { fill: currentColor; stroke: none; }
  .sound-button[aria-pressed="false"] .sound-wave { display: none; }
  .pass-button { display: inline-flex; justify-content: center; align-items: center; gap: 12px; min-height: 44px; padding: 10px 20px; border: 1px solid var(--deep); border-radius: 30px; background: var(--deep); color: #faf8f2; font: 500 12px var(--sans); letter-spacing: .02em; white-space: nowrap; cursor: pointer; }
  @media (max-width: 580px) {
    .site-header { width: calc(100% - 24px); padding-left: 14px; }
    .header-left { gap: 10px; }
    .brand { font-size: 11px; }
    .status-link { font-size: 9px; }
    .pass-button { padding-inline: 14px; }
  }
</style>
