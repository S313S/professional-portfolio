import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getCareerDetailDragGestureState,
  getCareerDetailSnapState,
  getCareerDetailSnapTargetY,
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
