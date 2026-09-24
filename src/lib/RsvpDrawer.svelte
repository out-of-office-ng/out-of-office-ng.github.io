<script>
  import { onDestroy } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { cubicIn, cubicOut } from 'svelte/easing';
  import { dialogDuration } from './motion.js';
  import { SALES_MODE, NEXT_EVENT } from './sales.js';

  const salesOpen = SALES_MODE === 'open';

  export let isOpen = false;
  export let onClose = () => {};

  const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  let step = 1;
  let selectedTierId = 'explorer';
  let attendeeName = '';
  let attendeeEmail = '';
  let selectedBadge = 'Offline Legend';
  let confirmedPass = null;
  let paying = false;
  // Inline feedback, shown in the step that owns the action (no toasts).
  let nameError = false;
  let emailError = false;
  let cancelNote = false;
  let checkoutUnavailable = false;
  let copied = false;
  let copiedTimer;
  onDestroy(() => clearTimeout(copiedTimer));

  const TIERS = [
    {
      id: 'explorer',
      name: 'Explorer Pass',
      price: '₦15,000',
      amountKobo: 1500000,
      desc: 'Perfect for those who want the full disconnect experience with shared tenting.',
      perks: [
        '🌅 Sunrise Yoga Session',
        '🎨 Open Canvas Painting',
        '🏐 Games & Group Activities',
        '🔥 Bonfire Experience',
        '⛺ Shared Tent Accommodation',
        '🥤 Light Refreshments'
      ]
    },
    {
      id: 'retreat',
      name: 'Retreat Pass',
      price: '₦20,000',
      amountKobo: 2000000,
      desc: 'Full experience with the added comfort and privacy of your own tent & beach picnic.',
      perks: [
        '🌅 Sunrise Yoga Session',
        '🎨 Open Canvas Painting',
        '🧺 Beach Picnic',
        '🏐 Games & Group Activities',
        '🔥 Bonfire Experience',
        '⛺ Private Tent Accommodation',
        '🥤 Light Refreshments'
      ]
    }
  ];

  const BADGES = [
    'Offline Legend',
    'Slack Ghost',
    'Unsent Email Survivor',
    'No-Reply Enthusiast',
    'Danfo Navigator'
  ];

  function handleConfirm() {
    nameError = !attendeeName.trim();
    emailError = !attendeeEmail.trim();
    cancelNote = false;
    checkoutUnavailable = false;
    if (nameError || emailError) return;

    const tierObj = TIERS.find((t) => t.id === selectedTierId) || TIERS[0];

    if (typeof PaystackPop !== 'undefined' && PAYSTACK_PUBLIC_KEY) {
      paying = true;
      const popup = new PaystackPop();
      popup.newTransaction({
        key: PAYSTACK_PUBLIC_KEY,
        email: attendeeEmail,
        amount: tierObj.amountKobo,
        currency: 'NGN',
        ref: 'OOO_' + tierObj.id + '_' + Math.floor(Math.random() * 1000000000 + 1),
        onSuccess: (transaction) => {
          paying = false;
          issuePass(tierObj, transaction.reference);
        },
        onCancel: () => {
          paying = false;
          cancelNote = true;
        }
      });
    } else {
      checkoutUnavailable = true;
    }
  }

  function issuePass(tierObj, refCode) {
    const passCode = 'OOO-LOS-' + Math.floor(100000 + Math.random() * 900000);
    confirmedPass = {
      code: passCode,
      ref: refCode,
      name: attendeeName,
      email: attendeeEmail,
      tier: tierObj.name,
      price: tierObj.price,
      badge: selectedBadge,
      issuedAt: new Date().toLocaleDateString()
    };

    step = 3;
  }

  function copyPassInfo() {
    if (!confirmedPass) return;
    const text = `Out of Office Pass #${confirmedPass.code}\nRef: ${confirmedPass.ref}\nHolder: ${confirmedPass.name}\nTier: ${confirmedPass.tier}\nPrice: ${confirmedPass.price}\nBadge: ${confirmedPass.badge}`;
    navigator.clipboard?.writeText(text);
    copied = true;
    clearTimeout(copiedTimer);
    copiedTimer = setTimeout(() => (copied = false), 1800);
  }

  function resetAndClose() {
    step = 1;
    confirmedPass = null;
    paying = false;
    nameError = emailError = cancelNote = false;
    copied = false;
    onClose();
  }
</script>

<svelte:window on:keydown={(e) => isOpen && e.key === 'Escape' && resetAndClose()} />

{#if isOpen}
  <div
    class="overlay"
    on:click={(e) => e.target === e.currentTarget && resetAndClose()}
    role="presentation"
    transition:fade={{ duration: dialogDuration(180) }}
  >
    <div
      class="sheet"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sheet-title"
      tabindex="-1"
      in:fly={{ x: 40, duration: dialogDuration(280), easing: cubicOut }}
      out:fly={{ x: 40, duration: dialogDuration(160), easing: cubicIn }}
    >
      <div class="sheet-header">
        <div>
          <span class="badge">OOO 0x04 · NOVEMBER</span>
          <h2 id="sheet-title" class="sheet-title">{salesOpen ? 'Claim Event Pass' : 'Pass update'}</h2>
        </div>
        <button class="close-btn" on:click={resetAndClose} aria-label="Close sheet">&times;</button>
      </div>

      <div class="sheet-body">
        {#if !salesOpen}
          <div class="step-pane">
            <p class="closed-lede">
              The next Out of Office is in <strong>{NEXT_EVENT.when}</strong>.
              {NEXT_EVENT.detail}
            </p>
            <p class="closed-note">
              Tickets aren't on sale yet, so there's nothing to pay today.
              Release &amp; Unwind (0x03) has already happened.
            </p>
            <button class="primary-btn" on:click={resetAndClose}>Got it</button>
          </div>
        {:else if step === 1}
          <div class="step-pane">
            <h3 class="pane-subtitle">1. Select Pass Tier & Inclusions Breakdown</h3>
            <div class="tier-grid">
              {#each TIERS as t}
                <div
                  class="tier-card"
                  class:active={selectedTierId === t.id}
                  on:click={() => (selectedTierId = t.id)}
                  on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && (selectedTierId = t.id)}
                  role="button"
                  tabindex="0"
                >
                  <div class="tier-top">
                    <span class="tier-name">{t.name}</span>
                    <span class="tier-price">{t.price}</span>
                  </div>
                  <p class="tier-desc">{t.desc}</p>
                  <div class="inclusions-header">What's Included:</div>
                  <ul class="perk-list">
                    {#each t.perks as perk}
                      <li>{perk}</li>
                    {/each}
                  </ul>
                </div>
              {/each}
            </div>
            <button class="primary-btn" on:click={() => (step = 2)}>Continue to Attendee Details &rarr;</button>
          </div>
        {:else if step === 2}
          <div class="step-pane">
            <h3 class="pane-subtitle">2. Attendee Details & Checkout</h3>
            <div class="selected-tier-banner">
              SELECTED: <strong>{TIERS.find(t => t.id === selectedTierId)?.name}</strong> ({TIERS.find(t => t.id === selectedTierId)?.price})
            </div>

            <div class="form-group">
              <label for="attendee-name">Name / Alias *</label>
              <input
                id="attendee-name"
                type="text"
                class="input"
                placeholder="e.g. Tunde (Offline)"
                bind:value={attendeeName}
                on:input={() => (nameError = false)}
                aria-invalid={nameError}
              />
              {#if nameError}<p class="field-error" role="alert">Name required to issue your pass.</p>{/if}
            </div>

            <div class="form-group">
              <label for="attendee-email">Email Address (for Paystack Pass Receipt) *</label>
              <input
                id="attendee-email"
                type="email"
                class="input"
                placeholder="you@example.com"
                bind:value={attendeeEmail}
                on:input={() => (emailError = false)}
                aria-invalid={emailError}
              />
              {#if emailError}<p class="field-error" role="alert">Email required for your receipt.</p>{/if}
            </div>

            <div class="form-group">
              <label for="badge-select">Select Custom Badge</label>
              <select id="badge-select" class="select" bind:value={selectedBadge}>
                {#each BADGES as b}
                  <option value={b}>{b}</option>
                {/each}
              </select>
            </div>

            {#if cancelNote}
              <p class="field-error muted" role="status">Payment cancelled — try again whenever you're ready.</p>
            {/if}
            {#if checkoutUnavailable}
              <p class="field-error" role="alert">Checkout is unavailable. No pass was issued or payment taken.</p>
            {/if}

            <div class="btn-row">
              <button class="sec-btn" on:click={() => (step = 1)}>&larr; Back</button>
              <button class="primary-btn" on:click={handleConfirm} disabled={paying}>
                {paying ? 'Opening Paystack…' : `Pay ${TIERS.find(t => t.id === selectedTierId)?.price} via Paystack 💳`}
              </button>
            </div>
          </div>
        {:else if step === 3 && confirmedPass}
          <div class="step-pane">
            <div class="pass-ticket">
              <div class="ticket-top">
                <span class="t-badge">LAGOS OOO PASS</span>
                <span class="t-code">{confirmedPass.code}</span>
              </div>
              <div class="ticket-name">{confirmedPass.name}</div>
              <div class="ticket-meta">
                <div><span>TIER:</span> {confirmedPass.tier} ({confirmedPass.price})</div>
                <div><span>REF:</span> {confirmedPass.ref}</div>
                <div><span>BADGE:</span> {confirmedPass.badge}</div>
                <div><span>ISSUED:</span> {confirmedPass.issuedAt}</div>
              </div>
            </div>

            <div class="btn-row">
              <button class="sec-btn" on:click={copyPassInfo}>{copied ? 'Copied ✓' : 'Copy Pass Data'}</button>
              <button class="primary-btn" on:click={resetAndClose}>Done</button>
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .overlay {
    position: fixed;
    inset: 0;
    z-index: 10000;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: flex-end;
  }

  .sheet {
    width: min(100vw, 560px);
    height: 100%;
    background: var(--bg);
    color: var(--ink);
    border-left: 1px solid var(--border-soft-deep);
    box-shadow: -10px 0 40px rgba(0, 0, 0, 0.2);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sheet-header {
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
    background: var(--blue, #00bfff);
    color: #fff;
    text-transform: uppercase;
  }

  .sheet-title {
    margin: 0.4rem 0 0;
    font-size: 1.4rem;
    font-weight: 700;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 1.8rem;
    color: var(--muted);
    cursor: pointer;
  }

  .closed-lede {
    margin: 0 0 0.75rem;
    font-size: 1.05rem;
    line-height: 1.5;
  }
  .closed-note {
    margin: 0 0 1.5rem;
    font-size: 0.9rem;
    line-height: 1.5;
    opacity: 0.8;
  }

  .sheet-body {
    padding: 1.5rem;
    flex: 1;
    overflow-y: auto;
  }

  .step-pane {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .pane-subtitle {
    margin: 0;
    font-size: 1.05rem;
    font-weight: 700;
  }

  .selected-tier-banner {
    background: rgba(0, 191, 255, 0.1);
    border: 1px solid var(--blue, #00bfff);
    color: var(--blue, #00bfff);
    padding: 0.8rem 1rem;
    border-radius: 8px;
    font-size: 0.88rem;
  }

  .tier-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .tier-card {
    background: var(--card-surface);
    border: 2px solid var(--border-soft-deep);
    border-radius: 12px;
    padding: 1.2rem;
    cursor: pointer;
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  .tier-card:hover {
    transform: translateY(-2px);
  }

  .tier-card.active {
    border-color: var(--blue, #00bfff);
    box-shadow: 0 4px 14px rgba(0, 191, 255, 0.2);
  }

  .tier-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
  }

  .tier-name {
    font-weight: 700;
    font-size: 1.1rem;
  }

  .tier-price {
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--blue, #00bfff);
  }

  .tier-desc {
    margin: 0 0 0.8rem;
    font-size: 0.85rem;
    line-height: 1.4;
    color: var(--muted);
  }

  .inclusions-header {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--ink);
    margin-bottom: 0.4rem;
    text-transform: uppercase;
  }

  .perk-list {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    font-size: 0.82rem;
  }

  .field-error {
    margin: 0.2rem 0 0;
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--chaos-red, #e5383b);
  }
  .field-error.muted {
    margin-bottom: 0.8rem;
    color: var(--muted);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .input, .select {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--card-surface);
    color: var(--ink);
    border: 1.5px solid var(--border-soft-deep);
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.9rem;
    outline: 2px solid transparent;
    outline-offset: 1px;
    transition: outline 0.1s;
  }
  .input:hover, .select:hover {
    background: #fff;
  }
  .input:focus-visible, .select:focus-visible {
    outline: 2px solid var(--blue, #00bfff);
  }

  .btn-row {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }

  .primary-btn {
    flex: 1;
    padding: 0.85rem 1.2rem;
    background: var(--blue, #00bfff);
    color: #fff;
    border: none;
    white-space: nowrap;
    border-radius: 999px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 191, 255, 0.3);
    transition: transform 0.15s ease;
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
  .primary-btn:hover:not(:disabled) {
    transform: translateY(-2px);
  }
  .primary-btn:focus-visible {
    outline: 2px solid var(--blue, #00bfff);
  }
  .primary-btn:active:not(:disabled) {
    transform: translateY(1px);
  }
  .primary-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  .sec-btn {
    padding: 0.85rem 1.2rem;
    background: transparent;
    color: var(--ink);
    border: 1.5px solid var(--border-soft-deep);
    border-radius: 999px;
    white-space: nowrap;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: background-color 0.2s, transform 0.1s;
    outline: 2px solid transparent;
    outline-offset: 2px;
  }
  .sec-btn:hover {
    background: var(--card-surface);
  }
  .sec-btn:focus-visible {
    outline: 2px solid var(--blue, #00bfff);
  }
  .sec-btn:active {
    transform: translateY(1px);
  }

  .pass-ticket {
    background: linear-gradient(135deg, #00bfff 0%, #fc9ce0 100%);
    color: #fff;
    padding: 1.5rem;
    border-radius: 14px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .ticket-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.75rem;
    font-weight: 700;
  }

  .ticket-name {
    font-family: "Permanent Marker", cursive;
    font-size: 1.5rem;
  }

  .ticket-meta {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    font-size: 0.8rem;
  }

  .ticket-meta span {
    font-weight: 700;
    opacity: 0.8;
  }
</style>
