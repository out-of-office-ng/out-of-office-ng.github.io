import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.UX_BASE_URL || 'http://127.0.0.1:5174';
const launchOptions = {
  executablePath: process.env.CHROMIUM_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-software-rasterizer', ...(process.env.UX_SINGLE_PROCESS ? ['--single-process', '--no-zygote'] : [])],
};
await mkdir('.dump/trail-review', { recursive: true });
const results = [];
for (const width of [320, 390, 768, 1440]) {
  const browser = await chromium.launch(launchOptions);
  try {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    await page.goto(`${base}/#/trail`);
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.trail > li').count(), 4);
    assert.equal(await page.getByRole('link', { name: /View recap|Get on the list/ }).count(), 0);
    assert.equal(await page.locator('.trail-card img').count(), 0, 'Do not show unverified flyers as event photographs');
    assert.equal(await page.locator('#edition-0x03 time').getAttribute('datetime'), '2026-08-15');
    assert.match(await page.locator('#edition-0x04').innerText(), /November 2026/);
    assert.match(await page.locator('#edition-0x04').innerText(), /not on sale yet/);
    const index = page.getByRole('navigation', { name: 'Jump to an edition' });
    for (const code of ['0x01', '0x02', '0x03', '0x04']) {
      const jump = index.getByRole('link', { name: new RegExp(`^${code}:`) });
      await jump.click();
      await page.waitForURL(`**/#/trail/${code}`);
      const target = page.locator(`#edition-${code}`);
      await page.waitForFunction(id => document.activeElement?.id === `edition-${id}`, code);
      const rect = await target.boundingBox();
      const bottom = await index.evaluate(element => element.getBoundingClientRect().bottom);
      assert.ok(rect.y >= (width <= 600 ? bottom : 76) - 2, 'Jump target is not obscured by navigation');
      assert.equal(await jump.getAttribute('aria-current'), 'location');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No horizontal overflow at ${width}`);
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.getByRole('navigation', { name: 'Event trail navigation' }).getByRole('link', { name: 'Next escape' }).click();
    await page.waitForFunction(() => scrollY > 200 && document.getElementById('edition-0x04').getBoundingClientRect().top < innerHeight / 2);
    const trigger = page.getByRole('button', { name: 'See the pass update' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Pass update' });
    await dialog.waitFor();
    assert.match(await dialog.innerText(), /nothing to pay today/);
    await page.getByRole('button', { name: 'Got it' }).focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.getByRole('button', { name: 'Close sheet' }).evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true);

    await index.getByRole('link', { name: /^0x02:/ }).click();
    await page.reload();
    await page.waitForFunction(() => document.getElementById('edition-0x02')?.getBoundingClientRect().top >= 70 && scrollY > 200);
    assert.match(await page.locator('h1').innerText(), /trail of memories/);
    assert.equal(await index.getByRole('link', { name: /^0x02:/ }).getAttribute('aria-current'), 'location');
    await page.getByRole('link', { name: 'Back to home', exact: true }).click();
    await page.getByRole('heading', { name: 'Away from the everyday.' }).waitFor();
    await page.waitForFunction(() => scrollY === 0);
    await page.getByRole('link', { name: 'Explore the event trail' }).click();
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.waitForFunction(() => document.activeElement === document.querySelector('h1'));
    await page.goBack();
    await page.getByRole('heading', { name: 'Away from the everyday.' }).waitFor();
    await page.goForward();
    await page.waitForURL('**/#/trail');
    await page.waitForFunction(() => document.querySelectorAll('.trail-card').length === 3);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `.dump/trail-review/trail-${width}.png`, fullPage: true });
    assert.equal(requests.some(url => /flyer-|save-the-date|paystack/.test(url)), false, 'No unverified flyers or payments load');
    assert.deepEqual(errors, []);
    results.push({ width, passed: true });
  } finally { await browser.close(); }
}

const browser = await chromium.launch(launchOptions);
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/#/trail/0x03`);
  await page.locator('#edition-0x03').waitFor();
  await page.waitForFunction(() => getComputedStyle(document.getElementById('edition-0x03').parentElement).opacity === '1');
  await page.getByRole('navigation', { name: 'Jump to an edition' }).getByRole('link', { name: /^0x01:/ }).click();
  await page.waitForFunction(() => document.activeElement?.id === 'edition-0x01');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const card of await page.locator('.trail article').all()) {
    assert.equal(await card.evaluate(element => getComputedStyle(element.parentElement).opacity), '1');
  }
  assert.deepEqual(errors, []);
  results.push({ normalMotionAndRuntimeReducedMotion: true });
} finally { await browser.close(); }
console.log(JSON.stringify(results, null, 2));
