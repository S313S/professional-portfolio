export type AnalyticsEventKind = 'page_view' | 'click' | 'custom';

export interface AnalyticsEventPayload {
  event_name: string;
  event_kind: AnalyticsEventKind;
  visitor_id: string;
  session_id: string;
  path: string;
  target_id?: string;
  metadata?: Record<string, unknown>;
  referrer_host?: string;
}

export interface AnalyticsTrackOptions {
  kind?: AnalyticsEventKind;
  targetId?: string;
  path?: string;
  metadata?: Record<string, unknown>;
}

interface AnalyticsTransport {
  endpoint?: string;
  sendBeacon?: (url: string, body: BodyInit | null) => boolean;
  fetch?: typeof fetch;
}

type AnalyticsStorage = Pick<Storage, 'getItem' | 'setItem'>;

const ANALYTICS_ENDPOINT = '/api/analytics/events';
const ANALYTICS_VISITOR_ID_STORAGE_KEY = 'xiaoci_analytics_visitor_id';
const SENSITIVE_METADATA_KEYS = new Set([
  'identityIntro',
  'identity_intro',
  'message',
  'nickname',
  'note',
  'noteDraft',
  'portfolioReview',
  'portfolio_review',
  'review',
]);

let sessionId: string | null = null;
let visitorId: string | null = null;
let hasTrackedInitialPageView = false;

export function createAnalyticsId(prefix = 'analytics') {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${randomPart}`;
}

export function createAnalyticsSessionId(createId = () => createAnalyticsId('session')) {
  return createId();
}

export function getOrCreateAnalyticsVisitorId(
  storage: AnalyticsStorage,
  createId = () => createAnalyticsId('visitor'),
) {
  try {
    const existingVisitorId = storage.getItem(ANALYTICS_VISITOR_ID_STORAGE_KEY);

    if (existingVisitorId) {
      return existingVisitorId;
    }

    const nextVisitorId = createId();
    storage.setItem(ANALYTICS_VISITOR_ID_STORAGE_KEY, nextVisitorId);

    return nextVisitorId;
  } catch {
    return createId();
  }
}

function getAnalyticsIdentity() {
  if (typeof window === 'undefined') {
    return null;
  }

  visitorId ??= getOrCreateAnalyticsVisitorId(window.localStorage);
  sessionId ??= createAnalyticsSessionId();

  return {
    visitorId,
    sessionId,
  };
}

function getCurrentPath() {
  if (typeof window === 'undefined') {
    return '/';
  }

  return `${window.location.pathname}${window.location.search}`;
}

function getReferrerHost() {
  if (typeof document === 'undefined' || !document.referrer) {
    return undefined;
  }

  try {
    return new URL(document.referrer).host;
  } catch {
    return undefined;
  }
}

export function sanitizeAnalyticsMetadata(
  metadata: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!metadata) {
    return undefined;
  }

  const sanitizeValue = (value: unknown): unknown => {
    if (Array.isArray(value)) {
      return value.map(sanitizeValue).filter((item) => item !== undefined);
    }

    if (value && typeof value === 'object') {
      return sanitizeObject(value as Record<string, unknown>);
    }

    return value;
  };

  const sanitizeObject = (value: Record<string, unknown>) => {
    const entries = Object.entries(value)
      .filter(([key]) => !SENSITIVE_METADATA_KEYS.has(key))
      .map(([key, childValue]) => [key, sanitizeValue(childValue)] as const)
      .filter(([, childValue]) => childValue !== undefined);

    return Object.fromEntries(entries);
  };

  const sanitized = sanitizeObject(metadata);

  return Object.keys(sanitized).length > 0 ? sanitized : undefined;
}

export async function sendAnalyticsPayload(
  payload: AnalyticsEventPayload,
  transport: AnalyticsTransport = {},
) {
  const endpoint = transport.endpoint ?? ANALYTICS_ENDPOINT;
  const payloadJson = JSON.stringify(payload);
  const sendBeacon =
    transport.sendBeacon ??
    (typeof navigator !== 'undefined' ? navigator.sendBeacon?.bind(navigator) : undefined);
  const fetchImpl = transport.fetch ?? (typeof fetch !== 'undefined' ? fetch.bind(globalThis) : undefined);

  try {
    if (sendBeacon) {
      const body = new Blob([payloadJson], { type: 'application/json' });

      if (sendBeacon(endpoint, body)) {
        return 'beacon' as const;
      }
    }

    if (fetchImpl) {
      await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadJson,
        keepalive: true,
      });

      return 'fetch' as const;
    }
  } catch {
    return 'skipped' as const;
  }

  return 'skipped' as const;
}

export function trackAnalyticsEvent(eventName: string, options: AnalyticsTrackOptions = {}) {
  const identity = getAnalyticsIdentity();

  if (!identity) {
    return;
  }

  void sendAnalyticsPayload({
    event_name: eventName,
    event_kind: options.kind ?? (eventName === 'page_view' ? 'page_view' : 'click'),
    visitor_id: identity.visitorId,
    session_id: identity.sessionId,
    path: options.path ?? getCurrentPath(),
    ...(options.targetId ? { target_id: options.targetId } : {}),
    ...(sanitizeAnalyticsMetadata(options.metadata)
      ? { metadata: sanitizeAnalyticsMetadata(options.metadata) }
      : {}),
    ...(getReferrerHost() ? { referrer_host: getReferrerHost() } : {}),
  });
}

export function startPortfolioAnalytics() {
  if (hasTrackedInitialPageView) {
    return;
  }

  hasTrackedInitialPageView = true;
  trackAnalyticsEvent('page_view', { kind: 'page_view', targetId: 'portfolio-root' });
}
