import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

export default function WindySection() {
  const filterRef = useRef<SVGFETurbulenceElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  useEffect(() => {
    let animationFrameId: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      if (filterRef.current) {
        // Animate baseFrequency to create a "flowing" wind effect
        // We oscillate the X frequency slightly to simulate wind gusts
        // Lower frequency = larger waves
        const freqX = 0.001 + Math.sin(time * 0.5) * 0.0005;
        const freqY = 0.002 + Math.cos(time * 0.3) * 0.0005;
        filterRef.current.setAttribute("baseFrequency", `${freqX} ${freqY}`);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="relative min-h-screen w-full overflow-hidden bg-[#FDFCF8] flex items-center justify-center py-20"
    >
      {/* SVG Filter Definition - using absolute positioning instead of display:none to ensure it works */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="wind-filter">
            <feTurbulence 
              ref={filterRef}
              type="fractalNoise" 
              baseFrequency="0.003 0.003" 
              numOctaves="2" 
              result="noise" 
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="noise" 
              scale="15" 
              xChannelSelector="R" 
              yChannelSelector="G" 
            />
          </filter>
        </defs>
      </svg>

      <motion.div 
        style={{ y, opacity }}
        className="relative w-full max-w-7xl mx-auto px-6 md:px-12"
      >
        <div className="relative w-full aspect-[16/9] overflow-hidden rounded-2xl shadow-2xl">
          {/* 
            Placeholder image for the "Windy Flowers" effect.
            Replace this URL with the actual image provided by the user.
          */}
          <img 
            src="https://images.unsplash.com/photo-1462275646964-a0e338679cde?q=80&w=2500&auto=format&fit=crop" 
            alt="Windy field with flowers"
            className="w-full h-full object-cover transform scale-105"
            style={{ filter: "url(#wind-filter)" }}
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
          
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 text-white max-w-lg z-10">
            <motion.h3 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-3xl md:text-5xl font-serif italic mb-4 drop-shadow-lg"
            >
              Nature's Rhythm
            </motion.h3>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.8 }}
              className="text-white/90 font-mono text-sm md:text-base drop-shadow-md"
            >
              Where design meets the organic flow of life.
            </motion.p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
