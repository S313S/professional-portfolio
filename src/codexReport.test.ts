import test from 'node:test';
import assert from 'node:assert/strict';

import { summarizeReportText } from './codexReport';

test('summarizeReportText keeps only the first concise sentence for previews', () => {
  assert.equal(
    summarizeReportText(
      '把滚动接力改顺了，避免第一次下滑被错误拦截。相关文件也做了同步调整，测试已经补齐。',
      28,
    ),
    '把滚动接力改顺了，避免第一次下滑被错误拦截。',
  );
});

test('summarizeReportText trims long text down to a short preview', () => {
  assert.equal(
    summarizeReportText(
      '这是一个没有明显句号但是会持续很长很长的描述，需要被压缩成适合目录阅读的一句话',
      18,
    ),
    '这是一个没有明显句号但是会持续很长…',
  );
});
