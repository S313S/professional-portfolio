import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { friendBookFinalSectionData } from '../data';
import { createFriendBookGameSession } from './FriendBookFinalSection.logic';
import FriendBookGameOverlay from './FriendBookGameOverlay';
import FriendBookMoonRunStage from './FriendBookMoonRunStage';
import FriendBookFinalSection, {
  FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING,
  FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING,
  FRIEND_BOOK_BUTTON_POSITIONING,
  FRIEND_BOOK_COPY_POSITIONING,
  getBetweenTwoPagesHintsVisibility,
  getBetweenTwoPagesTimerEffectKey,
  getBetweenTwoPagesTargetButtonClassName,
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
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.avatar.x, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.avatar.y, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.title.x, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.title.y, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.seal.x, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.seal.y, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.excerpt.x, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.excerpt.y, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.medal.x, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.medal.y, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.medal.scale, 'number');
  assert.deepEqual(Object.keys(FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.perEntry).sort(), [
    'book-sea-diver',
    'night-watcher',
    'spring-wind',
  ]);
  assert.equal(
    typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.perEntry['spring-wind'].avatar.x,
    'number',
  );
  assert.equal(
    typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.perEntry['spring-wind'].medal.scale,
    'number',
  );
  assert.equal(
    typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.perEntry['book-sea-diver'].seal.y,
    'number',
  );
  assert.equal(
    typeof FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.perEntry['night-watcher'].excerpt.x,
    'number',
  );
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.container.x, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.container.y, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.copy.x, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.copy.y, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.date.x, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.date.y, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.avatar.scale, 'number');
  assert.equal(typeof FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.medal.scale, 'number');
  assert.deepEqual(Object.keys(FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.perSlot).sort(), [
    'between-two-pages',
    'moon-run',
    'one-stroke-mark',
  ]);
  assert.equal(
    typeof FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.perSlot['between-two-pages'].copy.x,
    'number',
  );
  assert.equal(
    typeof FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.perSlot['moon-run'].date.y,
    'number',
  );
  assert.equal(
    typeof FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.perSlot['one-stroke-mark'].medal.scale,
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
  assert.match(markup, /Who’s This\?/);
  assert.match(markup, /Begin/);
  assert.match(markup, /data-friend-book-card-top-spacer="between-two-pages"/);
  assert.match(markup, /data-friend-book-card-top-spacer="moon-run"/);
  assert.match(markup, /data-friend-book-card-top-spacer="one-stroke-mark"/);
  assert.match(markup, /data-friend-book-card-copy="between-two-pages"/);
  assert.match(markup, /data-friend-book-card-copy="moon-run"/);
  assert.match(markup, /data-friend-book-card-copy="one-stroke-mark"/);
  assert.match(markup, /data-friend-book-card-copy-title="moon-run"/);
  assert.match(markup, /data-friend-book-card-copy-description="moon-run"/);
  assert.match(markup, /data-friend-book-sample-entry-avatar-desktop="spring-wind"/);
  assert.match(markup, /data-friend-book-sample-entry-avatar-desktop="book-sea-diver"/);
  assert.match(markup, /data-friend-book-sample-entry-avatar-desktop="night-watcher"/);
  assert.match(markup, /data-friend-book-sample-entry-row-desktop="spring-wind"/);
  assert.match(markup, /data-friend-book-sample-entry-title="spring-wind"/);
  assert.match(markup, /data-friend-book-sample-entry-seal-desktop="book-sea-diver"/);
  assert.match(markup, /data-friend-book-sample-entry-excerpt="night-watcher"/);
  assert.match(markup, /data-friend-book-sample-entry-medal-desktop="spring-wind"/);
  assert.match(markup, /data-friend-book-user-record-container-desktop="between-two-pages"/);
  assert.match(markup, /data-friend-book-user-record-copy-desktop="between-two-pages"/);
  assert.match(markup, /data-friend-book-user-record-date-desktop="between-two-pages"/);
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
  assert.match(markup, /data-friend-book-sample-entry-row-desktop="book-sea-diver"[^>]*style="[^"]*translate\(/);
  assert.match(markup, /data-friend-book-sample-entry-avatar-desktop="spring-wind"[^>]*style="[^"]*translate\(/);
  assert.match(markup, /data-friend-book-sample-entry-medal-desktop="book-sea-diver"[^>]*style="[^"]*scale\(/);
  assert.match(markup, /data-friend-book-user-record-container-desktop="moon-run"[^>]*style="[^"]*translate\(/);
  assert.match(markup, /data-friend-book-user-record-copy-desktop="one-stroke-mark"[^>]*style="[^"]*translate\(/);
  assert.match(markup, /data-friend-book-user-record-date-desktop="between-two-pages"[^>]*style="[^"]*translate\(/);
  assert.doesNotMatch(markup, /Next Chapter \/ 友人帐/);
  assert.doesNotMatch(markup, /A softer public site for work, play, and remembrance\./);
  assert.doesNotMatch(markup, /Not your identity\. The name you’d like me to remember\./);
  assert.doesNotMatch(markup, /Friend Book \/ Play/);
  assert.doesNotMatch(markup, /MVP/);
  assert.doesNotMatch(markup, /Moonlit Echo/);
  assert.doesNotMatch(markup, /Night Keepsake/);
});

test('renders a dedicated full-screen friend-book game overlay for active rounds', () => {
  const activeGame =
    friendBookFinalSectionData.gameCards.find((game) => game.id === 'between-two-pages')!;
  const markup = renderToStaticMarkup(
    <FriendBookGameOverlay
      activeGame={activeGame}
      stage="game-active"
      prompt="Find the three quiet differences before the page closes."
    >
      <div>Overlay body</div>
    </FriendBookGameOverlay>,
  );

  assert.match(markup, /data-friend-book-game-overlay="true"/);
  assert.match(markup, /data-friend-book-overlay-game="between-two-pages"/);
  assert.match(markup, /data-friend-book-overlay-stage="game-active"/);
  assert.match(markup, /Find the three quiet differences before the page closes\./);
  assert.match(markup, /Overlay body/);
});

test('renders the who’s this overlay content with the replacement painting silhouettes', () => {
  const activeGame =
    friendBookFinalSectionData.gameCards.find((game) => game.id === 'one-stroke-mark')!;
  const session = createFriendBookGameSession(
    'one-stroke-mark',
    friendBookFinalSectionData.quizQuestionBank,
    () => 0,
  );
  const currentQuestion = session.quiz!.questions[0]!;
  const markup = renderToStaticMarkup(
    <FriendBookGameOverlay
      activeGame={activeGame}
      stage="game-active"
      prompt={currentQuestion.prompt}
      progressLabel={`1 / ${session.quiz!.questions.length}`}
    >
      <img src={currentQuestion.silhouetteImage} alt="" />
      <p>{currentQuestion.resultCopy}</p>
    </FriendBookGameOverlay>,
  );

  assert.match(markup, /data-friend-book-overlay-game="one-stroke-mark"/);
  assert.match(markup, /Who’s This\?/);
  assert.match(markup, new RegExp(`1 / ${session.quiz!.questions.length}`));
  assert.match(markup, /\/images\/friend-book-quiz\/Painting exam\/拿破仑-剪影图\.png/);
  assert.match(markup, /The rearing horse and cloak point to Napoleon Crossing the Alps\./);
});

test('renders the moon run overlay as a canvas-based stage with preserved in-game HUD and touch controls', () => {
  const activeGame =
    friendBookFinalSectionData.gameCards.find((game) => game.id === 'moon-run')!;
  const session = createFriendBookGameSession('moon-run');
  const markup = renderToStaticMarkup(
    <FriendBookGameOverlay
      activeGame={activeGame}
      stage="game-active"
      prompt="Run across the quiet pages and reach the moon gate."
    >
      <FriendBookMoonRunStage />
    </FriendBookGameOverlay>,
  );

  assert.match(markup, /data-friend-book-overlay-game="moon-run"/);
  assert.match(markup, /Run across the quiet pages and reach the moon gate\./);
  assert.match(markup, /data-moon-run-canvas-shell="true"/);
  assert.match(markup, /data-moon-run-canvas="true"/);
  assert.match(markup, /data-moon-run-touch-controls="true"/);
  assert.match(markup, /data-moon-run-hud="true"/);
  assert.match(markup, /← → Move/);
  assert.match(markup, /Space \/ ↑ Jump/);
  assert.match(markup, /🍡 x 0/);
  assert.doesNotMatch(markup, /Quiet band/);
  assert.doesNotMatch(markup, /Stop this beat/);
  assert.doesNotMatch(markup, /data-moon-run-viewport="true"/);
});

test('between two pages overlay stacks the compared pages vertically to prioritize image reading', () => {
  const activeGame =
    friendBookFinalSectionData.gameCards.find((game) => game.id === 'between-two-pages')!;
  const markup = renderToStaticMarkup(
    <FriendBookGameOverlay
      activeGame={activeGame}
      stage="game-active"
      prompt="Find the three quiet differences before the page closes."
    >
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <div className="mx-auto grid w-full max-w-[640px] grid-cols-1 gap-2 self-start">Scene</div>
        <aside>Sidebar</aside>
      </div>
    </FriendBookGameOverlay>,
  );

  assert.match(markup, /max-w-\[1280px\]/);
  assert.match(markup, /items-start/);
  assert.match(markup, /lg:grid-cols-\[minmax\(0,1fr\)_220px\]/);
  assert.match(markup, /max-w-\[640px\]/);
  assert.match(markup, /grid-cols-1/);
  assert.doesNotMatch(markup, /md:grid-cols-2/);
  assert.match(markup, /gap-2/);
});

test('between two pages target buttons stay visually silent until a difference is found', () => {
  const idleClassName = getBetweenTwoPagesTargetButtonClassName(false);
  const foundClassName = getBetweenTwoPagesTargetButtonClassName(true);

  assert.doesNotMatch(idleClassName, /hover:border/);
  assert.doesNotMatch(idleClassName, /hover:bg/);
  assert.match(idleClassName, /border-transparent/);
  assert.match(foundClassName, /border-transparent/);
});

test('between two pages hides difference names during play and only reveals them after the round on demand', () => {
  const activeState = getBetweenTwoPagesHintsVisibility('active', false);
  const failedBeforeReveal = getBetweenTwoPagesHintsVisibility('failed', false);
  const failedAfterReveal = getBetweenTwoPagesHintsVisibility('failed', true);

  assert.equal(activeState.showHintsToggle, false);
  assert.equal(activeState.showHintsList, false);
  assert.equal(failedBeforeReveal.showHintsToggle, true);
  assert.equal(failedBeforeReveal.showHintsList, false);
  assert.equal(failedAfterReveal.showHintsToggle, true);
  assert.equal(failedAfterReveal.showHintsList, true);
});

test('between two pages timer key ignores mistake-only updates so clicks do not restart the countdown', () => {
  const activeKey = getBetweenTwoPagesTimerEffectKey(
    'game-active',
    'between-two-pages',
    'active',
  );
  const sameActiveKey = getBetweenTwoPagesTimerEffectKey(
    'game-active',
    'between-two-pages',
    'active',
  );
  const failedKey = getBetweenTwoPagesTimerEffectKey(
    'game-active',
    'between-two-pages',
    'failed',
  );

  assert.equal(activeKey, sameActiveKey);
  assert.notEqual(activeKey, failedKey);
});
