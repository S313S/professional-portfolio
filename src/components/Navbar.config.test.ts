import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('treats the experience and video fullscreen sections as immersive navbar-hide regions', () => {
  const source = readFileSync(new URL('./Navbar.tsx', import.meta.url), 'utf8');

  assert.match(source, /const IMMERSIVE_SECTION_IDS = \[/);
  assert.match(source, /'experience'/);
  assert.match(source, /VIDEO_SCROLL_TRANSITION_SECTION_ID/);
});
