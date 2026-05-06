import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import WorksDetailDebugPage from './WorksDetailDebugPage';

test('renders the works detail gallery directly for local debug routing', () => {
  const markup = renderToStaticMarkup(<WorksDetailDebugPage />);

  assert.match(markup, /id="works-detail-section"/);
  assert.match(markup, /data-works-detail-phase="settled"/);
  assert.match(markup, /data-works-detail-view="detail"/);
  assert.match(markup, /data-detail-scene-panel="gallery"/);
  assert.match(markup, /data-scene-active="true"/);
  assert.match(markup, /Operator Protocol/);
  assert.match(markup, /aria-label="Close work detail"/);
  assert.doesNotMatch(markup, /data-works-lobby/);
});
