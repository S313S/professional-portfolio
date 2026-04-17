import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getDevStandaloneRoute,
  getInitialFocusTarget,
  getInitialScrollResetState,
} from './App.logic';

test('reload navigation resets the app back to the homepage top', () => {
  assert.deepEqual(getInitialScrollResetState('reload'), {
    shouldResetScrollToTop: true,
    scrollRestoration: 'manual',
  });
});

test('non-reload navigations keep the browser scroll restoration defaults', () => {
  assert.deepEqual(getInitialScrollResetState('navigate'), {
    shouldResetScrollToTop: false,
    scrollRestoration: 'auto',
  });

  assert.deepEqual(getInitialScrollResetState('back_forward'), {
    shouldResetScrollToTop: false,
    scrollRestoration: 'auto',
  });
});

test('reload navigation does not force scroll-to-top when a supported debug focus target is present', () => {
  assert.deepEqual(getInitialScrollResetState('reload', 'friend-book-finale-section'), {
    shouldResetScrollToTop: false,
    scrollRestoration: 'manual',
  });
});

test('parses only supported focus query values from the url search string', () => {
  assert.equal(
    getInitialFocusTarget('?focus=friend-book-finale-section'),
    'friend-book-finale-section',
  );
  assert.equal(getInitialFocusTarget('?focus=friend-book-game-grid'), 'friend-book-game-grid');
  assert.equal(getInitialFocusTarget('?focus=friend-book-preview'), 'friend-book-preview');
  assert.equal(getInitialFocusTarget('?focus=works-detail-section'), null);
  assert.equal(getInitialFocusTarget('?foo=friend-book-finale-section'), null);
});

test('matches the friend-book standalone debug route only in development', () => {
  assert.equal(getDevStandaloneRoute('/debug/friend-book-finale', true), 'friend-book-finale');
  assert.equal(
    getDevStandaloneRoute('/debug/friend-book-diff-hotspots', true),
    'friend-book-diff-hotspots',
  );
  assert.equal(getDevStandaloneRoute('/debug/friend-book-finale', false), null);
  assert.equal(getDevStandaloneRoute('/debug/works-detail', true), null);
});
