import { startTransition, useEffect, useRef, useState, type CSSProperties } from 'react';

import {
  DEFAULT_GROW_PATH_SCROLL_STATE,
  DEFAULT_GROW_PATH_WHEEL_STEP,
  GROW_PATH_CARD_IDS,
  getGrowPathCardVisuals,
  getGrowPathWheelCaptureState,
  type GrowPathCardId,
  type GrowPathScrollState,
} from './GrowPathScrollSection.logic';

const MOBILE_MEDIA_QUERY = '(max-width: 767px), (pointer: coarse)';

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
    left: '18%',
    top: '58%',
    width: 'clamp(180px, 19vw, 285px)',
  },
  growPath_02: {
    left: '36%',
    top: '42%',
    width: 'clamp(180px, 18.5vw, 280px)',
  },
  growPath_03: {
    left: '59%',
    top: '50%',
    width: 'clamp(195px, 20vw, 310px)',
  },
  growPath_04: {
    left: '81%',
    top: '46%',
    width: 'clamp(155px, 16vw, 240px)',
  },
};

export default function GrowPathScrollSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stateRef = useRef<GrowPathScrollState>(DEFAULT_GROW_PATH_SCROLL_STATE);

  const [scrollState, setScrollState] = useState(DEFAULT_GROW_PATH_SCROLL_STATE);
  const [isMobile, setIsMobile] = useState(false);

  const cardVisuals = getGrowPathCardVisuals(scrollState.progress);

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

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);

    const updateMode = () => {
      const nextIsMobile = mediaQuery.matches;
      setIsMobile(nextIsMobile);

      if (nextIsMobile) {
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

    const handleWheel = (event: WheelEvent) => {
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

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, [isMobile]);

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

      <div className="pointer-events-none absolute inset-0">
        {GROW_PATH_CARD_IDS.map((cardId) => {
          const layout = DESKTOP_CARD_LAYOUTS[cardId];
          const visual = cardVisuals[cardId];
          const style: CSSProperties = {
            left: layout.left,
            top: layout.top,
            width: layout.width,
            opacity: visual.opacity,
            zIndex: visual.zIndex,
            transform: `translate(calc(-50% + ${visual.translateX}vw), calc(-50% + ${visual.translateY}vh)) scale(${visual.scale}) rotate(${visual.rotate}deg)`,
          };

          return (
            <div
              key={cardId}
              className="absolute will-change-transform"
              style={style}
            >
              <img
                src={CARD_IMAGE_BY_ID[cardId]}
                alt={`Growth path step ${cardId.slice(-2)}`}
                className="w-full rounded-[1.4rem] shadow-[0_30px_65px_rgba(69,49,34,0.18)]"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
