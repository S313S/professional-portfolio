import { motion, AnimatePresence, useScroll, useTransform } from "motion/react";
import { personalData } from "../data";
import { ArrowRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

const TypingWord: React.FC<{
  word: string;
  sentence: string;
  onComplete: () => void;
}> = ({
  word,
  sentence,
  onComplete,
}) => {
  const [text, setText] = useState("");
  const [isFullSentence, setIsFullSentence] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const animate = async () => {
      // Type word
      for (let i = 1; i <= word.length; i++) {
        if (!isMounted) return;
        setText(word.substring(0, i));
        await new Promise((r) => setTimeout(r, 150));
      }

      if (!isMounted) return;
      await new Promise((r) => setTimeout(r, 500));

      // Sentence
      if (!isMounted) return;
      setText(sentence);
      setIsFullSentence(true);

      if (!isMounted) return;
      await new Promise((r) => setTimeout(r, 2000));

      if (!isMounted) return;
      onComplete();
    };
    animate();
    return () => {
      isMounted = false;
    };
  }, [word, sentence, onComplete]);

  return (
    <motion.text
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      textAnchor="middle"
      fontFamily="var(--font-serif)"
      fontSize={isFullSentence ? "24" : "32"}
      fontWeight={isFullSentence ? "400" : "600"}
      fill="#18181b"
      className="select-none"
    >
      {text}
    </motion.text>
  );
};

const FloatingText = ({ x, y }: { x: number; y: number }) => {
  const messages = [
    { word: "design", sentence: "Design is intelligence made visible." },
    { word: "change", sentence: "Change is the end result of all true learning." },
    { word: "create", sentence: "To create is to give a shape to one's fate." },
    { word: "innovate", sentence: "Innovation distinguishes between a leader and a follower." },
    { word: "simplify", sentence: "Simplicity is the ultimate sophistication." }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const handleComplete = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % messages.length);
      setIsVisible(true);
    }, 10000);
  };

  return (
    <g transform={`translate(${x}, ${y - 60})`}>
      <AnimatePresence mode="wait">
        {isVisible && (
          <TypingWord
            key={currentIndex}
            word={messages[currentIndex].word}
            sentence={messages[currentIndex].sentence}
            onComplete={handleComplete}
          />
        )}
      </AnimatePresence>
    </g>
  );
};

export default function Hero() {
  // Repeat text to ensure it covers the path
  const text = personalData.heroSpiralText.repeat(15);
  const pathRef = useRef<SVGPathElement>(null);
  const [ribbonConfig, setRibbonConfig] = useState({
    dashArray: "0 0",
    pill: { x: 0, y: 0, angle: 0 },
    isReady: false
  });

  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.8], [1, 0.9]);

  useEffect(() => {
    if (pathRef.current) {
      const path = pathRef.current;
      const totalLength = path.getTotalLength();
      
      // Find the point where x is approximately 720 (center of screen, aligned with button)
      // The flat segment is between x=570 and x=870
      // We use binary search to find the length corresponding to x=720
      let low = totalLength * 0.3; // Start after the initial loop
      let high = totalLength;
      let splitPoint = totalLength * 0.5;

      for(let i = 0; i < 20; i++) {
         const mid = (low + high) / 2;
         const p = path.getPointAtLength(mid);
         if (p.x < 720) {
             low = mid;
         } else {
             high = mid;
         }
      }
      splitPoint = (low + high) / 2;
      
      // Get position and angle for the pill
      const point = path.getPointAtLength(splitPoint);
      
      // For the angle, since we are on a flat line, it should be 0.
      // But let's calculate it to be safe and consistent
      const pointBefore = path.getPointAtLength(splitPoint - 1);
      const pointAfter = path.getPointAtLength(splitPoint + 1);
      const angle = Math.atan2(pointAfter.y - pointBefore.y, pointAfter.x - pointBefore.x) * (180 / Math.PI);

      setRibbonConfig({
        // Stroke Dasharray: 0 (dot), Gap (splitPoint), Dash (remaining), Gap 0
        dashArray: `0 ${splitPoint} ${totalLength} 0`,
        pill: { x: point.x, y: point.y, angle: angle },
        isReady: true
      });
    }
  }, []);

  return (
    <section ref={containerRef} id="home" className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-[#FDFCF8]">
      {/* Ribbon Text Background */}
      <motion.div style={{ opacity, scale }} className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none select-none">
        <svg
          className="w-full h-full min-w-[1000px]"
          viewBox="0 0 1440 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* The Main Path */}
            <path
              id="ribbonPath"
              d="M -200 200 C 50 200 150 400 50 500 C -50 600 -150 400 0 300 C 200 100 470 580 570 580 L 870 580 C 1120 580 1600 760 1800 680"
              fill="none"
            />
            
            {/* Mask for the White Text (matches the ribbon shape) */}
            <mask id="ribbonMask">
              <path
                d="M -200 200 C 50 200 150 400 50 500 C -50 600 -150 400 0 300 C 200 100 470 580 570 580 L 870 580 C 1120 580 1600 760 1800 680"
                fill="none"
                stroke="white"
                strokeWidth="42"
                strokeDasharray={ribbonConfig.dashArray}
              />
            </mask>
          </defs>

          {/* Hidden Reference Path for Calculation */}
          <path
            ref={pathRef}
            d="M -200 200 C 50 200 150 400 50 500 C -50 600 -150 400 0 300 C 200 100 470 580 570 580 L 870 580 C 1120 580 1600 760 1800 680"
            fill="none"
            stroke="none"
          />

          {/* Layer 1: Light Gray Text (Background) */}
          <text
            fontFamily="var(--font-serif)"
            fontSize="28"
            fill="#e4e4e7" // zinc-200
            dy="10"
          >
            <textPath 
              href="#ribbonPath" 
              startOffset="0%"
              spacing="auto"
            >
              {text}
              <animate 
                attributeName="startOffset" 
                from="-100%" 
                to="0%" 
                dur="120s" 
                repeatCount="indefinite" 
              />
            </textPath>
          </text>

          {/* Layer 2: Black Ribbon Background */}
          {ribbonConfig.isReady && (
            <path
              d="M -200 200 C 50 200 150 400 50 500 C -50 600 -150 400 0 300 C 200 100 470 580 570 580 L 870 580 C 1120 580 1600 760 1800 680"
              fill="none"
              stroke="#18181b" // zinc-900
              strokeWidth="42"
              strokeDasharray={ribbonConfig.dashArray}
              strokeLinecap="round"
            />
          )}

          {/* Layer 3: White Text (Foreground, Masked) */}
          {ribbonConfig.isReady && (
            <text
              fontFamily="var(--font-serif)"
              fontSize="28"
              fill="white"
              dy="10"
              mask="url(#ribbonMask)"
            >
              <textPath 
                href="#ribbonPath" 
                startOffset="0%"
                spacing="auto"
              >
                {text}
                <animate 
                  attributeName="startOffset" 
                  from="-100%" 
                  to="0%" 
                  dur="120s" 
                  repeatCount="indefinite" 
                />
              </textPath>
            </text>
          )}

          {/* Layer 4: The Pill (Transition Point) */}
          {ribbonConfig.isReady && (
            <g transform={`translate(${ribbonConfig.pill.x}, ${ribbonConfig.pill.y}) rotate(${ribbonConfig.pill.angle})`}>
              {/* Pill Container */}
              <rect
                x="-40"
                y="-20"
                width="80"
                height="40"
                rx="20"
                fill="#FDFCF8"
                stroke="#18181b"
                strokeWidth="2"
              />
              
              {/* Audio Waveform Animation */}
              <g transform="translate(-20, 0)">
                {[...Array(5)].map((_, i) => (
                  <rect
                    key={i}
                    x={i * 8 + 2}
                    y="-8"
                    width="4"
                    height="16"
                    rx="2"
                    fill="#18181b"
                  >
                    <animate
                      attributeName="height"
                      values="8; 20; 8"
                      dur={`${0.8 + i * 0.1}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.1}s`}
                    />
                    <animate
                      attributeName="y"
                      values="-4; -10; -4"
                      dur={`${0.8 + i * 0.1}s`}
                      repeatCount="indefinite"
                      begin={`${i * 0.1}s`}
                    />
                  </rect>
                ))}
              </g>

              {/* Label above pill */}
              <FloatingText x={0} y={0} />
            </g>
          )}
        </svg>
      </motion.div>

      {/* Main Content */}
      <motion.div style={{ opacity, scale }} className="relative z-10 text-center px-6 max-w-5xl mx-auto mt-20">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="font-serif text-6xl md:text-8xl lg:text-9xl text-zinc-900 mb-6 leading-[0.9] tracking-tight"
        >
          Don't just say it, <br />
          <span className="italic font-light">create!</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-xl md:text-2xl text-zinc-600 max-w-2xl mx-auto mb-10 font-light"
        >
          Crafting digital experiences that speak to your users.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="flex flex-col items-center gap-6 mt-48"
        >
          <a 
            href="#about"
            className="group flex items-center gap-3 bg-zinc-900 text-white px-8 py-4 rounded-full font-medium hover:bg-zinc-800 transition-all hover:scale-105 shadow-xl"
          >
            <span className="text-lg">View Portfolio</span>
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>

          {/* Audio Waveform Decoration Removed */}
        </motion.div>
      </motion.div>
    </section>
  );
}
