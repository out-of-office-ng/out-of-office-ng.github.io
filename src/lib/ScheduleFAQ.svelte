<script>
  let activeTab = 'afternoon';
  let openAccordion = 'faq-1';

  const schedule = {
    morning: [],
    afternoon: [
      { time: '01:30 PM', title: 'Danfo rally to Tarkwa Bay', desc: 'Scenic bus & boat transport with retro Afrobeats & local Lagos snacks.' },
      { time: '03:30 PM', title: 'Rubik cube & chaos battle', desc: 'Solve the digital cube live or relax on the sand with zero Wi-Fi.' }
    ],
    night: []
  };

  const FAQS = [
    {
      id: 'faq-1',
      question: 'What if my boss Slack calls me during the event?',
      answer: 'Pretend your phone fell into Tarkwa Bay. Or send them the output of our auto-reply generator.'
    },
    {
      id: 'faq-2',
      question: 'Is Wi-Fi available at the venue?',
      answer: 'No. The goal is to disconnect.'
    },
    {
      id: 'faq-3',
      question: 'What should I wear or bring?',
      answer: 'Comfortable beach wear. We handle the rest.'
    },
    {
      id: 'faq-4',
      question: 'How do I get home after the bonfire?',
      answer: 'Group transportation is arranged.'
    }
  ];

  function toggleAccordion(id) {
    openAccordion = openAccordion === id ? null : id;
  }
</script>

<section class="schedule-faq-section">
  <div class="header-text">
    <p class="eyebrow">SCHEDULE</p>
    <h2 class="heading">Schedule & survival FAQ</h2>
  </div>

  <div class="tabs">
    <button class:active={activeTab === 'morning'} on:click={() => activeTab = 'morning'}>Morning</button>
    <button class:active={activeTab === 'afternoon'} on:click={() => activeTab = 'afternoon'}>Afternoon</button>
    <button class:active={activeTab === 'night'} on:click={() => activeTab = 'night'}>Night</button>
  </div>

  <div class="schedule-list">
    {#each schedule[activeTab] as item}
      <div class="schedule-item">
        <div class="time">{item.time}</div>
        <div class="details">
          <h3>{item.title}</h3>
          <p>{item.desc}</p>
        </div>
      </div>
    {/each}
  </div>

  <h3 class="faq-title">Survival FAQ</h3>
  
  <div class="faq-list">
    {#each FAQS as faq}
      <div class="faq-item">
        <button class="faq-question" on:click={() => toggleAccordion(faq.id)} aria-expanded={openAccordion === faq.id}>
          <span>{faq.question}</span>
          <span class="icon">{openAccordion === faq.id ? '−' : '+'}</span>
        </button>
        {#if openAccordion === faq.id}
          <div class="faq-answer">
            <p>{faq.answer}</p>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>

<style>
  .schedule-faq-section {
    padding: 6rem 1.5rem;
    max-width: 800px;
    margin: 0 auto;
  }
  .header-text {
    text-align: center;
    margin-bottom: 2rem;
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
    font-size: clamp(2.5rem, 5vw, 3.5rem);
    color: var(--deep, #1a332f);
    margin: 0;
  }

  .tabs {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-bottom: 3rem;
  }
  .tabs button {
    background: transparent;
    border: 1px solid var(--border, #d1ccc3);
    padding: 0.6rem 1.5rem;
    border-radius: 30px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    color: var(--ink, #181818);
  }
  .tabs button.active {
    background: var(--ink, #243e3c);
    color: #fff;
    border-color: var(--ink, #243e3c);
  }

  .schedule-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 4rem;
  }
  .schedule-item {
    background: #f7f6f2;
    border: 1px solid var(--border, #e2e1d7);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  @media (min-width: 600px) {
    .schedule-item {
      flex-direction: row;
      align-items: flex-start;
    }
  }
  .time {
    font-weight: 700;
    font-size: 0.85rem;
    color: var(--deep, #376a65);
    width: 100px;
    padding-top: 0.2rem;
  }
  .details h3 {
    margin: 0 0 0.5rem;
    font-family: var(--serif, Georgia, serif);
    font-size: 1.4rem;
    color: var(--ink, #181818);
  }
  .details p {
    margin: 0;
    color: var(--muted, #6b6b6b);
    line-height: 1.5;
  }

  .faq-title {
    font-family: var(--serif, Georgia, serif);
    font-size: 2rem;
    color: var(--deep, #1a332f);
    margin: 0 0 2rem;
  }

  .faq-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  .faq-item {
    background: #f7f6f2;
    border: 1px solid var(--border, #e2e1d7);
    border-radius: 12px;
    overflow: hidden;
  }
  .faq-question {
    width: 100%;
    text-align: left;
    background: transparent;
    border: none;
    padding: 1.5rem;
    font-size: 1.1rem;
    font-family: var(--sans, system-ui, sans-serif);
    color: var(--ink, #181818);
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .faq-question .icon {
    font-size: 1.5rem;
    color: var(--deep, #376a65);
    font-weight: 300;
  }
  .faq-answer {
    padding: 0 1.5rem 1.5rem;
    color: var(--muted, #6b6b6b);
    line-height: 1.6;
  }
  .faq-answer p {
    margin: 0;
  }
</style>
