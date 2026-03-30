import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import WorksLobbySection from './WorksLobbySection';

test('renders the works lobby image, video, and gated entry button layers', () => {
  const markup = renderToStaticMarkup(<WorksLobbySection />);

  assert.match(markup, /id="works-lobby-section"/);
  assert.match(markup, /\/images\/WorksCollectionRoom_Bg\.jpg/);
  assert.match(markup, /\/videos\/Lofi-girl\.mp4/);
  assert.match(markup, /data-works-lobby-phase="revealing"/);
  assert.match(markup, /data-works-lobby-layer="video"/);
  assert.match(markup, /data-works-lobby-layer="image"/);
  assert.match(markup, /data-works-lobby-layer="button"/);
  assert.match(markup, /data-works-lobby-cta="enter"/);
  assert.doesNotMatch(markup, /disabled/);
  assert.match(markup, /data-works-lobby-target="works-detail-section"/);
});
