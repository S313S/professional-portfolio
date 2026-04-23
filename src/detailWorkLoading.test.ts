import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const detailWorkLoadingSource = readFileSync(
  new URL('../public/detailWork-loading.html', import.meta.url),
  'utf8',
);

test('detail work loading page uses only local script and data assets', () => {
  assert.match(detailWorkLoadingSource, /<script src="\/vendor\/gsap\.min\.js"><\/script>/);
  assert.match(
    detailWorkLoadingSource,
    /<script src="\/vendor\/topojson-client\.min\.js"><\/script>/,
  );
  assert.match(detailWorkLoadingSource, /fetch\('\/vendor\/land-110m\.json'\)/);
  assert.doesNotMatch(detailWorkLoadingSource, /https:\/\/cdnjs\.cloudflare\.com/);
  assert.doesNotMatch(detailWorkLoadingSource, /https:\/\/cdn\.jsdelivr\.net/);
});
