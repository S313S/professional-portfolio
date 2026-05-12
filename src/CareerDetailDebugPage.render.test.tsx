import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import CareerDetailDebugPage from './CareerDetailDebugPage';

test('renders the career detail section directly for local debug routing', () => {
  const markup = renderToStaticMarkup(<CareerDetailDebugPage />);

  assert.match(markup, /id="career-detail-section"/);
  assert.match(markup, /January 8th, 2025/);
  assert.match(markup, /Visual Tests Became Workflows/);
  assert.match(markup, /data-career-detail-selector="desktop"/);
  assert.match(markup, /data-career-detail-record-rail="desktop"/);
  assert.doesNotMatch(markup, /id="works-detail-section"/);
  assert.doesNotMatch(markup, /data-works-lobby/);
});
