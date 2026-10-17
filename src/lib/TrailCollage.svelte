<script>
  // Three event photos "pasted" on top of each other in the trail's uniform
  // frame, so portrait and landscape shots even out. No text on the photos.
  export let photos = [];
  export let tone = '#e8e3d6';
  const layout = [
    { left: '4%', top: '9%', h: '78%', r: -7 },
    { left: '58%', top: '5%', h: '80%', r: 6 },
    { left: '31%', top: '15%', h: '82%', r: -1.5 },
  ];
</script>

<div class="collage" style:--art-tone={tone}>
  {#each photos.slice(0, 3) as photo, i}
    <figure class="print" style={`left:${layout[i].left}; top:${layout[i].top}; height:${layout[i].h}; --r:${layout[i].r}deg; z-index:${i + 1}`}>
      <img src={photo.src} alt={photo.alt} loading="lazy" draggable="false" />
      <span class="tape" aria-hidden="true"></span>
    </figure>
  {/each}
</div>

<style>
  /* A definite width stops aspect-ratio turning min-height into a minimum
     width, which pushed the collage past its card on screens under ~380px. */
  .collage { position: relative; width: 100%; aspect-ratio: 1.48; min-height: 240px; background: var(--art-tone); overflow: hidden; }
  .print { position: absolute; margin: 0; aspect-ratio: 3 / 4; padding: 6px 6px 18px; background: #fbf9f3; box-shadow: 0 10px 22px -10px #243e3c80; transform: rotate(var(--r)); }
  .print img { display: block; width: 100%; height: 100%; object-fit: cover; }
  .tape { position: absolute; top: -8px; left: 50%; width: 46px; height: 16px; background: #f3e7c0cc; transform: translateX(-50%) rotate(-4deg); }
  @media (max-width: 760px) { .collage { min-height: 210px; } }
</style>
