<script>
  let openAccordion = 'faq-1';

  const FAQS = [
    {
      id: 'faq-1',
      question: 'When is OOO 0x04?',
      answer: 'It is planned for November 2026. The exact date and times have not been announced.'
    },
    {
      id: 'faq-2',
      question: 'Where will it happen?',
      answer: 'The venue and travel details are still to be announced.'
    },
    {
      id: 'faq-3',
      question: 'Can I buy a pass?',
      answer: 'Not yet. Pass options, prices and release details have not been announced.'
    },
    {
      id: 'faq-4',
      question: 'What is Out of Office?',
      answer: 'A Lagos gathering series for time away from the usual routine. Browse the trail to see previous editions.'
    }
  ];

  function toggleAccordion(id) {
    openAccordion = openAccordion === id ? null : id;
  }
</script>

<section id="current-event" class="schedule-wrap">
  <div class="header-center">
    <span class="pill-tag">OOO 0x04 · NOVEMBER 2026</span>
    <h2 class="title">The next chapter is on its way.</h2>
    <p class="subtitle">The plan is still being made. Here is what we can say today.</p>
  </div>

  <div class="tabs-container">
    <div class="timeline">
      <div class="timeline-item">
        <span class="item-time">01</span>
        <div class="item-body"><h3 class="item-title">November 2026</h3><p class="item-desc">The month for OOO 0x04 is set; the day and time are TBA.</p></div>
      </div>
      <div class="timeline-item">
        <span class="item-time">02</span>
        <div class="item-body"><h3 class="item-title">Place and programme</h3><p class="item-desc">Venue, activities and travel plans will be shared when confirmed.</p></div>
      </div>
      <div class="timeline-item">
        <span class="item-time">03</span>
        <div class="item-body"><h3 class="item-title">Pass release</h3><p class="item-desc">Ticket options and prices are not available yet.</p></div>
      </div>
    </div>
  </div>

  <div class="faq-container">
    <h3 class="faq-title">Good to know</h3>
    <div class="accordion">
      {#each FAQS as faq}
        <div class="accordion-item" class:open={openAccordion === faq.id}>
          <button
            class="accordion-trigger"
            on:click={() => toggleAccordion(faq.id)}
            aria-expanded={openAccordion === faq.id}
          >
            <span>{faq.question}</span>
            <span class="chevron">{openAccordion === faq.id ? '−' : '+'}</span>
          </button>
          {#if openAccordion === faq.id}
            <div class="accordion-content">
              <p>{faq.answer}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .schedule-wrap {
    width: 100%;
    max-width: 1000px;
    margin: 4rem auto;
    padding: 0 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 3rem;
  }

  .header-center {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.6rem;
  }

  .pill-tag {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.25rem 0.7rem;
    border-radius: 999px;
    background: var(--blue, #00bfff);
    color: #fff;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .title {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    margin: 0;
  }

  .subtitle {
    font-size: 1.05rem;
    margin: 0;
    opacity: 0.8;
    max-width: 55ch;
  }

  .tabs-container {
    background: var(--card-surface);
    border: 1px solid var(--border-soft-deep);
    border-radius: 16px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  }

  .timeline {
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
  }

  .timeline-item {
    display: flex;
    gap: 1.5rem;
    align-items: flex-start;
    padding: 1rem;
    background: var(--bg);
    border-radius: 12px;
    border-left: 4px solid var(--blue, #00bfff);
  }

  .item-time {
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--pink-deep, #fc9ce0);
    white-space: nowrap;
  }

  .item-body {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .item-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
  }

  .item-desc {
    margin: 0;
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .faq-container {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .faq-title {
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
  }

  .accordion {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .accordion-item {
    background: var(--card-surface);
    border: 1px solid var(--border-soft-deep);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.2s ease;
  }

  .accordion-item.open {
    border-color: var(--blue, #00bfff);
  }

  .accordion-trigger {
    width: 100%;
    padding: 1.2rem 1.5rem;
    background: transparent;
    border: none;
    color: var(--ink);
    font-family: inherit;
    font-size: 1.05rem;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    text-align: left;
  }

  .chevron {
    font-size: 1.4rem;
    color: var(--blue, #00bfff);
  }

  .accordion-content {
    padding: 0 1.5rem 1.2rem;
    font-size: 0.95rem;
    opacity: 0.85;
    line-height: 1.5;
  }

  .accordion-content p {
    margin: 0;
  }
</style>
