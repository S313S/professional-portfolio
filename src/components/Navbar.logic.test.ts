import test from 'node:test';
import assert from 'node:assert/strict';

import {
  shouldHideNavbar,
  shouldHideNavbarForImmersiveSection,
  shouldHideNavbarForSectionRects,
} from './Navbar.logic.ts';

test('hides the navbar while an immersive section intersects the viewport', () => {
  assert.equal(shouldHideNavbarForImmersiveSection(0, 900, 900), true);
  assert.equal(shouldHideNavbarForImmersiveSection(120, 1020, 900), true);
  assert.equal(shouldHideNavbarForImmersiveSection(-200, 400, 900), true);
});

test('does not hide the navbar when an immersive section is fully outside the viewport', () => {
  assert.equal(shouldHideNavbarForImmersiveSection(920, 1820, 900), false);
  assert.equal(shouldHideNavbarForImmersiveSection(-1000, -10, 900), false);
});

test('hides the navbar when any immersive section intersects the viewport', () => {
  assert.equal(
    shouldHideNavbarForSectionRects(
      [
        { top: 940, bottom: 1840 },
        { top: 0, bottom: 900 },
      ],
      900,
    ),
    true,
  );
});

test('keeps the navbar visible when all immersive sections are outside the viewport', () => {
  assert.equal(
    shouldHideNavbarForSectionRects(
      [
        { top: 940, bottom: 1840 },
        { top: -1200, bottom: -100 },
      ],
      900,
    ),
    false,
  );
});

test('keeps the navbar hidden whenever an immersive section intersects the viewport', () => {
  assert.equal(
    shouldHideNavbar({
      latestScrollY: 4500,
      previousScrollY: 4380,
      isOpen: false,
      topSectionRects: [{ top: -1800, bottom: -900 }],
      immersiveSectionRects: [{ top: 0, bottom: 900 }],
      viewportHeight: 900,
    }),
    true,
  );

  assert.equal(
    shouldHideNavbar({
      latestScrollY: 4500,
      previousScrollY: 4620,
      isOpen: false,
      topSectionRects: [{ top: -1800, bottom: -900 }],
      immersiveSectionRects: [{ top: 0, bottom: 900 }],
      viewportHeight: 900,
    }),
    true,
  );
});

test('keeps the navbar visible while a top section intersects the viewport', () => {
  assert.equal(
    shouldHideNavbar({
      latestScrollY: 220,
      previousScrollY: 120,
      isOpen: false,
      topSectionRects: [{ top: 0, bottom: 900 }],
      immersiveSectionRects: [{ top: 920, bottom: 1820 }],
      viewportHeight: 900,
    }),
    false,
  );
});

test('hides the navbar when an immersive section intersects even if a top section still overlaps', () => {
  assert.equal(
    shouldHideNavbar({
      latestScrollY: 980,
      previousScrollY: 920,
      isOpen: false,
      topSectionRects: [{ top: -120, bottom: 24 }],
      immersiveSectionRects: [{ top: 0, bottom: 900 }],
      viewportHeight: 900,
    }),
    true,
  );
});

test('keeps the navbar hidden after the top sections are fully above the viewport', () => {
  assert.equal(
    shouldHideNavbar({
      latestScrollY: 2200,
      previousScrollY: 2320,
      isOpen: false,
      topSectionRects: [
        { top: -1800, bottom: -900 },
        { top: -900, bottom: -20 },
      ],
      immersiveSectionRects: [{ top: 920, bottom: 1820 }],
      viewportHeight: 900,
    }),
    true,
  );
});

test('falls back to scroll-direction hiding before the top sections are passed', () => {
  assert.equal(
    shouldHideNavbar({
      latestScrollY: 220,
      previousScrollY: 260,
      isOpen: false,
      topSectionRects: [{ top: 920, bottom: 1820 }],
      immersiveSectionRects: [{ top: 920, bottom: 1820 }],
      viewportHeight: 900,
    }),
    false,
  );
});
