import test from 'node:test';
import assert from 'node:assert/strict';

import {
  shouldEndMoonRunForFall,
  shouldPreventMoonRunKeyboardDefault,
} from './FriendBookMoonRunStage';

test('prevents browser default scrolling for Moon Run movement keys', () => {
  assert.equal(shouldPreventMoonRunKeyboardDefault('ArrowLeft'), true);
  assert.equal(shouldPreventMoonRunKeyboardDefault('ArrowRight'), true);
  assert.equal(shouldPreventMoonRunKeyboardDefault('ArrowUp'), true);
  assert.equal(shouldPreventMoonRunKeyboardDefault('ArrowDown'), true);
  assert.equal(shouldPreventMoonRunKeyboardDefault(' '), true);
});

test('does not block unrelated keys from their normal browser behavior', () => {
  assert.equal(shouldPreventMoonRunKeyboardDefault('Enter'), false);
  assert.equal(shouldPreventMoonRunKeyboardDefault('Tab'), false);
  assert.equal(shouldPreventMoonRunKeyboardDefault('a'), false);
});

test('does not end the run while the canvas has not reported a real layout height', () => {
  assert.equal(shouldEndMoonRunForFall(250, 1), false);
  assert.equal(shouldEndMoonRunForFall(250, 0), false);
});

test('ends the run only after the player falls below a measured viewport', () => {
  assert.equal(shouldEndMoonRunForFall(650, 460), false);
  assert.equal(shouldEndMoonRunForFall(661, 460), true);
});
