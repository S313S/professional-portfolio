import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinalSection from './FriendBookFinalSection';

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
