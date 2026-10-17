import { writable } from 'svelte/store';

// One on-page switch for the site's ambient motion — the water, the floating
// photos, the danfo and the About fire (WCAG 2.2.2 Pause, Stop, Hide).
// Remembered per visitor. Visitors whose system asks for reduced motion start
// paused; the header hides the switch for them because nothing moves.
const KEY = 'ooo-motion';
const reduce = typeof matchMedia === 'undefined' ? null : matchMedia('(prefers-reduced-motion: reduce)');

function saved() {
  try { return localStorage.getItem(KEY) === 'paused'; } catch { return false; }
}

export const motionPaused = writable(!!reduce?.matches || saved());
export const motionReduced = writable(!!reduce?.matches);

reduce?.addEventListener('change', () => {
  motionReduced.set(reduce.matches);
  motionPaused.set(reduce.matches || saved());
});

motionPaused.subscribe(paused => {
  if (typeof document !== 'undefined') document.documentElement.dataset.motion = paused ? 'paused' : 'running';
});

export function toggleMotion() {
  motionPaused.update(paused => {
    try { localStorage.setItem(KEY, paused ? 'running' : 'paused'); } catch { /* storage blocked */ }
    return !paused;
  });
}
