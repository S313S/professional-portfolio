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
  showCtaPromptAnimation: boolean;
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

export interface VideoPromptPinInput {
  scrollY: number;
  sectionTop: number;
  sectionHeight: number;
}

export const DEFAULT_VIDEO_WHEEL_STEP = 0.12;
export const AWAITING_ACTIVATION_REPIN_TOLERANCE_PX = 12;
export const AWAITING_ACTIVATION_REPIN_DURATION_MS = 520;
export const CTA_HINT_OFFSET_X_PX = 80;
export const CTA_HINT_LEFT_BASE_PERCENT = 27.8;
export const CTA_HINT_LEFT_MD_PERCENT = 27.6;

export const DEFAULT_VIDEO_SCROLL_INITIAL_STATE: VideoScrollState = {
  phase: 'loopPlaying',
  scrubProgress: 0,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export function getCtaHintLeftValue(leftPercent: number, offsetPx: number) {
  return `calc(${leftPercent}% + ${offsetPx}px)`;
}

export function getSoftRepinEasedProgress(progress: number) {
  const safeProgress = clamp(progress, 0, 1);
  return 1 - Math.pow(1 - safeProgress, 3);
}

export function getSoftRepinScrollTop(startScrollY: number, targetScrollY: number, progress: number) {
  const easedProgress = getSoftRepinEasedProgress(progress);
  return startScrollY + (targetScrollY - startScrollY) * easedProgress;
}

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

export function shouldPinVideoSectionOnPrompt({
  scrollY,
  sectionTop,
  sectionHeight,
}: VideoPromptPinInput) {
  return isScrollWithinVideoSection(scrollY, sectionTop, sectionHeight);
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

export interface LoopPlaybackInput {
  state: VideoScrollState;
  isSectionInView: boolean;
}

export interface LoopPlaybackRestartInput {
  state: VideoScrollState;
  wasSectionInView: boolean;
  isSectionInView: boolean;
  hasEnteredSectionBefore: boolean;
}

export interface CompletedScrollResetInput {
  state: VideoScrollState;
  previousScrollY: number;
  scrollY: number;
}

export interface AwaitingActivationRepinInput {
  state: VideoScrollState;
  sectionTop: number;
  sectionHeight: number;
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
  sectionHeight,
  previousScrollY,
  scrollY,
}: AwaitingActivationRepinInput): boolean {
  return (
    state.phase === 'awaitingActivation' &&
    isScrollWithinVideoSection(scrollY, sectionTop, sectionHeight) &&
    scrollY > sectionTop + AWAITING_ACTIVATION_REPIN_TOLERANCE_PX &&
    scrollY > previousScrollY
  );
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

export function shouldPlayLoopVideoInSection({
  state,
  isSectionInView,
}: LoopPlaybackInput): boolean {
  return state.phase === 'loopPlaying' && isSectionInView;
}

export function shouldRestartLoopPlaybackOnSectionEnter({
  state,
  wasSectionInView,
  isSectionInView,
  hasEnteredSectionBefore,
}: LoopPlaybackRestartInput): boolean {
  return (
    state.phase === 'loopPlaying' &&
    !wasSectionInView &&
    isSectionInView &&
    !hasEnteredSectionBefore
  );
}

export function getVideoVisualState(state: VideoScrollState): VideoVisualState {
  if (state.phase === 'loopPlaying') {
    return {
      ...state,
      overlayOpacity: 0,
      loopOpacity: 1,
      showCta: false,
      showCtaPromptAnimation: false,
      shouldPlayLoopVideo: true,
    };
  }

  if (state.phase === 'awaitingActivation') {
    return {
      ...state,
      overlayOpacity: 0,
      loopOpacity: 1,
      showCta: true,
      showCtaPromptAnimation: true,
      shouldPlayLoopVideo: false,
    };
  }

  return {
    ...state,
    overlayOpacity: 1,
    loopOpacity: 0,
    showCta: false,
    showCtaPromptAnimation: false,
    shouldPlayLoopVideo: false,
  };
}
