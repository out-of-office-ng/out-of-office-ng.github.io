<script>
  import MorphText from './MorphText.svelte';

  export let visible = false;

  const POLAROIDS = [
    { word: 'MAKE', caption: 'room for art', rotate: -4 },
    { word: 'PLAY', caption: 'without a plan', rotate: 3 },
    { word: 'MEET', caption: 'somebody new', rotate: -2 },
  ];
</script>

<section class="community">
  <div class="text-content">
    <p class="eyebrow"><MorphText text="Community > calendar invites" /></p>
    <h2 class="heading">Good company changes the day.</h2>

    <div class="manifesto" class:visible>
      <p>Out of Office is not status-heavy nightlife. It is a small rebellion: music, art, board games, shared snacks and the kind of conversation you remember on Monday.</p>
    </div>

    <div class="cta-row" class:visible>
      <a class="btn-join" href="#/trail">See the trail →</a>
    </div>
  </div>

  <div class="wall">
    {#each POLAROIDS as p, i}
      <figure class="polaroid" class:visible style="--rotate: {p.rotate}deg; --i: {i};">
        <span class="polaroid-art" aria-hidden="true">{p.word}</span>
        <figcaption>{p.caption}</figcaption>
      </figure>
    {/each}
  </div>
</section>

<style>
  .community {
    max-width: 1200px;
    margin: 0 auto;
    padding: clamp(3rem, 10vh, 6rem) 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 4rem;
  }
  
  @media (min-width: 900px) {
    .community {
      flex-direction: column;
      gap: 3rem;
    }
  }

  .eyebrow {
    margin: 0 0 0.5rem;
    font-weight: 600;
    font-size: 0.8rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--pink-deep);
  }
  .heading {
    margin: 0 0 2.5rem;
    font-weight: 700;
    font-size: clamp(1.6rem, 4.5vw, 2.4rem);
    color: var(--ink);
    line-height: 1.15;
  }

  .wall {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
    padding-bottom: 1.5rem;
    width: 100%;
  }

  @media (min-width: 768px) {
    .wall {
      grid-template-columns: repeat(3, 1fr);
      gap: 2.5rem;
      padding-bottom: 0;
    }
  }

  .polaroid {
    margin: 0;
    background: var(--card-surface);
    padding: 0.6rem 0.6rem 1.1rem;
    border-radius: 4px;
    box-shadow: 0 16px 30px rgba(0, 0, 0, 0.14);
    opacity: 0;
    transform: translateY(28px) rotate(var(--rotate));
    transition: transform 0.6s var(--ease-out-expo), opacity 0.6s var(--ease-out-expo);
    transition-delay: calc(var(--i, 0) * 110ms);
    position: relative;
    z-index: 1;
  }
  
  /* Stagger polaroids vertically like the Canva grid */
  @media (min-width: 768px) {
    .polaroid:nth-child(2) {
      margin-top: 2.5rem;
    }
  }
  
  .polaroid.visible {
    opacity: 1;
    transform: translateY(0) rotate(var(--rotate));
  }
  .polaroid.visible:hover {
    transition-delay: 0s;
    transform: rotate(0deg) scale(1.05);
    z-index: 10;
  }
  .polaroid-art {
    display: grid;
    place-items: center;
    width: 100%;
    height: 18rem;
    background: var(--warm-sand);
    color: var(--deep);
    font: 700 clamp(2.5rem, 5vw, 5rem)/1 var(--serif);
    border-radius: 2px;
  }
  .polaroid figcaption {
    margin-top: 0.8rem;
    font-size: 1.1rem;
    font-family: "Permanent Marker", var(--sans);
    color: var(--pink-deep);
    text-align: center;
  }

  .manifesto {
    margin: 0 0 2.5rem;
    font-size: clamp(1rem, 2.5vw, 1.1rem);
    line-height: 1.6;
    color: var(--ink);
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s var(--ease-out-expo), transform 0.8s var(--ease-out-expo);
  }
  .manifesto p {
    margin: 0 0 1rem;
  }
  .manifesto.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .cta-row {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    opacity: 0;
    transform: translateY(20px);
    transition: opacity 0.8s var(--ease-out-expo) 200ms, transform 0.8s var(--ease-out-expo) 200ms;
  }
  .cta-row.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .btn-join {
    display: inline-flex;
    text-decoration: none;
    font-weight: 700;
    font-size: 1rem;
    background: var(--blue);
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 999px;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(0, 191, 255, 0.25);
    transition: transform var(--dur-fast), box-shadow var(--dur-fast), background var(--dur-fast);
  }
  .btn-join:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 191, 255, 0.4);
    background: #00aceb;
  }
  .btn-join:focus-visible { outline: 3px solid var(--deep); outline-offset: 3px; }

</style>
