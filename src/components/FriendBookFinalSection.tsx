import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Sparkles,
  PenLine,
} from 'lucide-react';

import { friendBookFinalSectionData } from '../data';
import {
  type FriendBookAvatarId,
  type FriendBookGameId,
  type FriendBookGameSessionState,
  type FriendBookStage,
  answerFriendBookQuizQuestion,
  advanceFriendBookQuizQuestion,
  completeBetweenTwoPagesRound,
  completeFriendBookGameSession,
  createDefaultFriendBookProgress,
  createFriendBookGameSession,
  formatFriendBookArchiveDate,
  getAvailableFriendBookAvatarIds,
  getFriendBookGameStartStage,
  getFriendBookMedalIdForGame,
  getNextBetweenTwoPagesSceneRotation,
  hydrateFriendBookProgress,
  persistFriendBookProgress,
  resolveBetweenTwoPagesSpotSelection,
  selectFriendBookAvatar,
} from './FriendBookFinalSection.logic';
import FriendBookGameOverlay from './FriendBookGameOverlay';
import FriendBookMoonRunStage from './FriendBookMoonRunStage';

type FriendBookButtonOffset = {
  x: number;
  y: number;
};

type FriendBookResponsiveButtonWidth = {
  mobile: number;
  desktop: number;
};

type FriendBookCopyOffsetGroup = {
  container: FriendBookButtonOffset;
  title: FriendBookButtonOffset;
  description: FriendBookButtonOffset;
};

type FriendBookOffsetWithScale = FriendBookButtonOffset & {
  scale: number;
};

type FriendBookArchiveSampleEntryId = 'spring-wind' | 'book-sea-diver' | 'night-watcher';

type FriendBookArchiveSampleEntryPositioning = {
  avatar: FriendBookButtonOffset;
  title: FriendBookButtonOffset;
  seal: FriendBookButtonOffset;
  excerpt: FriendBookButtonOffset;
  medal: FriendBookOffsetWithScale;
};

type FriendBookArchiveUserSlotPositioning = {
  container: FriendBookButtonOffset;
  copy: FriendBookButtonOffset;
  label: FriendBookButtonOffset;
  note: FriendBookButtonOffset;
  meta: FriendBookButtonOffset;
  avatar: FriendBookOffsetWithScale;
  medal: FriendBookOffsetWithScale;
  date: FriendBookButtonOffset;
};

type FriendBookAbsoluteLayout = {
  left: string;
  top: string;
  width: string;
  height?: string;
};

// 中文注释：用于整体微调左页三条样例记录。
// x 为水平位移，负数向左、正数向右；y 为垂直位移，负数向上、正数向下。
// 这里只移动“头像 + 标题 + 正文 + 右侧徽章”这一整组，不影响右页日期槽位。
export const FRIEND_BOOK_ARCHIVE_SAMPLE_STACK_NUDGE = {
  x: 0,
  y: -18,
} as const;

export const FRIEND_BOOK_ARCHIVE_SAMPLE_ROW_POSITIONING = {
  shared: { x: 0, y: 0 },
  perEntry: {
    'spring-wind': { x: 0, y: 0 },
    'book-sea-diver': { x: 0, y: 0 },
    'night-watcher': { x: 0, y: 0 },
  },
} as const satisfies {
  shared: FriendBookButtonOffset;
  perEntry: Record<FriendBookArchiveSampleEntryId, FriendBookButtonOffset>;
};

/**
 * Friend Book Finale 左页样例记录内部元素位置参数（仅桌面端预览板）
 *
 * 所有数值单位都是像素：
 * - avatar / title / seal / excerpt: x / y
 * - medal: x / y / scale
 *
 * 规则：
 * - `shared` 用于三条样例统一偏移
 * - `perEntry` 用于单条样例单独微调
 * - `medal.scale` 为缩放倍数，`1` 表示原尺寸
 */
export const FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING = {
  shared: {
    avatar: { x: 0, y: 0 },
    title: { x: 0, y: 0 },
    seal: { x: 0, y: 0 },
    excerpt: { x: 0, y: 0 },
    medal: { x: 0, y: 0, scale: 1 },
  },
  perEntry: {
    'spring-wind': {
      avatar: { x: 0, y: 0 },
      title: { x: 0, y: 0 },
      seal: { x: 0, y: 0 },
      excerpt: { x: 0, y: 0 },
      medal: { x: -1, y: 10, scale: 1.12 },
    },
    'book-sea-diver': {
      avatar: { x: 0, y: 0 },
      title: { x: 0, y: 0 },
      seal: { x: 0, y: 0 },
      excerpt: { x: 0, y: 0 },
      medal: { x: 0, y: 0, scale: 1 },
    },
    'night-watcher': {
      avatar: { x: 0, y: 0 },
      title: { x: 0, y: 0 },
      seal: { x: 0, y: 0 },
      excerpt: { x: 0, y: 0 },
      medal: { x: 0, y: 0, scale: 1 },
    },
  },
} as const satisfies {
  shared: FriendBookArchiveSampleEntryPositioning;
  perEntry: Record<FriendBookArchiveSampleEntryId, FriendBookArchiveSampleEntryPositioning>;
};

export const FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING = {
  shared: {
    container: { x: 0, y: 0 },
    copy: { x: 0, y: 0 },
    label: { x: 0, y: 0 },
    note: { x: 0, y: 0 },
    meta: { x: 0, y: 0 },
    avatar: { x: 0, y: 0, scale: 1 },
    medal: { x: 0, y: 0, scale: 1 },
    date: { x: 0, y: 0 },
  },
  perSlot: {
    'between-two-pages': {
      container: { x: 0, y: 0 },
      copy: { x: 0, y: 0 },
      label: { x: 0, y: 0 },
      note: { x: 0, y: 0 },
      meta: { x: 0, y: 0 },
      avatar: { x: 0, y: 0, scale: 1 },
      medal: { x: 0, y: 0, scale: 1 },
      date: { x: 0, y: 0 },
    },
    'moon-run': {
      container: { x: 0, y: 0 },
      copy: { x: 0, y: 0 },
      label: { x: 0, y: 0 },
      note: { x: 0, y: 0 },
      meta: { x: 0, y: 0 },
      avatar: { x: 0, y: 0, scale: 1 },
      medal: { x: 0, y: 0, scale: 1 },
      date: { x: 0, y: 0 },
    },
    'one-stroke-mark': {
      container: { x: 0, y: 0 },
      copy: { x: 0, y: 0 },
      label: { x: 0, y: 0 },
      note: { x: 0, y: 0 },
      meta: { x: 0, y: 0 },
      avatar: { x: 0, y: 0, scale: 1 },
      medal: { x: 0, y: 0, scale: 1 },
      date: { x: 0, y: 0 },
    },
  },
} as const satisfies {
  shared: FriendBookArchiveUserSlotPositioning;
  perSlot: Record<FriendBookGameId, FriendBookArchiveUserSlotPositioning>;
};

const FRIEND_BOOK_SAMPLE_ENTRY_GRID = {
  outer: {
    base: 'grid-cols-[58px_minmax(0,1fr)_100px]',
    xl: 'xl:grid-cols-[68px_minmax(0,1fr)_110px]',
  },
  copy: 'flex min-w-0 flex-col gap-2',
  header: 'flex flex-nowrap items-center gap-x-3',
  seal:
    'inline-flex shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.64rem] uppercase tracking-[0.16em] xl:px-3 xl:text-[0.72rem]',
  excerpt: 'text-[0.96rem] leading-7 text-[#463731] xl:text-[1.18rem] xl:leading-[1.6]',
  medalSize: {
    base: 'h-[4.5rem] w-[4.5rem]',
    xl: 'xl:h-[5.8rem] xl:w-[5.8rem]',
  },
} as const;

const FRIEND_BOOK_ARCHIVE_DESKTOP_LAYOUT = {
  headerLeft: { left: '2.7%', top: '3.6%', width: '45.6%' },
  headerRight: { left: '51.6%', top: '3.8%', width: '42.8%' },
  sampleEntries: {
    'spring-wind': { left: '3.9%', top: '20%', width: '44.2%', height: '22%' },
    'book-sea-diver': { left: '3.9%', top: '45%', width: '44.2%', height: '22%' },
    'night-watcher': { left: '3.9%', top: '70%', width: '44.2%', height: '22%' },
  },
  userSlots: {
    'between-two-pages': { left: '51.5%', top: '22.8%', width: '43.1%', height: '16.0%' },
    'moon-run': { left: '51.5%', top: '45.3%', width: '43.1%', height: '15.6%' },
    'one-stroke-mark': { left: '51.5%', top: '67.8%', width: '43.1%', height: '15.6%' },
  },
} as const satisfies {
  headerLeft: FriendBookAbsoluteLayout;
  headerRight: FriendBookAbsoluteLayout;
  sampleEntries: Record<'spring-wind' | 'book-sea-diver' | 'night-watcher', FriendBookAbsoluteLayout>;
  userSlots: Record<FriendBookGameId, FriendBookAbsoluteLayout>;
};

/**
 * Friend Book Finale 按钮位置参数
 *
 * 所有数值单位都是像素：
 * - x: 水平位移，正数向右，负数向左
 * - y: 垂直位移，正数向下，负数向上
 *
 * 参数结构说明：
 * - hero.primary
 *   顶部大按钮「Start Playing」的位置
 * - hero.secondary.startPlaying
 *   顶部右侧小按钮「Start Playing →」的位置和尺寸
 * - hero.secondary.openFriendBook
 *   顶部右侧小按钮「Open Friend Book →」的位置和尺寸
 * - gameCards.shared
 *   三张游戏卡底部 Begin 按钮的统一偏移量
 * - gameCards.perCard[gameId]
 *   单张卡片自己的额外偏移量，会叠加到 shared 上
 *
 * 示范案例 1：把顶部大按钮向右移动 24px、向下移动 12px
 * hero: {
 *   primary: { x: 24, y: 12 },
 * }
 *
 * 示范案例 2：让三张卡片的 Begin 按钮整体向左 10px
 * gameCards: {
 *   shared: { x: -10, y: 0 },
 * }
 *
 * 示范案例 3：只单独调整 Moon Run 这一张卡片的 Begin 按钮
 * gameCards: {
 *   perCard: {
 *     'moon-run': { x: 18, y: -6 },
 *   }
 * }
 *
 * 示范案例 4：单独放大 Open Friend Book →
 * hero: {
 *   secondary: {
 *     openFriendBook: {
 *       x: 0,
 *       y: 0,
 *       width: { mobile: 168, desktop: 198 },
 *     },
 *   },
 * }
 */
export const FRIEND_BOOK_BUTTON_POSITIONING = {
  hero: {
    primary: { x: -50, y: 35 },
    secondary: {
      startPlaying: {
        x: -250,
        y: 60,
        width: { mobile: 140, desktop: 170 },
      },
      openFriendBook: {
        x: 30,
        y: -5,
        width: { mobile: 168, desktop: 230 },
      },
    },
  },
  gameCards: {
    shared: { x: 0, y: 0 },
    perCard: {
      'between-two-pages': { x: -10, y: -22 },
      'moon-run': { x: -20, y: -16 },
      'one-stroke-mark': { x: -21, y: -15 },
    },
  },
} as const satisfies {
  hero: {
    primary: FriendBookButtonOffset;
    secondary: {
      startPlaying: FriendBookButtonOffset & { width: FriendBookResponsiveButtonWidth };
      openFriendBook: FriendBookButtonOffset & { width: FriendBookResponsiveButtonWidth };
    };
  };
  gameCards: {
    shared: FriendBookButtonOffset;
    perCard: Record<FriendBookGameId, FriendBookButtonOffset>;
  };
};

/**
 * Friend Book Finale 文案位置参数
 *
 * 所有数值单位都是像素：
 * - container: 整个文案块（标题 + 描述）一起移动
 * - title: 只移动标题
 * - description: 只移动描述
 *
 * 推荐调整顺序：
 * 1. 先改 `container`
 * 2. 再用 `title` / `description` 微调
 *
 * 示例：单独把 Moon Run 的标题右移 18px、描述下移 8px
 * gameCards: {
 *   perCard: {
 *     'moon-run': {
 *       container: { x: 0, y: 0 },
 *       title: { x: 18, y: 0 },
 *       description: { x: 0, y: 8 },
 *     },
 *   },
 * }
 */
export const FRIEND_BOOK_COPY_POSITIONING = {
  gameCards: {
    shared: {
      container: { x: 0, y: 0 },
      title: { x: 0, y: 0 },
      description: { x: 0, y: 0 },
    },
    perCard: {
      'between-two-pages': {
        container: { x: 0, y: 0 },
        title: { x: 0, y: 0 },
        description: { x: 0, y: 0 },
      },
      'moon-run': {
        container: { x: 0, y: -17 },
        title: { x: 0, y: 0 },
        description: { x: 0, y: 0 },
      },
      'one-stroke-mark': {
        container: { x: 0, y: 0 },
        title: { x: 0, y: 0 },
        description: { x: 0, y: 0 },
      },
    },
  },
} as const satisfies {
  gameCards: {
    shared: FriendBookCopyOffsetGroup;
    perCard: Record<FriendBookGameId, FriendBookCopyOffsetGroup>;
  };
};

function getOffsetStyle(offset: FriendBookButtonOffset): CSSProperties {
  return {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  };
}

function getOffsetScaleStyle(offset: FriendBookButtonOffset, scale: number): CSSProperties {
  return {
    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
  };
}

function getAbsoluteLayoutStyle(layout: FriendBookAbsoluteLayout): CSSProperties {
  return {
    left: layout.left,
    top: layout.top,
    width: layout.width,
    height: layout.height,
  };
}

function getResponsiveButtonWidthStyle(
  width: FriendBookResponsiveButtonWidth,
): CSSProperties & Record<'--friend-book-button-width-mobile' | '--friend-book-button-width-desktop', string> {
  return {
    '--friend-book-button-width-mobile': `${width.mobile}px`,
    '--friend-book-button-width-desktop': `${width.desktop}px`,
  };
}

function combineOffsets(
  baseOffset: FriendBookButtonOffset,
  overrideOffset: FriendBookButtonOffset,
): FriendBookButtonOffset {
  // 卡片按钮同时支持“全局统一偏移”和“单卡额外偏移”，这里负责把两者叠加。
  return {
    x: baseOffset.x + overrideOffset.x,
    y: baseOffset.y + overrideOffset.y,
  };
}

function combineOffsetWithScale(
  baseOffset: FriendBookOffsetWithScale,
  overrideOffset: FriendBookOffsetWithScale,
): FriendBookOffsetWithScale {
  return {
    x: baseOffset.x + overrideOffset.x,
    y: baseOffset.y + overrideOffset.y,
    scale: baseOffset.scale * overrideOffset.scale,
  };
}

function getCssUrlValue(imageUrl: string) {
  return `url("${encodeURI(imageUrl)}")`;
}

function getPaperBackgroundStyle(imageUrl: string, overlay = 'rgba(255,247,232,0.86)') {
  return {
    backgroundImage: `linear-gradient(${overlay}, ${overlay}), ${getCssUrlValue(imageUrl)}`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  } as const;
}

function getIllustratedBackgroundStyle(imageUrl: string) {
  return {
    backgroundImage: `linear-gradient(rgba(255,246,236,0.12), rgba(255,246,236,0.12)), ${getCssUrlValue(imageUrl)}`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  } as const;
}

function getArchiveBoardBackgroundStyle(imageUrl: string) {
  return {
    backgroundImage: getCssUrlValue(imageUrl),
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: '100% 100%',
  } as const;
}

function FriendBookImageButton({
  label,
  asset,
  onClick,
  className,
  disabled,
  style,
  dataButtonSize,
}: {
  label: string;
  asset: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  style?: CSSProperties;
  dataButtonSize?: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      data-friend-book-button-size={dataButtonSize}
      style={style}
      className={`inline-flex items-center justify-center transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ''}`}
    >
      <img src={asset} alt="" aria-hidden="true" className="block h-auto w-full drop-shadow-[0_6px_10px_rgba(64,36,24,0.18)]" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

function getGamePrompt(gameId: FriendBookGameId): string {
  switch (gameId) {
    case 'between-two-pages':
      return 'Find the three quiet differences before the candle timer runs out.';
    case 'moon-run':
      return 'Run across the quiet pages and reach the moon gate.';
    case 'one-stroke-mark':
      return 'Observe the silhouette, guess who it belongs to, and turn to the next page.';
    default:
      return '';
  }
}

export function getBetweenTwoPagesTargetButtonClassName(isFound: boolean): string {
  return [
    'absolute -translate-x-1/2 -translate-y-1/2 rounded-full border transition',
    isFound ? 'border-transparent bg-transparent' : 'border-transparent bg-transparent',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f715c]/40',
  ].join(' ');
}

export function getBetweenTwoPagesHintsVisibility(
  status: 'active' | 'success' | 'failed',
  showHintsRequested: boolean,
): { showHintsToggle: boolean; showHintsList: boolean } {
  return {
    showHintsToggle: status !== 'active',
    showHintsList: status !== 'active' && showHintsRequested,
  };
}

export function getBetweenTwoPagesTimerEffectKey(
  stage: FriendBookStage,
  activeGameId: FriendBookGameId | null,
  status: 'active' | 'success' | 'failed' | undefined,
): string {
  return `${stage}:${activeGameId ?? 'none'}:${status ?? 'none'}`;
}

export default function FriendBookFinalSection() {
  const [progress, setProgress] = useState(createDefaultFriendBookProgress);
  const [stage, setStage] = useState<FriendBookStage>('landing');
  const [activeGameId, setActiveGameId] = useState<FriendBookGameId | null>(null);
  const [selectedAvatarCandidate, setSelectedAvatarCandidate] = useState<FriendBookAvatarId | null>(null);
  const [pendingMedalId, setPendingMedalId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [gameSession, setGameSession] = useState<FriendBookGameSessionState | null>(null);
  const [roundSummary, setRoundSummary] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [showBetweenTwoPagesHints, setShowBetweenTwoPagesHints] = useState(false);
  const [seenBetweenTwoPagesSceneIds, setSeenBetweenTwoPagesSceneIds] = useState<string[]>([]);

  const avatarById = Object.fromEntries(
    friendBookFinalSectionData.avatars.map((avatar) => [avatar.id, avatar]),
  ) as Record<FriendBookAvatarId, (typeof friendBookFinalSectionData.avatars)[number]>;
  const activeGame = activeGameId
    ? friendBookFinalSectionData.gameCards.find((game) => game.id === activeGameId) ?? null
    : null;
  const availableAvatarIds = getAvailableFriendBookAvatarIds(progress);
  const betweenTwoPagesScene =
    friendBookFinalSectionData.betweenTwoPagesScenes.find(
      (scene) => scene.id === gameSession?.betweenTwoPages?.sceneId,
    ) ?? friendBookFinalSectionData.betweenTwoPagesScenes[0];
  const betweenTwoPagesTimerEffectKey = getBetweenTwoPagesTimerEffectKey(
    stage,
    activeGameId,
    gameSession?.betweenTwoPages?.status,
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    setProgress(hydrateFriendBookProgress(window.localStorage));
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || typeof window === 'undefined') {
      return;
    }

    persistFriendBookProgress(progress, window.localStorage);
  }, [progress, isHydrated]);

  useEffect(() => {
    setSelectedAvatarCandidate(progress.selectedAvatarId);
  }, [progress.selectedAvatarId]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const shouldLockBody = stage === 'avatar-select' || stage === 'game-active';
    if (!shouldLockBody) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [stage]);

  useEffect(() => {
    if (
      stage !== 'game-active' ||
      activeGameId !== 'between-two-pages' ||
      !gameSession?.betweenTwoPages ||
      gameSession.betweenTwoPages.status !== 'active' ||
      typeof window === 'undefined'
    ) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setGameSession((currentSession) => {
        if (
          !currentSession?.betweenTwoPages ||
          currentSession.gameId !== 'between-two-pages' ||
          currentSession.betweenTwoPages.status !== 'active'
        ) {
          return currentSession;
        }

        const nextRemainingSeconds = Math.max(
          currentSession.betweenTwoPages.remainingSeconds - 1,
          0,
        );

        return {
          ...currentSession,
          betweenTwoPages: {
            ...currentSession.betweenTwoPages,
            remainingSeconds: nextRemainingSeconds,
            status: nextRemainingSeconds === 0 ? 'failed' : currentSession.betweenTwoPages.status,
          },
        };
      });
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [betweenTwoPagesTimerEffectKey]);

  function resetGameState(gameId: FriendBookGameId) {
    let nextGameSession: FriendBookGameSessionState;

    if (gameId === 'between-two-pages') {
      const nextRotation = getNextBetweenTwoPagesSceneRotation(seenBetweenTwoPagesSceneIds);
      setSeenBetweenTwoPagesSceneIds(nextRotation.seenSceneIds);
      nextGameSession = createFriendBookGameSession(
        gameId,
        friendBookFinalSectionData.quizQuestionBank,
        Math.random,
        { betweenTwoPagesSceneId: nextRotation.sceneId },
      );
    } else {
      nextGameSession = createFriendBookGameSession(gameId);
    }

    setActiveGameId(gameId);
    setGameSession(nextGameSession);
    setPendingMedalId(null);
    setRoundSummary('');
    setShowBetweenTwoPagesHints(false);
    setSelectedAvatarCandidate(progress.selectedAvatarId);
    setNoteDraft(progress.games[gameId].latestNote);
  }

  function scrollToTarget(id: string) {
    if (typeof document === 'undefined') {
      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function beginGame(gameId: FriendBookGameId) {
    resetGameState(gameId);
    setStage(getFriendBookGameStartStage(progress, gameId));
  }

  function continueAfterAvatarPick() {
    if (!selectedAvatarCandidate) {
      return;
    }

    setProgress((currentProgress) =>
      selectFriendBookAvatar(currentProgress, selectedAvatarCandidate),
    );
    setStage('game-active');
  }

  function moveIntoNoteStage(gameId: FriendBookGameId, summary: string) {
    const medalId = getFriendBookMedalIdForGame(gameId, Math.random());
    setPendingMedalId(medalId);
    setRoundSummary(summary);
    setStage('note-entry');
  }

  function handleMoonRunComplete(result: { score: number }) {
    const snackLabel = result.score === 1 ? 'snack' : 'snacks';
    moveIntoNoteStage(
      'moon-run',
      `Reached the moon gate after collecting ${result.score} midnight ${snackLabel}.`,
    );
  }

  function handleDifferenceMiss() {
    if (
      !gameSession?.betweenTwoPages ||
      gameSession.gameId !== 'between-two-pages' ||
      gameSession.betweenTwoPages.status !== 'active'
    ) {
      return;
    }

    setGameSession({
      ...gameSession,
      betweenTwoPages: {
        ...gameSession.betweenTwoPages,
        mistakes: gameSession.betweenTwoPages.mistakes + 1,
      },
    });
  }

  function handleDifferenceSpotSelect(spotId: string) {
    if (
      !gameSession?.betweenTwoPages ||
      gameSession.gameId !== 'between-two-pages' ||
      gameSession.betweenTwoPages.status !== 'active'
    ) {
      return;
    }

    const nextState = resolveBetweenTwoPagesSpotSelection(
      gameSession.betweenTwoPages.foundSpotIds,
      spotId,
      gameSession.betweenTwoPages.targetIds,
    );
    const nextSession: FriendBookGameSessionState = {
      ...gameSession,
      betweenTwoPages: {
        ...gameSession.betweenTwoPages,
        foundSpotIds: nextState.foundSpotIds,
        status: nextState.isComplete ? 'success' : gameSession.betweenTwoPages.status,
      },
    };

    setGameSession(nextSession);

    if (nextState.isComplete) {
      const result = completeBetweenTwoPagesRound(nextSession);
      if (result.isSuccess) {
        moveIntoNoteStage(
          'between-two-pages',
          `${nextState.foundSpotIds.length} / ${gameSession.betweenTwoPages.targetIds.length} details found with ${result.score}s left.`,
        );
      }
    }
  }

  function handleReplayActiveGame() {
    if (!activeGameId) {
      return;
    }

    resetGameState(activeGameId);
    setStage('game-active');
  }

  function handleQuizAnswer(answer: string) {
    if (!gameSession?.quiz || gameSession.gameId !== 'one-stroke-mark') {
      return;
    }

    setGameSession(answerFriendBookQuizQuestion(gameSession, answer));
  }

  function handleAdvanceQuizQuestion() {
    if (!gameSession?.quiz || gameSession.gameId !== 'one-stroke-mark') {
      return;
    }

    const nextSession = advanceFriendBookQuizQuestion(gameSession);
    setGameSession(nextSession);

    if (nextSession.quiz?.completed) {
      moveIntoNoteStage(
        'one-stroke-mark',
        `${nextSession.quiz.correctAnswerCount} / ${nextSession.quiz.questions.length} silhouettes recognized.`,
      );
    }
  }

  function handleNoteSubmit() {
    if (!activeGameId || !pendingMedalId || !noteDraft.trim()) {
      return;
    }

    const displayDate = formatFriendBookArchiveDate(new Date());

    setProgress((currentProgress) =>
      completeFriendBookGameSession(currentProgress, {
        gameId: activeGameId,
        note: noteDraft,
        displayDate,
        medalId: pendingMedalId,
      }),
    );
    setStage('landing');
    setPendingMedalId(null);
    setActiveGameId(null);
    setGameSession(null);
    setRoundSummary('');
    scrollToTarget('friend-book-preview');
  }

  const currentAvatar = progress.selectedAvatarId
    ? avatarById[progress.selectedAvatarId]
    : null;
  const pendingMedalImage = pendingMedalId;
  const currentQuizQuestion =
    gameSession?.quiz?.questions[gameSession.quiz.currentQuestionIndex] ?? null;
  const overlayPrompt =
    stage === 'avatar-select'
      ? 'Pick the companion who will sign tonight’s page before the game begins.'
      : activeGame
        ? getGamePrompt(activeGame.id)
        : '';
  const overlayProgressLabel = gameSession?.quiz
    ? `${Math.min(gameSession.quiz.currentQuestionIndex + 1, gameSession.quiz.questions.length)} / ${gameSession.quiz.questions.length}`
    : gameSession?.betweenTwoPages
      ? `${gameSession.betweenTwoPages.foundSpotIds.length} / ${gameSession.betweenTwoPages.targetIds.length} found`
      : null;
  const betweenTwoPagesHintsVisibility = gameSession?.betweenTwoPages
    ? getBetweenTwoPagesHintsVisibility(
      gameSession.betweenTwoPages.status,
      showBetweenTwoPagesHints,
    )
    : { showHintsToggle: false, showHintsList: false };

  return (
    <section
      id="friend-book-finale-section"
      aria-labelledby="friend-book-finale-title"
      data-friend-book-stage={stage}
      className="relative overflow-hidden px-4 py-12 text-stone-900 sm:px-6 lg:px-8 lg:py-16"
      style={{
        backgroundImage: `linear-gradient(rgba(252,247,238,0.68), rgba(248,241,229,0.72)), url(${friendBookFinalSectionData.assets.sectionBackground})`,
        backgroundPosition: 'center top',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
      }}
    >
      <div className="mx-auto flex max-w-[1180px] flex-col gap-6 lg:gap-7">
        <header className="flex min-h-[320px] flex-col items-center justify-center px-4 py-8 text-center sm:min-h-[420px]">
          <p className="font-serif text-[clamp(2.6rem,6.5vw,5.5rem)] leading-[0.95] tracking-[-0.045em] text-[#2a2020] drop-shadow-[0_2px_0_rgba(255,248,236,0.65)]">
            {friendBookFinalSectionData.topHeading.english}
          </p>
          <p className="mt-1 font-serif text-[clamp(2.2rem,5.4vw,4.4rem)] leading-[0.98] tracking-[-0.04em] text-[#2a2020] drop-shadow-[0_2px_0_rgba(255,248,236,0.65)]">
            {friendBookFinalSectionData.topHeading.chinese}
          </p>
        </header>

        <div className="rounded-[2rem] bg-[#5a4032] p-[6px] shadow-[0_22px_48px_rgba(67,42,29,0.3)]">
          <div
            className="grid gap-6 rounded-[1.65rem] px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:px-10 lg:py-8"
            style={getPaperBackgroundStyle(friendBookFinalSectionData.assets.heroPanelBackground)}
          >
            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-[#48362d]">
                {friendBookFinalSectionData.overline}
              </p>
              <h2
                id="friend-book-finale-title"
                className="mt-4 max-w-[16ch] font-serif text-[clamp(2.45rem,5vw,4.15rem)] leading-[0.94] tracking-[-0.05em] text-[#2f2120]"
              >
                {friendBookFinalSectionData.title}
              </h2>
              <p className="mt-4 max-w-[34rem] text-[1.02rem] leading-8 text-[#47352d]">
                {friendBookFinalSectionData.description}
              </p>
            </div>

            <div className="flex flex-col justify-center gap-4 lg:items-end">
              <div
                data-friend-book-button-anchor="hero-primary"
                style={getOffsetStyle(FRIEND_BOOK_BUTTON_POSITIONING.hero.primary)}
                className="w-full lg:flex lg:justify-end"
              >
                <FriendBookImageButton
                  label="Start Playing"
                  asset={friendBookFinalSectionData.assets.buttons.startPlayingPrimary}
                  onClick={() => scrollToTarget('friend-book-game-grid')}
                  className="w-full max-w-[320px]"
                />
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                {friendBookFinalSectionData.ctaLinks.map((ctaLink) => (
                  <div
                    key={ctaLink.id}
                    data-friend-book-button-anchor={
                      ctaLink.id === 'friend-book-start-link'
                        ? 'hero-secondary-start-playing'
                        : 'hero-secondary-open-friend-book'
                    }
                    style={getOffsetStyle(
                      ctaLink.id === 'friend-book-start-link'
                        ? FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.startPlaying
                        : FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.openFriendBook,
                    )}
                  >
                    <FriendBookImageButton
                      dataButtonSize={
                        ctaLink.id === 'friend-book-start-link'
                          ? 'hero-secondary-start-playing'
                          : 'hero-secondary-open-friend-book'
                      }
                      label={ctaLink.label}
                      asset={ctaLink.asset}
                      onClick={() => scrollToTarget(ctaLink.href.slice(1))}
                      className="w-[var(--friend-book-button-width-mobile)] sm:w-[var(--friend-book-button-width-desktop)]"
                      style={getResponsiveButtonWidthStyle(
                        ctaLink.id === 'friend-book-start-link'
                          ? FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.startPlaying.width
                          : FRIEND_BOOK_BUTTON_POSITIONING.hero.secondary.openFriendBook.width,
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div
          id="friend-book-game-grid"
          className="grid gap-4 lg:grid-cols-3"
        >
          {friendBookFinalSectionData.gameCards.map((card) => {
            const copyOffsetGroup = FRIEND_BOOK_COPY_POSITIONING.gameCards.perCard[card.id];

            return (
              <article
                key={card.id}
                data-friend-book-game-card={card.id}
                className="relative overflow-hidden rounded-[1.2rem] bg-[#f8efe1] shadow-[0_18px_30px_rgba(67,42,29,0.22)]"
                style={getIllustratedBackgroundStyle(card.backgroundImage)}
              >
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,239,0.42),rgba(255,248,239,0.08)_36%,rgba(75,53,38,0.04)_100%)]" />
                <div className="relative flex min-h-[318px] flex-col justify-between gap-4 px-5 py-5 sm:min-h-[340px]">
                  <div
                    aria-hidden="true"
                    data-friend-book-card-top-spacer={card.id}
                    className="h-10 flex-none"
                  />

                  <div
                    data-friend-book-card-copy={card.id}
                    className="w-[18rem] max-w-full"
                    style={getOffsetStyle(
                      combineOffsets(
                        FRIEND_BOOK_COPY_POSITIONING.gameCards.shared.container,
                        copyOffsetGroup.container,
                      ),
                    )}
                  >
                    <h3
                      data-friend-book-card-copy-title={card.id}
                      style={getOffsetStyle(
                        combineOffsets(
                          FRIEND_BOOK_COPY_POSITIONING.gameCards.shared.title,
                          copyOffsetGroup.title,
                        ),
                      )}
                      className="font-serif text-[2.2rem] leading-[0.96] tracking-[-0.05em] text-[#2a2020]"
                    >
                      {card.title}
                    </h3>
                    <p
                      data-friend-book-card-copy-description={card.id}
                      style={getOffsetStyle(
                        combineOffsets(
                          FRIEND_BOOK_COPY_POSITIONING.gameCards.shared.description,
                          copyOffsetGroup.description,
                        ),
                      )}
                      className="mt-3 max-w-[16rem] text-[1.02rem] leading-8 text-[#46362f]"
                    >
                      {card.description}
                    </p>
                  </div>

                  <div
                    data-friend-book-button-anchor={`game-card-${card.id}`}
                    style={getOffsetStyle(
                      combineOffsets(
                        FRIEND_BOOK_BUTTON_POSITIONING.gameCards.shared,
                        FRIEND_BOOK_BUTTON_POSITIONING.gameCards.perCard[card.id],
                      ),
                    )}
                  >
                    <FriendBookImageButton
                      label={`${card.ctaLabel} ${card.title}`}
                      asset={friendBookFinalSectionData.assets.buttons.begin}
                      onClick={() => beginGame(card.id)}
                      className="w-[104px]"
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {activeGame && (stage === 'avatar-select' || stage === 'game-active') ? (
          <FriendBookGameOverlay
            activeGame={activeGame}
            stage={stage}
            prompt={overlayPrompt}
            progressLabel={stage === 'game-active' ? overlayProgressLabel : null}
            onClose={() => {
              setStage('landing');
              setActiveGameId(null);
              setGameSession(null);
              setPendingMedalId(null);
              setRoundSummary('');
            }}
          >
            {stage === 'avatar-select' ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {friendBookFinalSectionData.avatars.map((avatar) => {
                    const isAvailable = availableAvatarIds.includes(avatar.id);
                    const isSelected = selectedAvatarCandidate === avatar.id;

                    return (
                      <button
                        key={avatar.id}
                        type="button"
                        onClick={() => isAvailable && setSelectedAvatarCandidate(avatar.id)}
                        disabled={!isAvailable}
                        className={`flex items-center gap-4 rounded-[1.4rem] border px-4 py-4 text-left transition ${isSelected
                          ? 'border-[#6f4d3d] bg-[rgba(255,247,239,0.96)] shadow-[0_14px_24px_rgba(84,56,36,0.12)]'
                          : 'border-[#d8c5ae] bg-[rgba(255,250,245,0.82)]'
                          } ${!isAvailable ? 'opacity-55' : 'hover:-translate-y-0.5'}`}
                      >
                        <img
                          src={avatar.asset}
                          alt=""
                          aria-hidden="true"
                          className="h-16 w-16 rounded-full border border-[#d1b79f] object-cover"
                        />
                        <div>
                          <p className="font-serif text-xl text-[#2f2320]">{avatar.label}</p>
                          <p className="mt-1 text-sm leading-6 text-[#5b473d]">
                            {avatar.hidden
                              ? 'Unlocks after all three games have been cleared once.'
                              : 'Ready to sign the Friend Book tonight.'}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-[1.5rem] border border-[#dcc9b1] bg-[rgba(255,249,242,0.84)] p-5">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#7a5d4d]">
                    Current pick
                  </p>
                  {selectedAvatarCandidate ? (
                    <div className="mt-4 flex items-center gap-4">
                      <img
                        src={avatarById[selectedAvatarCandidate].asset}
                        alt=""
                        aria-hidden="true"
                        className="h-18 w-18 rounded-full border border-[#d1b79f] object-cover"
                      />
                      <div>
                        <p className="font-serif text-2xl text-[#2f2320]">
                          {avatarById[selectedAvatarCandidate].label}
                        </p>
                        <p className="text-sm text-[#5b473d]">
                          This avatar will sign your note until you change it again.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm leading-7 text-[#5b473d]">
                      Pick any visible companion to move into the game.
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={continueAfterAvatarPick}
                    disabled={!selectedAvatarCandidate}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#8f715c] bg-[#6a4f3c] px-5 py-3 text-sm font-medium text-[#fff9f4] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Sparkles className="h-4 w-4" strokeWidth={1.8} />
                    <span>Continue to {activeGame.title}</span>
                  </button>
                </div>
              </div>
            ) : null}

            {stage === 'game-active' && activeGame.id === 'between-two-pages' && gameSession?.betweenTwoPages ? (
              <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="mx-auto grid w-full max-w-[640px] grid-cols-1 gap-2 self-start">
                  {[
                    { id: 'left', label: 'Left page', image: betweenTwoPagesScene.baseImage },
                    { id: 'right', label: 'Right page', image: betweenTwoPagesScene.variantImage },
                  ].map((page) => (
                    <div
                      key={page.id}
                      onClick={handleDifferenceMiss}
                      className="group relative overflow-hidden rounded-[1.35rem] border border-[#c9b198] bg-[rgba(255,249,242,0.76)] text-left shadow-[0_10px_24px_rgba(70,43,29,0.08)]"
                      style={{ aspectRatio: `${betweenTwoPagesScene.aspectRatio}` }}
                    >
                      <img
                        src={page.image}
                        alt={page.label}
                        className="block h-full w-full object-contain"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,247,237,0.08),rgba(255,247,237,0.03)_36%,rgba(54,38,29,0.08)_100%)]" />
                      <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-[rgba(122,93,77,0.22)] bg-[rgba(255,248,241,0.9)] px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-[#6f5243]">
                        {page.label}
                      </span>

                      {betweenTwoPagesScene.targets.map((target) => {
                        const isFound = gameSession.betweenTwoPages!.foundSpotIds.includes(target.id);

                        return (
                          <button
                            key={`${page.id}-${target.id}`}
                            type="button"
                            aria-label={`Find ${target.label} on ${page.label.toLowerCase()}`}
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDifferenceSpotSelect(target.id);
                            }}
                            className={getBetweenTwoPagesTargetButtonClassName(isFound)}
                            style={{
                              left: `${target.x}%`,
                              top: `${target.y}%`,
                              width: `${target.width}%`,
                              height: `${target.height}%`,
                            }}
                          >
                            {isFound ? (
                              <span className="pointer-events-none absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#7d604c] bg-[rgba(255,248,242,0.92)] text-[#5d4032] shadow-[0_8px_12px_rgba(69,43,29,0.12)]">
                                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.5rem] border border-[#dcc9b1] bg-[rgba(255,249,242,0.84)] p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#7a5d4d]">
                        Difference hunt
                      </p>
                      <p className="mt-4 text-sm leading-7 text-[#503e35]">
                        Compare the left and right pages. Three quiet changes are hidden between them before the candle burns down.
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-[rgba(122,93,77,0.18)] bg-[rgba(255,248,241,0.92)] px-4 py-3 text-center">
                      <p className="font-mono text-[0.64rem] uppercase tracking-[0.24em] text-[#7a5d4d]">
                        Time
                      </p>
                      <p className="mt-1 font-serif text-[2rem] leading-none text-[#2f2320]">
                        {gameSession.betweenTwoPages.remainingSeconds}s
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-[rgba(122,93,77,0.12)]">
                    <div
                      className="h-full rounded-full bg-[#6e5443] transition-[width]"
                      style={{
                        width: `${(gameSession.betweenTwoPages.remainingSeconds / 12) * 100}%`,
                      }}
                    />
                  </div>
                  {betweenTwoPagesHintsVisibility.showHintsToggle ? (
                    <button
                      type="button"
                      onClick={() => setShowBetweenTwoPagesHints((current) => !current)}
                      className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#cbb59f] bg-[rgba(255,248,241,0.92)] px-3 py-2 text-sm text-[#5a473d]"
                    >
                      <span>
                        {betweenTwoPagesHintsVisibility.showHintsList
                          ? 'Hide difference hints'
                          : 'Show difference hints'}
                      </span>
                    </button>
                  ) : null}
                  {betweenTwoPagesHintsVisibility.showHintsList ? (
                    <ul className="mt-4 grid gap-2 text-sm text-[#5a473d]">
                      {betweenTwoPagesScene.targets.map((target) => (
                        <li key={target.id} className="flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${gameSession.betweenTwoPages!.foundSpotIds.includes(target.id)
                              ? 'bg-[#6e5443]'
                              : 'bg-[#d5c0ab]'
                              }`}
                          />
                          <span>{target.label}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <p className="mt-4 text-sm leading-7 text-[#503e35]">
                    Mistakes: {gameSession.betweenTwoPages.mistakes}
                  </p>
                  {gameSession.betweenTwoPages.status === 'failed' ? (
                    <button
                      type="button"
                      onClick={handleReplayActiveGame}
                      className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#8f715c] bg-[rgba(255,248,240,0.82)] px-4 py-2 text-sm text-[#4b392f]"
                    >
                      <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                      <span>The page closed. Try again.</span>
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}

            {stage === 'game-active' && activeGame.id === 'moon-run' && gameSession?.gameId === 'moon-run' ? (
              <FriendBookMoonRunStage
                onComplete={handleMoonRunComplete}
              />
            ) : null}

            {stage === 'game-active' && activeGame.id === 'one-stroke-mark' && gameSession?.quiz && currentQuizQuestion ? (
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="rounded-[1.6rem] border border-[#c9b198] bg-[rgba(255,250,245,0.76)] p-4 lg:p-5">
                  <div className="flex min-h-[430px] items-center justify-center overflow-hidden rounded-[1.35rem] border border-[#d8c2ab] bg-[#202532] p-3 lg:min-h-[540px]">
                    <img
                      src={currentQuizQuestion.silhouetteImage}
                      alt=""
                      aria-hidden="true"
                      className="block max-h-[72vh] w-full object-contain"
                    />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#503e35]">
                    {currentQuizQuestion.prompt}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-[#dcc9b1] bg-[rgba(255,249,242,0.84)] p-4 lg:p-5">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#7a5d4d]">
                    Guess the silhouette
                  </p>
                  <div className="mt-4 grid gap-3">
                    {currentQuizQuestion.options.map((option) => {
                      const isSelected = gameSession.quiz!.selectedAnswer === option;
                      const isCorrect = currentQuizQuestion.correctAnswer === option;
                      const isLocked = gameSession.quiz!.selectedAnswer !== null;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => handleQuizAnswer(option)}
                          disabled={isLocked}
                          className={`rounded-[1.2rem] border px-4 py-3 text-left text-sm leading-6 transition ${isLocked && isCorrect
                            ? 'border-[#6f4d3d] bg-[rgba(243,236,223,0.96)] text-[#3f312b]'
                            : isLocked && isSelected
                              ? 'border-[#b9997d] bg-[rgba(255,244,234,0.9)] text-[#5b473d]'
                              : 'border-[#d8c5ae] bg-[rgba(255,250,245,0.82)] text-[#4b392f] hover:-translate-y-0.5'
                            }`}
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>

                  {gameSession.quiz.selectedAnswer ? (
                    <div className="mt-5 rounded-[1.2rem] border border-[#dcc9b1] bg-[rgba(255,250,245,0.9)] p-4">
                      <p className="font-serif text-[1.4rem] leading-none text-[#2f2320]">
                        {gameSession.quiz.answerState === 'correct' ? 'Right page.' : 'Not this one.'}
                      </p>
                      {currentQuizQuestion.referenceImage ? (
                        <div className="mt-4 overflow-hidden rounded-[1rem] border border-[#d8c2ab] bg-[rgba(255,248,242,0.92)]">
                          <img
                            src={currentQuizQuestion.referenceImage}
                            alt={currentQuizQuestion.correctAnswer}
                            className="block h-44 w-full object-contain bg-[rgba(34,38,50,0.04)]"
                          />
                        </div>
                      ) : null}
                      <p className="mt-2 text-sm leading-7 text-[#503e35]">
                        {currentQuizQuestion.resultCopy}
                      </p>
                      <button
                        type="button"
                        onClick={handleAdvanceQuizQuestion}
                        className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#7d604c] bg-[#6a4f3c] px-5 py-3 text-sm font-medium text-[#fff8f2]"
                      >
                        <span>
                          {gameSession.quiz.currentQuestionIndex >= gameSession.quiz.questions.length - 1
                            ? 'Finish this round'
                            : 'Turn to the next silhouette'}
                        </span>
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </FriendBookGameOverlay>
        ) : null}

        {stage === 'note-entry' && activeGame ? (
          <section
            id="friend-book-play-panel"
            className="rounded-[1.8rem] bg-[#60493b] p-[5px] shadow-[0_18px_34px_rgba(71,43,31,0.25)]"
          >
            <div
              className="rounded-[1.55rem] px-5 py-5 sm:px-7 sm:py-6"
              style={getPaperBackgroundStyle(
                friendBookFinalSectionData.assets.heroPanelBackground,
                'rgba(255,248,238,0.92)',
              )}
            >
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="rounded-[1.5rem] border border-[#dcc9b1] bg-[rgba(255,250,245,0.88)] p-5">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#7a5d4d]">
                    Leave an echo in the Friend Book
                  </p>
                  <h3 className="mt-2 font-serif text-[2rem] leading-[0.98] tracking-[-0.04em] text-[#2c2220]">
                    Your line for {activeGame.title}
                  </h3>
                  <p className="mt-2 max-w-[42rem] text-[0.98rem] leading-7 text-[#4c3b32]">
                    {roundSummary || 'Your medal is ready. Write one short line, then let it settle into the right-hand page.'}
                  </p>
                  <label
                    htmlFor="friend-book-note"
                    className="mt-5 block font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#7a5d4d]"
                  >
                    Tonight&apos;s note
                  </label>
                  <textarea
                    id="friend-book-note"
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    placeholder="Write one calm line for tonight..."
                    className="mt-4 h-36 w-full rounded-[1.3rem] border border-[#d9c8b3] bg-[rgba(255,251,246,0.92)] px-4 py-4 text-base leading-7 text-[#3f312b] outline-none transition focus:border-[#8a654f]"
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleNoteSubmit}
                      disabled={!noteDraft.trim()}
                      className="inline-flex items-center gap-2 rounded-full border border-[#7d604c] bg-[#6a4f3c] px-5 py-3 text-sm font-medium text-[#fff8f2] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PenLine className="h-4 w-4" strokeWidth={1.8} />
                      <span>Write into the archive</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleReplayActiveGame}
                      className="inline-flex items-center gap-2 rounded-full border border-[#8f715c] bg-[rgba(255,248,240,0.82)] px-4 py-2 text-sm text-[#4b392f]"
                    >
                      <RotateCcw className="h-4 w-4" strokeWidth={1.8} />
                      <span>Replay round</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[#dcc9b1] bg-[rgba(255,249,242,0.84)] p-5">
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#7a5d4d]">
                    Tonight&apos;s mark
                  </p>
                  <div className="mt-4 flex items-center gap-4">
                    {currentAvatar ? (
                      <img
                        src={currentAvatar.asset}
                        alt=""
                        aria-hidden="true"
                        className="h-16 w-16 rounded-full border border-[#d1b79f] object-cover"
                      />
                    ) : null}
                    {pendingMedalImage ? (
                      <img
                        src={pendingMedalImage}
                        alt=""
                        aria-hidden="true"
                        className="h-18 w-18 rounded-[1rem] border border-[#d1b79f] object-cover"
                      />
                    ) : null}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-[#503e35]">
                    {currentAvatar
                      ? `${currentAvatar.label} will sign this note, and the latest medal will settle into the ${activeGame.title} slot.`
                      : 'Your chosen avatar and medal will be saved into this game slot.'}
                  </p>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <section
          id="friend-book-preview"
          data-friend-book-archive-board="preview"
          data-friend-book-archive-background={friendBookFinalSectionData.assets.archiveBoardBackground}
          className="relative overflow-hidden rounded-[1.2rem] border border-[rgba(101,69,51,0.26)] px-5 py-5 shadow-[0_18px_36px_rgba(67,42,29,0.22)] sm:px-6 sm:py-6 lg:px-0 lg:py-0"
          style={getArchiveBoardBackgroundStyle(friendBookFinalSectionData.assets.archiveBoardBackground)}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,248,238,0.08),rgba(255,248,238,0.03)_24%,rgba(90,60,42,0.04)_100%)]"
          />
          <div data-friend-book-preview-desktop="true" className="relative hidden aspect-[3104/1376] w-full lg:block">
            <div
              data-friend-book-preview-header="left"
              className="absolute"
              style={getAbsoluteLayoutStyle(FRIEND_BOOK_ARCHIVE_DESKTOP_LAYOUT.headerLeft)}
            >
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.34em] text-[#5c4336] xl:text-[0.78rem]">
                {friendBookFinalSectionData.previewEyebrow}
              </p>
              <h3 className="mt-2 font-serif text-[clamp(1.9rem,2.65vw,2.9rem)] leading-[0.95] tracking-[-0.05em] text-[#332625]">
                {friendBookFinalSectionData.previewTitle}
              </h3>
              {friendBookFinalSectionData.previewDescription ? (
                <p className="mt-3 max-w-[31rem] text-[0.9rem] leading-7 text-[#55433b] xl:text-[0.98rem]">
                  {friendBookFinalSectionData.previewDescription}
                </p>
              ) : null}
            </div>

            <div
              data-friend-book-preview-header="right"
              className="absolute"
              style={getAbsoluteLayoutStyle(FRIEND_BOOK_ARCHIVE_DESKTOP_LAYOUT.headerRight)}
            >
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.34em] text-[#7a5d4d] xl:text-[0.76rem]">
                Your echoes
              </p>
              <p className="mt-2 max-w-[34rem] text-[0.98rem] leading-7 text-[#5c4940] xl:text-[1.02rem]">
                Each game keeps one slot on the right. Replaying it rewrites only that page.
              </p>
            </div>

            <div
              data-friend-book-preview-sample-stack="true"
              className="absolute inset-0"
              style={{
                transform: `translate(${FRIEND_BOOK_ARCHIVE_SAMPLE_STACK_NUDGE.x}px, ${FRIEND_BOOK_ARCHIVE_SAMPLE_STACK_NUDGE.y}px)`,
              }}
            >
              {friendBookFinalSectionData.entries.map((entry) => {
                const rowOffset = combineOffsets(
                  FRIEND_BOOK_ARCHIVE_SAMPLE_ROW_POSITIONING.shared,
                  FRIEND_BOOK_ARCHIVE_SAMPLE_ROW_POSITIONING.perEntry[
                  entry.id as FriendBookArchiveSampleEntryId
                  ],
                );
                const entryPositioning = FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.perEntry[
                  entry.id as FriendBookArchiveSampleEntryId
                ];
                const avatarOffset = combineOffsets(
                  FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.avatar,
                  entryPositioning.avatar,
                );
                const titleOffset = combineOffsets(
                  FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.title,
                  entryPositioning.title,
                );
                const sealOffset = combineOffsets(
                  FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.seal,
                  entryPositioning.seal,
                );
                const excerptOffset = combineOffsets(
                  FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.excerpt,
                  entryPositioning.excerpt,
                );
                const medalOffset = combineOffsetWithScale(
                  FRIEND_BOOK_ARCHIVE_SAMPLE_ENTRY_POSITIONING.shared.medal,
                  entryPositioning.medal,
                );

                return (
                  <article
                    key={entry.id}
                    data-friend-book-sample-entry-desktop={entry.id}
                    data-friend-book-sample-entry-row-desktop={entry.id}
                    className="absolute"
                    style={{
                      ...getAbsoluteLayoutStyle(FRIEND_BOOK_ARCHIVE_DESKTOP_LAYOUT.sampleEntries[entry.id]),
                      ...getOffsetStyle(rowOffset),
                    }}
                  >
                    <div
                      className={`grid h-full ${FRIEND_BOOK_SAMPLE_ENTRY_GRID.outer.base} gap-3 px-4 py-3 ${FRIEND_BOOK_SAMPLE_ENTRY_GRID.outer.xl} xl:px-5 xl:py-4`}
                    >
                      <img
                        src={entry.avatarImage}
                        alt=""
                        aria-hidden="true"
                        data-friend-book-sample-entry-avatar-desktop={entry.id}
                        style={getOffsetStyle(avatarOffset)}
                        className="mt-1 h-15 w-15 rounded-full object-cover xl:h-[4.6rem] xl:w-[4.6rem]"
                      />
                      <div
                        data-friend-book-sample-entry-copy-desktop={entry.id}
                        className={FRIEND_BOOK_SAMPLE_ENTRY_GRID.copy}
                      >
                        <div
                          data-friend-book-sample-entry-header-desktop={entry.id}
                          className={FRIEND_BOOK_SAMPLE_ENTRY_GRID.header}
                        >
                          <h4
                            data-friend-book-sample-entry-title={entry.id}
                            style={getOffsetStyle(titleOffset)}
                            className="shrink-0 min-w-0 font-serif text-[1.62rem] leading-none tracking-[-0.04em] text-[#2d2221] xl:text-[2rem]"
                          >
                            {entry.nickname}
                          </h4>
                          <span
                            data-friend-book-sample-entry-seal-desktop={entry.id}
                            className={FRIEND_BOOK_SAMPLE_ENTRY_GRID.seal}
                            style={{
                              ...getOffsetStyle(sealOffset),
                              backgroundColor: entry.seal.backgroundColor,
                              borderColor: entry.seal.borderColor,
                              color: entry.seal.textColor,
                            }}
                          >
                            {entry.seal.label}
                          </span>
                        </div>
                        <p
                          data-friend-book-sample-entry-excerpt={entry.id}
                          style={getOffsetStyle(excerptOffset)}
                          className={FRIEND_BOOK_SAMPLE_ENTRY_GRID.excerpt}
                        >
                          {entry.excerpt}
                        </p>
                      </div>
                      <div className="flex h-full items-center justify-end pb-1 pt-1">
                        <img
                          src={entry.medalImage}
                          alt=""
                          aria-hidden="true"
                          data-friend-book-sample-entry-medal-desktop={entry.id}
                          style={getOffsetScaleStyle(medalOffset, medalOffset.scale)}
                          className={`${FRIEND_BOOK_SAMPLE_ENTRY_GRID.medalSize.base} rounded-[1rem] object-cover ${FRIEND_BOOK_SAMPLE_ENTRY_GRID.medalSize.xl}`}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            {friendBookFinalSectionData.userSlots.map((slot) => {
              const slotProgress = progress.games[slot.gameId];
              const slotAvatar = slotProgress.latestAvatarId
                ? avatarById[slotProgress.latestAvatarId]
                : null;
              const slotPositioning = FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.perSlot[slot.gameId];
              const containerOffset = combineOffsets(
                FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.container,
                slotPositioning.container,
              );
              const copyOffset = combineOffsets(
                FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.copy,
                slotPositioning.copy,
              );
              const labelOffset = combineOffsets(
                FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.label,
                slotPositioning.label,
              );
              const noteOffset = combineOffsets(
                FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.note,
                slotPositioning.note,
              );
              const metaOffset = combineOffsets(
                FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.meta,
                slotPositioning.meta,
              );
              const avatarOffset = combineOffsetWithScale(
                FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.avatar,
                slotPositioning.avatar,
              );
              const medalOffset = combineOffsetWithScale(
                FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.medal,
                slotPositioning.medal,
              );
              const dateOffset = combineOffsets(
                FRIEND_BOOK_ARCHIVE_USER_SLOT_POSITIONING.shared.date,
                slotPositioning.date,
              );

              return (
                <article
                  key={slot.gameId}
                  data-friend-book-user-record-desktop={slot.gameId}
                  className="absolute"
                  style={getAbsoluteLayoutStyle(FRIEND_BOOK_ARCHIVE_DESKTOP_LAYOUT.userSlots[slot.gameId])}
                >
                  <div
                    data-friend-book-user-record-container-desktop={slot.gameId}
                    className="flex h-full justify-between gap-4 px-5 py-4 xl:px-6 xl:py-5"
                    style={getOffsetStyle(containerOffset)}
                  >
                    <div
                      data-friend-book-user-record-copy-desktop={slot.gameId}
                      className="min-w-0"
                      style={getOffsetStyle(copyOffset)}
                    >
                      {slotProgress.latestNote ? (
                        <>
                          <p
                            data-friend-book-user-record-label-desktop={slot.gameId}
                            style={getOffsetStyle(labelOffset)}
                            className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#7a5d4d] xl:text-[0.68rem]"
                          >
                            {slot.label}
                          </p>
                          <p
                            data-friend-book-user-record-note-desktop={slot.gameId}
                            style={getOffsetStyle(noteOffset)}
                            className="mt-3 text-[0.92rem] leading-6 text-[#3f312b] xl:text-[1rem]"
                          >
                            {slotProgress.latestNote}
                          </p>
                          <p
                            data-friend-book-user-record-meta-desktop={slot.gameId}
                            style={getOffsetStyle(metaOffset)}
                            className="mt-2 text-[0.78rem] leading-5 text-[#6b5650]"
                          >
                            {slotProgress.completionCount} completion{slotProgress.completionCount > 1 ? 's' : ''} saved in this slot.
                          </p>
                        </>
                      ) : null}
                    </div>

                    <div className="flex h-full min-w-[82px] flex-col items-end justify-between pt-1">
                      {slotAvatar ? (
                        <img
                          src={slotAvatar.asset}
                          alt=""
                          aria-hidden="true"
                          data-friend-book-user-record-avatar-desktop={slot.gameId}
                          style={getOffsetScaleStyle(avatarOffset, avatarOffset.scale)}
                          className="h-14 w-14 rounded-full border border-[#d4bea8] object-cover"
                        />
                      ) : null}
                      {slotProgress.latestMedalId ? (
                        <img
                          src={slotProgress.latestMedalId}
                          alt=""
                          aria-hidden="true"
                          data-friend-book-user-record-medal-desktop={slot.gameId}
                          style={getOffsetScaleStyle(medalOffset, medalOffset.scale)}
                          className="h-14 w-14 rounded-[0.9rem] border border-[#d4bea8] object-cover"
                        />
                      ) : null}
                      <p
                        data-friend-book-user-record-date-desktop={slot.gameId}
                        style={getOffsetStyle(dateOffset)}
                        className="font-mono text-[0.64rem] uppercase tracking-[0.18em] text-[#6d5546] xl:text-[0.72rem]"
                      >
                        {slotProgress.latestDate ?? slot.previewDate}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="relative grid gap-5 lg:hidden">
            <div>
              <p className="font-mono text-[0.72rem] uppercase tracking-[0.32em] text-[#5c4336]">
                {friendBookFinalSectionData.previewEyebrow}
              </p>
              <h3 className="mt-2 font-serif text-[2.15rem] leading-none tracking-[-0.04em] text-[#332625]">
                {friendBookFinalSectionData.previewTitle}
              </h3>
              {friendBookFinalSectionData.previewDescription ? (
                <p className="mt-3 max-w-[36rem] text-[0.98rem] leading-7 text-[#55433b]">
                  {friendBookFinalSectionData.previewDescription}
                </p>
              ) : null}

              <div className="mt-5 grid gap-3">
                {friendBookFinalSectionData.entries.map((entry) => (
                  <article
                    key={entry.id}
                    data-friend-book-sample-entry={entry.id}
                    className="grid gap-4 rounded-[1.4rem] bg-[rgba(255,251,246,0.72)] px-4 py-4 shadow-[0_10px_18px_rgba(84,56,36,0.06)] backdrop-blur-[1px] sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                  >
                    <img
                      src={entry.avatarImage}
                      alt=""
                      aria-hidden="true"
                      className="h-16 w-16 rounded-full object-cover"
                    />
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-serif text-[1.75rem] leading-none tracking-[-0.03em] text-[#2d2221]">
                          {entry.nickname}
                        </h4>
                        <span
                          className="rounded-full border px-3 py-1 text-[0.7rem] uppercase tracking-[0.16em]"
                          style={{
                            backgroundColor: entry.seal.backgroundColor,
                            borderColor: entry.seal.borderColor,
                            color: entry.seal.textColor,
                          }}
                        >
                          {entry.seal.label}
                        </span>
                      </div>
                      <p className="mt-2 text-[0.98rem] leading-7 text-[#463731]">
                        {entry.excerpt}
                      </p>
                      <p className="text-sm leading-7 text-[#6b5650]">{entry.note}</p>
                    </div>
                    <div className="flex flex-col items-start gap-3 sm:items-end">
                      <img
                        src={entry.medalImage}
                        alt=""
                        aria-hidden="true"
                        className="h-16 w-16 rounded-[1rem] object-cover"
                      />
                      <p className="font-mono text-[0.72rem] uppercase tracking-[0.2em] text-[#6d5546]">
                        {entry.date}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#7a5d4d]">
                    Your echoes
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#5c4940]">
                    Each game keeps one slot on the right. Replaying it rewrites only that page.
                  </p>
                </div>
                {currentAvatar ? (
                  <div className="rounded-full border border-[#d6bfaa] bg-[rgba(255,250,244,0.7)] px-3 py-2 backdrop-blur-[1px]">
                    <div className="flex items-center gap-2">
                      <img
                        src={currentAvatar.asset}
                        alt=""
                        aria-hidden="true"
                        className="h-10 w-10 rounded-full border border-[#d4bea8] object-cover"
                      />
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#7a5d4d]">
                          Signing as
                        </p>
                        <p className="font-serif text-lg text-[#332625]">
                          {currentAvatar.label}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              {friendBookFinalSectionData.userSlots.map((slot) => {
                const slotProgress = progress.games[slot.gameId];
                const slotAvatar = slotProgress.latestAvatarId
                  ? avatarById[slotProgress.latestAvatarId]
                  : null;

                return (
                  <article
                    key={slot.gameId}
                    data-friend-book-user-record={slot.gameId}
                    className="rounded-[1.35rem] bg-[rgba(255,251,246,0.6)] px-4 py-4 shadow-[0_10px_18px_rgba(84,56,36,0.06)] backdrop-blur-[1px]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {slotProgress.latestNote ? (
                          <>
                            <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-[#7a5d4d]">
                              {slot.label}
                            </p>
                            <p className="mt-2 text-[0.98rem] leading-7 text-[#3f312b]">
                              {slotProgress.latestNote}
                            </p>
                            <p className="text-sm leading-7 text-[#6b5650]">
                              {slotProgress.completionCount} completion{slotProgress.completionCount > 1 ? 's' : ''} saved in this slot.
                            </p>
                          </>
                        ) : null}
                      </div>

                      <div className="flex flex-col items-end gap-3">
                        {slotAvatar ? (
                          <img
                            src={slotAvatar.asset}
                            alt=""
                            aria-hidden="true"
                            className="h-14 w-14 rounded-full border border-[#d4bea8] object-cover"
                          />
                        ) : null}
                        {slotProgress.latestMedalId ? (
                          <img
                            src={slotProgress.latestMedalId}
                            alt=""
                            aria-hidden="true"
                            className="h-14 w-14 rounded-[0.9rem] border border-[#d4bea8] object-cover"
                          />
                        ) : null}
                        <p className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-[#6d5546]">
                          {slotProgress.latestDate ?? slot.previewDate}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <p className="pb-2 text-center font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#715446]">
          {friendBookFinalSectionData.footerLine}
        </p>
      </div>
    </section>
  );
}
