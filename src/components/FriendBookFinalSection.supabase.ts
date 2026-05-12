import { createClient } from '@supabase/supabase-js';

import type {
  FriendBookAvatarId,
  FriendBookGameId,
  FriendBookGuestbookEntry,
} from './FriendBookFinalSection.logic';
import {
  createFriendBookRemoteInsertPayload,
  isFriendBookRemoteConfigured,
  mapFriendBookRemoteRowToEntry,
  type FriendBookRemoteConfig,
  type FriendBookRemoteRow,
} from './FriendBookFinalSection.remote';

const FRIEND_BOOK_TABLE = 'friend_book_entries';
const FRIEND_BOOK_REMOTE_COLUMNS = [
  'id',
  'nickname',
  'identity_intro',
  'portfolio_review',
  'latest_game_id',
  'avatar_id',
  'latest_medal_id',
  'latest_date',
  'created_at',
  'updated_at',
  'is_published',
].join(',');

interface SupabaseQueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

interface FriendBookSupabaseLike {
  from(table: string): {
    select?(columns?: string): {
      eq(column: string, value: unknown): {
        order(
          column: string,
          options: { ascending: boolean },
        ): Promise<SupabaseQueryResult<FriendBookRemoteRow[]>>;
      };
    };
    insert?(payload: unknown): {
      select(columns?: string): {
        single(): Promise<SupabaseQueryResult<FriendBookRemoteRow>>;
      };
    };
  };
}

export interface FriendBookRemoteRepository {
  isEnabled: boolean;
  fetchEntries(): Promise<FriendBookGuestbookEntry[]>;
  createEntry(options: {
    nickname: string;
    identityIntro: string;
    portfolioReview: string;
    latestGameId: FriendBookGameId | null;
    avatarId: FriendBookAvatarId | null;
    medalId: string | null;
    displayDate: string | null;
    clientId?: string | null;
  }): Promise<FriendBookGuestbookEntry>;
}

export function getFriendBookSupabaseConfig(
  env: Record<string, string | undefined> | undefined,
): FriendBookRemoteConfig {
  return {
    url: env?.VITE_SUPABASE_URL,
    publishableKey: env?.VITE_SUPABASE_PUBLISHABLE_KEY,
  };
}

function createBrowserSupabaseClient(config: FriendBookRemoteConfig): FriendBookSupabaseLike | null {
  if (!isFriendBookRemoteConfigured(config)) {
    return null;
  }

  return createClient(config.url!, config.publishableKey!);
}

export function createFriendBookSupabaseRepository(options: {
  config: FriendBookRemoteConfig;
  client?: FriendBookSupabaseLike | null;
}): FriendBookRemoteRepository {
  const client = options.client ?? createBrowserSupabaseClient(options.config);
  const isEnabled = Boolean(client && isFriendBookRemoteConfigured(options.config));

  return {
    isEnabled,
    async fetchEntries() {
      if (!client || !isEnabled) {
        return [];
      }

      const query = client.from(FRIEND_BOOK_TABLE).select?.(FRIEND_BOOK_REMOTE_COLUMNS);
      if (!query) {
        throw new Error('Friend book Supabase client cannot select entries.');
      }

      const result = await query
        .eq('is_published', true)
        .order('created_at', { ascending: true });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return (result.data ?? [])
        .map((row) => mapFriendBookRemoteRowToEntry(row))
        .filter((entry): entry is FriendBookGuestbookEntry => entry !== null);
    },
    async createEntry(options) {
      if (!client || !isEnabled) {
        throw new Error('Friend book Supabase repository is not configured.');
      }

      const mutation = client
        .from(FRIEND_BOOK_TABLE)
        .insert?.(createFriendBookRemoteInsertPayload(options));
      if (!mutation) {
        throw new Error('Friend book Supabase client cannot insert entries.');
      }

      const result = await mutation.select(FRIEND_BOOK_REMOTE_COLUMNS).single();
      if (result.error) {
        throw new Error(result.error.message);
      }

      const entry = result.data ? mapFriendBookRemoteRowToEntry(result.data) : null;
      if (!entry) {
        throw new Error('Supabase returned an invalid friend-book entry.');
      }

      return entry;
    },
  };
}

export function createDefaultFriendBookSupabaseRepository(): FriendBookRemoteRepository {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;

  return createFriendBookSupabaseRepository({
    config: getFriendBookSupabaseConfig(env),
  });
}
