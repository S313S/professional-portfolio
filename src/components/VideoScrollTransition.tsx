import { useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'motion/react';

import {
  DEFAULT_VIDEO_SCROLL_CONFIG,
  getVideoScrollState,
  type VideoScrollPhase,
} from './VideoScrollTransition.logic';

const SECTION_HEIGHT_CLASS = 'h-[560vh]';
const SECTION_OVERLAP_CLASS = '-mt-[50vh]';
const PUSH_VIDEO_END_FRAME_OFFSET = 1 / 60;

export default function VideoScrollTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  const loopVideoRef = useRef<HTMLVideoElement>(null);
  const pushVideoRef = useRef<HTMLVideoElement>(null);
  const overlayLayerRef = useRef<HTMLDivElement>(null);
  const frameRequestRef = useRef<number | null>(null);
  const queuedTimeRef = useRef(0);
  const pushReadyRef = useRef(false);
  const phaseRef = useRef<VideoScrollPhase>('idle');
  const [phase, setPhase] = useState<VideoScrollPhase>('idle');

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const queuePushVideoTime = (scrubProgress: number) => {
    const pushVideo = pushVideoRef.current;
    if (!pushVideo || !pushReadyRef.current || pushVideo.readyState < 2) {
      return;
    }

    const duration = pushVideo.duration;
    if (!duration || Number.isNaN(duration)) {
      return;
    }

    const maxTime = Math.max(duration - PUSH_VIDEO_END_FRAME_OFFSET, 0);
    const targetTime = scrubProgress >= 1 ? maxTime : scrubProgress * maxTime;

    if (Math.abs(pushVideo.currentTime - targetTime) < 0.016) {
      return;
    }

    queuedTimeRef.current = targetTime;

    if (frameRequestRef.current !== null) {
      return;
    }

    frameRequestRef.current = requestAnimationFrame(() => {
      frameRequestRef.current = null;

      const currentPushVideo = pushVideoRef.current;
      if (!currentPushVideo) {
        return;
      }

      const nextTime = queuedTimeRef.current;
      if (Math.abs(currentPushVideo.currentTime - nextTime) >= 0.016) {
        currentPushVideo.currentTime = nextTime;
      }
    });
  };

  const applyScrollState = (latest: number) => {
    const state = getVideoScrollState(latest, DEFAULT_VIDEO_SCROLL_CONFIG);
    const overlayOpacity = pushReadyRef.current ? state.overlayOpacity : 0;

    if (overlayLayerRef.current) {
      overlayLayerRef.current.style.opacity = overlayOpacity.toFixed(4);
    }

    if (phaseRef.current !== state.phase) {
      phaseRef.current = state.phase;
      setPhase(state.phase);
    }

    queuePushVideoTime(state.scrubProgress);
  };

  useMotionValueEvent(scrollYProgress, 'change', applyScrollState);

  useEffect(() => {
    applyScrollState(scrollYProgress.get());

    return () => {
      if (frameRequestRef.current !== null) {
        cancelAnimationFrame(frameRequestRef.current);
      }
    };
  }, [scrollYProgress]);

  const handleLoopLoadedData = () => {
    const loopVideo = loopVideoRef.current;
    if (!loopVideo) {
      return;
    }

    loopVideo.play().catch(() => {
      // Autoplay can be blocked transiently; muted inline video usually retries successfully.
    });
  };

  const handlePushLoadedData = () => {
    const pushVideo = pushVideoRef.current;
    if (!pushVideo) {
      return;
    }

    pushReadyRef.current = true;

    pushVideo
      .play()
      .catch(() => {
        // Decoder warm-up is best effort only; scrubbing still works without autoplay permission.
      })
      .finally(() => {
        pushVideo.pause();
        pushVideo.currentTime = 0;
        applyScrollState(scrollYProgress.get());
      });
  };

  return (
    <section ref={containerRef} className={`relative ${SECTION_OVERLAP_CLASS} ${SECTION_HEIGHT_CLASS} bg-[#FDFCF8] z-40`}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#FDFCF8]">
        <video
          ref={loopVideoRef}
          src="/videos/窗帘飘动.mp4"
          className="w-full h-full object-cover"
          muted
          autoPlay
          loop
          playsInline
          preload="auto"
          onLoadedData={handleLoopLoadedData}
        />

        <div
          ref={overlayLayerRef}
          data-phase={phase}
          className="absolute inset-0 pointer-events-none opacity-0 transition-opacity duration-200 ease-out will-change-[opacity]"
        >
          <video
            ref={pushVideoRef}
            src="/videos/窗帘飘动_镜头推进到相册.mp4"
            className="w-full h-full object-cover"
            muted
            playsInline
            preload="auto"
            onLoadedData={handlePushLoadedData}
          />
        </div>
      </div>
    </section>
  );
}
