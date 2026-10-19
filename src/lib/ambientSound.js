import { writable } from 'svelte/store';

// The waves are on by default (owner's call, 19 Oct). Browsers still hold all
// sound until the visitor's first tap or key press, so that is when it starts.
// Turning it off in the header is remembered per visitor.
const KEY = 'ooo-sound';

function savedOff() {
  try { return localStorage.getItem(KEY) === 'off'; } catch { return false; }
}

export const muted = writable(savedOff());
export function toggleMute() {
  muted.update(value => {
    try { localStorage.setItem(KEY, value ? 'on' : 'off'); } catch { /* storage blocked */ }
    return !value;
  });
}
