export type VideoScrollPhase =
  | 'loopPlaying'
  | 'awaitingActivation'
  | 'scrubbing'
  | 'completed';

export interface VideoScrollState {
  phase: VideoScrollPhase;
  scrubProgress: number;
}

export interface VideoVisualState extends VideoScrollState {
  overlayOpacity: number;
  loopOpacity: number;
  showCta: boolean;
  shouldPlayLoopVideo: boolean;
}

export type VideoNavigationType = 'navigate' | 'reload' | 'back_forward' | 'prerender';

export interface VideoScrollMountInput {
  navigationType: VideoNavigationType;
  scrollY: number;
  sectionTop: number;
  sectionHeight: number;
}

export interface VideoScrollMountState {
  shouldResetScroll: boolean;
  targetScrollY: number | null;
  initialVideoState: VideoScrollState;
}

export const DEFAULT_VIDEO_WHEEL_STEP = 0.12;

export const DEFAULT_VIDEO_SCROLL_INITIAL_STATE: VideoScrollState = {
  phase: 'loopPlaying',
  scrubProgress: 0,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function isScrollWithinVideoSection(scrollY: number, sectionTop: number, sectionHeight: number) {
  if (sectionHeight <= 0) {
    return false;
  }

  const sectionBottom = sectionTop + sectionHeight;
  return scrollY >= sectionTop && scrollY < sectionBottom;
}

export function getVideoScrollMountState({
  navigationType,
  scrollY,
  sectionTop,
  sectionHeight,
}: VideoScrollMountInput): VideoScrollMountState {
  const shouldResetScroll =
    navigationType === 'reload' && isScrollWithinVideoSection(scrollY, sectionTop, sectionHeight);

  return {
    shouldResetScroll,
    targetScrollY: shouldResetScroll ? sectionTop : null,
    initialVideoState: DEFAULT_VIDEO_SCROLL_INITIAL_STATE,
  };
}

export function getVideoStateAfterPrompt(state: VideoScrollState): VideoScrollState {
  if (state.phase !== 'loopPlaying') {
    return state;
  }

  return {
    phase: 'awaitingActivation',
    scrubProgress: 0,
  };
}

export function getVideoStateAfterActivation(state: VideoScrollState): VideoScrollState {
  if (state.phase !== 'awaitingActivation') {
    return state;
  }

  return {
    phase: 'scrubbing',
    scrubProgress: 0,
  };
}

export function getVideoStateAfterMobilePlaybackEnd(state: VideoScrollState): VideoScrollState {
  if (state.phase !== 'scrubbing') {
    return state;
  }

  return {
    phase: 'completed',
    scrubProgress: 1,
  };
}

export interface VideoWheelInput {
  state: VideoScrollState;
  deltaY: number;
  step: number;
}

export interface VideoWheelState {
  nextState: VideoScrollState;
  shouldPreventScroll: boolean;
}

export interface CompletedScrollResetInput {
  state: VideoScrollState;
  previousScrollY: number;
  scrollY: number;
}

export interface AwaitingActivationRepinInput {
  state: VideoScrollState;
  sectionTop: number;
  previousScrollY: number;
  scrollY: number;
}

export function shouldResetCompletedVideoOnScroll({
  state,
  previousScrollY,
  scrollY,
}: CompletedScrollResetInput): boolean {
  return state.phase === 'completed' && scrollY < previousScrollY;
}

export function shouldRepinAwaitingActivationOnScroll({
  state,
  sectionTop,
  previousScrollY,
  scrollY,
}: AwaitingActivationRepinInput): boolean {
  return state.phase === 'awaitingActivation' && scrollY > sectionTop && scrollY > previousScrollY;
}

export function getVideoWheelState({ state, deltaY, step }: VideoWheelInput): VideoWheelState {
  const normalizedDelta = deltaY / 120;

  if (normalizedDelta === 0) {
    return {
      nextState: state,
      shouldPreventScroll: false,
    };
  }

  if (state.phase === 'loopPlaying') {
    if (normalizedDelta <= 0) {
      return {
        nextState: state,
        shouldPreventScroll: false,
      };
    }

    return {
      nextState: getVideoStateAfterPrompt(state),
      shouldPreventScroll: true,
    };
  }

  if (state.phase === 'awaitingActivation') {
    return {
      nextState: state,
      shouldPreventScroll: normalizedDelta > 0,
    };
  }

  if (state.phase === 'completed') {
    if (normalizedDelta >= 0) {
      return {
        nextState: state,
        shouldPreventScroll: false,
      };
    }

    return {
      nextState: DEFAULT_VIDEO_SCROLL_INITIAL_STATE,
      shouldPreventScroll: true,
    };
  }

  if (state.phase !== 'scrubbing') {
    return {
      nextState: state,
      shouldPreventScroll: false,
    };
  }

  const safeProgress = clamp(state.scrubProgress, 0, 1);
  const shouldPreventScroll =
    (normalizedDelta > 0 && safeProgress < 1) || (normalizedDelta < 0 && safeProgress > 0);

  if (!shouldPreventScroll) {
    return {
      nextState: state,
      shouldPreventScroll: false,
    };
  }

  const nextProgress = clamp(safeProgress + normalizedDelta * step, 0, 1);

  if (nextProgress <= 0) {
    return {
      nextState: {
        phase: 'awaitingActivation',
        scrubProgress: 0,
      },
      shouldPreventScroll: true,
    };
  }

  if (nextProgress >= 1) {
    return {
      nextState: {
        phase: 'completed',
        scrubProgress: 1,
      },
      shouldPreventScroll: true,
    };
  }

  return {
    nextState: {
      phase: 'scrubbing',
      scrubProgress: nextProgress,
    },
    shouldPreventScroll: true,
  };
}

export function getVideoVisualState(state: VideoScrollState): VideoVisualState {
  if (state.phase === 'loopPlaying') {
    return {
      ...state,
      overlayOpacity: 0,
      loopOpacity: 1,
      showCta: false,
      shouldPlayLoopVideo: true,
    };
  }

  if (state.phase === 'awaitingActivation') {
    return {
      ...state,
      overlayOpacity: 0,
      loopOpacity: 1,
      showCta: true,
      shouldPlayLoopVideo: false,
    };
  }

  return {
    ...state,
    overlayOpacity: 1,
    loopOpacity: 0,
    showCta: false,
    shouldPlayLoopVideo: false,
  };
}
