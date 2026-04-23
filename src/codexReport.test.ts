import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createDefaultCodexGuideDocument,
  getInitialCodexGuideItemId,
  getVisibleCodexGuideSteps,
  normalizeCodexGuideDocument,
  resolveCodexGuideSelection,
  summarizeReportText,
} from './codexReport';

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

test('normalizeCodexGuideDocument falls back to the empty guide when groups are missing', () => {
  const guide = normalizeCodexGuideDocument({
    title: '旧结构',
    sections: {
      changes: 'x',
    },
  });

  assert.equal(guide.title, '等待最新指南');
  assert.equal(guide.groups[0]?.label, '开始这里');
});

test('normalizeCodexGuideDocument keeps only valid groups and items', () => {
  const guide = normalizeCodexGuideDocument({
    title: '滚动修复指南',
    summary: '先看这里。',
    groups: [
      {
        id: 'fix-now',
        label: '先处理',
        items: [
          {
            id: 'wheel',
            label: '修正滚轮接力',
            summary: '先把滚动接力理顺。',
            steps: ['锁定 loading 阶段的接力。', '确认第一页不会反跳。'],
          },
          {
            id: '',
            label: '无效项',
            summary: '不应该保留',
            steps: [],
          },
        ],
      },
      {
        id: 'empty-group',
        label: '空组',
        items: [],
      },
    ],
  });

  assert.equal(guide.title, '滚动修复指南');
  assert.equal(guide.groups.length, 1);
  assert.equal(guide.groups[0]?.items.length, 1);
  assert.equal(guide.groups[0]?.items[0]?.label, '修正滚轮接力');
});

test('getVisibleCodexGuideSteps trims blank lines and limits the guide to four steps', () => {
  assert.deepEqual(
    getVisibleCodexGuideSteps({
      id: 'a',
      label: '步骤',
      summary: '摘要',
      steps: ['1', ' ', '2', '3', '4', '5'],
    }),
    ['1', '2', '3', '4'],
  );
});

test('resolveCodexGuideSelection keeps valid selections and falls back to the first item', () => {
  const guide = createDefaultCodexGuideDocument();

  assert.equal(
    resolveCodexGuideSelection(guide, 'waiting-guide'),
    'waiting-guide',
  );
  assert.equal(
    resolveCodexGuideSelection(guide, 'missing'),
    getInitialCodexGuideItemId(guide),
  );
});
