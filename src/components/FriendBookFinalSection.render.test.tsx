import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinalSection from './FriendBookFinalSection';

test('renders the friend-book finale with pillars, thesis, and preview entries', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);

  assert.match(markup, /id="friend-book-finale-section"/);
  assert.match(markup, /Next Chapter \/ 友人帐/);
  assert.match(markup, /A softer public site for work, play, and remembrance\./);
  assert.match(markup, /Works/);
  assert.match(markup, /Play/);
  assert.match(markup, /Leave a Name/);
  assert.match(markup, /Friend Book/);
  assert.match(markup, /Not your identity\. The name you’d like me to remember\./);
  assert.match(markup, /MVP/);
  assert.match(markup, /Moonlit Echo/);
  assert.match(markup, /Paper Trail/);
  assert.match(markup, /Night Keepsake/);
  assert.match(markup, /Late-night prototype/);
  assert.match(markup, /Game ending/);
  assert.match(markup, /Work page/);
});
