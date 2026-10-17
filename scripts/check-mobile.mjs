// Mobile, old-Safari, community, next-event, video and analytics regression checks.
// Run against `vite preview --port 5174`:
//   CHROMIUM_PATH=".../chrome.exe" node scripts/check-mobile.mjs
// WebKit comes from `npx playwright install webkit`. Any engine or capability
// that is unavailable is reported as SKIPPED with the reason, never as passed.
import { chromium, webkit } from 'playwright';
import assert from 'node:assert/strict';
import { NEXT_EVENT, SALES_MODE } from '../src/lib/sales.js';

const base = process.env.UX_BASE_URL || 'http://127.0.0.1:5174';
const COMMUNITY = 'https://chat.whatsapp.com/IGeVwvbkusyFPIPA2saXKs';
const INSTAGRAM = 'https://www.instagram.com/outofoffice_ng/';
const profiles = [
  { name: 'iPhone SE / 8', width: 375, height: 667 },
  { name: 'Small Android', width: 360, height: 800 },
  { name: 'iPhone 13/14', width: 390, height: 844 },
  { name: 'Narrow mobile', width: 320, height: 568 },
  { name: 'Tablet', width: 768, height: 1024 },
  { name: 'Desktop', width: 1440, height: 900 },
];
const results = [];
const record = (engine, check, outcome, detail = '') => results.push({ engine, check, outcome, ...(detail && { detail }) });

const frames = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

// Safari before 16 has no `overflow: clip`: it ignores the declaration and any
// @supports (overflow: clip) block. Strip both, then measure the real page.
function emulateOldSafari() {
  const walk = list => {
    for (let i = list.cssRules.length - 1; i >= 0; i--) {
      const rule = list.cssRules[i];
      if (rule instanceof CSSSupportsRule && /overflow[^)]*clip/.test(rule.conditionText)) { list.deleteRule(i); continue; }
      if (rule.cssRules) walk(rule);
      if (rule.style) for (const prop of ['overflow', 'overflow-x', 'overflow-y']) if (rule.style.getPropertyValue(prop).includes('clip')) rule.style.removeProperty(prop);
    }
  };
  for (const sheet of document.styleSheets) { try { walk(sheet); } catch { /* cross-origin sheet */ } }
}

// Walk the page so scroll-revealed content lays out, keeping the widest scrollWidth.
async function widestScroll(page) {
  return page.evaluate(async () => {
    let widest = 0;
    for (let y = 0; y <= document.documentElement.scrollHeight; y += innerHeight * .7) {
      scrollTo(0, y);
      await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      widest = Math.max(widest, document.documentElement.scrollWidth);
    }
    scrollTo(0, 0);
    return { widest, viewport: document.documentElement.clientWidth };
  });
}

async function newPage(browser, profile, options = {}) {
  const context = await browser.newContext({ viewport: { width: profile.width, height: profile.height }, hasTouch: profile.width < 600, ...options });
  // Never send real analytics from a test run.
  await context.route(/gc\.zgo\.at|goatcounter\.com/, route => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => message.type() === 'error' && errors.push(`console: ${message.text().split('\n')[0]}`));
  return { context, page, errors };
}

async function openArchiveVideo(page) {
  await page.locator('.deck').scrollIntoViewIfNeeded();
  const next = page.getByRole('button', { name: 'Next edition', exact: true });
  while (!/Open Canvas/.test(await page.locator('.edition-card.front').innerText())) await next.click();
  const watch = page.getByRole('button', { name: /^Watch Open Canvas/ });
  await watch.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Open Canvas' });
  await dialog.waitFor();
  return { watch, dialog };
}

async function checkVideo(engine, browser, profile, reducedMotion) {
  const label = `video ${profile.width}px${reducedMotion === 'reduce' ? ' reduced-motion' : ''}`;
  const { context, page, errors } = await newPage(browser, profile, { reducedMotion });
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  const { watch, dialog } = await openArchiveVideo(page);

  const box = await dialog.boundingBox();
  assert.ok(box.y >= 0 && box.y + box.height <= profile.height && box.x >= 0 && box.x + box.width <= profile.width, `${label}: dialog fits the viewport`);
  assert.equal(await page.evaluate(() => !!document.activeElement.closest('dialog[open]')), true, `${label}: focus moves into the dialog`);
  const video = dialog.locator('video');
  assert.equal(await video.evaluate(element => element.controls && element.muted), true, `${label}: native controls, starts muted`);
  assert.match(await dialog.innerText(), /Painting together/, `${label}: the clip with people leads`);

  // Playback: event-driven. Some engine builds (Playwright WebKit on Windows)
  // ship without H.264, which shows up as MEDIA_ERR_SRC_NOT_SUPPORTED.
  const playback = await video.evaluate(async (element, reduced) => {
    const settle = () => new Promise(resolve => {
      if (element.error) return resolve(`error:${element.error.code}`);
      if (element.readyState >= 1) return resolve('ready');
      element.addEventListener('loadedmetadata', () => resolve('ready'), { once: true });
      element.addEventListener('error', () => resolve(`error:${element.error?.code}`), { once: true });
    });
    const state = await settle();
    if (state !== 'ready') return state;
    if (reduced && !element.paused) return 'autoplayed under reduced motion';
    try { await element.play(); } catch (error) { return `play rejected: ${error.name}`; }
    if (element.paused) return 'did not start';
    element.pause();
    if (!element.paused) return 'did not pause';
    element.currentTime = 0;
    await element.play();
    return element.paused ? 'replay failed' : 'ok';
  }, reducedMotion === 'reduce');
  if (playback === 'error:4') record(engine, `${label}: playback`, 'SKIPPED', 'this engine build cannot decode H.264 (MEDIA_ERR_SRC_NOT_SUPPORTED)');
  else { assert.equal(playback, 'ok', `${label}: play, pause and replay`); record(engine, `${label}: playback`, 'PASS'); }

  const firstSrc = await video.getAttribute('src');
  const second = dialog.getByRole('button', { name: /Before guests arrived/ });
  await second.click();
  assert.equal(await second.getAttribute('aria-pressed'), 'true', `${label}: picked clip is marked`);
  assert.notEqual(await dialog.locator('video').getAttribute('src'), firstSrc, `${label}: clip switches`);

  // Focus cycles inside the dialog; it may pass to the browser chrome (body) but never to page content.
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement === document.body || !!document.activeElement.closest('dialog[open]')), true, `${label}: Tab stays out of the page behind the dialog`);
  }

  await dialog.getByRole('button', { name: 'Close video' }).click();
  await page.waitForFunction(() => !document.querySelector('dialog video'));
  assert.equal(await watch.evaluate(element => element === document.activeElement), true, `${label}: close returns focus to Watch`);
  await watch.press('Enter');
  await dialog.waitFor();
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog[open]') && !document.querySelector('dialog video'));
  assert.equal(await watch.evaluate(element => element === document.activeElement), true, `${label}: Escape returns focus to Watch`);
  assert.deepEqual(errors, [], `${label}: no page errors`);
  record(engine, `${label}: open, fit, switch, focus, close`, 'PASS');
  await context.close();
}

async function run(engine, launcher, launchOptions) {
  let browser;
  try { browser = await launcher.launch(launchOptions); }
  catch (error) { record(engine, 'launch', 'SKIPPED', error.message.split('\n')[0]); return; }
  try {
    for (const profile of profiles) {
      for (const route of ['', '#/trail']) {
        const where = `${profile.width}x${profile.height} ${route || 'home'}`;
        const { context, page, errors } = await newPage(browser, profile, { reducedMotion: 'reduce' });
        await page.goto(`${base}/${route}`, { waitUntil: 'load' });
        await page.evaluate(() => document.fonts.ready);
        const modern = await widestScroll(page);
        assert.ok(modern.widest <= modern.viewport, `${where}: page is ${modern.widest}px wide in a ${modern.viewport}px viewport`);
        assert.equal(await page.evaluate(() => visualViewport ? visualViewport.scale : 1), 1, `${where}: layout is not scaled down`);
        assert.ok(await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize) >= 16), `${where}: body text is at least 16px`);
        if (!route) {
          // Header controls must not sit on top of each other, and the hero CTA must not be covered.
          const crowded = await page.evaluate(() => {
            const boxes = [];
            for (const element of document.querySelectorAll('.site-header .brand, .site-header .status-link, .site-header .pass-button')) {
              const range = document.createRange(); range.selectNodeContents(element); boxes.push([element.className.split(' ')[0], range.getBoundingClientRect()]);
            }
            for (const icon of document.querySelectorAll('.site-header .theme-control > span, .site-header .sound-button svg')) boxes.push([icon.parentElement.className.split(' ')[0], icon.getBoundingClientRect()]);
            const hits = [];
            boxes.forEach(([a, ra], i) => boxes.forEach(([b, rb], j) => { if (i < j && ra.left < rb.right - .5 && rb.left < ra.right - .5 && ra.top < rb.bottom && rb.top < ra.bottom) hits.push(`${a} × ${b}`); }));
            const cta = document.querySelector('.primary-button').getBoundingClientRect(), card = document.querySelector('.auto-reply').getBoundingClientRect();
            if (cta.left < card.right && card.left < cta.right && cta.top < card.bottom && card.top < cta.bottom) hits.push('hero CTA × auto-reply card');
            return hits;
          });
          assert.deepEqual(crowded, [], `${where}: overlapping controls`);
        }
        await page.evaluate(emulateOldSafari);
        const old = await widestScroll(page);
        assert.ok(old.widest <= old.viewport, `${where}: without overflow: clip (Safari < 16) the page is ${old.widest}px wide in ${old.viewport}px`);
        assert.deepEqual(errors, [], `${where}: no page errors`);
        record(engine, `${where}: no horizontal overflow (modern + Safari<16 emulation)`, 'PASS');
        await context.close();
      }
    }

    // With motion on, the header also carries the Pause motion button.
    for (const profile of profiles) {
      const { context, page } = await newPage(browser, profile);
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: 'Pause motion' }).waitFor();
      await page.evaluate(() => document.fonts.ready);
      const hits = await page.evaluate(() => {
        const boxes = [...document.querySelectorAll('.site-header a, .site-header button')].map(element => [(element.getAttribute('aria-label') || element.textContent).trim().slice(0, 20), element.getBoundingClientRect()]);
        const out = [];
        boxes.forEach(([a, ra], i) => boxes.forEach(([b, rb], j) => { if (i < j && ra.left < rb.right - .5 && rb.left < ra.right - .5 && ra.top < rb.bottom && rb.top < ra.bottom) out.push(`${a} × ${b}`); }));
        return out;
      });
      assert.deepEqual(hits, [], `${profile.width}px header with Pause motion: overlapping controls`);
      await context.close();
    }
    record(engine, 'Header: no overlapping controls at any profile (with and without Pause motion)', 'PASS');

    const phone = profiles[0];
    {
      const { context, page } = await newPage(browser, phone, { reducedMotion: 'reduce' });
      const requests = [];
      page.on('request', request => requests.push(request.url()));
      await page.goto(base, { waitUntil: 'domcontentloaded' });

      // Task A: community entry point.
      const community = page.getByRole('link', { name: /Join the community/ });
      assert.equal(await community.count(), 1, 'One community link');
      assert.equal(await community.getAttribute('href'), COMMUNITY, 'Community link goes to the WhatsApp community');
      assert.match(await community.innerText(), /Join the community/);
      assert.match(await community.getAttribute('rel'), /noopener/);
      assert.match(await community.textContent(), /WhatsApp/, 'Screen readers hear it is WhatsApp');
      const instagram = page.getByRole('link', { name: /^Instagram/ });
      assert.equal(await instagram.getAttribute('href'), INSTAGRAM, 'Instagram link is separate');
      await community.scrollIntoViewIfNeeded();
      assert.ok((await community.boundingBox()).height >= 44, 'Community link is a 44px touch target');
      // Stub the destination so the check never depends on WhatsApp being reachable.
      await context.route('https://chat.whatsapp.com/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: 'stub' }));
      const [popup, navigation] = await Promise.all([
        context.waitForEvent('page'),
        context.waitForEvent('request', request => request.url().startsWith('https://chat.whatsapp.com/')),
        community.click(),
      ]);
      assert.equal(navigation.url(), COMMUNITY, 'Opens the WhatsApp community');
      assert.notEqual(popup, page, 'in a new tab');
      assert.ok(!page.url().includes('whatsapp'), 'The site stays open');
      await popup.close();
      record(engine, 'Task A: community link (WhatsApp, distinct from Instagram, 44px, new tab)', 'PASS');

      // Task B: next event, stated once and consistently, with sales closed.
      const status = page.locator('.event-status');
      assert.match(await status.innerText(), new RegExp(NEXT_EVENT.when));
      if (SALES_MODE !== 'open') {
        assert.match(await status.innerText(), /date and venue to be announced/i);
        assert.match(await status.innerText(), /Passes not on sale/);
        await page.locator('.site-header').getByRole('button', { name: '0x04 status' }).click();
        const sheet = page.getByRole('dialog', { name: '0x04 status' });
        await sheet.waitFor();
        assert.match(await sheet.innerText(), new RegExp(NEXT_EVENT.when));
        assert.equal(await sheet.locator('input, form, [href*="paystack"]').count(), 0, 'No checkout while sales are closed');
        await page.keyboard.press('Escape');
        await sheet.waitFor({ state: 'detached' });
        assert.equal(requests.some(url => /paystack/i.test(url)), false, 'Nothing loads Paystack');
      }
      record(engine, `Task B: next event (${NEXT_EVENT.when}, sales ${SALES_MODE})`, 'PASS');
      await context.close();
    }

    // Analytics: loads normally (control), but not under Do Not Track or Global Privacy Control.
    for (const signal of [null, 'doNotTrack', 'globalPrivacyControl']) {
      const { context, page } = await newPage(browser, phone, { reducedMotion: 'reduce' });
      if (signal) await context.addInitScript(name => Object.defineProperty(Navigator.prototype, name, { get: () => (name === 'doNotTrack' ? '1' : true) }), signal);
      const tracked = [];
      page.on('request', request => /gc\.zgo\.at|goatcounter/.test(request.url()) && tracked.push(request.url()));
      await page.goto(base, { waitUntil: 'load' });
      await openArchiveVideo(page);
      await page.keyboard.press('Escape');
      if (signal) assert.deepEqual(tracked, [], `${signal}: no analytics requests`);
      else assert.ok(tracked.some(url => url.includes('count.js')), 'Control: without a privacy signal the counter script loads');
      await context.close();
    }
    record(engine, 'Analytics: loads normally; no requests under Do Not Track or Global Privacy Control', 'PASS');

    for (const profile of [profiles[3], profiles[0], profiles[5]]) await checkVideo(engine, browser, profile, 'no-preference');
    await checkVideo(engine, browser, phone, 'reduce');
  } finally {
    await browser.close();
  }
}

// Live water: with WebGL available the scene must compile and run without console errors.
async function checkWater(engine, launcher, launchOptions) {
  let browser;
  try { browser = await launcher.launch(launchOptions); }
  catch (error) { record(engine, 'water (WebGL)', 'SKIPPED', error.message.split('\n')[0]); return; }
  try {
    const { page, errors } = await newPage(browser, profiles[5]);
    await page.goto(base, { waitUntil: 'load' });
    const outcome = await Promise.race([
      page.waitForFunction(() => !document.querySelector('.wander-button')?.disabled).then(() => 'ready'),
      page.locator('.scene-unavailable').waitFor({ timeout: 30000 }).then(() => 'unavailable'),
    ]);
    if (outcome === 'unavailable') { record(engine, 'water (WebGL)', 'SKIPPED', 'WebGL unavailable in this browser; the still-water fallback was shown'); return; }
    await frames(page);
    assert.deepEqual(errors, [], `${engine}: the water scene renders without console errors`);
    record(engine, 'water (WebGL): scene ready, no shader or console errors', 'PASS');
  } finally {
    await browser.close();
  }
}

await run('chromium', chromium, { executablePath: process.env.CHROMIUM_PATH, args: ['--disable-gpu'] });
await run('webkit', webkit, {});
await checkWater('chromium', chromium, { executablePath: process.env.CHROMIUM_PATH });
await checkWater('webkit', webkit, {});
console.log(JSON.stringify(results, null, 2));
if (results.some(result => result.outcome === 'SKIPPED')) console.log('Some checks were SKIPPED (see detail); they did not pass.');
