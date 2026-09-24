<script>
</script>

<div class="decorations" aria-hidden="true">
  <!-- Left edge vertical spine text -->
  <div class="spine">
    <span>ADMITTANCE STRICTLY FOR OUT OF OFFICE PERSONNEL · TERMS AND CONDITIONS APPLY</span>
  </div>

  <!-- Barcode bottom right -->
  <div class="barcode">
    <svg viewBox="0 0 100 30" preserveAspectRatio="none">
      <path d="M0,0 h4 v30 h-4 Z M6,0 h2 v30 h-2 Z M10,0 h6 v30 h-6 Z M18,0 h2 v30 h-2 Z M22,0 h4 v30 h-4 Z M28,0 h8 v30 h-8 Z M38,0 h2 v30 h-2 Z M42,0 h6 v30 h-6 Z M50,0 h4 v30 h-4 Z M56,0 h2 v30 h-2 Z M60,0 h6 v30 h-6 Z M68,0 h2 v30 h-2 Z M72,0 h8 v30 h-8 Z M82,0 h4 v30 h-4 Z M88,0 h2 v30 h-2 Z M92,0 h4 v30 h-4 Z M98,0 h2 v30 h-2 Z" fill="currentColor"/>
    </svg>
    <span class="code">OOO-001-002</span>
  </div>

  <!-- Care Label Icons (bottom center/left) -->
  <div class="care-icons">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 8l2 12h12l2-12H4z"/><path d="M4 8c0-2 8-2 16 0"/><path d="M8 12c2 1 4-1 6 0"/></svg>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 16h14l-1-7H6l-1 7zM14 9V6h-4v3"/><line x1="4" y1="4" x2="20" y2="20"/></svg>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4"/><path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.34 6.34l1.42 1.42M16.24 16.24l1.42 1.42M6.34 17.66l1.42-1.42M16.24 7.76l1.42-1.42"/></svg>
  </div>

  <!-- Paint-splat scatter graphics -->
  <svg class="splat splat-1" viewBox="0 0 60 50">
    <path fill="var(--accent)" opacity="0.6" d="M30 4c4 0 5 6 9 5s8-3 10 1-3 6-1 10 6 6 2 10-8 1-10 5-4 8-9 6-4-7-9-7-9 4-12-1 2-7-1-11-8-4-5-9 7-3 9-7 2-2 4-4 3-1 5-2z"/>
  </svg>
  <svg class="splat splat-2" viewBox="0 0 60 50">
    <path fill="var(--pink-deep)" opacity="0.4" d="M20 10c6 2 12-4 15 2s4 12 0 15-10 2-15-1-8-12-5-15 4-5 5-1z"/>
  </svg>
</div>

<style>
  .decorations {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
    overflow: hidden;
  }

  /* Vertical spine text, pinned to the card's true far-left edge.
     Previously this rotated a full-width nowrap block around its own
     center, which — since that box was as wide as the whole sentence —
     put the rotated text's midpoint out near the card's horizontal
     center instead of at `left`, so it crossed straight through the
     headline. writing-mode lays it out vertically natively, so its
     footprint is just the (thin) font size, and it stays put at the
     left edge regardless of how long the sentence is. */
  .spine {
    position: absolute;
    left: clamp(0.6rem, 1.8vw, 1.1rem);
    top: 50%;
    writing-mode: vertical-rl;
    text-orientation: mixed;
    transform: translateY(-50%);
    white-space: nowrap;
    font-size: clamp(0.45rem, 1vw, 0.6rem);
    letter-spacing: 0.15em;
    color: #6b6b6b;
    text-transform: uppercase;
    pointer-events: auto;
    cursor: default;
    transition: color 0.3s ease;
  }
  .spine:hover {
    color: var(--ink);
  }

  .barcode {
    position: absolute;
    bottom: clamp(4.5rem, 9vh, 6.5rem);
    right: clamp(1rem, 3vw, 2rem);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    color: var(--ink);
    opacity: 0.7;
    pointer-events: auto;
    cursor: pointer;
    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease;
  }
  .barcode:hover {
    opacity: 1;
    transform: scale(1.05) rotate(2deg);
  }
  .barcode svg {
    width: clamp(40px, 8vw, 60px);
    height: clamp(15px, 3vh, 25px);
  }
  .barcode .code {
    font-size: clamp(0.35rem, 0.8vw, 0.5rem);
    letter-spacing: 0.05em;
  }

  .care-icons {
    position: absolute;
    bottom: clamp(5rem, 10vh, 7rem);
    left: clamp(2.5rem, 5vw, 4rem);
    display: flex;
    gap: 0.5rem;
    color: var(--ink);
    opacity: 0.5;
  }
  .care-icons svg {
    width: clamp(14px, 2.5vw, 20px);
    height: clamp(14px, 2.5vw, 20px);
  }

  .splat {
    position: absolute;
    pointer-events: auto;
    cursor: grab;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .splat:hover {
    transform: scale(1.15) rotate(15deg);
  }
  .splat:active {
    cursor: grabbing;
    transform: scale(0.95) rotate(-5deg);
  }

  .splat-1 {
    width: clamp(50px, 12vw, 120px);
    height: clamp(40px, 10vw, 100px);
    top: clamp(2rem, 5vh, 4rem);
    right: clamp(1rem, 4vw, 3rem);
    transform: rotate(12deg);
  }
  .splat-1:hover {
    transform: scale(1.15) rotate(25deg);
  }
  .splat-1:active {
    transform: scale(0.95) rotate(5deg);
  }

  .splat-2 {
    width: clamp(70px, 18vw, 160px);
    height: clamp(60px, 15vw, 130px);
    bottom: clamp(1rem, 2vh, 3rem);
    left: clamp(4rem, 15vw, 12rem);
    transform: rotate(-24deg);
  }
  .splat-2:hover {
    transform: scale(1.15) rotate(-10deg);
  }
  .splat-2:active {
    transform: scale(0.95) rotate(-35deg);
  }
</style>
