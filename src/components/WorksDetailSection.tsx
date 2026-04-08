import { useEffect, useMemo, useRef, useState } from 'react';

import {
  closeWorksDetailView,
  getWorksDetailActivationState,
  getWorksDetailBackNavigationState,
  getWorksDetailCompletionState,
  getWorksDetailPinnedScrollY,
  getWorksDetailVisualState,
  getWorksDetailWheelBufferState,
  getWorksDetailWheelState,
  isWorksDetailContentInteractive,
  openWorksDetailView,
  shouldLockWorksDetailScroll,
  WORKS_DETAIL_LOADING_FALLBACK_MS,
  WORKS_DETAIL_LOADING_SRC,
  WORKS_DETAIL_REVEAL_IMAGE_SRC,
  WORKS_DETAIL_RETURN_TO_LOBBY_EVENT,
  WORKS_DETAIL_TRANSITION_START_EVENT,
  type WorksDetailPhase,
  type WorksDetailView,
} from './WorksDetailSection.logic';

const TOUCH_STEP_TOLERANCE_PX = 4;
const WORKS_DETAIL_REVEAL_STEP = 0.18;
const WORKS_DETAIL_WHEEL_THRESHOLD_PX = 30;
const WORKS_DETAIL_WHEEL_UNIT_DELTA = 120;
const WORKS_DETAIL_LEFT_BUTTON_SRC = '/images/workDetail_left_icon.png.png';
const WORKS_DETAIL_RIGHT_BUTTON_SRC = '/images/workDetail_rigtht_icon.png';
const WORKS_DETAIL_STAGE_BACKGROUND_SRC = '';
const WORKS_DETAIL_ACTIVE_ITEM_LABEL = '07';
const WORKS_DETAIL_ACTIVE_PAGER_INDEX = 6;
const WORKS_DETAIL_STAGE_ITEMS = [
  { src: '/images/growPath_01.png', label: '04' },
  { src: '/images/growPath_02.png', label: '05' },
  { src: '/images/growPath_03.png', label: '06' },
  { src: '/images/WorksCollectionRoom_Bg.jpg', label: '07' },
  { src: '/images/growPath_04.png', label: '08' },
] as const;
const WORKS_DETAIL_STAGE_PROJECTS = [
  {
    title: 'KINDY',
    subtitle: 'The fantastic adventures george the Sock',
    positionClassName: 'works-detail-stage__project works-detail-stage__project--left',
    state: 'muted',
  },
  {
    title: 'SANOFI',
    subtitle: 'Capturing the richness of a major event',
    positionClassName: 'works-detail-stage__project works-detail-stage__project--center',
    state: 'active',
  },
  {
    title: "WHAT'S HOT",
    subtitle: 'Our latest news',
    positionClassName: 'works-detail-stage__project works-detail-stage__project--right',
    state: 'muted',
  },
] as const;
const WORKS_DETAIL_STAGE_SOCIALS = ['f', 't', '▶'] as const;

// 图标按钮手调区：
// 1. `iconSizeClassName` 控制图标本体大小。
// 2. `buttonSpacingClassName` 控制图标和上方文案之间的基础间距。
// 3. `buttonOffsetClassName` 用来做最终的上下微调。
//    - `translate-y-[8px]` 表示整体下移 8px
//    - `-translate-y-[6px]` 表示整体上移 6px
const WORKS_DETAIL_BUTTON_LAYOUT = {
  left: {
    buttonOffsetClassName: 'translate-y-[-35px]',
    buttonSpacingClassName: 'mt-5 sm:mt-6',
    iconSizeClassName: 'h-[2.1rem] w-[2.1rem] sm:h-[2.5rem] sm:w-[2.5rem] md:h-[3rem] md:w-[3rem]',
  },
  right: {
    buttonOffsetClassName: 'translate-y-[-35px]',
    buttonSpacingClassName: 'mt-5 sm:mt-6',
    iconSizeClassName: 'h-[2.1rem] w-[2.1rem] sm:h-[2.5rem] sm:w-[2.5rem] md:h-[3rem] md:w-[3rem]',
  },
} as const;

interface WorksDetailSectionProps {
  initialPhase?: WorksDetailPhase;
  initialTransitionProgress?: number;
  initialView?: WorksDetailView;
}

export default function WorksDetailSection({
  initialPhase = 'idle',
  initialTransitionProgress = 0,
  initialView = 'entry',
}: WorksDetailSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const phaseRef = useRef<WorksDetailPhase>(initialPhase);
  const viewRef = useRef<WorksDetailView>(initialView);
  const loadingTimeoutRef = useRef<number | null>(null);
  const wheelBufferRef = useRef(0);

  const [phase, setPhase] = useState<WorksDetailPhase>(initialPhase);
  const [iframeKey, setIframeKey] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(initialTransitionProgress);
  const [view, setView] = useState<WorksDetailView>(initialView);

  phaseRef.current = phase;
  viewRef.current = view;

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = null;
  };

  const completeLoading = () => {
    const completionState = getWorksDetailCompletionState();
    const section = sectionRef.current;

    clearLoadingTimeout();
    wheelBufferRef.current = 0;
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

  const exitToLobby = () => {
    clearLoadingTimeout();
    wheelBufferRef.current = 0;
    setPhase('idle');
    setTransitionProgress(0);
    setView('entry');
    window.dispatchEvent(new Event(WORKS_DETAIL_RETURN_TO_LOBBY_EVENT));
  };

  const restartLoading = (scrollToTop = false) => {
    const activationState = getWorksDetailActivationState(iframeKey);

    clearLoadingTimeout();
    wheelBufferRef.current = 0;
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
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      const currentPhase = phaseRef.current;
      const currentView = viewRef.current;

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

      event.preventDefault();

      if (currentPhase === 'loading') {
        wheelBufferRef.current = 0;
        return;
      }

      if (currentView === 'detail') {
        const wheelBufferState = getWorksDetailWheelBufferState({
          buffer: wheelBufferRef.current,
          deltaY: event.deltaY,
          threshold: WORKS_DETAIL_WHEEL_THRESHOLD_PX,
        });
        wheelBufferRef.current = wheelBufferState.nextBuffer;

        if (wheelBufferState.consumedSteps === 0 || wheelBufferState.direction === 0) {
          return;
        }

        if (wheelBufferState.direction < 0) {
          const backNavigationState = getWorksDetailBackNavigationState(currentView);
          setView(backNavigationState.nextView);
          if (backNavigationState.shouldExitToLobby) {
            exitToLobby();
          }
        }

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

      const startY = touchStartYRef.current;
      const currentY = event.touches[0]?.clientY;
      if (startY === null || currentY === undefined) {
        return;
      }

      if (Math.abs(currentY - startY) < TOUCH_STEP_TOLERANCE_PX) {
        return;
      }

      if (viewRef.current === 'detail') {
        event.preventDefault();

        if (startY - currentY < 0) {
          const backNavigationState = getWorksDetailBackNavigationState(viewRef.current);
          setView(backNavigationState.nextView);
          if (backNavigationState.shouldExitToLobby) {
            exitToLobby();
          }
        }

        touchStartYRef.current = currentY;
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
  }, [transitionProgress, iframeKey]);

  const handleEnterDetailView = () => {
    if (!isContentInteractive) {
      return;
    }

    wheelBufferRef.current = 0;
    setView((currentView) => openWorksDetailView(currentView));
  };

  const handleCloseDetailView = () => {
    wheelBufferRef.current = 0;
    setView((currentView) => closeWorksDetailView(currentView));
  };

  return (
    <section
      ref={sectionRef}
      id="works-detail-section"
      aria-labelledby="works-detail-title"
      data-works-detail-stage="transition"
      data-works-detail-phase={phase}
      data-works-detail-view={view}
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
            backgroundImage: `url(${WORKS_DETAIL_REVEAL_IMAGE_SRC})`,
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
            <div
              data-works-detail-view="detail"
              className="works-detail-stage relative flex h-full w-full flex-col overflow-hidden px-5 pt-6 pb-10 text-[#f8ebdb] sm:px-8 sm:pt-8 sm:pb-12"
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

              <div className="works-detail-track" aria-hidden="true">
                <div className="works-detail-track__corridor works-detail-track__corridor--band" />
                <div className="works-detail-track__corridor works-detail-track__corridor--top" />
                <div className="works-detail-track__corridor works-detail-track__corridor--bottom" />
                {WORKS_DETAIL_STAGE_ITEMS.map((item, index) => {
                  return (
                    <div
                      key={item.label}
                      className="works-detail-track__item"
                      data-slot={index}
                      data-active={item.label === WORKS_DETAIL_ACTIVE_ITEM_LABEL}
                      data-visibility={item.label === WORKS_DETAIL_ACTIVE_ITEM_LABEL ? 'active' : 'preview'}
                      style={{ backgroundImage: `url(${item.src})` }}
                    >
                      <div className="works-detail-track__shade" />
                      <span className="works-detail-track__index">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <div className="works-detail-stage__projects">
                {WORKS_DETAIL_STAGE_PROJECTS.map((project) => (
                  <div
                    key={project.title}
                    className={project.positionClassName}
                    data-project-state={project.state}
                  >
                    <p className="works-detail-stage__project-title">{project.title}</p>
                    <p className="works-detail-stage__project-subtitle">{project.subtitle}</p>
                  </div>
                ))}
              </div>

              <div className="relative z-10 mt-auto flex flex-col gap-6">
                <div className="works-detail-stage__footer" aria-hidden="true">
                  <div className="works-detail-stage__footer-left">
                    <span className="works-detail-stage__footer-line" />
                    <span className="works-detail-stage__brand">blacknegative</span>
                  </div>
                  <div className="works-detail-stage__footer-center">
                    <div className="works-detail-stage__pager">
                      {Array.from({ length: 12 }, (_, index) => (
                        <span
                          key={index}
                          className={`works-detail-stage__pager-tick ${index === WORKS_DETAIL_ACTIVE_PAGER_INDEX ? 'works-detail-stage__pager-tick--active' : ''}`}
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
            </div>
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
                    CODING
                  </p>
                </div>
                <p className="mt-4 min-h-[3.8rem] max-w-[13rem] text-right text-[0.74rem] font-semibold leading-tight text-[#3e382b] sm:mt-5 sm:max-w-[14.5rem] sm:text-[0.88rem] md:mt-6 md:max-w-[15.5rem] md:text-[0.98rem]">
                  Workflows, systems and prototypes built to make ideas actually run.
                </p>
                <div
                  data-works-detail-icon-button="left"
                  className={WORKS_DETAIL_BUTTON_LAYOUT.left.buttonOffsetClassName}
                >
                  <button
                    type="button"
                    aria-label="Open On Track collection"
                    tabIndex={isContentInteractive ? 0 : -1}
                    onClick={handleEnterDetailView}
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
                    OFF
                  </p>
                  <p className="text-[2.9rem] font-black uppercase tracking-[-0.08em] sm:text-[3.7rem] md:text-[4.7rem]">
                    DESIGN
                  </p>
                </div>
                <p className="mt-4 min-h-[3.8rem] max-w-[13rem] text-left text-[0.74rem] font-semibold leading-tight text-[#3e382b] sm:mt-5 sm:max-w-[14.5rem] sm:text-[0.88rem] md:mt-6 md:max-w-[15.5rem] md:text-[0.98rem]">
                  Campaigns, shoots and other such promotional materials for fans
                </p>
                <div
                  data-works-detail-icon-button="right"
                  className={WORKS_DETAIL_BUTTON_LAYOUT.right.buttonOffsetClassName}
                >
                  <button
                    type="button"
                    aria-label="Open Off Track collection"
                    tabIndex={isContentInteractive ? 0 : -1}
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
