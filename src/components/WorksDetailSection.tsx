import { useEffect, useMemo, useRef, useState } from 'react';

import {
  getWorksDetailActivationState,
  getWorksDetailCompletionState,
  getWorksDetailPinnedScrollY,
  getWorksDetailVisualState,
  getWorksDetailWheelBufferState,
  getWorksDetailWheelState,
  shouldLockWorksDetailScroll,
  WORKS_DETAIL_LOADING_FALLBACK_MS,
  WORKS_DETAIL_LOADING_SRC,
  WORKS_DETAIL_REVEAL_IMAGE_SRC,
  WORKS_DETAIL_RETURN_TO_LOBBY_EVENT,
  WORKS_DETAIL_TRANSITION_START_EVENT,
  type WorksDetailPhase,
} from './WorksDetailSection.logic';

const TOUCH_STEP_TOLERANCE_PX = 4;
const WORKS_DETAIL_REVEAL_STEP = 0.18;
const WORKS_DETAIL_WHEEL_THRESHOLD_PX = 30;
const WORKS_DETAIL_WHEEL_UNIT_DELTA = 120;

export default function WorksDetailSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const touchStartYRef = useRef<number | null>(null);
  const phaseRef = useRef<WorksDetailPhase>('idle');
  const loadingTimeoutRef = useRef<number | null>(null);
  const wheelBufferRef = useRef(0);

  const [phase, setPhase] = useState<WorksDetailPhase>('idle');
  const [iframeKey, setIframeKey] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);

  phaseRef.current = phase;

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

  const exitToLobby = () => {
    clearLoadingTimeout();
    wheelBufferRef.current = 0;
    setPhase('idle');
    setTransitionProgress(0);
    window.dispatchEvent(new Event(WORKS_DETAIL_RETURN_TO_LOBBY_EVENT));
  };

  const restartLoading = (scrollToTop = false) => {
    const activationState = getWorksDetailActivationState(iframeKey);

    clearLoadingTimeout();
    wheelBufferRef.current = 0;
    setPhase(activationState.nextPhase);
    setIframeKey(activationState.nextCycleKey);
    setTransitionProgress(activationState.nextTransitionProgress);

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

  return (
    <section
      ref={sectionRef}
      id="works-detail-section"
      aria-labelledby="works-detail-title"
      data-works-detail-stage="transition"
      data-works-detail-phase={phase}
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
            style={{ opacity: phase === 'idle' ? 1 : 0 }}
          />
        )}
      </div>
    </section>
  );
}
