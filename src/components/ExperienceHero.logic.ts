export interface ExperienceHeroSnapInput {
  scrollY: number;
  lastScrollY: number;
  sectionTop: number;
  sectionHeight: number;
  viewportHeight: number;
  hasSnappedOnCurrentEntry: boolean;
}

export interface ExperienceHeroSnapState {
  shouldSnap: boolean;
  shouldResetLatch: boolean;
}

const SNAP_ENTRY_MAX_RATIO = 0.28;
const SNAP_ENTRY_MIN_RATIO = -0.12;
const SNAP_RESET_ABOVE_RATIO = 0.6;

export function getExperienceHeroSnapState({
  scrollY,
  lastScrollY,
  sectionTop,
  sectionHeight,
  viewportHeight,
  hasSnappedOnCurrentEntry,
}: ExperienceHeroSnapInput): ExperienceHeroSnapState {
  if (viewportHeight <= 0 || sectionHeight <= 0) {
    return {
      shouldSnap: false,
      shouldResetLatch: false,
    };
  }

  const sectionBottom = sectionTop + sectionHeight;
  const shouldResetLatch =
    hasSnappedOnCurrentEntry &&
    (scrollY <= sectionTop - viewportHeight * SNAP_RESET_ABOVE_RATIO || scrollY >= sectionBottom);

  if (hasSnappedOnCurrentEntry || scrollY <= lastScrollY) {
    return {
      shouldSnap: false,
      shouldResetLatch,
    };
  }

  const topOffset = sectionTop - scrollY;
  const shouldSnap =
    topOffset <= viewportHeight * SNAP_ENTRY_MAX_RATIO &&
    topOffset >= viewportHeight * SNAP_ENTRY_MIN_RATIO;

  return {
    shouldSnap,
    shouldResetLatch,
  };
}
