import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent } from 'react';
import {
  CheckCircle2,
  RotateCcw,
  Sparkles,
  PenLine,
} from 'lucide-react';

import { friendBookFinalSectionData } from '../data';
import {
  deleteFriendBookGuestbookEntry,
  type FriendBookAvatarId,
  type FriendBookGuestbookEntry,
  type FriendBookGameId,
  type FriendBookGameSessionState,
  type FriendBookProgress,
  type FriendBookStage,
  FRIEND_BOOK_GUESTBOOK_PAGE_SIZE,
  FRIEND_BOOK_PENDING_GUESTBOOK_DRAFT_KEY,
  answerFriendBookQuizQuestion,
  advanceFriendBookQuizQuestion,
  completeBetweenTwoPagesRound,
  completeFriendBookGameSession,
  createDefaultFriendBookProgress,
  createFriendBookGameSession,
  formatFriendBookArchiveDate,
  getAvailableFriendBookAvatarIds,
  getFriendBookGuestbookPage,
  getFriendBookGameStartStage,
  getFriendBookMedalIdForGame,
  getNextBetweenTwoPagesSceneRotation,
  hydrateFriendBookPendingGuestbookDraft,
  hydrateFriendBookProgress,
  hydrateFriendBookRemoteGuestbookCache,
  persistFriendBookProgress,
  persistFriendBookPendingGuestbookDraft,
  persistFriendBookRemoteGuestbookCache,
  resolveBetweenTwoPagesSpotSelection,
  selectFriendBookAvatar,
  upsertFriendBookGuestbookEntry,
} from './FriendBookFinalSection.logic';
import { mergeFriendBookRemoteEntries } from './FriendBookFinalSection.remote';
import {
  createDefaultFriendBookApiRepository,
  type FriendBookRemoteRepository,
} from './FriendBookFinalSection.api';
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

type FriendBookBetweenTwoPagesTargetFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

/**
 * Between Two Pages 命中区定位参数。
 *
 * 这里控制的是：
 * - 调试可视框的位置
 * - 实际可点击 hotspot 的位置
 * - 找到之后固定标记的落点区域
 *
 * 单位都是相对图片容器的百分比，直接手改即可。
 * 如果某个 scene / target 没配到，会自动回退到 `src/data.tsx` 里的默认值。
 */
export const FRIEND_BOOK_BETWEEN_TWO_PAGES_TARGET_POSITIONING = {
  'moon-cottage': {
    'moon-stamp': { x: 17, y: 15, width: 15.75, height: 25.37 },
    'cat-tail': { x: 69.76, y: 67.62, width: 17, height: 15 },
    'page-fold': { x: 78.71, y: 8.34, width: 14.66, height: 18.59 },
  },
  'moon-bridge': {
    'bridge-lantern': { x: 38.52, y: 42.02, width: 10.05, height: 33.76 },
    'tea-cup': { x: 56.93, y: 70.09, width: 9.61, height: 17.04 },
    'bamboo-cluster': { x: 57.57, y: 26.76, width: 13.76, height: 21.55 },
  },
  'moon-shrine': {
    'torii-plaque': { x: 22.93, y: 34.09, width: 8.82, height: 11.67 },
    'blossom-branch': { x: 56, y: 28.67, width: 12.24, height: 16.89 },
    'cushion-tassel': { x: 80.8, y: 55.17, width: 9.05, height: 21.54 },
  },
  'dusk-field-road': {
    'sign-charm': { x: 20.51, y: 48.58, width: 7.2, height: 12.1 },
    'notebook-corner': { x: 65.09, y: 62.97, width: 9.6, height: 10.6 },
    'schoolbag-badge': { x: 79.19, y: 49.09, width: 6.63, height: 14.19 },
  },
} as const satisfies Record<string, Record<string, FriendBookBetweenTwoPagesTargetFrame>>;

export function getBetweenTwoPagesTargetFrame(
  sceneId: string,
  target: {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
  },
): FriendBookBetweenTwoPagesTargetFrame {
  return FRIEND_BOOK_BETWEEN_TWO_PAGES_TARGET_POSITIONING[sceneId]?.[target.id] ?? {
    x: target.x,
    y: target.y,
    width: target.width,
    height: target.height,
  };
}

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
      avatar: { x: 0, y: 12 },
      title: { x: 0, y: 17 },
      seal: { x: 0, y: 19 },
      excerpt: { x: 0, y: 20 },
      medal: { x: -1, y: 10, scale: 1.12 },
    },
    'book-sea-diver': {
      avatar: { x: 0, y: 5 },
      title: { x: -3, y: 10 },
      seal: { x: 0, y: 13 },
      excerpt: { x: 0, y: 13 },
      medal: { x: 0, y: 5, scale: 1 },
    },
    'night-watcher': {
      avatar: { x: 0, y: 2 },
      title: { x: 0, y: 5 },
      seal: { x: 0, y: 7 },
      excerpt: { x: 0, y: 7 },
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

const FRIEND_BOOK_GUESTBOOK_LEFT_ROW_ORDER = [
  'spring-wind',
  'book-sea-diver',
  'night-watcher',
] as const;

const FRIEND_BOOK_GUESTBOOK_RIGHT_ROW_ORDER: FriendBookGameId[] = [
  'between-two-pages',
  'moon-run',
  'one-stroke-mark',
];

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

function getGuestbookGameTag(gameId: FriendBookGameId | null): {
  label: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
} | null {
  switch (gameId) {
    case 'between-two-pages':
      return {
        label: 'Two Pages',
        backgroundColor: 'rgba(238,205,206,0.72)',
        borderColor: '#d7a7a6',
        textColor: '#7a5450',
      };
    case 'moon-run':
      return {
        label: 'Moon Run',
        backgroundColor: 'rgba(214,225,194,0.84)',
        borderColor: '#b4c69a',
        textColor: '#66724a',
      };
    case 'one-stroke-mark':
      return {
        label: "Who's This",
        backgroundColor: 'rgba(221,210,225,0.78)',
        borderColor: '#c0b0c7',
        textColor: '#6b5e74',
      };
    default:
      return null;
  }
}

export function getBetweenTwoPagesTargetButtonClassName(isFound: boolean): string {
  return [
    'absolute z-20 rounded-[0.95rem] border transition',
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

interface FriendBookFinalSectionProps {
  initialProgress?: FriendBookProgress;
  initialStage?: FriendBookStage;
  initialActiveGameId?: FriendBookGameId | null;
  initialGameSession?: FriendBookGameSessionState | null;
  initialGuestbookPage?: number;
  initialNicknameDraft?: string;
  initialIdentityIntroDraft?: string;
  initialPortfolioReviewDraft?: string;
  remoteRepository?: FriendBookRemoteRepository | null;
}

function createInitialFriendBookGameSession(
  initialStage: FriendBookStage,
  initialActiveGameId: FriendBookGameId | null,
): FriendBookGameSessionState | null {
  if (initialStage !== 'game-active' || !initialActiveGameId) {
    return null;
  }

  if (initialActiveGameId === 'between-two-pages') {
    return createFriendBookGameSession(
      initialActiveGameId,
      friendBookFinalSectionData.quizQuestionBank,
      Math.random,
      {
        betweenTwoPagesSceneId:
          friendBookFinalSectionData.betweenTwoPagesScenes[0]?.id,
      },
    );
  }

  return createFriendBookGameSession(
    initialActiveGameId,
    friendBookFinalSectionData.quizQuestionBank,
  );
}

export default function FriendBookFinalSection({
  initialProgress,
  initialStage = 'landing',
  initialActiveGameId = null,
  initialGameSession,
  initialGuestbookPage = 0,
  initialNicknameDraft = '',
  initialIdentityIntroDraft = '',
  initialPortfolioReviewDraft = '',
  remoteRepository,
}: FriendBookFinalSectionProps = {}) {
  const [resolvedRemoteRepository] = useState(
    () => remoteRepository ?? createDefaultFriendBookApiRepository(),
  );
  const [progress, setProgress] = useState(() => initialProgress ?? createDefaultFriendBookProgress());
  const [stage, setStage] = useState<FriendBookStage>(initialStage);
  const [activeGameId, setActiveGameId] = useState<FriendBookGameId | null>(initialActiveGameId);
  const [selectedAvatarCandidate, setSelectedAvatarCandidate] = useState<FriendBookAvatarId | null>(null);
  const [pendingMedalId, setPendingMedalId] = useState<string | null>(null);
  const [nicknameDraft, setNicknameDraft] = useState(initialNicknameDraft);
  const [identityIntroDraft, setIdentityIntroDraft] = useState(initialIdentityIntroDraft);
  const [portfolioReviewDraft, setPortfolioReviewDraft] = useState(initialPortfolioReviewDraft);
  const [gameSession, setGameSession] = useState<FriendBookGameSessionState | null>(
    () =>
      initialGameSession ??
      createInitialFriendBookGameSession(initialStage, initialActiveGameId),
  );
  const [roundSummary, setRoundSummary] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [remoteStatus, setRemoteStatus] = useState<'idle' | 'loading' | 'ready' | 'error' | 'saving'>('idle');
  const [remoteErrorMessage, setRemoteErrorMessage] = useState('');
  const [showBetweenTwoPagesHints, setShowBetweenTwoPagesHints] = useState(false);
  const [seenBetweenTwoPagesSceneIds, setSeenBetweenTwoPagesSceneIds] = useState<string[]>([]);
  const [currentGuestbookPage, setCurrentGuestbookPage] = useState(initialGuestbookPage);

  const avatarById = Object.fromEntries(
    friendBookFinalSectionData.avatars.map((avatar) => [avatar.id, avatar]),
  ) as Record<FriendBookAvatarId, (typeof friendBookFinalSectionData.avatars)[number]>;
  const activeGame = activeGameId
    ? friendBookFinalSectionData.gameCards.find((game) => game.id === activeGameId) ?? null
    : null;
  const latestGuestbookEntry = progress.guestbookEntries[progress.guestbookEntries.length - 1] ?? null;
  const matchingGuestbookEntry =
    progress.guestbookEntries.find((entry) => entry.nickname === nicknameDraft.trim()) ?? null;
  const canDeleteGuestbookEntry = Boolean(matchingGuestbookEntry && !resolvedRemoteRepository?.isEnabled);
  const guestbookPage = getFriendBookGuestbookPage(progress.guestbookEntries, currentGuestbookPage);
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

    const localProgress = hydrateFriendBookProgress(window.localStorage);
    const cachedRemoteEntries = hydrateFriendBookRemoteGuestbookCache(window.localStorage);
    setProgress(
      cachedRemoteEntries.length > 0
        ? mergeFriendBookRemoteEntries(localProgress, cachedRemoteEntries)
        : localProgress,
    );

    const pendingDraft = hydrateFriendBookPendingGuestbookDraft(window.localStorage);
    if (pendingDraft) {
      setNicknameDraft(pendingDraft.nickname);
      setIdentityIntroDraft(pendingDraft.identityIntro);
      setPortfolioReviewDraft(pendingDraft.portfolioReview);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated || !resolvedRemoteRepository?.isEnabled || typeof window === 'undefined') {
      return;
    }

    let isActive = true;
    setRemoteStatus('loading');
    setRemoteErrorMessage('');

    resolvedRemoteRepository.fetchEntries()
      .then((entries) => {
        if (!isActive) {
          return;
        }

        if (entries.length > 0) {
          setProgress((currentProgress) => mergeFriendBookRemoteEntries(currentProgress, entries));
          persistFriendBookRemoteGuestbookCache(entries, window.localStorage);
        }

        setRemoteStatus('ready');
      })
      .catch((error: unknown) => {
        if (!isActive) {
          return;
        }

        setRemoteStatus('error');
        setRemoteErrorMessage(error instanceof Error ? error.message : 'Guestbook sync failed.');
      });

    return () => {
      isActive = false;
    };
  }, [isHydrated, resolvedRemoteRepository]);

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
    setCurrentGuestbookPage((page) =>
      getFriendBookGuestbookPage(progress.guestbookEntries, page).pageIndex,
    );
  }, [progress.guestbookEntries]);

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

  function populateGuestbookDrafts(entry: FriendBookGuestbookEntry | null) {
    setNicknameDraft(entry?.nickname ?? '');
    setIdentityIntroDraft(entry?.identityIntro ?? '');
    setPortfolioReviewDraft(entry?.portfolioReview ?? '');
  }

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
    populateGuestbookDrafts(latestGuestbookEntry);
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

  function handleBetweenTwoPagesHotspotClick(
    event: MouseEvent<HTMLButtonElement>,
    spotId: string,
  ) {
    event.stopPropagation();
    handleDifferenceSpotSelect(spotId);
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

  async function handleNoteSubmit() {
    if (
      !activeGameId ||
      !pendingMedalId ||
      !nicknameDraft.trim() ||
      !identityIntroDraft.trim() ||
      !portfolioReviewDraft.trim()
    ) {
      return;
    }

    const displayDate = formatFriendBookArchiveDate(new Date());
    let nextGuestbookPageIndex = 0;
    const noteDraft = {
      nickname: nicknameDraft,
      identityIntro: identityIntroDraft,
      portfolioReview: portfolioReviewDraft,
      latestGameId: activeGameId,
      avatarId: progress.selectedAvatarId,
      medalId: pendingMedalId,
      displayDate,
    };

    if (resolvedRemoteRepository?.isEnabled && typeof window !== 'undefined') {
      try {
        setRemoteStatus('saving');
        setRemoteErrorMessage('');
        const remoteEntry = await resolvedRemoteRepository.createEntry(noteDraft);

        setProgress((currentProgress) => {
          const completedProgress = completeFriendBookGameSession(currentProgress, {
            gameId: activeGameId,
            displayDate,
            medalId: pendingMedalId,
          });
          const nextProgress = mergeFriendBookRemoteEntries(completedProgress, [
            ...completedProgress.guestbookEntries.filter(
              (entry) => !entry.id.startsWith('seed-') && entry.id !== remoteEntry.id,
            ),
            remoteEntry,
          ]);

          nextGuestbookPageIndex = getFriendBookGuestbookPage(
            nextProgress.guestbookEntries,
            Number.MAX_SAFE_INTEGER,
          ).pageIndex;
          persistFriendBookRemoteGuestbookCache(nextProgress.guestbookEntries, window.localStorage);

          return nextProgress;
        });
        window.localStorage.removeItem(FRIEND_BOOK_PENDING_GUESTBOOK_DRAFT_KEY);
        setRemoteStatus('ready');
      } catch (error) {
        persistFriendBookPendingGuestbookDraft(noteDraft, window.localStorage);
        setRemoteStatus('error');
        setRemoteErrorMessage(error instanceof Error ? error.message : 'Guestbook publish failed.');
        return;
      }
    } else {
      setProgress((currentProgress) => {
        const nextProgress = completeFriendBookGameSession(currentProgress, {
          gameId: activeGameId,
          displayDate,
          medalId: pendingMedalId,
        });
        const nextProgressWithGuestbook = upsertFriendBookGuestbookEntry(nextProgress, {
          nickname: nicknameDraft,
          identityIntro: identityIntroDraft,
          portfolioReview: portfolioReviewDraft,
          latestGameId: activeGameId,
          avatarId: nextProgress.selectedAvatarId,
          medalId: pendingMedalId,
          displayDate,
        });

        nextGuestbookPageIndex = getFriendBookGuestbookPage(
          nextProgressWithGuestbook.guestbookEntries,
          Number.MAX_SAFE_INTEGER,
        ).pageIndex;

        return nextProgressWithGuestbook;
      });
    }

    setCurrentGuestbookPage(nextGuestbookPageIndex);
    setStage('landing');
    setPendingMedalId(null);
    setActiveGameId(null);
    setGameSession(null);
    setRoundSummary('');
    scrollToTarget('friend-book-preview');
  }

  function handleDeleteRecord() {
    const targetNickname = nicknameDraft.trim();

    if (!targetNickname || !matchingGuestbookEntry) {
      return;
    }

    const shouldDelete =
      typeof window === 'undefined'
        ? true
        : window.confirm(`Delete guestbook record for ${targetNickname}?`);

    if (!shouldDelete) {
      return;
    }

    let nextGuestbookPageIndex = 0;
    setProgress((currentProgress) => {
      const nextProgress = deleteFriendBookGuestbookEntry(currentProgress, targetNickname);
      nextGuestbookPageIndex = getFriendBookGuestbookPage(
        nextProgress.guestbookEntries,
        Math.min(currentGuestbookPage, Number.MAX_SAFE_INTEGER),
      ).pageIndex;
      return nextProgress;
    });
    setCurrentGuestbookPage(nextGuestbookPageIndex);
    setNicknameDraft('');
    setIdentityIntroDraft('');
    setPortfolioReviewDraft('');
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
                      data-friend-book-difference-page={page.id}
                      className="group relative overflow-hidden rounded-[1.35rem] border border-[#c9b198] bg-[rgba(255,249,242,0.76)] text-left shadow-[0_10px_24px_rgba(70,43,29,0.08)]"
                      style={{ aspectRatio: `${betweenTwoPagesScene.aspectRatio}` }}
                    >
                      <div
                        data-friend-book-difference-miss-zone={page.id}
                        onClick={handleDifferenceMiss}
                        className="absolute inset-0 z-10"
                      />
                      <img
                        src={page.image}
                        alt={page.label}
                        className="pointer-events-none block h-full w-full object-contain"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,247,237,0.08),rgba(255,247,237,0.03)_36%,rgba(54,38,29,0.08)_100%)]" />
                      <span className="pointer-events-none absolute left-4 top-4 rounded-full border border-[rgba(122,93,77,0.22)] bg-[rgba(255,248,241,0.9)] px-3 py-1 text-[0.68rem] uppercase tracking-[0.24em] text-[#6f5243]">
                        {page.label}
                      </span>

                      {betweenTwoPagesScene.targets.map((target) => {
                        const frame = getBetweenTwoPagesTargetFrame(
                          betweenTwoPagesScene.id,
                          target,
                        );
                        const isFound = gameSession.betweenTwoPages!.foundSpotIds.includes(target.id);

                        return isFound ? (
                          <span
                            key={`${page.id}-${target.id}`}
                            data-friend-book-difference-marker={`${page.id}-${target.id}`}
                            aria-hidden="true"
                            className="pointer-events-none absolute z-30"
                            style={{
                              left: `${frame.x}%`,
                              top: `${frame.y}%`,
                              width: `${frame.width}%`,
                              height: `${frame.height}%`,
                            }}
                          >
                            <span className="absolute inset-0 flex items-center justify-center rounded-[0.95rem] border border-[#c9b198] bg-[rgba(255,248,242,0.06)]">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-[#7d604c] bg-[rgba(255,248,242,0.92)] text-[#5d4032] shadow-[0_8px_12px_rgba(69,43,29,0.12)]">
                                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} />
                              </span>
                            </span>
                          </span>
                        ) : (
                          <button
                            key={`${page.id}-${target.id}`}
                            type="button"
                            aria-label={target.label}
                            data-friend-book-difference-hotspot={`${page.id}-${target.id}`}
                            onClick={(event) =>
                              handleBetweenTwoPagesHotspotClick(event, target.id)
                            }
                            className={getBetweenTwoPagesTargetButtonClassName(false)}
                            style={{
                              left: `${frame.x}%`,
                              top: `${frame.y}%`,
                              width: `${frame.width}%`,
                              height: `${frame.height}%`,
                            }}
                          />
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
                    Leave a page in the guestbook
                  </p>
                  <h3 className="mt-2 font-serif text-[2rem] leading-[0.98] tracking-[-0.04em] text-[#2c2220]">
                    Sign after {activeGame.title}
                  </h3>
                  <p className="mt-2 max-w-[42rem] text-[0.98rem] leading-7 text-[#4c3b32]">
                    {roundSummary || 'This round unlocks one guestbook update. Write who you are, then leave one view of the whole portfolio.'}
                  </p>
                  <label
                    htmlFor="friend-book-nickname"
                    className="mt-5 block font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#7a5d4d]"
                  >
                    Nickname
                  </label>
                  <input
                    id="friend-book-nickname"
                    value={nicknameDraft}
                    onChange={(event) => setNicknameDraft(event.target.value)}
                    placeholder="How should this page address you?"
                    className="mt-4 h-12 w-full rounded-[1rem] border border-[#d9c8b3] bg-[rgba(255,251,246,0.92)] px-4 text-base text-[#3f312b] outline-none transition focus:border-[#8a654f]"
                  />
                  <label
                    htmlFor="friend-book-identity-intro"
                    className="mt-5 block font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#7a5d4d]"
                  >
                    How should this book remember you
                  </label>
                  <textarea
                    id="friend-book-identity-intro"
                    value={identityIntroDraft}
                    onChange={(event) => setIdentityIntroDraft(event.target.value)}
                    placeholder="A short self-introduction for the left page..."
                    className="mt-4 h-28 w-full rounded-[1.3rem] border border-[#d9c8b3] bg-[rgba(255,251,246,0.92)] px-4 py-4 text-base leading-7 text-[#3f312b] outline-none transition focus:border-[#8a654f]"
                  />
                  <label
                    htmlFor="friend-book-portfolio-review"
                    className="mt-5 block font-mono text-[0.68rem] uppercase tracking-[0.28em] text-[#7a5d4d]"
                  >
                    What do you think of the portfolio as a whole
                  </label>
                  <textarea
                    id="friend-book-portfolio-review"
                    value={portfolioReviewDraft}
                    onChange={(event) => setPortfolioReviewDraft(event.target.value)}
                    placeholder="One thoughtful line for the right page..."
                    className="mt-4 h-36 w-full rounded-[1.3rem] border border-[#d9c8b3] bg-[rgba(255,251,246,0.92)] px-4 py-4 text-base leading-7 text-[#3f312b] outline-none transition focus:border-[#8a654f]"
                  />
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleNoteSubmit}
                      disabled={
                        remoteStatus === 'saving' ||
                        !nicknameDraft.trim() ||
                        !identityIntroDraft.trim() ||
                        !portfolioReviewDraft.trim()
                      }
                      className="inline-flex items-center gap-2 rounded-full border border-[#7d604c] bg-[#6a4f3c] px-5 py-3 text-sm font-medium text-[#fff8f2] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <PenLine className="h-4 w-4" strokeWidth={1.8} />
                      <span>Write into the guestbook</span>
                    </button>
                    {resolvedRemoteRepository?.isEnabled ? (
                      <p className="text-sm leading-6 text-[#7a5d4d]" role="status">
                        {remoteStatus === 'loading'
                          ? 'Syncing public guestbook...'
                          : remoteStatus === 'saving'
                            ? 'Publishing to the public guestbook...'
                            : remoteStatus === 'error'
                              ? `Guestbook sync failed. ${remoteErrorMessage}`
                              : 'This note will be saved to the public guestbook.'}
                      </p>
                    ) : null}
                    {canDeleteGuestbookEntry && matchingGuestbookEntry ? (
                      <>
                        <button
                          type="button"
                          onClick={handleDeleteRecord}
                          className="inline-flex items-center gap-2 rounded-full border border-[#b17972] bg-[rgba(255,242,238,0.92)] px-4 py-2 text-sm text-[#7a3f3c]"
                        >
                          <span>Delete This Record</span>
                        </button>
                        <p className="text-sm leading-6 text-[#7a5d4d]">
                          {`This will remove ${matchingGuestbookEntry.nickname} from the guestbook only.`}
                        </p>
                      </>
                    ) : null}
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
                      ? `${currentAvatar.label} and the latest medal will travel with this guestbook row when you save it.`
                      : 'Your chosen avatar and medal will be saved into this guestbook row.'}
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
                Visitor guestbook
              </p>
              <p className="mt-2 max-w-[34rem] text-[0.98rem] leading-7 text-[#5c4940] xl:text-[1.02rem]">
                Each visitor owns one line across the spread. Every page keeps {FRIEND_BOOK_GUESTBOOK_PAGE_SIZE} records, with the newest note settling onto the latest row.
              </p>
            </div>

            {guestbookPage.entries.flatMap((entry, index) => {
              const leftRowKey = FRIEND_BOOK_GUESTBOOK_LEFT_ROW_ORDER[index]!;
              const rightRowKey = FRIEND_BOOK_GUESTBOOK_RIGHT_ROW_ORDER[index]!;
              const avatar = entry?.avatarId ? avatarById[entry.avatarId] : null;
              const gameTag = getGuestbookGameTag(entry?.latestGameId ?? null);

              return [
                <article
                  key={`guestbook-left-${leftRowKey}-${entry?.id ?? `empty-${index}`}`}
                  data-friend-book-guestbook-row-left-desktop={index}
                  className="absolute"
                  style={getAbsoluteLayoutStyle(FRIEND_BOOK_ARCHIVE_DESKTOP_LAYOUT.sampleEntries[leftRowKey])}
                >
                  {entry ? (
                    <div
                      data-friend-book-archive-grid="true"
                      className="grid h-full grid-cols-[60px_minmax(0,1fr)_72px] gap-2 px-3 py-3 xl:grid-cols-[70px_minmax(0,1fr)_84px] xl:px-4 xl:py-4"
                    >
                      <div className="flex items-start justify-center pt-1">
                        {avatar ? (
                          <img
                            src={avatar.asset}
                            alt=""
                            aria-hidden="true"
                            className="h-15 w-15 rounded-full object-cover xl:h-[4.6rem] xl:w-[4.6rem]"
                          />
                        ) : (
                          <div className="h-15 w-15 rounded-full border border-dashed border-[#d4bea8]/80 bg-[rgba(255,249,242,0.45)] xl:h-[4.6rem] xl:w-[4.6rem]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-3">
                          <p
                            data-friend-book-archive-title="true"
                            className="friend-book-yozai-copy font-serif text-[1.62rem] leading-none tracking-[-0.04em] text-[#241813] xl:text-[2rem]"
                          >
                            {entry.nickname}
                          </p>
                          {gameTag ? (
                            <span
                              className="inline-flex shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.64rem] uppercase tracking-[0.16em] xl:px-3 xl:text-[0.72rem]"
                              style={{
                                backgroundColor: gameTag.backgroundColor,
                                borderColor: gameTag.borderColor,
                                color: gameTag.textColor,
                              }}
                            >
                              {gameTag.label}
                            </span>
                          ) : null}
                        </div>
                        <p
                          data-friend-book-archive-body="true"
                          className="friend-book-yozai-copy mt-[6px] text-[18.4px] leading-7 font-semibold text-[#241813] xl:text-[20.6px] xl:leading-[1.55]"
                        >
                          {entry.identityIntro}
                        </p>
                      </div>
                      <div className="flex h-full items-center justify-end pb-1 pt-1">
                        {entry.latestMedalId ? (
                          <img
                            src={entry.latestMedalId}
                            alt=""
                            aria-hidden="true"
                            className="h-[4.5rem] w-[4.5rem] rounded-[1rem] object-cover xl:h-[5.2rem] xl:w-[5.2rem]"
                          />
                        ) : (
                          <div className="h-[4.5rem] w-[4.5rem] rounded-[1rem] border border-dashed border-[#d4bea8]/80 bg-[rgba(255,249,242,0.45)] xl:h-[5.2rem] xl:w-[5.2rem]" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <div
                      data-friend-book-guestbook-empty="true"
                      className="h-full rounded-[1.5rem] bg-[rgba(255,251,246,0.18)]"
                    />
                  )}
                </article>,
                <article
                  key={`guestbook-right-${rightRowKey}-${entry?.id ?? `empty-${index}`}`}
                  data-friend-book-guestbook-row-right-desktop={index}
                  className="absolute"
                  style={getAbsoluteLayoutStyle(FRIEND_BOOK_ARCHIVE_DESKTOP_LAYOUT.userSlots[rightRowKey])}
                >
                  {entry ? (
                    <div className="flex h-full flex-col justify-between px-5 py-4 xl:px-6 xl:py-5">
                      <p
                        data-friend-book-archive-review-copy="true"
                        className="friend-book-yozai-copy mt-[5px] text-[19.04px] leading-6 text-[#3f312b] xl:text-[20px] xl:leading-[1.6]"
                      >
                        {entry.portfolioReview}
                      </p>
                      <p className="self-end font-mono text-[0.64rem] uppercase tracking-[0.18em] text-[#6d5546] xl:text-[0.72rem]">
                        {entry.latestDate}
                      </p>
                    </div>
                  ) : (
                    <div
                      data-friend-book-guestbook-empty="true"
                      className="h-full rounded-[1.5rem] bg-[rgba(255,251,246,0.18)]"
                    />
                  )}
                </article>,
              ];
            })}

            <div
              data-friend-book-guestbook-pagination="true"
              className="absolute bottom-[3.6%] right-[4.8%] flex items-center gap-2"
            >
              <button
                type="button"
                onClick={() => setCurrentGuestbookPage((page) => Math.max(page - 1, 0))}
                disabled={guestbookPage.pageIndex === 0}
                className="rounded-full border border-[#c9b198] bg-[rgba(255,251,246,0.84)] px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.14em] text-[#61483b] disabled:opacity-45"
              >
                Prev
              </button>
              <span
                data-friend-book-guestbook-page-indicator="true"
                className="min-w-[3.5rem] text-center font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[#6d5546]"
              >
                {guestbookPage.pageIndex + 1} / {guestbookPage.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentGuestbookPage((page) =>
                    Math.min(page + 1, guestbookPage.totalPages - 1),
                  )
                }
                disabled={guestbookPage.pageIndex >= guestbookPage.totalPages - 1}
                className="rounded-full border border-[#c9b198] bg-[rgba(255,251,246,0.84)] px-3 py-1.5 text-[0.72rem] uppercase tracking-[0.14em] text-[#61483b] disabled:opacity-45"
              >
                Next
              </button>
            </div>
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
                {guestbookPage.entries.map((entry, index) => {
                  const avatar = entry?.avatarId ? avatarById[entry.avatarId] : null;
                  const gameTag = getGuestbookGameTag(entry?.latestGameId ?? null);

                  return (
                    <article
                      key={entry?.id ?? `mobile-empty-${index}`}
                      data-friend-book-guestbook-row-mobile={index}
                      className="rounded-[1.35rem] bg-[rgba(255,251,246,0.6)] px-4 py-4 shadow-[0_10px_18px_rgba(84,56,36,0.06)] backdrop-blur-[1px]"
                    >
                      {entry ? (
                        <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
                          <div className="flex flex-col items-center gap-3">
                            {avatar ? (
                              <img
                                src={avatar.asset}
                                alt=""
                                aria-hidden="true"
                                className="h-16 w-16 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-16 w-16 rounded-full border border-dashed border-[#d4bea8]/80 bg-[rgba(255,249,242,0.45)]" />
                            )}
                            {entry.latestMedalId ? (
                              <img
                                src={entry.latestMedalId}
                                alt=""
                                aria-hidden="true"
                                className="h-14 w-14 rounded-[1rem] object-cover"
                              />
                            ) : null}
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-serif text-[1.75rem] leading-none tracking-[-0.03em] text-[#2d2221]">
                                {entry.nickname}
                              </p>
                              {gameTag ? (
                                <span
                                  className="inline-flex shrink-0 whitespace-nowrap rounded-full border px-2.5 py-1 text-[0.64rem] uppercase tracking-[0.16em]"
                                  style={{
                                    backgroundColor: gameTag.backgroundColor,
                                    borderColor: gameTag.borderColor,
                                    color: gameTag.textColor,
                                  }}
                                >
                                  {gameTag.label}
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-[0.96rem] leading-7 text-[#463731]">
                              {entry.identityIntro}
                            </p>
                            <p className="mt-3 text-[0.98rem] leading-7 text-[#3f312b]">
                              {entry.portfolioReview}
                            </p>
                          </div>
                          <div className="flex items-start justify-end">
                            <p className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-[#6d5546]">
                              {entry.latestDate}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div
                          data-friend-book-guestbook-empty="true"
                          className="h-24 rounded-[1rem] bg-[rgba(255,249,242,0.24)]"
                        />
                      )}
                    </article>
                  );
                })}
              </div>

              <div
                data-friend-book-guestbook-pagination="true"
                className="flex items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={() => setCurrentGuestbookPage((page) => Math.max(page - 1, 0))}
                  disabled={guestbookPage.pageIndex === 0}
                  className="rounded-full border border-[#c9b198] bg-[rgba(255,251,246,0.84)] px-4 py-2 text-[0.72rem] uppercase tracking-[0.14em] text-[#61483b] disabled:opacity-45"
                >
                  Prev
                </button>
                <span
                  data-friend-book-guestbook-page-indicator="true"
                  className="font-mono text-[0.72rem] uppercase tracking-[0.16em] text-[#6d5546]"
                >
                  {guestbookPage.pageIndex + 1} / {guestbookPage.totalPages}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setCurrentGuestbookPage((page) =>
                      Math.min(page + 1, guestbookPage.totalPages - 1),
                    )
                  }
                  disabled={guestbookPage.pageIndex >= guestbookPage.totalPages - 1}
                  className="rounded-full border border-[#c9b198] bg-[rgba(255,251,246,0.84)] px-4 py-2 text-[0.72rem] uppercase tracking-[0.14em] text-[#61483b] disabled:opacity-45"
                >
                  Next
                </button>
              </div>
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
