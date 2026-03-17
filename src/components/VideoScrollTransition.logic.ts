export type VideoScrollPhase = 'idle' | 'scrubbing' | 'endHold';

export interface VideoScrollConfig {
  idleEnd: number;
  fadeInStart: number;
  fadeInEnd: number;
  scrubStart: number;
  scrubEnd: number;
  endHoldStart: number;
}

export interface VideoScrollState {
  phase: VideoScrollPhase;
  scrubProgress: number;
  overlayOpacity: number;
}

export const DEFAULT_VIDEO_SCROLL_CONFIG: VideoScrollConfig = {
  idleEnd: 0.12,
  fadeInStart: 0.12,
  fadeInEnd: 0.22,
  scrubStart: 0.18,
  scrubEnd: 0.92,
  endHoldStart: 0.94,
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeProgress = (value: number, start: number, end: number) => {
  if (end <= start) {
    return value >= end ? 1 : 0;
  }

  return clamp((value - start) / (end - start), 0, 1);
};

export function getVideoScrollState(progress: number, config: VideoScrollConfig): VideoScrollState {
  const safeProgress = clamp(progress, 0, 1);

  if (safeProgress >= config.endHoldStart) {
    return {
      phase: 'endHold',
      scrubProgress: 1,
      overlayOpacity: 1,
    };
  }

  if (safeProgress <= config.idleEnd) {
    return {
      phase: 'idle',
      scrubProgress: 0,
      overlayOpacity: 0,
    };
  }

  return {
    phase: 'scrubbing',
    scrubProgress: normalizeProgress(safeProgress, config.scrubStart, config.scrubEnd),
    overlayOpacity: normalizeProgress(safeProgress, config.fadeInStart, config.fadeInEnd),
  };
}
