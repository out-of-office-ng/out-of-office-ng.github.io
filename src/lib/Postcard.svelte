<script>
  import postcardImg from '../../docs/brand-reference/postcard-greetings-from-out-of-office.jpg';
  import stampImg from '../../docs/brand-reference/postcard-out-of-office-stamp.jpg';

  export let visible = false;
</script>

<section class="postcard-section">
  <div class="text-content" class:visible>
    <p class="eyebrow">WISH YOU WERE HERE</p>
    <h2 class="heading">A postcard for whenever you're out of office.</h2>
  </div>

  <div class="collage" class:visible>
    <figure class="postcard">
      <img src={postcardImg} alt="Greetings from Out of Office" loading="lazy" />
    </figure>
    <figure class="stamp-photo">
      <img src={stampImg} alt="Out of Office postage stamp" loading="lazy" />
    </figure>
  </div>
</section>

<style>
  .postcard-section {
    max-width: 1000px;
    margin: 0 auto;
    padding: 6rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rem;
  }

  @media (min-width: 800px) {
    .postcard-section {
      flex-direction: row;
      justify-content: space-between;
    }
    .text-content {
      flex: 1;
      padding-right: 2rem;
    }
    .collage {
      flex: 1.5;
    }
  }

  .eyebrow {
    font-family: var(--marker, "Permanent Marker", cursive);
    color: var(--pink-deep, #e0568f);
    text-transform: uppercase;
    font-size: 1.1rem;
    margin: 0 0 1rem;
    letter-spacing: 0.05em;
  }
  
  .heading {
    font-family: var(--serif, Georgia, serif);
    font-size: clamp(2.5rem, 4vw, 3.5rem);
    color: var(--deep, #1a332f);
    margin: 0;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .collage {
    position: relative;
    width: 100%;
    min-height: 400px;
  }

  .postcard {
    position: absolute;
    top: 0;
    left: 0;
    width: 70%;
    max-width: 380px;
    background: #e9e8db;
    padding: 0.5rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    margin: 0;
    transform: rotate(-2deg);
    z-index: 2;
  }

  .stamp-photo {
    position: absolute;
    top: 40px;
    right: 0;
    width: 50%;
    max-width: 260px;
    background: #e9e8db;
    padding: 0.5rem;
    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    margin: 0;
    transform: rotate(4deg);
    z-index: 1;
  }

  img {
    width: 100%;
    height: auto;
    display: block;
  }
</style>
