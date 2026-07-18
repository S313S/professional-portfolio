import test from 'node:test';
import assert from 'node:assert/strict';
import {unlink, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';

import * as viteConfigModule from './vite.config.ts';
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

test('codex report endpoint loader falls back when its runtime file is malformed', async () => {
  const readCodexReportPayload = (
    viteConfigModule as typeof viteConfigModule & {
      readCodexReportPayload?: (filePath: string) => Promise<{
        loadWarning?: string | null;
        evidence: Array<{id: string}>;
      }>;
    }
  ).readCodexReportPayload;
  const filePath = path.join(tmpdir(), `codex-report-malformed-${process.pid}.json`);

  assert.equal(typeof readCodexReportPayload, 'function');
  await writeFile(filePath, '{"title":', 'utf8');
  try {
    const payload = await readCodexReportPayload?.(filePath);
    assert.match(payload?.loadWarning ?? '', /invalid/i);
    assert.ok(
      payload?.evidence.some(
        (record) => record.id === 'gpt56-visual-debug-evidence-loop',
      ),
    );
  } finally {
    await unlink(filePath);
  }
});
