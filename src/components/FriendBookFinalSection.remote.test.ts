import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createFriendBookRemoteInsertPayload,
  mapFriendBookRemoteRowToEntry,
  mergeFriendBookRemoteEntries,
} from './FriendBookFinalSection.remote.ts';
import { createDefaultFriendBookProgress } from './FriendBookFinalSection.logic.ts';

test('maps a published API row into a guestbook entry', () => {
  const entry = mapFriendBookRemoteRowToEntry({
    id: '348dd626-e18c-4de9-8186-91c70f81aa4d',
    nickname: '站台风景员',
    identity_intro: '一个会为了转场多停两秒的人。',
    portfolio_review: '作品区的气质被认真收进来了。',
    latest_game_id: 'between-two-pages',
    avatar_id: 'tree',
    latest_medal_id: '/images/PurpleMedal02.png',
    latest_date: 'MAY 12, 2026',
    created_at: '2026-05-12T15:20:00.000Z',
    updated_at: '2026-05-12T15:20:00.000Z',
    is_published: true,
  });

  assert.deepEqual(entry, {
    id: '348dd626-e18c-4de9-8186-91c70f81aa4d',
    nickname: '站台风景员',
    identityIntro: '一个会为了转场多停两秒的人。',
    portfolioReview: '作品区的气质被认真收进来了。',
    latestGameId: 'between-two-pages',
    avatarId: 'tree',
    latestMedalId: '/images/PurpleMedal02.png',
    latestDate: 'MAY 12, 2026',
    updatedAt: '2026-05-12T15:20:00.000Z',
  });
});

test('drops invalid remote rows before they reach the book UI', () => {
  assert.equal(
    mapFriendBookRemoteRowToEntry({
      id: 'bad',
      nickname: '',
      identity_intro: 'identity',
      portfolio_review: 'review',
      latest_game_id: 'moon-run',
      avatar_id: 'cat',
      latest_medal_id: null,
      latest_date: null,
      created_at: '2026-05-12T15:20:00.000Z',
      updated_at: '2026-05-12T15:20:00.000Z',
      is_published: true,
    }),
    null,
  );
});

test('builds a trimmed insert payload for the friend-book API', () => {
  assert.deepEqual(
    createFriendBookRemoteInsertPayload({
      nickname: ' 小辞 ',
      identityIntro: ' 访客 ',
      portfolioReview: ' 很喜欢作品集 ',
      latestGameId: 'moon-run',
      avatarId: 'cat',
      medalId: '/images/GreenMedal01.png',
      displayDate: 'MAY 12, 2026',
      clientId: 'client-1',
    }),
    {
      nickname: '小辞',
      identity_intro: '访客',
      portfolio_review: '很喜欢作品集',
      latest_game_id: 'moon-run',
      avatar_id: 'cat',
      latest_medal_id: '/images/GreenMedal01.png',
      latest_date: 'MAY 12, 2026',
      client_id: 'client-1',
      is_published: true,
    },
  );
});

test('merges remote entries into progress while keeping seed rows', () => {
  const progress = createDefaultFriendBookProgress();
  const next = mergeFriendBookRemoteEntries(progress, [
    {
      id: 'remote-1',
      nickname: 'Dawn',
      identityIntro: 'Remote visitor',
      portfolioReview: 'Remote review',
      latestGameId: 'moon-run',
      avatarId: 'dog',
      latestMedalId: '/images/GreenMedal01.png',
      latestDate: 'MAY 12, 2026',
      updatedAt: '2026-05-12T15:20:00.000Z',
    },
  ]);

  assert.equal(next.guestbookEntries.length, 6);
  assert.equal(next.guestbookEntries[0]?.id, 'seed-forest-page-turner');
  assert.equal(next.guestbookEntries.at(-1)?.nickname, 'Dawn');
});

test('drops stale remote entries that are missing from the latest API response', () => {
  const progress = mergeFriendBookRemoteEntries(createDefaultFriendBookProgress(), [
    {
      id: 'stale-remote',
      nickname: '浮躁的都市浮萍',
      identityIntro: 'Cached visitor',
      portfolioReview: 'Cached review',
      latestGameId: 'between-two-pages',
      avatarId: 'tree',
      latestMedalId: '/images/Animalmedals02.png',
      latestDate: 'MAY 13, 2026',
      updatedAt: '2026-05-13T06:07:02.619Z',
    },
  ]);

  const next = mergeFriendBookRemoteEntries(progress, [
    {
      id: 'fresh-remote',
      nickname: '小绿兔',
      identityIntro: 'Fresh visitor',
      portfolioReview: 'Fresh review',
      latestGameId: 'between-two-pages',
      avatarId: 'cat-pi',
      latestMedalId: '/images/Animalmedals05.png',
      latestDate: 'MAY 13, 2026',
      updatedAt: '2026-05-13T07:04:03.618Z',
    },
  ]);

  assert.equal(next.guestbookEntries.some((entry) => entry.nickname === '浮躁的都市浮萍'), false);
  assert.equal(next.guestbookEntries.some((entry) => entry.nickname === '小绿兔'), true);
  assert.equal(next.guestbookEntries.filter((entry) => entry.id.startsWith('seed-')).length, 5);
});

test('clears stale remote entries when the latest API response is empty', () => {
  const progress = mergeFriendBookRemoteEntries(createDefaultFriendBookProgress(), [
    {
      id: 'stale-remote',
      nickname: '浮躁的都市浮萍',
      identityIntro: 'Cached visitor',
      portfolioReview: 'Cached review',
      latestGameId: 'between-two-pages',
      avatarId: 'tree',
      latestMedalId: '/images/Animalmedals02.png',
      latestDate: 'MAY 13, 2026',
      updatedAt: '2026-05-13T06:07:02.619Z',
    },
  ]);

  const next = mergeFriendBookRemoteEntries(progress, []);

  assert.equal(next.guestbookEntries.some((entry) => entry.nickname === '浮躁的都市浮萍'), false);
  assert.equal(next.guestbookEntries.length, 5);
});
