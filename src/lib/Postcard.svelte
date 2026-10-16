<script>
  import postcardImg from '../../docs/brand-reference/postcard-greetings-from-out-of-office.jpg';
  import stampImg from '../../docs/brand-reference/postcard-out-of-office-stamp.jpg';
  export let visible = true;
</script>

<section id="about" class="chapter introduction" aria-labelledby="intro-title" class:visible>
  <div class="text-content">
    <p class="eyebrow">WELCOME TO OUT OF OFFICE</p>
    <h2 id="intro-title">Leave the rush.<br />Find your people.</h2>
    <p class="intro">Out Of Office is a community and experience-driven initiative creating spaces for people to clock out of the everyday and reconnect with themselves, others, and the things that make life feel good.</p>
    <p class="body-copy">We believe life should be about more than routines, responsibilities, and simply getting through the day. There should be room to create, explore, meet new people, try new things, let loose, and just be.</p>
    <p class="body-copy">Out of Office is for anyone who wants to step outside their usual routine, discover new interests, build genuine connections, express themselves freely, or enjoy life beyond the everyday.</p>
    <a class="text-link" href="#past-editions">See the three past editions <span aria-hidden="true">↓</span></a>
  </div>
  <div class="collage" aria-label="Out of Office postcards">
    <figure class="postcard">
      <img src={postcardImg} alt="Greetings from Out of Office — original brand postcard" loading="lazy" />
    </figure>
    <figure class="stamp-photo">
      <img src={stampImg} alt="Out of Office postage stamp" loading="lazy" />
    </figure>
    <p class="paper-note">Permission to disconnect,<br />granted.</p>
  </div>
</section>

<style>
  .introduction { max-width: 1140px; margin: auto; display: grid; grid-template-columns: 1fr 1.1fr; gap: clamp(32px, 6vw, 80px); align-items: center; }
  .intro { margin: 24px 0 16px; max-width: 370px; font-size: 19px; line-height: 1.7; }
  .body-copy { max-width: 370px; margin: 0 0 24px; color: var(--muted); font-size: 15px; line-height: 1.8; }
  .text-content > * { opacity: 0; translate: 0 12px; transition: opacity 500ms var(--ease-out-expo), translate 500ms var(--ease-out-expo); }
  .visible .text-content > * { opacity: 1; translate: 0; }
  .text-content > :nth-child(2) { transition-delay: 60ms; }
  .text-content > :nth-child(3) { transition-delay: 120ms; }
  .text-content > :nth-child(4) { transition-delay: 180ms; }
  .text-content > :nth-child(5) { transition-delay: 240ms; }
  .collage { position: relative; width: 100%; }
  figure { position: absolute; margin: 0; background: #faf8f2; padding: 8px; border: 1px solid #243e3c15; box-shadow: 0 14px 30px -12px #243e3c35; }
  .postcard { top: 0; left: 0; width: 73%; max-width: 380px; transform: rotate(-5deg); z-index: 2; }
  .stamp-photo { top: 90px; right: 0; width: 46%; max-width: 240px; transform: rotate(7deg); z-index: 3; }
  img { width: 100%; height: auto; display: block; }
  /* Sits in flow under both prints; % margins scale with the column width like the prints do. */
  .paper-note { position: relative; margin: min(calc(58% + 120px), 450px) 0 0 18px; font: 400 16px/1.6 var(--marker); color: var(--pink-deep); transform: rotate(-3deg); }
  @media (max-width: 760px) {
    .introduction { grid-template-columns: minmax(0, 1fr); gap: 42px; }
    .collage { max-width: 440px; justify-self: center; }
  }
  @media (prefers-reduced-motion: reduce) { .text-content > * { opacity: 1; translate: none; transition: none; } }
</style>
