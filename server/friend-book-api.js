import 'dotenv/config';
import express from 'express';
import Database from 'better-sqlite3';
import { randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const FRIEND_BOOK_API_PATH = '/api/friend-book-entries';
const ANALYTICS_EVENTS_API_PATH = '/api/analytics/events';
const ANALYTICS_SUMMARY_API_PATH = '/api/analytics/summary';
const VALID_GAME_IDS = new Set(['between-two-pages', 'moon-run', 'one-stroke-mark']);
const VALID_ANALYTICS_EVENT_KINDS = new Set(['page_view', 'click', 'custom']);
const ANALYTICS_EVENT_NAME_PATTERN = /^[a-z][a-z0-9_.:-]{0,63}$/;
const ANALYTICS_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ANALYTICS_METADATA_MAX_LENGTH = 2048;

function text(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function nullableText(value) {
  const nextValue = text(value);

  return nextValue || null;
}

function limitedNullableText(value, maxLength) {
  const nextValue = nullableText(value);

  if (!nextValue) {
    return null;
  }

  return nextValue.length <= maxLength ? nextValue : nextValue.slice(0, maxLength);
}

function normalizeGameId(value) {
  const nextValue = nullableText(value);

  return nextValue && VALID_GAME_IDS.has(nextValue) ? nextValue : null;
}

function toBoolean(value) {
  return value === true || value === 1;
}

function getShanghaiDateStamp(date) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = Object.fromEntries(
    formatter.formatToParts(date).map((part) => [part.type, part.value]),
  );

  return `${parts.year}-${parts.month}-${parts.day}`;
}

function isPlainObject(value) {
  return (
    value !== null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  );
}

function normalizeAnalyticsMetadata(value) {
  if (value === undefined || value === null) {
    return null;
  }

  if (!isPlainObject(value)) {
    return { error: 'metadata must be an object when provided.' };
  }

  const metadataJson = JSON.stringify(value);

  if (metadataJson.length > ANALYTICS_METADATA_MAX_LENGTH) {
    return { error: 'metadata is too large.' };
  }

  return { value: metadataJson };
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

function validateAnalyticsEventPayload(payload) {
  const eventName = text(payload?.event_name);
  const eventKind = text(payload?.event_kind) || (eventName === 'page_view' ? 'page_view' : 'click');
  const visitorId = text(payload?.visitor_id);
  const sessionId = text(payload?.session_id);
  const eventPath = text(payload?.path) || '/';
  const targetId = nullableText(payload?.target_id);
  const metadata = normalizeAnalyticsMetadata(payload?.metadata);

  if (!ANALYTICS_EVENT_NAME_PATTERN.test(eventName)) {
    return { error: 'event_name must be lowercase and 1-64 URL-safe characters.' };
  }

  if (!VALID_ANALYTICS_EVENT_KINDS.has(eventKind)) {
    return { error: 'event_kind must be page_view, click, or custom.' };
  }

  if (visitorId.length < 8 || visitorId.length > 128) {
    return { error: 'visitor_id must be between 8 and 128 characters.' };
  }

  if (sessionId.length < 8 || sessionId.length > 128) {
    return { error: 'session_id must be between 8 and 128 characters.' };
  }

  if (eventPath.length > 256) {
    return { error: 'path must be 256 characters or fewer.' };
  }

  if (targetId && targetId.length > 128) {
    return { error: 'target_id must be 128 characters or fewer.' };
  }

  if (metadata?.error) {
    return metadata;
  }

  return {
    value: {
      event_name: eventName,
      event_kind: eventKind,
      visitor_id: visitorId,
      session_id: sessionId,
      path: eventPath,
      target_id: targetId,
      metadata_json: metadata?.value ?? null,
      referrer_host: limitedNullableText(payload?.referrer_host, 160),
    },
  };
}

function parseAnalyticsDateRange(query, now) {
  const today = getShanghaiDateStamp(now);
  const from = text(query?.from) || today;
  const to = text(query?.to) || from;

  if (!ANALYTICS_DATE_PATTERN.test(from) || !ANALYTICS_DATE_PATTERN.test(to)) {
    return { error: 'from and to must use YYYY-MM-DD format.' };
  }

  if (from > to) {
    return { error: 'from must be earlier than or equal to to.' };
  }

  return { value: { from, to } };
}

function roundRate(value) {
  return Number(value.toFixed(4));
}

function isAdminTokenValid(candidate, expected) {
  const candidateToken = text(candidate);
  const expectedToken = text(expected);

  if (!candidateToken || !expectedToken) {
    return false;
  }

  const candidateBuffer = Buffer.from(candidateToken);
  const expectedBuffer = Buffer.from(expectedToken);

  return (
    candidateBuffer.length === expectedBuffer.length &&
    timingSafeEqual(candidateBuffer, expectedBuffer)
  );
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

    create table if not exists analytics_events (
      id text primary key,
      event_name text not null,
      event_kind text not null check (event_kind in ('page_view', 'click', 'custom')),
      visitor_id text not null,
      session_id text not null,
      path text not null,
      target_id text,
      metadata_json text,
      referrer_host text,
      user_agent text,
      event_date text not null,
      created_at text not null
    );

    create index if not exists analytics_events_event_date_idx
      on analytics_events (event_date);

    create index if not exists analytics_events_event_name_idx
      on analytics_events (event_name);

    create index if not exists analytics_events_visitor_id_idx
      on analytics_events (visitor_id);
  `);
}

export function createFriendBookApiApp({
  db,
  now = () => new Date(),
  createId = randomUUID,
  adminToken = process.env.FRIEND_BOOK_ADMIN_TOKEN,
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

  app.delete(`${FRIEND_BOOK_API_PATH}/:id`, (req, res) => {
    if (!isAdminTokenValid(req.get('x-friend-book-admin-token'), adminToken)) {
      res.status(403).json({ error: 'A valid admin token is required to delete a guestbook entry.' });
      return;
    }

    const id = text(req.params.id);

    if (!id) {
      res.status(400).json({ error: 'entry id is required.' });
      return;
    }

    const result = db.prepare(`
      delete from friend_book_entries
      where id = ?
    `).run(id);

    if (result.changes === 0) {
      res.status(404).json({ error: 'guestbook entry not found.' });
      return;
    }

    res.json({ ok: true, id });
  });

  app.post(ANALYTICS_EVENTS_API_PATH, (req, res) => {
    const validation = validateAnalyticsEventPayload(req.body);

    if (validation.error) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const currentTime = now();
    const timestamp = currentTime.toISOString();
    const event = {
      id: createId(),
      ...validation.value,
      user_agent: limitedNullableText(req.get('user-agent'), 512),
      event_date: getShanghaiDateStamp(currentTime),
      created_at: timestamp,
    };

    db.prepare(`
      insert into analytics_events (
        id,
        event_name,
        event_kind,
        visitor_id,
        session_id,
        path,
        target_id,
        metadata_json,
        referrer_host,
        user_agent,
        event_date,
        created_at
      ) values (
        @id,
        @event_name,
        @event_kind,
        @visitor_id,
        @session_id,
        @path,
        @target_id,
        @metadata_json,
        @referrer_host,
        @user_agent,
        @event_date,
        @created_at
      )
    `).run(event);

    res.status(201).json({ ok: true });
  });

  app.get(ANALYTICS_SUMMARY_API_PATH, (req, res) => {
    if (!isAdminTokenValid(req.get('x-friend-book-admin-token'), adminToken)) {
      res.status(403).json({ error: 'A valid admin token is required to view analytics.' });
      return;
    }

    const range = parseAnalyticsDateRange(req.query, now());

    if (range.error) {
      res.status(400).json({ error: range.error });
      return;
    }

    const { from, to } = range.value;
    const rows = db.prepare(`
      select
        event_date as date,
        count(distinct visitor_id) as uv,
        count(distinct session_id) as sessions,
        sum(case when event_name = 'page_view' then 1 else 0 end) as pv,
        sum(case when event_kind = 'click' then 1 else 0 end) as clicks,
        count(distinct case when event_kind = 'click' then visitor_id end) as cta_click_visitors
      from analytics_events
      where event_date between @from and @to
      group by event_date
      order by event_date asc
    `).all({ from, to }).map((row) => {
      const uv = Number(row.uv ?? 0);
      const ctaClickVisitors = Number(row.cta_click_visitors ?? 0);

      return {
        date: row.date,
        uv,
        sessions: Number(row.sessions ?? 0),
        pv: Number(row.pv ?? 0),
        clicks: Number(row.clicks ?? 0),
        cta_click_visitors: ctaClickVisitors,
        cta_click_rate: uv === 0 ? 0 : roundRate(ctaClickVisitors / uv),
      };
    });

    const totals = rows.reduce(
      (summary, row) => ({
        uv: summary.uv + row.uv,
        sessions: summary.sessions + row.sessions,
        pv: summary.pv + row.pv,
        clicks: summary.clicks + row.clicks,
        cta_click_visitors: summary.cta_click_visitors + row.cta_click_visitors,
      }),
      { uv: 0, sessions: 0, pv: 0, clicks: 0, cta_click_visitors: 0 },
    );

    res.json({
      from,
      to,
      days: rows,
      totals: {
        ...totals,
        cta_click_rate: totals.uv === 0 ? 0 : roundRate(totals.cta_click_visitors / totals.uv),
      },
    });
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
