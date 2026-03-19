import test from 'node:test';
import assert from 'node:assert/strict';

import * as growPathLogic from './GrowPathScrollSection.logic.ts';

import {
  DEFAULT_GROW_PATH_SCROLL_STATE,
  DEFAULT_GROW_PATH_WHEEL_STEP,
  GROW_PATH_CARD_IDS,
  getGrowPathCardVisuals,
  getGrowPathWheelCaptureState,
  getGrowPathWheelState,
} from './GrowPathScrollSection.logic.ts';

const getVisibleCardIds = (progress: number) =>
  GROW_PATH_CARD_IDS.filter((cardId) => getGrowPathCardVisuals(progress)[cardId].opacity > 0.01);

test('initial state shows only the background stage', () => {
  assert.deepEqual(DEFAULT_GROW_PATH_SCROLL_STATE, {
    progress: 0,
  });

  assert.deepEqual(getVisibleCardIds(0), []);
});

test('first reveal segment only shows card 1', () => {
  assert.deepEqual(getVisibleCardIds(0.22), ['growPath_01']);
});

test('second reveal segment shows cards 1 and 2', () => {
  assert.deepEqual(getVisibleCardIds(0.46), ['growPath_01', 'growPath_02']);
});

test('third reveal segment shows cards 1 to 3', () => {
  assert.deepEqual(getVisibleCardIds(0.66), ['growPath_01', 'growPath_02', 'growPath_03']);
});

test('fourth reveal segment shows all cards', () => {
  assert.deepEqual(getVisibleCardIds(0.88), [
    'growPath_01',
    'growPath_02',
    'growPath_03',
    'growPath_04',
  ]);
});

test('wheel progress clamps to one while scrolling down', () => {
  const wheelState = getGrowPathWheelState({
    state: {
      progress: 0.94,
    },
    deltaY: 120,
    step: DEFAULT_GROW_PATH_WHEEL_STEP,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.deepEqual(wheelState.nextState, {
    progress: 1,
  });
});

test('wheel progress clamps to zero while scrolling up', () => {
  const wheelState = getGrowPathWheelState({
    state: {
      progress: 0.05,
    },
    deltaY: -120,
    step: DEFAULT_GROW_PATH_WHEEL_STEP,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.deepEqual(wheelState.nextState, {
    progress: 0,
  });
});

test('downward wheel advances progress and prevents native scroll before completion', () => {
  const wheelState = getGrowPathWheelState({
    state: {
      progress: 0.4,
    },
    deltaY: 120,
    step: DEFAULT_GROW_PATH_WHEEL_STEP,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.ok(wheelState.nextState.progress > 0.4);
  assert.ok(wheelState.nextState.progress < 1);
});

test('upward wheel rewinds progress until the stage returns to background only', () => {
  const wheelState = getGrowPathWheelState({
    state: {
      progress: 0.12,
    },
    deltaY: -120,
    step: DEFAULT_GROW_PATH_WHEEL_STEP,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.deepEqual(wheelState.nextState, {
    progress: 0,
  });
  assert.deepEqual(getVisibleCardIds(wheelState.nextState.progress), []);
});

test('completed state releases native downward scrolling', () => {
  const wheelState = getGrowPathWheelState({
    state: {
      progress: 1,
    },
    deltaY: 120,
    step: DEFAULT_GROW_PATH_WHEEL_STEP,
  });

  assert.equal(wheelState.shouldPreventScroll, false);
  assert.deepEqual(wheelState.nextState, {
    progress: 1,
  });
});

test('does not capture wheel input before the grow-path section reaches the viewport top', () => {
  const captureState = getGrowPathWheelCaptureState({
    scrollY: 980,
    sectionTop: 1000,
    sectionHeight: 900,
    state: {
      progress: 0.32,
    },
    deltaY: 120,
    step: DEFAULT_GROW_PATH_WHEEL_STEP,
  });

  assert.equal(captureState.shouldPreventScroll, false);
  assert.equal(captureState.targetScrollY, null);
  assert.deepEqual(captureState.nextState, {
    progress: 0.32,
  });
});

test('captures wheel input at the section top and pins scroll until the animation completes', () => {
  const captureState = getGrowPathWheelCaptureState({
    scrollY: 1001,
    sectionTop: 1000,
    sectionHeight: 900,
    state: {
      progress: 0.52,
    },
    deltaY: 120,
    step: DEFAULT_GROW_PATH_WHEEL_STEP,
  });

  assert.equal(captureState.shouldPreventScroll, true);
  assert.equal(captureState.targetScrollY, 1000);
  assert.ok(captureState.nextState.progress > 0.52);
  assert.ok(captureState.nextState.progress < 1);
});

test('captures wheel input when the user has already scrolled into the section viewport from the previous page', () => {
  const captureState = getGrowPathWheelCaptureState({
    scrollY: 1240,
    sectionTop: 1000,
    sectionHeight: 900,
    state: {
      progress: 0.18,
    },
    deltaY: 120,
    step: DEFAULT_GROW_PATH_WHEEL_STEP,
  });

  assert.equal(captureState.shouldPreventScroll, true);
  assert.equal(captureState.targetScrollY, 1000);
  assert.ok(captureState.nextState.progress > 0.18);
});

test('does not capture wheel input once the user has already scrolled past the section viewport', () => {
  const captureState = getGrowPathWheelCaptureState({
    scrollY: 1910,
    sectionTop: 1000,
    sectionHeight: 900,
    state: {
      progress: 0.18,
    },
    deltaY: 120,
    step: DEFAULT_GROW_PATH_WHEEL_STEP,
  });

  assert.equal(captureState.shouldPreventScroll, false);
  assert.equal(captureState.targetScrollY, null);
  assert.deepEqual(captureState.nextState, {
    progress: 0.18,
  });
});

test('focus mode stays disabled until the grow-path stack is fully expanded', () => {
  assert.equal(typeof (growPathLogic as Record<string, unknown>).canFocusGrowPathCard, 'function');

  const canFocusGrowPathCard = (
    growPathLogic as unknown as {
      canFocusGrowPathCard: (progress: number) => boolean;
    }
  ).canFocusGrowPathCard;

  assert.equal(canFocusGrowPathCard(0.99), false);
  assert.equal(canFocusGrowPathCard(1), true);
});

test('focus visuals elevate the selected card and soften every unselected card', () => {
  assert.equal(typeof (growPathLogic as Record<string, unknown>).getGrowPathFocusVisuals, 'function');

  const getGrowPathFocusVisuals = (
    growPathLogic as unknown as {
      getGrowPathFocusVisuals: (
        selectedCardId: string,
      ) => Record<string, Record<string, number | string | boolean>>;
    }
  ).getGrowPathFocusVisuals;

  const visuals = getGrowPathFocusVisuals('growPath_02');
  const selectedVisual = visuals.growPath_02;
  const backgroundVisual = visuals.growPath_01;

  assert.equal(selectedVisual.isSelected, true);
  assert.equal(selectedVisual.scale, 1.14);
  assert.equal(selectedVisual.rotate, 0);
  assert.equal(selectedVisual.filter, 'none');
  assert.equal(selectedVisual.zIndex, 30);

  assert.equal(backgroundVisual.isSelected, false);
  assert.equal(backgroundVisual.scale, 0.96);
  assert.equal(backgroundVisual.translateY, 10);
  assert.equal(backgroundVisual.opacity, 0.62);
  assert.equal(backgroundVisual.filter, 'blur(4px) saturate(0.88) brightness(0.96)');
  assert.equal(backgroundVisual.pointerEventsEnabled, false);
});

test('focus-wheel state closes the selected card and releases native scrolling', () => {
  assert.equal(typeof (growPathLogic as Record<string, unknown>).getGrowPathFocusWheelState, 'function');

  const getGrowPathFocusWheelState = (
    growPathLogic as unknown as {
      getGrowPathFocusWheelState: (selectedCardId: string | null) => {
        nextSelectedCardId: string | null;
        shouldPreventScroll: boolean;
      };
    }
  ).getGrowPathFocusWheelState;

  assert.deepEqual(getGrowPathFocusWheelState('growPath_03'), {
    nextSelectedCardId: null,
    shouldPreventScroll: false,
  });

  assert.deepEqual(getGrowPathFocusWheelState(null), {
    nextSelectedCardId: null,
    shouldPreventScroll: false,
  });
});
