export type AppNavigationType = 'navigate' | 'reload' | 'back_forward' | 'prerender' | 'unknown';

export interface InitialScrollResetState {
  shouldResetScrollToTop: boolean;
  scrollRestoration: 'auto' | 'manual';
}

export function getInitialScrollResetState(
  navigationType: AppNavigationType,
): InitialScrollResetState {
  if (navigationType === 'reload') {
    return {
      shouldResetScrollToTop: true,
      scrollRestoration: 'manual',
    };
  }

  return {
    shouldResetScrollToTop: false,
    scrollRestoration: 'auto',
  };
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
