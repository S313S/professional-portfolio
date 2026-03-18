import test from 'node:test';
import assert from 'node:assert/strict';

import { getExperienceHeroSnapState } from './ExperienceHero.logic.ts';

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
