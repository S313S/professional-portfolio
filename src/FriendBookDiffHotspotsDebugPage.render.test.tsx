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

test('explains the GPT-5.6 refactor and the human calibration workflow', () => {
  const markup = renderToStaticMarkup(<FriendBookDiffHotspotsDebugPage />);

  assert.match(markup, /GPT-5\.6 Refactor/);
  assert.match(markup, /Existing tool, refactored and extended with GPT-5\.6/);
  assert.match(markup, /data-friend-book-diff-debug-workflow-step="select"/);
  assert.match(markup, /data-friend-book-diff-debug-workflow-step="calibrate"/);
  assert.match(markup, /data-friend-book-diff-debug-workflow-step="confirm"/);
  assert.match(markup, /data-friend-book-diff-debug-mobile-guidance=/);
  assert.match(markup, /href="\/debug\/codex-report"/);
  assert.match(markup, /Human judgment/);
  assert.match(markup, /machine-readable parameters/);
  assert.doesNotMatch(markup, /built (?:the )?original hotspot debugging tool from scratch/i);
});
