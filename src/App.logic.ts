export type AppNavigationType = 'navigate' | 'reload' | 'back_forward' | 'prerender' | 'unknown';
export type PortfolioAudioPlaybackIntent = 'continue' | 'restart';

export interface InitialScrollResetState {
  shouldResetScrollToTop: boolean;
  scrollRestoration: 'auto' | 'manual';
}

export const HOMETOWN_SERIES_1_AUDIO_SRC = '/audio/Hometown_Series1.MP3';
export const HOMETOWN_AUDIO_SRC = HOMETOWN_SERIES_1_AUDIO_SRC;
export const HOMETOWN_SERIES_2_AUDIO_SRC = '/audio/Hometown_Series2.MP3';
export const PORTFOLIO_AUDIO_TRACK_CHANGE_EVENT = 'portfolio-audio-track-change';
export const PORTFOLIO_AUDIO_HOME_RESTART_SCROLL_Y = 24;

export interface PortfolioAudioTrackChangeDetail {
  src: string;
}

const SUPPORTED_FOCUS_TARGETS = [
  'friend-book-finale-section',
  'friend-book-game-grid',
  'friend-book-preview',
] as const;

type SupportedFocusTarget = (typeof SUPPORTED_FOCUS_TARGETS)[number];
const SUPPORTED_DEV_STANDALONE_ROUTES = {
  '/debug/friend-book-finale': 'friend-book-finale',
  '/debug/friend-book-diff-hotspots': 'friend-book-diff-hotspots',
  '/debug/works-detail': 'works-detail',
  '/debug/career-detail': 'career-detail',
  '/debug/codex-report': 'codex-report',
} as const;

export type SupportedDevStandaloneRoute =
  (typeof SUPPORTED_DEV_STANDALONE_ROUTES)[keyof typeof SUPPORTED_DEV_STANDALONE_ROUTES];

export function getInitialScrollResetState(
  navigationType: AppNavigationType,
  focusTarget: SupportedFocusTarget | null = null,
): InitialScrollResetState {
  if (navigationType === 'reload') {
    return {
      shouldResetScrollToTop: focusTarget === null,
      scrollRestoration: 'manual',
    };
  }

  return {
    shouldResetScrollToTop: false,
    scrollRestoration: 'auto',
  };
}

export function getInitialFocusTarget(search: string): SupportedFocusTarget | null {
  const focusTarget = new URLSearchParams(search).get('focus');

  if (
    focusTarget &&
    SUPPORTED_FOCUS_TARGETS.includes(focusTarget as SupportedFocusTarget)
  ) {
    return focusTarget as SupportedFocusTarget;
  }

  return null;
}

export function getDevStandaloneRoute(
  pathname: string,
  isDev: boolean,
): SupportedDevStandaloneRoute | null {
  if (!isDev) {
    return null;
  }

  return SUPPORTED_DEV_STANDALONE_ROUTES[
    pathname as keyof typeof SUPPORTED_DEV_STANDALONE_ROUTES
  ] ?? null;
}

export function getCurrentNavigationType(): AppNavigationType {
  if (typeof window === 'undefined' || typeof performance === 'undefined') {
    return 'unknown';
  }

  const navigationEntry = performance.getEntriesByType('navigation')[0];
  if (!navigationEntry || !('type' in navigationEntry)) {
    return 'unknown';
  }

  const navigationType = navigationEntry.type;
  if (
    navigationType === 'navigate' ||
    navigationType === 'reload' ||
    navigationType === 'back_forward' ||
    navigationType === 'prerender'
  ) {
    return navigationType;
  }

  return 'unknown';
}

export function getPortfolioAudioPlaybackIntent({
  previousScrollY,
  nextScrollY,
  homeRestartScrollY = PORTFOLIO_AUDIO_HOME_RESTART_SCROLL_Y,
}: {
  previousScrollY: number;
  nextScrollY: number;
  homeRestartScrollY?: number;
}): PortfolioAudioPlaybackIntent {
  if (previousScrollY > homeRestartScrollY && nextScrollY <= homeRestartScrollY) {
    return 'restart';
  }

  return 'continue';
}
