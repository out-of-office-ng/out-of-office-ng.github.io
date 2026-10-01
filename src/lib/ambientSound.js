import { writable } from 'svelte/store';

// Sound is opt-in, controlled beside the water. --codex
export const muted = writable(true);
export function toggleMute() { muted.update(value => !value); }
