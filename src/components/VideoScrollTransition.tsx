import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import {
  DEFAULT_VIDEO_SCROLL_INITIAL_STATE,
  DEFAULT_VIDEO_WHEEL_STEP,
  getVideoScrollMountState,
  getVideoStateAfterActivation,
  getVideoStateAfterMobilePlaybackEnd,
  getVideoStateAfterPrompt,
  getVideoVisualState,
  getVideoWheelState,
  isScrollWithinVideoSection,
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

  const [videoState, setVideoState] = useState<VideoScrollState>(DEFAULT_VIDEO_SCROLL_INITIAL_STATE);
  const [isMobile, setIsMobile] = useState(false);
  const visualState = getVideoVisualState(videoState);

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
    ensureLoopVideoPlaying();
  };

  const pinSectionTop = () => {
    const metrics = getSectionMetrics();
    if (!metrics) {
      return;
    }

    window.scrollTo(0, metrics.sectionTop);
  };

  const showActivationPrompt = () => {
    const nextState = getVideoStateAfterPrompt(stateRef.current);
    if (nextState === stateRef.current) {
      return;
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

    window.scrollTo(0, targetScrollY);
    resetToInitialState();
    sessionStorage.removeItem(VIDEO_SECTION_RELOAD_MARKER);
    window.history.scrollRestoration = 'auto';
    return true;
  };

  useLayoutEffect(() => {
    resetToInitialState(false);
    resetVideoSectionIfNeeded();
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
    if (visualState.shouldPlayLoopVideo) {
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
  }, [videoState.phase, videoState.scrubProgress, visualState.shouldPlayLoopVideo]);

  useEffect(() => {
    const handleScroll = () => {
      syncReloadMarker();
    };

    const handleWheel = (event: WheelEvent) => {
      const metrics = getSectionMetrics();
      if (!metrics) {
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

      commitVideoState(wheelState.nextState);
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isMobileRef.current) {
        return;
      }

      if (stateRef.current.phase !== 'scrubbing' || !mobileAutoplayRef.current) {
        return;
      }

      event.preventDefault();
      pinSectionTop();
    };

    const frame = requestAnimationFrame(() => {
      const didReset = resetVideoSectionIfNeeded();
      if (!didReset) {
        syncReloadMarker();
      }
    });

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
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
    if (stateRef.current.phase === 'loopPlaying') {
      ensureLoopVideoPlaying();
    }
  };

  const handleLoopEnded = () => {
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
        autoPlay
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
          <div className="absolute left-[38%] top-[67%] -translate-x-1/2 -translate-y-1/2 md:left-[36%] md:top-[62%]">
            <button
              type="button"
              onClick={activatePushVideo}
              className="pointer-events-auto flex h-28 w-28 items-center justify-center rounded-full border border-black/10 bg-[#f7efe5]/90 text-[#6b6259] shadow-[0_18px_40px_rgba(72,52,32,0.16)] backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:bg-[#fbf5ec] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8f806c] focus-visible:ring-offset-4 focus-visible:ring-offset-transparent md:h-32 md:w-32"
              aria-label={isMobile ? 'Play the album transition video' : 'Start dragging through the album transition'}
            >
              <span className="flex flex-col items-center gap-1 font-[cursive] text-[15px] leading-none md:text-[18px]">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-10 w-10 text-[#7f766d] md:h-11 md:w-11"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19V5" />
                  <path d="m7 10 5-5 5 5" />
                </svg>
                <span>Drag</span>
              </span>
            </button>

            <p className="mt-4 text-center text-[11px] uppercase tracking-[0.28em] text-white/70 md:text-xs">
              {isMobile ? 'Tap to continue' : 'Click, then scroll'}
            </p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
