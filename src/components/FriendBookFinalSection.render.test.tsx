import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinalSection from './FriendBookFinalSection';

test('renders the friend-book finale as a paper-book landing scene with sample archive and user slots', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);
  const gameCardMatches = markup.match(/data-friend-book-game-card=/g) ?? [];
  const sampleEntryMatches = markup.match(/data-friend-book-sample-entry=/g) ?? [];
  const userRecordMatches = markup.match(/data-friend-book-user-record=/g) ?? [];

  assert.match(markup, /id="friend-book-finale-section"/);
  assert.match(markup, /data-friend-book-stage="landing"/);
  assert.match(markup, /THE BOOK OF FRIENDS \//);
  assert.match(markup, /友人帐 \(BOOK OF FRIENDS\)/);
  assert.match(markup, /Where would you like to begin tonight\?/);
  assert.match(markup, /THE BOOK OF FRIENDS \/ 友人帐 \(BOOK OF FRIENDS\)/);
  assert.match(
    markup,
    /A few short interactions\. When they end, you can decide whether to leave an echo in the Friend Book\./,
  );
  assert.match(markup, /\/images\/BookofFriends_Bg01\.png/);
  assert.match(markup, /\/images\/BookofFriends_Bg02\.png/);
  assert.match(markup, /\/images\/BookofFriends_Bg_CatBook_Left\.png/);
  assert.match(markup, /\/images\/BookofFriends_Bg_CatBook_middle\.png/);
  assert.match(markup, /\/images\/BookofFriends_Bg_CatBook_Right\.png/);
  assert.match(markup, /\/images\/BookofFriends_Bg_Message Board\.png/);
  assert.match(markup, /\/images\/BookofFriends_Btn0_StartPlaying\.png/);
  assert.match(markup, /\/images\/BookofFriends_Btn0_StartPlayingArrow\.png/);
  assert.match(markup, /\/images\/BookofFriends_Btn0_OpenFriendBook\.png/);
  assert.match(markup, /\/images\/BookofFriends_Btn_Begin\.png/);
  assert.match(markup, /Start Playing/);
  assert.match(markup, /Open Friend Book/);
  assert.match(markup, /Between Two Pages/);
  assert.match(markup, /Moon Run/);
  assert.match(markup, /One Stroke Mark/);
  assert.match(markup, /Begin/);
  assert.match(markup, /ARCHIVE OF BONDS/);
  assert.match(markup, /Soft Archive of Tonight/);
  assert.match(markup, /樱花季的风/);
  assert.match(markup, /书海潜水员/);
  assert.match(markup, /深夜守望者/);
  assert.equal(gameCardMatches.length, 3);
  assert.equal(sampleEntryMatches.length, 3);
  assert.equal(userRecordMatches.length, 3);
  assert.doesNotMatch(markup, /Next Chapter \/ 友人帐/);
  assert.doesNotMatch(markup, /A softer public site for work, play, and remembrance\./);
  assert.doesNotMatch(markup, /Not your identity\. The name you’d like me to remember\./);
  assert.doesNotMatch(markup, /Friend Book \/ Play/);
  assert.doesNotMatch(markup, /MVP/);
  assert.doesNotMatch(markup, /Moonlit Echo/);
  assert.doesNotMatch(markup, /Night Keepsake/);
});
