import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { HomeLoaderGate } from './homeLoader';

test('home loader renders a sound switch before the app opens', () => {
  const markup = renderToStaticMarkup(
    <HomeLoaderGate enabled>
      <main>Portfolio app</main>
    </HomeLoaderGate>,
  );

  assert.match(markup, /role="switch"/);
  assert.match(markup, /aria-checked="false"/);
  assert.match(markup, /Open with sound/);
  assert.doesNotMatch(markup, /Portfolio app/);
});
