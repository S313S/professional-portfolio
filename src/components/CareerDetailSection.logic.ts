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

export interface CareerDetailWheelCaptureInput {
  scrollY: number;
  sectionTop: number;
  sectionHeight: number;
  deltaY: number;
  activeIndex: number;
  recordCount: number;
}

export interface CareerDetailWheelCaptureState extends CareerDetailWheelState {
  targetScrollY: number | null;
}

export interface CareerDetailWheelLockInput {
  deltaY: number;
  scrollY: number;
  sectionTop: number;
  sectionHeight: number;
  hasActivatedPageSwitch: boolean;
}

export interface CareerDetailWheelLockState {
  shouldPreventScroll: boolean;
  targetScrollY: number | null;
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

export interface CareerDetailEntryLike {
  id: string;
}

export interface CareerDetailCategoryLike<TEntry extends CareerDetailEntryLike = CareerDetailEntryLike> {
  key: string;
  entries: TEntry[];
}

export interface CareerDetailResolvedEntryState<TEntry extends CareerDetailEntryLike = CareerDetailEntryLike> {
  selectedEntry: TEntry | null;
  selectedEntryId: string;
  selectedEntryIndex: number;
}

const SNAP_ENTRY_MAX_RATIO = 0.5;
const SNAP_ENTRY_MIN_RATIO = -0.12;
const SNAP_RESET_ABOVE_RATIO = 0.6;
const CAREER_DETAIL_PIN_TOLERANCE = 2;
export function getCareerDetailInitialSelectedEntryIdByCategory<
  TCategory extends CareerDetailCategoryLike,
>(categories: TCategory[]) {
  return Object.fromEntries(
    categories.map((category) => [category.key, category.entries[0]?.id ?? '']),
  );
}

export function getCareerDetailResolvedEntryState<TEntry extends CareerDetailEntryLike>({
  entries,
  selectedEntryId,
}: {
  entries: TEntry[];
  selectedEntryId: string;
}): CareerDetailResolvedEntryState<TEntry> {
  if (entries.length === 0) {
    return {
      selectedEntry: null,
      selectedEntryId: '',
      selectedEntryIndex: -1,
    };
  }

  const selectedEntryIndex = entries.findIndex((entry) => entry.id === selectedEntryId);
  const resolvedEntryIndex = selectedEntryIndex >= 0 ? selectedEntryIndex : 0;
  const selectedEntry = entries[resolvedEntryIndex] ?? null;

  return {
    selectedEntry,
    selectedEntryId: selectedEntry?.id ?? '',
    selectedEntryIndex: resolvedEntryIndex,
  };
}

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

export function isCareerDetailSectionActive(
  scrollY: number,
  sectionTop: number,
  sectionHeight: number,
  tolerance = CAREER_DETAIL_PIN_TOLERANCE,
) {
  return scrollY >= sectionTop - tolerance && scrollY < sectionTop + sectionHeight - tolerance;
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

export function getCareerDetailWheelCaptureState({
  scrollY,
  sectionTop,
  sectionHeight,
  deltaY,
  activeIndex,
  recordCount,
}: CareerDetailWheelCaptureInput): CareerDetailWheelCaptureState {
  if (!isCareerDetailSectionActive(scrollY, sectionTop, sectionHeight)) {
    return {
      shouldPreventScroll: false,
      nextIndex: Math.min(Math.max(activeIndex, 0), Math.max(recordCount - 1, 0)),
      targetScrollY: null,
    };
  }

  const wheelState = getCareerDetailWheelState({
    deltaY,
    activeIndex,
    recordCount,
    isSectionPinned: true,
  });

  return {
    ...wheelState,
    targetScrollY: wheelState.shouldPreventScroll ? getCareerDetailSnapTargetY(sectionTop) : null,
  };
}

export function getCareerDetailWheelLockState({
  deltaY,
  scrollY,
  sectionTop,
  sectionHeight,
  hasActivatedPageSwitch,
}: CareerDetailWheelLockInput): CareerDetailWheelLockState {
  if (
    deltaY <= 0 ||
    hasActivatedPageSwitch ||
    !isCareerDetailSectionActive(scrollY, sectionTop, sectionHeight)
  ) {
    return {
      shouldPreventScroll: false,
      targetScrollY: null,
    };
  }

  return {
    shouldPreventScroll: true,
    targetScrollY: getCareerDetailSnapTargetY(sectionTop),
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
