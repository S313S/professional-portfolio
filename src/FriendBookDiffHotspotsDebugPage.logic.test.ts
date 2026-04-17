import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applyHotspotFrameDelta,
  clampHotspotFrame,
  createHotspotPositioningCodeBlock,
} from './FriendBookDiffHotspotsDebugPage.logic';

test('clamps hotspot frames so they stay inside the image bounds', () => {
  assert.deepEqual(
    clampHotspotFrame({ x: -5, y: 92, width: 20, height: 15 }),
    { x: 0, y: 85, width: 20, height: 15 },
  );
});

test('moving a hotspot frame translates x and y together', () => {
  assert.deepEqual(
    applyHotspotFrameDelta(
      { x: 17, y: 15, width: 18, height: 18 },
      { deltaX: 3, deltaY: -2 },
      'move',
    ),
    { x: 20, y: 13, width: 18, height: 18 },
  );
});

test('resizing a hotspot frame grows from the lower-right corner', () => {
  assert.deepEqual(
    applyHotspotFrameDelta(
      { x: 17, y: 15, width: 18, height: 18 },
      { deltaX: 4, deltaY: 3 },
      'resize',
    ),
    { x: 17, y: 15, width: 22, height: 21 },
  );
});

test('creates a copyable positioning block for the current hotspot map', () => {
  const code = createHotspotPositioningCodeBlock({
    'moon-cottage': {
      'moon-stamp': { x: 17, y: 15, width: 18, height: 18 },
    },
  });

  assert.match(code, /'moon-cottage': \{/);
  assert.match(code, /'moon-stamp': \{ x: 17, y: 15, width: 18, height: 18 \}/);
});
