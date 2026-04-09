import { useEffect, useMemo, useRef, useState } from 'react';

import {
  DEFAULT_WORKS_LOBBY_SCROLL_STATE,
  DEFAULT_WORKS_LOBBY_WHEEL_STEP,
  WORKS_LOBBY_ACTIVATE_FROM_CAREER_DETAIL_EVENT,
  getWorksLobbyNavigationTargetY,
  getWorksLobbyPhaseForProgress,
  getWorksLobbyScrollMountState,
  getWorksLobbyScrollTargetY,
  getWorksLobbyTouchState,
  getWorksLobbyVisualState,
  getWorksLobbyWheelCaptureState,
  getWorksLobbyWheelState,
  type WorksLobbyScrollState,
} from './WorksLobbySection.logic';
import {
  WORKS_LOBBY_CTA_HINT_DELAY_MS,
  shouldHideWorksLobbyHint,
  shouldScheduleWorksLobbyHint,
} from './WorksLobbySection.hint';
import {
  WORKS_DETAIL_RETURN_TO_LOBBY_EVENT,
  WORKS_DETAIL_TRANSITION_START_EVENT,
} from './WorksDetailSection.logic';

const MOBILE_MEDIA_QUERY = '(max-width: 767px), (pointer: coarse)';
const WORKS_LOBBY_PIN_TOLERANCE_PX = 2;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getMobileRevealProgress = (section: HTMLElement) => {
  const rect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight || 1;
  return clamp((viewportHeight - rect.top) / viewportHeight, 0, 1);
};

export default function WorksLobbySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stateRef = useRef<WorksLobbyScrollState>(DEFAULT_WORKS_LOBBY_SCROLL_STATE);
  const hasSnappedOnCurrentEntryRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const touchStartYRef = useRef<number | null>(null);
  const hintTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);

  const [scrollState, setScrollState] = useState(DEFAULT_WORKS_LOBBY_SCROLL_STATE);
  const [isMobile, setIsMobile] = useState(false);
  const [shouldShowHint, setShouldShowHint] = useState(false);
  const [hasDismissedHint, setHasDismissedHint] = useState(false);
  const visualState = useMemo(() => getWorksLobbyVisualState(scrollState), [scrollState]);

  const commitState = (nextState: WorksLobbyScrollState) => {
    stateRef.current = nextState;
    setScrollState(nextState);
  };

  const resetLobbyState = () => {
    commitState(DEFAULT_WORKS_LOBBY_SCROLL_STATE);
  };

  const clearHintTimer = () => {
    if (hintTimeoutRef.current !== null) {
      window.clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    const syncMobileMode = () => {
      const nextIsMobile = mediaQuery.matches;
      setIsMobile(nextIsMobile);

      if (nextIsMobile) {
        hasSnappedOnCurrentEntryRef.current = false;
        resetLobbyState();
      }
    };

    syncMobileMode();
    mediaQuery.addEventListener('change', syncMobileMode);

    return () => mediaQuery.removeEventListener('change', syncMobileMode);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    video.play().catch(() => {
      // Keep the poster/first frame if autoplay is blocked.
    });
  }, []);

  useEffect(() => {
    if (shouldHideWorksLobbyHint(scrollState.phase)) {
      clearHintTimer();
      setShouldShowHint(false);
      setHasDismissedHint(false);
      return;
    }

    if (!shouldScheduleWorksLobbyHint(scrollState.phase, visualState.showButton, hasDismissedHint)) {
      clearHintTimer();
      return;
    }

    setShouldShowHint(false);
    clearHintTimer();
    hintTimeoutRef.current = window.setTimeout(() => {
      setShouldShowHint(true);
      hintTimeoutRef.current = null;
    }, WORKS_LOBBY_CTA_HINT_DELAY_MS);

    return () => {
      clearHintTimer();
    };
  }, [hasDismissedHint, scrollState.phase, visualState.showButton]);

  const dismissHint = () => {
    clearHintTimer();
    setShouldShowHint(false);
    setHasDismissedHint(true);
  };

  useEffect(() => {
    const handleActivateFromCareerDetail = () => {
      const section = sectionRef.current;
      if (!section) {
        return;
      }

      const targetY = getWorksLobbyScrollTargetY(
        section.getBoundingClientRect().top + window.scrollY,
      );

      hasSnappedOnCurrentEntryRef.current = true;
      clearHintTimer();
      setShouldShowHint(false);
      setHasDismissedHint(false);
      commitState(DEFAULT_WORKS_LOBBY_SCROLL_STATE);
      lastScrollYRef.current = targetY;

      window.scrollTo({
        top: targetY,
        behavior: 'auto',
      });
    };

    window.addEventListener(
      WORKS_LOBBY_ACTIVATE_FROM_CAREER_DETAIL_EVENT,
      handleActivateFromCareerDetail,
    );

    return () => {
      window.removeEventListener(
        WORKS_LOBBY_ACTIVATE_FROM_CAREER_DETAIL_EVENT,
        handleActivateFromCareerDetail,
      );
    };
  }, []);

  useEffect(() => {
    const handleRestoreFromWorksDetail = () => {
      const section = sectionRef.current;
      if (!section) {
        return;
      }

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const targetY = getWorksLobbyScrollTargetY(sectionTop);

      hasSnappedOnCurrentEntryRef.current = true;
      clearHintTimer();
      setShouldShowHint(false);
      commitState({
        phase: 'holding',
        progress: 1,
      });
      lastScrollYRef.current = targetY;

      window.scrollTo({
        top: targetY,
        behavior: 'auto',
      });
    };

    window.addEventListener(WORKS_DETAIL_RETURN_TO_LOBBY_EVENT, handleRestoreFromWorksDetail);

    return () => {
      window.removeEventListener(WORKS_DETAIL_RETURN_TO_LOBBY_EVENT, handleRestoreFromWorksDetail);
    };
  }, []);

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
      const sectionBottom = sectionTop + sectionHeight;
      const isOutsideResetBand =
        scrollY <= sectionTop - window.innerHeight * 0.6 || scrollY >= sectionBottom;

      if (isMobile) {
        if (isOutsideResetBand && stateRef.current.phase === 'navigating') {
          resetLobbyState();
          lastScrollYRef.current = scrollY;
          return;
        }

        const nextProgress = getMobileRevealProgress(section);

        if (stateRef.current.phase === 'holding') {
          if (scrollY > lastScrollYRef.current) {
            window.scrollTo({
              top: getWorksLobbyScrollTargetY(sectionTop),
              behavior: 'auto',
            });
            lastScrollYRef.current = getWorksLobbyScrollTargetY(sectionTop);
            return;
          }

          if (scrollY < lastScrollYRef.current) {
            commitState({
              phase: 'revealing',
              progress: Math.min(nextProgress, 0.92),
            });
          }

          lastScrollYRef.current = scrollY;
          return;
        }

        const nextPhase = getWorksLobbyPhaseForProgress(nextProgress);
        commitState({
          phase: nextPhase,
          progress: nextPhase === 'holding' ? 1 : nextProgress,
        });

        if (nextPhase === 'holding') {
          window.scrollTo({
            top: getWorksLobbyScrollTargetY(sectionTop),
            behavior: 'auto',
          });
        }

        lastScrollYRef.current = scrollY;
        return;
      }

      const mountState = getWorksLobbyScrollMountState({
        scrollY,
        lastScrollY: lastScrollYRef.current,
        sectionTop,
        sectionHeight,
        viewportHeight: window.innerHeight,
        hasSnappedOnCurrentEntry: hasSnappedOnCurrentEntryRef.current,
        isMobile,
      });

      if (mountState.shouldResetLatch) {
        hasSnappedOnCurrentEntryRef.current = false;
        if (stateRef.current.phase === 'navigating' || scrollY >= sectionBottom) {
          resetLobbyState();
        }
      }

      if (mountState.shouldSnap) {
        hasSnappedOnCurrentEntryRef.current = true;
        window.scrollTo({
          top: getWorksLobbyScrollTargetY(sectionTop),
          behavior: 'smooth',
        });
      }

      lastScrollYRef.current = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      return;
    }

    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const sectionHeight = section.offsetHeight;
      const isDesktopPinned =
        Math.abs(window.scrollY - getWorksLobbyScrollTargetY(sectionTop)) <= WORKS_LOBBY_PIN_TOLERANCE_PX;

      if (!isDesktopPinned) {
        const captureState = getWorksLobbyWheelCaptureState({
          scrollY: window.scrollY,
          sectionTop,
          sectionHeight,
          state: stateRef.current,
          deltaY: event.deltaY,
          step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
          isMobile,
        });

        if (captureState.shouldPreventScroll && captureState.targetScrollY !== null) {
          event.preventDefault();
          window.scrollTo({
            top: captureState.targetScrollY,
            behavior: 'auto',
          });
          commitState(captureState.nextState);
        }

        return;
      }

      const wheelState = getWorksLobbyWheelState({
        state: stateRef.current,
        deltaY: event.deltaY,
        step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
        isDesktopPinned,
        isMobile,
      });

      if (!wheelState.shouldPreventScroll) {
        return;
      }

      event.preventDefault();
      window.scrollTo({
        top: getWorksLobbyScrollTargetY(sectionTop),
        behavior: 'auto',
      });

      commitState(wheelState.nextState);
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      return;
    }

    const section = sectionRef.current;
    if (!section) {
      return;
    }

    const handleTouchStart = (event: TouchEvent) => {
      touchStartYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const startY = touchStartYRef.current;
      const currentY = event.touches[0]?.clientY;
      if (startY === null || currentY === undefined) {
        return;
      }

      const touchState = getWorksLobbyTouchState({
        state: stateRef.current,
        deltaY: currentY - startY,
        step: DEFAULT_WORKS_LOBBY_WHEEL_STEP,
      });

      if (touchState.shouldPreventScroll) {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        event.preventDefault();
        window.scrollTo({
          top: getWorksLobbyScrollTargetY(sectionTop),
          behavior: 'auto',
        });
      }

      if (
        touchState.nextState.phase !== stateRef.current.phase ||
        touchState.nextState.progress !== stateRef.current.progress
      ) {
        commitState(touchState.nextState);
      }
    };

    const resetTouch = () => {
      touchStartYRef.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', resetTouch, { passive: true });
    window.addEventListener('touchcancel', resetTouch, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', resetTouch);
      window.removeEventListener('touchcancel', resetTouch);
    };
  }, [isMobile]);

  const handleEnterWorks = () => {
    if (stateRef.current.phase !== 'holding') {
      return;
    }

    const targetSection = document.getElementById('works-detail-section');
    if (!targetSection) {
      return;
    }

    const targetY = getWorksLobbyNavigationTargetY(
      targetSection.getBoundingClientRect().top + window.scrollY,
    );

    dismissHint();
    commitState({
      phase: 'navigating',
      progress: 1,
    });

    window.dispatchEvent(new Event(WORKS_DETAIL_TRANSITION_START_EVENT));

    window.scrollTo({
      top: targetY,
      behavior: 'smooth',
    });
  };

  return (
    <section
      ref={sectionRef}
      id="works-lobby-section"
      aria-labelledby="works-lobby-title"
      className="relative isolate min-h-[100dvh] overflow-hidden bg-[#140f0b] text-[#f4ebdf]"
      data-works-lobby-progress={scrollState.progress.toFixed(2)}
      data-works-lobby-phase={scrollState.phase}
    >
      <div
        data-works-lobby-layer="video"
        className="absolute inset-0"
        style={{ opacity: visualState.videoOpacity }}
      >
        <video
          ref={videoRef}
          src="/videos/Lofi-girl.mp4"
          poster="/images/WorksCollectionRoom_Bg.jpg"
          className="h-full w-full object-cover object-center"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(28,19,13,0.08),rgba(16,12,10,0.5)_100%)]" />
      </div>

      <div
        data-works-lobby-layer="image"
        className="absolute inset-0"
        style={{ opacity: visualState.imageOpacity }}
      >
        <img
          src="/images/WorksCollectionRoom_Bg.jpg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,17,13,0.02)_0%,rgba(12,8,6,0.24)_100%)]" />
      </div>

      <div className="relative z-10 flex min-h-[100dvh] flex-col items-center justify-end px-6 pb-12 md:pb-16">
        <div className="mb-auto pt-4 md:pt-6">
          <div className="grid">
            <div
              data-works-lobby-copy="image"
              className="[grid-area:1/1] transition-opacity duration-300 ease-out"
              style={{ opacity: visualState.imageTitleOpacity }}
            >
              {visualState.showImageEyebrow ? (
                <p className="text-center text-[0.78rem] uppercase tracking-[0.28em] text-[#d6c4b4]/78">
                  What I’ve Earned Along the Way
                </p>
              ) : null}
              <span id="works-lobby-title" className="sr-only">
                What I’ve Earned Along the Way
              </span>
            </div>

            <div
              data-works-lobby-copy="video"
              // 这行 className 控制视频阶段标题层的整体位置与布局：
              // 1. `-translate-y-[4px]` 是“整体上移 4px”的直接控制点，后续想继续上移就把 4px 改大
              // 2. `[grid-area:1/1]` 让视频标题和图片阶段标题叠在同一块版心里
              // 3. 如果你想改文字大小，不要动这里，要改下面 h2 的 `text-[2.6rem]` / `md:text-[4rem]`
              className="[grid-area:1/1] -translate-y-[15px] transition-[opacity,transform] duration-300 ease-out"
              style={{ opacity: visualState.videoTitleOpacity }}
            >
              <h2 className="works-lobby-video-title text-center font-serif text-[2.6rem] font-semibold md:text-[4rem]">
                {visualState.videoTitleText}
              </h2>
            </div>
          </div>
        </div>

        <div
          data-works-lobby-layer="button"
          className={`works-lobby-cta-shell relative flex flex-col items-center gap-2 ${visualState.showButton ? 'works-lobby-cta-shell--visible' : ''}`}
        >
          <button
            type="button"
            data-works-lobby-cta="enter"
            data-works-lobby-target="works-detail-section"
            className="works-lobby-cta-button"
            tabIndex={visualState.showButton ? 0 : -1}
            onMouseEnter={dismissHint}
            onFocus={dismissHint}
            onClick={handleEnterWorks}
          >
            Explore My Work
          </button>
          {shouldShowHint ? (
            <div
              aria-hidden="true"
              data-works-lobby-cta-note="click-here"
              className="works-lobby-cta-doodle"
            >
              <span className="works-lobby-cta-doodle-text">click here</span>
              <span className="works-lobby-cta-doodle-line" />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
