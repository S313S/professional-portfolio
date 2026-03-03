import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';

const EXPERIENCE_TITLE_OPACITY = 0.09;
const EXPERIENCE_SUBTITLE_OPACITY = 0.07;
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

const EXPERIENCE_TITLE_LENS_RADIUS_PX = 320;
const EXPERIENCE_SUBTITLE_LENS_RADIUS_PX = 250;
const EXPERIENCE_TITLE_LENS_SCALE = 0.24;
const EXPERIENCE_SUBTITLE_LENS_SCALE = 0.16;
const EXPERIENCE_TITLE_LENS_BLUR_MAX = 1.8;
const EXPERIENCE_SUBTITLE_LENS_BLUR_MAX = 1.2;

const buildSpotlightMask = (radiusPx: number) =>
  `radial-gradient(circle ${radiusPx}px at var(--mx, 50%) var(--my, 50%), rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,0.25) 60%, rgba(0,0,0,0) 82%)`;

const buildImageCandidates = (relativePath: string) => {
  const normalized = relativePath.replace(/^\/+/, '');
  const base = import.meta.env.BASE_URL || '/';
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

export default function ExperienceHero() {
  const filterId = useId().replace(/:/g, '-');
  const sectionRef = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLImageElement>(null);
  const turbulenceRef = useRef<SVGFETurbulenceElement>(null);
  const displacementRef = useRef<SVGFEDisplacementMapElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const beforeCandidates = useMemo(() => buildImageCandidates('images/before.png'), []);
  const afterCandidates = useMemo(() => buildImageCandidates('images/after.png'), []);
  const spotlightMask = useMemo(() => buildSpotlightMask(EXPERIENCE_MASK_RADIUS_PX), []);

  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const overlay = overlayRef.current;
    if (!section || !overlay) return;

    let rafId = 0;
    let time = 0;
    let hover = false;
    let pointerX = 0.5;
    let pointerY = 0.5;

    const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

    const getLensFocus = (element: HTMLElement | null, radius: number) => {
      if (!element) return 0;
      const sectionRect = section.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      const px = pointerX * sectionRect.width;
      const py = pointerY * sectionRect.height;
      const cx = rect.left - sectionRect.left + rect.width / 2;
      const cy = rect.top - sectionRect.top + rect.height / 2;
      const dist = Math.hypot(px - cx, py - cy);
      return clamp01(1 - dist / radius);
    };

    const applyTextLensEffect = () => {
      const titleFocus = hover ? getLensFocus(titleRef.current, EXPERIENCE_TITLE_LENS_RADIUS_PX) : 0;
      const subtitleFocus = hover ? getLensFocus(subtitleRef.current, EXPERIENCE_SUBTITLE_LENS_RADIUS_PX) : 0;

      if (titleRef.current) {
        const opacity = EXPERIENCE_TITLE_OPACITY + titleFocus * (1 - EXPERIENCE_TITLE_OPACITY);
        const scale = 1 + titleFocus * EXPERIENCE_TITLE_LENS_SCALE;
        const blur = (1 - titleFocus) * EXPERIENCE_TITLE_LENS_BLUR_MAX;
        titleRef.current.style.opacity = opacity.toFixed(3);
        titleRef.current.style.transform = `translateZ(0) scale(${scale.toFixed(3)})`;
        titleRef.current.style.filter = `blur(${blur.toFixed(2)}px)`;
      }

      if (subtitleRef.current) {
        const opacity = EXPERIENCE_SUBTITLE_OPACITY + subtitleFocus * (1 - EXPERIENCE_SUBTITLE_OPACITY);
        const scale = 1 + subtitleFocus * EXPERIENCE_SUBTITLE_LENS_SCALE;
        const blur = (1 - subtitleFocus) * EXPERIENCE_SUBTITLE_LENS_BLUR_MAX;
        subtitleRef.current.style.opacity = opacity.toFixed(3);
        subtitleRef.current.style.transform = `translateZ(0) scale(${scale.toFixed(3)})`;
        subtitleRef.current.style.filter = `blur(${blur.toFixed(2)}px)`;
      }
    };

    const setMaskPosition = (x: number, y: number) => {
      overlay.style.setProperty('--mx', `${(x * 100).toFixed(2)}%`);
      overlay.style.setProperty('--my', `${(y * 100).toFixed(2)}%`);
    };

    setMaskPosition(pointerX, pointerY);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = section.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      pointerX = Math.min(1, Math.max(0, x));
      pointerY = Math.min(1, Math.max(0, y));
      hover = true;
      setMaskPosition(pointerX, pointerY);
    };

    const handleLeave = () => {
      hover = false;
    };

    section.addEventListener('pointermove', handlePointerMove);
    section.addEventListener('pointerenter', handlePointerMove);
    section.addEventListener('pointerleave', handleLeave);
    window.addEventListener('blur', handleLeave);

    const animate = () => {
      time += 0.016 * EXPERIENCE_FLOW_SPEED;

      if (!hover) {
        pointerX = 0.5 + Math.sin(time * 0.35) * 0.22;
        pointerY = 0.5 + Math.cos(time * 0.29) * 0.18;
        setMaskPosition(pointerX, pointerY);
      }

      if (turbulenceRef.current) {
        const freqX = EXPERIENCE_NOISE_BASE_X + Math.sin(time * EXPERIENCE_NOISE_SPEED_X) * EXPERIENCE_NOISE_WAVE_X;
        const freqY = EXPERIENCE_NOISE_BASE_Y + Math.cos(time * EXPERIENCE_NOISE_SPEED_Y) * EXPERIENCE_NOISE_WAVE_Y;
        turbulenceRef.current.setAttribute('baseFrequency', `${freqX.toFixed(4)} ${freqY.toFixed(4)}`);
      }

      if (displacementRef.current) {
        const baseScale = hover ? EXPERIENCE_DISPLACEMENT_HOVER : EXPERIENCE_DISPLACEMENT_IDLE;
        const wave = Math.sin(time * EXPERIENCE_DISPLACEMENT_SPEED) * EXPERIENCE_DISPLACEMENT_WAVE;
        displacementRef.current.setAttribute('scale', `${(baseScale + wave).toFixed(2)}`);
      }

      applyTextLensEffect();
      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      section.removeEventListener('pointermove', handlePointerMove);
      section.removeEventListener('pointerenter', handlePointerMove);
      section.removeEventListener('pointerleave', handleLeave);
      window.removeEventListener('blur', handleLeave);
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative w-full h-screen overflow-hidden bg-black">
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

      <img
        alt="Experience before state"
        src={beforeCandidates[beforeIndex]}
        onError={() => setBeforeIndex((index) => Math.min(index + 1, beforeCandidates.length - 1))}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
        draggable={false}
      />

      <img
        ref={overlayRef}
        alt="Experience after state"
        src={afterCandidates[afterIndex]}
        onError={() => setAfterIndex((index) => Math.min(index + 1, afterCandidates.length - 1))}
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
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

      <div className="pointer-events-none absolute inset-0 bg-black/8" />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center text-white [text-shadow:0_2px_18px_rgba(0,0,0,0.45)]"
        >
          <h2
            ref={titleRef}
            className="mb-4 origin-center text-6xl font-bold tracking-tighter md:text-8xl"
            style={{ opacity: EXPERIENCE_TITLE_OPACITY }}
          >
            EXPERIENCE
          </h2>
          <p
            ref={subtitleRef}
            className="origin-center text-xl font-light tracking-widest md:text-2xl"
            style={{ opacity: EXPERIENCE_SUBTITLE_OPACITY }}
          >
            EXPLORE THE JOURNEY
          </p>
        </motion.div>
      </div>

      <div className="pointer-events-none absolute bottom-10 left-0 right-0 z-10 text-center">
        <a href="#experience" className="pointer-events-auto inline-block">
          <p className="animate-bounce text-sm text-white/70">Scroll to explore</p>
        </a>
      </div>
    </section>
  );
}
