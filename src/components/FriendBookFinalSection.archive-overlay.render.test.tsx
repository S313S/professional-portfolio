import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinalSection from './FriendBookFinalSection';

test('renders a dedicated desktop archive overlay mapped onto the message-board slots', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);

  assert.match(markup, /data-friend-book-preview-desktop="true"/);
  assert.match(
    markup,
    /data-friend-book-preview-sample-stack="true"[^>]*style="[^"]*transform:translateY\(-18px\)/,
  );
  assert.match(markup, /data-friend-book-preview-header="left"/);
  assert.match(markup, /data-friend-book-preview-header="right"/);
  assert.match(markup, /data-friend-book-sample-entry-desktop="spring-wind"/);
  assert.match(markup, /data-friend-book-sample-entry-desktop="book-sea-diver"/);
  assert.match(markup, /data-friend-book-sample-entry-desktop="night-watcher"/);
  assert.match(markup, /data-friend-book-user-record-desktop="between-two-pages"/);
  assert.match(markup, /data-friend-book-user-record-desktop="moon-run"/);
  assert.match(markup, /data-friend-book-user-record-desktop="one-stroke-mark"/);
});
