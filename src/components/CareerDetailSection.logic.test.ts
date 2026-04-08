import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getCareerDetailDragGestureState,
  getCareerDetailInitialSelectedEntryIdByCategory,
  getCareerDetailResolvedEntryState,
  getCareerDetailSnapState,
  getCareerDetailSnapTargetY,
  getCareerDetailWheelCaptureState,
  getCareerDetailWheelLockState,
  getCareerDetailWheelState,
  isCareerDetailSectionPinned,
} from './CareerDetailSection.logic.ts';

test('career detail snap requests entry snap when scrolling downward into the threshold window', () => {
  const snapState = getCareerDetailSnapState({
    scrollY: 2550,
    lastScrollY: 2480,
    sectionTop: 2800,
    sectionHeight: 960,
    viewportHeight: 1000,
    hasSnappedOnCurrentEntry: false,
  });

  assert.equal(snapState.shouldSnap, true);
  assert.equal(snapState.shouldResetLatch, false);
});

test('career detail snap already engages once the section heading is clearly visible in the viewport', () => {
  const snapState = getCareerDetailSnapState({
    scrollY: 2400,
    lastScrollY: 2320,
    sectionTop: 2800,
    sectionHeight: 960,
    viewportHeight: 900,
    hasSnappedOnCurrentEntry: false,
  });

  assert.equal(snapState.shouldSnap, true);
  assert.equal(snapState.shouldResetLatch, false);
});

test('career detail snap stays disabled while scrolling upward', () => {
  const snapState = getCareerDetailSnapState({
    scrollY: 2550,
    lastScrollY: 2620,
    sectionTop: 2800,
    sectionHeight: 960,
    viewportHeight: 1000,
    hasSnappedOnCurrentEntry: false,
  });

  assert.equal(snapState.shouldSnap, false);
});

test('career detail snap latch resets after scrolling well above the section', () => {
  const snapState = getCareerDetailSnapState({
    scrollY: 2120,
    lastScrollY: 2180,
    sectionTop: 2800,
    sectionHeight: 960,
    viewportHeight: 1000,
    hasSnappedOnCurrentEntry: true,
  });

  assert.equal(snapState.shouldSnap, false);
  assert.equal(snapState.shouldResetLatch, true);
});

test('career detail snap target aligns to the section top', () => {
  assert.equal(getCareerDetailSnapTargetY(3200), 3200);
  assert.equal(getCareerDetailSnapTargetY(-20), 0);
});

test('desktop wheel moves to the next record while the career detail section is pinned', () => {
  const wheelState = getCareerDetailWheelState({
    deltaY: 120,
    activeIndex: 0,
    recordCount: 2,
    isSectionPinned: true,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.equal(wheelState.nextIndex, 1);
});

test('desktop wheel releases native scrolling after the final record is already selected', () => {
  const wheelState = getCareerDetailWheelState({
    deltaY: 120,
    activeIndex: 1,
    recordCount: 2,
    isSectionPinned: true,
  });

  assert.equal(wheelState.shouldPreventScroll, false);
  assert.equal(wheelState.nextIndex, 1);
});

test('desktop wheel moves back to the previous record on upward input while pinned', () => {
  const wheelState = getCareerDetailWheelState({
    deltaY: -120,
    activeIndex: 1,
    recordCount: 2,
    isSectionPinned: true,
  });

  assert.equal(wheelState.shouldPreventScroll, true);
  assert.equal(wheelState.nextIndex, 0);
});

test('wheel capture re-pins and switches records when refresh restores scroll inside career detail', () => {
  const captureState = getCareerDetailWheelCaptureState({
    scrollY: 3040,
    sectionTop: 2800,
    sectionHeight: 960,
    deltaY: 120,
    activeIndex: 0,
    recordCount: 3,
  });

  assert.equal(captureState.shouldPreventScroll, true);
  assert.equal(captureState.nextIndex, 1);
  assert.equal(captureState.targetScrollY, 2800);
});

test('wheel capture releases native scroll outside career detail and after the last record', () => {
  assert.deepEqual(
    getCareerDetailWheelCaptureState({
      scrollY: 3810,
      sectionTop: 2800,
      sectionHeight: 960,
      deltaY: 120,
      activeIndex: 1,
      recordCount: 3,
    }),
    {
      shouldPreventScroll: false,
      nextIndex: 1,
      targetScrollY: null,
    },
  );

  assert.deepEqual(
    getCareerDetailWheelCaptureState({
      scrollY: 3040,
      sectionTop: 2800,
      sectionHeight: 960,
      deltaY: 120,
      activeIndex: 2,
      recordCount: 3,
    }),
    {
      shouldPreventScroll: false,
      nextIndex: 2,
      targetScrollY: null,
    },
  );
});

test('wheel lock keeps downward scroll pinned until the page-switch button is clicked', () => {
  assert.deepEqual(
    getCareerDetailWheelLockState({
      deltaY: 120,
      scrollY: 3040,
      sectionTop: 2800,
      sectionHeight: 960,
      hasActivatedPageSwitch: false,
    }),
    {
      shouldPreventScroll: true,
      targetScrollY: 2800,
    },
  );
});

test('wheel lock releases for upward input, after activation, or outside the section', () => {
  assert.deepEqual(
    getCareerDetailWheelLockState({
      deltaY: -120,
      scrollY: 3040,
      sectionTop: 2800,
      sectionHeight: 960,
      hasActivatedPageSwitch: false,
    }),
    {
      shouldPreventScroll: false,
      targetScrollY: null,
    },
  );

  assert.deepEqual(
    getCareerDetailWheelLockState({
      deltaY: 120,
      scrollY: 3040,
      sectionTop: 2800,
      sectionHeight: 960,
      hasActivatedPageSwitch: true,
    }),
    {
      shouldPreventScroll: false,
      targetScrollY: null,
    },
  );

  assert.deepEqual(
    getCareerDetailWheelLockState({
      deltaY: 120,
      scrollY: 2000,
      sectionTop: 2800,
      sectionHeight: 960,
      hasActivatedPageSwitch: false,
    }),
    {
      shouldPreventScroll: false,
      targetScrollY: null,
    },
  );
});

test('pinned check tolerates tiny scroll drift around the section top', () => {
  assert.equal(isCareerDetailSectionPinned(1998, 2000), true);
  assert.equal(isCareerDetailSectionPinned(2006, 2000), false);
});

test('drag gesture does not switch records before crossing the threshold', () => {
  const dragState = getCareerDetailDragGestureState({
    dragStartY: 320,
    currentY: 372,
    threshold: 72,
    activeIndex: 1,
    recordCount: 4,
    hasCommittedInGesture: false,
  });

  assert.equal(dragState.shouldCommitSwitch, false);
  assert.equal(dragState.nextIndex, 1);
  assert.equal(dragState.hasCommittedInGesture, false);
});

test('drag gesture switches to the next record after one downward step', () => {
  const dragState = getCareerDetailDragGestureState({
    dragStartY: 320,
    currentY: 404,
    threshold: 72,
    activeIndex: 1,
    recordCount: 4,
    hasCommittedInGesture: false,
  });

  assert.equal(dragState.shouldCommitSwitch, true);
  assert.equal(dragState.nextIndex, 2);
  assert.equal(dragState.hasCommittedInGesture, true);
});

test('drag gesture only flips once per pointer hold', () => {
  const dragState = getCareerDetailDragGestureState({
    dragStartY: 320,
    currentY: 460,
    threshold: 72,
    activeIndex: 2,
    recordCount: 4,
    hasCommittedInGesture: true,
  });

  assert.equal(dragState.shouldCommitSwitch, false);
  assert.equal(dragState.nextIndex, 2);
  assert.equal(dragState.hasCommittedInGesture, true);
});

test('drag gesture switches upward to the previous record after one upward step', () => {
  const dragState = getCareerDetailDragGestureState({
    dragStartY: 320,
    currentY: 228,
    threshold: 72,
    activeIndex: 2,
    recordCount: 4,
    hasCommittedInGesture: false,
  });

  assert.equal(dragState.shouldCommitSwitch, true);
  assert.equal(dragState.nextIndex, 1);
  assert.equal(dragState.hasCommittedInGesture, true);
});

test('initial category selection defaults to the first entry of each category', () => {
  const initialSelection = getCareerDetailInitialSelectedEntryIdByCategory([
    {
      key: 'sharingJourney',
      entries: [{ id: 'sharing-1' }, { id: 'sharing-2' }],
    },
    {
      key: 'workExperience',
      entries: [{ id: 'work-1' }],
    },
    {
      key: 'industryKnowledge',
      entries: [],
    },
  ]);

  assert.deepEqual(initialSelection, {
    sharingJourney: 'sharing-1',
    workExperience: 'work-1',
    industryKnowledge: '',
  });
});

test('resolved entry state restores the remembered entry when it still exists', () => {
  const resolvedEntry = getCareerDetailResolvedEntryState({
    entries: [{ id: 'sharing-1' }, { id: 'sharing-2' }],
    selectedEntryId: 'sharing-2',
  });

  assert.equal(resolvedEntry.selectedEntryId, 'sharing-2');
  assert.equal(resolvedEntry.selectedEntryIndex, 1);
  assert.equal(resolvedEntry.selectedEntry?.id, 'sharing-2');
});

test('resolved entry state falls back to the first entry when the remembered one is missing', () => {
  const resolvedEntry = getCareerDetailResolvedEntryState({
    entries: [{ id: 'sharing-1' }, { id: 'sharing-2' }],
    selectedEntryId: 'missing-entry',
  });

  assert.equal(resolvedEntry.selectedEntryId, 'sharing-1');
  assert.equal(resolvedEntry.selectedEntryIndex, 0);
  assert.equal(resolvedEntry.selectedEntry?.id, 'sharing-1');
});

test('resolved entry state exposes an empty selection for categories without entries', () => {
  const resolvedEntry = getCareerDetailResolvedEntryState({
    entries: [],
    selectedEntryId: 'missing-entry',
  });

  assert.equal(resolvedEntry.selectedEntryId, '');
  assert.equal(resolvedEntry.selectedEntryIndex, -1);
  assert.equal(resolvedEntry.selectedEntry, null);
});
