import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getExperienceHeroSnapState,
  getExperienceHeroSnapTargetY,
  shouldLockExperienceHeroOnScroll,
} from './ExperienceHero.logic.ts';

test('requests a snap when scrolling down into the activation zone', () => {
  const result = getExperienceHeroSnapState({
    scrollY: 1780,
    lastScrollY: 1700,
    sectionTop: 2000,
    sectionHeight: 1500,
    viewportHeight: 1000,
    hasSnappedOnCurrentEntry: false,
  });

  assert.deepEqual(result, {
    shouldSnap: true,
    shouldResetLatch: false,
  });
});

test('does not snap again after the current entry has already snapped once', () => {
  const result = getExperienceHeroSnapState({
    scrollY: 1780,
    lastScrollY: 1700,
    sectionTop: 2000,
    sectionHeight: 1500,
    viewportHeight: 1000,
    hasSnappedOnCurrentEntry: true,
  });

  assert.deepEqual(result, {
    shouldSnap: false,
    shouldResetLatch: false,
  });
});

test('does not snap before the section top reaches the activation zone', () => {
  const result = getExperienceHeroSnapState({
    scrollY: 1500,
    lastScrollY: 1420,
    sectionTop: 2000,
    sectionHeight: 1500,
    viewportHeight: 1000,
    hasSnappedOnCurrentEntry: false,
  });

  assert.deepEqual(result, {
    shouldSnap: false,
    shouldResetLatch: false,
  });
});

test('does not snap once the user is already past the top activation band', () => {
  const result = getExperienceHeroSnapState({
    scrollY: 2300,
    lastScrollY: 2200,
    sectionTop: 2000,
    sectionHeight: 1500,
    viewportHeight: 1000,
    hasSnappedOnCurrentEntry: false,
  });

  assert.deepEqual(result, {
    shouldSnap: false,
    shouldResetLatch: false,
  });
});

test('requests a latch reset after the user scrolls back above the section entry area', () => {
  const result = getExperienceHeroSnapState({
    scrollY: 1200,
    lastScrollY: 1300,
    sectionTop: 2000,
    sectionHeight: 1500,
    viewportHeight: 1000,
    hasSnappedOnCurrentEntry: true,
  });

  assert.deepEqual(result, {
    shouldSnap: false,
    shouldResetLatch: true,
  });
});

test('requests a latch reset after the user leaves the section below', () => {
  const result = getExperienceHeroSnapState({
    scrollY: 3500,
    lastScrollY: 3420,
    sectionTop: 2000,
    sectionHeight: 1500,
    viewportHeight: 1000,
    hasSnappedOnCurrentEntry: true,
  });

  assert.deepEqual(result, {
    shouldSnap: false,
    shouldResetLatch: true,
  });
});

test('snap target aligns the experience hero flush with the top of the viewport', () => {
  assert.equal(getExperienceHeroSnapTargetY(2000), 2000);
});

test('snap target preserves the section top when it is already near the top of the document', () => {
  assert.equal(getExperienceHeroSnapTargetY(12), 12);
});

test('locks the hero in place when scrolling downward after it has snapped', () => {
  assert.equal(
    shouldLockExperienceHeroOnScroll({
      scrollY: 2040,
      lastScrollY: 1976,
      sectionTop: 2000,
      sectionHeight: 1000,
      viewportHeight: 1000,
      hasSnappedOnCurrentEntry: true,
      transitionArmed: false,
    }),
    true,
  );
});

test('does not lock the hero when the user scrolls upward toward the previous section', () => {
  assert.equal(
    shouldLockExperienceHeroOnScroll({
      scrollY: 1940,
      lastScrollY: 1976,
      sectionTop: 2000,
      sectionHeight: 1000,
      viewportHeight: 1000,
      hasSnappedOnCurrentEntry: true,
      transitionArmed: false,
    }),
    false,
  );
});

test('does not lock the hero after the double-click transition has been armed', () => {
  assert.equal(
    shouldLockExperienceHeroOnScroll({
      scrollY: 2040,
      lastScrollY: 1976,
      sectionTop: 2000,
      sectionHeight: 1000,
      viewportHeight: 1000,
      hasSnappedOnCurrentEntry: true,
      transitionArmed: true,
    }),
    false,
  );
});
