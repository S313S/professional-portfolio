import 'dotenv/config';
import express from 'express';
import Database from 'better-sqlite3';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const FRIEND_BOOK_API_PATH = '/api/friend-book-entries';
const VALID_GAME_IDS = new Set(['between-two-pages', 'moon-run', 'one-stroke-mark']);

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function nullableText(value) {
  const nextValue = text(value);

  return nextValue || null;
}

function normalizeGameId(value) {
  const nextValue = nullableText(value);

  return nextValue && VALID_GAME_IDS.has(nextValue) ? nextValue : null;
}

function toBoolean(value) {
  return value === true || value === 1;
}

function rowToApiEntry(row) {
  return {
    id: row.id,
    nickname: row.nickname,
    identity_intro: row.identity_intro,
    portfolio_review: row.portfolio_review,
    latest_game_id: row.latest_game_id,
    avatar_id: row.avatar_id,
    latest_medal_id: row.latest_medal_id,
    latest_date: row.latest_date,
    client_id: row.client_id,
    is_published: toBoolean(row.is_published),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function validateEntryPayload(payload) {
  const nickname = text(payload?.nickname);
  const identityIntro = text(payload?.identity_intro);
  const portfolioReview = text(payload?.portfolio_review);

  if (nickname.length < 1 || nickname.length > 32) {
    return { error: 'nickname must be between 1 and 32 characters.' };
  }

  if (identityIntro.length < 1 || identityIntro.length > 160) {
    return { error: 'identity_intro must be between 1 and 160 characters.' };
  }

  if (portfolioReview.length < 1 || portfolioReview.length > 220) {
    return { error: 'portfolio_review must be between 1 and 220 characters.' };
  }

  return {
    value: {
      nickname,
      identity_intro: identityIntro,
      portfolio_review: portfolioReview,
      latest_game_id: normalizeGameId(payload?.latest_game_id),
      avatar_id: nullableText(payload?.avatar_id),
      latest_medal_id: nullableText(payload?.latest_medal_id),
      latest_date: nullableText(payload?.latest_date),
      client_id: nullableText(payload?.client_id),
      is_published: true,
    },
  };
}

export function ensureFriendBookSchema(db) {
  db.exec(`
    create table if not exists friend_book_entries (
      id text primary key,
      nickname text not null check (length(nickname) between 1 and 32),
      identity_intro text not null check (length(identity_intro) between 1 and 160),
      portfolio_review text not null check (length(portfolio_review) between 1 and 220),
      latest_game_id text check (
        latest_game_id is null
        or latest_game_id in ('between-two-pages', 'moon-run', 'one-stroke-mark')
      ),
      avatar_id text,
      latest_medal_id text,
      latest_date text,
      client_id text,
      is_published integer not null default 1,
      created_at text not null,
      updated_at text not null
    );

    create index if not exists friend_book_entries_published_created_at_idx
      on friend_book_entries (is_published, created_at);
  `);
}

export function createFriendBookApiApp({
  db,
  now = () => new Date(),
  createId = randomUUID,
} = {}) {
  if (!db) {
    throw new Error('createFriendBookApiApp requires a better-sqlite3 database instance.');
  }

  ensureFriendBookSchema(db);

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '16kb' }));

  app.get(FRIEND_BOOK_API_PATH, (_req, res) => {
    const rows = db.prepare(`
      select
        id,
        nickname,
        identity_intro,
        portfolio_review,
        latest_game_id,
        avatar_id,
        latest_medal_id,
        latest_date,
        client_id,
        is_published,
        created_at,
        updated_at
      from friend_book_entries
      where is_published = 1
      order by created_at asc
    `).all();

    res.json({ entries: rows.map(rowToApiEntry) });
  });

  app.post(FRIEND_BOOK_API_PATH, (req, res) => {
    const validation = validateEntryPayload(req.body);

    if (validation.error) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const timestamp = now().toISOString();
    const entry = {
      id: createId(),
      ...validation.value,
      created_at: timestamp,
      updated_at: timestamp,
    };

    db.prepare(`
      insert into friend_book_entries (
        id,
        nickname,
        identity_intro,
        portfolio_review,
        latest_game_id,
        avatar_id,
        latest_medal_id,
        latest_date,
        client_id,
        is_published,
        created_at,
        updated_at
      ) values (
        @id,
        @nickname,
        @identity_intro,
        @portfolio_review,
        @latest_game_id,
        @avatar_id,
        @latest_medal_id,
        @latest_date,
        @client_id,
        @is_published,
        @created_at,
        @updated_at
      )
    `).run({
      ...entry,
      is_published: entry.is_published ? 1 : 0,
    });

    res.status(201).json({ entry: rowToApiEntry(entry) });
  });

  return app;
}

export function openFriendBookDatabase(
  databasePath = process.env.FRIEND_BOOK_DB_PATH ||
    path.resolve(process.cwd(), 'data/friend-book.sqlite'),
) {
  mkdirSync(path.dirname(databasePath), { recursive: true });
  const db = new Database(databasePath);
  ensureFriendBookSchema(db);

  return db;
}

function isMainModule() {
  return import.meta.url === pathToFileURL(process.argv[1] ?? '').href;
}

if (isMainModule()) {
  const port = Number(process.env.FRIEND_BOOK_API_PORT || process.env.PORT || 3008);
  const db = openFriendBookDatabase();
  const app = createFriendBookApiApp({ db });

  app.listen(port, '127.0.0.1', () => {
    const filename = fileURLToPath(import.meta.url);
    console.log(`Friend-book API listening on http://127.0.0.1:${port}`);
    console.log(`Started from ${filename}`);
  });
}
