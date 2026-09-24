<script>
  import { onMount } from 'svelte';
  import HeaderBar from './lib/HeaderBar.svelte';
  import BootSequence from './lib/BootSequence.svelte';
  import PaperHero from './lib/PaperHero.svelte';
  import EscapeMetrics from './lib/EscapeMetrics.svelte';
  import MemoryTimeline from './lib/MemoryTimeline.svelte';
  import FeaturedShowcase from './lib/FeaturedShowcase.svelte';
  import Playlist from './lib/Playlist.svelte';
  import Tickets from './lib/Tickets.svelte';
  import ScrollReveal from './lib/ScrollReveal.svelte';
  import ChaosLayer from './lib/ChaosLayer.svelte';
  import AboutEvent from './lib/AboutEvent.svelte';
  import EventTrail from './lib/EventTrail.svelte';
  import RsvpDrawer from './lib/RsvpDrawer.svelte';
  import OooGeneratorModal from './lib/OooGeneratorModal.svelte';
  import ScheduleFAQ from './lib/ScheduleFAQ.svelte';
  import { pageProgress } from './lib/scrollProgress.js';
  import { forcedCalm, goAway, goOnline } from './lib/calm.js';

  let isDrawerOpen = false;
  let isOooGenOpen = false;
  let isScrolled = false;
  let showStickyCta = false;
  let currentRoute = typeof window !== 'undefined' ? window.location.hash || '#/' : '#/';
  const openDrawer = () => isDrawerOpen = true;
  function onHashChange() { currentRoute = window.location.hash || '#/'; }
  function handleStatusChange(online) {
    if (online) goOnline(); else goAway();
    window.dispatchEvent(new CustomEvent(online ? 'oooStatusOnline' : 'oooStatusAway'));
  }
  function onBoard() {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.querySelector('.tickets-section')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
  }
  onMount(() => {
    let frame = 0;
    function readScroll() {
      frame = 0;
      isScrolled = window.scrollY > 80;
      showStickyCta = window.scrollY > window.innerHeight * .8;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      pageProgress.set(total <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / total)));
    }
    function queueScroll() { if (!frame) frame = requestAnimationFrame(readScroll); }
    readScroll();
    window.addEventListener('scroll', queueScroll, { passive: true });
    window.addEventListener('resize', queueScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queueScroll);
      window.removeEventListener('resize', queueScroll);
    };
  });
</script>

<svelte:window on:hashchange={onHashChange} />

{#if currentRoute === '#/about'}
  <AboutEvent />
{:else if currentRoute === '#/trail'}
  <EventTrail />
{:else}
  <BootSequence />
  <HeaderBar scrollState={isScrolled ? 'frosted' : 'transparent'} onOpenDrawer={openDrawer} onStatusChange={handleStatusChange} />
  <div class="chaos-rain"><ChaosLayer progress={$forcedCalm} /></div>
  <main>
    <PaperHero {onBoard} />
    <ScrollReveal let:visible><EscapeMetrics {visible} /></ScrollReveal>
    <FeaturedShowcase />
    <ScrollReveal let:visible><MemoryTimeline {visible} /></ScrollReveal>
    <ScrollReveal let:visible><Playlist {visible} /></ScrollReveal>
    <ScheduleFAQ />
    <ScrollReveal let:visible><Tickets {visible} showSticky={showStickyCta} onOpenDrawer={openDrawer} /></ScrollReveal>
    <!-- Stream B mounts Shallows here: the boarding pass is the last stop on land. -->
    <section class="arrival-reserved" aria-label="The shallows">
      <p>Leaving yellow Lagos. Entering blue Lagos.</p>
      <p class="arrival-note">The shallows · No. 04</p>
    </section>
  </main>
  <RsvpDrawer isOpen={isDrawerOpen} onClose={() => isDrawerOpen = false} />
  <OooGeneratorModal isOpen={isOooGenOpen} onClose={() => isOooGenOpen = false} />
{/if}

<style>
  /* Hallmark · macrostructure: crossing · tone: analog · anchor hue: deep water */
  .chaos-rain { position: fixed; inset: 80px 0 0; pointer-events: none; z-index: 90; }
  .arrival-reserved { min-height: 45vh; display: flex; flex-direction: column; justify-content: end; padding: 48px clamp(24px, 6vw, 96px); background: linear-gradient(var(--water-sky), var(--seafoam)); color: var(--ink); }
  .arrival-reserved p { font: 700 clamp(24px, 4vw, 48px)/1.2 var(--serif); max-width: 680px; }
  .arrival-reserved .arrival-note { font: 500 12px/1.5 var(--sans); }
</style>
