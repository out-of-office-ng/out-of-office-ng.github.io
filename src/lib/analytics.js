// Privacy-first measurement: GoatCounter (goatcounter.com) — no cookies, no
// personal data, no cross-site tracking, so no consent banner is needed.
// Dashboard: https://out-of-office.goatcounter.com
const ENDPOINT = 'https://out-of-office.goatcounter.com/count';

// Respect visitors who ask not to be counted.
const optedOut = () => typeof navigator !== 'undefined' && (navigator.doNotTrack === '1' || navigator.globalPrivacyControl === true);

let loaded = false;
export function initAnalytics() {
  if (!ENDPOINT || loaded || optedOut() || typeof document === 'undefined') return;
  loaded = true;
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://gc.zgo.at/count.js';
  script.dataset.goatcounter = ENDPOINT;
  document.head.appendChild(script);
}

// Anonymous event, e.g. track('video/open-canvas/open'). Counts only.
export function track(name) {
  if (!ENDPOINT || optedOut() || typeof window === 'undefined') return;
  const send = () => window.goatcounter?.count?.({ path: name, title: name, event: true });
  if (window.goatcounter?.count) send();
  else window.addEventListener('load', send, { once: true });
}
