import test from 'node:test';
import assert from 'node:assert/strict';

import { getInitialScrollResetState } from './App.logic';

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
