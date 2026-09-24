<script>
  import { onMount, onDestroy } from "svelte";
  import { pageProgress } from "./scrollProgress.js";
  import { muted, beachUserVol, cityUserVol } from "./ambientSound.js";

  // Concept 5 (concept.txt), reinterpreted per user direction 2026-07-17:
  // "rowdy people in a busy place" at the top, "blue and a beach sound" near
  // the ticket line, mute/unmute default-on. Two looping beds crossfaded by
  // whole-document scroll fraction (pageProgress, already driving the
  // corporate->handwritten type morph — reused here for the same reason:
  // one scroll-driven timeline, not several invented ones).
  //
  // PLUMBING ONLY — no audio assets ship yet (none exist in this repo and
  // this skill won't fabricate/guess-source them). Drop real loopable clips
  // at these exact paths and this component activates with no code changes:
  //   public/audio/city-busy.mp3    — busy/rowdy street or crowd ambience
  //   public/audio/beach-waves.mp3  — ocean/beach ambience
  // Missing files fail silently (caught play() rejection, no console noise).

  let cityEl;
  let beachEl;
  let isMuted = false;
  let progress = 0;
  let gestureArmed = false;
  
  let userBeachVol = 80;
  let userCityVol = 40;

  const unsubMuted = muted.subscribe((v) => (isMuted = v));
  const unsubProgress = pageProgress.subscribe((v) => (progress = v));
  const unsubBeachVol = beachUserVol.subscribe((v) => (userBeachVol = v));
  const unsubCityVol = cityUserVol.subscribe((v) => (userCityVol = v));

  function clamp01(v) {
    return Math.max(0, Math.min(1, v));
  }

  // City bed: full volume at the top, fully faded by 12% down the page.
  $: cityScrollMult = clamp01(1 - progress / 0.12);
  // Beach bed: silent until 82% down the page, full by the very bottom
  $: beachScrollMult = clamp01((progress - 0.82) / 0.18);

  $: if (cityEl) cityEl.volume = isMuted ? 0 : (userCityVol / 100) * cityScrollMult;
  $: if (beachEl) beachEl.volume = isMuted ? 0 : (userBeachVol / 100) * beachScrollMult;

  // Browsers block audio playback before a real user gesture. Both beds
  // play continuously once armed — volume (above), not play/pause, carries
  // the crossfade and the mute toggle, so there's no re-arm race later.
  function arm() {
    if (gestureArmed) return;
    gestureArmed = true;
    cityEl?.play().catch(() => {});
    beachEl?.play().catch(() => {});
  }

  onMount(() => {
    window.addEventListener("pointerdown", arm, { once: true });
    window.addEventListener("keydown", arm, { once: true });
    window.addEventListener("scroll", arm, { once: true, passive: true });
  });

  onDestroy(() => {
    unsubMuted();
    unsubProgress();
    unsubBeachVol();
    unsubCityVol();
    window.removeEventListener("pointerdown", arm);
    window.removeEventListener("keydown", arm);
    window.removeEventListener("scroll", arm);
  });
</script>

<audio bind:this={cityEl} src="/audio/city-busy.mp3" loop preload="none"></audio>
<audio bind:this={beachEl} src="/audio/beach-waves.m4a" loop preload="none"></audio>
