import test from 'node:test';
import assert from 'node:assert/strict';

import {
  closeWorksDetailView,
  getWorksDetailActivationState,
  getWorksDetailBackNavigationState,
  getWorksDetailCompletionState,
  isWorksDetailContentInteractive,
  openWorksDetailView,
  getWorksDetailPinnedScrollY,
  getWorksDetailVisualState,
  getWorksDetailWheelBufferState,
  getWorksDetailWheelState,
  shouldLockWorksDetailScroll,
} from './WorksDetailSection.logic.ts';

test('activating the works detail transition enters loading and advances the iframe cycle key', () => {
  assert.deepEqual(getWorksDetailActivationState(0), {
    nextPhase: 'loading',
    nextCycleKey: 1,
    nextTransitionProgress: 0,
  });

  assert.deepEqual(getWorksDetailActivationState(3), {
    nextPhase: 'loading',
    nextCycleKey: 4,
    nextTransitionProgress: 0,
  });
});

test('opening and closing the works detail subview switches between entry and detail', () => {
  assert.equal(openWorksDetailView('entry'), 'detail');
  assert.equal(closeWorksDetailView('detail'), 'entry');
});

test('detail view ignores upward back navigation and entry view remains the only scroll-exit state', () => {
  assert.deepEqual(getWorksDetailBackNavigationState('detail'), {
    nextView: 'detail',
    shouldExitToLobby: false,
  });

  assert.deepEqual(getWorksDetailBackNavigationState('entry'), {
    nextView: 'entry',
    shouldExitToLobby: true,
  });
});

test('completing the loading animation transitions into reveal mode at the start of the curtain push', () => {
  assert.deepEqual(getWorksDetailCompletionState(), {
    nextPhase: 'revealing',
    nextTransitionProgress: 0,
  });
});

test('loading phase locks scroll while the viewport is inside the works detail section', () => {
  assert.equal(
    shouldLockWorksDetailScroll({
      phase: 'loading',
      scrollY: 3200,
      sectionTop: 3200,
      sectionHeight: 1800,
    }),
    true,
  );

  assert.equal(
    shouldLockWorksDetailScroll({
      phase: 'revealing',
      scrollY: 3200,
      sectionTop: 3200,
      sectionHeight: 1800,
    }),
    true,
  );

  assert.equal(
    shouldLockWorksDetailScroll({
      phase: 'revealing',
      scrollY: 3168,
      sectionTop: 3200,
      sectionHeight: 1800,
    }),
    true,
  );
});

test('late reveal state is already interactive once the entry content is fully visible', () => {
  assert.equal(isWorksDetailContentInteractive('revealing', 0.8), true);
  assert.equal(isWorksDetailContentInteractive('revealing', 0.4), false);
  assert.equal(isWorksDetailContentInteractive('settled', 1), true);
});

test('visual state keeps the background fixed and pushes the loading layer upward', () => {
  assert.deepEqual(getWorksDetailVisualState('loading', 0), {
    backgroundOpacity: 1,
    backgroundScale: 1.02,
    loadingOpacity: 1,
    loadingTranslateY: 0,
    loadingPointerEvents: 'none',
    showIframe: true,
    shouldLockScroll: true,
  });

  assert.deepEqual(getWorksDetailVisualState('revealing', 0.25), {
    backgroundOpacity: 1,
    backgroundScale: 1.0150000000000001,
    loadingOpacity: 1,
    loadingTranslateY: -25,
    loadingPointerEvents: 'none',
    showIframe: true,
    shouldLockScroll: true,
  });

  assert.deepEqual(getWorksDetailVisualState('settled', 1), {
    backgroundOpacity: 1,
    backgroundScale: 1,
    loadingOpacity: 0,
    loadingTranslateY: -100,
    loadingPointerEvents: 'none',
    showIframe: false,
    shouldLockScroll: true,
  });
});

test('pinned scroll target never goes above the document top', () => {
  assert.equal(getWorksDetailPinnedScrollY(2400), 2400);
  assert.equal(getWorksDetailPinnedScrollY(-80), 0);
});

test('small wheel deltas accumulate into a stable reveal step for the parent-driven transition', () => {
  assert.deepEqual(
    getWorksDetailWheelBufferState({
      buffer: 0,
      deltaY: 18,
      threshold: 30,
    }),
    {
      nextBuffer: 18,
      consumedSteps: 0,
      direction: 0,
    },
  );

  assert.deepEqual(
    getWorksDetailWheelBufferState({
      buffer: 18,
      deltaY: 15,
      threshold: 30,
    }),
    {
      nextBuffer: 3,
      consumedSteps: 1,
      direction: 1,
    },
  );

  assert.deepEqual(
    getWorksDetailWheelBufferState({
      buffer: -14,
      deltaY: -20,
      threshold: 30,
    }),
    {
      nextBuffer: -4,
      consumedSteps: 1,
      direction: -1,
    },
  );
});

test('revealing wheel input advances the loading curtain upward without releasing page scroll', () => {
  assert.deepEqual(
    getWorksDetailWheelState({
      phase: 'revealing',
      transitionProgress: 0.2,
      deltaY: 120,
      step: 0.18,
    }),
    {
      nextPhase: 'revealing',
      nextTransitionProgress: 0.38,
      shouldPreventScroll: true,
      shouldExitToLobby: false,
    },
  );

  assert.deepEqual(
    getWorksDetailWheelState({
      phase: 'revealing',
      transitionProgress: 0.92,
      deltaY: 120,
      step: 0.18,
    }),
    {
      nextPhase: 'settled',
      nextTransitionProgress: 1,
      shouldPreventScroll: true,
      shouldExitToLobby: false,
    },
  );
});

test('upward wheel during reveal or settled exits the workdetail interaction back to the previous interface', () => {
  assert.deepEqual(
    getWorksDetailWheelState({
      phase: 'revealing',
      transitionProgress: 0.48,
      deltaY: -120,
      step: 0.18,
    }),
    {
      nextPhase: 'idle',
      nextTransitionProgress: 0,
      shouldPreventScroll: true,
      shouldExitToLobby: true,
    },
  );

  assert.deepEqual(
    getWorksDetailWheelState({
      phase: 'settled',
      transitionProgress: 1,
      deltaY: -120,
      step: 0.18,
    }),
    {
      nextPhase: 'idle',
      nextTransitionProgress: 0,
      shouldPreventScroll: true,
      shouldExitToLobby: true,
    },
  );
});

test('detail view no longer maps upward scroll to closing the current page', () => {
  assert.deepEqual(getWorksDetailBackNavigationState('detail'), {
    nextView: 'detail',
    shouldExitToLobby: false,
  });
});

test('settled stage remains locked on downward scroll so the background can hold future actions', () => {
  assert.deepEqual(
    getWorksDetailWheelState({
      phase: 'settled',
      transitionProgress: 1,
      deltaY: 120,
      step: 0.18,
    }),
    {
      nextPhase: 'settled',
      nextTransitionProgress: 1,
      shouldPreventScroll: true,
      shouldExitToLobby: false,
    },
  );
});
