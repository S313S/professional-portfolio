import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinalSection from './FriendBookFinalSection';

test('renders a dedicated desktop archive overlay mapped onto the message-board slots', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);

  assert.match(markup, /data-friend-book-preview-desktop="true"/);
  assert.match(markup, /data-friend-book-preview-header="left"/);
  assert.match(markup, /data-friend-book-preview-header="right"/);
  assert.match(markup, /data-friend-book-guestbook-row-left-desktop="0"/);
  assert.match(markup, /data-friend-book-guestbook-row-left-desktop="1"/);
  assert.match(markup, /data-friend-book-guestbook-row-left-desktop="2"/);
  assert.match(markup, /data-friend-book-guestbook-row-right-desktop="0"/);
  assert.match(markup, /data-friend-book-guestbook-row-right-desktop="1"/);
  assert.match(markup, /data-friend-book-guestbook-row-right-desktop="2"/);
  assert.match(markup, /data-friend-book-guestbook-pagination="true"/);
});
