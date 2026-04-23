const SCROLL_MOMENTUM_LOCK_KEY = '__portfolioScrollMomentumLockUntil';

export const DEFAULT_SCROLL_MOMENTUM_LOCK_MS = 650;

type LockHost = Record<string, unknown>;

function getLockHost(): LockHost | null {
  if (typeof window !== 'undefined') {
    return window as typeof window & LockHost;
  }

  if (typeof globalThis !== 'undefined') {
    return globalThis as typeof globalThis & LockHost;
  }

  return null;
}

function getNow() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

export function armScrollMomentumLock(
  durationMs = DEFAULT_SCROLL_MOMENTUM_LOCK_MS,
  now = getNow(),
) {
  const host = getLockHost();
  if (!host) {
    return;
  }

  const nextLockUntil = now + Math.max(durationMs, 0);
  const currentLockUntil =
    typeof host[SCROLL_MOMENTUM_LOCK_KEY] === 'number' ? Number(host[SCROLL_MOMENTUM_LOCK_KEY]) : 0;

  host[SCROLL_MOMENTUM_LOCK_KEY] = Math.max(currentLockUntil, nextLockUntil);
}

export function isScrollMomentumLocked(now = getNow()) {
  const host = getLockHost();
  if (!host) {
    return false;
  }

  const lockUntil =
    typeof host[SCROLL_MOMENTUM_LOCK_KEY] === 'number' ? Number(host[SCROLL_MOMENTUM_LOCK_KEY]) : 0;

  return now < lockUntil;
}

export function clearScrollMomentumLock() {
  const host = getLockHost();
  if (!host) {
    return;
  }

  delete host[SCROLL_MOMENTUM_LOCK_KEY];
}
