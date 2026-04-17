import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookDiffHotspotsDebugPage from './FriendBookDiffHotspotsDebugPage';

test('renders a dedicated debug page for between two pages hotspot editing', () => {
  const markup = renderToStaticMarkup(<FriendBookDiffHotspotsDebugPage />);

  assert.match(markup, /Friend Book Diff Hotspots Debug/);
  assert.match(markup, /Drag the red frame or use the lower-right handle to resize it\./);
  assert.match(markup, /data-friend-book-diff-debug-scene-select=/);
  assert.match(markup, /data-friend-book-diff-debug-target-select=/);
  assert.match(markup, /data-friend-book-diff-debug-preview="left"/);
  assert.match(markup, /data-friend-book-diff-debug-preview="right"/);
  assert.match(markup, /data-friend-book-diff-debug-copy-output=/);
  assert.match(markup, /data-friend-book-diff-debug-confirm-button=/);
  assert.match(markup, /tmp\/friend-book-diff-hotspots\.json/);
  assert.doesNotMatch(markup, /id="career-detail-section"/);
  assert.doesNotMatch(markup, /id="works-detail-section"/);
});
