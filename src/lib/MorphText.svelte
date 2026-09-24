<script>
  import { calm } from './calm.js';

  export let text;
  // Local multiplier lets a caller push its own morph further/less than raw
  // page scroll fraction (e.g. Tickets, being last, can lean fully
  // handwritten well before the literal bottom of the document).
  export let boost = 1;

  // calm = page scroll, or 1 while the header status is AWAY.
  $: p = Math.max(0, Math.min(1, $calm * boost));

  // Crossfade window: fully corporate below 40%, fully handwritten above
  // 60%, dissolving between. Narrow on purpose — the two faces have very
  // different metrics (uppercase/tracked vs rotated cursive), so a long
  // blend reads as a double-exposure. A quick dissolve reads as a swap.
  $: handOpacity = Math.max(0, Math.min(1, (p - 0.4) / 0.2));
  $: corpOpacity = 1 - handOpacity;
</script>

<span class="morph-text">
  <span class="mt-corporate" aria-hidden="true" style="opacity: {corpOpacity};">{text}</span>
  <span class="mt-hand" aria-hidden="true" style="opacity: {handOpacity};">{text}</span>
  <span class="mt-sr-only">{text}</span>
</span>

<style>
  /* Corporate (grotesk, tracked-out caps) crossfades into handwritten
     (marker script) as p climbs from 0 to 1 — a continuous scroll-tied
     morph rather than a fixed per-element font assignment. Both states
     occupy the same grid cell so there's no layout jump mid-fade.
     Opacity crossfade rather than a clip-path wipe: the two faces don't
     share glyph metrics (different case, tracking, rotation), so slicing
     them at a shared boundary never lines up — a dissolve doesn't need
     alignment, it just needs both centered on the same anchor. */
  .morph-text {
    position: relative;
    display: inline-grid;
  }
  .mt-corporate,
  .mt-hand {
    grid-area: 1 / 1;
    will-change: opacity;
    white-space: nowrap;
    transition: opacity 0.15s ease;
  }
  .mt-corporate {
    text-transform: uppercase;
  }
  .mt-hand {
    text-transform: none;
    letter-spacing: 0.02em;
    transform: rotate(-3deg);
    font-family: var(--marker, 'Permanent Marker', cursive);
    color: var(--pink-deep);
  }
  .mt-sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .mt-corporate,
    .mt-hand {
      transition: none;
    }
  }
</style>
