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
  assert.match(
    desktopSpringWind,
    /data-friend-book-sample-entry-seal-desktop="spring-wind"[\s\S]*?>Moon Seal<\/span>/,
  );
  assert.match(desktopSpringWind, /background-color:rgba\(238,205,206,0\.72\)/);
  assert.match(desktopSpringWind, /border-color:#d7a7a6/);
  assert.match(desktopSpringWind, /color:#7a5450/);

  const desktopBookSeaDiver = getFirstMatch(
    markup,
    /data-friend-book-sample-entry-desktop="book-sea-diver"[\s\S]*?<\/article>/,
  );
  assert.doesNotMatch(desktopBookSeaDiver, /APR 18, 2026/);
  assert.match(
    desktopBookSeaDiver,
    /data-friend-book-sample-entry-seal-desktop="book-sea-diver"[\s\S]*?>Wind Mark<\/span>/,
  );
  assert.match(desktopBookSeaDiver, /background-color:rgba\(214,225,194,0\.84\)/);
  assert.match(desktopBookSeaDiver, /border-color:#b4c69a/);
  assert.match(desktopBookSeaDiver, /color:#66724a/);

  const desktopNightWatcher = getFirstMatch(
    markup,
    /data-friend-book-sample-entry-desktop="night-watcher"[\s\S]*?<\/article>/,
  );
  assert.doesNotMatch(desktopNightWatcher, /APR 06, 2026/);
  assert.match(
    desktopNightWatcher,
    /data-friend-book-sample-entry-seal-desktop="night-watcher"[\s\S]*?>Night Watch Echo<\/span>/,
  );
  assert.match(desktopNightWatcher, /background-color:rgba\(221,210,225,0\.78\)/);
  assert.match(desktopNightWatcher, /border-color:#c0b0c7/);
  assert.match(desktopNightWatcher, /color:#6b5e74/);

  assert.match(markup, /data-friend-book-sample-entry-title="spring-wind"[^>]*text-\[1\.62rem\]/);
  assert.match(markup, /data-friend-book-sample-entry-excerpt="spring-wind"[^>]*text-\[0\.96rem\]/);
});
