<script>
  import { onMount } from 'svelte';
  let preference = 'system';
  let system;
  let dark = false;
  function apply() {
    dark = preference === 'system' ? !!system?.matches : preference === 'dark';
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }
  function change() {
    preference = dark ? 'light' : 'dark';
    try { localStorage.setItem('ooo-theme', preference); } catch {}
    apply();
  }
  onMount(() => {
    system = matchMedia('(prefers-color-scheme: dark)');
    try { const saved = localStorage.getItem('ooo-theme'); if (['light', 'dark', 'system'].includes(saved)) preference = saved; } catch {}
    apply();
    system.addEventListener('change', apply);
    return () => system.removeEventListener('change', apply);
  });
</script>

<button class="theme-control" type="button" aria-label="Dark mode" aria-pressed={dark} on:click={change} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
  <span aria-hidden="true">{dark ? '☾' : '☼'}</span>
</button>

<style>
  .theme-control { position: relative; display: grid; place-items: center; flex-shrink: 0; width: 44px; height: 44px; border-radius: 50%; color: var(--ink); font-size: 24px; }
  .theme-control { border: 0; background: transparent; cursor: pointer; }
  .theme-control:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
  .theme-control:hover { background: var(--border-soft); }
</style>
