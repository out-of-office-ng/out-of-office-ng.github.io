<script>
  // Edition video player, shared by the homepage archive and the trail.
  // The <video> only exists while the dialog is open, so nothing downloads or
  // plays in the background. Starts muted on open (the visitor asked to watch)
  // and advances clip to clip; under reduced motion it waits for play.
  import { onMount } from 'svelte';
  import { track } from './analytics.js';

  export let clips = [];
  export let title = '';
  export let meta = '';
  export let slug = 'video';

  let dialog;
  let clip = 0;
  let isOpen = false;
  let reducedMotion = false;

  onMount(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => reducedMotion = preference.matches;
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  });

  export function open() {
    clip = 0;
    isOpen = true;
    dialog.showModal();
    track(`video/${slug}/open`);
  }
  function close() { dialog.close(); }
  function ended() {
    track(`video/${slug}/complete/${clips[clip].id}`);
    if (clip < clips.length - 1) clip += 1;
  }
</script>

<dialog class="video-dialog" bind:this={dialog} aria-labelledby={`${slug}-title`} aria-describedby={`${slug}-desc`} on:click={(event) => event.target === dialog && close()} on:close={() => isOpen = false}>
  {#if clips.length}
    <div class="video-head">
      <div>
        <h2 id={`${slug}-title`}>{title}</h2>
        {#if meta}<p class="video-meta">{meta}</p>{/if}
      </div>
      <button class="video-close" type="button" aria-label="Close video" on:click={close}>×</button>
    </div>
    {#if isOpen}
      {#key clip}
        <!-- svelte-ignore a11y-media-has-caption -->
        <video src={clips[clip].src} poster={clips[clip].poster} controls muted playsinline preload="metadata" autoplay={!reducedMotion} aria-label={`${clips[clip].label}, ${clips[clip].seconds} seconds`} on:play={() => track(`video/${slug}/play/${clips[clip].id}`)} on:ended={ended}></video>
      {/key}
    {/if}
    <p class="clip-desc" id={`${slug}-desc`}><strong>{clips[clip].label}</strong> · {clips[clip].description}</p>
    {#if clips.length > 1}
      <div class="clip-picks" role="group" aria-label="Choose a clip">
        {#each clips as c, i}
          <button type="button" class:current={i === clip} aria-pressed={i === clip} on:click={() => clip = i}><img src={c.poster} alt="" /><span>{c.label} · {c.seconds}s</span></button>
        {/each}
      </div>
    {/if}
  {/if}
</dialog>

<style>
  .video-dialog { width: min(440px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); padding: 16px; border: 1px solid var(--border-soft-deep); border-radius: 14px; background: var(--card-surface); color: var(--ink); overflow: auto; }
  .video-dialog::backdrop { background: #10181799; backdrop-filter: blur(4px); }
  .video-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .video-head h2 { margin: 0; font: 400 26px/1.1 var(--serif); }
  .video-meta { margin: 4px 0 0; color: var(--muted); font-size: 13px; }
  .video-close { width: 44px; height: 44px; border: 0; border-radius: 50%; background: transparent; color: var(--ink); font-size: 28px; cursor: pointer; }
  .video-close:hover { background: var(--border-soft); }
  /* Leave room for the text on tall screens, but never shrink below a watchable
     size (phones in landscape, 400% zoom); the dialog scrolls instead. */
  video { display: block; width: 100%; max-height: max(calc(100dvh - 340px), min(60dvh, 200px)); aspect-ratio: 9 / 16; object-fit: contain; border-radius: 8px; background: #000; }
  .clip-desc { margin: 10px 0 0; color: var(--muted); font-size: 13px; line-height: 1.5; }
  .clip-desc strong { color: var(--ink); font-weight: 600; }
  .clip-picks { display: flex; gap: 10px; margin-top: 12px; }
  .clip-picks button { flex: 1; display: grid; gap: 4px; padding: 4px; border: 2px solid transparent; border-radius: 8px; background: none; color: var(--muted); font: 500 12px var(--sans); cursor: pointer; }
  .clip-picks button.current { border-color: var(--deep); color: var(--ink); }
  .clip-picks img { width: 100%; height: 72px; object-fit: cover; border-radius: 4px; }
</style>
