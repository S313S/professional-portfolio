import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import gsap from 'gsap';

import { personalData, type CodingCategoryId } from '../data';
import {
  closeWorksDetailView,
  getWorksDetailActivationState,
  getWorksDetailCompletionState,
  getWorksDetailDetailModeResetState,
  getWorksDetailPinnedScrollY,
  getWorksDetailProjectSelectionState,
  getWorksDetailSceneNavigationState,
  getWorksDetailVisualState,
  getWorksDetailWheelBufferState,
  shouldCaptureWorksDetailWheel,
  getWorksDetailWheelState,
  isWorksDetailContentInteractive,
  openWorksDetailCodingView,
  openWorksDetailDesignView,
  shouldLockWorksDetailScroll,
  WORKS_DETAIL_LOADING_FALLBACK_MS,
  WORKS_DETAIL_LOADING_SRC,
  WORKS_DETAIL_REVEAL_IMAGE_SRC,
  WORKS_DETAIL_RETURN_TO_LOBBY_EVENT,
  WORKS_DETAIL_TRANSITION_START_EVENT,
  type WorksDetailDetailMode,
  type WorksDetailPhase,
  type WorksDetailScene,
  type WorksDetailView,
} from './WorksDetailSection.logic';

const TOUCH_STEP_TOLERANCE_PX = 4;
const WORKS_DETAIL_REVEAL_STEP = 0.18;
const WORKS_DETAIL_WHEEL_THRESHOLD_PX = 30;
const WORKS_DETAIL_WHEEL_UNIT_DELTA = 120;
const WORKS_DETAIL_LEFT_BUTTON_SRC = '/images/workDetail_left_icon.png.png';
const WORKS_DETAIL_RIGHT_BUTTON_SRC = '/images/workDetail_rigtht_icon.png';
const WORKS_DETAIL_STAGE_BACKGROUND_SRC = '';
const WORKS_DETAIL_CODING_BACKGROUND_SRC = '/images/careerDetail_bg.png';
const WORKS_DETAIL_CODING_STAGE_BACKGROUND_SRC = '/images/career_bg.png';
const WORKS_DETAIL_STAGE_SOCIALS = ['f', 't', '▶'] as const;
const WORKS_DETAIL_CARD_LABEL_OFFSET = 4;
const WORKS_DETAIL_VISIBLE_SLOT_COUNT = 5;
const WORKS_DETAIL_ACTIVE_SLOT_INDEX = 3;
const WORKS_DETAIL_DEFAULT_ACTIVE_INDEX = Math.max(personalData.featuredWorks.length - 2, 0);
const WORKS_DETAIL_DEFAULT_CODING_CATEGORY_ID: CodingCategoryId =
  personalData.codingCategories[0]?.id ?? 'workflow';
const WORKS_DETAIL_CODING_DRAG_THRESHOLD_PX = 56;
type WorksDetailCustomProperties = CSSProperties & Record<`--${string}`, string>;

interface WorksDetailGallerySlotLayout {
  x: string;
  y: string;
  scale: number;
  opacity: number;
  grayscale: number;
  brightness: number;
  boxShadow?: string;
}

interface WorksDetailCodingCategoryCardLayout {
  offsetX: string;
  offsetY: string;
  rotate: string;
  scale: string;
  opacity: string;
  zIndex: string;
}

// 图二位置参数总控区：
// 1. `stage` 控制背景虚线网格原点偏移。
// 2. `track` 控制中间两条亮虚线和整条 45° corridor 的位置尺寸。
// 3. `slots` 按顺序控制 5 张菱形卡片的位置与明暗。
// 之后只需要改这里，不需要再去 CSS 里找具体选择器。
const WORKS_DETAIL_GALLERY_LAYOUT = {
  stage: {
    '--works-detail-grid-offset-x': '-130px',
    '--works-detail-grid-offset-y': '-130px',
    '--works-detail-projects-offset-x': '2.7rem',
    '--works-detail-projects-offset-y': '4.9rem',
  },
  track: {
    '--works-detail-track-top': '-9.1%',
    '--works-detail-track-height': '34rem',
  },
  corridor: {
    '--works-detail-corridor-center-y': '50%',
    '--works-detail-corridor-width': 'min(88rem, 170vw)',
    '--works-detail-corridor-band-height': '15.5rem',
    '--works-detail-corridor-rail-offset': '8.75rem',
  },
  slots: [
    {
      x: '-37.5rem',
      y: '33.7rem',
      scale: 1.04,
      opacity: 0.3,
      grayscale: 0.62,
      brightness: 0.42,
    },
    {
      x: '-26.5rem',
      y: '22.7rem',
      scale: 1.04,
      opacity: 0.34,
      grayscale: 0.54,
      brightness: 0.48,
    },
    {
      x: '-15.5rem',
      y: '11.7rem',
      scale: 1.04,
      opacity: 0.38,
      grayscale: 0.52,
      brightness: 0.44,
    },
    {
      x: '-4.5rem',
      y: '0.7rem',
      scale: 1.04,
      opacity: 0.94,
      grayscale: 0.08,
      brightness: 0.92,
      boxShadow: '0 26px 64px rgba(0, 0, 0, 0.38)',
    },
    {
      x: '6.5rem',
      y: '-10.3rem',
      scale: 1.04,
      opacity: 0.32,
      grayscale: 0.6,
      brightness: 0.42,
    },
  ],
} as const satisfies {
  stage: Record<string, string>;
  track: Record<string, string>;
  corridor: Record<string, string>;
  slots: readonly WorksDetailGallerySlotLayout[];
};

// 图标按钮手调区：
// 1. `iconSizeClassName` 控制图标本体大小。
// 2. `buttonSpacingClassName` 控制图标和上方文案之间的基础间距。
// 3. `buttonOffsetClassName` 用来做最终的上下微调。
//    - `translate-y-[8px]` 表示整体下移 8px
//    - `-translate-y-[6px]` 表示整体上移 6px
const WORKS_DETAIL_BUTTON_LAYOUT = {
  left: {
    buttonOffsetClassName: 'translate-y-[-45px]',
    buttonSpacingClassName: 'mt-5 sm:mt-6',
    iconSizeClassName: 'h-[2.1rem] w-[2.1rem] sm:h-[2.5rem] sm:w-[2.5rem] md:h-[3rem] md:w-[3rem]',
  },
  right: {
    buttonOffsetClassName: 'translate-y-[-45px]',
    buttonSpacingClassName: 'mt-5 sm:mt-6',
    iconSizeClassName: 'h-[2.1rem] w-[2.1rem] sm:h-[2.5rem] sm:w-[2.5rem] md:h-[3rem] md:w-[3rem]',
  },
} as const;

// Coding 页手调区：
// 1. `projects['--works-detail-coding-projects-offset-y']` 控制整组卡片详情区域的上下位置。
// 2. `projects['--works-detail-coding-projects-max-width']` 控制这 6 张项目卡片区域的整体最大宽度。
// 3. `projects['--works-detail-coding-projects-padding-inline']` 控制左右留白，数值越大越往中间收。
// 4. `projects['--works-detail-coding-projects-gap']` 控制每张卡片之间的横向/纵向间距。
// 5. 想整体下移就把 `offset-y` 数值调大，比如 `20px -> 40px`。
const WORKS_DETAIL_CODING_LAYOUT = {
  projects: {
    '--works-detail-coding-projects-offset-y': '220px',
    '--works-detail-coding-projects-max-width': '71rem',
    '--works-detail-coding-projects-padding-inline': '1.25rem',
    '--works-detail-coding-projects-gap': '1.25rem',
  },
} as const satisfies {
  projects: Record<string, string>;
};

interface WorksDetailSectionProps {
  initialPhase?: WorksDetailPhase;
  initialTransitionProgress?: number;
  initialView?: WorksDetailView;
  initialDetailMode?: WorksDetailDetailMode;
}

function clampProjectIndex(nextProjectIndex: number) {
  if (personalData.featuredWorks.length === 0) {
    return 0;
  }

  return Math.min(
    Math.max(nextProjectIndex, 0),
    personalData.featuredWorks.length - 1,
  );
}

function getProjectLabel(index: number) {
  return String(index + WORKS_DETAIL_CARD_LABEL_OFFSET).padStart(2, '0');
}

function getCodingCategoryIndex(categoryId: CodingCategoryId) {
  const categoryIndex = personalData.codingCategories.findIndex((category) => category.id === categoryId);
  return categoryIndex >= 0 ? categoryIndex : 0;
}

function getCodingCategoryCardLayout(
  categoryId: CodingCategoryId,
  activeCategoryId: CodingCategoryId,
): WorksDetailCodingCategoryCardLayout {
  const offset = getCodingCategoryIndex(categoryId) - getCodingCategoryIndex(activeCategoryId);
  const distance = Math.abs(offset);

  return {
    offsetX: `${offset * 1.8}rem`,
    offsetY: `${distance * 0.9}rem`,
    rotate: `${offset * -4}deg`,
    scale: String(Math.max(0.86, 1 - distance * 0.06)),
    opacity: String(Math.max(0.66, 1 - distance * 0.12)),
    zIndex: String(30 - distance * 10),
  };
}

function getCodingCategoryCardStyle(
  categoryId: CodingCategoryId,
  activeCategoryId: CodingCategoryId,
  accent: string,
): WorksDetailCustomProperties {
  const layout = getCodingCategoryCardLayout(categoryId, activeCategoryId);

  return {
    '--works-detail-coding-card-offset-x': layout.offsetX,
    '--works-detail-coding-card-offset-y': layout.offsetY,
    '--works-detail-coding-card-rotate': layout.rotate,
    '--works-detail-coding-card-scale': layout.scale,
    '--works-detail-coding-card-opacity': layout.opacity,
    '--works-detail-coding-card-z-index': layout.zIndex,
    '--works-detail-coding-card-accent': accent,
  };
}

function getGallerySlots(activeProjectIndex: number) {
  return Array.from({ length: WORKS_DETAIL_VISIBLE_SLOT_COUNT }, (_, slotIndex) => {
    const projectIndex = activeProjectIndex + slotIndex - WORKS_DETAIL_ACTIVE_SLOT_INDEX;
    const project = personalData.featuredWorks[projectIndex] ?? null;

    return {
      slotIndex,
      projectIndex,
      project,
      label: project ? getProjectLabel(projectIndex) : '',
      isActive: projectIndex === activeProjectIndex && project !== null,
      visibility: projectIndex === activeProjectIndex ? 'active' : 'preview',
    };
  });
}

function getGalleryTrackStyle(): WorksDetailCustomProperties {
  return WORKS_DETAIL_GALLERY_LAYOUT.track as WorksDetailCustomProperties;
}

function getGalleryCorridorStyle(): WorksDetailCustomProperties {
  return WORKS_DETAIL_GALLERY_LAYOUT.corridor as WorksDetailCustomProperties;
}

function getGalleryStageStyle(): WorksDetailCustomProperties {
  return WORKS_DETAIL_GALLERY_LAYOUT.stage as WorksDetailCustomProperties;
}

function getCodingProjectsGridStyle(): WorksDetailCustomProperties {
  return WORKS_DETAIL_CODING_LAYOUT.projects as WorksDetailCustomProperties;
}

function getGallerySlotStyle(slotIndex: number, backgroundImage?: string): WorksDetailCustomProperties {
  const slotLayout: WorksDetailGallerySlotLayout =
    WORKS_DETAIL_GALLERY_LAYOUT.slots[slotIndex] ?? WORKS_DETAIL_GALLERY_LAYOUT.slots[0];
  const slotStyle: WorksDetailCustomProperties = {
    '--works-detail-slot-x': slotLayout.x,
    '--works-detail-slot-y': slotLayout.y,
    '--works-detail-slot-scale': String(slotLayout.scale),
    '--works-detail-slot-opacity': String(slotLayout.opacity),
    '--works-detail-slot-grayscale': String(slotLayout.grayscale),
    '--works-detail-slot-brightness': String(slotLayout.brightness),
  };

  if (slotLayout.boxShadow) {
    slotStyle['--works-detail-slot-box-shadow'] = slotLayout.boxShadow;
  }

  if (backgroundImage) {
    slotStyle.backgroundImage = `url(${backgroundImage})`;
  }

  return slotStyle;
}

export default function WorksDetailSection({
  initialPhase = 'idle',
  initialTransitionProgress = 0,
  initialView = 'entry',
  initialDetailMode = 'design',
}: WorksDetailSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const phaseRef = useRef<WorksDetailPhase>(initialPhase);
  const viewRef = useRef<WorksDetailView>(initialView);
  const detailModeRef = useRef<WorksDetailDetailMode>(initialDetailMode);
  const loadingTimeoutRef = useRef<number | null>(null);
  const wheelBufferRef = useRef(0);
  const sceneUnlockTimeoutRef = useRef<number | null>(null);
  const detailSceneRef = useRef<WorksDetailScene>('gallery');
  const activeProjectIndexRef = useRef(WORKS_DETAIL_DEFAULT_ACTIVE_INDEX);
  const activeCodingCategoryIdRef = useRef<CodingCategoryId>(WORKS_DETAIL_DEFAULT_CODING_CATEGORY_ID);
  const codingDragPointerIdRef = useRef<number | null>(null);
  const codingDragStartXRef = useRef<number | null>(null);

  const [phase, setPhase] = useState<WorksDetailPhase>(initialPhase);
  const [iframeKey, setIframeKey] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(initialTransitionProgress);
  const [view, setView] = useState<WorksDetailView>(initialView);
  const [detailMode, setDetailMode] = useState<WorksDetailDetailMode>(initialDetailMode);
  const [detailScene, setDetailScene] = useState<WorksDetailScene>('gallery');
  const [activeProjectIndex, setActiveProjectIndex] = useState(WORKS_DETAIL_DEFAULT_ACTIVE_INDEX);
  const [activeCodingCategoryId, setActiveCodingCategoryId] = useState<CodingCategoryId>(
    WORKS_DETAIL_DEFAULT_CODING_CATEGORY_ID,
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isTransitioningScene, setIsTransitioningScene] = useState(false);

  phaseRef.current = phase;
  viewRef.current = view;
  detailModeRef.current = detailMode;
  detailSceneRef.current = detailScene;
  activeProjectIndexRef.current = activeProjectIndex;
  activeCodingCategoryIdRef.current = activeCodingCategoryId;

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = null;
  };

  const clearSceneUnlockTimeout = () => {
    if (sceneUnlockTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(sceneUnlockTimeoutRef.current);
    sceneUnlockTimeoutRef.current = null;
  };

  const resetDetailState = () => {
    clearSceneUnlockTimeout();
    setIsTransitioningScene(false);
    setDetailScene('gallery');
    setActiveProjectIndex(WORKS_DETAIL_DEFAULT_ACTIVE_INDEX);
  };

  const resetCodingState = () => {
    setActiveCodingCategoryId(WORKS_DETAIL_DEFAULT_CODING_CATEGORY_ID);
    codingDragPointerIdRef.current = null;
    codingDragStartXRef.current = null;
  };

  const resetDetailMode = () => {
    setDetailMode(getWorksDetailDetailModeResetState(detailModeRef.current).nextDetailMode);
  };

  const scheduleSceneUnlock = () => {
    clearSceneUnlockTimeout();

    if (prefersReducedMotion || isMobile) {
      setIsTransitioningScene(false);
      return;
    }

    sceneUnlockTimeoutRef.current = window.setTimeout(() => {
      setIsTransitioningScene(false);
    }, 720);
  };

  const commitDetailState = (nextScene: WorksDetailScene, nextProjectIndex: number) => {
    setDetailScene(nextScene);
    setActiveProjectIndex(clampProjectIndex(nextProjectIndex));
  };

  const transitionDetailState = (nextScene: WorksDetailScene, nextProjectIndex: number) => {
    const safeProjectIndex = clampProjectIndex(nextProjectIndex);

    if (
      detailSceneRef.current === nextScene &&
      activeProjectIndexRef.current === safeProjectIndex
    ) {
      return;
    }

    setIsTransitioningScene(true);
    commitDetailState(nextScene, safeProjectIndex);
    scheduleSceneUnlock();
  };

  const completeLoading = () => {
    const completionState = getWorksDetailCompletionState();
    const section = sectionRef.current;

    clearLoadingTimeout();
    wheelBufferRef.current = 0;
    resetDetailState();
    resetCodingState();
    resetDetailMode();
    setPhase(completionState.nextPhase);
    setTransitionProgress(completionState.nextTransitionProgress);

    if (!section) {
      return;
    }

    window.scrollTo({
      top: getWorksDetailPinnedScrollY(section.getBoundingClientRect().top + window.scrollY),
      behavior: 'auto',
    });
  };

  const visualState = useMemo(
    () => getWorksDetailVisualState(phase, transitionProgress),
    [phase, transitionProgress],
  );
  const contentOpacity =
    phase === 'settled' ? 1 : phase === 'revealing' ? Math.min(transitionProgress * 1.35, 1) : 0;
  const isContentInteractive = isWorksDetailContentInteractive(phase, transitionProgress);

  const activeProject = personalData.featuredWorks[activeProjectIndex] ?? personalData.featuredWorks[0];
  const previousProject =
    activeProjectIndex > 0 ? personalData.featuredWorks[activeProjectIndex - 1] : null;
  const nextProject =
    activeProjectIndex < personalData.featuredWorks.length - 1
      ? personalData.featuredWorks[activeProjectIndex + 1]
      : null;
  const gallerySlots = getGallerySlots(activeProjectIndex);
  const activeCodingCategory =
    personalData.codingCategories.find((category) => category.id === activeCodingCategoryId) ??
    personalData.codingCategories[0];
  const activeCodingProjects =
    personalData.codingProjects[activeCodingCategoryId]?.slice(0, 6) ?? [];
  const backgroundImageSrc =
    view === 'detail' && detailMode === 'coding'
      ? WORKS_DETAIL_CODING_BACKGROUND_SRC
      : WORKS_DETAIL_REVEAL_IMAGE_SRC;

  const exitToLobby = () => {
    clearLoadingTimeout();
    clearSceneUnlockTimeout();
    wheelBufferRef.current = 0;
    setPhase('idle');
    setTransitionProgress(0);
    setView('entry');
    resetDetailState();
    resetCodingState();
    resetDetailMode();
    window.dispatchEvent(new Event(WORKS_DETAIL_RETURN_TO_LOBBY_EVENT));
  };

  const restartLoading = (scrollToTop = false) => {
    const activationState = getWorksDetailActivationState(iframeKey);

    clearLoadingTimeout();
    wheelBufferRef.current = 0;
    resetDetailState();
    resetCodingState();
    resetDetailMode();
    setPhase(activationState.nextPhase);
    setIframeKey(activationState.nextCycleKey);
    setTransitionProgress(activationState.nextTransitionProgress);
    setView('entry');

    if (scrollToTop) {
      const section = sectionRef.current;
      if (!section) {
        return;
      }

      const targetY = getWorksDetailPinnedScrollY(section.getBoundingClientRect().top + window.scrollY);
      window.scrollTo({
        top: targetY,
        behavior: 'auto',
      });
    }
  };

  useEffect(() => {
    const handleStart = () => {
      restartLoading(false);
    };

    window.addEventListener(WORKS_DETAIL_TRANSITION_START_EVENT, handleStart);

    return () => {
      window.removeEventListener(WORKS_DETAIL_TRANSITION_START_EVENT, handleStart);
    };
  }, [iframeKey]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data !== 'detail-work-loading:completed' || phaseRef.current !== 'loading') {
        return;
      }

      completeLoading();
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  useEffect(() => {
    if (phase !== 'loading') {
      clearLoadingTimeout();
      return undefined;
    }

    loadingTimeoutRef.current = window.setTimeout(() => {
      if (phaseRef.current !== 'loading') {
        return;
      }

      completeLoading();
    }, WORKS_DETAIL_LOADING_FALLBACK_MS);

    return () => {
      clearLoadingTimeout();
    };
  }, [phase, iframeKey]);

  useEffect(() => {
    if (phase === 'idle') {
      return undefined;
    }

    const html = document.documentElement;
    const body = document.body;
    const previousHtmlOverscrollBehavior = html.style.overscrollBehavior;
    const previousBodyOverscrollBehavior = body.style.overscrollBehavior;

    html.style.overscrollBehavior = 'none';
    body.style.overscrollBehavior = 'none';

    return () => {
      html.style.overscrollBehavior = previousHtmlOverscrollBehavior;
      body.style.overscrollBehavior = previousBodyOverscrollBehavior;
    };
  }, [phase]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const reducedMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileMedia = window.matchMedia('(max-width: 767px)');

    const updateMediaState = () => {
      setPrefersReducedMotion(reducedMotionMedia.matches);
      setIsMobile(mobileMedia.matches);
    };

    updateMediaState();
    reducedMotionMedia.addEventListener('change', updateMediaState);
    mobileMedia.addEventListener('change', updateMediaState);

    return () => {
      reducedMotionMedia.removeEventListener('change', updateMediaState);
      mobileMedia.removeEventListener('change', updateMediaState);
    };
  }, []);

  useEffect(() => {
    if (
      view !== 'detail' ||
      phase !== 'settled' ||
      prefersReducedMotion ||
      !stageRef.current
    ) {
      return undefined;
    }

    const context = gsap.context(() => {
      if (detailMode === 'coding') {
        gsap.fromTo(
          '[data-coding-animate="stack"] > *',
          { autoAlpha: 0, y: 20, rotate: -4 },
          { autoAlpha: 1, y: 0, rotate: 0, duration: 0.56, ease: 'power3.out', stagger: 0.08 },
        );
        gsap.fromTo(
          '[data-coding-animate="copy"] > *',
          { autoAlpha: 0, x: 24 },
          { autoAlpha: 1, x: 0, duration: 0.58, ease: 'power3.out', stagger: 0.06 },
        );
        gsap.fromTo(
          '[data-coding-animate="projects"] > *',
          { autoAlpha: 0, y: 28 },
          { autoAlpha: 1, y: 0, duration: 0.62, ease: 'power3.out', stagger: 0.05 },
        );
      }

      if (detailMode === 'design' && detailScene === 'gallery') {
        if (trackRef.current) {
          gsap.to(trackRef.current, {
            x: 0,
            y: 0,
            duration: 0.68,
            ease: 'power3.out',
            overwrite: 'auto',
          });
        }

        gsap.fromTo(
          '[data-gallery-animate="title"]',
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.52, ease: 'power3.out', stagger: 0.06 },
        );
        gsap.fromTo(
          '[data-gallery-animate="subtitle"]',
          { autoAlpha: 0, x: -24 },
          { autoAlpha: 1, x: 0, duration: 0.56, ease: 'power3.out' },
        );
        gsap.fromTo(
          '[data-gallery-animate="pager"]',
          { autoAlpha: 0.42, scaleY: 0.8, transformOrigin: 'center bottom' },
          {
            autoAlpha: 1,
            scaleY: 1,
            duration: 0.48,
            ease: 'power3.out',
            stagger: 0.03,
          },
        );
      }

      if (detailMode === 'design' && detailScene === 'project') {
        gsap.fromTo(
          '[data-project-animate="media"]',
          { autoAlpha: 0, scale: 0.92, y: 28 },
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.72, ease: 'power3.out' },
        );
        gsap.fromTo(
          '[data-project-animate="meta"] > *',
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.62, ease: 'power3.out', stagger: 0.08 },
        );
      }
    }, stageRef);

    return () => {
      context.revert();
    };
  }, [activeCodingCategoryId, activeProjectIndex, detailMode, detailScene, phase, prefersReducedMotion, view]);

  useEffect(() => {
    return () => {
      clearLoadingTimeout();
      clearSceneUnlockTimeout();
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      const currentPhase = phaseRef.current;
      const currentView = viewRef.current;
      const currentDetailMode = detailModeRef.current;

      if (
        !shouldLockWorksDetailScroll({
          phase: currentPhase,
          scrollY: window.scrollY,
          sectionTop: 0,
          sectionHeight: 1,
        })
      ) {
        wheelBufferRef.current = 0;
        return;
      }

      if (
        !shouldCaptureWorksDetailWheel({
          phase: currentPhase,
          view: currentView,
          detailMode: currentDetailMode,
        })
      ) {
        wheelBufferRef.current = 0;
        return;
      }

      event.preventDefault();

      if (currentPhase === 'loading') {
        wheelBufferRef.current = 0;
        return;
      }

      if (currentView === 'detail') {
        if (isMobile || isTransitioningScene) {
          return;
        }

        const wheelBufferState = getWorksDetailWheelBufferState({
          buffer: wheelBufferRef.current,
          deltaY: event.deltaY,
          threshold: WORKS_DETAIL_WHEEL_THRESHOLD_PX,
        });
        wheelBufferRef.current = wheelBufferState.nextBuffer;

        if (wheelBufferState.consumedSteps === 0 || wheelBufferState.direction === 0) {
          return;
        }

        const navigationState = getWorksDetailSceneNavigationState({
          scene: detailSceneRef.current,
          activeProjectIndex: activeProjectIndexRef.current,
          direction: wheelBufferState.direction > 0 ? 'next' : 'previous',
          projectCount: personalData.featuredWorks.length,
        });

        if (navigationState.shouldCloseDetail) {
          resetDetailState();
          setView((currentViewState) => closeWorksDetailView(currentViewState));
          return;
        }

        transitionDetailState(
          navigationState.nextScene,
          navigationState.nextProjectIndex,
        );
        return;
      }

      const wheelBufferState = getWorksDetailWheelBufferState({
        buffer: wheelBufferRef.current,
        deltaY: event.deltaY,
        threshold: WORKS_DETAIL_WHEEL_THRESHOLD_PX,
      });
      wheelBufferRef.current = wheelBufferState.nextBuffer;

      if (wheelBufferState.consumedSteps === 0 || wheelBufferState.direction === 0) {
        return;
      }

      const wheelState = getWorksDetailWheelState({
        phase: currentPhase,
        transitionProgress,
        deltaY:
          wheelBufferState.direction * wheelBufferState.consumedSteps * WORKS_DETAIL_WHEEL_UNIT_DELTA,
        step: WORKS_DETAIL_REVEAL_STEP,
      });

      if (wheelState.shouldExitToLobby) {
        exitToLobby();
        return;
      }

      setTransitionProgress(wheelState.nextTransitionProgress);
      if (currentPhase !== wheelState.nextPhase) {
        setPhase(wheelState.nextPhase);
      }
    };

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (
        !shouldLockWorksDetailScroll({
          phase: phaseRef.current,
          scrollY: window.scrollY,
          sectionTop: 0,
          sectionHeight: 1,
        })
      ) {
        return;
      }

      if (viewRef.current === 'detail') {
        return;
      }

      const startY = touchStartYRef.current;
      const currentY = event.touches[0]?.clientY;
      if (startY === null || currentY === undefined) {
        return;
      }

      if (Math.abs(currentY - startY) < TOUCH_STEP_TOLERANCE_PX) {
        return;
      }

      const wheelState = getWorksDetailWheelState({
        phase: phaseRef.current,
        transitionProgress,
        deltaY: startY - currentY,
        step: WORKS_DETAIL_REVEAL_STEP,
      });

      if (!wheelState.shouldPreventScroll) {
        return;
      }

      event.preventDefault();

      if (wheelState.shouldExitToLobby) {
        exitToLobby();
        return;
      }

      setTransitionProgress(wheelState.nextTransitionProgress);
      if (phaseRef.current !== wheelState.nextPhase) {
        setPhase(wheelState.nextPhase);
      }
      touchStartYRef.current = currentY;
    };

    const resetTouch = () => {
      touchStartYRef.current = null;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', resetTouch, { passive: true });
    window.addEventListener('touchcancel', resetTouch, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', resetTouch);
      window.removeEventListener('touchcancel', resetTouch);
    };
  }, [isMobile, isTransitioningScene, transitionProgress, iframeKey]);

  const handleEnterDesignDetailView = () => {
    if (!isContentInteractive) {
      return;
    }

    wheelBufferRef.current = 0;
    resetDetailState();
    resetCodingState();
    const openState = openWorksDetailDesignView(viewRef.current);
    setDetailMode(openState.nextDetailMode);
    setView(openState.nextView);
  };

  const handleEnterCodingDetailView = () => {
    if (!isContentInteractive) {
      return;
    }

    wheelBufferRef.current = 0;
    resetDetailState();
    resetCodingState();
    const openState = openWorksDetailCodingView(viewRef.current);
    setDetailMode(openState.nextDetailMode);
    setView(openState.nextView);
  };

  const handleCloseDetailView = () => {
    wheelBufferRef.current = 0;

    if (detailModeRef.current === 'coding') {
      resetCodingState();
      resetDetailMode();
      setView((currentView) => closeWorksDetailView(currentView));
      return;
    }

    if (detailSceneRef.current === 'project') {
      transitionDetailState('gallery', activeProjectIndexRef.current);
      return;
    }

    resetDetailState();
    resetCodingState();
    resetDetailMode();
    setView((currentView) => closeWorksDetailView(currentView));
  };

  const handleProjectSelection = (nextProjectIndex: number) => {
    if (isTransitioningScene) {
      return;
    }

    const selectionState = getWorksDetailProjectSelectionState({
      activeProjectIndex: activeProjectIndexRef.current,
      nextProjectIndex,
      projectCount: personalData.featuredWorks.length,
    });

    transitionDetailState(selectionState.nextScene, selectionState.nextProjectIndex);
  };

  const handleProjectPreviewOpen = (nextProjectIndex: number) => {
    if (isTransitioningScene) {
      return;
    }

    transitionDetailState('project', clampProjectIndex(nextProjectIndex));
  };

  const handleCodingCategorySelection = (categoryId: CodingCategoryId) => {
    setActiveCodingCategoryId(categoryId);
  };

  const handleCodingCategoryShift = (direction: 'next' | 'previous') => {
    const currentIndex = getCodingCategoryIndex(activeCodingCategoryIdRef.current);
    const nextIndex =
      direction === 'next'
        ? Math.min(currentIndex + 1, personalData.codingCategories.length - 1)
        : Math.max(currentIndex - 1, 0);

    setActiveCodingCategoryId(personalData.codingCategories[nextIndex]?.id ?? WORKS_DETAIL_DEFAULT_CODING_CATEGORY_ID);
  };

  const handleCodingDragStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    codingDragPointerIdRef.current = event.pointerId;
    codingDragStartXRef.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCodingDragMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (
      codingDragPointerIdRef.current !== event.pointerId ||
      codingDragStartXRef.current === null
    ) {
      return;
    }

    const deltaX = event.clientX - codingDragStartXRef.current;
    if (Math.abs(deltaX) < WORKS_DETAIL_CODING_DRAG_THRESHOLD_PX) {
      return;
    }

    handleCodingCategoryShift(deltaX < 0 ? 'next' : 'previous');
    codingDragStartXRef.current = event.clientX;
  };

  const handleCodingDragEnd = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (codingDragPointerIdRef.current === event.pointerId) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    codingDragPointerIdRef.current = null;
    codingDragStartXRef.current = null;
  };

  return (
    <section
      ref={sectionRef}
      id="works-detail-section"
      aria-labelledby="works-detail-title"
      data-works-detail-stage="transition"
      data-works-detail-phase={phase}
      data-works-detail-view={view}
      data-works-detail-detail-mode={detailMode}
      data-works-detail-loading-src={WORKS_DETAIL_LOADING_SRC}
      className="relative h-px bg-black text-[#f5efe6]"
    >
      <h2 id="works-detail-title" className="sr-only">
        Work detail loading transition
      </h2>

      <div
        className={`fixed inset-0 z-50 overflow-hidden bg-black transition-opacity duration-200 ${phase === 'idle' ? 'pointer-events-none opacity-0' : 'pointer-events-auto opacity-100'}`}
      >
        <div
          aria-hidden="true"
          data-works-detail-layer="background"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            opacity: visualState.backgroundOpacity,
            backgroundImage: `url(${backgroundImageSrc})`,
            transform: `scale(${visualState.backgroundScale})`,
          }}
        />

        <div
          data-works-detail-layer="content"
          className={
            view === 'detail'
              ? 'absolute inset-0 flex items-center justify-center'
              : 'absolute inset-0 flex items-center justify-center px-4 sm:px-8'
          }
          style={{
            opacity: contentOpacity,
            pointerEvents: isContentInteractive ? 'auto' : 'none',
          }}
        >
          {view === 'detail' ? (
            detailMode === 'coding' ? (
              <div
                ref={stageRef}
                data-works-detail-view="detail"
                data-works-detail-detail-mode="coding"
                className="works-detail-stage works-detail-stage--coding relative flex h-full w-full flex-col overflow-hidden px-5 pt-6 pb-10 text-[#f8ebdb] sm:px-8 sm:pt-8 sm:pb-12"
              >
                <div
                  aria-hidden="true"
                  className="works-detail-stage__background"
                  style={{ backgroundImage: `url(${WORKS_DETAIL_CODING_STAGE_BACKGROUND_SRC})` }}
                />
                <div aria-hidden="true" className="works-detail-stage__overlay works-detail-stage__overlay--coding" />
                <div aria-hidden="true" className="works-detail-stage__vignette" />
                <div aria-hidden="true" className="works-detail-stage__noise" />

                <div className="works-detail-scene-shell">
                  <section
                    data-detail-scene-panel="coding"
                    data-scene-active="true"
                    className="works-detail-coding__panel works-detail-scene"
                  >
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <span className="works-detail-stage__tag">Coding Detail</span>
                      <button
                        type="button"
                        aria-label="Close work detail"
                        className="works-detail-stage__close"
                        onClick={handleCloseDetailView}
                      >
                        <span aria-hidden="true">Close</span>
                      </button>
                    </div>

                    <div className="works-detail-coding__hero">
                      <div className="works-detail-coding__stack-shell">
                        <div
                          className="works-detail-coding__stack"
                          data-coding-animate="stack"
                        >
                          {personalData.codingCategories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              data-coding-category-card={category.id}
                              data-coding-category-card-draggable={
                                category.id === activeCodingCategory?.id ? 'true' : 'false'
                              }
                              data-active={category.id === activeCodingCategory?.id}
                              className="works-detail-coding__category-card"
                              style={getCodingCategoryCardStyle(
                                category.id,
                                activeCodingCategory?.id ?? WORKS_DETAIL_DEFAULT_CODING_CATEGORY_ID,
                                category.accent,
                              )}
                              onPointerDown={
                                category.id === activeCodingCategory?.id ? handleCodingDragStart : undefined
                              }
                              onPointerMove={
                                category.id === activeCodingCategory?.id ? handleCodingDragMove : undefined
                              }
                              onPointerUp={
                                category.id === activeCodingCategory?.id ? handleCodingDragEnd : undefined
                              }
                              onPointerCancel={
                                category.id === activeCodingCategory?.id ? handleCodingDragEnd : undefined
                              }
                              onClick={() => {
                                handleCodingCategorySelection(category.id);
                              }}
                            >
                              <span className="works-detail-coding__category-icon">{category.iconLabel}</span>
                              <span className="works-detail-coding__category-sequence">
                                {category.sequence}
                              </span>
                              <div className="works-detail-coding__category-copy">
                                <h3>{category.title}</h3>
                                <p>{category.description}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                        <div className="works-detail-coding__drag-pill" data-coding-card-drag-hint="true">
                          Drag card to browse
                        </div>
                      </div>

                      <div className="works-detail-coding__intro" data-coding-animate="copy">
                        <span className="works-detail-coding__intro-eyebrow">Current Category</span>
                        <h3 className="works-detail-coding__intro-title">
                          {activeCodingCategory?.title ?? 'Workflow'}
                        </h3>
                        <p className="works-detail-coding__intro-body">
                          {activeCodingCategory?.description ?? '\u00A0'}
                        </p>
                      </div>
                    </div>

                    <div
                      className="works-detail-coding__projects-grid"
                      data-coding-project-grid={activeCodingCategory?.id ?? WORKS_DETAIL_DEFAULT_CODING_CATEGORY_ID}
                      data-coding-animate="projects"
                      style={getCodingProjectsGridStyle()}
                    >
                      {activeCodingProjects.map((project) => (
                        <a
                          key={project.id}
                          href={project.link}
                          target="_blank"
                          rel="noreferrer"
                          className="works-detail-coding__project-card"
                          data-coding-project-card={project.id}
                        >
                          <div className="works-detail-coding__project-media">
                            <img
                              src={project.image}
                              alt={project.title}
                              className="works-detail-coding__project-image"
                            />
                          </div>
                          <div className="works-detail-coding__project-meta">
                            <h4 className="works-detail-coding__project-title">{project.title}</h4>
                            <p className="works-detail-coding__project-body">{project.description}</p>
                            <div className="works-detail-coding__project-tags">
                              {project.tags.map((tag) => (
                                <span key={tag} className="works-detail-coding__project-tag">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  </section>
                </div>
              </div>
            ) : (
              <div
                ref={stageRef}
                data-works-detail-view="detail"
                data-works-detail-detail-mode="design"
                data-works-detail-scene={detailScene}
                className="works-detail-stage relative flex h-full w-full flex-col overflow-hidden px-5 pt-6 pb-10 text-[#f8ebdb] sm:px-8 sm:pt-8 sm:pb-12"
                style={getGalleryStageStyle()}
              >
                <div
                  aria-hidden="true"
                  className="works-detail-stage__background"
                  style={{ backgroundImage: `url(${WORKS_DETAIL_STAGE_BACKGROUND_SRC})` }}
                />
                <div aria-hidden="true" className="works-detail-stage__overlay" />
                <div aria-hidden="true" className="works-detail-stage__vignette" />
                <div aria-hidden="true" className="works-detail-stage__noise" />
                <div aria-hidden="true" className="works-detail-stage__grid" />

                <div className="works-detail-scene-shell">
                  <section
                    data-detail-scene-panel="gallery"
                    data-scene-active={detailScene === 'gallery'}
                    className="works-detail-gallery__panel works-detail-scene"
                  >
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <span className="works-detail-stage__tag">Work Detail</span>
                      <button
                        type="button"
                        aria-label="Close work detail"
                        className="works-detail-stage__close"
                        onClick={handleCloseDetailView}
                      >
                        <span aria-hidden="true">Close</span>
                      </button>
                    </div>

                    <div className="works-detail-track__corridor-layer" style={getGalleryCorridorStyle()}>
                      <div className="works-detail-track__corridor works-detail-track__corridor--band" />
                      <div className="works-detail-track__corridor works-detail-track__corridor--top" />
                      <div className="works-detail-track__corridor works-detail-track__corridor--bottom" />
                    </div>

                    <div ref={trackRef} className="works-detail-track" style={getGalleryTrackStyle()}>
                      {gallerySlots.map((slot) => (
                        <button
                          key={`${slot.slotIndex}-${slot.project?.id ?? 'empty'}-${activeProjectIndex}`}
                          type="button"
                          className="works-detail-track__item"
                          data-slot={slot.slotIndex}
                          data-active={slot.isActive}
                          data-empty={slot.project === null}
                          data-visibility={slot.visibility}
                          style={getGallerySlotStyle(slot.slotIndex, slot.project?.image)}
                          aria-label={
                            slot.project
                              ? `Open ${slot.project.title} project`
                              : `Empty works detail slot ${slot.slotIndex + 1}`
                          }
                          onClick={() => {
                            if (!slot.project) {
                              return;
                            }

                            handleProjectPreviewOpen(slot.projectIndex);
                          }}
                          disabled={slot.project === null}
                        >
                          <div className="works-detail-track__shade" />
                          {slot.label ? <span className="works-detail-track__index">{slot.label}</span> : null}
                        </button>
                      ))}
                    </div>

                    <div className="works-detail-stage__projects">
                      <div
                        className="works-detail-stage__project works-detail-stage__project--left"
                        data-project-state="muted"
                      >
                        <p className="works-detail-stage__project-title" data-gallery-animate="title">
                          {previousProject?.title ?? '\u00A0'}
                        </p>
                        <p className="works-detail-stage__project-subtitle">
                          {previousProject?.subtitle ?? '\u00A0'}
                        </p>
                      </div>
                      <div
                        className="works-detail-stage__project works-detail-stage__project--center"
                        data-project-state="active"
                      >
                        <p className="works-detail-stage__project-title" data-gallery-animate="title">
                          {activeProject?.title ?? '\u00A0'}
                        </p>
                        <p
                          className="works-detail-stage__project-subtitle"
                          data-gallery-animate="subtitle"
                        >
                          {activeProject?.subtitle ?? '\u00A0'}
                        </p>
                      </div>
                      <div
                        className="works-detail-stage__project works-detail-stage__project--right"
                        data-project-state="muted"
                      >
                        <p className="works-detail-stage__project-title" data-gallery-animate="title">
                          {nextProject?.title ?? '\u00A0'}
                        </p>
                        <p className="works-detail-stage__project-subtitle">
                          {nextProject?.subtitle ?? '\u00A0'}
                        </p>
                      </div>
                    </div>

                    <div className="relative z-10 mt-auto flex flex-col gap-6">
                      <div className="works-detail-stage__footer" aria-hidden="true">
                        <div className="works-detail-stage__footer-left">
                          <span className="works-detail-stage__footer-line" />
                          <span className="works-detail-stage__brand">VisualMemory</span>
                        </div>
                        <div className="works-detail-stage__footer-center">
                          <div className="works-detail-stage__pager">
                            {personalData.featuredWorks.map((work, index) => (
                              <button
                                key={work.id}
                                type="button"
                                className={`works-detail-stage__pager-tick ${index === activeProjectIndex ? 'works-detail-stage__pager-tick--active' : ''}`}
                                data-gallery-animate="pager"
                                aria-label={`Show ${work.title}`}
                                onClick={() => {
                                  handleProjectSelection(index);
                                }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="works-detail-stage__footer-right">
                          <span className="works-detail-stage__socials">
                            {WORKS_DETAIL_STAGE_SOCIALS.join(' | ')}
                          </span>
                          <span className="works-detail-stage__credits">CREDITS</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section
                    data-detail-scene-panel="project"
                    data-scene-active={detailScene === 'project'}
                    className="works-detail-project__panel works-detail-scene"
                  >
                    <div className="relative z-10 flex items-start justify-between gap-4">
                      <span className="works-detail-stage__tag">Work Detail</span>
                      <button
                        type="button"
                        aria-label="Close work detail"
                        className="works-detail-stage__close"
                        onClick={handleCloseDetailView}
                      >
                        <span aria-hidden="true">Close</span>
                      </button>
                    </div>

                    <div className="works-detail-project__backdrop" />
                    <div className="works-detail-project__media" data-project-animate="media">
                      <img
                        src={activeProject?.image ?? WORKS_DETAIL_REVEAL_IMAGE_SRC}
                        alt={activeProject?.title ?? 'Selected project'}
                        className="works-detail-project__image"
                      />
                    </div>

                    <div className="works-detail-project__meta" data-project-animate="meta">
                      <span className="works-detail-project__eyebrow">
                        {activeProject?.eyebrow ?? 'Selected Work'}
                      </span>
                      <h3 className="works-detail-project__title">
                        {activeProject?.title ?? '\u00A0'}
                      </h3>
                      <p className="works-detail-project__body">
                        {activeProject?.description ?? '\u00A0'}
                      </p>
                    </div>
                  </section>
                </div>
              </div>
            )
          ) : (
            <div
              data-works-detail-view="entry"
              className="grid w-full max-w-[44rem] grid-cols-2 gap-6 pt-[12vh] text-[#2f2a1f] sm:max-w-[48rem] sm:gap-10 md:max-w-[52rem] md:gap-12"
            >
              <div className="flex flex-col items-end translate-y-[6px]">
                <div className="text-right leading-[0.86] text-[#2f2a1f]">
                  <p className="font-serif text-[3.2rem] font-semibold tracking-[-0.06em] sm:text-[4rem] md:text-[5rem]">
                    ON
                  </p>
                  <p className="text-[2.9rem] font-black uppercase tracking-[-0.08em] sm:text-[3.7rem] md:text-[4.7rem]">
                    DESIGN
                  </p>
                </div>
                <p className="mt-4 min-h-[3.8rem] max-w-[13rem] text-right text-[0.74rem] font-semibold leading-tight text-[#3e382b] sm:mt-5 sm:max-w-[14.5rem] sm:text-[0.88rem] md:mt-6 md:max-w-[15.5rem] md:text-[0.98rem]">
                  Fusing concepts in mind with art and bringing them into life
                </p>
                <div
                  data-works-detail-icon-button="left"
                  className={WORKS_DETAIL_BUTTON_LAYOUT.left.buttonOffsetClassName}
                >
                  <button
                    type="button"
                    aria-label="Open On Track collection"
                    tabIndex={isContentInteractive ? 0 : -1}
                    onClick={handleEnterDesignDetailView}
                    className={`${WORKS_DETAIL_BUTTON_LAYOUT.left.buttonSpacingClassName} rounded-[0.8rem] transition duration-200 ease-out hover:scale-105 hover:drop-shadow-[0_8px_18px_rgba(117,126,23,0.28)] focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8d9a26]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`}
                  >
                    <img
                      src={WORKS_DETAIL_LEFT_BUTTON_SRC}
                      alt=""
                      aria-hidden="true"
                      className={`${WORKS_DETAIL_BUTTON_LAYOUT.left.iconSizeClassName} object-contain`}
                    />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-start translate-y-[6px]">
                <div className="text-left leading-[0.86] text-[#2f2a1f]">
                  <p className="font-serif text-[3.2rem] font-semibold tracking-[-0.06em] sm:text-[4rem] md:text-[5rem]">
                    ON
                  </p>
                  <p className="text-[2.9rem] font-black uppercase tracking-[-0.08em] sm:text-[3.7rem] md:text-[4.7rem]">
                    CODING
                  </p>
                </div>
                <p className="mt-4 min-h-[3.8rem] max-w-[13rem] text-left text-[0.74rem] font-semibold leading-tight text-[#3e382b] sm:mt-5 sm:max-w-[14.5rem] sm:text-[0.88rem] md:mt-6 md:max-w-[15.5rem] md:text-[0.98rem]">
                  Workflows and prototypes built to make ideas actually run
                </p>
                <div
                  data-works-detail-icon-button="right"
                  className={WORKS_DETAIL_BUTTON_LAYOUT.right.buttonOffsetClassName}
                >
                  <button
                    type="button"
                    aria-label="Open Off Track collection"
                    tabIndex={isContentInteractive ? 0 : -1}
                    onClick={handleEnterCodingDetailView}
                    className={`${WORKS_DETAIL_BUTTON_LAYOUT.right.buttonSpacingClassName} rounded-[0.8rem] transition duration-200 ease-out hover:scale-105 hover:drop-shadow-[0_8px_18px_rgba(117,126,23,0.28)] focus-visible:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8d9a26]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent`}
                  >
                    <img
                      src={WORKS_DETAIL_RIGHT_BUTTON_SRC}
                      alt=""
                      aria-hidden="true"
                      className={`${WORKS_DETAIL_BUTTON_LAYOUT.right.iconSizeClassName} object-contain`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {visualState.showIframe ? (
          <div
            data-works-detail-layer="loading"
            style={{
              opacity: visualState.loadingOpacity,
              pointerEvents: visualState.loadingPointerEvents,
              transform: `translate3d(0, ${visualState.loadingTranslateY}%, 0)`,
            }}
            className="absolute inset-0 will-change-transform"
          >
            <iframe
              key={iframeKey}
              title="Work detail loading animation"
              src={WORKS_DETAIL_LOADING_SRC}
              className="h-full w-full border-0 bg-black"
              loading="eager"
            />
          </div>
        ) : (
          <div
            aria-hidden="true"
            data-works-detail-layer="loading"
            className="absolute inset-0 bg-black"
            style={{ opacity: phase === 'idle' ? 1 : 0, pointerEvents: 'none' }}
          />
        )}
      </div>
    </section>
  );
}
