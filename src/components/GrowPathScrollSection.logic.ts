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
