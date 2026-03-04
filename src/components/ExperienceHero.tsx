import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

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
  // 0.35 - 0.50: Wooden Easel fades in behind the card
  // 0.50 - 0.70: Left and Right text blocks fade in alongside the easel
  // 0.70 - 0.95: Hold the final composed state
  // 0.95 - 1.00: Fade out the whole container

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

  // Easel Animations
  const easelOpacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);
  const easelY = useTransform(scrollYProgress, [0.35, 0.5], ['30px', '0px']);

  // Text Fade In
  const leftTextOpacity = useTransform(scrollYProgress, [0.5, 0.65], [0, 1]);
  const leftTextY = useTransform(scrollYProgress, [0.5, 0.65], ['20px', '0px']);

  const rightTextOpacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1]);
  const rightTextY = useTransform(scrollYProgress, [0.55, 0.7], ['20px', '0px']);

  // Top Title Reveal Animation (Appears above the easel)
  const topTitleOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const topTitleY = useTransform(scrollYProgress, [0.45, 0.6], ['-30px', '0px']);

  // Master fade out for transitioning to next section
  const containerOpacity = useTransform(scrollYProgress, [0.95, 1], [1, 0]);

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

  return (
    <div id="experience-hero" ref={containerRef} className="relative w-full h-[600vh] bg-[#FDFCF8]">
      <motion.div className="sticky top-0 w-full h-screen overflow-hidden bg-[#FDFCF8] flex items-center justify-center" style={{ opacity: containerOpacity }}>

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

        {/* --- TOP TITLE --- */}
        <motion.div
          className="absolute top-[8%] left-[10%] right-[10%] xl:left-[15%] xl:right-[15%] flex justify-center z-40 pointer-events-none"
          style={{ opacity: topTitleOpacity, y: topTitleY }}
        >
          <img
            src="/images/top-title.png"
            alt="The Digital World Through Xiaoci's Eyes"
            className="w-full object-contain drop-shadow-md"
            draggable={false}
          />
        </motion.div>

        {/* --- EASEL BACKGROUND LAYER --- */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
          style={{ opacity: easelOpacity, y: easelY }}
        >
          {/* We position the easel relative to the center, pushing it down slightly so the card sits on its shelf */}
          <div className="relative w-[750px] h-[750px] transform translate-y-[180px]">
            <img
              src="/images/easel-removebg.png"
              alt="Wooden Easel"
              className="absolute inset-0 w-full h-full object-contain opacity-100 drop-shadow-xl"
              draggable={false}
            />
          </div>
        </motion.div>

        {/* --- LEFT SIDE TEXT --- */}
        <motion.div
          className="absolute left-[10%] xl:left-[15%] top-1/2 -translate-y-1/2 z-30 pointer-events-none max-w-[300px]"
          style={{ opacity: leftTextOpacity, y: leftTextY }}
        >
          <p className="text-2xl md:text-3xl font-medium tracking-wide text-zinc-900 leading-tight mb-8">
            Capturing the<br />
            hazy poetry of
          </p>
          <p className="text-2xl md:text-3xl font-medium tracking-wide text-zinc-900 leading-tight">
            Everything is<br />
            an <span className="text-[#96b4fb] font-semibold">inspiration</span>
          </p>
        </motion.div>

        {/* --- RIGHT SIDE TEXT --- */}
        <motion.div
          className="absolute right-[10%] xl:right-[15%] top-1/2 -translate-y-1/2 z-30 pointer-events-none max-w-[300px]"
          style={{ opacity: rightTextOpacity, y: rightTextY }}
        >
          <p className="text-2xl md:text-3xl font-medium tracking-wide text-zinc-900 leading-tight mb-8 text-right">
            the digital<br />
            <span className="text-[#96b4fb] font-semibold">world</span>.
          </p>
          <p className="text-2xl md:text-3xl font-medium tracking-wide text-zinc-900 leading-tight text-right">
            what you see<br />
            is a painting.
          </p>
        </motion.div>

        {/* --- HERO INITIAL TEXT UI LAYER (Fades out when scrolling) --- */}
        <motion.div
          className="absolute inset-0 z-40 pointer-events-none"
          style={{ opacity: titleOpacityScroll }}
        >
          <div className="absolute inset-0 bg-black/8" />

          {/* DIMMED BACKGROUND TEXT */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center text-white/20 blur-[2px] transition-all duration-300"
            >
              <h2 className="mb-4 text-6xl font-bold tracking-tighter md:text-8xl">EXPERIENCE</h2>
              <p className="text-xl font-light tracking-widest md:text-2xl">EXPLORE THE JOURNEY</p>
            </motion.div>
          </div>

          {/* MASKED REVEAL TEXT */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
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
              className="text-center text-white [text-shadow:0_2px_12px_rgba(255,255,255,0.45)] scale-[1.02]"
            >
              <h2 className="mb-4 text-6xl font-bold tracking-tighter md:text-8xl">EXPERIENCE</h2>
              <p className="text-xl font-light tracking-widest md:text-2xl">EXPLORE THE JOURNEY</p>
            </motion.div>
          </div>

          <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-auto">
            <a href="#experience" className="inline-block">
              <p className="animate-bounce text-sm text-white/70">Scroll to explore</p>
            </a>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
