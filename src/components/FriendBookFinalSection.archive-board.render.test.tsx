import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinalSection from './FriendBookFinalSection';

function getFirstMatch(markup: string, pattern: RegExp) {
  const match = markup.match(pattern);
  assert.ok(match, `Expected markup to match ${pattern}`);
  return match[0];
}

test('renders the archive preview on the message-board artwork instead of a plain wrapper', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);

  assert.match(markup, /data-friend-book-archive-board="preview"/);
  assert.match(
    markup,
    /data-friend-book-archive-background="\/images\/BookofFriends_Bg_Message Board\.png"/,
  );
  assert.match(
    markup,
    /data-friend-book-archive-board="preview"[^>]*style="[^"]*background-image:url\(&quot;\/images\/BookofFriends_Bg_Message%20Board\.png&quot;\)/,
  );
});

test('applies the Yozai font hook to all archive entry identity copy', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);

  const firstLeftRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-left-desktop="0"[\s\S]*?<\/article>/,
  );
  const secondLeftRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-left-desktop="1"[\s\S]*?<\/article>/,
  );
  const thirdLeftRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-left-desktop="2"[\s\S]*?<\/article>/,
  );

  assert.match(
    firstLeftRow,
    /data-friend-book-archive-title="true"[^>]*class="[^"]*friend-book-yozai-copy/,
  );
  assert.match(
    firstLeftRow,
    /data-friend-book-archive-body="true"[^>]*class="[^"]*friend-book-yozai-copy/,
  );
  assert.match(
    secondLeftRow,
    /data-friend-book-archive-title="true"[^>]*class="[^"]*friend-book-yozai-copy/,
  );
  assert.match(
    secondLeftRow,
    /data-friend-book-archive-body="true"[^>]*class="[^"]*friend-book-yozai-copy/,
  );
  assert.match(
    thirdLeftRow,
    /data-friend-book-archive-title="true"[^>]*class="[^"]*friend-book-yozai-copy/,
  );
  assert.match(
    thirdLeftRow,
    /data-friend-book-archive-body="true"[^>]*class="[^"]*friend-book-yozai-copy/,
  );
});

test('renders archive entry bodies with unified emphasized sizing and weight', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);
  const firstLeftRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-left-desktop="0"[\s\S]*?<\/article>/,
  );
  const secondLeftRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-left-desktop="1"[\s\S]*?<\/article>/,
  );

  assert.match(
    firstLeftRow,
    /data-friend-book-archive-body="true"[^>]*class="[^"]*text-\[18\.4px\][^"]*font-semibold[^"]*xl:text-\[20\.6px\]/,
  );
  assert.match(
    secondLeftRow,
    /data-friend-book-archive-body="true"[^>]*class="[^"]*text-\[18\.4px\][^"]*font-semibold[^"]*xl:text-\[20\.6px\]/,
  );
});

test('renders archive entry title and body in the same deep warm brown', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);
  const firstLeftRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-left-desktop="0"[\s\S]*?<\/article>/,
  );
  const secondLeftRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-left-desktop="1"[\s\S]*?<\/article>/,
  );

  assert.match(
    firstLeftRow,
    /data-friend-book-archive-title="true"[^>]*class="[^"]*text-\[#241813\]/,
  );
  assert.match(
    firstLeftRow,
    /data-friend-book-archive-body="true"[^>]*class="[^"]*text-\[#241813\]/,
  );
  assert.match(
    secondLeftRow,
    /data-friend-book-archive-title="true"[^>]*class="[^"]*text-\[#241813\]/,
  );
  assert.match(
    secondLeftRow,
    /data-friend-book-archive-body="true"[^>]*class="[^"]*text-\[#241813\]/,
  );
});

test('widens all archive entry text columns by tightening the side columns', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);
  const firstLeftRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-left-desktop="0"[\s\S]*?<\/article>/,
  );
  const secondLeftRow = getFirstMatch(
    markup,
    /data-friend-book-guestbook-row-left-desktop="1"[\s\S]*?<\/article>/,
  );

  assert.match(
    firstLeftRow,
    /data-friend-book-archive-grid="true"[^>]*class="[^"]*grid-cols-\[60px_minmax\(0,1fr\)_72px\][^"]*gap-2[^"]*px-3[^"]*xl:grid-cols-\[70px_minmax\(0,1fr\)_84px\][^"]*xl:px-4/,
  );
  assert.match(
    secondLeftRow,
    /data-friend-book-archive-grid="true"[^>]*class="[^"]*grid-cols-\[60px_minmax\(0,1fr\)_72px\][^"]*gap-2[^"]*px-3[^"]*xl:grid-cols-\[70px_minmax\(0,1fr\)_84px\][^"]*xl:px-4/,
  );
});
