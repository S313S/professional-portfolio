import { useRef, useMemo, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'motion/react';

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

    // Particles fade in right as shatter starts, then fade out near the end
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

export default function ExperienceTransition() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start end', 'end end'], // Tracks from container entering viewport to container leaving
    });

    const afterCandidates = useMemo(() => buildImageCandidates('images/after.png'), []);
    const [afterIndex, setAfterIndex] = useState(0);

    // --- Choreography ---
    // 0.00 - 0.20: Container enters screen
    // 0.20 - 0.40: Image rises from bottom, scales down from 1.5x, turns into 460x260 card hovering above center
    // 0.40 - 0.50: Envelope back & front appear from bottom
    // 0.50 - 0.60: Card drops into envelope
    // 0.60 - 0.70: Top flap folds down
    // 0.70 - 0.80: "xiaoci-memory" text draws and fades in
    // 0.80 - 0.95: Envelope explodes into characters
    // 0.95 - 1.00: Fade out

    // --- Image / Card Animations ---
    const cardScale = useTransform(scrollYProgress, [0.2, 0.4], [1.5, 1]);
    // Start low, hover above envelope, then drop in
    const cardY = useTransform(scrollYProgress,
        [0.2, 0.4, 0.5, 0.6],
        ['60vh', '-120px', '-120px', '0px']
    );
    const cardBorderRadius = useTransform(scrollYProgress, [0.2, 0.35], ['0px', '12px']);
    const cardOpacity = useTransform(scrollYProgress, [0.8, 0.85], [1, 0]); // Fade out when shatter starts

    // --- Envelope Animations ---
    const envelopeOpacity = useTransform(scrollYProgress, [0.35, 0.45], [0, 1]);
    const envelopeY = useTransform(scrollYProgress, [0.35, 0.5], ['20vh', '0vh']);
    const envelopeFadeOut = useTransform(scrollYProgress, [0.8, 0.85], [1, 0]);

    // Flap rotation - closed at 180
    const flapRotateX = useTransform(scrollYProgress, [0.6, 0.7], [0, 180]);
    const flapZIndex = useTransform(scrollYProgress, [0.6, 0.65], [10, 30]);

    // --- Handwriting Animations ---
    const pathLength = useTransform(scrollYProgress, [0.7, 0.78], [0, 1]);
    const textOpacity = useTransform(scrollYProgress, [0.75, 0.8], [0, 1]);

    // --- Shatter / Scatter Animation ---
    const shatterProgress = useTransform(scrollYProgress, [0.8, 0.95], [0, 1]);
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

    return (
        <div ref={containerRef} className="relative w-full h-[600vh] bg-black">
            <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center bg-black">

                {/* Main Composition Wrapper */}
                <motion.div className="relative w-[600px] h-[400px] flex items-center justify-center" style={{ opacity: containerOpacity }}>

                    {/* Card (moves from outside into envelope) */}
                    <motion.div
                        className="absolute z-20 w-[460px] h-[260px] overflow-hidden shadow-2xl bg-zinc-800"
                        style={{
                            scale: cardScale,
                            y: cardY,
                            borderRadius: cardBorderRadius,
                            opacity: cardOpacity,
                            transformOrigin: 'top center',
                        }}
                    >
                        <img
                            src={afterCandidates[afterIndex]}
                            onError={() => setAfterIndex((i) => Math.min(i + 1, afterCandidates.length - 1))}
                            alt="Experience Memory"
                            className="w-full h-full object-cover"
                        />
                    </motion.div>

                    {/* Envelope Group */}
                    <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        style={{ opacity: envelopeOpacity, y: envelopeY }}
                    >
                        {/* Envelope Back */}
                        <motion.div
                            className="absolute w-[500px] h-[280px] bg-[#E3D1BF] rounded-b-lg shadow-xl"
                            style={{ opacity: envelopeFadeOut, zIndex: 10 }}
                        >
                            {/* Inner shadow/lining */}
                            <div className="absolute inset-x-2 bottom-2 top-4 bg-[#D1BCB0] rounded-b-md" />
                        </motion.div>

                        {/* Envelope Front Flaps */}
                        <motion.div
                            className="absolute w-[500px] h-[280px] pointer-events-none drop-shadow-2xl"
                            style={{ opacity: envelopeFadeOut, zIndex: 30 }}
                        >
                            <svg viewBox="0 0 500 280" className="w-full h-full absolute inset-0">
                                <defs>
                                    <filter id="envelope_shadow" x="-5%" y="-5%" width="110%" height="110%">
                                        <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity="0.15" />
                                    </filter>
                                </defs>
                                {/* Left flap */}
                                <path d="M0 0 L0 280 L260 150 Z" fill="#EFE8E1" stroke="#D1BCB0" strokeWidth="1" filter="url(#envelope_shadow)" />
                                {/* Right flap */}
                                <path d="M500 0 L500 280 L240 150 Z" fill="#F4EFEA" stroke="#D1BCB0" strokeWidth="1" filter="url(#envelope_shadow)" />
                                {/* Bottom flap */}
                                <path d="M0 280 L250 140 L500 280 Z" fill="#F8F4F0" stroke="#D1BCB0" strokeWidth="1" filter="url(#envelope_shadow)" />
                            </svg>

                            {/* Handwriting Overlay */}
                            <motion.div className="absolute inset-0 flex items-center justify-center z-40 top-16 right-[-20px]">
                                <div className="relative transform -rotate-3">
                                    {/* Drawing trace */}
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
                                    {/* Final Text */}
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

                        {/* Envelope Top Flap (closes over card) */}
                        <motion.div
                            className="absolute top-[60px] w-[500px] h-[160px] origin-top drop-shadow-[0_10px_10px_rgba(0,0,0,0.15)]"
                            style={{
                                opacity: envelopeFadeOut,
                                rotateX: flapRotateX,
                                zIndex: flapZIndex,
                                transformStyle: 'preserve-3d',
                            }}
                        >
                            {/* Front of Flap (visible when open) */}
                            <svg
                                viewBox="0 0 500 160"
                                className="w-full h-full absolute inset-0"
                                style={{ backfaceVisibility: 'hidden' }}
                                preserveAspectRatio="none"
                            >
                                <path d="M0 0 L250 160 L500 0 Z" fill="#EAE0D3" />
                            </svg>
                            {/* Back of Flap (visible when closed, i.e., rotated 180deg) */}
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

                </motion.div>

                {/* Particles Overlay (shattering envelope) */}
                <motion.div
                    className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden"
                >
                    {particles.map((p) => (
                        <Particle key={p.id} shatterProgress={shatterProgress} p={p} />
                    ))}
                </motion.div>

            </div>
        </div>
    );
}
