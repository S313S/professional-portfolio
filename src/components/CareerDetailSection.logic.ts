export interface CareerDetailSnapInput {
  scrollY: number;
  lastScrollY: number;
  sectionTop: number;
  sectionHeight: number;
  viewportHeight: number;
  hasSnappedOnCurrentEntry: boolean;
}

export interface CareerDetailSnapState {
  shouldSnap: boolean;
  shouldResetLatch: boolean;
}

export interface CareerDetailWheelInput {
  deltaY: number;
  activeIndex: number;
  recordCount: number;
  isSectionPinned: boolean;
}

export interface CareerDetailWheelState {
  shouldPreventScroll: boolean;
  nextIndex: number;
}

export interface CareerDetailDragGestureInput {
  dragStartY: number | null;
  currentY: number;
  threshold: number;
  activeIndex: number;
  recordCount: number;
  hasCommittedInGesture: boolean;
}

export interface CareerDetailDragGestureState {
  shouldCommitSwitch: boolean;
  nextIndex: number;
  hasCommittedInGesture: boolean;
}

const SNAP_ENTRY_MAX_RATIO = 0.5;
const SNAP_ENTRY_MIN_RATIO = -0.12;
const SNAP_RESET_ABOVE_RATIO = 0.6;
const CAREER_DETAIL_PIN_TOLERANCE = 2;

export function getCareerDetailSnapTargetY(sectionTop: number) {
  return Math.max(Math.round(sectionTop), 0);
}

export function isCareerDetailSectionPinned(
  scrollY: number,
  sectionTop: number,
  tolerance = CAREER_DETAIL_PIN_TOLERANCE,
) {
  return Math.abs(scrollY - sectionTop) <= tolerance;
}

export function getCareerDetailWheelState({
  deltaY,
  activeIndex,
  recordCount,
  isSectionPinned,
}: CareerDetailWheelInput): CareerDetailWheelState {
  const clampedIndex = Math.min(Math.max(activeIndex, 0), Math.max(recordCount - 1, 0));

  if (!isSectionPinned || recordCount <= 0 || deltaY === 0) {
    return {
      shouldPreventScroll: false,
      nextIndex: clampedIndex,
    };
  }

  if (deltaY > 0) {
    const nextIndex = Math.min(clampedIndex + 1, recordCount - 1);
    return {
      shouldPreventScroll: nextIndex !== clampedIndex,
      nextIndex,
    };
  }

  const nextIndex = Math.max(clampedIndex - 1, 0);
  return {
    shouldPreventScroll: nextIndex !== clampedIndex,
    nextIndex,
  };
}

export function getCareerDetailDragGestureState({
  dragStartY,
  currentY,
  threshold,
  activeIndex,
  recordCount,
  hasCommittedInGesture,
}: CareerDetailDragGestureInput): CareerDetailDragGestureState {
  const clampedIndex = Math.min(Math.max(activeIndex, 0), Math.max(recordCount - 1, 0));

  if (dragStartY === null || recordCount <= 0 || hasCommittedInGesture) {
    return {
      shouldCommitSwitch: false,
      nextIndex: clampedIndex,
      hasCommittedInGesture,
    };
  }

  const deltaY = currentY - dragStartY;
  if (Math.abs(deltaY) < threshold) {
    return {
      shouldCommitSwitch: false,
      nextIndex: clampedIndex,
      hasCommittedInGesture: false,
    };
  }

  const nextIndex =
    deltaY > 0 ? Math.min(clampedIndex + 1, recordCount - 1) : Math.max(clampedIndex - 1, 0);
  const shouldCommitSwitch = nextIndex !== clampedIndex;

  return {
    shouldCommitSwitch,
    nextIndex,
    hasCommittedInGesture: shouldCommitSwitch || hasCommittedInGesture,
  };
}

export function getCareerDetailSnapState({
  scrollY,
  lastScrollY,
  sectionTop,
  sectionHeight,
  viewportHeight,
  hasSnappedOnCurrentEntry,
}: CareerDetailSnapInput): CareerDetailSnapState {
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
