import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_VIDEO_SCROLL_CONFIG,
  getVideoScrollState,
} from './VideoScrollTransition.logic';

test('keeps the looping curtain video visible before scrub begins', () => {
  const state = getVideoScrollState(0.08, DEFAULT_VIDEO_SCROLL_CONFIG);

  assert.equal(state.phase, 'idle');
  assert.equal(state.scrubProgress, 0);
  assert.equal(state.overlayOpacity, 0);
});

test('fades the push-in video in as the slow scrub starts', () => {
  const state = getVideoScrollState(0.18, DEFAULT_VIDEO_SCROLL_CONFIG);

  assert.equal(state.phase, 'scrubbing');
  assert.equal(state.scrubProgress, 0);
  assert.ok(state.overlayOpacity > 0);
  assert.ok(state.overlayOpacity < 1);
});

test('advances the push-in video slowly through the middle of the section', () => {
  const state = getVideoScrollState(0.5, DEFAULT_VIDEO_SCROLL_CONFIG);

  assert.equal(state.phase, 'scrubbing');
  assert.ok(state.scrubProgress > 0.3);
  assert.ok(state.scrubProgress < 0.5);
  assert.equal(state.overlayOpacity, 1);
});

test('holds on the final frame when scroll reaches the end band', () => {
  const state = getVideoScrollState(0.97, DEFAULT_VIDEO_SCROLL_CONFIG);

  assert.equal(state.phase, 'endHold');
  assert.equal(state.scrubProgress, 1);
  assert.equal(state.overlayOpacity, 1);
});
