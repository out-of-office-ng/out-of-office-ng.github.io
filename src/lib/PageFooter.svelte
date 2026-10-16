<script>
  import PaintedSignoff from './PaintedSignoff.svelte';
  const siteBase = import.meta.env.BASE_URL;
</script>

<footer class="page-footer">
  <div>
    <a class="footer-brand" href="#top">OUT OF OFFICE <span aria-hidden="true">↗</span></a>
    <p>Back when the social battery is charged.</p>
  </div>
  <nav aria-label="Footer navigation">
    <a href="#/about">Our story</a>
    <a href="#/trail">Event trail</a>
    <a href="#next-event">Next event</a>
    <a href={`${siteBase}photo-credits.html`}>Photo credits</a>
    <a href={`${siteBase}v1/`}>v1 archive</a>
  </nav>
  <span class="location"><PaintedSignoff /></span>
</footer>

<style>
  .page-footer { max-width: 1140px; margin: 0 auto; padding: 40px 24px; border-top: 1px solid var(--border-soft-deep); display: flex; justify-content: space-between; align-items: center; gap: 32px; }
  .footer-brand { color: var(--ink); font-weight: 700; font-size: 14px; text-decoration: none; }
  p { font-size: 12px; margin: 10px 0 0; color: var(--muted); }
  nav { display: flex; flex-wrap: wrap; gap: 8px 18px; }
  nav a { display: inline-flex; align-items: center; min-height: 44px; font-size: 12px; color: var(--ink); text-underline-offset: 5px; }
  .location { color: var(--muted); font-size: 12px; }
  @media (max-width: 760px) { .page-footer { flex-direction: column; align-items: flex-start; gap: 20px; } }
</style>
