import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_SCROLL_MOMENTUM_LOCK_MS,
  armScrollMomentumLock,
  clearScrollMomentumLock,
  isScrollMomentumLocked,
} from './scrollMomentumLock';

test('arms a global momentum lock for the default duration', () => {
  clearScrollMomentumLock();
  const now = 1_000;

  armScrollMomentumLock(DEFAULT_SCROLL_MOMENTUM_LOCK_MS, now);

  assert.equal(isScrollMomentumLocked(now), true);
  assert.equal(isScrollMomentumLocked(now + DEFAULT_SCROLL_MOMENTUM_LOCK_MS + 10), false);
});

test('a later arm extends the lock window', () => {
  clearScrollMomentumLock();

  armScrollMomentumLock(300, 1_000);
  armScrollMomentumLock(600, 1_100);

  assert.equal(isScrollMomentumLocked(1_350), true);
  assert.equal(isScrollMomentumLocked(1_710), false);
});

test('clear removes the active lock immediately', () => {
  armScrollMomentumLock(600, 2_000);

  clearScrollMomentumLock();

  assert.equal(isScrollMomentumLocked(2_100), false);
});
