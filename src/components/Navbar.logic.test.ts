import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldHideNavbarForWorksLobby } from './Navbar.logic.ts';

test('hides the navbar while the works lobby section intersects the viewport', () => {
  const originalInnerHeight = window.innerHeight;
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: 900,
  });

  assert.equal(shouldHideNavbarForWorksLobby(0, 900), true);
  assert.equal(shouldHideNavbarForWorksLobby(120, 1020), true);
  assert.equal(shouldHideNavbarForWorksLobby(-200, 400), true);

  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: originalInnerHeight,
  });
});

test('does not hide the navbar when the works lobby section is fully outside the viewport', () => {
  const originalInnerHeight = window.innerHeight;
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: 900,
  });

  assert.equal(shouldHideNavbarForWorksLobby(920, 1820), false);
  assert.equal(shouldHideNavbarForWorksLobby(-1000, -10), false);

  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: originalInnerHeight,
  });
});
