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
  hydrateFriendBookProgress,
  persistFriendBookProgress,
  resolveBetweenTwoPagesSpotSelection,
  registerMoonRunBeat,
  resolveMoonRunAttempt,
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
  const first = resolveBetweenTwoPagesSpotSelection([], 'moon-stamp');
  const second = resolveBetweenTwoPagesSpotSelection(first.foundSpotIds, 'cat-tail');
  const third = resolveBetweenTwoPagesSpotSelection(second.foundSpotIds, 'page-fold');

  assert.equal(first.isComplete, false);
  assert.equal(second.isComplete, false);
  assert.deepEqual(third.foundSpotIds, ['moon-stamp', 'cat-tail', 'page-fold']);
  assert.equal(third.isComplete, true);
});

test('between two pages scene exposes paired illustrations and the three true targets', () => {
  const scene = Reflect.get(friendBookFinalSectionData, 'betweenTwoPagesScene') as
    | {
        baseImage?: string;
        variantImage?: string;
        targets?: Array<{ id?: string; label?: string; width?: number; height?: number }>;
      }
    | undefined;

  assert.equal(typeof scene?.baseImage, 'string');
  assert.equal(typeof scene?.variantImage, 'string');
  assert.deepEqual(
    scene?.targets?.map((target) => target.id),
    ['moon-stamp', 'cat-tail', 'page-fold'],
  );
  assert.deepEqual(
    scene?.targets?.map((target) => target.label),
    ['moon seal', 'cat tail', 'page fold'],
  );
  assert.equal(
    scene?.targets?.every(
      (target) =>
        typeof target.width === 'number' &&
        typeof target.height === 'number' &&
        target.width <= 12 &&
        target.height <= 12,
    ),
    true,
  );
  assert.equal(
    existsSync(path.join(process.cwd(), 'public', scene!.baseImage!.slice(1))),
    true,
  );
  assert.equal(
    existsSync(path.join(process.cwd(), 'public', scene!.variantImage!.slice(1))),
    true,
  );
});

test('moon run succeeds only when the marker stops inside the success band', () => {
  assert.equal(resolveMoonRunAttempt(0.5).isSuccess, true);
  assert.equal(resolveMoonRunAttempt(0.3).isSuccess, false);
});

test('friend-book quiz bank exposes fifteen questions with unique answer sets', () => {
  assert.equal(friendBookFinalSectionData.quizQuestionBank.length, 15);

  const ids = friendBookFinalSectionData.quizQuestionBank.map((question) => question.id);
  assert.equal(new Set(ids).size, 15);
  assert.equal(
    friendBookFinalSectionData.quizQuestionBank.every((question) => question.options.length >= 3),
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
});

test('friend-book quiz helper returns five unique questions from the bank', () => {
  const round = createFriendBookQuizRound(friendBookFinalSectionData.quizQuestionBank, 5, () => 0.15);

  assert.equal(round.length, 5);
  assert.equal(new Set(round.map((question) => question.id)).size, 5);
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
  assert.equal(quizSession.quiz?.questions.length, 5);
  assert.equal(quizSession.quiz?.currentQuestionIndex, 0);
  assert.equal(quizSession.quiz?.correctAnswerCount, 0);
  assert.equal(quizSession.quiz?.selectedAnswer, null);
  assert.equal(quizSession.quiz?.answerState, 'idle');
  assert.equal(quizSession.quiz?.completed, false);
  assert.equal(quizSession.betweenTwoPages, undefined);
  assert.equal(quizSession.moonRun, undefined);

  assert.equal(differenceSession.betweenTwoPages?.foundSpotIds.length, 0);
  assert.equal(differenceSession.betweenTwoPages?.remainingSeconds, 12);
  assert.equal(differenceSession.betweenTwoPages?.mistakes, 0);
  assert.equal(differenceSession.betweenTwoPages?.status, 'active');
  assert.equal(differenceSession.quiz, undefined);
  assert.equal(differenceSession.moonRun, undefined);

  assert.equal(moonRunSession.moonRun?.segmentIndex, 0);
  assert.equal(moonRunSession.moonRun?.totalSegments, 4);
  assert.equal(moonRunSession.moonRun?.successes, 0);
  assert.equal(moonRunSession.moonRun?.markerPosition, 0.5);
  assert.equal(moonRunSession.moonRun?.feedback, 'idle');
  assert.equal(moonRunSession.moonRun?.status, 'active');
  assert.equal(moonRunSession.quiz, undefined);
  assert.equal(moonRunSession.betweenTwoPages, undefined);
});

test('friend-book game session falls back to the embedded quiz bank when one is not supplied', () => {
  const session = createFriendBookGameSession('one-stroke-mark');

  assert.equal(session.gameId, 'one-stroke-mark');
  assert.equal(session.quiz?.questions.length, 5);
  assert.equal(new Set(session.quiz?.questions.map((question) => question.id)).size, 5);
});

test('quiz answers only score once per question and round completion is explicit after the fifth question', () => {
  let session = createFriendBookGameSession(
    'one-stroke-mark',
    friendBookFinalSectionData.quizQuestionBank,
    () => 0,
  );

  for (let index = 0; index < 4; index += 1) {
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

  assert.equal(session.quiz?.correctAnswerCount, 5);
  assert.equal(session.quiz?.completed, true);
  assert.equal(session.quiz?.answerState, 'completed');
  assert.equal(session.quiz?.currentQuestionIndex, 4);
});

test('between two pages only succeeds when all targets are found before the timer expires', () => {
  const session = createFriendBookGameSession('between-two-pages');

  const successResult = completeBetweenTwoPagesRound({
    ...session,
    betweenTwoPages: {
      ...session.betweenTwoPages!,
      foundSpotIds: ['moon-stamp', 'cat-tail', 'page-fold'],
      remainingSeconds: 8,
    },
  });
  const failureResult = completeBetweenTwoPagesRound({
    ...session,
    betweenTwoPages: {
      ...session.betweenTwoPages!,
      foundSpotIds: ['moon-stamp', 'cat-tail', 'page-fold'],
      remainingSeconds: 0,
    },
  });

  assert.equal(successResult.isSuccess, true);
  assert.equal(successResult.status, 'success');
  assert.equal(failureResult.isSuccess, false);
  assert.equal(failureResult.status, 'failed');
});

test('moon run resolves over four beats and marks the round complete only after the last beat', () => {
  let session = createFriendBookGameSession('moon-run');

  session = registerMoonRunBeat(session, 0.5);
  assert.equal(session.moonRun?.successes, 1);
  assert.equal(session.moonRun?.segmentIndex, 1);
  assert.equal(session.moonRun?.feedback, 'hit');
  assert.equal(session.moonRun?.status, 'active');

  session = registerMoonRunBeat(session, 0.51);
  session = registerMoonRunBeat(session, 0.49);
  session = registerMoonRunBeat(session, 0.5);

  assert.equal(session.moonRun?.successes, 4);
  assert.equal(session.moonRun?.segmentIndex, 4);
  assert.equal(session.moonRun?.status, 'success');
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
