import test from 'node:test';
import assert from 'node:assert/strict';

import { shouldHideNavbarForWorksLobby } from './Navbar.logic.ts';

test('hides the navbar while the works lobby section intersects the viewport', () => {
  assert.equal(shouldHideNavbarForWorksLobby(0, 900, 900), true);
  assert.equal(shouldHideNavbarForWorksLobby(120, 1020, 900), true);
  assert.equal(shouldHideNavbarForWorksLobby(-200, 400, 900), true);
});

test('does not hide the navbar when the works lobby section is fully outside the viewport', () => {
  assert.equal(shouldHideNavbarForWorksLobby(920, 1820, 900), false);
  assert.equal(shouldHideNavbarForWorksLobby(-1000, -10, 900), false);
});
