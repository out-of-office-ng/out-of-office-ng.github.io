<script>
  import { onMount } from 'svelte';
  export let animate = true;
  let node;
  let visible = true;
  onMount(() => {
    const preference = matchMedia('(prefers-reduced-motion: reduce)');
    if (preference.matches || !('IntersectionObserver' in window)) return;
    visible = false;
    const observer = new IntersectionObserver((entries) => {
      if (entries.some(entry => entry.isIntersecting)) {
        visible = true;
        observer.disconnect();
      }
    }, { threshold: 0, rootMargin: '0px 0px -24px 0px' });
    observer.observe(node);
    const update = () => { if (preference.matches) { visible = true; observer.disconnect(); } };
    preference.addEventListener('change', update);
    return () => { observer.disconnect(); preference.removeEventListener('change', update); };
  });
</script>

<div bind:this={node} class="reveal-wrapper" class:animate class:visible on:focusin={() => visible = true}>
  <slot {visible} />
</div>

<style>
  .reveal-wrapper.animate { opacity: 0; transform: translateY(14px); transition: opacity 550ms var(--ease-out-expo), transform 550ms var(--ease-out-expo); }
  .reveal-wrapper.animate.visible { opacity: 1; transform: none; }
  @media (prefers-reduced-motion: reduce) { .reveal-wrapper.animate { opacity: 1; transform: none; transition: none; } }
</style>
