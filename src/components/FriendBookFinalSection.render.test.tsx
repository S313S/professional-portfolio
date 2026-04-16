import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import FriendBookFinalSection, {
  FRIEND_BOOK_BUTTON_POSITIONING,
  FRIEND_BOOK_COPY_POSITIONING,
} from './FriendBookFinalSection';

test('exports centralized positioning configs for the friend-book landing controls and copy', () => {
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.hero.primary.x, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.hero.primary.y, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.startPlaying.x, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.startPlaying.y, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.startPlaying.width.mobile, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.startPlaying.width.desktop, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.openFriendBook.x, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.openFriendBook.y, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.openFriendBook.width.mobile, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.openFriendBook.width.desktop, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.gameCards.shared.x, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.gameCards.shared.y, 'number');
  assert.deepEqual(Object.keys(FRIEND_BOOK_BUTTON_POSITIONING.gameCards.perCard).sort(), [
    'between-two-pages',
    'moon-run',
    'one-stroke-mark',
  ]);
  assert.equal(
    typeof FRIEND_BOOK_BUTTON_POSITIONING.gameCards.perCard['between-two-pages'].x,
    'number',
  );
  assert.equal(
    typeof FRIEND_BOOK_BUTTON_POSITIONING.gameCards.perCard['between-two-pages'].y,
    'number',
  );
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.gameCards.perCard['moon-run'].x, 'number');
  assert.equal(typeof FRIEND_BOOK_BUTTON_POSITIONING.gameCards.perCard['moon-run'].y, 'number');
  assert.equal(
    typeof FRIEND_BOOK_BUTTON_POSITIONING.gameCards.perCard['one-stroke-mark'].x,
    'number',
  );
  assert.equal(
    typeof FRIEND_BOOK_BUTTON_POSITIONING.gameCards.perCard['one-stroke-mark'].y,
    'number',
  );
  assert.equal(typeof FRIEND_BOOK_COPY_POSITIONING.gameCards.shared.container.x, 'number');
  assert.equal(typeof FRIEND_BOOK_COPY_POSITIONING.gameCards.shared.container.y, 'number');
  assert.equal(typeof FRIEND_BOOK_COPY_POSITIONING.gameCards.shared.title.x, 'number');
  assert.equal(typeof FRIEND_BOOK_COPY_POSITIONING.gameCards.shared.title.y, 'number');
  assert.equal(typeof FRIEND_BOOK_COPY_POSITIONING.gameCards.shared.description.x, 'number');
  assert.equal(typeof FRIEND_BOOK_COPY_POSITIONING.gameCards.shared.description.y, 'number');
  assert.deepEqual(Object.keys(FRIEND_BOOK_COPY_POSITIONING.gameCards.perCard).sort(), [
    'between-two-pages',
    'moon-run',
    'one-stroke-mark',
  ]);
  assert.equal(
    typeof FRIEND_BOOK_COPY_POSITIONING.gameCards.perCard['moon-run'].container.x,
    'number',
  );
  assert.equal(
    typeof FRIEND_BOOK_COPY_POSITIONING.gameCards.perCard['moon-run'].title.y,
    'number',
  );
  assert.equal(
    typeof FRIEND_BOOK_COPY_POSITIONING.gameCards.perCard['moon-run'].description.x,
    'number',
  );
});

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
  assert.match(markup, /data-friend-book-button-anchor="hero-primary"/);
  assert.match(markup, /data-friend-book-button-anchor="hero-secondary-start-playing"/);
  assert.match(markup, /data-friend-book-button-anchor="hero-secondary-open-friend-book"/);
  assert.match(markup, /data-friend-book-button-size="hero-secondary-start-playing"/);
  assert.match(markup, /data-friend-book-button-size="hero-secondary-open-friend-book"/);
  assert.match(markup, /data-friend-book-button-anchor="game-card-between-two-pages"/);
  assert.match(markup, /data-friend-book-button-anchor="game-card-moon-run"/);
  assert.match(markup, /data-friend-book-button-anchor="game-card-one-stroke-mark"/);
  assert.match(markup, /Between Two Pages/);
  assert.match(markup, /Moon Run/);
  assert.match(markup, /One Stroke Mark/);
  assert.match(markup, /Begin/);
  assert.match(markup, /data-friend-book-card-top-spacer="between-two-pages"/);
  assert.match(markup, /data-friend-book-card-top-spacer="moon-run"/);
  assert.match(markup, /data-friend-book-card-top-spacer="one-stroke-mark"/);
  assert.match(markup, /data-friend-book-card-copy="between-two-pages"/);
  assert.match(markup, /data-friend-book-card-copy="moon-run"/);
  assert.match(markup, /data-friend-book-card-copy="one-stroke-mark"/);
  assert.match(markup, /data-friend-book-card-copy-title="moon-run"/);
  assert.match(markup, /data-friend-book-card-copy-description="moon-run"/);
  assert.doesNotMatch(markup, /rounded-full bg-\[rgba\(255,247,238,0\.74\)\] px-3 py-1 text-\[0\.68rem\] uppercase tracking-\[0\.18em\] text-\[#62483a\]/);
  assert.doesNotMatch(markup, /inline-flex h-10 w-10 items-center justify-center rounded-full border border-\[#b99774\]/);
  assert.doesNotMatch(markup, /lucide-search h-4 w-4/);
  assert.doesNotMatch(markup, /lucide-moon-star h-4 w-4/);
  assert.doesNotMatch(markup, /lucide-pen-line h-4 w-4/);
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
