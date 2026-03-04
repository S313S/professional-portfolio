import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

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
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const beforeCandidates = useMemo(() => buildImageCandidates('images/before.png'), []);
  const afterCandidates = useMemo(() => buildImageCandidates('images/after.png'), []);
  const spotlightMask = useMemo(() => buildSpotlightMask(EXPERIENCE_MASK_RADIUS_PX), []);

  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);

  // Scroll Container setup
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom pointer tracking state to bridge vanilla JS and React
  const pointerStateRef = useRef({ x: 0.5, y: 0.5, hover: false });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // --- Choreography ---
  // The first 100vh (0 to ~0.15) is the initial hero state, which stays pinned via sticky.
  // 0.15 - 0.35: Image scales down, turns into 460x260 card hovering above center
  // 0.35 - 0.45: Envelope back & front appear from bottom
  // 0.45 - 0.55: Card drops into envelope
  // 0.55 - 0.65: Top flap folds down
  // 0.65 - 0.75: "xiaoci-memory" text draws and fades in
  // 0.75 - 0.95: Envelope explodes into characters
  // 0.95 - 1.00: Fade out

  // At scrub=0 we see the hero image covering screen
  // By scrub=0.15 we scale it up or let it float.

  // Hide UI text
  const titleOpacityScroll = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  const [winSize, setWinSize] = useState({ w: typeof window !== 'undefined' ? window.innerWidth : 1440, h: typeof window !== 'undefined' ? window.innerHeight : 900 });
  useEffect(() => {
    const onResize = () => setWinSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Image transforming to card
  const heroImageWidth = useTransform(scrollYProgress, [0.1, 0.3], [`${winSize.w}px`, '460px']);
  const heroImageHeight = useTransform(scrollYProgress, [0.1, 0.3], [`${winSize.h}px`, '260px']);
  const heroBorderRadius = useTransform(scrollYProgress, [0.1, 0.3], ['0px', '12px']);

  // Card moves down into envelope
  const cardY = useTransform(scrollYProgress,
    [0.1, 0.3, 0.45, 0.55],
    ['0vh', '-120px', '-120px', '0px']
  );

  // Fade out card and background as shatter happens
  const cardAndBgOpacity = useTransform(scrollYProgress, [0.75, 0.8], [1, 0]);

  // Envelope Animations
  const envelopeOpacity = useTransform(scrollYProgress, [0.3, 0.4], [0, 1]);
  const envelopeY = useTransform(scrollYProgress, [0.3, 0.45], ['20vh', '0vh']);
  const envelopeFadeOut = useTransform(scrollYProgress, [0.75, 0.8], [1, 0]);

  // Flap rotation - closed at 180
  const flapRotateX = useTransform(scrollYProgress, [0.55, 0.65], [0, 180]);
  const flapZIndex = useTransform(scrollYProgress, [0.55, 0.6], [10, 30]);

  // Handwriting Animations
  const pathLength = useTransform(scrollYProgress, [0.65, 0.73], [0, 1]);
  const textOpacity = useTransform(scrollYProgress, [0.7, 0.75], [0, 1]);

  // Shatter Animation
  const shatterProgress = useTransform(scrollYProgress, [0.75, 0.95], [0, 1]);
  const containerOpacity = useTransform(scrollYProgress, [0.95, 1], [1, 0]);

  const [particles, setParticles] = useState<{ id: number; char: string; x: number; y: number; rotate: number; scale: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    const chars = 'xiaoci-memory101010/*-+<>!?'.split('');
    const colors = ['#8B5A2B', '#EAE0D3', '#D4C3B1', '#C6A992', '#5A4C40'];
    const newParticles = Array.from({ length: 250 }).map((_, i) => ({
      id: i,
      char: chars[Math.floor(Math.random() * chars.length)],
      x: (Math.random() - 0.5) * window.innerWidth * 1.5,
      y: (Math.random() - 0.5) * window.innerHeight * 1.5,
      rotate: (Math.random() - 0.5) * 720,
      scale: Math.random() * 2 + 0.5,
      delay: Math.random() * 0.3,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setParticles(newParticles);
  }, []);

  // --- Hero Mouse Interactions & Shaders ---
  useEffect(() => {
    const section = containerRef.current;
    const overlay = overlayRef.current;
    if (!section || !overlay) return;

    let rafId = 0;
    let time = 0;

    const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

    const getLensFocus = (element: HTMLElement | null, radius: number) => {
      if (!element) return 0;
      const sectionRect = section.getBoundingClientRect();
      // Ensure we only calculate hover effect in the early scroll phases
      if (sectionRect.top <= -window.innerHeight * 0.5) return 0;

      const rect = element.getBoundingClientRect();
      const px = pointerStateRef.current.x * sectionRect.width;
      const py = pointerStateRef.current.y * sectionRect.height;

      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(px - cx, py - cy);
      return clamp01(1 - dist / radius);
    };

    const applyTextLensEffect = () => {
      const { hover } = pointerStateRef.current;
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

    setMaskPosition(0.5, 0.5);

    const handlePointerMove = (event: PointerEvent) => {
      // Use viewport coordinates as bounding rect since sticky position means section spans multiple pages
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;

      pointerStateRef.current.x = Math.min(1, Math.max(0, x));
      pointerStateRef.current.y = Math.min(1, Math.max(0, y));
      pointerStateRef.current.hover = true;

      const sectionRect = section.getBoundingClientRect();
      if (sectionRect.top > -window.innerHeight * 0.5) {
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
      if (!pointerStateRef.current.hover && sectionRect.top > -window.innerHeight * 0.5) {
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

      applyTextLensEffect();
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

  return (
    <div ref={containerRef} className="relative w-full h-[600vh] bg-black">
      <motion.div className="sticky top-0 w-full h-screen overflow-hidden bg-black flex items-center justify-center" style={{ opacity: containerOpacity }}>

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

        {/* --- DYNAMIC CARD (Initially covers whole screen) --- */}
        <motion.div
          className="absolute z-20 flex items-center justify-center overflow-hidden bg-black"
          style={{
            width: heroImageWidth,
            height: heroImageHeight,
            borderRadius: heroBorderRadius,
            y: cardY,
            opacity: cardAndBgOpacity,
            boxShadow: useTransform(scrollYProgress, [0.1, 0.2], ['0px 0px 0px rgba(0,0,0,0)', '0px 20px 40px rgba(0,0,0,0.5)']),
          }}
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
            className="absolute inset-0 h-full w-full object-cover"
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

        {/* --- TEXT UI LAYER (Fades out when scrolling) --- */}
        <motion.div
          className="absolute inset-0 z-20 pointer-events-none"
          style={{ opacity: titleOpacityScroll }}
        >
          <div className="absolute inset-0 bg-black/8" />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
          <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-auto">
            <a href="#experience" className="inline-block">
              <p className="animate-bounce text-sm text-white/70">Scroll to explore</p>
            </a>
          </div>
        </motion.div>


        {/* --- ENVELOPE GROUP --- */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ opacity: envelopeOpacity, y: envelopeY }}
        >
          {/* Envelope Back */}
          <motion.div
            className="absolute w-[500px] h-[280px] bg-[#E3D1BF] rounded-b-lg shadow-xl"
            style={{ opacity: envelopeFadeOut, zIndex: 10 }}
          >
            <div className="absolute inset-x-2 bottom-2 top-4 bg-[#D1BCB0] rounded-b-md" />
          </motion.div>

          {/* Envelope Front Flaps */}
          <motion.div
            className="absolute w-[500px] h-[280px] drop-shadow-2xl"
            style={{ opacity: envelopeFadeOut, zIndex: 30 }}
          >
            <svg viewBox="0 0 500 280" className="w-full h-full absolute inset-0">
              <defs>
                <filter id="envelope_shadow" x="-5%" y="-5%" width="110%" height="110%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
                </filter>
              </defs>
              <path d="M0 0 L0 280 L260 150 Z" fill="#EFE8E1" stroke="#D1BCB0" strokeWidth="1" filter="url(#envelope_shadow)" />
              <path d="M500 0 L500 280 L240 150 Z" fill="#F4EFEA" stroke="#D1BCB0" strokeWidth="1" filter="url(#envelope_shadow)" />
              <path d="M0 280 L250 140 L500 280 Z" fill="#F8F4F0" stroke="#D1BCB0" strokeWidth="1" filter="url(#envelope_shadow)" />
            </svg>

            {/* Handwriting Overlay */}
            <motion.div className="absolute inset-0 flex items-center justify-center z-40 top-16 right-[-20px]">
              <div className="relative transform -rotate-3">
                <svg width="240" height="80" viewBox="0 0 240 80" className="absolute inset-0 -top-2 left-6 opacity-40">
                  <motion.path
                    d="M10 60 C 20 50, 40 40, 60 55 C 80 70, 100 45, 120 50 C 140 55, 160 30, 180 45 C 200 60, 220 70, 230 40"
                    fill="transparent"
                    stroke="#8B5A2B"
                    strokeWidth="2"
                    strokeLinecap="round"
                    style={{ pathLength }}
                  />
                </svg>
                <motion.span
                  className="text-5xl text-[#8B5A2B] tracking-wide block pl-4"
                  style={{
                    opacity: textOpacity,
                    fontFamily: "'Caveat', cursive",
                    textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                >
                  xiaoci-memory
                </motion.span>
              </div>
            </motion.div>
          </motion.div>

          {/* Envelope Top Flap */}
          <motion.div
            className="absolute top-[60px] w-[500px] h-[160px] origin-top drop-shadow-[0_10px_10px_rgba(0,0,0,0.15)]"
            style={{
              opacity: envelopeFadeOut,
              rotateX: flapRotateX,
              zIndex: flapZIndex,
              transformStyle: 'preserve-3d',
            }}
          >
            <svg
              viewBox="0 0 500 160"
              className="w-full h-full absolute inset-0"
              style={{ backfaceVisibility: 'hidden' }}
              preserveAspectRatio="none"
            >
              <path d="M0 0 L250 160 L500 0 Z" fill="#EAE0D3" />
            </svg>
            <svg
              viewBox="0 0 500 160"
              className="w-full h-full absolute inset-0"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
              preserveAspectRatio="none"
            >
              <path d="M0 0 L250 160 L500 0 Z" fill="#EFE8E1" stroke="#D1BCB0" strokeWidth="1" />
            </svg>
          </motion.div>
        </motion.div>


        {/* --- PARTICLES SCATTER OVERLAY --- */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
        >
          {particles.map((p) => (
            <Particle key={p.id} shatterProgress={shatterProgress} p={p} />
          ))}
        </motion.div>

      </motion.div>
    </div>
  );
}
