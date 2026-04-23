import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useTransform, MotionValue } from 'motion/react';

import {
  getExperienceHeroSnapState,
  getExperienceHeroSnapTargetY,
  shouldLockExperienceHeroOnScroll,
} from './ExperienceHero.logic';
import { VIDEO_SCROLL_TRANSITION_SECTION_ID } from './VideoScrollTransition.logic';
import { armScrollMomentumLock } from '../scrollMomentumLock';

const EXPERIENCE_MASK_RADIUS_PX = 260;
const EXPERIENCE_FLOW_SPEED = 1.75;

const EXPERIENCE_NOISE_BASE_X = 0.0068;
const EXPERIENCE_NOISE_BASE_Y = 0.0094;
const EXPERIENCE_NOISE_WAVE_X = 0.0022;
const EXPERIENCE_NOISE_WAVE_Y = 0.0024;
const EXPERIENCE_NOISE_SPEED_X = 1.45;
const EXPERIENCE_NOISE_SPEED_Y = 1.15;

const EXPERIENCE_DISPLACEMENT_IDLE = 52;
const EXPERIENCE_DISPLACEMENT_HOVER = 72;
const EXPERIENCE_DISPLACEMENT_WAVE = 14;
const EXPERIENCE_DISPLACEMENT_SPEED = 2.05;
const EXPERIENCE_DESKTOP_INTERACTION_QUERY = '(max-width: 767px), (pointer: coarse)';

const buildSpotlightMask = (radiusPx: number) =>
  `radial-gradient(circle ${radiusPx}px at var(--mx, 50%) var(--my, 50%), rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 82%)`;

const buildImageCandidates = (relativePath: string) => {
  const normalized = relativePath.replace(/^\/+/, '');
  const base = import.meta.env?.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const aliasPath = normalized.replace(/^images\//, 'public-images/');

  return Array.from(
    new Set([
      `${normalizedBase}${normalized}`,
      `${normalizedBase}${aliasPath}`,
      `/${normalized}`,
      `/${aliasPath}`,
    ]),
  );
};

// --- Particles ---
interface ParticleProps {
  key?: number | string;
  shatterProgress: MotionValue<number>;
  p: {
    id: number;
    char: string;
    x: number;
    y: number;
    rotate: number;
    scale: number;
    delay: number;
    color: string;
  };
}

const Particle = ({ shatterProgress, p }: ParticleProps) => {
  const px = useTransform(shatterProgress, [0, 1], [0, p.x]);
  const py = useTransform(shatterProgress, [0, 1], [0, p.y]);
  const protate = useTransform(shatterProgress, [0, 1], [0, p.rotate]);

  const popacity = useTransform(
    shatterProgress,
    [p.delay * 0.5, p.delay * 0.5 + 0.1, 0.8 + p.delay * 0.2, 1],
    [0, 1, 1, 0]
  );

  return (
    <motion.span
      className="absolute font-serif text-2xl font-bold"
      style={{
        x: px,
        y: py,
        rotate: protate,
        scale: p.scale,
        opacity: popacity,
        color: p.color,
      }}
    >
      {p.char}
    </motion.span>
  );
};

export default function ExperienceHero() {
  const filterId = useId().replace(/:/g, '-');

  // Hero Section Refs & State
  const overlayRef = useRef<HTMLImageElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);

  const beforeCandidates = useMemo(() => buildImageCandidates('images/before.png'), []);
  const afterCandidates = useMemo(() => buildImageCandidates('images/after.png'), []);
  const spotlightMask = useMemo(() => buildSpotlightMask(EXPERIENCE_MASK_RADIUS_PX), []);

  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);

  // Scroll Container setup
  const containerRef = useRef<HTMLDivElement>(null);
  const hasSnappedOnCurrentEntryRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const transitionArmedRef = useRef(false);
  const allowDesktopInteractionsRef = useRef(true);

  // Custom pointer tracking state to bridge vanilla JS and React
  const pointerStateRef = useRef({ x: 0.5, y: 0.5, hover: false });

  // --- Hero Mouse Interactions & Shaders ---
  useEffect(() => {
    const section = containerRef.current;
    if (!section) return;

    let rafId = 0;
    let time = 0;

    const setMaskPosition = (x: number, y: number) => {
      section.style.setProperty('--mx', `${(x * 100).toFixed(2)}%`);
      section.style.setProperty('--my', `${(y * 100).toFixed(2)}%`);
    };

    setMaskPosition(0.5, 0.5);

    const handlePointerMove = (event: PointerEvent) => {
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;

      pointerStateRef.current.x = Math.min(1, Math.max(0, x));
      pointerStateRef.current.y = Math.min(1, Math.max(0, y));
      pointerStateRef.current.hover = true;

      const sectionRect = section.getBoundingClientRect();
      if (sectionRect.top > -window.innerHeight * 1.5) {
        setMaskPosition(pointerStateRef.current.x, pointerStateRef.current.y);
      }
    };

    const handleLeave = () => {
      pointerStateRef.current.hover = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerleave', handleLeave);
    window.addEventListener('blur', handleLeave);

    const animate = () => {
      time += 0.016 * EXPERIENCE_FLOW_SPEED;

      const sectionRect = section.getBoundingClientRect();
      if (!pointerStateRef.current.hover && sectionRect.top > -window.innerHeight * 1.5) {
        pointerStateRef.current.x = 0.5 + Math.sin(time * 0.35) * 0.22;
        pointerStateRef.current.y = 0.5 + Math.cos(time * 0.29) * 0.18;
        setMaskPosition(pointerStateRef.current.x, pointerStateRef.current.y);
      }

      if (turbulenceRef.current) {
        const freqX = EXPERIENCE_NOISE_BASE_X + Math.sin(time * EXPERIENCE_NOISE_SPEED_X) * EXPERIENCE_NOISE_WAVE_X;
        const freqY = EXPERIENCE_NOISE_BASE_Y + Math.cos(time * EXPERIENCE_NOISE_SPEED_Y) * EXPERIENCE_NOISE_WAVE_Y;
        turbulenceRef.current.setAttribute('baseFrequency', `${freqX.toFixed(4)} ${freqY.toFixed(4)}`);
      }

      if (displacementRef.current) {
        const baseScale = pointerStateRef.current.hover ? EXPERIENCE_DISPLACEMENT_HOVER : EXPERIENCE_DISPLACEMENT_IDLE;
        const wave = Math.sin(time * EXPERIENCE_DISPLACEMENT_SPEED) * EXPERIENCE_DISPLACEMENT_WAVE;
        displacementRef.current.setAttribute('scale', `${(baseScale + wave).toFixed(2)}`);
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerleave', handleLeave);
      window.removeEventListener('blur', handleLeave);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(EXPERIENCE_DESKTOP_INTERACTION_QUERY);
    const updateDesktopInteractionMode = () => {
      allowDesktopInteractionsRef.current = !mediaQuery.matches;
    };

    updateDesktopInteractionMode();
    mediaQuery.addEventListener('change', updateDesktopInteractionMode);

    return () => {
      mediaQuery.removeEventListener('change', updateDesktopInteractionMode);
    };
  }, []);

  useEffect(() => {
    const section = containerRef.current;
    if (!section) {
      return;
    }

    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const sectionTop = section.getBoundingClientRect().top + scrollY;
      const sectionHeight = section.offsetHeight;
      const snapState = getExperienceHeroSnapState({
        scrollY,
        lastScrollY: lastScrollYRef.current,
        sectionTop,
        sectionHeight,
        viewportHeight: window.innerHeight,
        hasSnappedOnCurrentEntry: hasSnappedOnCurrentEntryRef.current,
      });

      if (snapState.shouldResetLatch) {
        hasSnappedOnCurrentEntryRef.current = false;
        transitionArmedRef.current = false;
      }

      if (snapState.shouldSnap) {
        hasSnappedOnCurrentEntryRef.current = true;
        armScrollMomentumLock();
        window.scrollTo({
          top: getExperienceHeroSnapTargetY(sectionTop),
          behavior: 'smooth',
        });
      }

      if (
        allowDesktopInteractionsRef.current &&
        shouldLockExperienceHeroOnScroll({
          scrollY,
          lastScrollY: lastScrollYRef.current,
          sectionTop,
          sectionHeight,
          viewportHeight: window.innerHeight,
          hasSnappedOnCurrentEntry: hasSnappedOnCurrentEntryRef.current,
          transitionArmed: transitionArmedRef.current,
        })
      ) {
        const snapTargetY = getExperienceHeroSnapTargetY(sectionTop);
        window.scrollTo(0, snapTargetY);
        lastScrollYRef.current = snapTargetY;
        return;
      }

      lastScrollYRef.current = scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (!allowDesktopInteractionsRef.current || transitionArmedRef.current || event.deltaY <= 0) {
        return;
      }

      const section = containerRef.current;
      if (!section || !hasSnappedOnCurrentEntryRef.current) {
        return;
      }

      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const sectionHeight = section.offsetHeight;
      const snapTargetY = getExperienceHeroSnapTargetY(sectionTop);
      const sectionBottom = sectionTop + sectionHeight;
      const isWithinHeroLockBand =
        window.scrollY >= snapTargetY && window.scrollY < sectionBottom;

      if (!isWithinHeroLockBand) {
        return;
      }

      event.preventDefault();
      window.scrollTo(0, snapTargetY);
      lastScrollYRef.current = snapTargetY;
    };

    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  const handleDoubleClick = () => {
    if (!allowDesktopInteractionsRef.current) {
      return;
    }

    const nextSection = document.getElementById(VIDEO_SCROLL_TRANSITION_SECTION_ID);
    if (!nextSection) {
      return;
    }

    transitionArmedRef.current = true;
    const targetScrollY = nextSection.getBoundingClientRect().top + window.scrollY;
    lastScrollYRef.current = targetScrollY;
    window.scrollTo(0, targetScrollY);
  };

  return (
    <div
      id="experience"
      ref={containerRef}
      className="relative w-full h-[100dvh] bg-[#FDFCF8]"
      onDoubleClick={handleDoubleClick}
    >
      <motion.div
        className="sticky top-0 w-full overflow-hidden bg-[#FDFCF8] flex items-center justify-center"
        style={{
          height: '100dvh',
          minHeight: '100dvh',
        }}
      >

        {/* Shaders */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute h-0 w-0"
          style={{ position: 'absolute', width: 0, height: 0 }}
        >
          <defs>
            <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
              <feTurbulence
                ref={turbulenceRef}
                type="fractalNoise"
                baseFrequency="0.004 0.006"
                numOctaves={2}
                seed={9}
                result="noise"
              />
              <feDisplacementMap
                ref={displacementRef}
                in="SourceGraphic"
                in2="noise"
                scale={34}
                xChannelSelector="R"
                yChannelSelector="G"
              />
            </filter>
          </defs>
        </svg>

        {/* --- FULLSCREEN BACKGROUND IMAGE --- */}
        <motion.div
          className="absolute z-20 flex items-center justify-center overflow-hidden bg-black"
          style={{ inset: '-4px -2px -16px -2px' }}
        >
          <img
            alt="Experience before state"
            src={beforeCandidates[beforeIndex]}
            onError={() => setBeforeIndex((index) => Math.min(index + 1, beforeCandidates.length - 1))}
            className="absolute inset-0 h-full w-full object-cover"
            draggable={false}
          />

          <img
            ref={overlayRef}
            alt="Experience after state"
            src={afterCandidates[afterIndex]}
            onError={() => setAfterIndex((index) => Math.min(index + 1, afterCandidates.length - 1))}
            className="absolute inset-0 h-full w-full object-cover pointer-events-none"
            draggable={false}
            style={{
              filter: `url(#${filterId})`,
              WebkitMaskImage: spotlightMask,
              maskImage: spotlightMask,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
            }}
          />
        </motion.div>

        {/* --- INIT TEXT UI LAYER (Fades out when scrolling) --- */}
        <motion.div className="absolute inset-0 z-40 pointer-events-none">
          <div className="absolute inset-0 bg-black/8" />

          {/* DIMMED BACKGROUND TEXT */}
          <div className="absolute inset-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute left-1/2 top-1/2 w-max -translate-x-1/2 -translate-y-1/2 text-center text-white/20 blur-[2px] transition-all duration-300"
            >
              <h2 className="mb-4 text-6xl font-bold tracking-tighter md:text-8xl">EXPERIENCE</h2>
              <p className="text-xl font-light tracking-widest md:text-2xl">EXPLORE THE JOURNEY</p>
            </motion.div>
          </div>

          {/* MASKED REVEAL TEXT */}
          <div
            className="absolute inset-0"
            style={{
              WebkitMaskImage: spotlightMask,
              maskImage: spotlightMask,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="absolute left-1/2 top-1/2 w-max -translate-x-1/2 -translate-y-1/2 text-center text-white [text-shadow:0_2px_12px_rgba(255,255,255,0.45)] scale-[1.02]"
            >
              <h2 className="mb-4 text-6xl font-bold tracking-tighter md:text-8xl">EXPERIENCE</h2>
              <p className="text-xl font-light tracking-widest md:text-2xl">EXPLORE THE JOURNEY</p>
            </motion.div>
          </div>

          <div className="pointer-events-auto absolute bottom-10 left-1/2 -translate-x-1/2">
            <p className="animate-bounce text-center text-sm text-white/70">Double click to explore</p>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
