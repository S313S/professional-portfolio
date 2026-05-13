import type {
  FriendBookAvatarId,
  FriendBookGameId,
  FriendBookGuestbookEntry,
} from './FriendBookFinalSection.logic';
import {
  createFriendBookRemoteInsertPayload,
  mapFriendBookRemoteRowToEntry,
  type FriendBookRemoteRow,
} from './FriendBookFinalSection.remote';

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

export interface FriendBookApiConfig {
  endpoint: string;
}

type FriendBookFetch = typeof fetch;

const DEFAULT_FRIEND_BOOK_API_ENDPOINT = '/api/friend-book-entries';

export function getFriendBookApiConfig(
  env: Record<string, string | undefined> | undefined,
): FriendBookApiConfig {
  return {
    endpoint: env?.VITE_FRIEND_BOOK_API_ENDPOINT?.trim() || DEFAULT_FRIEND_BOOK_API_ENDPOINT,
  };
}

async function parseApiResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null) as { error?: string } | T | null;

  if (!response.ok) {
    const errorMessage =
      payload && typeof payload === 'object' && 'error' in payload && payload.error
        ? payload.error
        : `Friend book API request failed with ${response.status}.`;
    throw new Error(errorMessage);
  }

  return payload as T;
}

export function createFriendBookApiRepository(options: {
  endpoint: string;
  fetcher?: FriendBookFetch;
}): FriendBookRemoteRepository {
  const endpoint = options.endpoint.trim() || DEFAULT_FRIEND_BOOK_API_ENDPOINT;
  const fetcher = options.fetcher ?? fetch;

  return {
    isEnabled: true,
    async fetchEntries() {
      const payload = await parseApiResponse<{ entries?: FriendBookRemoteRow[] }>(
        await fetcher(endpoint),
      );

      return (payload.entries ?? [])
        .map((row) => mapFriendBookRemoteRowToEntry(row))
        .filter((entry): entry is FriendBookGuestbookEntry => entry !== null);
    },
    async createEntry(options) {
      const payload = await parseApiResponse<{ entry?: FriendBookRemoteRow }>(
        await fetcher(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(createFriendBookRemoteInsertPayload(options)),
        }),
      );
      const entry = payload.entry ? mapFriendBookRemoteRowToEntry(payload.entry) : null;

      if (!entry) {
        throw new Error('Friend book API returned an invalid entry.');
      }

      return entry;
    },
  };
}

export function createDefaultFriendBookApiRepository(): FriendBookRemoteRepository {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;

  return createFriendBookApiRepository({
    endpoint: getFriendBookApiConfig(env).endpoint,
  });
}
