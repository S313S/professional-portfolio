export type WorksLobbyPhase = 'revealing' | 'holding' | 'navigating';

export interface WorksLobbyScrollState {
  phase: WorksLobbyPhase;
  progress: number;
}

export interface WorksLobbyScrollMountInput {
  scrollY: number;
  lastScrollY: number;
  sectionTop: number;
  sectionHeight: number;
  viewportHeight: number;
  hasSnappedOnCurrentEntry: boolean;
  isMobile: boolean;
}

export interface WorksLobbyScrollMountState {
  shouldSnap: boolean;
  shouldResetLatch: boolean;
}

export interface WorksLobbyWheelInput {
  state: WorksLobbyScrollState;
  deltaY: number;
  step: number;
  isDesktopPinned: boolean;
  isMobile: boolean;
}

export interface WorksLobbyWheelState {
  nextState: WorksLobbyScrollState;
  shouldPreventScroll: boolean;
}

export interface WorksLobbyWheelCaptureInput {
  scrollY: number;
  sectionTop: number;
  sectionHeight: number;
  state: WorksLobbyScrollState;
  deltaY: number;
  step: number;
  isMobile: boolean;
}

export interface WorksLobbyWheelCaptureState {
  nextState: WorksLobbyScrollState;
  shouldPreventScroll: boolean;
  targetScrollY: number | null;
}

export interface WorksLobbyTouchInput {
  state: WorksLobbyScrollState;
  deltaY: number;
  step: number;
}

export interface WorksLobbyTouchState {
  nextState: WorksLobbyScrollState;
  shouldPreventScroll: boolean;
}

export interface WorksLobbyVisualState {
  imageOpacity: number;
  videoOpacity: number;
  showButton: boolean;
  isLocked: boolean;
  imageTitleOpacity: number;
  videoTitleOpacity: number;
  showImageEyebrow: boolean;
  videoTitleText: string;
}

export const DEFAULT_WORKS_LOBBY_SCROLL_STATE: WorksLobbyScrollState = {
  phase: 'revealing',
  progress: 0,
};

export const DEFAULT_WORKS_LOBBY_WHEEL_STEP = 0.14;

const WORKS_LOBBY_HOLDING_THRESHOLD = 0.98;
const WORKS_LOBBY_SNAP_ENTRY_MAX_RATIO = 0.32;
const WORKS_LOBBY_SNAP_ENTRY_MIN_RATIO = -0.08;
const WORKS_LOBBY_SNAP_RESET_ABOVE_RATIO = 0.6;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function getWorksLobbyPhaseForProgress(progress: number): WorksLobbyPhase {
  return clamp(progress, 0, 1) >= WORKS_LOBBY_HOLDING_THRESHOLD ? 'holding' : 'revealing';
}

export function getWorksLobbyScrollTargetY(sectionTop: number) {
  return Math.max(Math.round(sectionTop), 0);
}

export function getWorksLobbyNavigationTargetY(sectionTop: number) {
  return getWorksLobbyScrollTargetY(sectionTop);
}

export function getWorksLobbyScrollMountState({
  scrollY,
  lastScrollY,
  sectionTop,
  sectionHeight,
  viewportHeight,
  hasSnappedOnCurrentEntry,
  isMobile,
}: WorksLobbyScrollMountInput): WorksLobbyScrollMountState {
  if (isMobile || viewportHeight <= 0 || sectionHeight <= 0) {
    return {
      shouldSnap: false,
      shouldResetLatch: false,
    };
  }

  const sectionBottom = sectionTop + sectionHeight;
  const shouldResetLatch =
    hasSnappedOnCurrentEntry &&
    (scrollY <= sectionTop - viewportHeight * WORKS_LOBBY_SNAP_RESET_ABOVE_RATIO ||
      scrollY >= sectionBottom);

  if (hasSnappedOnCurrentEntry || scrollY <= lastScrollY) {
    return {
      shouldSnap: false,
      shouldResetLatch,
    };
  }

  const topOffset = sectionTop - scrollY;
  const shouldSnap =
    topOffset <= viewportHeight * WORKS_LOBBY_SNAP_ENTRY_MAX_RATIO &&
    topOffset >= viewportHeight * WORKS_LOBBY_SNAP_ENTRY_MIN_RATIO;

  return {
    shouldSnap,
    shouldResetLatch,
  };
}

const getRevealingState = (progress: number): WorksLobbyScrollState => ({
  phase: getWorksLobbyPhaseForProgress(progress),
  progress: getWorksLobbyPhaseForProgress(progress) === 'holding' ? 1 : progress,
});

export function getWorksLobbyWheelState({
  state,
  deltaY,
  step,
  isDesktopPinned,
  isMobile,
}: WorksLobbyWheelInput): WorksLobbyWheelState {
  if (isMobile || !isDesktopPinned || deltaY === 0 || state.phase === 'navigating') {
    return {
      nextState: state,
      shouldPreventScroll: false,
    };
  }

  const safeProgress = clamp(state.progress, 0, 1);
  const normalizedDelta = deltaY / 120;

  if (state.phase === 'holding') {
    if (normalizedDelta > 0) {
      return {
        nextState: {
          phase: 'holding',
          progress: 1,
        },
        shouldPreventScroll: true,
      };
    }

    const nextProgress = clamp(safeProgress + normalizedDelta * step, 0, 1);
    return {
      nextState: getRevealingState(nextProgress),
      shouldPreventScroll: true,
    };
  }

  if ((normalizedDelta > 0 && safeProgress >= 1) || (normalizedDelta < 0 && safeProgress <= 0)) {
    return {
      nextState: state,
      shouldPreventScroll: false,
    };
  }

  const nextProgress = clamp(safeProgress + normalizedDelta * step, 0, 1);

  return {
    nextState: getRevealingState(nextProgress),
    shouldPreventScroll: true,
  };
}

export function getWorksLobbyWheelCaptureState({
  scrollY,
  sectionTop,
  sectionHeight,
  state,
  deltaY,
  step,
  isMobile,
}: WorksLobbyWheelCaptureInput): WorksLobbyWheelCaptureState {
  const sectionBottom = sectionTop + sectionHeight;
  const isInsideSection = scrollY >= sectionTop && scrollY < sectionBottom;

  if (isMobile || !isInsideSection || state.phase === 'navigating') {
    return {
      nextState: state,
      shouldPreventScroll: false,
      targetScrollY: null,
    };
  }

  const wheelState = getWorksLobbyWheelState({
    state,
    deltaY,
    step,
    isDesktopPinned: true,
    isMobile,
  });

  if (!wheelState.shouldPreventScroll) {
    return {
      nextState: state,
      shouldPreventScroll: false,
      targetScrollY: null,
    };
  }

  return {
    nextState: wheelState.nextState,
    shouldPreventScroll: true,
    targetScrollY: getWorksLobbyScrollTargetY(sectionTop),
  };
}

export function getWorksLobbyTouchState({
  state,
  deltaY,
  step,
}: WorksLobbyTouchInput): WorksLobbyTouchState {
  if (state.phase !== 'holding') {
    return {
      nextState: state,
      shouldPreventScroll: false,
    };
  }

  if (deltaY <= 0) {
    return {
      nextState: {
        phase: 'holding',
        progress: 1,
      },
      shouldPreventScroll: true,
    };
  }

  return {
    nextState: getRevealingState(clamp(state.progress - step, 0, 1)),
    shouldPreventScroll: false,
  };
}

export function getWorksLobbyVisualState(state: WorksLobbyScrollState): WorksLobbyVisualState {
  const safeProgress = clamp(state.progress, 0, 1);
  const imageOpacity = clamp(1 - safeProgress * 1.2, 0, 1);
  const videoOpacity = clamp(0.16 + safeProgress * 0.84, 0.16, 1);
  const imageTitleOpacity = clamp(1 - safeProgress, 0, 1);
  const videoTitleOpacity = clamp(safeProgress, 0, 1);

  return {
    imageOpacity,
    videoOpacity,
    showButton: state.phase !== 'revealing',
    isLocked: state.phase !== 'navigating',
    imageTitleOpacity,
    videoTitleOpacity,
    showImageEyebrow: state.phase === 'revealing',
    videoTitleText: 'Built Through Days and Nights',
  };
}
