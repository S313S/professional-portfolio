import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react';

import {
  AWAITING_ACTIVATION_REPIN_DURATION_MS,
  AWAITING_ACTIVATION_REPIN_TOLERANCE_PX,
  CTA_HINT_LEFT_BASE_PERCENT,
  CTA_HINT_LEFT_MD_PERCENT,
  CTA_HINT_OFFSET_X_PX,
  DEFAULT_VIDEO_SCROLL_INITIAL_STATE,
  DEFAULT_VIDEO_WHEEL_STEP,
  getCtaHintLeftValue,
  getSoftRepinScrollTop,
  getVideoScrollMountState,
  getVideoStateAfterActivation,
  getVideoStateAfterMobilePlaybackEnd,
  getVideoStateAfterPrompt,
  getVideoVisualState,
  getVideoWheelState,
  isScrollWithinVideoSection,
  shouldPlayLoopVideoInSection,
  shouldRestartLoopPlaybackOnSectionEnter,
  shouldPinVideoSectionOnPrompt,
  shouldRepinAwaitingActivationOnScroll,
  shouldResetCompletedVideoOnScroll,
  type VideoNavigationType,
  type VideoScrollState,
} from './VideoScrollTransition.logic';

const PUSH_VIDEO_END_FRAME_OFFSET = 1 / 60;
const VIDEO_SECTION_RELOAD_MARKER = 'video-scroll-transition:pending-reset';
const MOBILE_MEDIA_QUERY = '(max-width: 767px), (pointer: coarse)';

export default function VideoScrollTransition() {
  const containerRef = useRef<HTMLElement>(null);
  const loopVideoRef = useRef<HTMLVideoElement>(null);
  const pushVideoRef = useRef<HTMLVideoElement>(null);
  const frameRequestRef = useRef<number | null>(null);
  const queuedTimeRef = useRef(0);
  const pushReadyRef = useRef(false);
  const stateRef = useRef<VideoScrollState>(DEFAULT_VIDEO_SCROLL_INITIAL_STATE);
  const mobileAutoplayRef = useRef(false);
  const isMobileRef = useRef(false);
  const lastTouchYRef = useRef<number | null>(null);
  const previousScrollYRef = useRef(0);
  const sectionInViewRef = useRef(false);
  const hasEnteredSectionBeforeRef = useRef(false);
  const awaitingActivationRepinFrameRef = useRef<number | null>(null);
  const awaitingActivationRepinStartTimeRef = useRef<number | null>(null);
  const awaitingActivationRepinStartYRef = useRef(0);
  const awaitingActivationRepinTargetYRef = useRef(0);

  const [videoState, setVideoState] = useState<VideoScrollState>(DEFAULT_VIDEO_SCROLL_INITIAL_STATE);
  const [isMobile, setIsMobile] = useState(false);
  const [isSectionInView, setIsSectionInView] = useState(false);
  const visualState = getVideoVisualState(videoState);
  const ctaButtonAnimationClassName = visualState.showCtaPromptAnimation
    ? 'video-cta-prompt-button'
    : '';
  const ctaIconAnimationClassName = visualState.showCtaPromptAnimation
    ? 'video-cta-prompt-icon'
    : '';
  const ctaTextAnimationClassName = visualState.showCtaPromptAnimation
    ? 'video-cta-prompt-text'
    : '';
  const ctaHintLeftValue = getCtaHintLeftValue(CTA_HINT_LEFT_BASE_PERCENT, CTA_HINT_OFFSET_X_PX);
  const ctaHintLeftMdValue = getCtaHintLeftValue(CTA_HINT_LEFT_MD_PERCENT, CTA_HINT_OFFSET_X_PX);

  const getSectionMetrics = () => {
    const container = containerRef.current;
    if (!container) {
      return null;
    }

    return {
      sectionTop: container.getBoundingClientRect().top + window.scrollY,
      sectionHeight: container.offsetHeight,
    };
  };

  const syncSectionInView = (scrollY = window.scrollY) => {
    const metrics = getSectionMetrics();
    const wasSectionInView = sectionInViewRef.current;
    const nextValue = metrics
      ? isScrollWithinVideoSection(scrollY, metrics.sectionTop, metrics.sectionHeight)
      : false;

    if (
      shouldRestartLoopPlaybackOnSectionEnter({
        state: stateRef.current,
        wasSectionInView,
        isSectionInView: nextValue,
        hasEnteredSectionBefore: hasEnteredSectionBeforeRef.current,
      })
    ) {
      const loopVideo = loopVideoRef.current;
      if (loopVideo) {
        loopVideo.pause();
        loopVideo.currentTime = 0;
      }
      hasEnteredSectionBeforeRef.current = true;
    }

    if (wasSectionInView !== nextValue) {
      sectionInViewRef.current = nextValue;
      setIsSectionInView(nextValue);
    }

    return nextValue;
  };

  const getNavigationType = (): VideoNavigationType => {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    const navigationType = navigationEntry && 'type' in navigationEntry ? navigationEntry.type : 'navigate';

    if (
      navigationType === 'reload' ||
      navigationType === 'navigate' ||
      navigationType === 'back_forward' ||
      navigationType === 'prerender'
    ) {
      return navigationType;
    }

    return 'navigate';
  };

  const commitVideoState = (nextState: VideoScrollState) => {
    stateRef.current = nextState;
    setVideoState(nextState);
  };

  const setMobileAutoplay = (value: boolean) => {
    mobileAutoplayRef.current = value;
  };

  const ensureLoopVideoPlaying = () => {
    const loopVideo = loopVideoRef.current;
    if (!loopVideo) {
      return;
    }

    loopVideo.play().catch(() => {
      // Autoplay can be blocked transiently; muted inline video usually retries successfully.
    });
  };

  const queuePushVideoTime = (scrubProgress: number) => {
    const pushVideo = pushVideoRef.current;
    if (!pushVideo || !pushReadyRef.current || pushVideo.readyState < 2) {
      return;
    }

    const duration = pushVideo.duration;
    if (!duration || Number.isNaN(duration)) {
      return;
    }

    const maxTime = Math.max(duration - PUSH_VIDEO_END_FRAME_OFFSET, 0);
    const targetTime = scrubProgress >= 1 ? maxTime : scrubProgress * maxTime;

    if (Math.abs(pushVideo.currentTime - targetTime) < 0.016) {
      return;
    }

    queuedTimeRef.current = targetTime;

    if (frameRequestRef.current !== null) {
      return;
    }

    frameRequestRef.current = requestAnimationFrame(() => {
      frameRequestRef.current = null;

      const currentPushVideo = pushVideoRef.current;
      if (!currentPushVideo) {
        return;
      }

      const nextTime = queuedTimeRef.current;
      if (Math.abs(currentPushVideo.currentTime - nextTime) >= 0.016) {
        currentPushVideo.currentTime = nextTime;
      }
    });
  };

  const resetPushVideo = () => {
    const pushVideo = pushVideoRef.current;
    if (!pushVideo) {
      return;
    }

    pushVideo.pause();
    pushVideo.currentTime = 0;
  };

  const restartLoopVideo = () => {
    const loopVideo = loopVideoRef.current;
    if (!loopVideo) {
      return;
    }

    loopVideo.pause();
    loopVideo.currentTime = 0;
    if (
      shouldPlayLoopVideoInSection({
        state: DEFAULT_VIDEO_SCROLL_INITIAL_STATE,
        isSectionInView: sectionInViewRef.current,
      })
    ) {
      ensureLoopVideoPlaying();
    }
  };

  const pinSectionTop = () => {
    if (awaitingActivationRepinFrameRef.current !== null) {
      cancelAnimationFrame(awaitingActivationRepinFrameRef.current);
      awaitingActivationRepinFrameRef.current = null;
    }
    awaitingActivationRepinStartTimeRef.current = null;

    const metrics = getSectionMetrics();
    if (!metrics) {
      return;
    }

    window.scrollTo(0, metrics.sectionTop);
  };

  const softPinSectionTop = () => {
    if (awaitingActivationRepinFrameRef.current !== null) {
      return;
    }

    const metrics = getSectionMetrics();
    if (!metrics) {
      return;
    }

    awaitingActivationRepinStartYRef.current = window.scrollY;
    awaitingActivationRepinTargetYRef.current = metrics.sectionTop;

    awaitingActivationRepinStartTimeRef.current = null;

    const step = (timestamp: number) => {
      if (awaitingActivationRepinStartTimeRef.current === null) {
        awaitingActivationRepinStartTimeRef.current = timestamp;
      }

      const elapsed = timestamp - awaitingActivationRepinStartTimeRef.current;
      const progress = Math.min(elapsed / AWAITING_ACTIVATION_REPIN_DURATION_MS, 1);
      const nextScrollTop = getSoftRepinScrollTop(
        awaitingActivationRepinStartYRef.current,
        awaitingActivationRepinTargetYRef.current,
        progress,
      );

      window.scrollTo(0, nextScrollTop);

      if (progress < 1) {
        awaitingActivationRepinFrameRef.current = requestAnimationFrame(step);
        return;
      }

      awaitingActivationRepinFrameRef.current = null;
      awaitingActivationRepinStartTimeRef.current = null;
      window.scrollTo(0, awaitingActivationRepinTargetYRef.current);
    };

    awaitingActivationRepinFrameRef.current = requestAnimationFrame(step);
  };

  const showActivationPrompt = () => {
    const nextState = getVideoStateAfterPrompt(stateRef.current);
    if (nextState === stateRef.current) {
      return;
    }

    const metrics = getSectionMetrics();
    const shouldPinToSection =
      metrics &&
      shouldPinVideoSectionOnPrompt({
        scrollY: window.scrollY,
        sectionTop: metrics.sectionTop,
        sectionHeight: metrics.sectionHeight,
      });

    if (shouldPinToSection) {
      pinSectionTop();
    }

    loopVideoRef.current?.pause();
    setMobileAutoplay(false);
    commitVideoState(nextState);
  };

  const playPushVideoFromStart = () => {
    const pushVideo = pushVideoRef.current;
    if (!pushVideo || !pushReadyRef.current) {
      return;
    }

    pushVideo.pause();
    pushVideo.currentTime = 0;
    pushVideo.play().catch(() => {
      // Mobile autoplay can be delayed until the user gesture settles.
    });
  };

  const activatePushVideo = () => {
    const nextState = getVideoStateAfterActivation(stateRef.current);
    if (nextState === stateRef.current) {
      return;
    }

    pinSectionTop();
    loopVideoRef.current?.pause();
    queuedTimeRef.current = 0;
    resetPushVideo();
    commitVideoState(nextState);

    if (isMobileRef.current) {
      setMobileAutoplay(true);
      playPushVideoFromStart();
      return;
    }

    setMobileAutoplay(false);
    queuePushVideoTime(0);
  };

  const restoreLoopPlayback = () => {
    queuedTimeRef.current = 0;
    setMobileAutoplay(false);
    resetPushVideo();
    restartLoopVideo();
  };

  const syncReloadMarker = () => {
    const metrics = getSectionMetrics();
    if (!metrics) {
      return;
    }

    const isInsideVideoSection = isScrollWithinVideoSection(
      window.scrollY,
      metrics.sectionTop,
      metrics.sectionHeight,
    );

    if (isInsideVideoSection) {
      sessionStorage.setItem(VIDEO_SECTION_RELOAD_MARKER, '1');
      window.history.scrollRestoration = 'manual';
      return;
    }

    if (
      getNavigationType() === 'reload' &&
      sessionStorage.getItem(VIDEO_SECTION_RELOAD_MARKER) === '1'
    ) {
      window.history.scrollRestoration = 'manual';
      return;
    }

    sessionStorage.removeItem(VIDEO_SECTION_RELOAD_MARKER);
    window.history.scrollRestoration = 'auto';
  };

  const resetToInitialState = (shouldRestartLoopVideo = true) => {
    queuedTimeRef.current = 0;
    setMobileAutoplay(false);
    resetPushVideo();
    commitVideoState(DEFAULT_VIDEO_SCROLL_INITIAL_STATE);

    if (shouldRestartLoopVideo) {
      restartLoopVideo();
    }
  };

  const resetVideoSectionIfNeeded = () => {
    const metrics = getSectionMetrics();
    if (!metrics) {
      return false;
    }

    const navigationType = getNavigationType();
    const mountState = getVideoScrollMountState({
      navigationType,
      scrollY: window.scrollY,
      sectionTop: metrics.sectionTop,
      sectionHeight: metrics.sectionHeight,
    });

    const hasPendingReloadMarker =
      navigationType === 'reload' && sessionStorage.getItem(VIDEO_SECTION_RELOAD_MARKER) === '1';
    const targetScrollY = mountState.targetScrollY ?? metrics.sectionTop;

    if (!mountState.shouldResetScroll && !hasPendingReloadMarker) {
      return false;
    }

    resetToInitialState();
    window.scrollTo(0, targetScrollY);

    const didReachTarget = Math.abs(window.scrollY - targetScrollY) <= 2;
    if (!didReachTarget) {
      window.history.scrollRestoration = 'manual';
      return false;
    }

    sessionStorage.removeItem(VIDEO_SECTION_RELOAD_MARKER);
    window.history.scrollRestoration = 'auto';
    return true;
  };

  useLayoutEffect(() => {
    previousScrollYRef.current = window.scrollY;
    resetToInitialState(false);
    resetVideoSectionIfNeeded();
    syncSectionInView();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateDeviceMode = () => {
      isMobileRef.current = mediaQuery.matches;
      setIsMobile(mediaQuery.matches);
    };

    updateDeviceMode();
    mediaQuery.addEventListener('change', updateDeviceMode);
    return () => mediaQuery.removeEventListener('change', updateDeviceMode);
  }, []);

  useEffect(() => {
    if (
      shouldPlayLoopVideoInSection({
        state: videoState,
        isSectionInView,
      })
    ) {
      ensureLoopVideoPlaying();
    } else {
      loopVideoRef.current?.pause();
    }

    if (videoState.phase === 'awaitingActivation') {
      resetPushVideo();
      return;
    }

    if (videoState.phase === 'scrubbing' && !mobileAutoplayRef.current) {
      pushVideoRef.current?.pause();
      queuePushVideoTime(videoState.scrubProgress);
      return;
    }

    if (videoState.phase === 'completed' && !mobileAutoplayRef.current) {
      pushVideoRef.current?.pause();
      queuePushVideoTime(1);
    }
  }, [isSectionInView, videoState, visualState.shouldPlayLoopVideo]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const metrics = getSectionMetrics();

      syncSectionInView(scrollY);

      if (
        metrics &&
        shouldRepinAwaitingActivationOnScroll({
          state: stateRef.current,
          sectionTop: metrics.sectionTop,
          sectionHeight: metrics.sectionHeight,
          previousScrollY: previousScrollYRef.current,
          scrollY,
        })
      ) {
        softPinSectionTop();
        previousScrollYRef.current = Math.max(scrollY - AWAITING_ACTIVATION_REPIN_TOLERANCE_PX, metrics.sectionTop);
        syncReloadMarker();
        return;
      }

      if (
        shouldResetCompletedVideoOnScroll({
          state: stateRef.current,
          previousScrollY: previousScrollYRef.current,
          scrollY,
        })
      ) {
        restoreLoopPlayback();
        commitVideoState(DEFAULT_VIDEO_SCROLL_INITIAL_STATE);
      }

      previousScrollYRef.current = scrollY;
      syncReloadMarker();
    };

    const handleWheel = (event: WheelEvent) => {
      const metrics = getSectionMetrics();
      if (!metrics) {
        return;
      }

      const isAwaitingActivationDownward =
        stateRef.current.phase === 'awaitingActivation' && event.deltaY > 0;
      const isWithinVideoSection = isScrollWithinVideoSection(
        window.scrollY,
        metrics.sectionTop,
        metrics.sectionHeight,
      );

      if (isAwaitingActivationDownward && isWithinVideoSection) {
        event.preventDefault();
        if (window.scrollY > metrics.sectionTop + AWAITING_ACTIVATION_REPIN_TOLERANCE_PX) {
          softPinSectionTop();
        }
        return;
      }

      const isPinnedAtSectionTop = Math.abs(window.scrollY - metrics.sectionTop) <= 2;
      if (!isPinnedAtSectionTop) {
        return;
      }

      const wheelState = getVideoWheelState({
        state: stateRef.current,
        deltaY: event.deltaY,
        step: DEFAULT_VIDEO_WHEEL_STEP,
      });

      if (!wheelState.shouldPreventScroll) {
        return;
      }

      event.preventDefault();
      window.scrollTo(0, metrics.sectionTop);

      if (wheelState.nextState.phase === 'awaitingActivation') {
        setMobileAutoplay(false);
      }

      if (wheelState.nextState.phase === 'loopPlaying') {
        restoreLoopPlayback();
      }

      commitVideoState(wheelState.nextState);
    };

    const handleTouchStart = (event: TouchEvent) => {
      lastTouchYRef.current = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isMobileRef.current) {
        return;
      }

      const metrics = getSectionMetrics();
      if (!metrics) {
        return;
      }

      const currentY = event.touches[0]?.clientY;
      const lastY = lastTouchYRef.current;
      if (typeof currentY !== 'number') {
        return;
      }

      const deltaY = typeof lastY === 'number' ? lastY - currentY : 0;
      lastTouchYRef.current = currentY;

      if (stateRef.current.phase === 'awaitingActivation' && deltaY > 0) {
        event.preventDefault();
        if (window.scrollY > metrics.sectionTop + AWAITING_ACTIVATION_REPIN_TOLERANCE_PX) {
          softPinSectionTop();
        }
        return;
      }

      const isPinnedAtSectionTop = Math.abs(window.scrollY - metrics.sectionTop) <= 2;
      if (!isPinnedAtSectionTop) {
        return;
      }

      if (stateRef.current.phase !== 'scrubbing' || !mobileAutoplayRef.current) {
        if (stateRef.current.phase !== 'completed' || typeof lastY !== 'number') {
          return;
        }

        const wheelState = getVideoWheelState({
          state: stateRef.current,
          deltaY,
          step: DEFAULT_VIDEO_WHEEL_STEP,
        });

        if (!wheelState.shouldPreventScroll) {
          return;
        }

        event.preventDefault();
        pinSectionTop();

        if (wheelState.nextState.phase === 'loopPlaying') {
          restoreLoopPlayback();
        }

        commitVideoState(wheelState.nextState);
        return;
      }

      event.preventDefault();
      pinSectionTop();
    };

    const handleTouchEnd = () => {
      lastTouchYRef.current = null;
    };

    const frame = requestAnimationFrame(() => {
      const didReset = resetVideoSectionIfNeeded();
      syncSectionInView();
      if (!didReset) {
        syncReloadMarker();
      }
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
      }
      if (awaitingActivationRepinFrameRef.current !== null) {
        cancelAnimationFrame(awaitingActivationRepinFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let frame: number | null = null;
    let attempts = 0;

    const retryPendingReset = () => {
      if (sessionStorage.getItem(VIDEO_SECTION_RELOAD_MARKER) !== '1') {
        return;
      }

      attempts += 1;
      const didReset = resetVideoSectionIfNeeded();
      if (!didReset && attempts < 90) {
        frame = requestAnimationFrame(retryPendingReset);
      }
    };

    retryPendingReset();

    return () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMobile || !mobileAutoplayRef.current || videoState.phase !== 'scrubbing') {
      return;
    }

    playPushVideoFromStart();
  }, [isMobile, videoState.phase]);

  const handleLoopLoadedData = () => {
    if (
      shouldPlayLoopVideoInSection({
        state: stateRef.current,
        isSectionInView: sectionInViewRef.current,
      })
    ) {
      ensureLoopVideoPlaying();
    }
  };

  const handleLoopEnded = () => {
    if (
      !shouldPlayLoopVideoInSection({
        state: stateRef.current,
        isSectionInView: sectionInViewRef.current,
      })
    ) {
      const loopVideo = loopVideoRef.current;
      if (loopVideo && stateRef.current.phase === 'loopPlaying') {
        loopVideo.pause();
        loopVideo.currentTime = 0;
      }
      return;
    }

    showActivationPrompt();
  };

  const handlePushLoadedData = () => {
    pushReadyRef.current = true;

    if (mobileAutoplayRef.current && stateRef.current.phase === 'scrubbing') {
      playPushVideoFromStart();
      return;
    }

    if (stateRef.current.phase === 'completed') {
      queuePushVideoTime(1);
      return;
    }

    if (stateRef.current.phase === 'scrubbing') {
      queuePushVideoTime(stateRef.current.scrubProgress);
    }
  };

  const handlePushEnded = () => {
    if (!mobileAutoplayRef.current) {
      return;
    }

    setMobileAutoplay(false);
    commitVideoState(getVideoStateAfterMobilePlaybackEnd(stateRef.current));
  };

  return (
    <section
      ref={containerRef}
      data-phase={videoState.phase}
      className="relative z-40 h-screen w-full overflow-hidden bg-[#FDFCF8]"
    >
      <video
        ref={loopVideoRef}
        src="/videos/窗帘飘动.mp4"
        poster="/images/video-loop-poster.png"
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
        style={{ opacity: visualState.loopOpacity }}
        muted
        playsInline
        preload="auto"
        onLoadedData={handleLoopLoadedData}
        onEnded={handleLoopEnded}
      />

      <div
        className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-500 will-change-[opacity]"
        style={{ opacity: visualState.overlayOpacity }}
      >
        <video
          ref={pushVideoRef}
          src="/videos/窗帘飘动_镜头推进到相册.mp4"
          poster="/images/video-transition-poster.png"
          className="absolute inset-0 h-full w-full object-cover"
          muted
          playsInline
          preload="auto"
          onLoadedData={handlePushLoadedData}
          onEnded={handlePushEnded}
        />
      </div>

      {visualState.showCta ? (
        <div className="pointer-events-none absolute inset-0">
          <button
            type="button"
            onClick={activatePushVideo}
            className={`pointer-events-auto absolute left-[27.4%] top-[66.3%] flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition duration-300 hover:-translate-y-[54%] hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f806c] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent md:left-[27.2%] md:top-[65.8%] md:h-24 md:w-24 ${ctaButtonAnimationClassName}`}
            aria-label={isMobile ? 'Play the album transition video' : 'Start dragging through the album transition'}
          >
            <img
              src="/images/drag图标_灰色版.png"
              alt=""
              aria-hidden="true"
              className={`h-14 w-14 object-contain md:h-16 md:w-16 ${ctaIconAnimationClassName}`}
            />
          </button>

          <p
            className={`absolute left-[var(--video-cta-hint-left)] top-[72.9%] -translate-x-1/2 -translate-y-1/2 text-center text-[10px] uppercase tracking-[0.26em] text-white/70 md:left-[var(--video-cta-hint-left-md)] md:top-[72.2%] md:text-[11px] ${ctaTextAnimationClassName}`}
            style={
              {
                '--video-cta-hint-left': ctaHintLeftValue,
                '--video-cta-hint-left-md': ctaHintLeftMdValue,
              } as CSSProperties
            }
          >
            {isMobile ? 'Tap to continue' : 'Click, then scroll'}
          </p>
        </div>
      ) : null}
    </section>
  );
}
