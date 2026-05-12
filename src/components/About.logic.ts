export const ABOUT_VIEW_WORK_TARGET_SECTION_ID = 'experience';
export const ABOUT_VIEW_WORK_SCROLL_DURATION_MS = 1400;

export function getAboutViewWorkScrollTargetY({
  currentScrollY,
  targetRectTop,
}: {
  currentScrollY: number;
  targetRectTop: number;
}) {
  return Math.max(Math.round(currentScrollY + targetRectTop), 0);
}

export function getAboutViewWorkScrollPosition({
  startY,
  targetY,
  elapsedMs,
  durationMs = ABOUT_VIEW_WORK_SCROLL_DURATION_MS,
}: {
  startY: number;
  targetY: number;
  elapsedMs: number;
  durationMs?: number;
}) {
  if (durationMs <= 0) {
    return Math.round(targetY);
  }

  const progress = Math.min(Math.max(elapsedMs / durationMs, 0), 1);
  const easedProgress =
    progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

  return Math.round(startY + (targetY - startY) * easedProgress);
}
