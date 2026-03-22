export type GrowPathCardId =
  | 'growPath_01'
  | 'growPath_02'
  | 'growPath_03'
  | 'growPath_04';

export interface GrowPathScrollState {
  progress: number;
}

export interface GrowPathCardVisual {
  opacity: number;
  translateX: number;
  translateY: number;
  scale: number;
  rotate: number;
  zIndex: number;
}

export interface GrowPathFocusCardVisual {
  isSelected: boolean;
  opacity: number;
  scale: number;
  rotate: number;
  translateY: number;
  filter: string;
  zIndex: number;
  pointerEventsEnabled: boolean;
}

export interface GrowPathWheelInput {
  state: GrowPathScrollState;
  deltaY: number;
  step: number;
}

export interface GrowPathWheelState {
  nextState: GrowPathScrollState;
  shouldPreventScroll: boolean;
}

export interface GrowPathWheelCaptureInput extends GrowPathWheelInput {
  scrollY: number;
  sectionTop: number;
  sectionHeight: number;
  tolerance?: number;
}

export interface GrowPathWheelCaptureState extends GrowPathWheelState {
  targetScrollY: number | null;
}

export interface GrowPathFocusWheelState {
  nextSelectedCardId: GrowPathCardId | null;
  shouldPreventScroll: boolean;
}

export interface GrowPathCareerSnapInput {
  scrollY: number;
  lastScrollY: number;
  growPathTop: number;
  growPathHeight: number;
  careerTop: number;
  viewportHeight: number;
  growPathProgress: number;
  hasSnappedOnCurrentExit: boolean;
}

export interface GrowPathCareerSnapState {
  shouldSnap: boolean;
  shouldResetLatch: boolean;
}

export const GROW_PATH_CARD_IDS: GrowPathCardId[] = [
  'growPath_01',
  'growPath_02',
  'growPath_03',
  'growPath_04',
];

export const DEFAULT_GROW_PATH_WHEEL_STEP = 0.14;

export const DEFAULT_GROW_PATH_SCROLL_STATE: GrowPathScrollState = {
  progress: 0,
};

const GROW_PATH_FOCUS_PROGRESS_THRESHOLD = 1;
const GROW_PATH_FOCUS_SCALE = 1.14;
const GROW_PATH_BACKGROUND_SCALE = 0.96;
const GROW_PATH_BACKGROUND_TRANSLATE_Y = 10;
const GROW_PATH_BACKGROUND_OPACITY = 0.62;
const GROW_PATH_BACKGROUND_FILTER = 'blur(4px) saturate(0.88) brightness(0.96)';
const GROW_PATH_FOCUS_Z_INDEX = 30;
const GROW_PATH_BACKGROUND_Z_INDEX = 6;
const CAREER_JOURNEY_SNAP_TOP_OFFSET_PX = 80;
const SNAP_ENTRY_MAX_RATIO = 0.28;
const SNAP_ENTRY_MIN_RATIO = -0.12;
const SNAP_RESET_ABOVE_RATIO = 0.6;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

const CARD_ENTRY_SEGMENTS: Record<
  GrowPathCardId,
  {
    start: number;
    end: number;
    entryTranslateX: number;
    entryTranslateY: number;
    finalRotate: number;
    zIndex: number;
  }
> = {
  growPath_01: {
    start: 0.15,
    end: 0.35,
    entryTranslateX: -7,
    entryTranslateY: 24,
    finalRotate: -5,
    zIndex: 2,
  },
  growPath_02: {
    start: 0.35,
    end: 0.55,
    entryTranslateX: -4,
    entryTranslateY: 18,
    finalRotate: -3,
    zIndex: 3,
  },
  growPath_03: {
    start: 0.55,
    end: 0.75,
    entryTranslateX: 2,
    entryTranslateY: 18,
    finalRotate: 3,
    zIndex: 4,
  },
  growPath_04: {
    start: 0.75,
    end: 0.95,
    entryTranslateX: 7,
    entryTranslateY: 18,
    finalRotate: 5,
    zIndex: 5,
  },
};

export function isGrowPathSectionPinned(scrollY: number, sectionTop: number, tolerance = 2) {
  return Math.abs(scrollY - sectionTop) <= tolerance;
}

export function isGrowPathSectionActive(
  scrollY: number,
  sectionTop: number,
  sectionHeight: number,
  tolerance = 2,
) {
  return scrollY >= sectionTop - tolerance && scrollY < sectionTop + sectionHeight - tolerance;
}

export function getGrowPathWheelState({
  state,
  deltaY,
  step,
}: GrowPathWheelInput): GrowPathWheelState {
  const normalizedDelta = deltaY / 120;

  if (normalizedDelta === 0) {
    return {
      nextState: state,
      shouldPreventScroll: false,
    };
  }

  const safeProgress = clamp(state.progress, 0, 1);

  if (normalizedDelta > 0 && safeProgress >= 1) {
    return {
      nextState: {
        progress: 1,
      },
      shouldPreventScroll: false,
    };
  }

  if (normalizedDelta < 0 && safeProgress <= 0) {
    return {
      nextState: {
        progress: 0,
      },
      shouldPreventScroll: false,
    };
  }

  return {
    nextState: {
      progress: clamp(safeProgress + normalizedDelta * step, 0, 1),
    },
    shouldPreventScroll: true,
  };
}

export function getGrowPathWheelCaptureState({
  scrollY,
  sectionTop,
  sectionHeight,
  tolerance,
  state,
  deltaY,
  step,
}: GrowPathWheelCaptureInput): GrowPathWheelCaptureState {
  if (!isGrowPathSectionActive(scrollY, sectionTop, sectionHeight, tolerance)) {
    return {
      nextState: state,
      shouldPreventScroll: false,
      targetScrollY: null,
    };
  }

  const wheelState = getGrowPathWheelState({
    state,
    deltaY,
    step,
  });

  return {
    ...wheelState,
    targetScrollY: wheelState.shouldPreventScroll ? sectionTop : null,
  };
}

export function canFocusGrowPathCard(progress: number) {
  return clamp(progress, 0, 1) >= GROW_PATH_FOCUS_PROGRESS_THRESHOLD;
}

export function getGrowPathCareerSnapTargetY(careerTop: number) {
  return Math.max(Math.round(careerTop - CAREER_JOURNEY_SNAP_TOP_OFFSET_PX), 0);
}

export function getGrowPathCareerSnapState({
  scrollY,
  lastScrollY,
  growPathTop,
  growPathHeight,
  careerTop,
  viewportHeight,
  growPathProgress,
  hasSnappedOnCurrentExit,
}: GrowPathCareerSnapInput): GrowPathCareerSnapState {
  if (viewportHeight <= 0 || growPathHeight <= 0) {
    return {
      shouldSnap: false,
      shouldResetLatch: false,
    };
  }

  const growPathBottom = growPathTop + growPathHeight;
  const shouldResetLatch =
    hasSnappedOnCurrentExit &&
    (scrollY <= careerTop - viewportHeight * SNAP_RESET_ABOVE_RATIO || scrollY >= growPathBottom + viewportHeight);

  if (
    hasSnappedOnCurrentExit ||
    scrollY <= lastScrollY ||
    clamp(growPathProgress, 0, 1) < 1
  ) {
    return {
      shouldSnap: false,
      shouldResetLatch,
    };
  }

  const topOffset = careerTop - scrollY;
  const shouldSnap =
    topOffset <= viewportHeight * SNAP_ENTRY_MAX_RATIO &&
    topOffset >= viewportHeight * SNAP_ENTRY_MIN_RATIO;

  return {
    shouldSnap,
    shouldResetLatch,
  };
}

export function getGrowPathFocusVisuals(
  selectedCardId: GrowPathCardId,
): Record<GrowPathCardId, GrowPathFocusCardVisual> {
  return GROW_PATH_CARD_IDS.reduce(
    (visuals, cardId) => {
      const isSelected = cardId === selectedCardId;

      visuals[cardId] = {
        isSelected,
        opacity: isSelected ? 1 : GROW_PATH_BACKGROUND_OPACITY,
        scale: isSelected ? GROW_PATH_FOCUS_SCALE : GROW_PATH_BACKGROUND_SCALE,
        rotate: 0,
        translateY: isSelected ? 0 : GROW_PATH_BACKGROUND_TRANSLATE_Y,
        filter: isSelected ? 'none' : GROW_PATH_BACKGROUND_FILTER,
        zIndex: isSelected ? GROW_PATH_FOCUS_Z_INDEX : GROW_PATH_BACKGROUND_Z_INDEX,
        pointerEventsEnabled: isSelected,
      };

      return visuals;
    },
    {} as Record<GrowPathCardId, GrowPathFocusCardVisual>,
  );
}

export function getGrowPathFocusWheelState(
  selectedCardId: GrowPathCardId | null,
): GrowPathFocusWheelState {
  if (!selectedCardId) {
    return {
      nextSelectedCardId: null,
      shouldPreventScroll: false,
    };
  }

  return {
    nextSelectedCardId: null,
    shouldPreventScroll: false,
  };
}

export function getGrowPathCardVisuals(progress: number): Record<GrowPathCardId, GrowPathCardVisual> {
  const safeProgress = clamp(progress, 0, 1);

  return GROW_PATH_CARD_IDS.reduce(
    (visuals, cardId) => {
      const config = CARD_ENTRY_SEGMENTS[cardId];
      const entryProgress = clamp(
        (safeProgress - config.start) / (config.end - config.start),
        0,
        1,
      );
      const easedProgress = easeOutCubic(entryProgress);

      visuals[cardId] = {
        opacity: easedProgress,
        translateX: config.entryTranslateX * (1 - easedProgress),
        translateY: config.entryTranslateY * (1 - easedProgress),
        scale: 0.88 + 0.12 * easedProgress,
        rotate: config.finalRotate * easedProgress,
        zIndex: config.zIndex,
      };

      return visuals;
    },
    {} as Record<GrowPathCardId, GrowPathCardVisual>,
  );
}
