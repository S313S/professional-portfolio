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
  const server = app.listen(0);
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
