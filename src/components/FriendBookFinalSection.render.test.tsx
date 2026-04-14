import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinalSection from './FriendBookFinalSection';

test('renders the friend-book finale as a compact game-first landing page', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);
  const gameCardMatches = markup.match(/data-friend-book-game-card=/g) ?? [];
  const previewItemMatches = markup.match(/data-friend-book-preview-item=/g) ?? [];

  assert.match(markup, /id="friend-book-finale-section"/);
  assert.match(markup, /Friend Book \/ Play/);
  assert.match(markup, /Where would you like to begin tonight\?/);
  assert.match(
    markup,
    /A few short interactions\. When they end, you can decide whether to leave an echo in the Friend Book\./,
  );
  assert.match(markup, /Start Playing/);
  assert.match(markup, /Open Friend Book/);
  assert.match(markup, /Between Two Pages/);
  assert.match(markup, /Moon Run/);
  assert.match(markup, /One Stroke Mark/);
  assert.match(markup, /Begin/);
  assert.match(markup, /Friend Book Preview/);
  assert.match(markup, /Soft Archive of Tonight/);
  assert.equal(gameCardMatches.length, 3);
  assert.equal(previewItemMatches.length, 3);
  assert.doesNotMatch(markup, /Next Chapter \/ 友人帐/);
  assert.doesNotMatch(markup, /A softer public site for work, play, and remembrance\./);
  assert.doesNotMatch(markup, /Not your identity\. The name you’d like me to remember\./);
  assert.match(markup, /Friend Book/);
  assert.doesNotMatch(markup, /MVP/);
  assert.doesNotMatch(markup, /Moonlit Echo/);
  assert.doesNotMatch(markup, /Night Keepsake/);
});
