// WCAG 2.2 AA regression checks. Run against `vite preview --port 5174`:
//   CHROMIUM_PATH=".../chrome.exe" node scripts/check-wcag.mjs
// axe-core covers what it can decide; the rest are targeted checks for issues
// found in the October 2026 audit. Not a substitute for manual testing.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';

const base = process.env.UX_BASE_URL || 'http://127.0.0.1:5174';
const axeSource = await readFile(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8');
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const TEXT_SPACING = '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }';
const results = [];
const pass = check => results.push({ check, outcome: 'PASS' });

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH, args: ['--disable-gpu'] });
async function open(route, { width = 1440, height = 900, theme = 'light', reducedMotion = 'reduce' } = {}) {
  const context = await browser.newContext({ viewport: { width, height }, reducedMotion });
  await context.route(/gc\.zgo\.at|goatcounter\.com/, route => route.fulfill({ status: 200, contentType: 'text/javascript', body: '' }));
  await context.addInitScript(value => { try { localStorage.setItem('ooo-theme', value); } catch { /* storage blocked */ } }, theme);
  const page = await context.newPage();
  await page.goto(`${base}/${route}`, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  return { context, page };
}
async function axe(page, label) {
  if (!(await page.evaluate(() => 'axe' in window))) await page.addScriptTag({ content: axeSource });
  const violations = await page.evaluate(async tags => (await window.axe.run(document, { runOnly: tags })).violations
    .map(v => `${v.id}: ${v.nodes.slice(0, 3).map(n => n.target.join(' ')).join(', ')}`), TAGS);
  assert.deepEqual(violations, [], `${label}: axe violations`);
}
const settle = page => page.evaluate(async () => {
  for (let y = 0; y <= document.documentElement.scrollHeight; y += innerHeight * .7) {
    scrollTo(0, y);
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }
  scrollTo(0, 0);
  await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
});

const overlays = {
  'auto-reply generator': async page => { await page.getByRole('button', { name: /Write your own/ }).click(); await page.getByRole('dialog').first().waitFor(); },
  '0x04 status sheet': async page => { await page.locator('.site-header').getByRole('button', { name: '0x04 status' }).click(); await page.getByRole('dialog', { name: '0x04 status' }).waitFor(); },
  'video dialog': async page => {
    await page.locator('.deck').scrollIntoViewIfNeeded();
    await page.getByRole('button', { name: 'Next edition', exact: true }).click();
    await page.getByRole('button', { name: /^Watch Open Canvas/ }).click();
    await page.getByRole('dialog', { name: 'Open Canvas' }).waitFor();
  },
  'photo lightbox': async page => { const photo = page.locator('.photo-open').first(); await photo.scrollIntoViewIfNeeded(); await photo.click(); await page.getByRole('dialog').first().waitFor(); },
};

try {
  // axe on every route and overlay, both themes, phone and desktop.
  for (const theme of ['light', 'dark']) for (const width of [375, 1440]) {
    for (const route of ['', '#/trail', '#/about']) {
      const { context, page } = await open(route, { width, theme });
      await settle(page);
      await axe(page, `${theme} ${width} ${route || 'home'}`);
      await context.close();
    }
    for (const [name, show] of Object.entries(overlays)) {
      const { context, page } = await open('', { width, theme });
      await show(page);
      await axe(page, `${theme} ${width} ${name}`);
      await context.close();
    }
  }
  pass('axe: no WCAG 2.2 A/AA violations on 3 routes and 4 overlays, light + dark, 375 + 1440');

  // 2.4.2 Page titled, per view, including returning home.
  {
    const { context, page } = await open('');
    const home = await page.title();
    await page.evaluate(() => { location.hash = '#/trail'; });
    await page.waitForFunction(() => document.title.startsWith('Event trail'));
    await page.evaluate(() => { location.hash = '#/about'; });
    await page.waitForFunction(() => document.title.startsWith('Our story'));
    await page.evaluate(() => { location.hash = '#/'; });
    await page.waitForFunction(title => document.title === title, home);
    await context.close();
  }
  pass('2.4.2: home, trail and about have distinct titles');

  // 1.4.12 Text spacing and short windows: the hero CTA stays visible (not clipped by the hero).
  for (const [width, height, spacing] of [[1440, 900, true], [1280, 600, false], [1280, 600, true], [375, 667, true]]) {
    const { context, page } = await open('', { width, height });
    if (spacing) await page.addStyleTag({ content: TEXT_SPACING });
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const clipped = await page.evaluate(() => document.querySelector('.primary-button').getBoundingClientRect().bottom > document.querySelector('section.hero').getBoundingClientRect().bottom);
    assert.equal(clipped, false, `${width}x${height}${spacing ? ' with text spacing' : ''}: hero CTA is clipped`);
    await context.close();
  }
  pass('1.4.12 / 1.4.10: hero CTA never clipped (text spacing, 1280x600)');

  // 1.4.10 Reflow: the video stays watchable at 400% zoom and in landscape.
  for (const [width, height] of [[320, 256], [667, 375], [320, 568]]) {
    const { context, page } = await open('', { width, height });
    await overlays['video dialog'](page);
    const video = await page.evaluate(() => document.querySelector('dialog[open] video').getBoundingClientRect().height);
    assert.ok(video >= Math.min(height * .6, 200) - 1, `${width}x${height}: video is ${video}px tall`);
    const pick = page.getByRole('dialog', { name: 'Open Canvas' }).getByRole('button', { name: /Before guests arrived/ });
    await pick.click();
    assert.equal(await pick.getAttribute('aria-pressed'), 'true', `${width}x${height}: clip picks reachable`);
    await context.close();
  }
  pass('1.4.10: video dialog usable at 320x256, 667x375 and 320x568');

  // 2.5.8 Target size (minimum), with the spacing exception.
  for (const width of [375, 1440]) for (const route of ['', '#/trail', '#/about']) {
    const { context, page } = await open(route, { width, height: 800 });
    await settle(page);
    const tooSmall = await page.evaluate(() => {
      const targets = [...document.querySelectorAll('a[href], button, input, select, [role=button]')]
        .filter(element => element.getClientRects().length && !element.closest('[inert]') && getComputedStyle(element).visibility !== 'hidden')
        .map(element => ({ element, rect: element.getBoundingClientRect() }));
      const inSentence = element => getComputedStyle(element).display === 'inline' && element.closest('p, li, dd');
      return targets.filter(({ element, rect }) => (rect.width < 24 || rect.height < 24) && !inSentence(element)).filter(target => {
        const x = target.rect.left + target.rect.width / 2, y = target.rect.top + target.rect.height / 2;
        return targets.some(other => other !== target && !other.element.contains(target.element) && !target.element.contains(other.element) && (() => {
          const nx = Math.max(other.rect.left, Math.min(x, other.rect.right)), ny = Math.max(other.rect.top, Math.min(y, other.rect.bottom));
          return Math.hypot(nx - x, ny - y) < (other.rect.width < 24 || other.rect.height < 24 ? 24 : 12);
        })());
      }).map(({ element }) => (element.getAttribute('aria-label') || element.textContent).trim().slice(0, 30));
    });
    assert.deepEqual(tooSmall, [], `${width} ${route || 'home'}: undersized targets too close to others`);
    await context.close();
  }
  pass('2.5.8: target size minimum (with spacing exception)');

  // 1.3.1 Headings: one h1 per view, no decorative headings.
  {
    const { context, page } = await open('');
    await settle(page);
    const headings = await page.evaluate(() => [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter(h => h.getClientRects().length).map(h => h.textContent.trim()));
    assert.equal(headings.filter(text => /^(LOS|OOO)$/.test(text)).length, 0, 'Boarding-pass codes are not headings');
    assert.equal(await page.locator('h1').count(), 1);
    await context.close();
  }
  pass('1.3.1: heading outline');
} finally {
  await browser.close();
}
console.log(JSON.stringify(results, null, 2));
