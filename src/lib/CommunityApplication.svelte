<script>
  import { dialogFocus } from './dialogFocus.js';
  export let onClose = () => {};
  let checked = false;
  function review(event) {
    const form = event.currentTarget;
    for (const input of form.querySelectorAll('[data-nonblank]')) {
      input.setCustomValidity(input.value.trim() ? '' : 'Please write a little here.');
    }
    if (form.reportValidity()) checked = true;
  }
</script>

<svelte:window on:keydown={(event) => { if (event.key === 'Escape') onClose(); }} />
<div class="application-overlay" role="presentation" on:click={(event) => { if (event.target === event.currentTarget) onClose(); }}>
  <div class="application-dialog" role="dialog" aria-modal="true" aria-labelledby="application-title" aria-describedby="application-preview" tabindex="-1" use:dialogFocus>
    <button class="close" type="button" on:click={onClose} aria-label="Close community application">×</button>
    <p class="eyebrow">YOUR PEOPLE, OFFLINE</p>
    <h2 id="application-title">Apply to join.</h2>
    <p>Tell us a little about yourself. Applications will be reviewed before invitations are sent.</p>
    <p class="preview" id="application-preview">Form preview — applications aren't open yet. Nothing entered here is sent or saved by this site. Closing clears your answers.</p>
    <form on:submit|preventDefault={review} on:input={(event) => { checked = false; event.target.setCustomValidity?.(''); }}>
      <label for="community-name">Name</label>
      <input id="community-name" name="name" autocomplete="name" required maxlength="100" data-nonblank />
      <label for="community-email">Email</label>
      <input id="community-email" name="email" type="email" autocomplete="email" required maxlength="254" />
      <label for="community-reason">What draws you to Out of Office?</label>
      <textarea id="community-reason" name="reason" rows="3" required maxlength="1500" data-nonblank></textarea>
      <label for="community-sharing">What would you enjoy sharing with the community? <span>(optional)</span></label>
      <textarea id="community-sharing" name="sharing" rows="3" maxlength="1000"></textarea>
      <details id="community-guidelines">
        <summary>Read the draft community guidelines</summary>
        <ul><li>Treat people with respect. No harassment or discrimination.</li><li>Ask before photographing people or sharing their details.</li><li>Respect personal boundaries and the spaces we visit.</li><li>Keep the community free from unsolicited promotions and spam.</li></ul>
        <p>These guidelines are a draft for review before applications open.</p>
      </details>
      <label class="agreement"><input type="checkbox" name="guidelines" required /> <span>I have read and agree to the draft community guidelines.</span></label>
      <p class="privacy">When applications open, your answers will be used to review your request and contact you about it. The submission service, review contact and retention policy will be published before launch.</p>
      <button class="review ui-action" type="submit">Check my application</button>
      <p role="status" aria-live="polite">{checked ? 'Your application is complete for this preview. It has not been sent. Applications are not open yet.' : ''}</p>
    </form>
  </div>
</div>

<style>
  .application-overlay { position: fixed; inset: 0; z-index: 110; background: #101b18b8; display: grid; place-items: center; padding: 16px; }
  .application-dialog { position: relative; width: min(580px, 100%); max-height: calc(100dvh - 32px); overflow-y: auto; overscroll-behavior: contain; padding: clamp(20px, 5vw, 36px); background: var(--card-surface); color: var(--ink); border: 1px solid var(--border-soft-deep); border-radius: 20px; }
  h2 { font: 400 36px var(--serif); margin: 0; }
  p, li { font-size: 14px; line-height: 1.6; }
  .close { position: absolute; top: 10px; right: 10px; width: 44px; height: 44px; border: 0; border-radius: 50%; color: var(--ink); background: var(--border-soft); font-size: 26px; cursor: pointer; }
  .preview { padding: 12px; border-left: 3px solid var(--pink-deep); background: var(--border-soft); }
  form { display: grid; gap: 10px; }
  label { margin-top: 10px; font-size: 14px; font-weight: 600; }
  label span, .privacy { color: var(--muted); }
  input:not([type="checkbox"]), textarea { width: 100%; min-width: 0; padding: 12px; border: 1px solid var(--border-soft-deep); background: var(--bg); color: var(--ink); border-radius: 8px; font: 16px var(--sans); }
  textarea { resize: vertical; }
  input:focus-visible, textarea:focus-visible { outline: 2px solid var(--deep); outline-offset: 2px; }
  summary { min-height: 44px; padding-block: 12px; cursor: pointer; font-size: 14px; text-decoration: underline; text-underline-offset: 4px; }
  .agreement { display: flex; align-items: center; gap: 10px; min-height: 44px; font-weight: 400; }
  input[type="checkbox"] { width: 22px; height: 22px; flex-shrink: 0; accent-color: var(--deep); }
  .review { min-height: 48px; border: 0; border-radius: 28px; background: var(--ink); color: var(--bg); font: 600 14px var(--sans); cursor: pointer; }
</style>
