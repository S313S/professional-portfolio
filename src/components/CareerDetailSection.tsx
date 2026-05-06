import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react';

import {
  getCareerDetailDragGestureState,
  getCareerDetailInitialSelectedEntryIdByCategory,
  getCareerDetailPageSwitchRevealState,
  getCareerDetailResolvedEntryState,
  getCareerDetailSnapState,
  getCareerDetailSnapTargetY,
  getCareerDetailWheelCaptureState,
  getCareerDetailWheelLockState,
  getCareerDetailWheelState,
  isCareerDetailSectionActive,
  isCareerDetailSectionPinned,
} from './CareerDetailSection.logic';
import { WORKS_LOBBY_ACTIVATE_FROM_CAREER_DETAIL_EVENT } from './WorksLobbySection.logic';
import { armScrollMomentumLock } from '../scrollMomentumLock';

const CAREER_DETAIL_ASSETS = {
  background: '/images/careerDetail_bg.png',
  sharingJourney: '/images/careerDetail_share_icon.png',
  workExperience: '/images/careerDetail_career_icon.png',
  industryKnowledge: '/images/careerDetail_Industry knowledge_icon.png',
  scrollSelector: '/images/careerDetail_scroll_icon.png',
  pageSwitch: '/images/careerDetail_pageSwitch.png',
} as const;

const CAREER_DETAIL_DESKTOP_ASIDE_LAYOUT = {
  left: 'left-[67.48%]',
  top: 'top-[15.89%]',
  width: 'w-[26.47%]',
  height: 'h-[82.62%]',
} as const;

// 中文注释：用于做像素级微调。
// x 为水平位移，负数向左、正数向右；y 为垂直位移，负数向上、正数向下。
// 默认保持 0，不做任何偏移；后续只需要改这里的数字即可。
const CAREER_DETAIL_ARCHIVE_CARD_NUDGE = {
  x: -13,
  y: -2,
} as const;

const CAREER_DETAIL_ARCHIVE_CARD_IMAGE_STYLE: CSSProperties = {
  transform: `translate(${CAREER_DETAIL_ARCHIVE_CARD_NUDGE.x}px, ${CAREER_DETAIL_ARCHIVE_CARD_NUDGE.y}px)`,
};

// 中文注释：右下角“翻页按钮”的位置与大小统一在这里调。
// 现在只保留一套桌面配置，避免 lg / xl 断点互相覆盖，导致你改了却看不到变化。
//
// 怎么改：
// 1. 调位置：改 position 里的 bottom / right
// 2. 调大小：改 size 里的 h / w
//
// 示范案例：
// - 想让按钮更靠右下：
//   position: 'lg:bottom-[3.6%] lg:right-[0.6%]'
// - 想让按钮更大一点：
//   size: 'lg:h-[5.2rem] lg:w-[5.2rem]'
// - 想让按钮更靠里一点并缩小：
//   position: 'lg:bottom-[4.8%] lg:right-[1.4%]'
//   size: 'lg:h-[3.8rem] lg:w-[3.8rem]'
// 注意：
// - bottom 如果写成负数，按钮可能会被推到当前 section 可视区域外面。
// - h / w 如果过小，按钮虽然还在，但会看起来像“消失了”。
const CAREER_DETAIL_PAGE_SWITCH_LAYOUT = {
  wrapperBase: 'absolute z-40 hidden lg:block',
  position: 'lg:bottom-[2.2%] lg:right-[-0.01%]',
  buttonBase:
    'group flex items-center justify-center rounded-full outline-none transition-transform duration-200 ease-out hover:scale-[1.03] focus-visible:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[#6d4b35]/38 focus-visible:ring-offset-4 focus-visible:ring-offset-[#ece2d0]',
  size: 'lg:h-[2.45rem] lg:w-[2.45rem]',
  image:
    'h-full w-full object-contain opacity-92 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-visible:opacity-100',
} as const;

const CAREER_DETAIL_PAGE_SWITCH_REVEAL_DELAY_MS = 3000;
const CAREER_DETAIL_PAGE_SWITCH_HINT_COPY = 'Click to continue';
// 中文注释：这里单独控制“Click to continue”文字和虚线箭头的位置。
// 以后只改这里，不需要再进 JSX 结构里找具体节点。
//
// 怎么改：
// 1. 调整整组提示相对按钮的位置：改 wrapper
// 2. 单独调文字位置：改 textOffset
// 3. 单独调箭头位置：改 arrowOffset
// 4. 调箭头尺寸：改 arrowSize
// 5. 调箭头弯曲和终点：改 arrowPath
//
// 示范案例：
// - 文字往左上：textOffset: '-translate-x-4 -translate-y-3'
// - 箭头往右下：arrowOffset: 'translate-x-4 translate-y-3'
// - 箭头更长：arrowPath: 'M10 12 C 40 4, 70 30, 118 74'
const CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT = {
  wrapper:
    'pointer-events-none absolute bottom-[calc(100%+1rem)] right-[1rem] flex items-end gap-3 transition-opacity duration-200 ease-out',
  textOffset: '-translate-x--1 -translate-y-12',
  textBox: 'max-w-[9rem] text-right',
  arrowOffset: 'translate-x--5 translate-y-2',
  arrowSize: 'h-[4rem] w-[6.8rem]',
  arrowPath: 'M10 0 C 42 8, 66 30, 108 73',
} as const;

const CAREER_DETAIL_SELECTION_STORAGE_KEY = 'career-detail-selection:v1';

export type CareerDetailTabKey = 'sharingJourney' | 'workExperience' | 'industryKnowledge';

interface PersistedCareerDetailSelection {
  selectedCategoryKey: CareerDetailTabKey;
  selectedEntryIdByCategory: Partial<Record<CareerDetailTabKey, string>>;
}

const isCareerDetailTabKey = (value: string): value is CareerDetailTabKey =>
  value === 'sharingJourney' || value === 'workExperience' || value === 'industryKnowledge';

const readPersistedCareerDetailSelection = (): PersistedCareerDetailSelection | null => {
  try {
    const rawValue = window.sessionStorage.getItem(CAREER_DETAIL_SELECTION_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsedValue = JSON.parse(rawValue) as {
      selectedCategoryKey?: string;
      selectedEntryIdByCategory?: Record<string, unknown>;
    };

    if (!parsedValue.selectedCategoryKey || !isCareerDetailTabKey(parsedValue.selectedCategoryKey)) {
      return null;
    }

    const selectedEntryIdByCategory = Object.fromEntries(
      Object.entries(parsedValue.selectedEntryIdByCategory ?? {}).filter(
        (entry): entry is [CareerDetailTabKey, string] =>
          isCareerDetailTabKey(entry[0]) && typeof entry[1] === 'string',
      ),
    ) as Partial<Record<CareerDetailTabKey, string>>;

    return {
      selectedCategoryKey: parsedValue.selectedCategoryKey,
      selectedEntryIdByCategory,
    };
  } catch {
    return null;
  }
};

interface Size {
  width: number;
  height: number;
}

interface PixelRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

interface CareerDetailTabConnector {
  startOffset: Point;
  controlA: Point;
  controlB: Point;
  end: Point;
}

interface CareerDetailContentBlock {
  metaLine: string;
  dateTitle: string;
  eyebrow: string;
  headline: string;
  body: string;
  supportingTitle: string;
  supportingBody: string;
  annotation: string;
}

interface CareerDetailEntry extends CareerDetailContentBlock {
  id: string;
  bookmarkLabel: string;
}

interface CareerDetailCategory {
  key: CareerDetailTabKey;
  label: string;
  imageSrc: string;
  asideImageSrc: string;
  entries: CareerDetailEntry[];
}

const CAREER_DETAIL_CATEGORIES: CareerDetailCategory[] = [
  {
    key: 'sharingJourney',
    label: 'Sharing Journey',
    imageSrc: CAREER_DETAIL_ASSETS.sharingJourney,
    asideImageSrc: '/images/careerDetail_litteleBg_01.png',
    entries: [
      {
        id: 'sharing-essay-first-post',
        bookmarkLabel: 'First Public Notes',
        metaLine: 'Field Note: Public Writing Practice',
        dateTitle: 'April 12th, 2021',
        eyebrow: 'Dispatch Log I: Sharing Journey',
        headline: 'Publishing Before It Felt Polished',
        body:
          'I started sharing small working notes before they felt complete, using public posts as a way to capture decisions, questions, and patterns while they were still fresh enough to be useful.',
        supportingTitle: 'The First Audience Was Future Me',
        supportingBody:
          'Those early entries worked less like polished essays and more like breadcrumb trails. They helped me revisit what I had tried, what failed, and which ideas deserved another pass.',
        annotation: 'Marked after the first month of consistent public notes.',
      },
      {
        id: 'sharing-essay-pattern-library',
        bookmarkLabel: 'Pattern Library',
        metaLine: 'Archive: Audience Pattern Tracking',
        dateTitle: 'September 3rd, 2021',
        eyebrow: 'Dispatch Log II: Sharing Journey',
        headline: 'Turning Repeated Questions Into Reusable Notes',
        body:
          'As more people responded, I stopped treating every conversation as a one-off. Repeated questions became a pattern library that shaped what I wrote next and how I framed each lesson.',
        supportingTitle: 'Useful Notes Need Retrieval Paths',
        supportingBody:
          'I learned to tag ideas by situation instead of mood so someone could quickly find the note that matched their own transition, not just admire the writing.',
        annotation: 'Indexed after recurring reader questions began clustering around the same themes.',
      },
      {
        id: 'sharing-essay-editorial-rhythm',
        bookmarkLabel: 'Editorial Rhythm',
        metaLine: 'Routine: adventure for sharing',
        dateTitle: 'February 18th, 2022',
        eyebrow: 'Dispatch Log III: Sharing Journey',
        headline: 'Building A Rhythm That Could Survive Busy Weeks',
        body:
          'Once the novelty wore off, the real work became consistency. I built a lighter editorial cadence that could survive deadlines and still produce something clear, timely, and worth keeping.',
        supportingTitle: 'Small Systems Protected The Voice',
        supportingBody:
          'Templates, capture habits, and shorter review loops made it possible to publish without waiting for perfect conditions, which kept the writing alive during heavier work cycles.',
        annotation: 'Filed after the sharing habit became part of the week instead of a special event.',
      },
    ],
  },
  {
    key: 'workExperience',
    label: 'Work Experience',
    imageSrc: CAREER_DETAIL_ASSETS.workExperience,
    asideImageSrc: '/images/careerDetail_litteleBg_02.png',
    entries: [
      {
        id: 'work-system-campaign-ops',
        bookmarkLabel: 'Campaign Ops',
        metaLine: 'Work Log: Campaign Operations',
        dateTitle: 'June 7th, 2022',
        eyebrow: 'Dispatch Log I: Work Experience',
        headline: 'Learning To Make Fast Work Legible',
        body:
          'The first stretch of execution work taught me that speed alone was not enough. Teams moved faster when process, ownership, and status were visible without requiring a meeting to reconstruct them.',
        supportingTitle: 'Clarity Reduced Rework',
        supportingBody:
          'The most valuable changes were simple: tighter briefs, sharper handoffs, and clearer definitions of done that made collaborative work easier to inspect and trust.',
        annotation: 'Logged during repeated campaign delivery cycles.',
      },
      {
        id: 'work-system-process-design',
        bookmarkLabel: 'Process Design',
        metaLine: 'Work Log: Workflow Design',
        dateTitle: 'November 14th, 2023',
        eyebrow: 'Dispatch Log II: Work Experience',
        headline: 'Designing Workflows That Other People Could Carry',
        body:
          'As projects became more cross-functional, I shifted from doing everything directly to shaping the workflow itself, so progress could continue even when the original operator stepped away.',
        supportingTitle: 'Good Systems Explain Themselves',
        supportingBody:
          'Documentation, checkpoints, and smaller decision gates made the work easier to inherit. That lowered friction for collaborators and exposed problems earlier.',
        annotation: 'Compiled after several rounds of workflow redesign.',
      },
      {
        id: 'work-system-ai-delivery',
        bookmarkLabel: 'AI Delivery',
        metaLine: 'Work Log: AI-Enabled Execution',
        dateTitle: 'August 5th, 2024',
        eyebrow: 'Dispatch Log III: Work Experience',
        headline: 'Using AI To Shorten The Path From Idea To Output',
        body:
          'The practical value of AI showed up when it reduced repetitive coordination work and made iteration cheaper. I focused on fitting it into delivery systems instead of treating it as a separate novelty.',
        supportingTitle: 'The Workflow Was The Real Product',
        supportingBody:
          'Prompting mattered, but the lasting gains came from how tasks were staged, reviewed, and handed off between people and tools.',
        annotation: 'Recorded after AI-assisted delivery became part of the baseline workflow.',
      },
    ],
  },
  {
    key: 'industryKnowledge',
    label: 'Industry Knowledge',
    imageSrc: CAREER_DETAIL_ASSETS.industryKnowledge,
    asideImageSrc: '/images/careerDetail_litteleBg_03.png',
    entries: [
      {
        id: 'industry-signal-ai-adoption',
        bookmarkLabel: 'Adoption Signals',
        metaLine: 'Research Log: Adoption Patterns',
        dateTitle: 'January 22nd, 2024',
        eyebrow: 'Dispatch Log I: Industry Knowledge',
        headline: 'Watching Where AI Moved From Demo To Habit',
        body:
          'The clearest signals did not come from launch events. They came from teams quietly changing their weekly routines, replacing manual steps, and treating AI as workflow infrastructure instead of spectacle.',
        supportingTitle: 'Repeated Usage Beat Novelty',
        supportingBody:
          'I learned to look for behavior that persisted after the announcement cycle ended. Stable habits revealed more about product value than momentary excitement.',
        annotation: 'Cross-referenced against repeated workflow changes and operator notes.',
      },
      {
        id: 'industry-signal-creator-commerce',
        bookmarkLabel: 'Creator Commerce',
        metaLine: 'Research Log: Distribution Economics',
        dateTitle: 'May 30th, 2024',
        eyebrow: 'Dispatch Log II: Industry Knowledge',
        headline: 'Where Content, Distribution, And Revenue Began To Merge',
        body:
          'I tracked how creators and small teams started designing content with downstream conversion in mind from the beginning, which made the boundary between media, product, and commerce noticeably thinner.',
        supportingTitle: 'Distribution Changed The Brief',
        supportingBody:
          'Once distribution economics shaped what got made, product thinking had to account for channels, audience expectations, and monetization much earlier in the process.',
        annotation: 'Filed after comparing creator workflows, launch patterns, and channel behavior.',
      },
    ],
  },
];

const CAREER_DETAIL_TABS: Array<{
  key: CareerDetailTabKey;
  label: string;
  imageSrc: string;
}> = CAREER_DETAIL_CATEGORIES.map(({ key, label, imageSrc }) => ({
  key,
  label,
  imageSrc,
}));

const CAREER_DETAIL_BACKGROUND_SIZE: Size = {
  width: 5574,
  height: 3010,
};

const CAREER_DETAIL_DEFAULT_STAGE_SIZE: Size = {
  width: 1600,
  height: 900,
};

const CAREER_DETAIL_DRAG_SWITCH_THRESHOLD = 72;
const CAREER_DETAIL_WHEEL_SWITCH_THRESHOLD = 80;
const CAREER_DETAIL_WHEEL_SWITCH_COOLDOWN_MS = 220;

// Desktop-only manual tuning zone:
// These numbers are the original background-image pixel bounds that the three
// interactive paper buttons should cover 1:1. If you need to hand-tune the
// overlay later, edit ONLY these x/y/width/height values.
const CAREER_DETAIL_DESKTOP_TAB_PIXEL_RECTS: Record<CareerDetailTabKey, PixelRect> = {
  sharingJourney: {
    x: 288,
    y: 252,
    width: 1332,
    height: 720,
  },
  workExperience: {
    x: 300,
    y: 1040,
    width: 1320,
    height: 708,
  },
  industryKnowledge: {
    x: 252,
    y: 1800,
    width: 1380,
    height: 726,
  },
};

const CAREER_DETAIL_DESKTOP_SELECTOR_PIXEL_RECT: PixelRect = {
  x: 5080,
  y: 316,
  width: 332,
  height: 2047,
};

const CAREER_DETAIL_DESKTOP_TAB_CONNECTORS: Record<CareerDetailTabKey, CareerDetailTabConnector> = {
  sharingJourney: {
    startOffset: { x: 0.94, y: 0.42 },
    controlA: { x: 0.31, y: 0.22 },
    controlB: { x: 0.336, y: 0.3 },
    end: { x: 0.36, y: 0.325 },
  },
  workExperience: {
    startOffset: { x: 0.95, y: 0.5 },
    controlA: { x: 0.31, y: 0.415 },
    controlB: { x: 0.336, y: 0.43 },
    end: { x: 0.36, y: 0.442 },
  },
  industryKnowledge: {
    startOffset: { x: 0.94, y: 0.56 },
    controlA: { x: 0.305, y: 0.63 },
    controlB: { x: 0.334, y: 0.56 },
    end: { x: 0.36, y: 0.56 },
  },
};

const getCoveredImageFrame = (containerSize: Size, imageSize: Size) => {
  const scale = Math.max(containerSize.width / imageSize.width, containerSize.height / imageSize.height);
  const width = imageSize.width * scale;
  const height = imageSize.height * scale;

  return {
    scale,
    left: (containerSize.width - width) / 2,
    top: (containerSize.height - height) / 2,
  };
};

const getDesktopTabStyle = (tabKey: CareerDetailTabKey, stageSize: Size) => {
  const imageFrame = getCoveredImageFrame(stageSize, CAREER_DETAIL_BACKGROUND_SIZE);
  const rect = CAREER_DETAIL_DESKTOP_TAB_PIXEL_RECTS[tabKey];

  return {
    left: `${imageFrame.left + rect.x * imageFrame.scale}px`,
    top: `${imageFrame.top + rect.y * imageFrame.scale}px`,
    width: `${rect.width * imageFrame.scale}px`,
    height: `${rect.height * imageFrame.scale}px`,
  };
};

const getDesktopTabRect = (tabKey: CareerDetailTabKey, stageSize: Size): PixelRect => {
  const imageFrame = getCoveredImageFrame(stageSize, CAREER_DETAIL_BACKGROUND_SIZE);
  const rect = CAREER_DETAIL_DESKTOP_TAB_PIXEL_RECTS[tabKey];

  return {
    x: imageFrame.left + rect.x * imageFrame.scale,
    y: imageFrame.top + rect.y * imageFrame.scale,
    width: rect.width * imageFrame.scale,
    height: rect.height * imageFrame.scale,
  };
};

const getBackgroundPixelRectStyle = (rect: PixelRect, stageSize: Size): CSSProperties => {
  const imageFrame = getCoveredImageFrame(stageSize, CAREER_DETAIL_BACKGROUND_SIZE);

  return {
    left: `${imageFrame.left + rect.x * imageFrame.scale}px`,
    top: `${imageFrame.top + rect.y * imageFrame.scale}px`,
    width: `${rect.width * imageFrame.scale}px`,
    height: `${rect.height * imageFrame.scale}px`,
  };
};

const getStagePoint = (stageSize: Size, point: Point): Point => ({
  x: stageSize.width * point.x,
  y: stageSize.height * point.y,
});

const getDesktopConnectorPath = (tabKey: CareerDetailTabKey, stageSize: Size) => {
  const rect = getDesktopTabRect(tabKey, stageSize);
  const connector = CAREER_DETAIL_DESKTOP_TAB_CONNECTORS[tabKey];
  const start = {
    x: rect.x + rect.width * connector.startOffset.x,
    y: rect.y + rect.height * connector.startOffset.y,
  };
  const controlA = getStagePoint(stageSize, connector.controlA);
  const controlB = getStagePoint(stageSize, connector.controlB);
  const end = getStagePoint(stageSize, connector.end);

  return `M ${start.x} ${start.y} C ${controlA.x} ${controlA.y}, ${controlB.x} ${controlB.y}, ${end.x} ${end.y}`;
};

const joinClasses = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ');

export default function CareerDetailSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const selectorTrackRef = useRef<HTMLDivElement>(null);
  const recordButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const hasSnappedOnCurrentEntryRef = useRef(false);
  const hasActivatedPageSwitchRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const selectorDragStateRef = useRef<{
    pointerId: number | null;
    dragStartY: number | null;
    hasCommittedInGesture: boolean;
  }>({
    pointerId: null,
    dragStartY: null,
    hasCommittedInGesture: false,
  });
  const wheelDeltaAccumulatorRef = useRef(0);
  const lastWheelDirectionRef = useRef(0);
  const lastWheelSwitchAtRef = useRef(0);
  const [sectionSize, setSectionSize] = useState<Size>(CAREER_DETAIL_DEFAULT_STAGE_SIZE);
  const [selectorThumbOffsetPx, setSelectorThumbOffsetPx] = useState<number | null>(null);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<CareerDetailTabKey>('sharingJourney');
  const [selectedEntryIdByCategory, setSelectedEntryIdByCategory] = useState<
    Record<CareerDetailTabKey, string>
  >(
    () =>
      getCareerDetailInitialSelectedEntryIdByCategory(CAREER_DETAIL_CATEGORIES) as Record<
        CareerDetailTabKey,
        string
      >,
  );
  const [isSelectorDragging, setIsSelectorDragging] = useState(false);
  const [isSelectionPersistenceReady, setIsSelectionPersistenceReady] = useState(false);
  const [isCtaSectionActive, setIsCtaSectionActive] = useState(false);
  const [isCtaSectionPinned, setIsCtaSectionPinned] = useState(false);
  const [hasRevealDelayElapsed, setHasRevealDelayElapsed] = useState(false);
  const [hasAttemptedDownwardScroll, setHasAttemptedDownwardScroll] = useState(false);
  const [isPageSwitchHintHovered, setIsPageSwitchHintHovered] = useState(false);

  const selectedCategory = useMemo(
    () =>
      CAREER_DETAIL_CATEGORIES.find((category) => category.key === selectedCategoryKey) ??
      CAREER_DETAIL_CATEGORIES[0],
    [selectedCategoryKey],
  );
  const selectedEntries = selectedCategory?.entries ?? [];
  const selectedEntryState = useMemo(
    () =>
      getCareerDetailResolvedEntryState({
        entries: selectedEntries,
        selectedEntryId: selectedEntryIdByCategory[selectedCategory.key] ?? '',
      }),
    [selectedCategory, selectedEntries, selectedEntryIdByCategory],
  );
  const selectedEntry = selectedEntryState.selectedEntry;
  const selectedEntryIndex = selectedEntryState.selectedEntryIndex;
  const isCurrentCategoryEmpty = selectedEntry === null;
  const isSharingCategory = selectedCategory.key === 'sharingJourney';
  const shouldShowPageSwitchCta =
    hasAttemptedDownwardScroll && !hasActivatedPageSwitchRef.current && isCtaSectionActive;
  const shouldShowPageSwitchHint = shouldShowPageSwitchCta && !isPageSwitchHintHovered;
  const displayedEntry: CareerDetailContentBlock = selectedEntry ?? {
    metaLine: `${selectedCategory.label} / Archive Pending`,
    dateTitle: 'Archive pending',
    eyebrow: 'No log entries yet',
    headline: `${selectedCategory.label} is waiting for its first journal entry.`,
    body: 'Add a dated note here when you are ready to capture the next milestone, decision, or observation for this category.',
    supportingTitle: 'Ready For The First Entry',
    supportingBody:
      'The layout will keep working when this category is empty. Once you add the first log item, the bookmark rail and content panel will populate automatically.',
    annotation: 'Placeholder visible because this category currently has no journal entries.',
  };

  useEffect(() => {
    const rememberedEntryId = selectedEntryIdByCategory[selectedCategory.key] ?? '';
    if (rememberedEntryId === selectedEntryState.selectedEntryId) {
      return;
    }

    setSelectedEntryIdByCategory((current) => ({
      ...current,
      [selectedCategory.key]: selectedEntryState.selectedEntryId,
    }));
  }, [selectedCategory.key, selectedEntryIdByCategory, selectedEntryState.selectedEntryId]);

  useEffect(() => {
    if (
      !isCtaSectionActive ||
      !isCtaSectionPinned ||
      hasActivatedPageSwitchRef.current ||
      hasRevealDelayElapsed
    ) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHasRevealDelayElapsed(true);
    }, CAREER_DETAIL_PAGE_SWITCH_REVEAL_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasRevealDelayElapsed, isCtaSectionActive, isCtaSectionPinned]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      setIsSelectionPersistenceReady(true);
      return;
    }

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const sectionBottom = sectionTop + section.offsetHeight;
    const isInsideSection = window.scrollY >= sectionTop && window.scrollY < sectionBottom;

    if (isInsideSection) {
      const persistedSelection = readPersistedCareerDetailSelection();
      if (persistedSelection) {
        setSelectedCategoryKey(persistedSelection.selectedCategoryKey);
        setSelectedEntryIdByCategory((current) => ({
          ...current,
          ...persistedSelection.selectedEntryIdByCategory,
        }));
      }
    }

    setIsSelectionPersistenceReady(true);
  }, []);

  useEffect(() => {
    if (!isSelectionPersistenceReady) {
      return;
    }

    const persistedSelection: PersistedCareerDetailSelection = {
      selectedCategoryKey,
      selectedEntryIdByCategory,
    };

    window.sessionStorage.setItem(
      CAREER_DETAIL_SELECTION_STORAGE_KEY,
      JSON.stringify(persistedSelection),
    );
  }, [isSelectionPersistenceReady, selectedCategoryKey, selectedEntryIdByCategory]);

  const desktopTabStyles = useMemo(
    () =>
      Object.fromEntries(
        CAREER_DETAIL_TABS.map((tab) => [tab.key, getDesktopTabStyle(tab.key, sectionSize)]),
      ) as Record<CareerDetailTabKey, CSSProperties>,
    [sectionSize],
  );
  const desktopSelectorStyle = useMemo(
    () => getBackgroundPixelRectStyle(CAREER_DETAIL_DESKTOP_SELECTOR_PIXEL_RECT, sectionSize),
    [sectionSize],
  );
  const desktopConnectorPaths = useMemo(
    () =>
      Object.fromEntries(
        CAREER_DETAIL_TABS.map((tab) => [tab.key, getDesktopConnectorPath(tab.key, sectionSize)]),
      ) as Record<CareerDetailTabKey, string>,
    [sectionSize],
  );
  const selectorThumbStyle = useMemo(() => {
    if (selectorThumbOffsetPx !== null) {
      return {
        top: `${selectorThumbOffsetPx}px`,
      } satisfies CSSProperties;
    }

    const progress =
      selectedEntries.length <= 1 || selectedEntryIndex < 0
        ? 0.5
        : selectedEntryIndex / (selectedEntries.length - 1);

    return {
      top: `${8 + progress * 84}%`,
    } satisfies CSSProperties;
  }, [selectedEntries.length, selectedEntryIndex, selectorThumbOffsetPx]);

  const commitSelectedEntryId = (entryId: string) => {
    setSelectedEntryIdByCategory((current) => ({
      ...current,
      [selectedCategory.key]: entryId,
    }));
  };

  const resetSelectorDrag = () => {
    selectorDragStateRef.current = {
      pointerId: null,
      dragStartY: null,
      hasCommittedInGesture: false,
    };
    setIsSelectorDragging(false);
  };

  const handleSelectorPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    const section = sectionRef.current;
    if (section) {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: getCareerDetailSnapTargetY(sectionTop),
        behavior: 'auto',
      });
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    selectorDragStateRef.current = {
      pointerId: event.pointerId,
      dragStartY: event.clientY,
      hasCommittedInGesture: false,
    };
    setIsSelectorDragging(true);
  };

  const handleSelectorPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const dragState = selectorDragStateRef.current;
    if (dragState.pointerId !== event.pointerId) {
      return;
    }

    const gestureState = getCareerDetailDragGestureState({
      dragStartY: dragState.dragStartY,
      currentY: event.clientY,
      threshold: CAREER_DETAIL_DRAG_SWITCH_THRESHOLD,
      activeIndex: selectedEntryIndex >= 0 ? selectedEntryIndex : 0,
      recordCount: selectedEntries.length,
      hasCommittedInGesture: dragState.hasCommittedInGesture,
    });

    if (!gestureState.shouldCommitSwitch) {
      return;
    }

    event.preventDefault();
    selectorDragStateRef.current = {
      ...dragState,
      hasCommittedInGesture: gestureState.hasCommittedInGesture,
    };

    const nextEntry = selectedEntries[gestureState.nextIndex];
    if (nextEntry) {
      commitSelectedEntryId(nextEntry.id);
    }
  };

  const handleSelectorPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (selectorDragStateRef.current.pointerId !== event.pointerId) {
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    resetSelectorDrag();
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const sectionTop = section.getBoundingClientRect().top + scrollY;
      const sectionHeight = section.offsetHeight;
      const isActive = isCareerDetailSectionActive(scrollY, sectionTop, sectionHeight);
      const isPinned = isCareerDetailSectionPinned(scrollY, sectionTop);

      setIsCtaSectionActive((current) => (current === isActive ? current : isActive));
      setIsCtaSectionPinned((current) => (current === isPinned ? current : isPinned));

      if (!isActive) {
        hasActivatedPageSwitchRef.current = false;
        wheelDeltaAccumulatorRef.current = 0;
        lastWheelDirectionRef.current = 0;
        setHasRevealDelayElapsed(false);
        setHasAttemptedDownwardScroll(false);
        setIsPageSwitchHintHovered(false);
      }

      const snapState = getCareerDetailSnapState({
        scrollY,
        lastScrollY: lastScrollYRef.current,
        sectionTop,
        sectionHeight,
        viewportHeight: window.innerHeight,
        hasSnappedOnCurrentEntry: hasSnappedOnCurrentEntryRef.current,
      });

      if (snapState.shouldResetLatch) {
        hasSnappedOnCurrentEntryRef.current = false;
        hasActivatedPageSwitchRef.current = false;
        wheelDeltaAccumulatorRef.current = 0;
        lastWheelDirectionRef.current = 0;
      }

      if (snapState.shouldSnap) {
        hasSnappedOnCurrentEntryRef.current = true;
        armScrollMomentumLock();
        window.scrollTo({
          top: getCareerDetailSnapTargetY(sectionTop),
          behavior: 'smooth',
        });
      }

      lastScrollYRef.current = scrollY;
    };

    const handleWheel = (event: WheelEvent) => {
      if (!window.matchMedia('(min-width: 1024px)').matches) {
        wheelDeltaAccumulatorRef.current = 0;
        lastWheelDirectionRef.current = 0;
        return;
      }

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const sectionHeight = section.offsetHeight;
      const wheelLockState = getCareerDetailWheelLockState({
        deltaY: event.deltaY,
        scrollY: window.scrollY,
        sectionTop,
        sectionHeight,
        hasActivatedPageSwitch: hasActivatedPageSwitchRef.current,
      });
      const pageSwitchRevealState = getCareerDetailPageSwitchRevealState({
        deltaY: event.deltaY,
        scrollY: window.scrollY,
        sectionTop,
        sectionHeight,
        hasRevealDelayElapsed,
        hasActivatedPageSwitch: hasActivatedPageSwitchRef.current,
      });

      if (pageSwitchRevealState.shouldReveal) {
        setHasAttemptedDownwardScroll(true);
      }

      if (wheelLockState.shouldPreventScroll) {
        event.preventDefault();
        if (wheelLockState.targetScrollY !== null) {
          window.scrollTo({
            top: wheelLockState.targetScrollY,
            behavior: 'auto',
          });
        }

        wheelDeltaAccumulatorRef.current = 0;
        lastWheelDirectionRef.current = 0;
        return;
      }

      const isSectionPinned = isCareerDetailSectionPinned(window.scrollY, sectionTop);

      if (!isSectionPinned) {
        const captureState = getCareerDetailWheelCaptureState({
          scrollY: window.scrollY,
          sectionTop,
          sectionHeight,
          deltaY: event.deltaY,
          activeIndex: selectedEntryIndex >= 0 ? selectedEntryIndex : 0,
          recordCount: selectedEntries.length,
        });

        if (!captureState.shouldPreventScroll) {
          wheelDeltaAccumulatorRef.current = 0;
          lastWheelDirectionRef.current = 0;
          return;
        }

        event.preventDefault();
        if (captureState.targetScrollY !== null) {
          window.scrollTo({
            top: captureState.targetScrollY,
            behavior: 'auto',
          });
        }

        const nextEntry = selectedEntries[captureState.nextIndex];
        if (nextEntry) {
          commitSelectedEntryId(nextEntry.id);
        }

        wheelDeltaAccumulatorRef.current = 0;
        lastWheelDirectionRef.current = 0;
        return;
      }

      const wheelState = getCareerDetailWheelState({
        deltaY: event.deltaY,
        activeIndex: selectedEntryIndex >= 0 ? selectedEntryIndex : 0,
        recordCount: selectedEntries.length,
        isSectionPinned,
      });

      if (!wheelState.shouldPreventScroll) {
        wheelDeltaAccumulatorRef.current = 0;
        lastWheelDirectionRef.current = 0;
        return;
      }

      event.preventDefault();
      window.scrollTo({
        top: getCareerDetailSnapTargetY(sectionTop),
        behavior: 'auto',
      });

      const direction = Math.sign(event.deltaY);
      if (direction === 0) {
        return;
      }

      if (direction !== lastWheelDirectionRef.current) {
        wheelDeltaAccumulatorRef.current = 0;
      }

      lastWheelDirectionRef.current = direction;
      wheelDeltaAccumulatorRef.current += event.deltaY;

      const now = window.performance?.now?.() ?? Date.now();
      const hasReachedThreshold =
        Math.abs(wheelDeltaAccumulatorRef.current) >= CAREER_DETAIL_WHEEL_SWITCH_THRESHOLD;
      const isCoolingDown =
        now - lastWheelSwitchAtRef.current < CAREER_DETAIL_WHEEL_SWITCH_COOLDOWN_MS;

      if (!hasReachedThreshold || isCoolingDown) {
        return;
      }

      wheelDeltaAccumulatorRef.current = 0;
      lastWheelSwitchAtRef.current = now;

      const nextEntry = selectedEntries[wheelState.nextIndex];
      if (nextEntry) {
        commitSelectedEntryId(nextEntry.id);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [hasRevealDelayElapsed, selectedEntries, selectedEntryIndex]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || typeof ResizeObserver === 'undefined') {
      return;
    }

    const updateSectionSize = () => {
      setSectionSize({
        width: section.clientWidth,
        height: section.clientHeight,
      });
    };

    updateSectionSize();

    const resizeObserver = new ResizeObserver(() => {
      updateSectionSize();
    });

    resizeObserver.observe(section);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    const track = selectorTrackRef.current;
    const selectedButton = recordButtonRefs.current[selectedEntryState.selectedEntryId] ?? null;

    if (!track || !selectedButton) {
      setSelectorThumbOffsetPx(null);
      return;
    }

    const updateSelectorThumbOffset = () => {
      const trackRect = track.getBoundingClientRect();
      const selectedButtonRect = selectedButton.getBoundingClientRect();
      const nextOffset = selectedButtonRect.top + selectedButtonRect.height / 2 - trackRect.top;

      setSelectorThumbOffsetPx(nextOffset);
    };

    updateSelectorThumbOffset();

    if (typeof ResizeObserver === 'undefined') {
      return;
    }

    const resizeObserver = new ResizeObserver(() => {
      updateSelectorThumbOffset();
    });

    resizeObserver.observe(track);
    resizeObserver.observe(selectedButton);

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedCategory.key, selectedEntryState.selectedEntryId, selectedEntries.length]);

  const handlePageSwitchClick = () => {
    hasActivatedPageSwitchRef.current = true;
    wheelDeltaAccumulatorRef.current = 0;
    lastWheelDirectionRef.current = 0;
    setIsPageSwitchHintHovered(false);
    window.dispatchEvent(new Event(WORKS_LOBBY_ACTIVATE_FROM_CAREER_DETAIL_EVENT));
  };

  return (
    <section
      ref={sectionRef}
      id="career-detail-section"
      aria-labelledby="career-detail-date-title"
      className="relative min-h-[100dvh] overflow-hidden bg-[#ece2d0] text-[#2b2119]"
    >
      <div className="absolute inset-0">
        <img
          src={CAREER_DETAIL_ASSETS.background}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(239,228,211,0.16)_0%,rgba(246,240,229,0.06)_42%,rgba(238,228,213,0.18)_100%)]" />
      </div>

      {/* Desktop paper-button overlay.
          This layer uses background-image pixel coordinates so the interactive
          buttons stay locked to the baked-in paper art even when object-cover
          changes the rendered image scale/crop. */}
      <div
        data-career-detail-tab-overlay="desktop"
        data-career-detail-tab-positioning="background-pixel-lock"
        className="pointer-events-none absolute inset-0 z-30 hidden lg:block"
      >
        <div
          data-career-detail-connector-layer="desktop"
          aria-hidden="true"
          className="absolute inset-0"
        >
          <svg
            data-career-detail-connector-svg="desktop"
            viewBox={`0 0 ${sectionSize.width} ${sectionSize.height}`}
            className="h-full w-full overflow-visible"
          >
            <defs>
              <marker
                id="career-detail-connector-arrow"
                data-career-detail-connector-arrowhead="desktop"
                markerWidth="8"
                markerHeight="8"
                refX="6.5"
                refY="4"
                orient="auto"
                markerUnits="strokeWidth"
              >
                <path
                  d="M 0 0 L 8 4 L 0 8 L 2.2 4 z"
                  style={{
                    fill: 'rgba(116, 92, 67, 0.9)',
                    stroke: 'rgba(92, 70, 48, 0.82)',
                    strokeWidth: 0.7,
                  }}
                />
              </marker>
            </defs>
            {CAREER_DETAIL_TABS.map((tab) => {
              const isActive = tab.key === selectedCategoryKey;

              return (
                <g
                  key={`${tab.key}-connector`}
                  data-career-detail-connector={tab.key}
                  data-career-detail-connector-active={isActive ? 'true' : 'false'}
                >
                  <path
                    d={desktopConnectorPaths[tab.key]}
                    className="transition-[opacity,stroke-dashoffset] duration-500 ease-out"
                    style={{
                      fill: 'none',
                      stroke: 'rgba(116, 92, 67, 0.78)',
                      strokeWidth: 2.05,
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      opacity: isActive ? 1 : 0,
                      strokeDasharray: '7 10',
                      strokeDashoffset: isActive ? 0 : 17,
                      markerEnd: 'url(#career-detail-connector-arrow)',
                      filter: 'drop-shadow(0 1px 2px rgba(86, 64, 43, 0.1))',
                    }}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {CAREER_DETAIL_TABS.map((tab) => {
          const isActive = tab.key === selectedCategoryKey;

          return (
            <button
              key={tab.key}
              type="button"
              data-career-detail-tab-surface="desktop"
              data-career-detail-tab={tab.key}
              aria-label={tab.label}
              aria-pressed={isActive}
              style={desktopTabStyles[tab.key]}
              className={joinClasses(
                'group pointer-events-auto absolute overflow-hidden bg-transparent p-0 text-left outline-none transition-[filter,opacity,transform] duration-500 focus-visible:ring-2 focus-visible:ring-[#73573f]/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#efe4d5]',
                isActive
                  ? 'z-20 scale-[1.022] -translate-y-0.5'
                  : 'z-10 opacity-[0.94] hover:-translate-y-1 hover:scale-[1.01] hover:opacity-100',
              )}
              onClick={() => setSelectedCategoryKey(tab.key)}
            >
              <img
                src={tab.imageSrc}
                alt=""
                aria-hidden="true"
                draggable={false}
                className={joinClasses(
                  'absolute inset-0 h-full w-full max-w-none transition-[filter,transform] duration-500',
                  isActive
                    ? 'drop-shadow-[0_24px_30px_rgba(58,42,26,0.22)] brightness-[1.045] saturate-[1.04]'
                    : 'drop-shadow-[0_16px_22px_rgba(58,42,26,0.15)] brightness-[0.985] saturate-[0.98] group-hover:brightness-[1.015] group-hover:saturate-[1.01]',
                )}
              />
            </button>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-0 z-40 hidden lg:block">
        <div
          data-career-detail-selector="desktop"
          data-career-detail-selector-positioning="background-pixel-lock"
          className="pointer-events-auto absolute flex items-center justify-center"
          style={desktopSelectorStyle}
        >
          <select
            data-career-detail-select="record"
            aria-label="Career detail record"
            className="sr-only"
            value={selectedEntryState.selectedEntryId}
            onChange={(event) => commitSelectedEntryId(event.target.value)}
            disabled={isCurrentCategoryEmpty}
          >
            {isCurrentCategoryEmpty ? (
              <option value="">No entries yet</option>
            ) : (
              selectedEntries.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.bookmarkLabel}
                </option>
              ))
            )}
          </select>

          <div
            data-career-detail-drag-track="desktop"
            ref={selectorTrackRef}
            className="absolute inset-y-[8%] left-[16%] z-10 w-[42%] -translate-x-1/2 touch-none"
            onPointerDown={handleSelectorPointerDown}
            onPointerMove={handleSelectorPointerMove}
            onPointerUp={handleSelectorPointerUp}
            onPointerCancel={handleSelectorPointerUp}
            onLostPointerCapture={resetSelectorDrag}
          >
            <div
              data-career-detail-drag-thumb="desktop"
              style={selectorThumbStyle}
              className={joinClasses(
                'absolute left-1/2 flex h-[24%] w-[78%] -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-[top,transform] duration-300',
                isSelectorDragging ? 'cursor-grabbing scale-[1.03]' : 'cursor-grab',
              )}
            >
              <img
                data-career-detail-drag-thumb-icon="desktop"
                src={CAREER_DETAIL_ASSETS.scrollSelector}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="pointer-events-none h-auto max-h-full w-full object-contain drop-shadow-[0_10px_24px_rgba(92,69,45,0.18)]"
              />
            </div>
          </div>

          <div
            data-career-detail-record-rail="desktop"
            data-career-detail-record-rail-layout={isSharingCategory ? 'distributed' : 'fixed-gap'}
            className={joinClasses(
              'absolute inset-y-[8%] right-[10%] z-20 flex w-[48%] flex-col items-center',
              isSharingCategory ? 'justify-between' : 'justify-start gap-[1.2rem] pt-[0.6rem]',
            )}
          >
            {selectedEntries.map((entry) => {
              const isSelected = entry.id === selectedEntryState.selectedEntryId;

              return (
                <button
                  key={entry.id}
                  ref={(node) => {
                    recordButtonRefs.current[entry.id] = node;
                  }}
                  type="button"
                  data-career-detail-record-button={entry.id}
                  aria-label={entry.bookmarkLabel}
                  aria-pressed={isSelected}
                  className={joinClasses(
                    'rounded-full px-2 py-1 text-[0.72rem] font-medium tracking-[0.08em] text-[#5f4d3f] transition-all duration-300 [writing-mode:vertical-rl]',
                    isSelected
                      ? 'bg-[rgba(247,241,231,0.88)] text-[#2e241b] shadow-[0_8px_18px_rgba(92,69,45,0.12)]'
                      : 'bg-[rgba(247,241,231,0.55)] hover:bg-[rgba(247,241,231,0.75)]',
                  )}
                  onClick={() => commitSelectedEntryId(entry.id)}
                >
                  {entry.bookmarkLabel}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative z-20 mx-auto min-h-[100dvh] max-w-[1600px] px-5 py-8 sm:px-8 lg:px-10">
        <div className="flex min-h-[calc(100dvh-4rem)] flex-col gap-8 lg:hidden">
          <div className="rounded-[2rem] border border-[#8b735c]/15 bg-[#f7f1e7]/84 p-5 shadow-[0_24px_80px_rgba(83,60,37,0.14)] backdrop-blur-[2px]">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#7d6957]">
              {displayedEntry.metaLine}
            </p>
            <h2
              id="career-detail-date-title"
              data-career-detail-block="date-title"
              className="mt-3 font-serif text-[2.6rem] leading-none tracking-[-0.05em] text-[#2c2118]"
            >
              {displayedEntry.dateTitle}
            </h2>

            <div className="mt-5 flex gap-3 overflow-x-auto pb-1">
              {CAREER_DETAIL_TABS.map((tab) => {
                const isActive = tab.key === selectedCategoryKey;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    data-career-detail-tab-surface="mobile"
                    data-career-detail-tab={tab.key}
                    aria-label={tab.label}
                    aria-pressed={isActive}
                    className={joinClasses(
                      'shrink-0 rounded-[1rem] border bg-transparent p-0 outline-none transition-[filter,opacity,transform] duration-300 focus-visible:ring-2 focus-visible:ring-[#73573f]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f1e7]',
                      isActive
                        ? 'scale-[1.02] border-[#8f775f]/22 bg-[rgba(255,249,241,0.38)] shadow-[0_12px_24px_rgba(83,60,37,0.12)]'
                        : 'border-transparent opacity-80 hover:opacity-100',
                    )}
                    onClick={() => setSelectedCategoryKey(tab.key)}
                  >
                    <img
                      src={tab.imageSrc}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      className={joinClasses(
                        'w-[10rem] transition-[filter,transform] duration-300',
                        isActive ? 'brightness-[1.03]' : 'brightness-[0.98]',
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[#7e6654]">
                Log Entry
              </span>
              <select
                data-career-detail-select="record"
                className="w-full rounded-[1rem] border border-[#8d7660]/25 bg-[#fbf7f1]/90 px-4 py-3 text-sm font-medium text-[#3a2d22] outline-none"
                value={selectedEntryState.selectedEntryId}
                onChange={(event) => commitSelectedEntryId(event.target.value)}
                disabled={isCurrentCategoryEmpty}
              >
                {isCurrentCategoryEmpty ? (
                  <option value="">No entries yet</option>
                ) : (
                  selectedEntries.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.bookmarkLabel}
                    </option>
                  ))
                )}
              </select>
            </label>
          </div>

          <article
            data-career-detail-empty-state={isCurrentCategoryEmpty ? 'true' : 'false'}
            className="rounded-[2rem] border border-[#8b735c]/15 bg-[#f7f1e7]/84 p-5 shadow-[0_24px_80px_rgba(83,60,37,0.14)] backdrop-blur-[2px]"
          >
            <p
              data-career-detail-block="eyebrow"
              className="text-xs font-semibold uppercase tracking-[0.26em] text-[#7e6654]"
            >
              {displayedEntry.eyebrow}
            </p>
            <h3 className="mt-3 max-w-[24ch] font-serif text-[2.2rem] leading-none tracking-[-0.04em] text-[#2d241c]">
              {displayedEntry.headline}
            </h3>
            <p
              data-career-detail-block="body"
              className="mt-4 text-[1rem] leading-[1.65] text-[#332821]"
            >
              {displayedEntry.body}
            </p>
            <div className="mt-6 rounded-[1.3rem] border border-[#8f775f]/18 bg-white/45 p-4">
              <p className="font-serif text-[1.4rem] leading-none tracking-[-0.03em] text-[#2f251d]">
                {displayedEntry.supportingTitle}
              </p>
              <p className="mt-3 text-[0.98rem] leading-[1.6] text-[#3c2f24]">
                {displayedEntry.supportingBody}
              </p>
            </div>
            <p className="mt-4 text-sm italic leading-[1.5] text-[#5e4d40]">
              {displayedEntry.annotation}
            </p>
          </article>
        </div>

        <div className="relative hidden min-h-[calc(100dvh-4rem)] lg:block">
          <div className="absolute left-[35%] top-[-1.5%] w-[44%]">
            <p className="text-[0.82rem] font-semibold uppercase tracking-[0.28em] text-[#7f6854]">
              {displayedEntry.metaLine}
            </p>
            <h2
              id="career-detail-date-title"
              data-career-detail-block="date-title"
              className="mt-3 font-serif text-[clamp(3.6rem,4.2vw,4.8rem)] leading-none tracking-[-0.06em] text-[#241b14]"
            >
              {displayedEntry.dateTitle}
            </h2>
          </div>

          <div data-career-detail-card-stack="desktop-primary" className="absolute left-[37%] top-[22%] w-[29%]">
            <div>
              <p
                data-career-detail-block="eyebrow"
                className="text-[0.74rem] font-semibold uppercase tracking-[0.24em] text-[#7f6853]"
              >
                {displayedEntry.eyebrow}
              </p>
              <h3 className="mt-3 max-w-[24ch] font-serif text-[clamp(1.8rem,2vw,2.2rem)] leading-none tracking-[-0.04em] text-[#251c15]">
                {displayedEntry.headline}
              </h3>
              <p
                data-career-detail-block="body"
                className="mt-4 text-[0.92rem] leading-[1.5] text-[#322720]"
              >
                {displayedEntry.body}
              </p>
            </div>
          </div>

          <div
            data-career-detail-card-stack="desktop-secondary"
            className="absolute left-[37%] top-[63%] w-[29%]"
          >
            <div>
              <h4 className="font-serif text-[clamp(1.6rem,1.8vw,2rem)] leading-none tracking-[-0.04em] text-[#261d16]">
                {displayedEntry.supportingTitle}
              </h4>
              <p className="mt-3 text-[0.9rem] leading-[1.5] text-[#342821]">
                {displayedEntry.supportingBody}
              </p>
            </div>
          </div>

          <aside
            data-career-detail-aside="desktop"
            className={joinClasses(
              'absolute',
              CAREER_DETAIL_DESKTOP_ASIDE_LAYOUT.left,
              CAREER_DETAIL_DESKTOP_ASIDE_LAYOUT.top,
              CAREER_DETAIL_DESKTOP_ASIDE_LAYOUT.height,
              CAREER_DETAIL_DESKTOP_ASIDE_LAYOUT.width,
            )}
          >
            <img
              src={selectedCategory.asideImageSrc}
              alt="Archipelago survey reference card"
              draggable={false}
              className="block h-auto w-full"
              style={CAREER_DETAIL_ARCHIVE_CARD_IMAGE_STYLE}
            />
          </aside>
        </div>
      </div>

      <div
        data-career-detail-cta-visible={shouldShowPageSwitchCta ? 'true' : 'false'}
        className={joinClasses(
          CAREER_DETAIL_PAGE_SWITCH_LAYOUT.wrapperBase,
          CAREER_DETAIL_PAGE_SWITCH_LAYOUT.position,
        )}
      >
        <div className="relative">
          <div
            data-career-detail-cta-hint="page-switch"
            data-career-detail-cta-hint-visible={shouldShowPageSwitchHint ? 'true' : 'false'}
            aria-hidden="true"
            className={joinClasses(
              CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT.wrapper,
              shouldShowPageSwitchHint ? 'opacity-100' : 'opacity-0',
            )}
          >
            <div
              className={joinClasses(
                CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT.textBox,
                CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT.textOffset,
              )}
            >
              <p className="font-['Caveat','Dancing_Script',cursive] text-[1.6rem] leading-[0.92] tracking-[0.01em] text-[rgba(109,75,53,0.88)] drop-shadow-[0_1px_0_rgba(255,248,236,0.8)]">
                {CAREER_DETAIL_PAGE_SWITCH_HINT_COPY}
              </p>
            </div>
            <svg
              data-career-detail-cta-hint-arrow="page-switch"
              viewBox="0 0 124 84"
              className={joinClasses(
                CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT.arrowSize,
                CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT.arrowOffset,
                'overflow-visible',
              )}
            >
              <defs>
                <marker
                  id="career-detail-cta-hint-arrowhead"
                  data-career-detail-cta-hint-arrowhead="page-switch"
                  markerWidth="9"
                  markerHeight="9"
                  refX="7.2"
                  refY="4.5"
                  orient="auto"
                  markerUnits="strokeWidth"
                >
                  <path
                    d="M 0 0 L 9 4.5 L 0 9 L 2.4 4.5 z"
                    fill="rgba(117,84,60,0.78)"
                    stroke="rgba(117,84,60,0.78)"
                    strokeWidth="0.4"
                  />
                </marker>
              </defs>
              <path
                d={CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT.arrowPath}
                fill="none"
                stroke="rgba(117,84,60,0.72)"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeDasharray="6 8"
                markerEnd="url(#career-detail-cta-hint-arrowhead)"
              />
            </svg>
          </div>

          <button
            type="button"
            data-career-detail-cta="page-switch"
            aria-label="Open works lobby section"
            disabled={!shouldShowPageSwitchCta}
            tabIndex={shouldShowPageSwitchCta ? 0 : -1}
            className={joinClasses(
              CAREER_DETAIL_PAGE_SWITCH_LAYOUT.buttonBase,
              CAREER_DETAIL_PAGE_SWITCH_LAYOUT.size,
              shouldShowPageSwitchCta
                ? 'pointer-events-auto opacity-100'
                : 'pointer-events-none opacity-0',
            )}
            onClick={handlePageSwitchClick}
            onMouseEnter={() => setIsPageSwitchHintHovered(true)}
            onMouseLeave={() => setIsPageSwitchHintHovered(false)}
            onFocus={() => setIsPageSwitchHintHovered(true)}
            onBlur={() => setIsPageSwitchHintHovered(false)}
          >
            <img
              src={CAREER_DETAIL_ASSETS.pageSwitch}
              alt=""
              aria-hidden="true"
              className={CAREER_DETAIL_PAGE_SWITCH_LAYOUT.image}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
