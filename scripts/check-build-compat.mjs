// Older iPhones (Safari 14-16.3) must be able to read the built site. Run after
// `vite build`: node scripts/check-build-compat.mjs
// Static scan of dist/, because Playwright's WebKit is new and parses all of
// this fine; it cannot show what an old Safari drops.
import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

const dir = new URL('../dist/assets/', import.meta.url);
const files = await readdir(dir);
const read = name => readFile(new URL(name, dir), 'utf8');

for (const name of files.filter(f => f.endsWith('.css'))) {
  const css = await read(name);
  // (width<=580px) is ignored before Safari 16.4: the phone layout never applies.
  const range = css.match(/@media[^{]*\b(width|height)\s*[<>]/g) || [];
  assert.deepEqual(range, [], `${name}: media range syntax`);
  // color-mix() is dropped before Safari 16.2: the hero lost its wash and the
  // auto-reply card its background, so dark-mode hero text was unreadable.
  assert.equal((css.match(/color-mix\(/g) || []).length, 0, `${name}: color-mix()`);
}
for (const name of files.filter(f => f.endsWith('.js'))) {
  const js = await read(name);
  // A class static block is a parse error before Safari 16.4: the whole chunk
  // (three.js, so the water and its sound) fails to load.
  assert.equal((js.match(/\bstatic\s*\{/g) || []).length, 0, `${name}: class static block`);
}
console.log(JSON.stringify([{ check: 'built CSS/JS readable by Safari 14+ (no media range syntax, color-mix or static blocks)', outcome: 'PASS' }], null, 2));
