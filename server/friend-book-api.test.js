import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import Database from 'better-sqlite3';

import {
  createFriendBookApiApp,
  ensureFriendBookSchema,
} from './friend-book-api.js';

function createTestDatabase() {
  const dir = mkdtempSync(path.join(tmpdir(), 'friend-book-api-'));
  const db = new Database(path.join(dir, 'friend-book.sqlite'));
  ensureFriendBookSchema(db);

  return db;
}

async function withTestServer(app, callback) {
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));

  try {
    const address = server.address();
    assert.equal(typeof address, 'object');
    await callback(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
    });
  }
}

test('friend-book API returns published entries ordered by creation time', async () => {
  const db = createTestDatabase();
  db.prepare(`
    insert into friend_book_entries (
      id, nickname, identity_intro, portfolio_review, latest_game_id,
      avatar_id, latest_medal_id, latest_date, client_id, is_published,
      created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'entry-1',
    'Dawn',
    'Remote visitor',
    'Remote review',
    'moon-run',
    'dog',
    '/images/GreenMedal01.png',
    'MAY 13, 2026',
    'client-1',
    1,
    '2026-05-13T02:20:00.000Z',
    '2026-05-13T02:20:00.000Z',
  );
  db.prepare(`
    insert into friend_book_entries (
      id, nickname, identity_intro, portfolio_review, is_published, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'hidden-entry',
    'Hidden',
    'Hidden visitor',
    'Hidden review',
    0,
    '2026-05-13T02:21:00.000Z',
    '2026-05-13T02:21:00.000Z',
  );

  const app = createFriendBookApiApp({ db });

  await withTestServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/friend-book-entries`);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.entries.length, 1);
    assert.equal(payload.entries[0].id, 'entry-1');
    assert.equal(payload.entries[0].is_published, true);
  });
});

test('friend-book API inserts and returns a validated public entry', async () => {
  const db = createTestDatabase();
  const app = createFriendBookApiApp({
    db,
    createId: () => 'created-entry',
    now: () => new Date('2026-05-13T02:30:00.000Z'),
  });

  await withTestServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/friend-book-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: ' 小辞 ',
        identity_intro: ' 访客 ',
        portfolio_review: ' 喜欢整体叙事。 ',
        latest_game_id: 'between-two-pages',
        avatar_id: 'cat',
        latest_medal_id: '/images/PurpleMedal01.png',
        latest_date: 'MAY 13, 2026',
        client_id: 'client-1',
        is_published: true,
      }),
    });
    const payload = await response.json();

    assert.equal(response.status, 201);
    assert.equal(payload.entry.id, 'created-entry');
    assert.equal(payload.entry.nickname, '小辞');
    assert.equal(payload.entry.created_at, '2026-05-13T02:30:00.000Z');
    assert.equal(
      db.prepare('select count(*) as count from friend_book_entries').get().count,
      1,
    );
  });
});

test('friend-book API rejects invalid entries', async () => {
  const db = createTestDatabase();
  const app = createFriendBookApiApp({ db });

  await withTestServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/friend-book-entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nickname: '',
        identity_intro: '访客',
        portfolio_review: '喜欢整体叙事。',
        latest_game_id: 'moon-run',
      }),
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.error, /nickname/i);
    assert.equal(
      db.prepare('select count(*) as count from friend_book_entries').get().count,
      0,
    );
  });
});

test('friend-book API requires an admin token before deleting an entry', async () => {
  const db = createTestDatabase();
  db.prepare(`
    insert into friend_book_entries (
      id, nickname, identity_intro, portfolio_review, is_published, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'entry-1',
    'Dawn',
    'Remote visitor',
    'Remote review',
    1,
    '2026-05-13T02:20:00.000Z',
    '2026-05-13T02:20:00.000Z',
  );
  const app = createFriendBookApiApp({ db, adminToken: 'secret-token' });

  await withTestServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/friend-book-entries/entry-1`, {
      method: 'DELETE',
    });
    const payload = await response.json();

    assert.equal(response.status, 403);
    assert.match(payload.error, /admin token/i);
    assert.equal(
      db.prepare('select count(*) as count from friend_book_entries').get().count,
      1,
    );
  });
});

test('friend-book API deletes a published entry with a valid admin token', async () => {
  const db = createTestDatabase();
  db.prepare(`
    insert into friend_book_entries (
      id, nickname, identity_intro, portfolio_review, is_published, created_at, updated_at
    ) values (?, ?, ?, ?, ?, ?, ?)
  `).run(
    'entry-1',
    'Dawn',
    'Remote visitor',
    'Remote review',
    1,
    '2026-05-13T02:20:00.000Z',
    '2026-05-13T02:20:00.000Z',
  );
  const app = createFriendBookApiApp({ db, adminToken: 'secret-token' });

  await withTestServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/friend-book-entries/entry-1`, {
      method: 'DELETE',
      headers: {
        'x-friend-book-admin-token': 'secret-token',
      },
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(payload, { ok: true, id: 'entry-1' });
    assert.equal(
      db.prepare('select count(*) as count from friend_book_entries').get().count,
      0,
    );
  });
});

test('analytics API records a validated event', async () => {
  const db = createTestDatabase();
  const app = createFriendBookApiApp({
    db,
    createId: () => 'analytics-event-1',
    now: () => new Date('2026-05-13T16:30:00.000Z'),
  });

  await withTestServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/analytics/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'node-test-agent',
      },
      body: JSON.stringify({
        event_name: 'page_view',
        event_kind: 'page_view',
        visitor_id: 'visitor-1',
        session_id: 'session-1',
        path: '/works',
        target_id: 'root',
        metadata: { viewport: 'desktop' },
        referrer_host: 'example.com',
      }),
    });
    const payload = await response.json();
    const row = db.prepare('select * from analytics_events where id = ?').get('analytics-event-1');

    assert.equal(response.status, 201);
    assert.deepEqual(payload, { ok: true });
    assert.equal(row.event_name, 'page_view');
    assert.equal(row.event_kind, 'page_view');
    assert.equal(row.visitor_id, 'visitor-1');
    assert.equal(row.session_id, 'session-1');
    assert.equal(row.path, '/works');
    assert.equal(row.target_id, 'root');
    assert.equal(row.metadata_json, '{"viewport":"desktop"}');
    assert.equal(row.referrer_host, 'example.com');
    assert.equal(row.user_agent, 'node-test-agent');
    assert.equal(row.event_date, '2026-05-14');
  });
});

test('analytics API rejects invalid events', async () => {
  const db = createTestDatabase();
  const app = createFriendBookApiApp({ db });

  await withTestServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/analytics/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: 'Bad Event Name',
        event_kind: 'click',
        visitor_id: 'visitor-1',
        session_id: 'session-1',
        path: '/'.repeat(300),
      }),
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.error, /event_name/i);
    assert.equal(
      db.prepare('select count(*) as count from analytics_events').get().count,
      0,
    );
  });
});

test('analytics summary requires an admin token', async () => {
  const db = createTestDatabase();
  const app = createFriendBookApiApp({ db, adminToken: 'secret-token' });

  await withTestServer(app, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/analytics/summary?from=2026-05-14&to=2026-05-14`);
    const payload = await response.json();

    assert.equal(response.status, 403);
    assert.match(payload.error, /admin token/i);
  });
});

test('analytics summary returns daily UV, PV, clicks, and click rate', async () => {
  const db = createTestDatabase();
  const app = createFriendBookApiApp({
    db,
    adminToken: 'secret-token',
    now: () => new Date('2026-05-14T02:00:00.000Z'),
  });

  await withTestServer(app, async (baseUrl) => {
    const events = [
      ['page_view', 'page_view', 'visitor-1', 'session-1'],
      ['nav_click', 'click', 'visitor-1', 'session-1'],
      ['works_lobby_enter', 'click', 'visitor-2', 'session-2'],
      ['page_view', 'page_view', 'visitor-2', 'session-2'],
      ['page_view', 'page_view', 'visitor-1', 'session-3'],
    ];

    for (const [eventName, eventKind, visitorId, sessionId] of events) {
      const response = await fetch(`${baseUrl}/api/analytics/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: eventName,
          event_kind: eventKind,
          visitor_id: visitorId,
          session_id: sessionId,
          path: '/',
        }),
      });

      assert.equal(response.status, 201);
    }

    const response = await fetch(`${baseUrl}/api/analytics/summary?from=2026-05-14&to=2026-05-14`, {
      headers: { 'x-friend-book-admin-token': 'secret-token' },
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.deepEqual(payload, {
      from: '2026-05-14',
      to: '2026-05-14',
      days: [
        {
          date: '2026-05-14',
          uv: 2,
          sessions: 3,
          pv: 3,
          clicks: 2,
          cta_click_visitors: 2,
          cta_click_rate: 1,
        },
      ],
      totals: {
        uv: 2,
        sessions: 3,
        pv: 3,
        clicks: 2,
        cta_click_visitors: 2,
        cta_click_rate: 1,
      },
    });
  });
});
