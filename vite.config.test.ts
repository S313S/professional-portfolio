import test from 'node:test';
import assert from 'node:assert/strict';

import { getFriendBookApiProxyConfig } from './vite.config.ts';

test('local dev proxies friend-book API requests to the production site by default', () => {
  assert.deepEqual(getFriendBookApiProxyConfig({}), {
    target: 'https://xiaoci-ai.com',
    changeOrigin: true,
    secure: true,
  });
});

test('local dev friend-book API proxy target can be overridden', () => {
  assert.deepEqual(
    getFriendBookApiProxyConfig({
      FRIEND_BOOK_API_PROXY_TARGET: ' http://127.0.0.1:3008 ',
    }),
    {
      target: 'http://127.0.0.1:3008',
      changeOrigin: true,
      secure: true,
    },
  );
});
