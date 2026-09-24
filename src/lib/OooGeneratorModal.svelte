<script>
  import { fade, scale } from 'svelte/transition';
  import { cubicIn, cubicOut } from 'svelte/easing';
  import { dialogDuration } from './motion.js';

  export let isOpen = false;
  export let onClose = () => {};

  let toneLevel = 3;
  let returnTime = 'Next Monday';
  let emergencyContact = 'Talk to the ocean';

  const TONE_LABELS = {
    1: 'Corporate Polished',
    2: 'Mildly Sarcastic',
    3: 'Unapologetic Lagos OOO',
    4: 'Total Disappearance ("Gone to Touch Grass")'
  };

  const RETURN_OPTIONS = [
    'Next Monday',
    'When the Third Mainland Bridge opens',
    'End of the Month',
    'When my battery hits 100%',
    'Never (I belong to the beach now)'
  ];

  const EMERGENCY_OPTIONS = [
    'Talk to the ocean waves',
    'My manager (good luck)',
    'Send a pigeon to Tarkwa Bay',
    'Try Slack (I muted all notifications)',
    'Call nobody'
  ];

  $: generatedText = generateMessage(toneLevel, returnTime, emergencyContact);

  function generateMessage(level, ret, emerg) {
    if (level === 1) {
      return `Subject: Out of Office: Lagos Retreat\n\nHi there,\n\nThanks for your email. I am currently out of office participating in the Out of Office Lagos disconnect event. I will return on ${ret}.\n\nFor urgent issues, please contact ${emerg}.\n\nBest regards,\n[Your Name]`;
    } else if (level === 2) {
      return `Subject: Out of Office (Attempting to disconnect)\n\nHello,\n\nI am away from my inbox attending Out of Office Lagos. Expected return: ${ret}.\n\nI will have limited access to email (meaning I am ignoring it). Urgent matters? Reach out to: ${emerg}.\n\nCheers,\n[Your Name]`;
    } else if (level === 3) {
      return `Subject: OOO: Currently touching grass in Lagos 🌴\n\nHey!\n\nI am officially Out of Office. No laptops, no Slack pings, no "quick syncs". Expected back: ${ret}.\n\nEmergency contact? ${emerg}.\nOtherwise, enjoy your week while I enjoy mine.\n\n-[Your Name]`;
    } else {
      return `Subject: AUTO-REPLY: Gone to touch grass 🌊🔥\n\nI am currently offline, unbothered, and attending Out of Office Lagos.\n\nWill I respond before ${ret}? Unlikely.\nWill I check Slack? Absolutely not.\nEmergency? ${emerg}.\n\nPeace & quiet,\n[Your Name]`;
    }
  }

  // Inline confirmation on the button itself — no toasts.
  let copied = false;
  let copiedTimer;
  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(generatedText);
    } catch {
      return;
    }
    copied = true;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied = false), 1800);
  }
</script>

{#if isOpen}
  <div
    class="overlay"
    on:click={onClose}
    on:keydown={(e) => e.key === 'Escape' && onClose()}
    tabindex="-1"
    role="button"
    transition:fade={{ duration: dialogDuration(180) }}
  >
    <div
      class="modal"
      on:click|stopPropagation
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      tabindex="-1"
      in:scale={{ start: 0.96, duration: dialogDuration(220), easing: cubicOut }}
      out:scale={{ start: 0.96, duration: dialogDuration(140), easing: cubicIn }}
    >
      <div class="modal-header">
        <div>
          <span class="badge">AUTO-RESPONDER</span>
          <h2 id="modal-title" class="modal-title">OOO Email Generator</h2>
        </div>
        <button class="close-btn" on:click={onClose} aria-label="Close dialog">&times;</button>
      </div>

      <div class="modal-body">
        <div class="control-section">
          <div class="field">
            <div class="field-label">
              <span>Passive-Aggressive Tone</span>
              <span class="tone-badge">{TONE_LABELS[toneLevel]}</span>
            </div>
            <input
              type="range"
              min="1"
              max="4"
              step="1"
              class="slider"
              bind:value={toneLevel}
            />
          </div>

          <div class="field-row">
            <div class="field">
              <label for="return-select">Expected Return</label>
              <select id="return-select" class="select" bind:value={returnTime}>
                {#each RETURN_OPTIONS as r}
                  <option value={r}>{r}</option>
                {/each}
              </select>
            </div>

            <div class="field">
              <label for="emerg-select">Emergency Contact</label>
              <select id="emerg-select" class="select" bind:value={emergencyContact}>
                {#each EMERGENCY_OPTIONS as e}
                  <option value={e}>{e}</option>
                {/each}
              </select>
            </div>
          </div>
        </div>

        <div class="output-card">
          <div class="card-header">
            <span class="card-title">Generated Auto-Responder</span>
            <button class="copy-btn" on:click={copyToClipboard}>{copied ? 'Copied ✓ Now go touch grass' : '📋 Copy Auto-Reply'}</button>
          </div>
          <pre class="preview-box">{generatedText}</pre>
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
  }

  .modal {
    width: min(92vw, 640px);
    background: var(--bg);
    color: var(--ink);
    border: 1px solid var(--border-soft-deep);
    border-radius: 18px;
    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.45);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-soft-deep);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .badge {
    font-size: 0.65rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    background: var(--pink-deep, #fc9ce0);
    color: #fff;
    text-transform: uppercase;
  }

  .modal-title {
    margin: 0.4rem 0 0;
    font-size: 1.5rem;
    font-weight: 700;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: var(--muted);
    cursor: pointer;
  }

  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    max-height: 80vh;
    overflow-y: auto;
  }

  .control-section {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    background: var(--card-surface);
    padding: 1.2rem;
    border-radius: 12px;
    border: 1px solid var(--border-soft-deep);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    flex: 1;
  }

  .field-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
  }

  .field-label {
    display: flex;
    justify-content: space-between;
    font-weight: 600;
    font-size: 0.9rem;
  }

  .tone-badge {
    color: var(--blue, #00bfff);
    font-weight: 700;
    font-size: 0.85rem;
  }

  .slider {
    width: 100%;
    accent-color: var(--blue, #00bfff);
    cursor: pointer;
  }

  .select {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--bg);
    color: var(--ink);
    border: 1.5px solid var(--border-soft-deep);
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.9rem;
  }

  .output-card {
    background: var(--card-surface);
    border: 2px dashed var(--border-soft-deep);
    border-radius: 12px;
    padding: 1.2rem;
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-weight: 700;
    font-size: 0.95rem;
  }

  .copy-btn {
    background: var(--blue, #00bfff);
    color: #fff;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  .copy-btn:hover {
    transform: translateY(-2px);
  }

  .preview-box {
    margin: 0;
    white-space: pre-wrap;
    font-family: monospace;
    font-size: 0.85rem;
    line-height: 1.5;
    background: var(--bg);
    padding: 1rem;
    border-radius: 8px;
    color: var(--ink);
    border: 1px solid var(--border-soft-deep);
  }

</style>
