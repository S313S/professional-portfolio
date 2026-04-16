import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinalSection from './FriendBookFinalSection';

function getFirstMatch(markup: string, pattern: RegExp) {
  const match = markup.match(pattern);
  assert.ok(match, `Expected markup to match ${pattern}`);
  return match[0];
}

test('renders empty archive slots as date-only placeholders without the old helper copy', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);

  assert.doesNotMatch(
    markup,
    /Three older echoes rest on the left\. Your latest traces will settle into the right-hand page\./,
  );

  const desktopBetweenTwoPages = getFirstMatch(
    markup,
    /data-friend-book-user-record-desktop="between-two-pages"[\s\S]*?<\/article>/,
  );
  assert.match(desktopBetweenTwoPages, /APR 12, 2024/);
  assert.doesNotMatch(desktopBetweenTwoPages, /UNWRITTEN/);
  assert.doesNotMatch(desktopBetweenTwoPages, /Between Two Pages/);
  assert.doesNotMatch(desktopBetweenTwoPages, /A page still waiting/);
  assert.doesNotMatch(
    desktopBetweenTwoPages,
    /Find the three quiet marks to leave the first archive note here\./,
  );

  const desktopMoonRun = getFirstMatch(
    markup,
    /data-friend-book-user-record-desktop="moon-run"[\s\S]*?<\/article>/,
  );
  assert.match(desktopMoonRun, /APR 18, 2026/);
  assert.doesNotMatch(desktopMoonRun, /UNWRITTEN/);
  assert.doesNotMatch(desktopMoonRun, /Moon Run/);
  assert.doesNotMatch(desktopMoonRun, /A night run not yet finished/);
  assert.doesNotMatch(
    desktopMoonRun,
    /Stop inside the moon band to write the memory for this slot\./,
  );

  const desktopOneStrokeMark = getFirstMatch(
    markup,
    /data-friend-book-user-record-desktop="one-stroke-mark"[\s\S]*?<\/article>/,
  );
  assert.match(desktopOneStrokeMark, /APR 06, 2026/);
  assert.doesNotMatch(desktopOneStrokeMark, /UNWRITTEN/);
  assert.doesNotMatch(desktopOneStrokeMark, /One Stroke Mark/);
  assert.doesNotMatch(desktopOneStrokeMark, /A trace still unwritten/);
  assert.doesNotMatch(
    desktopOneStrokeMark,
    /Draw one unbroken line to let this page remember you\./,
  );

  const desktopSpringWind = getFirstMatch(
    markup,
    /data-friend-book-sample-entry-desktop="spring-wind"[\s\S]*?<\/article>/,
  );
  assert.doesNotMatch(desktopSpringWind, /APR 12, 2024/);

  const desktopBookSeaDiver = getFirstMatch(
    markup,
    /data-friend-book-sample-entry-desktop="book-sea-diver"[\s\S]*?<\/article>/,
  );
  assert.doesNotMatch(desktopBookSeaDiver, /APR 18, 2026/);

  const desktopNightWatcher = getFirstMatch(
    markup,
    /data-friend-book-sample-entry-desktop="night-watcher"[\s\S]*?<\/article>/,
  );
  assert.doesNotMatch(desktopNightWatcher, /APR 06, 2026/);

  assert.match(markup, /data-friend-book-sample-entry-title="spring-wind"[^>]*text-\[1\.62rem\]/);
  assert.match(markup, /data-friend-book-sample-entry-excerpt="spring-wind"[^>]*text-\[0\.96rem\]/);
});
