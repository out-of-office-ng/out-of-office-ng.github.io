<script>
  export let edition;
  // natural: the frame takes the photo's own shape (the archive deck). Otherwise
  // portrait event photos sit whole inside the landscape frame over a blurred fill.
  export let natural = false;
  $: naturalShape = natural && edition.imageKind === 'event' && edition.imageRatio;
  let failedImage = null;
</script>

<div class="artwork" class:natural={naturalShape} style:--art-tone={edition.tone} style:aspect-ratio={naturalShape ? edition.imageRatio : null}>
  {#if edition.image && failedImage !== edition.image}
    {#if edition.imageKind === 'event'}
      {#if !naturalShape}
        <!-- Event photos are portrait: show the whole photo, with a blurred copy filling the landscape frame. -->
        <img class="backdrop" src={edition.image} alt="" aria-hidden="true" loading="lazy" draggable="false" />
      {/if}
      <img class:whole={!naturalShape} src={edition.image} alt={edition.imageAlt} loading="lazy" draggable="false" on:error={() => failedImage = edition.image} />
    {:else}
      <img src={edition.image} alt={`${edition.location} venue reference, not a photograph of ${edition.title}`} loading="lazy" draggable="false" on:error={() => failedImage = edition.image} />
      <span class="image-note">VENUE REFERENCE · NOT EVENT PHOTO</span>
    {/if}
  {:else}
    <span class="art-label">OUT OF OFFICE<br />LAGOS, WITH LOVE</span>
    <span class="edition-word">{edition.word}</span>
    <span class="postmark" aria-hidden="true">OUT OF OFFICE<strong>{edition.code}</strong><span>TIME WELL SPENT</span></span>
    <span class="art-footer">A MOMENT OUTSIDE THE EVERYDAY</span>
  {/if}
</div>

<style>
  .artwork { position: relative; min-height: 240px; aspect-ratio: 1.48; padding: 20px; background: var(--art-tone); overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; color: var(--ink); }
  .artwork::after { content: ''; position: absolute; inset: 12px; border: 1px solid #243e3c25; pointer-events: none; }
  img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .artwork.natural { min-height: 0; }
  img.backdrop { filter: blur(18px) saturate(1.1); transform: scale(1.15); opacity: .85; }
  img.whole { z-index: 1; object-fit: contain; filter: drop-shadow(0 6px 14px #0004); }
  .image-note { position: absolute; z-index: 2; right: 20px; bottom: 20px; padding: 7px 9px; background: #181818d9; color: #fff; font-size: 8px; font-weight: 700; letter-spacing: .08em; }
  .art-label, .art-footer { position: relative; z-index: 1; font-size: 9px; letter-spacing: .15em; font-weight: 600; }
  .edition-word { font: italic 400 clamp(45px, 5vw, 72px)/1 var(--serif); letter-spacing: -.06em; }
  .postmark { position: absolute; right: 18px; top: 18px; width: 76px; height: 76px; border: 3px double var(--deep); border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: 6px; letter-spacing: .06em; transform: rotate(12deg); }
  .postmark strong { font: 400 23px/1.3 var(--serif); }
  .postmark span { font-size: 5px; }
  @media (max-width: 760px) { .artwork { min-height: 210px; } }
</style>
