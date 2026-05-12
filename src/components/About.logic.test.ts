import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ABOUT_VIEW_WORK_SCROLL_DURATION_MS,
  ABOUT_VIEW_WORK_TARGET_SECTION_ID,
  getAboutViewWorkScrollPosition,
  getAboutViewWorkScrollTargetY,
} from './About.logic';

test('view work button targets the next full-screen experience page', () => {
  assert.equal(ABOUT_VIEW_WORK_TARGET_SECTION_ID, 'experience');
  assert.equal(
    getAboutViewWorkScrollTargetY({
      currentScrollY: 640,
      targetRectTop: 520.4,
    }),
    1160,
  );
});

test('view work scroll animation eases slowly from current page to the next page', () => {
  assert.equal(ABOUT_VIEW_WORK_SCROLL_DURATION_MS, 1400);
  assert.equal(
    getAboutViewWorkScrollPosition({
      startY: 640,
      targetY: 1640,
      elapsedMs: 0,
    }),
    640,
  );
  assert.equal(
    getAboutViewWorkScrollPosition({
      startY: 640,
      targetY: 1640,
      elapsedMs: ABOUT_VIEW_WORK_SCROLL_DURATION_MS,
    }),
    1640,
  );

  const halfwayScrollY = getAboutViewWorkScrollPosition({
    startY: 640,
    targetY: 1640,
    elapsedMs: ABOUT_VIEW_WORK_SCROLL_DURATION_MS / 2,
  });

  assert.ok(halfwayScrollY > 640);
  assert.ok(halfwayScrollY < 1640);
});
