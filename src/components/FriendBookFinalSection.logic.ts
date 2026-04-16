import { friendBookFinalSectionData } from '../data';

export type FriendBookGameId =
  | 'between-two-pages'
  | 'moon-run'
  | 'one-stroke-mark';

export type FriendBookAvatarId =
  | 'cat-pi'
  | 'cat'
  | 'dog'
  | 'rabbit'
  | 'tree'
  | 'hidden-cat';

export type FriendBookStage =
  | 'landing'
  | 'avatar-select'
  | 'game-active'
  | 'note-entry';

export interface FriendBookPoint {
  x: number;
  y: number;
}

export interface FriendBookGameProgress {
  completionCount: number;
  latestMedalId: string | null;
  latestNote: string;
  latestDate: string | null;
  latestAvatarId: FriendBookAvatarId | null;
}

export interface FriendBookProgress {
  version: 1;
  selectedAvatarId: FriendBookAvatarId | null;
  unlockedAvatarIds: FriendBookAvatarId[];
  games: Record<FriendBookGameId, FriendBookGameProgress>;
  allGamesCompleted: boolean;
}

interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const FRIEND_BOOK_STORAGE_KEY = 'friend-book-progress:v1';
export const FRIEND_BOOK_HIDDEN_AVATAR_ID = 'hidden-cat';
export const FRIEND_BOOK_DIFFERENCE_TARGETS = [
  'moon-stamp',
  'cat-tail',
  'page-fold',
] as const;

const FRIEND_BOOK_GAME_IDS: FriendBookGameId[] = [
  'between-two-pages',
  'moon-run',
  'one-stroke-mark',
];

function createEmptyGameProgress(): FriendBookGameProgress {
  return {
    completionCount: 0,
    latestMedalId: null,
    latestNote: '',
    latestDate: null,
    latestAvatarId: null,
  };
}

function createDefaultUnlockedAvatarIds(): FriendBookAvatarId[] {
  return friendBookFinalSectionData.avatars
    .filter((avatar) => !avatar.hidden)
    .map((avatar) => avatar.id);
}

function createEmptyGameRecord(): Record<FriendBookGameId, FriendBookGameProgress> {
  return {
    'between-two-pages': createEmptyGameProgress(),
    'moon-run': createEmptyGameProgress(),
    'one-stroke-mark': createEmptyGameProgress(),
  };
}

function isFriendBookAvatarId(value: string): value is FriendBookAvatarId {
  return friendBookFinalSectionData.avatars.some((avatar) => avatar.id === value);
}

function uniqueAvatarIds(
  ids: readonly (FriendBookAvatarId | string)[],
): FriendBookAvatarId[] {
  return Array.from(new Set(ids)).filter(isFriendBookAvatarId);
}

function computeAllGamesCompleted(
  games: Record<FriendBookGameId, FriendBookGameProgress>,
): boolean {
  return FRIEND_BOOK_GAME_IDS.every((gameId) => games[gameId].completionCount > 0);
}

function withUnlocks(progress: FriendBookProgress): FriendBookProgress {
  const unlocked = uniqueAvatarIds([
    ...createDefaultUnlockedAvatarIds(),
    ...progress.unlockedAvatarIds,
    ...(progress.allGamesCompleted ? [FRIEND_BOOK_HIDDEN_AVATAR_ID] : []),
  ]);

  return {
    ...progress,
    unlockedAvatarIds: unlocked,
  };
}

export function createDefaultFriendBookProgress(): FriendBookProgress {
  return {
    version: 1,
    selectedAvatarId: null,
    unlockedAvatarIds: createDefaultUnlockedAvatarIds(),
    games: createEmptyGameRecord(),
    allGamesCompleted: false,
  };
}

export function hydrateFriendBookProgress(
  storage?: StorageLike | null,
): FriendBookProgress {
  const fallback = createDefaultFriendBookProgress();
  const raw = storage?.getItem(FRIEND_BOOK_STORAGE_KEY);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<FriendBookProgress>;
    const nextGames = createEmptyGameRecord();

    for (const gameId of FRIEND_BOOK_GAME_IDS) {
      const incoming = parsed.games?.[gameId];

      nextGames[gameId] = {
        completionCount:
          typeof incoming?.completionCount === 'number'
            ? Math.max(0, incoming.completionCount)
            : 0,
        latestMedalId:
          typeof incoming?.latestMedalId === 'string' ? incoming.latestMedalId : null,
        latestNote: typeof incoming?.latestNote === 'string' ? incoming.latestNote : '',
        latestDate: typeof incoming?.latestDate === 'string' ? incoming.latestDate : null,
        latestAvatarId:
          typeof incoming?.latestAvatarId === 'string'
            ? (incoming.latestAvatarId as FriendBookAvatarId)
            : null,
      };
    }

    const nextProgress: FriendBookProgress = {
      version: 1,
      selectedAvatarId:
        typeof parsed.selectedAvatarId === 'string'
          ? (parsed.selectedAvatarId as FriendBookAvatarId)
          : null,
      unlockedAvatarIds: Array.isArray(parsed.unlockedAvatarIds)
        ? parsed.unlockedAvatarIds.filter(
            (avatarId): avatarId is FriendBookAvatarId => typeof avatarId === 'string',
          )
        : createDefaultUnlockedAvatarIds(),
      games: nextGames,
      allGamesCompleted: computeAllGamesCompleted(nextGames),
    };

    return withUnlocks(nextProgress);
  } catch {
    return fallback;
  }
}

export function persistFriendBookProgress(
  progress: FriendBookProgress,
  storage?: StorageLike | null,
): void {
  storage?.setItem(FRIEND_BOOK_STORAGE_KEY, JSON.stringify(progress));
}

export function getAvailableFriendBookAvatarIds(
  progress: FriendBookProgress,
): FriendBookAvatarId[] {
  return uniqueAvatarIds([
    ...createDefaultUnlockedAvatarIds(),
    ...progress.unlockedAvatarIds,
    ...(progress.allGamesCompleted ? [FRIEND_BOOK_HIDDEN_AVATAR_ID] : []),
  ]);
}

export function selectFriendBookAvatar(
  progress: FriendBookProgress,
  avatarId: FriendBookAvatarId,
): FriendBookProgress {
  if (!getAvailableFriendBookAvatarIds(progress).includes(avatarId)) {
    return progress;
  }

  return {
    ...progress,
    selectedAvatarId: avatarId,
    unlockedAvatarIds: getAvailableFriendBookAvatarIds(progress),
  };
}

export function getFriendBookGameStartStage(
  progress: FriendBookProgress,
  _gameId: FriendBookGameId,
): FriendBookStage {
  return progress.selectedAvatarId ? 'game-active' : 'avatar-select';
}

export function getFriendBookMedalIdForGame(
  gameId: FriendBookGameId,
  randomValue: number,
): string {
  const pool = friendBookFinalSectionData.medalPools[gameId];
  const normalized = Number.isFinite(randomValue) ? Math.min(Math.max(randomValue, 0), 0.999999) : 0;
  const index = Math.floor(normalized * pool.length);

  return pool[index]!;
}

export function completeFriendBookGameSession(
  progress: FriendBookProgress,
  options: {
    gameId: FriendBookGameId;
    note: string;
    displayDate: string;
    randomValue?: number;
    medalId?: string;
    avatarId?: FriendBookAvatarId | null;
  },
): FriendBookProgress {
  const nextGames = {
    ...progress.games,
    [options.gameId]: {
      ...progress.games[options.gameId],
      completionCount: progress.games[options.gameId].completionCount + 1,
      latestMedalId:
        options.medalId ??
        getFriendBookMedalIdForGame(options.gameId, options.randomValue ?? Math.random()),
      latestNote: options.note.trim(),
      latestDate: options.displayDate,
      latestAvatarId:
        options.avatarId ?? progress.selectedAvatarId ?? progress.games[options.gameId].latestAvatarId,
    },
  };

  const nextProgress: FriendBookProgress = {
    version: 1,
    selectedAvatarId:
      options.avatarId ?? progress.selectedAvatarId ?? progress.games[options.gameId].latestAvatarId,
    unlockedAvatarIds: progress.unlockedAvatarIds,
    games: nextGames,
    allGamesCompleted: computeAllGamesCompleted(nextGames),
  };

  return withUnlocks(nextProgress);
}

export function resolveBetweenTwoPagesSpotSelection(
  foundSpotIds: string[],
  spotId: string,
): { foundSpotIds: string[]; isComplete: boolean } {
  const nextSpotIds = FRIEND_BOOK_DIFFERENCE_TARGETS.includes(
    spotId as (typeof FRIEND_BOOK_DIFFERENCE_TARGETS)[number],
  )
    ? Array.from(new Set([...foundSpotIds, spotId]))
    : [...foundSpotIds];

  return {
    foundSpotIds: nextSpotIds,
    isComplete: FRIEND_BOOK_DIFFERENCE_TARGETS.every((targetId) =>
      nextSpotIds.includes(targetId),
    ),
  };
}

export function resolveMoonRunAttempt(markerPosition: number): {
  isSuccess: boolean;
  distanceFromCenter: number;
} {
  const distanceFromCenter = Math.abs(markerPosition - 0.5);

  return {
    isSuccess: markerPosition >= 0.44 && markerPosition <= 0.56,
    distanceFromCenter,
  };
}

export function resolveOneStrokeMarkAttempt(points: FriendBookPoint[]): {
  isSuccess: boolean;
  travelDistance: number;
} {
  const travelDistance = points.slice(1).reduce((distance, point, index) => {
    const previousPoint = points[index]!;
    return distance + Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y);
  }, 0);

  return {
    isSuccess: points.length >= 3 && travelDistance >= 220,
    travelDistance,
  };
}

export function formatFriendBookArchiveDate(date = new Date()): string {
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ] as const;

  return `${months[date.getMonth()]} ${String(date.getDate()).padStart(2, '0')}, ${date.getFullYear()}`;
}
