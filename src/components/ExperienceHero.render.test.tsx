import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import ExperienceHero from './ExperienceHero';

test('renders the experience hero anchor with a stable full-viewport sticky stage', () => {
  const markup = renderToStaticMarkup(<ExperienceHero />);

  assert.match(markup, /id="experience"/);
  assert.match(markup, /relative w-full h-\[100dvh\] bg-\[#FDFCF8\]/);
  assert.match(markup, /sticky top-0 w-full[^"]*overflow-hidden bg-\[#FDFCF8\] flex items-center justify-center/);
  assert.match(markup, /height:100dvh;min-height:100dvh/);
  assert.match(markup, /inset:-4px -2px -16px -2px/);
  assert.match(markup, /Double click to explore/);
  assert.doesNotMatch(markup, /class="absolute inset-0 z-40 pointer-events-none" style="opacity:1"/);
});
