<script>
  import { onMount } from 'svelte';
  import HeaderBar from './lib/HeaderBar.svelte';
  import Shallows from './lib/Shallows.svelte';
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
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('content-start')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
  }
</script>

<svelte:window on:hashchange={onHashChange} />

{#if currentRoute === '#/about'}
  <AboutEvent />
{:else if currentRoute === '#/trail'}
  <EventTrail />
{:else}
  <HeaderBar scrollState="cream" overlay onOpenDrawer={openDrawer} />
  
  <main>
    <Shallows onOpenDrawer={openDrawer} onOpenOooGen={openOooGen} onScrollToContent={scrollToContent} />

    <div id="content-start">
      <ScrollReveal let:visible><Postcard {visible} /></ScrollReveal>
      <ScrollReveal let:visible><Playlist {visible} /></ScrollReveal>
      <ScrollReveal><Community /></ScrollReveal>
      <ScrollReveal let:visible><MemoryTimeline {visible} /></ScrollReveal>
      <ScheduleFAQ />
      <ScrollReveal let:visible><Tickets {visible} onOpenDrawer={openDrawer} /></ScrollReveal>
    </div>
  </main>

  <RsvpDrawer isOpen={isDrawerOpen} onClose={() => isDrawerOpen = false} />
  <OooGeneratorModal isOpen={isOooGenOpen} onClose={() => isOooGenOpen = false} />
{/if}
