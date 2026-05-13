import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createDefaultFriendBookApiRepository,
  createFriendBookApiRepository,
  getFriendBookApiConfig,
} from './FriendBookFinalSection.api.ts';

test('api config defaults to the same-origin friend-book endpoint', () => {
  assert.deepEqual(getFriendBookApiConfig({}), {
    endpoint: '/api/friend-book-entries',
  });
  assert.deepEqual(
    getFriendBookApiConfig({ VITE_FRIEND_BOOK_API_ENDPOINT: '/custom/friend-book' }),
    {
      endpoint: '/custom/friend-book',
    },
  );
});

test('api repository maps fetched entries into guestbook entries', async () => {
  const calls: string[] = [];
  const repository = createFriendBookApiRepository({
    endpoint: '/api/friend-book-entries',
    fetcher: async (input) => {
      calls.push(String(input));

      return new Response(JSON.stringify({
        entries: [
          {
            id: 'remote-1',
            nickname: 'Dawn',
            identity_intro: 'Remote visitor',
            portfolio_review: 'Remote review',
            latest_game_id: 'moon-run',
            avatar_id: 'dog',
            latest_medal_id: '/images/GreenMedal01.png',
            latest_date: 'MAY 13, 2026',
            created_at: '2026-05-13T02:20:00.000Z',
            updated_at: '2026-05-13T02:20:00.000Z',
            is_published: true,
          },
        ],
      }), { status: 200 });
    },
  });

  const entries = await repository.fetchEntries();

  assert.deepEqual(calls, ['/api/friend-book-entries']);
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.nickname, 'Dawn');
});

test('api repository posts a new entry and returns the saved row', async () => {
  const repository = createFriendBookApiRepository({
    endpoint: '/api/friend-book-entries',
    fetcher: async (_input, init) => {
      assert.equal(init?.method, 'POST');
      assert.deepEqual(JSON.parse(String(init?.body)), {
        nickname: '小辞',
        identity_intro: '访客',
        portfolio_review: '喜欢整体叙事。',
        latest_game_id: 'between-two-pages',
        avatar_id: 'cat',
        latest_medal_id: '/images/PurpleMedal01.png',
        latest_date: 'MAY 13, 2026',
        client_id: 'client-1',
        is_published: true,
      });

      return new Response(JSON.stringify({
        entry: {
          id: 'remote-created',
          nickname: '小辞',
          identity_intro: '访客',
          portfolio_review: '喜欢整体叙事。',
          latest_game_id: 'between-two-pages',
          avatar_id: 'cat',
          latest_medal_id: '/images/PurpleMedal01.png',
          latest_date: 'MAY 13, 2026',
          created_at: '2026-05-13T02:20:00.000Z',
          updated_at: '2026-05-13T02:20:00.000Z',
          is_published: true,
        },
      }), { status: 201 });
    },
  });

  const entry = await repository.createEntry({
    nickname: '小辞',
    identityIntro: '访客',
    portfolioReview: '喜欢整体叙事。',
    latestGameId: 'between-two-pages',
    avatarId: 'cat',
    medalId: '/images/PurpleMedal01.png',
    displayDate: 'MAY 13, 2026',
    clientId: 'client-1',
  });

  assert.equal(entry.id, 'remote-created');
});

test('api repository surfaces HTTP errors', async () => {
  const repository = createFriendBookApiRepository({
    endpoint: '/api/friend-book-entries',
    fetcher: async () => new Response(JSON.stringify({ error: 'write failed' }), { status: 500 }),
  });

  await assert.rejects(repository.fetchEntries(), /write failed/);
});

test('default api repository is enabled for same-origin deployment', () => {
  assert.equal(createDefaultFriendBookApiRepository().isEnabled, true);
});
