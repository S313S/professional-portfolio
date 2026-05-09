export const WORKS_DETAIL_LOADING_SRC = '/detailWork-loading.html?embed=portfolio';
export const WORKS_DETAIL_REVEAL_IMAGE_SRC = '/images/workDetail_bg.jpeg';
export const WORKS_DETAIL_TRANSITION_START_EVENT = 'works-detail-transition:start';
export const WORKS_DETAIL_RETURN_TO_LOBBY_EVENT = 'works-detail:return-to-lobby';
export const WORKS_DETAIL_LOADING_BOOTSTRAP_FALLBACK_MS = 20000;
export const WORKS_DETAIL_LOADING_ANIMATION_FALLBACK_MS = 18000;
export const WORKS_DETAIL_POST_LOADING_NAVIGATION_LOCK_MS = 2400;
export const WORKS_DETAIL_INTERACTIVE_REVEAL_PROGRESS = 1 / 1.35;
export const WORKS_DETAIL_GALLERY_DESIGN_WIDTH = 1406;
export const WORKS_DETAIL_GALLERY_DESIGN_HEIGHT = 755;

export type WorksDetailPhase = 'idle' | 'loading' | 'revealing' | 'settled';
export type WorksDetailView = 'entry' | 'detail';
export type WorksDetailScene = 'gallery' | 'project';
export type WorksDetailDetailMode = 'design' | 'coding';

export interface WorksDetailActivationState {
  nextPhase: WorksDetailPhase;
  nextCycleKey: number;
  nextTransitionProgress: number;
}

export interface WorksDetailCompletionState {
  nextPhase: WorksDetailPhase;
  nextTransitionProgress: number;
}

export interface WorksDetailScrollLockInput {
  phase: WorksDetailPhase;
  view: WorksDetailView;
  detailMode: WorksDetailDetailMode;
  scrollY: number;
  sectionTop: number;
  sectionHeight: number;
}

export interface WorksDetailVisualState {
  backgroundOpacity: number;
  backgroundScale: number;
  loadingOpacity: number;
  loadingTranslateY: number;
  loadingPointerEvents: 'auto' | 'none';
  showIframe: boolean;
  shouldLockScroll: boolean;
}

export interface WorksDetailGalleryPlaneInput {
  viewportWidth: number;
  viewportHeight: number;
  designWidth?: number;
  designHeight?: number;
}

export interface WorksDetailGalleryPlaneState {
  designWidth: number;
  designHeight: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface WorksDetailBackNavigationState {
  nextView: WorksDetailView;
  shouldExitToLobby: boolean;
}

export interface WorksDetailOpenState {
  nextView: WorksDetailView;
  nextDetailMode: WorksDetailDetailMode;
}

export interface WorksDetailDetailModeResetState {
  nextDetailMode: WorksDetailDetailMode;
}

export interface WorksDetailWheelInput {
  phase: WorksDetailPhase;
  transitionProgress: number;
  deltaY: number;
  step: number;
}

export interface WorksDetailWheelBufferInput {
  buffer: number;
  deltaY: number;
  threshold: number;
}

export interface WorksDetailWheelBufferState {
  nextBuffer: number;
  consumedSteps: number;
  direction: -1 | 0 | 1;
}

export interface WorksDetailWheelState {
  nextPhase: WorksDetailPhase;
  nextTransitionProgress: number;
  shouldPreventScroll: boolean;
  shouldExitToLobby: boolean;
}

export interface WorksDetailWheelCaptureInput {
  phase: WorksDetailPhase;
  view: WorksDetailView;
  detailMode: WorksDetailDetailMode;
}

export interface WorksDetailNextSectionNavigationInput {
  phase: WorksDetailPhase;
  view: WorksDetailView;
  deltaY: number;
  nextSectionTop: number | null;
  isNavigationUnlocked?: boolean;
}

export interface WorksDetailSceneNavigationInput {
  scene: WorksDetailScene;
  activeProjectIndex: number;
  direction: 'next' | 'previous';
  projectCount: number;
}

export interface WorksDetailSceneNavigationState {
  nextScene: WorksDetailScene;
  nextProjectIndex: number;
  shouldCloseDetail: boolean;
}

export interface WorksDetailProjectSelectionInput {
  activeProjectIndex: number;
  nextProjectIndex: number;
  projectCount: number;
}

export interface WorksDetailProjectSelectionState {
  nextScene: WorksDetailScene;
  nextProjectIndex: number;
}

export function getWorksDetailLoadingFallbackMs(hasIframeReportedReady: boolean) {
  return hasIframeReportedReady
    ? WORKS_DETAIL_LOADING_ANIMATION_FALLBACK_MS
    : WORKS_DETAIL_LOADING_BOOTSTRAP_FALLBACK_MS;
}

export function getWorksDetailGalleryPlaneState({
  viewportWidth,
  viewportHeight,
  designWidth = WORKS_DETAIL_GALLERY_DESIGN_WIDTH,
  designHeight = WORKS_DETAIL_GALLERY_DESIGN_HEIGHT,
}: WorksDetailGalleryPlaneInput): WorksDetailGalleryPlaneState {
  const safeDesignWidth = Math.max(designWidth, 1);
  const safeDesignHeight = Math.max(designHeight, 1);
  const safeViewportWidth = Math.max(viewportWidth, 1);
  const safeViewportHeight = Math.max(viewportHeight, 1);
  const scale = Math.max(
    safeViewportWidth / safeDesignWidth,
    safeViewportHeight / safeDesignHeight,
  );
  const normalizeOffset = (offset: number) => (Math.abs(offset) < 0.0001 ? 0 : offset);

  return {
    designWidth: safeDesignWidth,
    designHeight: safeDesignHeight,
    scale,
    offsetX: normalizeOffset((safeViewportWidth - safeDesignWidth * scale) / 2),
    offsetY: normalizeOffset((safeViewportHeight - safeDesignHeight * scale) / 2),
  };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

function getClampedProjectIndex(activeProjectIndex: number, projectCount: number) {
  if (projectCount <= 0) {
    return 0;
  }

  return clamp(activeProjectIndex, 0, projectCount - 1);
}

export function openWorksDetailDesignView(_currentView: WorksDetailView): WorksDetailOpenState {
  return {
    nextView: 'detail',
    nextDetailMode: 'design',
  };
}

export function openWorksDetailCodingView(_currentView: WorksDetailView): WorksDetailOpenState {
  return {
    nextView: 'detail',
    nextDetailMode: 'coding',
  };
}

export function closeWorksDetailView(_currentView: WorksDetailView): WorksDetailView {
  return 'entry';
}

export function getWorksDetailDetailModeResetState(
  _currentDetailMode: WorksDetailDetailMode,
): WorksDetailDetailModeResetState {
  return {
    nextDetailMode: 'design',
  };
}

export function getWorksDetailBackNavigationState(
  currentView: WorksDetailView,
): WorksDetailBackNavigationState {
  if (currentView === 'detail') {
    return {
      nextView: 'detail',
      shouldExitToLobby: false,
    };
  }

  return {
    nextView: 'entry',
    shouldExitToLobby: true,
  };
}

export function getWorksDetailActivationState(previousCycleKey = 0): WorksDetailActivationState {
  return {
    nextPhase: 'loading',
    nextCycleKey: previousCycleKey + 1,
    nextTransitionProgress: 0,
  };
}

export function getWorksDetailCompletionState(): WorksDetailCompletionState {
  return {
    nextPhase: 'settled',
    nextTransitionProgress: 1,
  };
}

export function getWorksDetailPinnedScrollY(sectionTop: number) {
  return Math.max(Math.round(sectionTop), 0);
}

export function isWorksDetailContentInteractive(
  phase: WorksDetailPhase,
  transitionProgress: number,
) {
  if (phase === 'settled') {
    return true;
  }

  if (phase !== 'revealing') {
    return false;
  }

  return clamp(transitionProgress, 0, 1) >= WORKS_DETAIL_INTERACTIVE_REVEAL_PROGRESS;
}

export function getWorksDetailWheelBufferState({
  buffer,
  deltaY,
  threshold,
}: WorksDetailWheelBufferInput): WorksDetailWheelBufferState {
  if (deltaY === 0 || threshold <= 0) {
    return {
      nextBuffer: buffer,
      consumedSteps: 0,
      direction: 0,
    };
  }

  const nextRawBuffer = buffer + deltaY;
  const direction = Math.sign(nextRawBuffer) as -1 | 0 | 1;
  const consumedSteps = Math.trunc(Math.abs(nextRawBuffer) / threshold);

  if (direction === 0 || consumedSteps === 0) {
    return {
      nextBuffer: nextRawBuffer,
      consumedSteps: 0,
      direction: 0,
    };
  }

  return {
    nextBuffer: nextRawBuffer - direction * consumedSteps * threshold,
    consumedSteps,
    direction,
  };
}

export function shouldLockWorksDetailScroll({
  phase,
  view,
  detailMode,
  scrollY: _scrollY,
  sectionTop: _sectionTop,
  sectionHeight,
}: WorksDetailScrollLockInput) {
  if (phase === 'idle' || sectionHeight <= 0) {
    return false;
  }

  if (phase === 'settled') {
    return view === 'detail' && detailMode !== 'coding';
  }

  return true;
}

export function shouldCaptureWorksDetailWheel({
  phase,
  view,
  detailMode,
}: WorksDetailWheelCaptureInput) {
  if (phase === 'loading') {
    return true;
  }

  if (view === 'detail' && detailMode === 'coding') {
    return false;
  }

  return true;
}

export function shouldAdvanceWorksDetailToNextSection({
  phase,
  view,
  deltaY,
  nextSectionTop,
  isNavigationUnlocked = true,
}: WorksDetailNextSectionNavigationInput) {
  return (
    isNavigationUnlocked &&
    phase === 'settled' &&
    view === 'entry' &&
    deltaY > 0 &&
    nextSectionTop !== null &&
    nextSectionTop > 0
  );
}

export function getWorksDetailWheelState({
  phase,
  transitionProgress,
  deltaY,
  step,
}: WorksDetailWheelInput): WorksDetailWheelState {
  if (deltaY === 0) {
    return {
      nextPhase: phase,
      nextTransitionProgress: transitionProgress,
      shouldPreventScroll: false,
      shouldExitToLobby: false,
    };
  }

  if (phase === 'loading') {
    return {
      nextPhase: 'loading',
      nextTransitionProgress: 0,
      shouldPreventScroll: true,
      shouldExitToLobby: false,
    };
  }

  if (phase === 'settled') {
    if (deltaY < 0) {
      return {
        nextPhase: 'idle',
        nextTransitionProgress: 0,
        shouldPreventScroll: true,
        shouldExitToLobby: true,
      };
    }

    return {
      nextPhase: 'settled',
      nextTransitionProgress: 1,
      shouldPreventScroll: false,
      shouldExitToLobby: false,
    };
  }

  if (phase !== 'revealing') {
    return {
      nextPhase: phase,
      nextTransitionProgress: transitionProgress,
      shouldPreventScroll: false,
      shouldExitToLobby: false,
    };
  }

  if (deltaY < 0) {
    return {
      nextPhase: 'idle',
      nextTransitionProgress: 0,
      shouldPreventScroll: true,
      shouldExitToLobby: true,
    };
  }

  const normalizedDelta = deltaY / 120;
  const nextTransitionProgress = clamp(transitionProgress + normalizedDelta * step, 0, 1);

  return {
    nextPhase: nextTransitionProgress >= 1 ? 'settled' : 'revealing',
    nextTransitionProgress,
    shouldPreventScroll: true,
    shouldExitToLobby: false,
  };
}

export function getWorksDetailVisualState(
  phase: WorksDetailPhase,
  transitionProgress: number,
): WorksDetailVisualState {
  const safeProgress = clamp(transitionProgress, 0, 1);

  if (phase === 'idle' || phase === 'loading') {
    return {
      backgroundOpacity: 1,
      backgroundScale: 1.02,
      loadingOpacity: phase === 'loading' ? 1 : 0,
      loadingTranslateY: 0,
      loadingPointerEvents: 'none',
      showIframe: phase === 'loading',
      shouldLockScroll: phase === 'loading',
    };
  }

  if (phase === 'settled') {
    return {
      backgroundOpacity: 1,
      backgroundScale: 1,
      loadingOpacity: 0,
      loadingTranslateY: -100,
      loadingPointerEvents: 'none',
      showIframe: false,
      shouldLockScroll: false,
    };
  }

  return {
    backgroundOpacity: 1,
    backgroundScale: 1.02 - safeProgress * 0.02,
    loadingOpacity: 1,
    loadingTranslateY: safeProgress * -100,
    loadingPointerEvents: 'none',
    showIframe: true,
    shouldLockScroll: true,
  };
}

export function getWorksDetailSceneNavigationState({
  scene,
  activeProjectIndex,
  direction,
  projectCount,
}: WorksDetailSceneNavigationInput): WorksDetailSceneNavigationState {
  const safeProjectIndex = getClampedProjectIndex(activeProjectIndex, projectCount);
  const lastProjectIndex = Math.max(projectCount - 1, 0);

  if (scene === 'gallery') {
    if (direction === 'next') {
      return {
        nextScene: 'gallery',
        nextProjectIndex: Math.min(safeProjectIndex + 1, lastProjectIndex),
        shouldCloseDetail: false,
      };
    }

    return {
      nextScene: 'gallery',
      nextProjectIndex: Math.max(safeProjectIndex - 1, 0),
      shouldCloseDetail: false,
    };
  }

  return {
    nextScene: 'project',
    nextProjectIndex:
      direction === 'next'
        ? Math.min(safeProjectIndex + 1, lastProjectIndex)
        : Math.max(safeProjectIndex - 1, 0),
    shouldCloseDetail: false,
  };
}

export function getWorksDetailProjectSelectionState({
  activeProjectIndex: _activeProjectIndex,
  nextProjectIndex,
  projectCount,
}: WorksDetailProjectSelectionInput): WorksDetailProjectSelectionState {
  return {
    nextScene: 'gallery',
    nextProjectIndex: getClampedProjectIndex(nextProjectIndex, projectCount),
  };
}
