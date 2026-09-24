<script>
  export let visible = false;
</script>

<section class="community-section">
  <div class="text-content">
    <p class="eyebrow">COMMUNITY &gt; CALENDAR INVITES</p>
    <h2 class="heading">The best memories are slightly blurry.</h2>
    <p class="manifesto">
      Not status-heavy nightlife. A small rebellion: music, art, board games, 
      shared snacks and the conversation you remember on Monday.
    </p>
    <div class="actions">
      <button class="primary-btn">Join the community</button>
      <a href="#volunteer" class="secondary-link">Volunteer &amp; sponsor</a>
    </div>
  </div>

  <div class="polaroids">
    <div class="polaroid p1">
      <div class="photo">PHOTO GOES HERE</div>
      <div class="caption">no hierarchy, just vibes</div>
    </div>
    <div class="polaroid p2">
      <div class="photo">PHOTO GOES HERE</div>
      <div class="caption">make a mess. make friends.</div>
    </div>
    <div class="polaroid p3">
      <div class="photo">PHOTO GOES HERE</div>
      <div class="caption">play is the plan</div>
    </div>
  </div>
</section>

<style>
  .community-section {
    max-width: 1200px;
    margin: 0 auto;
    padding: 6rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4rem;
  }

  @media (min-width: 900px) {
    .community-section {
      flex-direction: row;
      justify-content: space-between;
      align-items: flex-start;
    }
    .text-content {
      flex: 1;
      padding-top: 2rem;
      padding-right: 2rem;
    }
    .polaroids {
      flex: 1.2;
    }
  }

  .eyebrow {
    font-family: var(--marker, "Permanent Marker", cursive);
    color: var(--pink-deep, #e0568f);
    text-transform: uppercase;
    font-size: 1rem;
    margin: 0 0 1rem;
    letter-spacing: 0.05em;
  }

  .heading {
    font-family: var(--serif, Georgia, serif);
    font-size: clamp(2.8rem, 4.5vw, 4rem);
    color: var(--deep, #1a332f);
    margin: 0 0 1.5rem;
    line-height: 1.05;
    letter-spacing: -0.02em;
  }

  .manifesto {
    font-size: 1.15rem;
    line-height: 1.6;
    color: var(--muted, #6b6b6b);
    margin-bottom: 2.5rem;
    max-width: 400px;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .primary-btn {
    background: var(--deep, #376a65);
    color: #fff;
    border: none;
    padding: 1rem 1.8rem;
    border-radius: 30px;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    transition: opacity 0.2s;
  }
  .primary-btn:hover {
    opacity: 0.9;
  }

  .secondary-link {
    color: var(--deep, #376a65);
    text-decoration: underline;
    text-underline-offset: 4px;
    font-weight: 600;
    font-size: 0.95rem;
  }

  .polaroids {
    position: relative;
    width: 100%;
    min-height: 500px;
  }

  .polaroid {
    background: #fff;
    padding: 0.8rem 0.8rem 3rem 0.8rem;
    box-shadow: 0 15px 35px rgba(0,0,0,0.1);
    position: absolute;
    width: 240px;
    border-radius: 2px;
  }
  
  .photo {
    background: #e2e1d7;
    height: 200px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--muted, #888);
    font-size: 0.8rem;
    letter-spacing: 0.05em;
  }

  .caption {
    font-family: var(--marker, "Permanent Marker", cursive);
    color: var(--deep, #1a332f);
    position: absolute;
    bottom: 1rem;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 0.9rem;
    transform: rotate(-1deg);
  }

  .p1 {
    top: 0;
    left: 0;
    transform: rotate(-4deg);
    z-index: 2;
  }
  .p2 {
    top: 20px;
    right: 0;
    transform: rotate(5deg);
    z-index: 1;
  }
  .p3 {
    top: 240px;
    left: 50%;
    transform: translateX(-30%) rotate(2deg);
    z-index: 3;
  }
</style>
