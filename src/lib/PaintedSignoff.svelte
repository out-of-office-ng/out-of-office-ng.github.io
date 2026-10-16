<script>
  // "Lagos, with love." with the blue and pink paint droplets from v1's hero,
  // carried over so the sign-off matches across versions. Droplets are decorative.
  import dropletBlue from '../../docs/brand-reference/paint-droplet-blue.png';
  import dropletPink from '../../docs/brand-reference/paint-droplet-pink.png';
</script>

<span class="signoff">
  <img class="splat blue" src={dropletBlue} alt="" aria-hidden="true" width="489" height="404" loading="lazy" />
  <img class="splat pink" src={dropletPink} alt="" aria-hidden="true" width="394" height="407" loading="lazy" />
  <span class="words">Lagos, with love.</span>
</span>

<style>
  .signoff { position: relative; display: inline-block; isolation: isolate; padding: 16px 26px 16px 46px; }
  .words { position: relative; font: 400 17px/1.3 var(--marker); color: var(--ink); transform: rotate(-3deg); display: inline-block; }
  .splat { position: absolute; z-index: -1; height: auto; pointer-events: none; }
  .blue { width: 58px; top: -10px; left: -4px; opacity: .9; transform: rotate(-8deg); }
  .pink { width: 40px; right: -6px; bottom: -14px; opacity: .88; transform: rotate(10deg); }
</style>
