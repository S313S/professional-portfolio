import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import ExperienceHero from './ExperienceHero';

test('renders the experience hero anchor with a stable full-viewport sticky stage', () => {
  const markup = renderToStaticMarkup(<ExperienceHero />);

  assert.match(markup, /id="experience"/);
  assert.match(markup, /sticky top-0 w-full[^"]*overflow-hidden bg-\[#FDFCF8\] flex items-center justify-center/);
  assert.match(markup, /height:calc\(100dvh \+ 16px\);min-height:calc\(100dvh \+ 16px\)/);
  assert.match(markup, /inset:-4px -2px -12px -2px/);
});
