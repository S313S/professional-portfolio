import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createFriendBookSupabaseRepository,
  getFriendBookSupabaseConfig,
} from './FriendBookFinalSection.supabase.ts';

test('env config reader supports Vite-style Supabase variables', () => {
  assert.deepEqual(
    getFriendBookSupabaseConfig({
      VITE_SUPABASE_URL: 'https://example.supabase.co',
      VITE_SUPABASE_PUBLISHABLE_KEY: 'public-key',
    }),
    {
      url: 'https://example.supabase.co',
      publishableKey: 'public-key',
    },
  );
});

test('repository returns empty entries when disabled', async () => {
  const repository = createFriendBookSupabaseRepository({
    config: { url: '', publishableKey: '' },
  });

  assert.equal(repository.isEnabled, false);
  assert.deepEqual(await repository.fetchEntries(), []);
});

test('repository maps selected Supabase rows to guestbook entries', async () => {
  const calls: string[] = [];
  const repository = createFriendBookSupabaseRepository({
    config: { url: 'https://example.supabase.co', publishableKey: 'public-key' },
    client: {
      from(table: string) {
        calls.push(table);
        return {
          select() {
            return {
              eq() {
                return {
                  order() {
                    return Promise.resolve({
                      data: [
                        {
                          id: 'remote-1',
                          nickname: 'Dawn',
                          identity_intro: 'Remote visitor',
                          portfolio_review: 'Remote review',
                          latest_game_id: 'moon-run',
                          avatar_id: 'dog',
                          latest_medal_id: '/images/GreenMedal01.png',
                          latest_date: 'MAY 12, 2026',
                          created_at: '2026-05-12T15:20:00.000Z',
                          updated_at: '2026-05-12T15:20:00.000Z',
                          is_published: true,
                        },
                      ],
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      },
    },
  });

  const entries = await repository.fetchEntries();

  assert.deepEqual(calls, ['friend_book_entries']);
  assert.equal(entries.length, 1);
  assert.equal(entries[0]?.nickname, 'Dawn');
});

test('repository inserts and returns the created remote entry', async () => {
  const repository = createFriendBookSupabaseRepository({
    config: { url: 'https://example.supabase.co', publishableKey: 'public-key' },
    client: {
      from() {
        return {
          insert(payload: unknown) {
            assert.deepEqual(payload, {
              nickname: '小辞',
              identity_intro: '访客',
              portfolio_review: '喜欢整体叙事。',
              latest_game_id: 'between-two-pages',
              avatar_id: 'cat',
              latest_medal_id: '/images/PurpleMedal01.png',
              latest_date: 'MAY 12, 2026',
              client_id: 'client-1',
              is_published: true,
            });

            return {
              select() {
                return {
                  single() {
                    return Promise.resolve({
                      data: {
                        id: 'remote-created',
                        nickname: '小辞',
                        identity_intro: '访客',
                        portfolio_review: '喜欢整体叙事。',
                        latest_game_id: 'between-two-pages',
                        avatar_id: 'cat',
                        latest_medal_id: '/images/PurpleMedal01.png',
                        latest_date: 'MAY 12, 2026',
                        created_at: '2026-05-12T15:20:00.000Z',
                        updated_at: '2026-05-12T15:20:00.000Z',
                        is_published: true,
                      },
                      error: null,
                    });
                  },
                };
              },
            };
          },
        };
      },
    },
  });

  const entry = await repository.createEntry({
    nickname: '小辞',
    identityIntro: '访客',
    portfolioReview: '喜欢整体叙事。',
    latestGameId: 'between-two-pages',
    avatarId: 'cat',
    medalId: '/images/PurpleMedal01.png',
    displayDate: 'MAY 12, 2026',
    clientId: 'client-1',
  });

  assert.equal(entry.nickname, '小辞');
});

test('repository surfaces Supabase errors', async () => {
  const repository = createFriendBookSupabaseRepository({
    config: { url: 'https://example.supabase.co', publishableKey: 'public-key' },
    client: {
      from() {
        return {
          select() {
            return {
              eq() {
                return {
                  order() {
                    return Promise.resolve({
                      data: null,
                      error: { message: 'RLS denied' },
                    });
                  },
                };
              },
            };
          },
        };
      },
    },
  });

  await assert.rejects(repository.fetchEntries(), /RLS denied/);
});
