import test from 'node:test';
import assert from 'node:assert/strict';

import {
  COVER_AND_SELF_INTRO_AUDIO_SRC,
  getDevStandaloneRoute,
  getInitialFocusTarget,
  getInitialScrollResetState,
  getPortfolioAudioPlaybackIntent,
  getPortfolioAudioTrackForExperienceLanding,
  HOMETOWN_AUDIO_SRC,
  HOMETOWN_SERIES_1_AUDIO_SRC,
  HOMETOWN_SERIES_2_AUDIO_SRC,
  PORTFOLIO_AUDIO_TRACK_CHANGE_EVENT,
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
  assert.equal(getDevStandaloneRoute('/debug/works-detail', true), 'works-detail');
  assert.equal(getDevStandaloneRoute('/debug/career-detail', true), 'career-detail');
  assert.equal(
    getDevStandaloneRoute('/debug/friend-book-diff-hotspots', true),
    'friend-book-diff-hotspots',
  );
  assert.equal(getDevStandaloneRoute('/debug/codex-report', true), 'codex-report');
  assert.equal(getDevStandaloneRoute('/debug/friend-book-finale', false), null);
  assert.equal(getDevStandaloneRoute('/debug/works-detail', false), null);
  assert.equal(getDevStandaloneRoute('/debug/career-detail', false), null);
});

test('uses the hometown audio asset for portfolio background playback', () => {
  assert.equal(HOMETOWN_AUDIO_SRC, '/audio/Hometown_Series1.MP3');
});

test('uses the cover and self-introduction audio asset before the experience page', () => {
  assert.equal(COVER_AND_SELF_INTRO_AUDIO_SRC, '/audio/CoverAndSelf-introduction.mp3');
});

test('defines the second hometown audio asset and track-change event for the page switch', () => {
  assert.equal(HOMETOWN_SERIES_2_AUDIO_SRC, '/audio/Hometown_Series2.MP3');
  assert.equal(PORTFOLIO_AUDIO_TRACK_CHANGE_EVENT, 'portfolio-audio-track-change');
});

test('requests the first hometown track when the experience page is fully landed', () => {
  assert.equal(
    getPortfolioAudioTrackForExperienceLanding({
      scrollY: 1998,
      experienceSectionTop: 2000,
    }),
    HOMETOWN_SERIES_1_AUDIO_SRC,
  );

  assert.equal(
    getPortfolioAudioTrackForExperienceLanding({
      scrollY: 1920,
      experienceSectionTop: 2000,
    }),
    null,
  );
});

test('restarts the portfolio audio when the page returns to the homepage top', () => {
  assert.equal(
    getPortfolioAudioPlaybackIntent({
      previousScrollY: 720,
      nextScrollY: 0,
    }),
    'restart',
  );

  assert.equal(
    getPortfolioAudioPlaybackIntent({
      previousScrollY: 720,
      nextScrollY: 18,
    }),
    'restart',
  );
});

test('keeps portfolio audio continuity while scrolling through the long page', () => {
  assert.equal(
    getPortfolioAudioPlaybackIntent({
      previousScrollY: 0,
      nextScrollY: 360,
    }),
    'continue',
  );

  assert.equal(
    getPortfolioAudioPlaybackIntent({
      previousScrollY: 860,
      nextScrollY: 320,
    }),
    'continue',
  );
});
