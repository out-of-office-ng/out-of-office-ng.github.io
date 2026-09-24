import { derived } from 'svelte/store';
import { tweened } from 'svelte/motion';
import { cubicInOut } from 'svelte/easing';
import { pageProgress } from './scrollProgress.js';

// One value for "how Out of Office is the page right now", 0..1.
// Two writers, one rule: calm = max(scenic, fast).
//   - pageProgress : where you've scrolled to (the scenic route)
//   - forcedCalm   : the header status toggle set to AWAY (the fast lane)
// Going back ONLINE re-opens the scenic route; nothing else writes here.
//
// forcedCalm is tweened rather than set, so AWAY plays as one exhale —
// the pill counts down, the stress meter drains, the cube twists itself
// solved — instead of snapping every consumer to 1 on the same frame.
const reduceMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const forcedCalm = tweened(0, {
  duration: reduceMotion ? 0 : 1800,
  easing: cubicInOut,
});

export const calm = derived([pageProgress, forcedCalm], ([$page, $forced]) =>
  Math.max($page, $forced)
);

export function goAway() {
  forcedCalm.set(1);
}

export function goOnline() {
  forcedCalm.set(0);
}
