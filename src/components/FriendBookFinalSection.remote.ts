import type {
  FriendBookAvatarId,
  FriendBookGameId,
  FriendBookGuestbookEntry,
  FriendBookProgress,
} from './FriendBookFinalSection.logic';

const FRIEND_BOOK_REMOTE_GAME_IDS: FriendBookGameId[] = [
  'between-two-pages',
  'moon-run',
  'one-stroke-mark',
];

const FRIEND_BOOK_REMOTE_AVATAR_IDS: FriendBookAvatarId[] = [
  'cat-pi',
  'cat',
  'dog',
  'rabbit',
  'tree',
  'hidden-cat',
];

export interface FriendBookRemoteConfig {
  url?: string;
  publishableKey?: string;
}

export interface FriendBookRemoteRow {
  id: string;
  nickname: string | null;
  identity_intro: string | null;
  portfolio_review: string | null;
  latest_game_id: string | null;
  avatar_id: string | null;
  latest_medal_id: string | null;
  latest_date: string | null;
  created_at: string | null;
  updated_at: string | null;
  is_published: boolean | null;
}

export interface FriendBookRemoteInsertPayload {
  nickname: string;
  identity_intro: string;
  portfolio_review: string;
  latest_game_id: FriendBookGameId | null;
  avatar_id: FriendBookAvatarId | null;
  latest_medal_id: string | null;
  latest_date: string | null;
  client_id: string | null;
  is_published: true;
}

export function isFriendBookRemoteConfigured(config: FriendBookRemoteConfig): boolean {
  return Boolean(config.url?.trim() && config.publishableKey?.trim());
}

function trimString(value: string | null | undefined): string {
  return typeof value === 'string' ? value.trim() : '';
}

function toRemoteGameId(value: string | null): FriendBookGameId | null {
  return value && FRIEND_BOOK_REMOTE_GAME_IDS.includes(value as FriendBookGameId)
    ? (value as FriendBookGameId)
    : null;
}

function toRemoteAvatarId(value: string | null): FriendBookAvatarId | null {
  return value && FRIEND_BOOK_REMOTE_AVATAR_IDS.includes(value as FriendBookAvatarId)
    ? (value as FriendBookAvatarId)
    : null;
}

export function mapFriendBookRemoteRowToEntry(
  row: FriendBookRemoteRow,
): FriendBookGuestbookEntry | null {
  const nickname = trimString(row.nickname);
  const identityIntro = trimString(row.identity_intro);
  const portfolioReview = trimString(row.portfolio_review);
  const updatedAt = trimString(row.updated_at) || trimString(row.created_at);

  if (!row.is_published || !row.id || !nickname || !identityIntro || !portfolioReview || !updatedAt) {
    return null;
  }

  return {
    id: row.id,
    nickname,
    identityIntro,
    portfolioReview,
    latestGameId: toRemoteGameId(row.latest_game_id),
    avatarId: toRemoteAvatarId(row.avatar_id),
    latestMedalId: trimString(row.latest_medal_id) || null,
    latestDate: trimString(row.latest_date) || null,
    updatedAt,
  };
}

export function createFriendBookRemoteInsertPayload(options: {
  nickname: string;
  identityIntro: string;
  portfolioReview: string;
  latestGameId: FriendBookGameId | null;
  avatarId: FriendBookAvatarId | null;
  medalId: string | null;
  displayDate: string | null;
  clientId?: string | null;
}): FriendBookRemoteInsertPayload {
  return {
    nickname: options.nickname.trim(),
    identity_intro: options.identityIntro.trim(),
    portfolio_review: options.portfolioReview.trim(),
    latest_game_id: options.latestGameId,
    avatar_id: options.avatarId,
    latest_medal_id: options.medalId,
    latest_date: options.displayDate,
    client_id: options.clientId?.trim() || null,
    is_published: true,
  };
}

export function mergeFriendBookRemoteEntries(
  progress: FriendBookProgress,
  remoteEntries: readonly FriendBookGuestbookEntry[],
): FriendBookProgress {
  if (remoteEntries.length === 0) {
    return progress;
  }

  return {
    ...progress,
    guestbookEntries: [...remoteEntries],
  };
}
