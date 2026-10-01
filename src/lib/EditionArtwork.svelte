<script>
  export let edition;
  let failedImage = null;
</script>

<div class="artwork" style:--art-tone={edition.tone}>
  {#if edition.image && failedImage !== edition.image}
    <img src={edition.image} alt={`${edition.title}, a past Out of Office gathering`} loading="lazy" draggable="false" on:error={() => failedImage = edition.image} />
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
  .art-label, .art-footer { position: relative; z-index: 1; font-size: 9px; letter-spacing: .15em; font-weight: 600; }
  .edition-word { font: italic 400 clamp(45px, 5vw, 72px)/1 var(--serif); letter-spacing: -.06em; }
  .postmark { position: absolute; right: 18px; top: 18px; width: 76px; height: 76px; border: 3px double var(--deep); border-radius: 50%; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: 6px; letter-spacing: .06em; transform: rotate(12deg); }
  .postmark strong { font: 400 23px/1.3 var(--serif); }
  .postmark span { font-size: 5px; }
  @media (max-width: 760px) { .artwork { min-height: 210px; } }
</style>
