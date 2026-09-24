<script>
  import { onMount } from 'svelte';
  import HeaderBar from './lib/HeaderBar.svelte';
  import Postcard from './lib/Postcard.svelte';
  import Playlist from './lib/Playlist.svelte';
  import Community from './lib/Community.svelte';
  import MemoryTimeline from './lib/MemoryTimeline.svelte';
  import Tickets from './lib/Tickets.svelte';
  import ScheduleFAQ from './lib/ScheduleFAQ.svelte';
  import AboutEvent from './lib/AboutEvent.svelte';
  import EventTrail from './lib/EventTrail.svelte';
  import RsvpDrawer from './lib/RsvpDrawer.svelte';
  import OooGeneratorModal from './lib/OooGeneratorModal.svelte';
  import ScrollReveal from './lib/ScrollReveal.svelte';

  let isDrawerOpen = false;
  let isOooGenOpen = false;
  let currentRoute = typeof window !== 'undefined' ? window.location.hash || '#/' : '#/';
  
  const openDrawer = () => isDrawerOpen = true;
  const openOooGen = () => isOooGenOpen = true;
  function onHashChange() { currentRoute = window.location.hash || '#/'; }
  
  function scrollToContent() {
    document.getElementById('content-start')?.scrollIntoView({ behavior: 'smooth' });
  }
</script>

<svelte:window on:hashchange={onHashChange} />

{#if currentRoute === '#/about'}
  <AboutEvent />
{:else if currentRoute === '#/trail'}
  <EventTrail />
{:else}
  <HeaderBar scrollState="transparent" onOpenDrawer={openDrawer} />
  
  <main>
    <section class="hero-wrapper">
      <iframe src="/deepseek_1.html" title="The shallows" class="shallows-frame"></iframe>
      <button class="scroll-prompt" on:click={scrollToContent} aria-label="Scroll to content">
        Explore the Party ↓
      </button>
    </section>

    <div id="content-start">
      <ScrollReveal let:visible><Postcard {visible} /></ScrollReveal>
      <ScrollReveal let:visible><Playlist {visible} /></ScrollReveal>
      <ScrollReveal let:visible><Community {visible} /></ScrollReveal>
      <ScrollReveal let:visible><MemoryTimeline {visible} /></ScrollReveal>
      <ScheduleFAQ />
      <ScrollReveal let:visible><Tickets {visible} showSticky={false} onOpenDrawer={openDrawer} /></ScrollReveal>
    </div>
  </main>

  <RsvpDrawer isOpen={isDrawerOpen} onClose={() => isDrawerOpen = false} />
  <OooGeneratorModal isOpen={isOooGenOpen} onClose={() => isOooGenOpen = false} />
{/if}

<style>
  .hero-wrapper {
    position: relative;
    width: 100vw;
    height: 100vh;
  }
  .shallows-frame {
    width: 100%;
    height: 100%;
    border: none;
    display: block;
    pointer-events: auto;
  }
  .scroll-prompt {
    position: absolute;
    bottom: max(24px, env(safe-area-inset-bottom));
    right: 24px;
    z-index: 10;
    background: var(--ink, #181818);
    color: var(--bg, #f6f4f1);
    border: none;
    padding: 12px 24px;
    border-radius: 999px;
    font-family: var(--sans, system-ui, sans-serif);
    font-weight: 700;
    font-size: 0.85rem;
    cursor: pointer;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    transition: transform 0.2s ease, background 0.2s ease;
  }
  .scroll-prompt:hover {
    transform: translateY(-2px);
    background: var(--blue, #00bfff);
  }
</style>
