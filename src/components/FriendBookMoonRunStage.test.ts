import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldPreventMoonRunKeyboardDefault } from './FriendBookMoonRunStage';

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
