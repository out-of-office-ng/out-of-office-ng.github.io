export const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export const SHARED_INCLUSIONS = [
  '🌅 Sunrise Yoga Session',
  '🎨 Open Canvas Painting Experience',
  '🏐 Beach Games & Group Activities',
  '🔥 Bonfire Experience',
  '🥤 Light Refreshments',
];

export const TICKET_TIERS = [
  {
    id: 'explorer',
    name: 'Explorer Pass (Shared Tent)',
    shortName: 'Explorer Pass',
    amountKobo: 1500000,
    label: '₦15,000',
    sleeping: '⛺ Shared tent accommodation',
    extras: [],
  },
  {
    id: 'retreat',
    name: 'Retreat Pass (Private Tent)',
    shortName: 'Retreat Pass',
    amountKobo: 2000000,
    label: '₦20,000',
    sleeping: '⛺ Private tent accommodation',
    extras: [],
  },
];

export function payForTicket(tier, email, { onSuccess, onCancel, onError }) {
  if (!PAYSTACK_PUBLIC_KEY) {
    onError('Ticketing is not configured yet — check back shortly.');
    return;
  }
  if (typeof PaystackPop === 'undefined') {
    onError('Payment could not start — please check your connection and try again.');
    return;
  }

  const popup = new PaystackPop();
  popup.newTransaction({
    key: PAYSTACK_PUBLIC_KEY,
    email,
    amount: tier.amountKobo,
    currency: 'NGN',
    ref: 'OOO_' + tier.id + '_' + Math.floor(Math.random() * 1000000000 + 1),
    onSuccess,
    onCancel,
  });
}
