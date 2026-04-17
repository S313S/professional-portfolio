import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { existsSync } from 'node:fs';

import { friendBookFinalSectionData } from '../data.tsx';
import {
  FRIEND_BOOK_HIDDEN_AVATAR_ID,
  FRIEND_BOOK_STORAGE_KEY,
  answerFriendBookQuizQuestion,
  advanceFriendBookQuizQuestion,
  completeBetweenTwoPagesRound,
  completeFriendBookGameSession,
  createDefaultFriendBookProgress,
  createFriendBookGameSession,
  createFriendBookQuizRound,
  getAvailableFriendBookAvatarIds,
  getFriendBookGameStartStage,
  getNextBetweenTwoPagesSceneRotation,
  hydrateFriendBookProgress,
  persistFriendBookProgress,
  resolveBetweenTwoPagesSpotSelection,
  getMoonRunRoundSummary,
  stepMoonRunSession,
} from './FriendBookFinalSection.logic.ts';

function createMemoryStorage(seed: Record<string, string> = {}) {
  const map = new Map(Object.entries(seed));

  return {
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      map.set(key, value);
    },
    dump() {
      return Object.fromEntries(map.entries());
    },
  };
}

test('hydrate merges persisted friend-book progress with default slots and avatars', () => {
  const storage = createMemoryStorage({
    [FRIEND_BOOK_STORAGE_KEY]: JSON.stringify({
      selectedAvatarId: 'dog',
      unlockedAvatarIds: ['cat-pi', 'cat', 'dog', 'rabbit', 'tree'],
      games: {
        'moon-run': {
          completionCount: 1,
          latestAvatarId: 'dog',
          latestDate: 'APR 16, 2026',
          latestMedalId: '/images/GreenMedal03.png',
          latestNote: 'Timed the jump just right.',
        },
      },
    }),
  });

  const progress = hydrateFriendBookProgress(storage);

  assert.equal(progress.selectedAvatarId, 'dog');
  assert.equal(progress.games['moon-run'].completionCount, 1);
  assert.equal(progress.games['between-two-pages'].completionCount, 0);
  assert.equal(progress.games['one-stroke-mark'].latestNote, '');
  assert.equal(progress.allGamesCompleted, false);
});

test('hydrate drops invalid avatar ids from persisted progress instead of trusting arbitrary strings', () => {
  const storage = createMemoryStorage({
    [FRIEND_BOOK_STORAGE_KEY]: JSON.stringify({
      selectedAvatarId: 'ghost-cat',
      games: {
        'between-two-pages': {
          completionCount: 1,
          latestAvatarId: 'ghost-cat',
          latestDate: 'APR 16, 2026',
          latestMedalId: '/images/Animalmedals01.png',
          latestNote: 'A note with a stale avatar.',
        },
      },
    }),
  });

  const progress = hydrateFriendBookProgress(storage);

  assert.equal(progress.selectedAvatarId, null);
  assert.equal(progress.games['between-two-pages'].latestAvatarId, null);
});

test('game start routes to avatar selection before the first avatar is chosen', () => {
  const progress = createDefaultFriendBookProgress();

  assert.equal(
    getFriendBookGameStartStage(progress, 'between-two-pages'),
    'avatar-select',
  );
  assert.equal(
    getFriendBookGameStartStage(
      {
        ...progress,
        selectedAvatarId: 'cat',
      },
      'between-two-pages',
    ),
    'game-active',
  );
});

test('completing all three games unlocks the hidden avatar', () => {
  let progress = createDefaultFriendBookProgress();

  progress = completeFriendBookGameSession(progress, {
    gameId: 'between-two-pages',
    note: 'Found the quiet differences.',
    displayDate: 'APR 16, 2026',
    randomValue: 0.05,
  });
  progress = completeFriendBookGameSession(progress, {
    gameId: 'moon-run',
    note: 'Caught the rhythm of the moon.',
    displayDate: 'APR 16, 2026',
    randomValue: 0.25,
  });

  assert.equal(progress.allGamesCompleted, false);
  assert.equal(
    getAvailableFriendBookAvatarIds(progress).includes(FRIEND_BOOK_HIDDEN_AVATAR_ID),
    false,
  );

  progress = completeFriendBookGameSession(progress, {
    gameId: 'one-stroke-mark',
    note: 'Left a clean trace for tonight.',
    displayDate: 'APR 16, 2026',
    randomValue: 0.75,
  });

  assert.equal(progress.allGamesCompleted, true);
  assert.equal(
    getAvailableFriendBookAvatarIds(progress).includes(FRIEND_BOOK_HIDDEN_AVATAR_ID),
    true,
  );
});

test('replaying a game rerolls its medal and overwrites only that game slot', () => {
  let progress = completeFriendBookGameSession(createDefaultFriendBookProgress(), {
    gameId: 'moon-run',
    note: 'First moon run.',
    displayDate: 'APR 16, 2026',
    randomValue: 0.1,
  });

  progress = completeFriendBookGameSession(progress, {
    gameId: 'moon-run',
    note: 'Second moon run.',
    displayDate: 'APR 17, 2026',
    randomValue: 0.9,
  });

  assert.equal(progress.games['moon-run'].completionCount, 2);
  assert.equal(progress.games['moon-run'].latestNote, 'Second moon run.');
  assert.equal(progress.games['moon-run'].latestDate, 'APR 17, 2026');
  assert.notEqual(
    progress.games['moon-run'].latestMedalId,
    '/images/GreenMedal01.png',
  );
  assert.equal(progress.games['between-two-pages'].completionCount, 0);
});

test('completing a game does not persist invalid avatar ids back into progress', () => {
  const progress = completeFriendBookGameSession(createDefaultFriendBookProgress(), {
    gameId: 'moon-run',
    note: 'A round with invalid avatar input.',
    displayDate: 'APR 16, 2026',
    medalId: '/images/GreenMedal01.png',
    avatarId: 'ghost-cat' as never,
  });

  assert.equal(progress.selectedAvatarId, null);
  assert.equal(progress.games['moon-run'].latestAvatarId, null);
});

test('difference game completes after all hidden spots are found', () => {
  const targetIds = ['moon-stamp', 'cat-tail', 'page-fold'];
  const first = resolveBetweenTwoPagesSpotSelection([], 'moon-stamp', targetIds);
  const second = resolveBetweenTwoPagesSpotSelection(first.foundSpotIds, 'cat-tail', targetIds);
  const third = resolveBetweenTwoPagesSpotSelection(second.foundSpotIds, 'page-fold', targetIds);

  assert.equal(first.isComplete, false);
  assert.equal(second.isComplete, false);
  assert.deepEqual(third.foundSpotIds, ['moon-stamp', 'cat-tail', 'page-fold']);
  assert.equal(third.isComplete, true);
});

test('between two pages scene bank exposes at least two paired illustrations with valid targets', () => {
  const scenes = Reflect.get(friendBookFinalSectionData, 'betweenTwoPagesScenes') as
    | Array<{
        id?: string;
        baseImage?: string;
        variantImage?: string;
        aspectRatio?: number;
        targets?: Array<{ id?: string; label?: string; width?: number; height?: number }>;
      }>
    | undefined;

  assert.equal(Array.isArray(scenes), true);
  assert.equal((scenes?.length ?? 0) >= 3, true);
  assert.equal(new Set(scenes?.map((scene) => scene.id)).size, scenes?.length);

  for (const scene of scenes ?? []) {
    assert.equal(typeof scene.baseImage, 'string');
    assert.equal(typeof scene.variantImage, 'string');
    assert.equal(typeof scene.aspectRatio, 'number');
    assert.equal(scene.targets?.length, 3);
    assert.equal(new Set(scene.targets?.map((target) => target.id)).size, 3);
    assert.equal(new Set(scene.targets?.map((target) => target.label)).size, 3);
    assert.equal(
      scene.targets?.every(
        (target) =>
          typeof target.width === 'number' &&
          typeof target.height === 'number' &&
          target.width <= 18 &&
          target.height <= 18,
      ),
      true,
    );
    assert.equal(
      existsSync(path.join(process.cwd(), 'public', scene.baseImage!.slice(1))),
      true,
    );
    assert.equal(
      existsSync(path.join(process.cwd(), 'public', scene.variantImage!.slice(1))),
      true,
    );
  }

  const targetIdSignatures = (scenes ?? []).map((scene) =>
    scene.targets?.map((target) => target.id).join('|'),
  );
  assert.equal(new Set(targetIdSignatures).size, scenes?.length);
});

test('between two pages scene-specific target coordinates stay aligned to the calibrated v2 and v3 difference areas', () => {
  const sceneById = Object.fromEntries(
    friendBookFinalSectionData.betweenTwoPagesScenes.map((scene) => [scene.id, scene]),
  );

  assert.deepEqual(
    sceneById['moon-bridge']?.targets.map(({ id, x, y, width, height }) => ({
      id,
      x,
      y,
      width,
      height,
    })),
    [
      { id: 'bridge-lantern', x: 74, y: 56, width: 11, height: 18 },
      { id: 'tea-cup', x: 63, y: 80, width: 10, height: 12 },
      { id: 'bamboo-cluster', x: 61, y: 36, width: 15, height: 18 },
    ],
  );
  assert.deepEqual(
    sceneById['moon-shrine']?.targets.map(({ id, x, y, width, height }) => ({
      id,
      x,
      y,
      width,
      height,
    })),
    [
      { id: 'torii-plaque', x: 39, y: 34, width: 10, height: 10 },
      { id: 'blossom-branch', x: 58, y: 38, width: 15, height: 16 },
      { id: 'cushion-tassel', x: 88, y: 79, width: 10, height: 15 },
    ],
  );
});

test('between two pages first scene keeps a wider moon target so the visible lunar difference is clickable', () => {
  const firstScene = friendBookFinalSectionData.betweenTwoPagesScenes.find(
    (scene) => scene.id === 'moon-cottage',
  );
  const moonTarget = firstScene?.targets.find((target) => target.id === 'moon-stamp');

  assert.deepEqual(moonTarget, {
    id: 'moon-stamp',
    label: 'moon seal',
    x: 17,
    y: 15,
    width: 18,
    height: 18,
  });
});

test('between two pages rotation does not repeat scenes until every scene has appeared once', () => {
  const sceneIds = friendBookFinalSectionData.betweenTwoPagesScenes.map((scene) => scene.id);
  let seenSceneIds: string[] = [];

  const first = getNextBetweenTwoPagesSceneRotation(seenSceneIds, () => 0);
  seenSceneIds = first.seenSceneIds;
  const second = getNextBetweenTwoPagesSceneRotation(seenSceneIds, () => 0);
  seenSceneIds = second.seenSceneIds;
  const third = getNextBetweenTwoPagesSceneRotation(seenSceneIds, () => 0);
  seenSceneIds = third.seenSceneIds;
  const fourth = getNextBetweenTwoPagesSceneRotation(seenSceneIds, () => 0);

  assert.deepEqual(
    [first.sceneId, second.sceneId, third.sceneId].sort(),
    [...sceneIds].sort(),
  );
  assert.deepEqual(seenSceneIds.sort(), [...sceneIds].sort());
  assert.equal(fourth.sceneId, sceneIds[0]);
  assert.deepEqual(fourth.seenSceneIds, [sceneIds[0]]);
});

test('moon run level data exposes a short side-scrolling course', () => {
  const level = friendBookFinalSectionData.moonRunLevel;

  assert.equal(level.worldWidth > level.viewportWidth * 2, true);
  assert.equal(level.platforms.length >= 4, true);
  assert.equal(level.pitZones.length >= 2, true);
  assert.equal(level.enemies.length, 2);
  assert.equal(level.finish.x > level.start.x, true);
  assert.equal(typeof level.artwork.player, 'string');
  assert.equal(typeof level.artwork.enemy, 'string');
  assert.equal(typeof level.artwork.platform, 'string');
  assert.equal(typeof level.artwork.finish, 'string');
  assert.equal(typeof level.artwork.heart, 'string');
  assert.equal(
    existsSync(path.join(process.cwd(), 'public', level.artwork.player.slice(1))),
    true,
  );
  assert.equal(
    existsSync(path.join(process.cwd(), 'public', level.artwork.enemy.slice(1))),
    true,
  );
  assert.equal(
    existsSync(path.join(process.cwd(), 'public', level.artwork.platform.slice(1))),
    true,
  );
  assert.equal(
    existsSync(path.join(process.cwd(), 'public', level.artwork.finish.slice(1))),
    true,
  );
  assert.equal(
    existsSync(path.join(process.cwd(), 'public', level.artwork.heart.slice(1))),
    true,
  );
});

test('friend-book quiz bank exposes the four replacement painting questions with valid assets', () => {
  assert.equal(friendBookFinalSectionData.quizQuestionBank.length, 1);

  const ids = friendBookFinalSectionData.quizQuestionBank.map((question) => question.id);
  assert.deepEqual(ids, ['napoleon-crossing-the-alps']);
  assert.equal(new Set(ids).size, 1);
  assert.equal(
    friendBookFinalSectionData.quizQuestionBank.every((question) => question.options.length === 4),
    true,
  );
  assert.equal(
    friendBookFinalSectionData.quizQuestionBank.every(
      (question) => question.options.includes(question.correctAnswer),
    ),
    true,
  );
  assert.equal(
    friendBookFinalSectionData.quizQuestionBank.every((question) =>
      existsSync(path.join(process.cwd(), 'public', question.silhouetteImage.slice(1))),
    ),
    true,
  );

  const napoleonQuestion = friendBookFinalSectionData.quizQuestionBank.find(
    (question) => question.id === 'napoleon-crossing-the-alps',
  );
  assert.equal(
    napoleonQuestion?.silhouetteImage,
    '/images/friend-book-quiz/Painting exam/拿破仑-剪影图.png',
  );
  assert.equal(
    Reflect.get(napoleonQuestion ?? {}, 'referenceImage'),
    '/images/friend-book-quiz/Painting exam/拿破仑.jpg',
  );
  assert.equal(
    existsSync(
      path.join(
        process.cwd(),
        'public',
        String(Reflect.get(napoleonQuestion ?? {}, 'referenceImage')).slice(1),
      ),
    ),
    true,
  );
});

test('friend-book quiz helper returns a unique round capped by the available bank size', () => {
  const round = createFriendBookQuizRound(friendBookFinalSectionData.quizQuestionBank, 5, () => 0.15);

  assert.equal(round.length, friendBookFinalSectionData.quizQuestionBank.length);
  assert.equal(
    new Set(round.map((question) => question.id)).size,
    friendBookFinalSectionData.quizQuestionBank.length,
  );
  assert.ok(
    round.every((question) =>
      friendBookFinalSectionData.quizQuestionBank.some((bankQuestion) => bankQuestion.id === question.id),
    ),
  );
});

test('friend-book game session initializes only the relevant state slice for each game id', () => {
  const quizSession = createFriendBookGameSession(
    'one-stroke-mark',
    friendBookFinalSectionData.quizQuestionBank,
    () => 0.15,
  );
  const differenceSession = createFriendBookGameSession('between-two-pages');
  const moonRunSession = createFriendBookGameSession('moon-run');

  assert.equal(quizSession.gameId, 'one-stroke-mark');
  assert.equal(quizSession.quiz?.questions.length, friendBookFinalSectionData.quizQuestionBank.length);
  assert.equal(quizSession.quiz?.currentQuestionIndex, 0);
  assert.equal(quizSession.quiz?.correctAnswerCount, 0);
  assert.equal(quizSession.quiz?.selectedAnswer, null);
  assert.equal(quizSession.quiz?.answerState, 'idle');
  assert.equal(quizSession.quiz?.completed, false);
  assert.equal(quizSession.betweenTwoPages, undefined);
  assert.equal(quizSession.moonRun, undefined);

  assert.equal(differenceSession.betweenTwoPages?.foundSpotIds.length, 0);
  assert.equal(differenceSession.betweenTwoPages?.targetIds.length, 3);
  assert.equal(differenceSession.betweenTwoPages?.remainingSeconds, 12);
  assert.equal(differenceSession.betweenTwoPages?.mistakes, 0);
  assert.equal(differenceSession.betweenTwoPages?.status, 'active');
  assert.equal(
    friendBookFinalSectionData.betweenTwoPagesScenes.some(
      (scene) => scene.id === differenceSession.betweenTwoPages?.sceneId,
    ),
    true,
  );
  assert.equal(differenceSession.quiz, undefined);
  assert.equal(differenceSession.moonRun, undefined);

  assert.equal(moonRunSession.moonRun?.heartsRemaining, 3);
  assert.equal(moonRunSession.moonRun?.player.x, friendBookFinalSectionData.moonRunLevel.start.x);
  assert.equal(moonRunSession.moonRun?.player.onGround, true);
  assert.equal(moonRunSession.moonRun?.cameraX, 0);
  assert.equal(moonRunSession.moonRun?.enemies.length, 2);
  assert.equal(moonRunSession.moonRun?.finishReached, false);
  assert.equal(moonRunSession.moonRun?.status, 'active');
  assert.equal(moonRunSession.quiz, undefined);
  assert.equal(moonRunSession.betweenTwoPages, undefined);
});

test('friend-book game session falls back to the embedded quiz bank when one is not supplied', () => {
  const session = createFriendBookGameSession('one-stroke-mark');

  assert.equal(session.gameId, 'one-stroke-mark');
  assert.equal(session.quiz?.questions.length, friendBookFinalSectionData.quizQuestionBank.length);
  assert.equal(
    new Set(session.quiz?.questions.map((question) => question.id)).size,
    friendBookFinalSectionData.quizQuestionBank.length,
  );
});

test('quiz answers only score once per question and round completion is explicit after the final question', () => {
  let session = createFriendBookGameSession(
    'one-stroke-mark',
    friendBookFinalSectionData.quizQuestionBank,
    () => 0,
  );

  const questionCount = session.quiz!.questions.length;

  for (let index = 0; index < questionCount - 1; index += 1) {
    const question = session.quiz!.questions[session.quiz!.currentQuestionIndex]!;
    session = answerFriendBookQuizQuestion(session, question.correctAnswer);
    const repeatedAnswer = answerFriendBookQuizQuestion(session, question.correctAnswer);

    assert.equal(repeatedAnswer.quiz?.correctAnswerCount, index + 1);
    assert.equal(repeatedAnswer.quiz?.answerState, 'correct');

    session = advanceFriendBookQuizQuestion(session);
    assert.equal(session.quiz?.currentQuestionIndex, index + 1);
    assert.equal(session.quiz?.selectedAnswer, null);
    assert.equal(session.quiz?.answerState, 'idle');
    assert.equal(session.quiz?.completed, false);
  }

  const finalQuestion = session.quiz!.questions[session.quiz!.currentQuestionIndex]!;
  session = answerFriendBookQuizQuestion(session, finalQuestion.correctAnswer);
  session = advanceFriendBookQuizQuestion(session);

  assert.equal(session.quiz?.correctAnswerCount, questionCount);
  assert.equal(session.quiz?.completed, true);
  assert.equal(session.quiz?.answerState, 'completed');
  assert.equal(session.quiz?.currentQuestionIndex, questionCount - 1);
});

test('between two pages only succeeds when all targets are found before the timer expires', () => {
  const session = createFriendBookGameSession('between-two-pages');

  const successResult = completeBetweenTwoPagesRound({
    ...session,
    betweenTwoPages: {
      ...session.betweenTwoPages!,
      targetIds: ['moon-stamp', 'cat-tail', 'page-fold'],
      foundSpotIds: ['moon-stamp', 'cat-tail', 'page-fold'],
      remainingSeconds: 8,
    },
  });
  const failureResult = completeBetweenTwoPagesRound({
    ...session,
    betweenTwoPages: {
      ...session.betweenTwoPages!,
      targetIds: ['moon-stamp', 'cat-tail', 'page-fold'],
      foundSpotIds: ['moon-stamp', 'cat-tail', 'page-fold'],
      remainingSeconds: 0,
    },
  });

  assert.equal(successResult.isSuccess, true);
  assert.equal(successResult.status, 'success');
  assert.equal(failureResult.isSuccess, false);
  assert.equal(failureResult.status, 'failed');
});

test('moon run step moves the player, supports jumping, and lands back on a platform', () => {
  let session = createFriendBookGameSession('moon-run');

  session = stepMoonRunSession(session, { moveRight: true, moveLeft: false, jumpPressed: false }, 120);
  assert.equal((session.moonRun?.player.x ?? 0) > friendBookFinalSectionData.moonRunLevel.start.x, true);
  assert.equal(session.moonRun?.player.onGround, true);

  session = stepMoonRunSession(session, { moveRight: true, moveLeft: false, jumpPressed: true }, 16);
  assert.equal((session.moonRun?.player.vy ?? 0) < 0, true);
  assert.equal(session.moonRun?.player.onGround, false);

  for (let index = 0; index < 90; index += 1) {
    session = stepMoonRunSession(
      session,
      { moveRight: false, moveLeft: false, jumpPressed: false },
      16,
    );
  }

  assert.equal(session.moonRun?.player.onGround, true);
  assert.equal((session.moonRun?.player.y ?? 0) >= 0, true);
});

test('moon run supports enemy stomps, damage resets, and failure after the last heart', () => {
  const baseSession = createFriendBookGameSession('moon-run');
  const enemy = baseSession.moonRun!.enemies[0]!;

  let stompedSession: ReturnType<typeof createFriendBookGameSession> = {
    ...baseSession,
    moonRun: {
      ...baseSession.moonRun!,
      player: {
        ...baseSession.moonRun!.player,
        x: enemy.x,
        y: enemy.y - 48,
        vx: 0,
        vy: 220,
        onGround: false,
      },
    },
  };
  stompedSession = stepMoonRunSession(
    stompedSession,
    { moveLeft: false, moveRight: false, jumpPressed: false },
    16,
  );

  assert.equal(stompedSession.moonRun?.enemies[0]?.defeated, true);
  assert.equal((stompedSession.moonRun?.player.vy ?? 0) < 0, true);

  let damagedSession: ReturnType<typeof createFriendBookGameSession> = {
    ...baseSession,
    moonRun: {
      ...baseSession.moonRun!,
      player: {
        ...baseSession.moonRun!.player,
        x: enemy.x,
        y: enemy.y - baseSession.moonRun!.player.height + 6,
        vx: 0,
        vy: 0,
        onGround: true,
      },
    },
  };
  damagedSession = stepMoonRunSession(
    damagedSession,
    { moveLeft: false, moveRight: false, jumpPressed: false },
    16,
  );

  assert.equal(damagedSession.moonRun?.heartsRemaining, 2);
  assert.equal(damagedSession.moonRun?.player.x, friendBookFinalSectionData.moonRunLevel.start.x);
  assert.equal((damagedSession.moonRun?.damageRecoveryMs ?? 0) > 0, true);

  let failedSession = damagedSession;
  failedSession = {
    ...failedSession,
    moonRun: {
      ...failedSession.moonRun!,
      heartsRemaining: 1,
      damageRecoveryMs: 0,
      player: {
        ...failedSession.moonRun!.player,
        x: friendBookFinalSectionData.moonRunLevel.pitZones[0]!.startX + 10,
        y: friendBookFinalSectionData.moonRunLevel.worldHeight + 160,
        vx: 0,
        vy: 320,
        onGround: false,
      },
    },
  };
  failedSession = stepMoonRunSession(
    failedSession,
    { moveLeft: false, moveRight: false, jumpPressed: false },
    16,
  );

  assert.equal(failedSession.moonRun?.heartsRemaining, 0);
  assert.equal(failedSession.moonRun?.status, 'failed');
});

test('moon run marks success at the finish and reports the remaining hearts in its summary', () => {
  let session = createFriendBookGameSession('moon-run');
  const finish = friendBookFinalSectionData.moonRunLevel.finish;

  session = {
    ...session,
    moonRun: {
      ...session.moonRun!,
      heartsRemaining: 2,
      player: {
        ...session.moonRun!.player,
        x: finish.x,
        y: finish.y - session.moonRun!.player.height,
        vx: 120,
        vy: 0,
        onGround: true,
      },
      cameraX: finish.x - friendBookFinalSectionData.moonRunLevel.viewportWidth / 2,
    },
  };
  session = stepMoonRunSession(
    session,
    { moveLeft: false, moveRight: true, jumpPressed: false },
    16,
  );

  assert.equal(session.moonRun?.finishReached, true);
  assert.equal(session.moonRun?.status, 'success');
  assert.equal(getMoonRunRoundSummary(session), 'Reached the moon gate with 2 hearts left.');
});

test('persist stores the keyed friend-book payload under the versioned storage key', () => {
  const storage = createMemoryStorage();
  const progress = completeFriendBookGameSession(createDefaultFriendBookProgress(), {
    gameId: 'between-two-pages',
    note: 'A single note before sleep.',
    displayDate: 'APR 16, 2026',
    randomValue: 0.4,
  });

  persistFriendBookProgress(progress, storage);

  assert.match(storage.dump()[FRIEND_BOOK_STORAGE_KEY], /between-two-pages/);
  assert.match(storage.dump()[FRIEND_BOOK_STORAGE_KEY], /A single note before sleep\./);
});
