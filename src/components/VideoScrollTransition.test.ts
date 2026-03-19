import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CTA_HINT_LEFT_BASE_PERCENT,
  CTA_HINT_LEFT_MD_PERCENT,
  CTA_HINT_OFFSET_X_PX,
  DEFAULT_VIDEO_SCROLL_INITIAL_STATE,
  DEFAULT_VIDEO_WHEEL_STEP,
  getCtaHintLeftValue,
  getSoftRepinScrollTop,
  getVideoScrollMountState,
  getVideoStateAfterActivation,
  getVideoStateAfterMobilePlaybackEnd,
  getVideoStateAfterPrompt,
  shouldPinVideoSectionOnPrompt,
  getVideoVisualState,
  getVideoWheelState,
  shouldRepinAwaitingActivationOnScroll,
  shouldResetCompletedVideoOnScroll,
} from './VideoScrollTransition.logic.ts';

test('starts in loopPlaying with only the curtain video visible', () => {
  const state = getVideoVisualState(DEFAULT_VIDEO_SCROLL_INITIAL_STATE);

  assert.equal(state.phase, 'loopPlaying');
  assert.equal(state.scrubProgress, 0);
  assert.equal(state.overlayOpacity, 0);
  assert.equal(state.loopOpacity, 1);
  assert.equal(state.showCta, false);
  assert.equal(state.shouldPlayLoopVideo, true);
});

test('shows the CTA when the curtain video finishes naturally', () => {
  const state = getVideoStateAfterPrompt(DEFAULT_VIDEO_SCROLL_INITIAL_STATE);

  assert.equal(state.phase, 'awaitingActivation');
  assert.equal(state.scrubProgress, 0);

  const visualState = getVideoVisualState(state);
  assert.equal(visualState.showCta, true);
  assert.equal(visualState.showCtaPromptAnimation, true);
  assert.equal(visualState.loopOpacity, 1);
  assert.equal(visualState.overlayOpacity, 0);
  assert.equal(visualState.shouldPlayLoopVideo, false);
});

test('first downward wheel step only reveals the CTA without starting the push-in video', () => {
  const wheelState = getVideoWheelState({
    state: DEFAULT_VIDEO_SCROLL_INITIAL_STATE,
    deltaY: 120,
    step: DEFAULT_VIDEO_WHEEL_STEP,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.deepEqual(wheelState.nextState, {
    phase: 'awaitingActivation',
    scrubProgress: 0,
  });
});

test('clicking the CTA arms the push-in animation at progress zero', () => {
  const state = getVideoStateAfterActivation({
    phase: 'awaitingActivation',
    scrubProgress: 0,
  });

  assert.deepEqual(state, {
    phase: 'scrubbing',
    scrubProgress: 0,
  });

  const visualState = getVideoVisualState(state);
  assert.equal(visualState.overlayOpacity, 1);
  assert.equal(visualState.loopOpacity, 0);
  assert.equal(visualState.showCta, false);
});

test('resets to the video section start when reload restores scroll inside the section', () => {
  const mountState = getVideoScrollMountState({
    navigationType: 'reload',
    scrollY: 3240,
    sectionTop: 2800,
    sectionHeight: 5040,
  });

  assert.equal(mountState.shouldResetScroll, true);
  assert.equal(mountState.targetScrollY, 2800);
  assert.deepEqual(mountState.initialVideoState, {
    phase: 'loopPlaying',
    scrubProgress: 0,
  });
});

test('keeps the restored scroll position when navigation is not a reload', () => {
  const mountState = getVideoScrollMountState({
    navigationType: 'navigate',
    scrollY: 3240,
    sectionTop: 2800,
    sectionHeight: 5040,
  });

  assert.equal(mountState.shouldResetScroll, false);
  assert.equal(mountState.targetScrollY, null);
  assert.deepEqual(mountState.initialVideoState, {
    phase: 'loopPlaying',
    scrubProgress: 0,
  });
});

test('does not reset when reload happens outside the video section', () => {
  const mountState = getVideoScrollMountState({
    navigationType: 'reload',
    scrollY: 1200,
    sectionTop: 2800,
    sectionHeight: 5040,
  });

  assert.equal(mountState.shouldResetScroll, false);
  assert.equal(mountState.targetScrollY, null);
});

test('pins the section when the activation prompt appears while the user is still inside the video section', () => {
  const shouldPin = shouldPinVideoSectionOnPrompt({
    scrollY: 3240,
    sectionTop: 2800,
    sectionHeight: 5040,
  });

  assert.equal(shouldPin, true);
});

test('does not pin the section when the activation prompt appears after the user has scrolled into the next section', () => {
  const shouldPin = shouldPinVideoSectionOnPrompt({
    scrollY: 7900,
    sectionTop: 2800,
    sectionHeight: 5040,
  });

  assert.equal(shouldPin, false);
});

test('advances the push-in animation while scrubbing on desktop wheel input', () => {
  const wheelState = getVideoWheelState({
    state: {
      phase: 'scrubbing',
      scrubProgress: 0,
    },
    deltaY: 120,
    step: DEFAULT_VIDEO_WHEEL_STEP,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.equal(wheelState.nextState.phase, 'scrubbing');
  assert.ok(wheelState.nextState.scrubProgress > 0);
  assert.ok(wheelState.nextState.scrubProgress < 0.2);
});

test('rewinds back to the CTA state when wheel scrubbing returns to zero', () => {
  const wheelState = getVideoWheelState({
    state: {
      phase: 'scrubbing',
      scrubProgress: 0.06,
    },
    deltaY: -120,
    step: DEFAULT_VIDEO_WHEEL_STEP,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.deepEqual(wheelState.nextState, {
    phase: 'awaitingActivation',
    scrubProgress: 0,
  });
});

test('releases page scrolling once the push-in animation is complete', () => {
  const wheelState = getVideoWheelState({
    state: {
      phase: 'scrubbing',
      scrubProgress: 0.96,
    },
    deltaY: 120,
    step: DEFAULT_VIDEO_WHEEL_STEP,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.deepEqual(wheelState.nextState, {
    phase: 'completed',
    scrubProgress: 1,
  });
});

test('rewinds completed state back to the curtain loop on upward wheel input', () => {
  const wheelState = getVideoWheelState({
    state: {
      phase: 'completed',
      scrubProgress: 1,
    },
    deltaY: -120,
    step: DEFAULT_VIDEO_WHEEL_STEP,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.deepEqual(wheelState.nextState, {
    phase: 'loopPlaying',
    scrubProgress: 0,
  });
});

test('lets downward wheel input pass through once the completed state has released the page', () => {
  const wheelState = getVideoWheelState({
    state: {
      phase: 'completed',
      scrubProgress: 1,
    },
    deltaY: 120,
    step: DEFAULT_VIDEO_WHEEL_STEP,
  });

  assert.equal(wheelState.shouldPreventScroll, false);
  assert.deepEqual(wheelState.nextState, {
    phase: 'completed',
    scrubProgress: 1,
  });
});

test('resets the completed video flow when the page starts scrolling upward', () => {
  const shouldReset = shouldResetCompletedVideoOnScroll({
    state: {
      phase: 'completed',
      scrubProgress: 1,
    },
    previousScrollY: 3600,
    scrollY: 3300,
  });

  assert.equal(shouldReset, true);
});

test('does not reset the completed video flow while the page keeps moving downward', () => {
  const shouldReset = shouldResetCompletedVideoOnScroll({
    state: {
      phase: 'completed',
      scrubProgress: 1,
    },
    previousScrollY: 3300,
    scrollY: 3600,
  });

  assert.equal(shouldReset, false);
});

test('re-pins the section when awaiting activation starts drifting downward', () => {
  const shouldRepin = shouldRepinAwaitingActivationOnScroll({
    state: {
      phase: 'awaitingActivation',
      scrubProgress: 0,
    },
    sectionTop: 2800,
    sectionHeight: 5040,
    previousScrollY: 2800,
    scrollY: 2860,
  });

  assert.equal(shouldRepin, true);
});

test('does not re-pin when awaiting activation has already scrolled below the video section', () => {
  const shouldRepin = shouldRepinAwaitingActivationOnScroll({
    state: {
      phase: 'awaitingActivation',
      scrubProgress: 0,
    },
    sectionTop: 2800,
    sectionHeight: 5040,
    previousScrollY: 7890,
    scrollY: 7900,
  });

  assert.equal(shouldRepin, false);
});

test('does not re-pin when awaiting activation only drifts downward within the tolerance band', () => {
  const shouldRepin = shouldRepinAwaitingActivationOnScroll({
    state: {
      phase: 'awaitingActivation',
      scrubProgress: 0,
    },
    sectionTop: 2800,
    sectionHeight: 5040,
    previousScrollY: 2800,
    scrollY: 2808,
  });

  assert.equal(shouldRepin, false);
});

test('builds CTA hint left values from tunable percent and offset constants', () => {
  assert.equal(
    getCtaHintLeftValue(CTA_HINT_LEFT_BASE_PERCENT, CTA_HINT_OFFSET_X_PX),
    `calc(${CTA_HINT_LEFT_BASE_PERCENT}% + ${CTA_HINT_OFFSET_X_PX}px)`,
  );
  assert.equal(
    getCtaHintLeftValue(CTA_HINT_LEFT_MD_PERCENT, CTA_HINT_OFFSET_X_PX),
    `calc(${CTA_HINT_LEFT_MD_PERCENT}% + ${CTA_HINT_OFFSET_X_PX}px)`,
  );
});

test('interpolates soft repin scroll positions with easing', () => {
  assert.equal(getSoftRepinScrollTop(2860, 2800, 0), 2860);
  assert.equal(getSoftRepinScrollTop(2860, 2800, 1), 2800);

  const midPoint = getSoftRepinScrollTop(2860, 2800, 0.5);
  assert.ok(midPoint < 2860);
  assert.ok(midPoint > 2800);
});

test('does not re-pin when awaiting activation scrolls upward toward the previous section', () => {
  const shouldRepin = shouldRepinAwaitingActivationOnScroll({
    state: {
      phase: 'awaitingActivation',
      scrubProgress: 0,
    },
    sectionTop: 2800,
    sectionHeight: 5040,
    previousScrollY: 2860,
    scrollY: 2740,
  });

  assert.equal(shouldRepin, false);
});

test('completed state keeps the final push-in frame visible', () => {
  const visualState = getVideoVisualState({
    phase: 'completed',
    scrubProgress: 1,
  });

  assert.equal(visualState.phase, 'completed');
  assert.equal(visualState.overlayOpacity, 1);
  assert.equal(visualState.loopOpacity, 0);
  assert.equal(visualState.showCta, false);
  assert.equal(visualState.showCtaPromptAnimation, false);
});

test('mobile autoplay marks the transition complete when the push-in video ends', () => {
  const state = getVideoStateAfterMobilePlaybackEnd({
    phase: 'scrubbing',
    scrubProgress: 0,
  });

  assert.deepEqual(state, {
    phase: 'completed',
    scrubProgress: 1,
  });
});
