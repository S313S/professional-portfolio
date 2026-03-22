import { startTransition, useEffect, useRef, useState, type CSSProperties } from 'react';

import {
  DEFAULT_GROW_PATH_SCROLL_STATE,
  DEFAULT_GROW_PATH_WHEEL_STEP,
  GROW_PATH_CARD_IDS,
  canFocusGrowPathCard,
  getGrowPathCardVisuals,
  getGrowPathCareerSnapState,
  getGrowPathCareerSnapTargetY,
  getGrowPathFocusVisuals,
  getGrowPathFocusWheelState,
  getGrowPathWheelCaptureState,
  type GrowPathCardVisual,
  type GrowPathCardId,
  type GrowPathScrollState,
} from './GrowPathScrollSection.logic';

const MOBILE_MEDIA_QUERY = '(max-width: 767px), (pointer: coarse)';
const CAREER_JOURNEY_SECTION_ID = 'career-journey-section';
const CAREER_JOURNEY_SNAP_LOCK_MS = 520;
const GROW_PATH_FOCUS_TRANSITION = '560ms cubic-bezier(0.22, 1, 0.36, 1)';
const GROW_PATH_FOCUS_SHADOW = '0 38px 100px rgba(74, 52, 36, 0.24)';

const CARD_IMAGE_BY_ID: Record<GrowPathCardId, string> = {
  growPath_01: '/images/growPath_01.png',
  growPath_02: '/images/growPath_02.png',
  growPath_03: '/images/growPath_03.png',
  growPath_04: '/images/growPath_04.png',
};

const DESKTOP_CARD_LAYOUTS: Record<
  GrowPathCardId,
  {
    left: string;
    top: string;
    width: string;
  }
> = {
  growPath_01: {
    left: '17%',
    top: '58%',
    width: 'clamp(230px, 23vw, 355px)',
  },
  growPath_02: {
    left: '38%',
    top: '48%',
    width: 'clamp(250px, 25vw, 390px)',
  },
  growPath_03: {
    left: '61%',
    top: '50%',
    width: 'clamp(240px, 24vw, 370px)',
  },
  growPath_04: {
    left: '83%',
    top: '53%',
    width: 'clamp(220px, 22vw, 340px)',
  },
};

interface GrowPathCardRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface GrowPathDesktopStageProps {
  cardVisuals: Record<GrowPathCardId, GrowPathCardVisual>;
  canFocusCards: boolean;
  selectedCardId: GrowPathCardId | null;
  selectedCardRect: GrowPathCardRect | null;
  focusAnimationReady: boolean;
  onCardClick?: (cardId: GrowPathCardId, element: HTMLButtonElement) => void;
  onCloseFocus?: () => void;
}

const getCardLabel = (cardId: GrowPathCardId) => `growth path step ${cardId.slice(-2)}`;

const toCardRect = (element: HTMLButtonElement): GrowPathCardRect => {
  const rect = element.getBoundingClientRect();

  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
  };
};

export function GrowPathDesktopStage({
  cardVisuals,
  canFocusCards,
  selectedCardId,
  selectedCardRect,
  focusAnimationReady,
  onCardClick,
  onCloseFocus,
}: GrowPathDesktopStageProps) {
  const focusVisuals = selectedCardId ? getGrowPathFocusVisuals(selectedCardId) : null;
  const selectedVisual = selectedCardId ? cardVisuals[selectedCardId] : null;

  return (
    <>
      <div className="absolute inset-0">
        {GROW_PATH_CARD_IDS.map((cardId) => {
          const layout = DESKTOP_CARD_LAYOUTS[cardId];
          const visual = cardVisuals[cardId];
          const focusVisual = focusVisuals?.[cardId];
          const isSelected = selectedCardId === cardId;
          const scale = focusVisual ? visual.scale * focusVisual.scale : visual.scale;
          const translateY = focusVisual
            ? `calc(-50% + ${visual.translateY}vh + ${focusVisual.translateY}px)`
            : `calc(-50% + ${visual.translateY}vh)`;
          const style: CSSProperties = {
            left: layout.left,
            top: layout.top,
            width: layout.width,
            opacity: isSelected && selectedCardRect ? 0 : focusVisual?.opacity ?? visual.opacity,
            zIndex: focusVisual?.zIndex ?? visual.zIndex,
            filter: focusVisual?.filter,
            pointerEvents: isSelected && selectedCardRect ? 'none' : canFocusCards ? 'auto' : 'none',
            transform: `translate(calc(-50% + ${visual.translateX}vw), ${translateY}) scale(${scale}) rotate(${focusVisual ? focusVisual.rotate : visual.rotate}deg)`,
            transition: `transform ${GROW_PATH_FOCUS_TRANSITION}, opacity ${GROW_PATH_FOCUS_TRANSITION}, filter ${GROW_PATH_FOCUS_TRANSITION}`,
          };

          return (
            <button
              key={cardId}
              type="button"
              aria-label={`${isSelected ? 'Close' : 'Open'} ${getCardLabel(cardId)}`}
              aria-pressed={isSelected}
              disabled={!canFocusCards}
              className="absolute block will-change-transform disabled:cursor-default"
              style={style}
              onClick={(event) => onCardClick?.(cardId, event.currentTarget)}
            >
              <img
                src={CARD_IMAGE_BY_ID[cardId]}
                alt={`Growth path step ${cardId.slice(-2)}`}
                className="w-full rounded-[1.4rem] shadow-[0_30px_65px_rgba(69,49,34,0.18)]"
              />
            </button>
          );
        })}
      </div>

      {selectedCardId && selectedCardRect && selectedVisual ? (
        <>
          <button
            type="button"
            aria-label="Close focused growth path card"
            className="fixed inset-0 z-20"
            style={{
              opacity: focusAnimationReady ? 1 : 0,
              background:
                'radial-gradient(circle at center, rgba(255,250,241,0.38), rgba(250,243,232,0.2) 42%, rgba(248,239,227,0.42) 100%)',
              backdropFilter: 'blur(10px)',
              transition: `opacity ${GROW_PATH_FOCUS_TRANSITION}`,
            }}
            onClick={() => onCloseFocus?.()}
          />

          <button
            type="button"
            data-focus-card={selectedCardId}
            aria-label={`Close ${getCardLabel(selectedCardId)}`}
            className="fixed z-30 block"
            style={{
              left: focusAnimationReady
                ? '50%'
                : `${selectedCardRect.left + selectedCardRect.width / 2}px`,
              top: focusAnimationReady
                ? '50%'
                : `${selectedCardRect.top + selectedCardRect.height / 2}px`,
              width: `${selectedCardRect.width}px`,
              transform: `translate(-50%, -50%) scale(${focusAnimationReady ? 1.14 : 1}) rotate(${focusAnimationReady ? 0 : selectedVisual.rotate}deg)`,
              transition: `left ${GROW_PATH_FOCUS_TRANSITION}, top ${GROW_PATH_FOCUS_TRANSITION}, transform ${GROW_PATH_FOCUS_TRANSITION}`,
            }}
            onClick={(event) => {
              event.stopPropagation();
              onCloseFocus?.();
            }}
          >
            <img
              src={CARD_IMAGE_BY_ID[selectedCardId]}
              alt={`Growth path step ${selectedCardId.slice(-2)}`}
              className="w-full rounded-[1.6rem]"
              style={{
                boxShadow: GROW_PATH_FOCUS_SHADOW,
              }}
            />
          </button>
        </>
      ) : null}
    </>
  );
}

export default function GrowPathScrollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stateRef = useRef<GrowPathScrollState>(DEFAULT_GROW_PATH_SCROLL_STATE);
  const selectedCardIdRef = useRef<GrowPathCardId | null>(null);
  const hasSnappedOnCurrentExitRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const careerSnapLockRef = useRef(false);
  const careerSnapTargetYRef = useRef(0);
  const careerSnapUnlockTimeoutRef = useRef<number | null>(null);
  const focusFrameRef = useRef<number | null>(null);
  const focusCloseTimeoutRef = useRef<number | null>(null);

  const [scrollState, setScrollState] = useState(DEFAULT_GROW_PATH_SCROLL_STATE);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<GrowPathCardId | null>(null);
  const [selectedCardRect, setSelectedCardRect] = useState<GrowPathCardRect | null>(null);
  const [focusAnimationReady, setFocusAnimationReady] = useState(false);

  const cardVisuals = getGrowPathCardVisuals(scrollState.progress);
  const canFocusCards = canFocusGrowPathCard(scrollState.progress);

  const commitState = (nextState: GrowPathScrollState) => {
    stateRef.current = nextState;
    startTransition(() => {
      setScrollState(nextState);
    });
  };

  const resetState = () => {
    stateRef.current = DEFAULT_GROW_PATH_SCROLL_STATE;
    setScrollState(DEFAULT_GROW_PATH_SCROLL_STATE);
  };

  const clearFocusTimers = () => {
    if (focusFrameRef.current !== null) {
      cancelAnimationFrame(focusFrameRef.current);
      focusFrameRef.current = null;
    }

    if (focusCloseTimeoutRef.current !== null) {
      window.clearTimeout(focusCloseTimeoutRef.current);
      focusCloseTimeoutRef.current = null;
    }
  };

  const clearCareerSnapLock = () => {
    careerSnapLockRef.current = false;

    if (careerSnapUnlockTimeoutRef.current !== null) {
      window.clearTimeout(careerSnapUnlockTimeoutRef.current);
      careerSnapUnlockTimeoutRef.current = null;
    }
  };

  const clearFocusState = () => {
    selectedCardIdRef.current = null;
    setSelectedCardId(null);
    setSelectedCardRect(null);
    setFocusAnimationReady(false);
  };

  const closeFocus = (immediate = false) => {
    if (!selectedCardIdRef.current) {
      return;
    }

    clearFocusTimers();

    if (immediate) {
      clearFocusState();
      return;
    }

    setFocusAnimationReady(false);
    focusCloseTimeoutRef.current = window.setTimeout(() => {
      clearFocusState();
    }, 560);
  };

  const openFocus = (cardId: GrowPathCardId, element: HTMLButtonElement) => {
    clearFocusTimers();

    selectedCardIdRef.current = cardId;
    setSelectedCardId(cardId);
    setSelectedCardRect(toCardRect(element));
    setFocusAnimationReady(false);

    focusFrameRef.current = requestAnimationFrame(() => {
      setFocusAnimationReady(true);
      focusFrameRef.current = null;
    });
  };

  const getSectionMetrics = () => {
    const section = sectionRef.current;
    if (!section) {
      return null;
    }

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const sectionHeight = section.offsetHeight;

    return {
      sectionTop,
      sectionHeight,
    };
  };

  const getCareerJourneyTop = () => {
    const careerJourneySection = document.getElementById(CAREER_JOURNEY_SECTION_ID);
    if (!careerJourneySection) {
      return null;
    }

    return careerJourneySection.getBoundingClientRect().top + window.scrollY;
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    const updateMode = () => {
      const nextIsMobile = mediaQuery.matches;
      setIsMobile(nextIsMobile);

      if (nextIsMobile) {
        hasSnappedOnCurrentExitRef.current = false;
        clearCareerSnapLock();
        closeFocus(true);
        resetState();
      }
    };

    updateMode();
    mediaQuery.addEventListener('change', updateMode);

    return () => mediaQuery.removeEventListener('change', updateMode);
  }, []);

  useEffect(() => {
    if (isMobile) {
      return;
    }

    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const metrics = getSectionMetrics();
      const careerJourneyTop = getCareerJourneyTop();
      if (!metrics || careerJourneyTop === null) {
        lastScrollYRef.current = window.scrollY;
        return;
      }

      const snapState = getGrowPathCareerSnapState({
        scrollY: window.scrollY,
        lastScrollY: lastScrollYRef.current,
        growPathTop: metrics.sectionTop,
        growPathHeight: metrics.sectionHeight,
        careerTop: careerJourneyTop,
        viewportHeight: window.innerHeight,
        growPathProgress: stateRef.current.progress,
        hasSnappedOnCurrentExit: hasSnappedOnCurrentExitRef.current,
      });

      if (snapState.shouldResetLatch) {
        hasSnappedOnCurrentExitRef.current = false;
      }

      if (snapState.shouldSnap) {
        const targetScrollY = getGrowPathCareerSnapTargetY(careerJourneyTop);
        hasSnappedOnCurrentExitRef.current = true;
        careerSnapLockRef.current = true;
        careerSnapTargetYRef.current = targetScrollY;
        if (careerSnapUnlockTimeoutRef.current !== null) {
          window.clearTimeout(careerSnapUnlockTimeoutRef.current);
        }

        window.scrollTo({
          top: targetScrollY,
          behavior: 'smooth',
        });

        careerSnapUnlockTimeoutRef.current = window.setTimeout(() => {
          window.scrollTo(0, careerSnapTargetYRef.current);
          clearCareerSnapLock();
        }, CAREER_JOURNEY_SNAP_LOCK_MS);
      }

      lastScrollYRef.current = window.scrollY;
    };

    const handleWheel = (event: WheelEvent) => {
      if (careerSnapLockRef.current) {
        event.preventDefault();
        window.scrollTo(0, careerSnapTargetYRef.current);
        return;
      }

      const focusWheelState = getGrowPathFocusWheelState(selectedCardIdRef.current);
      if (selectedCardIdRef.current) {
        if (!focusWheelState.shouldPreventScroll) {
          closeFocus(true);
        }

        return;
      }

      const metrics = getSectionMetrics();
      if (!metrics) {
        return;
      }

      const captureState = getGrowPathWheelCaptureState({
        scrollY: window.scrollY,
        sectionTop: metrics.sectionTop,
        sectionHeight: metrics.sectionHeight,
        state: stateRef.current,
        deltaY: event.deltaY,
        step: DEFAULT_GROW_PATH_WHEEL_STEP,
      });

      if (!captureState.shouldPreventScroll) {
        return;
      }

      event.preventDefault();
      if (captureState.targetScrollY !== null) {
        window.scrollTo(0, captureState.targetScrollY);
      }
      commitState(captureState.nextState);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isMobile]);

  useEffect(() => {
    if (!selectedCardId) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') {
        return;
      }

      event.preventDefault();
      closeFocus();
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCardId]);

  useEffect(() => {
    if (!canFocusCards && selectedCardIdRef.current) {
      closeFocus(true);
    }
  }, [canFocusCards]);

  useEffect(() => () => clearFocusTimers(), []);
  useEffect(() => () => clearCareerSnapLock(), []);

  if (isMobile) {
    return (
      <section className="relative overflow-hidden bg-[#f4eee5] px-6 py-14 md:px-12">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          <div className="relative overflow-hidden rounded-[2rem] border border-white/50 shadow-[0_20px_60px_rgba(83,57,38,0.16)]">
            <img
              src="/images/bg_growpath.jpeg"
              alt=""
              aria-hidden="true"
              className="h-[32vh] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-[#f4eee5]/70" />
          </div>

          <div className="flex flex-col gap-5">
            {GROW_PATH_CARD_IDS.map((cardId) => (
              <article
                key={cardId}
                className="overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/80 p-3 shadow-[0_18px_36px_rgba(71,52,38,0.14)] backdrop-blur-sm"
              >
                <img
                  src={CARD_IMAGE_BY_ID[cardId]}
                  alt={`Growth path step ${cardId.slice(-2)}`}
                  className="w-full rounded-[1.1rem] object-cover"
                />
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-[#f4eee5]">
      <div className="absolute inset-0">
        <img
          src="/images/bg_growpath.jpeg"
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),rgba(244,238,229,0.22)_42%,rgba(244,238,229,0.78)_100%)]" />
      </div>

      <GrowPathDesktopStage
        cardVisuals={cardVisuals}
        canFocusCards={canFocusCards}
        selectedCardId={selectedCardId}
        selectedCardRect={selectedCardRect}
        focusAnimationReady={focusAnimationReady}
        onCardClick={(cardId, element) => {
          if (!canFocusCards) {
            return;
          }

          if (selectedCardIdRef.current === cardId) {
            closeFocus();
            return;
          }

          openFocus(cardId, element);
        }}
        onCloseFocus={() => closeFocus()}
      />
    </section>
  );
}
