import {
  friendBookFinalSectionData,
  type FriendBookMoonRunLevel,
} from '../data';

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

export interface FriendBookBetweenTwoPagesSessionState {
  sceneId: string;
  targetIds: string[];
  foundSpotIds: string[];
  remainingSeconds: number;
  mistakes: number;
  status: 'active' | 'success' | 'failed';
}

export interface FriendBookMoonRunPlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  onGround: boolean;
}

export interface FriendBookMoonRunEnemyState {
  id: string;
  x: number;
  y: number;
  vx: number;
  direction: 'left' | 'right';
  width: number;
  height: number;
  patrolMinX: number;
  patrolMaxX: number;
  speed: number;
  defeated: boolean;
}

export interface FriendBookMoonRunSessionState {
  heartsRemaining: number;
  status: 'active' | 'success' | 'failed';
  player: FriendBookMoonRunPlayerState;
  cameraX: number;
  enemies: FriendBookMoonRunEnemyState[];
  damageRecoveryMs: number;
  finishReached: boolean;
}

export interface FriendBookMoonRunInputState {
  moveLeft: boolean;
  moveRight: boolean;
  jumpPressed: boolean;
}

export interface FriendBookQuizQuestion {
  id: string;
  silhouetteImage: string;
  referenceImage?: string;
  prompt: string;
  options: string[];
  correctAnswer: string;
  resultCopy: string;
}

export interface FriendBookQuizSessionState {
  questions: FriendBookQuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: string | null;
  answerState: 'idle' | 'correct' | 'wrong' | 'completed';
  correctAnswerCount: number;
  completed: boolean;
}

export interface FriendBookGameSessionState {
  gameId: FriendBookGameId;
  betweenTwoPages?: FriendBookBetweenTwoPagesSessionState;
  moonRun?: FriendBookMoonRunSessionState;
  quiz?: FriendBookQuizSessionState;
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
export const FRIEND_BOOK_QUIZ_ROUND_SIZE = 5;

const MOON_RUN_PLAYER_WIDTH = 44;
const MOON_RUN_PLAYER_HEIGHT = 46;
const MOON_RUN_MOVE_SPEED = 256;
const MOON_RUN_JUMP_SPEED = 560;
const MOON_RUN_GRAVITY = 1680;
const MOON_RUN_BOUNCE_SPEED = 318;
const MOON_RUN_DAMAGE_RECOVERY_MS = 850;
const MOON_RUN_STOMP_VELOCITY = 120;
const MOON_RUN_MAX_STEP_MS = 48;

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

function sanitizeFriendBookAvatarId(
  value: FriendBookAvatarId | string | null | undefined,
): FriendBookAvatarId | null {
  return typeof value === 'string' && isFriendBookAvatarId(value) ? value : null;
}

function clampRandomValue(randomValue: number): number {
  if (!Number.isFinite(randomValue)) {
    return 0;
  }

  return Math.min(Math.max(randomValue, 0), 0.999999);
}

export function getNextBetweenTwoPagesSceneRotation(
  seenSceneIds: readonly string[],
  randomValue: () => number = Math.random,
): { sceneId: string; seenSceneIds: string[] } {
  const scenes = friendBookFinalSectionData.betweenTwoPagesScenes;
  const unseenScenes = scenes.filter((scene) => !seenSceneIds.includes(scene.id));
  const availableScenes = unseenScenes.length > 0 ? unseenScenes : scenes;
  const nextIndex = Math.floor(clampRandomValue(randomValue()) * availableScenes.length);
  const nextScene = availableScenes[nextIndex] ?? availableScenes[0] ?? scenes[0];
  const nextSeenSceneIds =
    unseenScenes.length > 0 ? [...seenSceneIds, nextScene.id] : [nextScene.id];

  return {
    sceneId: nextScene.id,
    seenSceneIds: nextSeenSceneIds,
  };
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
          sanitizeFriendBookAvatarId(incoming?.latestAvatarId),
      };
    }

    const nextProgress: FriendBookProgress = {
      version: 1,
      selectedAvatarId: sanitizeFriendBookAvatarId(parsed.selectedAvatarId),
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

export function createFriendBookQuizRound(
  questions: readonly FriendBookQuizQuestion[],
  roundSize = FRIEND_BOOK_QUIZ_ROUND_SIZE,
  randomValue: () => number = Math.random,
): FriendBookQuizQuestion[] {
  if (questions.length === 0 || roundSize <= 0) {
    return [];
  }

  const pool = [...questions];
  const targetSize = Math.min(Math.floor(roundSize), pool.length);

  for (let index = 0; index < targetSize; index += 1) {
    const randomIndex = index + Math.floor(clampRandomValue(randomValue()) * (pool.length - index));
    const currentQuestion = pool[index]!;
    pool[index] = pool[randomIndex]!;
    pool[randomIndex] = currentQuestion;
  }

  return pool.slice(0, targetSize);
}

export function createFriendBookQuizSession(
  questions: readonly FriendBookQuizQuestion[],
  randomValue: () => number = Math.random,
): FriendBookQuizSessionState {
  return {
    questions: createFriendBookQuizRound(questions, FRIEND_BOOK_QUIZ_ROUND_SIZE, randomValue),
    currentQuestionIndex: 0,
    selectedAnswer: null,
    answerState: 'idle',
    correctAnswerCount: 0,
    completed: false,
  };
}

function createBetweenTwoPagesSession(
  sceneId?: string,
  randomValue: () => number = Math.random,
): FriendBookBetweenTwoPagesSessionState {
  const scenes = friendBookFinalSectionData.betweenTwoPagesScenes;
  const scene =
    (sceneId
      ? scenes.find((candidateScene) => candidateScene.id === sceneId)
      : undefined) ??
    scenes[Math.floor(clampRandomValue(randomValue()) * scenes.length)] ??
    scenes[0];

  return {
    sceneId: scene.id,
    targetIds: scene.targets.map((target) => target.id),
    foundSpotIds: [],
    remainingSeconds: 12,
    mistakes: 0,
    status: 'active',
  };
}

export function createFriendBookGameSession(
  gameId: FriendBookGameId,
  quizQuestions: readonly FriendBookQuizQuestion[] = friendBookFinalSectionData.quizQuestionBank,
  randomValue: () => number = Math.random,
  options?: {
    betweenTwoPagesSceneId?: string;
  },
): FriendBookGameSessionState {
  if (gameId === 'between-two-pages') {
    return {
      gameId,
      betweenTwoPages: createBetweenTwoPagesSession(
        options?.betweenTwoPagesSceneId,
        randomValue,
      ),
    };
  }

  if (gameId === 'moon-run') {
    return {
      gameId,
      moonRun: createMoonRunSession(friendBookFinalSectionData.moonRunLevel),
    };
  }

  return {
    gameId,
    quiz: createFriendBookQuizSession(quizQuestions, randomValue),
  };
}

export function advanceFriendBookQuizQuestion(
  session: FriendBookGameSessionState,
): FriendBookGameSessionState {
  if (!session.quiz || session.quiz.completed) {
    return session;
  }

  const isLastQuestion =
    session.quiz.currentQuestionIndex >= Math.max(session.quiz.questions.length - 1, 0);

  if (isLastQuestion) {
    return {
      ...session,
      quiz: {
        ...session.quiz,
        selectedAnswer: null,
        answerState: 'completed',
        completed: true,
      },
    };
  }

  return {
    ...session,
    quiz: {
      ...session.quiz,
      currentQuestionIndex: session.quiz.currentQuestionIndex + 1,
      selectedAnswer: null,
      answerState: 'idle',
      completed: false,
    },
  };
}

export function answerFriendBookQuizQuestion(
  session: FriendBookGameSessionState,
  selectedAnswer: string,
): FriendBookGameSessionState {
  if (
    !session.quiz ||
    session.quiz.completed ||
    session.quiz.selectedAnswer !== null ||
    session.quiz.answerState === 'completed'
  ) {
    return session;
  }

  const currentQuestion = session.quiz.questions[session.quiz.currentQuestionIndex];
  const isCorrect = currentQuestion?.correctAnswer === selectedAnswer;

  return {
    ...session,
    quiz: {
      ...session.quiz,
      selectedAnswer,
      answerState: isCorrect ? 'correct' : 'wrong',
      correctAnswerCount: session.quiz.correctAnswerCount + (isCorrect ? 1 : 0),
    },
  };
}

export function completeBetweenTwoPagesRound(
  session: FriendBookGameSessionState,
): {
  isSuccess: boolean;
  status: FriendBookBetweenTwoPagesSessionState['status'];
  score: number;
} {
  const betweenTwoPages = session.betweenTwoPages;
  const isSuccess =
    Boolean(betweenTwoPages) &&
    betweenTwoPages.remainingSeconds > 0 &&
    betweenTwoPages.targetIds.every((targetId) =>
      betweenTwoPages.foundSpotIds.includes(targetId),
    );

  return {
    isSuccess,
    status: isSuccess ? 'success' : 'failed',
    score: betweenTwoPages?.remainingSeconds ?? 0,
  };
}

export function stepMoonRunSession(
  session: FriendBookGameSessionState,
  input: FriendBookMoonRunInputState,
  deltaMs: number,
  level: FriendBookMoonRunLevel = friendBookFinalSectionData.moonRunLevel,
): FriendBookGameSessionState {
  if (!session.moonRun || session.moonRun.status !== 'active') {
    return session;
  }

  const stepMs = Math.min(Math.max(deltaMs, 0), MOON_RUN_MAX_STEP_MS);
  const stepSeconds = stepMs / 1000;
  const moveDirection = Number(input.moveRight) - Number(input.moveLeft);
  const nextDamageRecoveryMs = Math.max(session.moonRun.damageRecoveryMs - stepMs, 0);

  let player: FriendBookMoonRunPlayerState = {
    ...session.moonRun.player,
    vx: moveDirection * MOON_RUN_MOVE_SPEED,
    facing:
      moveDirection < 0
        ? 'left'
        : moveDirection > 0
          ? 'right'
          : session.moonRun.player.facing,
  };
  let enemies = advanceMoonRunEnemies(session.moonRun.enemies, stepSeconds);

  const previousBottom = player.y + player.height;
  if (input.jumpPressed && player.onGround) {
    player = {
      ...player,
      vy: -MOON_RUN_JUMP_SPEED,
      onGround: false,
    };
  }

  player = {
    ...player,
    x: clampToRange(player.x + player.vx * stepSeconds, 0, level.worldWidth - player.width),
    vy: player.vy + MOON_RUN_GRAVITY * stepSeconds,
  };

  const proposedY = player.y + player.vy * stepSeconds;
  const landingSurfaceY = findLandingSurfaceY(
    level,
    player.x,
    player.width,
    previousBottom,
    proposedY + player.height,
  );

  if (landingSurfaceY !== null) {
    player = {
      ...player,
      y: landingSurfaceY - player.height,
      vy: 0,
      onGround: true,
    };
  } else {
    player = {
      ...player,
      y: proposedY,
      onGround: false,
    };
  }

  const overlappingEnemy = enemies.find(
    (enemy) => !enemy.defeated && rectanglesOverlap(player, enemy),
  );
  if (overlappingEnemy) {
    if (
      player.vy > MOON_RUN_STOMP_VELOCITY &&
      previousBottom <= overlappingEnemy.y + overlappingEnemy.height * 0.45
    ) {
      enemies = enemies.map((enemy) =>
        enemy.id === overlappingEnemy.id ? { ...enemy, defeated: true, vx: 0 } : enemy,
      );
      player = {
        ...player,
        vy: -MOON_RUN_BOUNCE_SPEED,
        onGround: false,
      };
    } else if (nextDamageRecoveryMs <= 0) {
      return {
        ...session,
        moonRun: createMoonRunPostDamageState(level, session.moonRun.heartsRemaining - 1),
      };
    }
  }

  if (player.y > level.worldHeight + 120) {
    return {
      ...session,
      moonRun: createMoonRunPostDamageState(level, session.moonRun.heartsRemaining - 1),
    };
  }

  const finishReached = rectanglesOverlap(player, {
    x: level.finish.x,
    y: level.finish.y,
    width: level.finish.width,
    height: level.finish.height,
  });
  const status = finishReached ? 'success' : session.moonRun.status;

  return {
    ...session,
    moonRun: {
      ...session.moonRun,
      heartsRemaining: session.moonRun.heartsRemaining,
      status,
      player,
      enemies,
      cameraX: resolveMoonRunCameraX(level, player),
      damageRecoveryMs: nextDamageRecoveryMs,
      finishReached,
    },
  };
}

export function getFriendBookMedalIdForGame(
  gameId: FriendBookGameId,
  randomValue: number,
): string {
  const pool = friendBookFinalSectionData.medalPools[gameId];
  const normalized = clampRandomValue(randomValue);
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
  const resolvedAvatarId =
    sanitizeFriendBookAvatarId(options.avatarId) ??
    sanitizeFriendBookAvatarId(progress.selectedAvatarId) ??
    sanitizeFriendBookAvatarId(progress.games[options.gameId].latestAvatarId);

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
      latestAvatarId: resolvedAvatarId,
    },
  };

  const nextProgress: FriendBookProgress = {
    version: 1,
    selectedAvatarId: resolvedAvatarId,
    unlockedAvatarIds: progress.unlockedAvatarIds,
    games: nextGames,
    allGamesCompleted: computeAllGamesCompleted(nextGames),
  };

  return withUnlocks(nextProgress);
}

export function resolveBetweenTwoPagesSpotSelection(
  foundSpotIds: string[],
  spotId: string,
  targetIds: readonly string[],
): { foundSpotIds: string[]; isComplete: boolean } {
  const nextSpotIds = targetIds.includes(spotId)
    ? Array.from(new Set([...foundSpotIds, spotId]))
    : [...foundSpotIds];

  return {
    foundSpotIds: nextSpotIds,
    isComplete: targetIds.every((targetId) => nextSpotIds.includes(targetId)),
  };
}

export function getMoonRunRoundSummary(session: FriendBookGameSessionState): string {
  if (!session.moonRun) {
    return '';
  }

  const heartLabel = session.moonRun.heartsRemaining === 1 ? 'heart' : 'hearts';
  return `Reached the moon gate with ${session.moonRun.heartsRemaining} ${heartLabel} left.`;
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

function createMoonRunSession(
  level: FriendBookMoonRunLevel,
  heartsRemaining = 3,
): FriendBookMoonRunSessionState {
  return {
    heartsRemaining,
    status: heartsRemaining > 0 ? 'active' : 'failed',
    player: createMoonRunPlayer(level),
    cameraX: 0,
    enemies: createMoonRunEnemies(level),
    damageRecoveryMs: 0,
    finishReached: false,
  };
}

function createMoonRunPlayer(level: FriendBookMoonRunLevel): FriendBookMoonRunPlayerState {
  return {
    x: level.start.x,
    y: level.start.y,
    vx: 0,
    vy: 0,
    width: MOON_RUN_PLAYER_WIDTH,
    height: MOON_RUN_PLAYER_HEIGHT,
    facing: 'right',
    onGround: true,
  };
}

function createMoonRunEnemies(
  level: FriendBookMoonRunLevel,
): FriendBookMoonRunEnemyState[] {
  return level.enemies.map((enemy, index) => ({
    id: enemy.id,
    x: enemy.x,
    y: enemy.y,
    vx: index % 2 === 0 ? -enemy.speed : enemy.speed,
    direction: index % 2 === 0 ? 'left' : 'right',
    width: enemy.width,
    height: enemy.height,
    patrolMinX: enemy.patrolMinX,
    patrolMaxX: enemy.patrolMaxX,
    speed: enemy.speed,
    defeated: false,
  }));
}

function createMoonRunPostDamageState(
  level: FriendBookMoonRunLevel,
  nextHeartsRemaining: number,
): FriendBookMoonRunSessionState {
  const safeHearts = Math.max(nextHeartsRemaining, 0);
  return {
    heartsRemaining: safeHearts,
    status: safeHearts > 0 ? 'active' : 'failed',
    player: createMoonRunPlayer(level),
    cameraX: 0,
    enemies: createMoonRunEnemies(level),
    damageRecoveryMs: safeHearts > 0 ? MOON_RUN_DAMAGE_RECOVERY_MS : 0,
    finishReached: false,
  };
}

function advanceMoonRunEnemies(
  enemies: readonly FriendBookMoonRunEnemyState[],
  stepSeconds: number,
): FriendBookMoonRunEnemyState[] {
  return enemies.map((enemy) => {
    if (enemy.defeated) {
      return enemy;
    }

    let nextX = enemy.x + enemy.vx * stepSeconds;
    let nextDirection = enemy.direction;
    if (nextX <= enemy.patrolMinX) {
      nextX = enemy.patrolMinX;
      nextDirection = 'right';
    } else if (nextX >= enemy.patrolMaxX) {
      nextX = enemy.patrolMaxX;
      nextDirection = 'left';
    }

    return {
      ...enemy,
      x: nextX,
      direction: nextDirection,
      vx: nextDirection === 'left' ? -enemy.speed : enemy.speed,
    };
  });
}

function findLandingSurfaceY(
  level: FriendBookMoonRunLevel,
  playerX: number,
  playerWidth: number,
  previousBottom: number,
  nextBottom: number,
): number | null {
  const playerLeft = playerX + 4;
  const playerRight = playerX + playerWidth - 4;

  const surfaces = [
    ...buildMoonRunGroundSurfaces(level),
    ...level.platforms.map((platform) => ({
      x: platform.x,
      width: platform.width,
      y: platform.y,
    })),
  ]
    .filter(
      (surface) =>
        playerRight > surface.x &&
        playerLeft < surface.x + surface.width &&
        previousBottom <= surface.y &&
        nextBottom >= surface.y,
    )
    .sort((left, right) => left.y - right.y);

  return surfaces[0]?.y ?? null;
}

function buildMoonRunGroundSurfaces(level: FriendBookMoonRunLevel) {
  const pits = [...level.pitZones].sort((left, right) => left.startX - right.startX);
  const surfaces: Array<{ x: number; width: number; y: number }> = [];
  let cursor = 0;

  for (const pit of pits) {
    if (pit.startX > cursor) {
      surfaces.push({
        x: cursor,
        width: pit.startX - cursor,
        y: level.groundY,
      });
    }
    cursor = pit.startX + pit.width;
  }

  if (cursor < level.worldWidth) {
    surfaces.push({
      x: cursor,
      width: level.worldWidth - cursor,
      y: level.groundY,
    });
  }

  return surfaces;
}

function resolveMoonRunCameraX(
  level: FriendBookMoonRunLevel,
  player: FriendBookMoonRunPlayerState,
): number {
  return clampToRange(
    player.x + player.width / 2 - level.viewportWidth / 2,
    0,
    level.worldWidth - level.viewportWidth,
  );
}

function rectanglesOverlap(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    first.x < second.x + second.width &&
    first.x + first.width > second.x &&
    first.y < second.y + second.height &&
    first.y + first.height > second.y
  );
}

function clampToRange(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
