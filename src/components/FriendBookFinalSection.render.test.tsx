import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import { friendBookFinalSectionData } from '../data';
import {
  createDefaultFriendBookProgress,
  createFriendBookGameSession,
  upsertFriendBookGuestbookEntry,
} from './FriendBookFinalSection.logic';
import FriendBookGameOverlay from './FriendBookGameOverlay';
import FriendBookMoonRunStage from './FriendBookMoonRunStage';
import FriendBookFinalSection, {
  FRIEND_BOOK_BETWEEN_TWO_PAGES_TARGET_POSITIONING,
  FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING,
  FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING,
  FRIEND_BOOK_BUTTON_POSITIONING,
  FRIEND_BOOK_COPY_POSITIONING,
  getBetweenTwoPagesHintsVisibility,
  getBetweenTwoPagesTargetFrame,
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

test('exports centralized target positioning for between two pages hotspots', () => {
  const scene = friendBookFinalSectionData.betweenTwoPagesScenes[0]!;
  const target = scene.targets[0]!;
  const frame = getBetweenTwoPagesTargetFrame(scene.id, target);

  assert.equal(
    FRIEND_BOOK_BETWEEN_TWO_PAGES_TARGET_POSITIONING['moon-cottage']['moon-stamp'].x,
    17,
  );
  assert.equal(
    FRIEND_BOOK_BETWEEN_TWO_PAGES_TARGET_POSITIONING['moon-cottage']['moon-stamp'].height,
    18,
  );
  assert.deepEqual(frame, {
    x: 17,
    y: 15,
    width: 18,
    height: 18,
  });
});

test('renders the friend-book finale as a paper-book landing scene with five seeded guestbook rows across two pages', () => {
  const markup = renderToStaticMarkup(<FriendBookFinalSection />);
  const gameCardMatches = markup.match(/data-friend-book-game-card=/g) ?? [];
  const guestbookMobileMatches = markup.match(/data-friend-book-guestbook-row-mobile=/g) ?? [];

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
  assert.match(markup, /data-friend-book-guestbook-row-left-desktop="0"/);
  assert.match(markup, /data-friend-book-guestbook-row-left-desktop="1"/);
  assert.match(markup, /data-friend-book-guestbook-row-left-desktop="2"/);
  assert.match(markup, /data-friend-book-guestbook-row-right-desktop="0"/);
  assert.match(markup, /data-friend-book-guestbook-row-right-desktop="1"/);
  assert.match(markup, /data-friend-book-guestbook-row-right-desktop="2"/);
  assert.match(markup, /data-friend-book-guestbook-pagination="true"/);
  assert.match(markup, /data-friend-book-guestbook-page-indicator="true"[^>]*>1 \/ 2</);
  assert.match(markup, /林间拾页人/);
  assert.match(markup, /夜航漫游者/);
  assert.match(markup, /纸边侦探/);
  assert.match(markup, /Two Pages/);
  assert.match(markup, /Moon Run/);
  assert.match(markup, /Who&#x27;s This/);
  assert.doesNotMatch(markup, /rounded-full bg-\[rgba\(255,247,238,0\.74\)\] px-3 py-1 text-\[0\.68rem\] uppercase tracking-\[0\.18em\] text-\[#62483a\]/);
  assert.doesNotMatch(markup, /inline-flex h-10 w-10 items-center justify-center rounded-full border border-\[#b99774\]/);
  assert.doesNotMatch(markup, /lucide-search h-4 w-4/);
  assert.doesNotMatch(markup, /lucide-moon-star h-4 w-4/);
  assert.doesNotMatch(markup, /lucide-pen-line h-4 w-4/);
  assert.match(markup, /ARCHIVE OF BONDS/);
  assert.match(markup, /Soft Archive of Tonight/);
  assert.match(markup, /Visitor guestbook/);
  assert.equal(gameCardMatches.length, 3);
  assert.equal(guestbookMobileMatches.length, 3);
  assert.doesNotMatch(markup, /Next Chapter \/ 友人帐/);
  assert.doesNotMatch(markup, /A softer public site for work, play, and remembrance\./);
  assert.doesNotMatch(markup, /Not your identity\. The name you’d like me to remember\./);
  assert.doesNotMatch(markup, /Friend Book \/ Play/);
  assert.doesNotMatch(markup, /MVP/);
  assert.doesNotMatch(markup, /Moonlit Echo/);
  assert.doesNotMatch(markup, /Night Keepsake/);
  assert.doesNotMatch(markup, /Each game keeps one slot on the right\./);
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

test('renders between two pages as page-local transparent hotspots with fixed markers', () => {
  const scene = friendBookFinalSectionData.betweenTwoPagesScenes[0]!;
  const markup = renderToStaticMarkup(
    <FriendBookFinalSection
      initialStage="game-active"
      initialActiveGameId="between-two-pages"
    />,
  );

  assert.match(markup, /data-friend-book-difference-page="left"/);
  assert.match(markup, /data-friend-book-difference-page="right"/);
  assert.match(markup, /data-friend-book-difference-miss-zone="left"/);
  assert.match(markup, /data-friend-book-difference-miss-zone="right"/);

  for (const [index, target] of scene.targets.entries()) {
    const markerPattern = new RegExp(
      `data-friend-book-difference-marker="left-${target.id}"`,
    );
    const rightMarkerPattern = new RegExp(
      `data-friend-book-difference-marker="right-${target.id}"`,
    );

    assert.match(
      markup,
      new RegExp(`data-friend-book-difference-hotspot="left-${target.id}"`),
    );
    assert.match(
      markup,
      new RegExp(`data-friend-book-difference-hotspot="right-${target.id}"`),
    );
    assert.match(
      markup,
      new RegExp(`data-friend-book-difference-debug-outline="left-${target.id}"`),
    );
    assert.match(
      markup,
      new RegExp(`data-friend-book-difference-debug-outline="right-${target.id}"`),
    );
    assert.match(
      markup,
      new RegExp(`data-friend-book-difference-debug-badge="left-${target.id}"[^>]*>${index + 1}<`),
    );
    assert.match(
      markup,
      new RegExp(`data-friend-book-difference-debug-badge="right-${target.id}"[^>]*>${index + 1}<`),
    );
    assert.match(markup, new RegExp(`aria-label="${target.label}"`));
    assert.doesNotMatch(markup, markerPattern);
    assert.doesNotMatch(markup, rightMarkerPattern);
  }
});

test('renders fixed markers on both pages after a difference has already been found', () => {
  const scene = friendBookFinalSectionData.betweenTwoPagesScenes[0]!;
  const foundTarget = scene.targets[0]!;
  const session = createFriendBookGameSession(
    'between-two-pages',
    friendBookFinalSectionData.quizQuestionBank,
    () => 0,
    { betweenTwoPagesSceneId: scene.id },
  );

  session.betweenTwoPages = {
    ...session.betweenTwoPages!,
    foundSpotIds: [foundTarget.id],
  };

  const markup = renderToStaticMarkup(
    <FriendBookFinalSection
      initialStage="game-active"
      initialActiveGameId="between-two-pages"
      initialGameSession={session}
    />,
  );

  assert.match(
    markup,
    new RegExp(`data-friend-book-difference-marker="left-${foundTarget.id}"`),
  );
  assert.match(
    markup,
    new RegExp(`data-friend-book-difference-marker="right-${foundTarget.id}"`),
  );
  assert.doesNotMatch(
    markup,
    new RegExp(`data-friend-book-difference-hotspot="left-${foundTarget.id}"`),
  );
  assert.doesNotMatch(
    markup,
    new RegExp(`data-friend-book-difference-hotspot="right-${foundTarget.id}"`),
  );
});

test('between two pages target buttons expose visible debug outlines until a difference is found', () => {
  const idleClassName = getBetweenTwoPagesTargetButtonClassName(false);
  const foundClassName = getBetweenTwoPagesTargetButtonClassName(true);

  assert.doesNotMatch(idleClassName, /hover:border/);
  assert.doesNotMatch(idleClassName, /hover:bg/);
  assert.match(idleClassName, /border-\[#d95c55\]/);
  assert.match(idleClassName, /bg-\[rgba\(217,92,85,0\.12\)\]/);
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

test('renders a real guestbook spread with aligned left identity cards and right portfolio reviews', () => {
  let progress = createDefaultFriendBookProgress({ includeSeedGuestbook: false });
  progress = upsertFriendBookGuestbookEntry(progress, {
    nickname: 'Archive Walker',
    identityIntro: 'A quiet builder who likes slow interfaces.',
    portfolioReview: 'This portfolio feels unusually deliberate from start to finish.',
    latestGameId: 'between-two-pages',
    avatarId: 'cat',
    medalId: '/images/PurpleMedal01.png',
    displayDate: 'APR 17, 2026',
    updatedAt: '2026-04-17T12:00:00.000Z',
  });
  progress = upsertFriendBookGuestbookEntry(progress, {
    nickname: 'Moon Librarian',
    identityIntro: 'A night reader who remembers texture first.',
    portfolioReview: 'The whole site reads like a curated room instead of a grid.',
    latestGameId: 'moon-run',
    avatarId: 'dog',
    medalId: '/images/GreenMedal01.png',
    displayDate: 'APR 18, 2026',
    updatedAt: '2026-04-18T12:00:00.000Z',
  });
  progress = upsertFriendBookGuestbookEntry(progress, {
    nickname: 'Paper Signal',
    identityIntro: 'A product operator who notices pacing.',
    portfolioReview: 'The transitions make the work feel authored rather than stacked.',
    latestGameId: 'one-stroke-mark',
    avatarId: 'rabbit',
    medalId: '/images/Animalmedals04.png',
    displayDate: 'APR 19, 2026',
    updatedAt: '2026-04-19T12:00:00.000Z',
  });

  const markup = renderToStaticMarkup(
    <FriendBookFinalSection initialProgress={progress} />,
  );

  assert.match(markup, /data-friend-book-guestbook-row-left-desktop="0"/);
  assert.match(markup, /data-friend-book-guestbook-row-right-desktop="0"/);
  assert.match(markup, /Archive Walker/);
  assert.match(markup, /Two Pages/);
  assert.match(markup, /A quiet builder who likes slow interfaces\./);
  assert.match(markup, /This portfolio feels unusually deliberate from start to finish\./);
  assert.match(markup, /APR 17, 2026/);
  assert.match(markup, /data-friend-book-guestbook-pagination="true"/);
  assert.doesNotMatch(markup, /Each game keeps one slot on the right\./);
});

test('renders guestbook pagination with the newest partial page bottom-aligned', () => {
  let progress = createDefaultFriendBookProgress({ includeSeedGuestbook: false });
  for (const [index, nickname] of ['Aster', 'Birch', 'Cinder', 'Dawn'].entries()) {
    progress = upsertFriendBookGuestbookEntry(progress, {
      nickname,
      identityIntro: `${nickname} intro`,
      portfolioReview: `${nickname} review`,
      latestGameId: 'moon-run',
      updatedAt: `2026-04-1${index}T12:00:00.000Z`,
    });
  }

  const markup = renderToStaticMarkup(
    <FriendBookFinalSection initialProgress={progress} initialGuestbookPage={1} />,
  );

  assert.match(markup, /data-friend-book-guestbook-page-indicator="true"[^>]*>2 \/ 2</);
  assert.match(
    markup,
    /data-friend-book-guestbook-row-left-desktop="0"[\s\S]*?data-friend-book-guestbook-empty="true"/,
  );
  assert.match(markup, /data-friend-book-guestbook-row-left-desktop="0"[\s\S]*?Dawn/);
  assert.match(markup, /data-friend-book-guestbook-row-left-desktop="1"[\s\S]*?data-friend-book-guestbook-empty="true"/);
  assert.match(markup, /data-friend-book-guestbook-row-left-desktop="2"[\s\S]*?data-friend-book-guestbook-empty="true"/);
});

test('renders the unified guestbook editor with nickname, identity intro, and portfolio review fields', () => {
  const markup = renderToStaticMarkup(
    <FriendBookFinalSection
      initialStage="note-entry"
      initialActiveGameId="moon-run"
    />,
  );

  assert.match(markup, /Leave a page in the guestbook/);
  assert.match(markup, /Nickname/);
  assert.match(markup, /How should this book remember you/);
  assert.match(markup, /What do you think of the portfolio as a whole/);
  assert.doesNotMatch(markup, /Tonight&#x27;s note/);
});

test('shows a delete action in the guestbook editor when the typed nickname already exists', { concurrency: false }, () => {
  let progress = createDefaultFriendBookProgress({ includeSeedGuestbook: false });
  progress = upsertFriendBookGuestbookEntry(progress, {
    nickname: '小辞',
    identityIntro: '一个不会代码的工程师',
    portfolioReview: '真牛逼呀，老铁',
    latestGameId: 'moon-run',
    avatarId: 'cat',
    medalId: '/images/GreenMedal01.png',
    displayDate: 'APR 17, 2026',
    updatedAt: '2026-04-17T12:00:00.000Z',
  });

  const markup = renderToStaticMarkup(
    <FriendBookFinalSection
      initialProgress={progress}
      initialStage="note-entry"
      initialActiveGameId="moon-run"
      initialNicknameDraft="小辞"
    />,
  );

  assert.match(markup, /Delete This Record/);
  assert.match(markup, /This will remove 小辞 from the guestbook only\./);
});
