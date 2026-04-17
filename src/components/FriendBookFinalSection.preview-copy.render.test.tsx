import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinalSection from './FriendBookFinalSection';

function getFirstMatch(markup: string, pattern: RegExp) {
  const match = markup.match(pattern);
  assert.ok(match, `Expected markup to match ${pattern}`);
  return match[0];
}

test('renders empty guestbook rows as blank placeholders without the old per-game helper copy', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);

  assert.doesNotMatch(
    markup,
    /Three older echoes rest on the left\. Your latest traces will settle into the right-hand page\./,
  );
  assert.doesNotMatch(markup, /Each game keeps one slot on the right\./);
  assert.doesNotMatch(markup, /A page still waiting/);
  assert.doesNotMatch(markup, /A night run not yet finished/);
  assert.doesNotMatch(markup, /A silhouette round still unopened/);

  const desktopFirstLeftRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-left-desktop="0"[\s\S]*?<\/article>/,
  );
  assert.match(
    desktopFirstLeftRow,
    /style="left:3\.9%;top:20%;width:44\.2%;height:22%"/,
  );
  assert.match(desktopFirstLeftRow, /data-friend-book-guestbook-empty="true"/);
  assert.doesNotMatch(desktopFirstLeftRow, /APR 12, 2024/);

  const desktopFirstRightRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-right-desktop="0"[\s\S]*?<\/article>/,
  );
  assert.match(
    desktopFirstRightRow,
    /style="left:51\.5%;top:22\.8%;width:43\.1%;height:16\.0%"/,
  );
  assert.match(desktopFirstRightRow, /data-friend-book-guestbook-empty="true"/);
  assert.doesNotMatch(desktopFirstRightRow, /APR 12, 2024/);

  const desktopLastRightRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-right-desktop="2"[\s\S]*?<\/article>/,
  );
  assert.match(desktopLastRightRow, /data-friend-book-guestbook-empty="true"/);
  assert.doesNotMatch(desktopLastRightRow, /APR 06, 2026/);

  assert.match(markup, /data-friend-book-guestbook-page-indicator="true"[^>]*>1 \/ 1</);
});
