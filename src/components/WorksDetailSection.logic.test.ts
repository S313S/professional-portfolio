import test from 'node:test';
import assert from 'node:assert/strict';

import {
  closeWorksDetailView,
  getWorksDetailActivationState,
  getWorksDetailBackNavigationState,
  getWorksDetailCompletionState,
  getWorksDetailDetailModeResetState,
  getWorksDetailGalleryPlaneState,
  getWorksDetailLoadingFallbackMs,
  getWorksDetailProjectSelectionState,
  getWorksDetailSceneNavigationState,
  isWorksDetailContentInteractive,
  openWorksDetailCodingView,
  openWorksDetailDesignView,
  getWorksDetailPinnedScrollY,
  shouldAdvanceWorksDetailToNextSection,
  shouldCaptureWorksDetailWheel,
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
  assert.deepEqual(openWorksDetailDesignView('entry'), {
    nextView: 'detail',
    nextDetailMode: 'design',
  });
  assert.deepEqual(openWorksDetailCodingView('entry'), {
    nextView: 'detail',
    nextDetailMode: 'coding',
  });
  assert.equal(closeWorksDetailView('detail'), 'entry');
});

test('closing the works detail detail page resets the detail mode back to design', () => {
  assert.deepEqual(getWorksDetailDetailModeResetState('coding'), {
    nextDetailMode: 'design',
  });
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

test('completing the loading animation lands directly on the fully revealed attachment page', () => {
  assert.deepEqual(getWorksDetailCompletionState(), {
    nextPhase: 'settled',
    nextTransitionProgress: 1,
  });
});

test('loading fallback waits longer before iframe readiness and only uses the tighter timer after the animation starts', () => {
  assert.equal(getWorksDetailLoadingFallbackMs(false), 20000);
  assert.equal(getWorksDetailLoadingFallbackMs(true), 18000);
});

test('gallery visual plane only changes scale when browser zoom changes the css viewport', () => {
  const normalViewport = getWorksDetailGalleryPlaneState({
    viewportWidth: 1406,
    viewportHeight: 755,
  });
  const zoomedViewport = getWorksDetailGalleryPlaneState({
    viewportWidth: 1406 / 1.1,
    viewportHeight: 755 / 1.1,
  });

  assert.equal(normalViewport.designWidth, zoomedViewport.designWidth);
  assert.equal(normalViewport.designHeight, zoomedViewport.designHeight);
  assert.equal(normalViewport.offsetX, 0);
  assert.equal(normalViewport.offsetY, 0);
  assert.equal(zoomedViewport.offsetX, 0);
  assert.equal(zoomedViewport.offsetY, 0);
  assert.equal(Number(zoomedViewport.scale.toFixed(4)), Number((normalViewport.scale / 1.1).toFixed(4)));
});

test('loading phase locks scroll while the viewport is inside the works detail section', () => {
  assert.equal(
    shouldLockWorksDetailScroll({
      phase: 'loading',
      view: 'entry',
      detailMode: 'design',
      scrollY: 3200,
      sectionTop: 3200,
      sectionHeight: 1800,
    }),
    true,
  );

  assert.equal(
    shouldLockWorksDetailScroll({
      phase: 'revealing',
      view: 'entry',
      detailMode: 'design',
      scrollY: 3200,
      sectionTop: 3200,
      sectionHeight: 1800,
    }),
    true,
  );

  assert.equal(
    shouldLockWorksDetailScroll({
      phase: 'revealing',
      view: 'entry',
      detailMode: 'design',
      scrollY: 3168,
      sectionTop: 3200,
      sectionHeight: 1800,
    }),
    true,
  );

  assert.equal(
    shouldLockWorksDetailScroll({
      phase: 'settled',
      view: 'detail',
      detailMode: 'design',
      scrollY: 3200,
      sectionTop: 3200,
      sectionHeight: 1800,
    }),
    true,
  );
});

test('coding detail mode releases wheel scrolling back to the panel instead of hijacking it globally', () => {
  assert.equal(
    shouldCaptureWorksDetailWheel({
      phase: 'settled',
      view: 'detail',
      detailMode: 'coding',
    }),
    false,
  );

  assert.equal(
    shouldCaptureWorksDetailWheel({
      phase: 'settled',
      view: 'detail',
      detailMode: 'design',
    }),
    true,
  );
});

test('settled entry view advances to the next section on the next downward gesture once attachment page one is fully visible', () => {
  assert.equal(
    shouldAdvanceWorksDetailToNextSection({
      phase: 'settled',
      view: 'entry',
      deltaY: 120,
      nextSectionTop: 240,
      isNavigationUnlocked: false,
    }),
    false,
  );

  assert.equal(
    shouldAdvanceWorksDetailToNextSection({
      phase: 'settled',
      view: 'entry',
      deltaY: 120,
      nextSectionTop: 240,
      isNavigationUnlocked: true,
    }),
    true,
  );

  assert.equal(
    shouldAdvanceWorksDetailToNextSection({
      phase: 'settled',
      view: 'detail',
      deltaY: 120,
      nextSectionTop: 240,
    }),
    false,
  );

  assert.equal(
    shouldAdvanceWorksDetailToNextSection({
      phase: 'revealing',
      view: 'entry',
      deltaY: 120,
      nextSectionTop: 240,
    }),
    false,
  );

  assert.equal(
    shouldAdvanceWorksDetailToNextSection({
      phase: 'settled',
      view: 'entry',
      deltaY: -120,
      nextSectionTop: 240,
    }),
    false,
  );

  assert.equal(
    shouldAdvanceWorksDetailToNextSection({
      phase: 'settled',
      view: 'entry',
      deltaY: 120,
      nextSectionTop: 0,
    }),
    false,
  );

  assert.equal(
    shouldAdvanceWorksDetailToNextSection({
      phase: 'settled',
      view: 'entry',
      deltaY: 120,
      nextSectionTop: null,
    }),
    false,
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
    shouldLockScroll: false,
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

test('settled stage releases downward scroll so the next page can enter naturally', () => {
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
      shouldPreventScroll: false,
      shouldExitToLobby: false,
    },
  );
});

test('settled stage no longer requests global scroll locking', () => {
  assert.equal(
    shouldLockWorksDetailScroll({
      phase: 'settled',
      view: 'entry',
      detailMode: 'design',
      scrollY: 3200,
      sectionTop: 3200,
      sectionHeight: 1800,
    }),
    false,
  );

  assert.equal(
    shouldLockWorksDetailScroll({
      phase: 'settled',
      view: 'detail',
      detailMode: 'coding',
      scrollY: 3200,
      sectionTop: 3200,
      sectionHeight: 1800,
    }),
    false,
  );
});

test('detail gallery navigation advances through projects and clamps at the ends without entering a follow-up scene', () => {
  assert.deepEqual(
    getWorksDetailSceneNavigationState({
      scene: 'gallery',
      activeProjectIndex: 1,
      direction: 'next',
      projectCount: 5,
    }),
    {
      nextScene: 'gallery',
      nextProjectIndex: 2,
      shouldCloseDetail: false,
    },
  );

  assert.deepEqual(
    getWorksDetailSceneNavigationState({
      scene: 'gallery',
      activeProjectIndex: 4,
      direction: 'next',
      projectCount: 5,
    }),
    {
      nextScene: 'gallery',
      nextProjectIndex: 4,
      shouldCloseDetail: false,
    },
  );
});

test('project scene keeps the fullscreen preview open while browsing previous and next works', () => {
  assert.deepEqual(
    getWorksDetailSceneNavigationState({
      scene: 'project',
      activeProjectIndex: 4,
      direction: 'next',
      projectCount: 5,
    }),
    {
      nextScene: 'project',
      nextProjectIndex: 4,
      shouldCloseDetail: false,
    },
  );

  assert.deepEqual(
    getWorksDetailSceneNavigationState({
      scene: 'project',
      activeProjectIndex: 4,
      direction: 'previous',
      projectCount: 5,
    }),
    {
      nextScene: 'project',
      nextProjectIndex: 3,
      shouldCloseDetail: false,
    },
  );
});

test('backing out from the first gallery project keeps detail open and holds the first project', () => {
  assert.deepEqual(
    getWorksDetailSceneNavigationState({
      scene: 'gallery',
      activeProjectIndex: 0,
      direction: 'previous',
      projectCount: 5,
    }),
    {
      nextScene: 'gallery',
      nextProjectIndex: 0,
      shouldCloseDetail: false,
    },
  );
});

test('project selection clamps to the available featured works and keeps the gallery scene active', () => {
  assert.deepEqual(
    getWorksDetailProjectSelectionState({
      activeProjectIndex: 2,
      nextProjectIndex: 99,
      projectCount: 5,
    }),
    {
      nextScene: 'gallery',
      nextProjectIndex: 4,
    },
  );

  assert.deepEqual(
    getWorksDetailProjectSelectionState({
      activeProjectIndex: 2,
      nextProjectIndex: -4,
      projectCount: 5,
    }),
    {
      nextScene: 'gallery',
      nextProjectIndex: 0,
    },
  );
});
