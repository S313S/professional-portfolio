import test from 'node:test';
import assert from 'node:assert/strict';

import {
  FRIEND_BOOK_HIDDEN_AVATAR_ID,
  FRIEND_BOOK_STORAGE_KEY,
  completeFriendBookGameSession,
  createDefaultFriendBookProgress,
  getAvailableFriendBookAvatarIds,
  getFriendBookGameStartStage,
  hydrateFriendBookProgress,
  persistFriendBookProgress,
  resolveBetweenTwoPagesSpotSelection,
  resolveMoonRunAttempt,
  resolveOneStrokeMarkAttempt,
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

test('difference game completes after all hidden spots are found', () => {
  const first = resolveBetweenTwoPagesSpotSelection([], 'moon-stamp');
  const second = resolveBetweenTwoPagesSpotSelection(first.foundSpotIds, 'cat-tail');
  const third = resolveBetweenTwoPagesSpotSelection(second.foundSpotIds, 'page-fold');

  assert.equal(first.isComplete, false);
  assert.equal(second.isComplete, false);
  assert.deepEqual(third.foundSpotIds, ['moon-stamp', 'cat-tail', 'page-fold']);
  assert.equal(third.isComplete, true);
});

test('moon run succeeds only when the marker stops inside the success band', () => {
  assert.equal(resolveMoonRunAttempt(0.5).isSuccess, true);
  assert.equal(resolveMoonRunAttempt(0.3).isSuccess, false);
});

test('one stroke mark succeeds only for a long enough continuous trace', () => {
  assert.equal(
    resolveOneStrokeMarkAttempt([
      { x: 10, y: 10 },
      { x: 90, y: 20 },
      { x: 180, y: 60 },
      { x: 250, y: 140 },
    ]).isSuccess,
    true,
  );
  assert.equal(
    resolveOneStrokeMarkAttempt([
      { x: 10, y: 10 },
      { x: 24, y: 18 },
    ]).isSuccess,
    false,
  );
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
