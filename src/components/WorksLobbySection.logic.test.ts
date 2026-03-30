import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DEFAULT_WORKS_LOBBY_SCROLL_STATE,
  DEFAULT_WORKS_LOBBY_WHEEL_STEP,
  getWorksLobbyNavigationTargetY,
  getWorksLobbyPhaseForProgress,
  getWorksLobbyWheelCaptureState,
  getWorksLobbyScrollMountState,
  getWorksLobbyScrollTargetY,
  getWorksLobbyTouchState,
  getWorksLobbyVisualState,
  getWorksLobbyWheelState,
} from './WorksLobbySection.logic.ts';

test('requests a downward snap when the works lobby enters the desktop entry band', () => {
  const mountState = getWorksLobbyScrollMountState({
    scrollY: 3180,
    lastScrollY: 3100,
    sectionTop: 3400,
    sectionHeight: 1000,
    viewportHeight: 1000,
    hasSnappedOnCurrentEntry: false,
    isMobile: false,
  });

  assert.equal(mountState.shouldSnap, true);
  assert.equal(mountState.shouldResetLatch, false);
});

test('does not request a snap before the section reaches the entry band', () => {
  const mountState = getWorksLobbyScrollMountState({
    scrollY: 2200,
    lastScrollY: 2100,
    sectionTop: 3400,
    sectionHeight: 1000,
    viewportHeight: 1000,
    hasSnappedOnCurrentEntry: false,
    isMobile: false,
  });

  assert.equal(mountState.shouldSnap, false);
});

test('does not request a snap while scrolling upward or on mobile', () => {
  assert.deepEqual(
    getWorksLobbyScrollMountState({
      scrollY: 3180,
      lastScrollY: 3260,
      sectionTop: 3400,
      sectionHeight: 1000,
      viewportHeight: 1000,
      hasSnappedOnCurrentEntry: false,
      isMobile: false,
    }),
    {
      shouldSnap: false,
      shouldResetLatch: false,
    },
  );

  assert.deepEqual(
    getWorksLobbyScrollMountState({
      scrollY: 3180,
      lastScrollY: 3100,
      sectionTop: 3400,
      sectionHeight: 1000,
      viewportHeight: 1000,
      hasSnappedOnCurrentEntry: false,
      isMobile: true,
    }),
    {
      shouldSnap: false,
      shouldResetLatch: false,
    },
  );
});

test('completed latch resets after scrolling back above the lobby or past it', () => {
  assert.deepEqual(
    getWorksLobbyScrollMountState({
      scrollY: 2600,
      lastScrollY: 2700,
      sectionTop: 3400,
      sectionHeight: 1000,
      viewportHeight: 1000,
      hasSnappedOnCurrentEntry: true,
      isMobile: false,
    }),
    {
      shouldSnap: false,
      shouldResetLatch: true,
    },
  );

  assert.deepEqual(
    getWorksLobbyScrollMountState({
      scrollY: 4500,
      lastScrollY: 4400,
      sectionTop: 3400,
      sectionHeight: 1000,
      viewportHeight: 1000,
      hasSnappedOnCurrentEntry: true,
      isMobile: false,
    }),
    {
      shouldSnap: false,
      shouldResetLatch: true,
    },
  );
});

test('scroll target aligns to the section top', () => {
  assert.equal(getWorksLobbyScrollTargetY(3400), 3400);
  assert.equal(getWorksLobbyScrollTargetY(-24), 0);
});

test('desktop wheel advances progress and prevents native scroll before the lobby reaches holding', () => {
  const wheelState = getWorksLobbyWheelState({
    state: DEFAULT_WORKS_LOBBY_SCROLL_STATE,
    deltaY: 120,
    step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
    isDesktopPinned: true,
    isMobile: false,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.ok(wheelState.nextState.progress > 0);
  assert.ok(wheelState.nextState.progress < 1);
  assert.equal(wheelState.nextState.phase, 'revealing');
});

test('desktop wheel enters holding at completion and keeps downward scrolling locked', () => {
  const holdingState = getWorksLobbyWheelState({
    state: {
      phase: 'revealing',
      progress: 0.96,
    },
    deltaY: 120,
    step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
    isDesktopPinned: true,
    isMobile: false,
  });

  assert.deepEqual(holdingState, {
    shouldPreventScroll: true,
    nextState: {
      phase: 'holding',
      progress: 1,
    },
  });

  assert.deepEqual(
    getWorksLobbyWheelState({
      state: {
        phase: 'holding',
        progress: 1,
      },
      deltaY: 120,
      step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
      isDesktopPinned: true,
      isMobile: false,
    }),
    {
      shouldPreventScroll: true,
      nextState: {
        phase: 'holding',
        progress: 1,
      },
    },
  );
});

test('holding wheel input rewinds upward back into revealing instead of releasing the page', () => {
  const rewindState = getWorksLobbyWheelState({
    state: {
      phase: 'holding',
      progress: 1,
    },
    deltaY: -120,
    step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
    isDesktopPinned: true,
    isMobile: false,
  });

  assert.equal(rewindState.shouldPreventScroll, true);
  assert.equal(rewindState.nextState.phase, 'revealing');
  assert.ok(rewindState.nextState.progress < 1);
});

test('wheel input does not capture when the lobby is not pinned or is mobile', () => {
  assert.deepEqual(
    getWorksLobbyWheelState({
      state: {
        phase: 'revealing',
        progress: 0.42,
      },
      deltaY: 120,
      step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
      isDesktopPinned: false,
      isMobile: false,
    }),
    {
      shouldPreventScroll: false,
      nextState: {
        phase: 'revealing',
        progress: 0.42,
      },
    },
  );

  assert.deepEqual(
    getWorksLobbyWheelState({
      state: {
        phase: 'holding',
        progress: 0.42,
      },
      deltaY: 120,
      step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
      isDesktopPinned: true,
      isMobile: true,
    }),
    {
      shouldPreventScroll: false,
      nextState: {
        phase: 'holding',
        progress: 0.42,
      },
    },
  );
});

test('downward wheel input captures and repins when refresh restores scroll inside the works lobby section', () => {
  assert.deepEqual(
    getWorksLobbyWheelCaptureState({
      scrollY: 3560,
      sectionTop: 3400,
      sectionHeight: 1000,
      state: {
        phase: 'revealing',
        progress: 0,
      },
      deltaY: 120,
      step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
      isMobile: false,
    }),
    {
      shouldPreventScroll: true,
      targetScrollY: 3400,
      nextState: {
        phase: 'revealing',
        progress: 0.14,
      },
    },
  );
});

test('wheel capture does not repin when the user is outside the works lobby section or already navigating', () => {
  assert.deepEqual(
    getWorksLobbyWheelCaptureState({
      scrollY: 4480,
      sectionTop: 3400,
      sectionHeight: 1000,
      state: {
        phase: 'revealing',
        progress: 0.4,
      },
      deltaY: 120,
      step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
      isMobile: false,
    }),
    {
      shouldPreventScroll: false,
      targetScrollY: null,
      nextState: {
        phase: 'revealing',
        progress: 0.4,
      },
    },
  );

  assert.deepEqual(
    getWorksLobbyWheelCaptureState({
      scrollY: 3560,
      sectionTop: 3400,
      sectionHeight: 1000,
      state: {
        phase: 'navigating',
        progress: 1,
      },
      deltaY: 120,
      step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
      isMobile: false,
    }),
    {
      shouldPreventScroll: false,
      targetScrollY: null,
      nextState: {
        phase: 'navigating',
        progress: 1,
      },
    },
  );
});

test('maps progress to revealing or holding phase', () => {
  assert.equal(getWorksLobbyPhaseForProgress(0), 'revealing');
  assert.equal(getWorksLobbyPhaseForProgress(0.97), 'revealing');
  assert.equal(getWorksLobbyPhaseForProgress(1), 'holding');
});

test('maps visual state from gated lobby state to image fade, video reveal, and button visibility', () => {
  assert.deepEqual(
    getWorksLobbyVisualState({
      phase: 'revealing',
      progress: 0,
    }),
    {
      imageOpacity: 1,
      videoOpacity: 0.16,
      showButton: false,
      isLocked: true,
    },
  );

  assert.deepEqual(
    getWorksLobbyVisualState({
      phase: 'holding',
      progress: 1,
    }),
    {
      imageOpacity: 0,
      videoOpacity: 1,
      showButton: true,
      isLocked: true,
    },
  );
});

test('touch state keeps holding locked on downward gestures and rewinds on upward gestures', () => {
  assert.deepEqual(
    getWorksLobbyTouchState({
      state: {
        phase: 'holding',
        progress: 1,
      },
      deltaY: -48,
      step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
    }),
    {
      shouldPreventScroll: true,
      nextState: {
        phase: 'holding',
        progress: 1,
      },
    },
  );

  const rewindState = getWorksLobbyTouchState({
    state: {
      phase: 'holding',
      progress: 1,
    },
    deltaY: 48,
    step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
  });

  assert.equal(rewindState.shouldPreventScroll, false);
  assert.equal(rewindState.nextState.phase, 'revealing');
  assert.ok(rewindState.nextState.progress < 1);
});

test('works detail navigation target aligns to the next section top', () => {
  assert.equal(getWorksLobbyNavigationTargetY(4800), 4800);
  assert.equal(getWorksLobbyNavigationTargetY(-8), 0);
});
