// Ticket sales switch — the one place that decides whether the site can take
// money. Every "claim a pass" entry point (header OOO PASS, boarding-pass
// CTA, sticky mobile bar, ⌘K) opens RsvpDrawer, and RsvpDrawer reads this.
//
//   'closed'   (now)  — OOO 0x03 is over and 0x04 has no date, venue or tiers
//                       yet. No checkout, nothing to pay.
//   'waitlist' (next) — free name + email sign-up for November. Needs a form
//                       service chosen by the owner; not built yet.
//   'open'     (later)— real 0x04 tiers through Paystack. Swap the TIERS in
//                       Tickets/RsvpDrawer for 0x04's before flipping this.
export const SALES_MODE = 'closed';

export const NEXT_EVENT = {
  code: 'OOO 0x04',
  when: 'November 2026',
  detail: 'The exact date and venue are to be announced.',
};
