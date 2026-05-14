import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createAnalyticsSessionId,
  getOrCreateAnalyticsVisitorId,
  sanitizeAnalyticsMetadata,
  sendAnalyticsPayload,
} from './analytics.ts';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));

  return {
    getItem(key: string) {
      return values.get(key) ?? null;
    },
    setItem(key: string, value: string) {
      values.set(key, value);
    },
  };
}

test('analytics visitor id is stable and session id is per page load', () => {
  const storage = createMemoryStorage({
    xiaoci_analytics_visitor_id: 'visitor-existing',
  });

  assert.equal(
    getOrCreateAnalyticsVisitorId(storage, () => 'visitor-created'),
    'visitor-existing',
  );
  assert.equal(createAnalyticsSessionId(() => 'session-created'), 'session-created');

  const emptyStorage = createMemoryStorage();

  assert.equal(
    getOrCreateAnalyticsVisitorId(emptyStorage, () => 'visitor-created'),
    'visitor-created',
  );
  assert.equal(emptyStorage.getItem('xiaoci_analytics_visitor_id'), 'visitor-created');
});

test('analytics sender uses sendBeacon before falling back to fetch', async () => {
  const beaconCalls: Array<{ url: string; body: BodyInit | null }> = [];
  const didUseBeacon = await sendAnalyticsPayload(
    {
      event_name: 'page_view',
      event_kind: 'page_view',
      visitor_id: 'visitor-1',
      session_id: 'session-1',
      path: '/',
    },
    {
      endpoint: '/api/analytics/events',
      sendBeacon(url, body) {
        beaconCalls.push({ url, body });
        return true;
      },
      fetch: async () => {
        throw new Error('fetch should not run when sendBeacon succeeds');
      },
    },
  );

  assert.equal(didUseBeacon, 'beacon');
  assert.equal(beaconCalls.length, 1);
  assert.equal(beaconCalls[0].url, '/api/analytics/events');
  assert.ok(beaconCalls[0].body instanceof Blob);
  assert.match(await beaconCalls[0].body.text(), /"event_name":"page_view"/);

  let fetchBody = '';
  const didUseFetch = await sendAnalyticsPayload(
    {
      event_name: 'nav_click',
      event_kind: 'click',
      visitor_id: 'visitor-1',
      session_id: 'session-1',
      path: '/',
    },
    {
      endpoint: '/api/analytics/events',
      sendBeacon() {
        return false;
      },
      async fetch(_url, init) {
        fetchBody = String(init?.body ?? '');
        return new Response('{}', { status: 200 });
      },
    },
  );

  assert.equal(didUseFetch, 'fetch');
  assert.match(fetchBody, /"event_name":"nav_click"/);
});

test('analytics metadata sanitizer drops guestbook personal text fields', () => {
  assert.deepEqual(
    sanitizeAnalyticsMetadata({
      target_id: 'friend-book-submit',
      nickname: '小辞',
      identity_intro: '朋友',
      portfolio_review: '留言正文',
      noteDraft: 'draft text',
      nested: {
        message: 'private nested text',
        game_id: 'moon-run',
      },
    }),
    {
      target_id: 'friend-book-submit',
      nested: {
        game_id: 'moon-run',
      },
    },
  );
});
