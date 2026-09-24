<script>
  import MorphText from './MorphText.svelte';

  export let visible = false;

  const MOMENTS = [
    { word: 'Pause', label: 'The inbox can wait', color: 'var(--blue)' },
    { word: 'Play', label: 'Make room for joy', color: 'var(--sunset-orange)' },
    { word: 'Meet', label: 'Find your people', color: 'var(--muted-green)' },
    { word: 'Return', label: 'Bring the feeling home', color: 'var(--pink-deep)' },
  ];
</script>

<section class="metrics">
  <div class="text-content">
    <p class="eyebrow" class:visible><MorphText text="The auto reply" /></p>
    <h2 class="heading" class:visible>I am currently unavailable.</h2>
    <p class="body" class:visible>
      I'm painting. Playing board games. Watching sunsets. Making memories.
      I will return when my soul battery is charged.
    </p>
  </div>

  <div class="grid">
    {#each MOMENTS as moment, i}
      <div class="tile" class:visible style="--i: {i};">
        <span class="value" style="color: {moment.color}">{moment.word}</span>
        <span class="label">{moment.label}</span>
      </div>
    {/each}
  </div>
</section>

<style>
  .metrics {
    max-width: 1100px;
    margin: 0 auto;
    padding: clamp(3rem, 10vh, 6rem) 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }
  
  @media (min-width: 800px) {
    .metrics {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 5rem;
    }
    .text-content {
      flex: 1 1 45%;
    }
    .grid {
      flex: 1 1 55%;
    }
  }

  .eyebrow,
  .heading,
  .body,
  .tile {
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.6s var(--ease-out-expo), transform 0.6s var(--ease-out-expo);
  }
  .eyebrow.visible,
  .heading.visible,
  .body.visible,
  .tile.visible {
    opacity: 1;
    transform: translateY(0);
  }
  .heading.visible { transition-delay: 90ms; }
  .body.visible { transition-delay: 160ms; }
  .tile.visible { transition-delay: calc(220ms + var(--i, 0) * 90ms); }

  .eyebrow {
    margin: 0 0 0.5rem;
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--accent);
  }
  .heading {
    margin: 0 0 0.75rem;
    font-weight: 700;
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    color: var(--ink);
    line-height: 1.1;
  }
  .body {
    margin: 0;
    max-width: 34ch;
    font-size: 1.1rem;
    color: #5a5a5a;
    line-height: 1.6;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    width: 100%;
  }
  .tile {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    padding: 1.5rem 1.25rem;
    border-radius: 16px;
    background: var(--card-surface);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.06);
  }
  .value {
    font-weight: 700;
    font-size: clamp(1.8rem, 5vw, 2.4rem);
    line-height: 1;
  }
  .label {
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #6b6b6b;
  }
</style>
