import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const base = process.env.UX_BASE_URL || 'http://127.0.0.1:5174';
const launchOptions = {
  executablePath: process.env.CHROMIUM_PATH,
  headless: true,
  args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--disable-software-rasterizer', ...(process.env.UX_SINGLE_PROCESS ? ['--single-process', '--no-zygote'] : [])],
};
let browser;
await mkdir('.dump/ux-review', { recursive: true });
const results = [];
try {
  for (const width of [320, 390, 768, 1440]) {
    browser = await chromium.launch(launchOptions);
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', hasTouch: width < 600, isMobile: width < 600 });
    const page = await context.newPage();
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => requests.push(request.url()));
    await page.goto(base, { waitUntil: 'domcontentloaded' });
    await page.getByRole('heading', { name: 'Away from the everyday.' }).waitFor();
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.shallows-canvas').count(), 0, 'Reduced motion should use the water still');
    assert.equal(await page.locator('.water-still img').evaluate(image => image.complete && image.naturalWidth > 0), true);
    assert.equal(await page.locator('.description').isVisible(), true, 'The introduction remains visible on phones');
    assert.equal(await page.locator('.scene-status').count(), 0);
    await page.screenshot({ path: `.dump/ux-review/hero-${width}.png` });

    await page.locator('#past-editions').scrollIntoViewIfNeeded();
    await page.locator('#past-editions').waitFor();
    assert.ok(await page.evaluate(() => scrollY > 300), 'Navigation should scroll beyond the hero');
    assert.ok(await page.locator('.site-header').evaluate(element => element.getBoundingClientRect().top >= 0), 'Header remains visible');
    const front = page.locator('.edition-card.front');
    assert.match(await front.innerText(), /Post-NYSC/);
    assert.equal(await page.locator('.edition-card[inert]').count(), 2);
    await page.getByRole('button', { name: 'Next edition', exact: true }).click();
    assert.match(await front.innerText(), /Open Canvas/);
    await page.getByRole('button', { name: 'Next edition', exact: true }).press('ArrowRight');
    assert.match(await front.innerText(), /Release and Unwind/);
    await page.getByRole('button', { name: 'Next edition', exact: true }).press('Home');
    assert.match(await front.innerText(), /Post-NYSC/);
    await page.getByRole('button', { name: 'Previous edition', exact: true }).click();
    assert.match(await front.innerText(), /Release and Unwind/);
    await page.getByRole('button', { name: 'See this edition', exact: true }).click();
    assert.equal(await page.locator('#edition-details').isVisible(), true);
    await page.getByRole('button', { name: 'Next edition', exact: true }).click();
    assert.equal(await page.locator('#edition-details').isVisible(), false);

    // Pointer gesture exercises direction, threshold, and pointer-cancel handling.
    const deck = page.locator('.deck');
    await deck.scrollIntoViewIfNeeded();
    const box = await deck.boundingBox();
    await page.screenshot({ path: `.dump/ux-review/before-swipe-${width}.png` });
    await page.mouse.move(box.x + box.width * .75, box.y + box.height * .5);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .25, box.y + box.height * .5 + 5, { steps: 8 });
    await page.mouse.up();
    assert.match(await front.innerText(), /Open Canvas/);
    await page.mouse.down();
    await deck.dispatchEvent('pointercancel', { pointerId: 1 });
    await page.mouse.up();
    assert.equal(await deck.evaluate(element => element.classList.contains('dragging')), false);
    await page.screenshot({ path: `.dump/ux-review/archive-${width}.png` });

    await page.locator('#next-event').scrollIntoViewIfNeeded();
    const question = page.getByRole('button', { name: 'When and where is the next one?' });
    await question.click();
    assert.equal(await question.getAttribute('aria-expanded'), 'true');
    assert.match(await page.locator('#faq-answer-1').innerText(), /November 2026/);
    await page.getByRole('button', { name: 'Can I buy a pass yet?' }).click();
    assert.equal(await question.getAttribute('aria-expanded'), 'false');
    assert.match(await page.locator('#faq-answer-2').innerText(), /not on sale/);
    assert.equal(await page.locator('.playlist-section iframe').count(), 1, 'Mixtape embed is present');
    await page.screenshot({ path: `.dump/ux-review/faq-${width}.png` });

    const trigger = page.locator('.site-header').getByRole('button', { name: 'Pass update' });
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Pass update' });
    await dialog.waitFor();
    assert.match(await dialog.innerText(), /nothing to pay today/);
    assert.equal(await dialog.locator('input').count(), 0);
    assert.equal(await dialog.evaluate(element => element.contains(document.activeElement)), true, 'Opening moves focus into dialog');
    await page.getByRole('button', { name: 'Got it', exact: true }).focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.getByRole('button', { name: 'Close sheet', exact: true }).evaluate(element => element === document.activeElement), true);
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.equal(await trigger.evaluate(element => element === document.activeElement), true, 'Closing restores trigger focus');
    assert.equal(await page.locator('main').evaluate(element => element.inert), false);

    for (const section of ['#about', '#past-editions', '#next-event', '#passes']) {
      await page.locator(section).scrollIntoViewIfNeeded();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No overflow at ${width} in ${section}`);
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `.dump/ux-review/full-${width}.png`, fullPage: true });
    assert.equal(requests.some(url => /createShallows|three-vendor|paystack|pexels/.test(url)), false, 'Reduced motion should not download WebGL or removed third-party services');
    assert.deepEqual(errors, [], 'No page errors');
    results.push({ width, checks: 'navigation, cards, gestures, keyboard, FAQ, closed sales, modal focus, overflow, reduced motion', passed: true });
    await browser.close();
  }

  // Normal-motion path: fail WebGL, keep the invitation usable, and verify
  // the transition actually runs before settling to the readable state.
  browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(base, { waitUntil: 'domcontentloaded' });
  await page.locator('.scene-unavailable').waitFor({ timeout: 20000 });
  assert.equal(await page.locator('.water-still img').evaluate(image => image.complete && image.naturalWidth > 0), true);
  assert.equal(await page.getByRole('button', { name: 'Wander the water' }).isDisabled(), true);
  await page.locator('#past-editions').scrollIntoViewIfNeeded();
  await page.locator('.deck').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'Next edition', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('.edition-card.front h3').textContent === 'Open Canvas');
  assert.equal(await page.locator('.edition-card.front').evaluate(element => getComputedStyle(element).transitionDuration.includes('0.55s')), true);
  await page.locator('#next-event').scrollIntoViewIfNeeded();
  await page.getByRole('button', { name: 'When and where is the next one?' }).click();
  await page.locator('#faq-answer-1').waitFor();
  await page.waitForFunction(() => document.querySelector('#faq-answer-1').getBoundingClientRect().height > 50);
  await page.getByRole('button', { name: 'When and where is the next one?' }).click();
  await page.locator('#faq-answer-1').waitFor({ state: 'detached' });
  results.push({ checks: 'normal motion, failed WebGL fallback, card transition, FAQ expansion/collapse', passed: true });
  await browser.close();
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser?.close();
}
