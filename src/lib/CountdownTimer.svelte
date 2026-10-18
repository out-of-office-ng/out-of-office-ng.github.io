<script>
  import { onMount, onDestroy } from 'svelte';

  export let targetDateStr = 'August 15, 2026 12:00:00';
  
  let now = new Date();
  let target = new Date(targetDateStr);
  let timeRemaining = Math.max(0, target - now);

  let interval;

  onMount(() => {
    interval = setInterval(() => {
      now = new Date();
      timeRemaining = Math.max(0, target - now);
    }, 1000);
  });

  onDestroy(() => {
    clearInterval(interval);
  });

  $: days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  $: hours = Math.floor((timeRemaining / (1000 * 60 * 60)) % 24);
  $: minutes = Math.floor((timeRemaining / 1000 / 60) % 60);
  $: seconds = Math.floor((timeRemaining / 1000) % 60);

  function pad(num) {
    return num.toString().padStart(2, '0');
  }
</script>

<div class="countdown" aria-label="Countdown to event">
  <div class="time-block">
    <span class="digits">{pad(days)}</span>
    <span class="label">DAY</span>
  </div>
  <span class="sep">:</span>
  <div class="time-block">
    <span class="digits">{pad(hours)}</span>
    <span class="label">HRS</span>
  </div>
  <span class="sep">:</span>
  <div class="time-block">
    <span class="digits">{pad(minutes)}</span>
    <span class="label">MIN</span>
  </div>
  <span class="sep">:</span>
  <div class="time-block">
    <span class="digits">{pad(seconds)}</span>
    <span class="label">SEC</span>
  </div>
</div>

<style>
  .countdown {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.3rem;
    font-family: var(--mono, monospace);
    color: var(--ink);
    background: rgb(255 255 255 / .8);
    padding: 0.5rem 0.8rem;
    border-radius: 8px;
    border: 1px solid var(--border-soft);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    width: fit-content;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }
  
  .time-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    line-height: 1;
    min-width: 1.5rem;
  }

  .digits {
    font-size: clamp(1.1rem, 3vw, 1.4rem);
    font-weight: 800;
    letter-spacing: 0.02em;
  }

  .label {
    font-size: 0.55rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--muted);
    margin-top: 0.2rem;
  }

  .sep {
    font-size: clamp(1rem, 3vw, 1.25rem);
    font-weight: 700;
    opacity: 0.4;
    animation: pulse 1s infinite alternate;
    margin-top: -0.1rem;
  }

  @keyframes pulse {
    0% { opacity: 0.1; }
    100% { opacity: 0.6; }
  }
</style>
