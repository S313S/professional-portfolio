import test from 'node:test';
import assert from 'node:assert/strict';

import * as codexReportModule from './codexReport';
import {
  createDefaultCodexGuideDocument,
  getInitialCodexGuideItemId,
  getVisibleCodexGuideSteps,
  normalizeCodexGuideDocument,
  resolveCodexGuideSelection,
  summarizeReportText,
} from './codexReport';

const evidenceInput = {
  id: 'friend-book-hotspots',
  title: 'Friend Book hotspot calibration',
  problem: 'The hotspot felt displaced but coordinates were hard to describe.',
  visualIntent: 'Match every hotspot to the visible object.',
  debugRoute: '/debug/friend-book-diff-hotspots',
  createdAt: '2026-07-18T03:30:00.000Z',
  calibration: {
    summary: 'Human-confirmed hotspot coordinates.',
    parameters: [{label: 'hotspot-1.x', value: '42.5%'}],
    confirmedAt: '2026-07-18T04:00:00.000Z',
  },
};

function guideWithEvidence(evidence: unknown[]) {
  const fallback = createDefaultCodexGuideDocument();
  return normalizeCodexGuideDocument({
    title: 'Build Week',
    summary: 'Evidence',
    groups: fallback.groups,
    evidence,
  }) as ReturnType<typeof normalizeCodexGuideDocument> & {
    evidence?: Array<Record<string, unknown>>;
  };
}

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

test('normalizeCodexGuideDocument preserves valid visual debug evidence', () => {
  const guide = guideWithEvidence([evidenceInput]);

  assert.equal(guide.evidence?.length, 1);
  assert.equal(guide.evidence?.[0]?.debugRoute, '/debug/friend-book-diff-hotspots');
  assert.deepEqual(guide.evidence?.[0]?.calibration, evidenceInput.calibration);
});

test('normalizeCodexGuideDocument keeps evidence but removes unsafe debug routes', () => {
  const guide = guideWithEvidence([
    {
      ...evidenceInput,
      debugRoute: 'https://example.com/debug',
    },
  ]);

  assert.equal(guide.evidence?.length, 1);
  assert.equal(guide.evidence?.[0]?.debugRoute, undefined);
});

test('normalizeCodexGuideDocument stays compatible when old documents omit evidence', () => {
  const fallback = createDefaultCodexGuideDocument();
  const guide = normalizeCodexGuideDocument({
    title: 'Legacy guide',
    summary: 'Still readable.',
    groups: fallback.groups,
  }) as ReturnType<typeof normalizeCodexGuideDocument> & {evidence?: unknown[]};

  assert.deepEqual(guide.evidence, []);
});

test('getCodexEvidenceStage reports the latest stage backed by recorded data', () => {
  const getCodexEvidenceStage = (
    codexReportModule as typeof codexReportModule & {
      getCodexEvidenceStage?: (value: unknown) => string;
    }
  ).getCodexEvidenceStage;

  assert.equal(typeof getCodexEvidenceStage, 'function');
  assert.equal(getCodexEvidenceStage?.(evidenceInput), 'calibrated');
  assert.equal(
    getCodexEvidenceStage?.({
      ...evidenceInput,
      implementation: {
        summary: 'Applied the confirmed values.',
        changedFiles: ['src/example.tsx'],
      },
    }),
    'implemented',
  );
  assert.equal(
    getCodexEvidenceStage?.({
      ...evidenceInput,
      implementation: {
        summary: 'Applied the confirmed values.',
        changedFiles: ['src/example.tsx'],
      },
      verification: {
        summary: 'Focused tests passed.',
        commands: ['node --import tsx --test src/example.test.ts'],
        outcome: 'passed',
      },
    }),
    'verified',
  );
  assert.equal(
    getCodexEvidenceStage?.({
      id: evidenceInput.id,
      title: evidenceInput.title,
      problem: evidenceInput.problem,
      visualIntent: evidenceInput.visualIntent,
    }),
    'described',
  );
});

test('formatCodexEvidenceMarkdown exports the recorded evidence facts', () => {
  const formatCodexEvidenceMarkdown = (
    codexReportModule as typeof codexReportModule & {
      formatCodexEvidenceMarkdown?: (value: unknown) => string;
    }
  ).formatCodexEvidenceMarkdown;
  const verifiedEvidence = {
    ...evidenceInput,
    implementation: {
      summary: 'Applied the confirmed values to the source.',
      changedFiles: ['src/FriendBookDiffHotspotsDebugPage.tsx'],
      modelNote: 'User-confirmed current Codex task used GPT-5.6.',
      completedAt: '2026-07-18T05:00:00.000Z',
    },
    verification: {
      summary: 'Focused tests passed.',
      commands: [
        'node --import tsx --test src/FriendBookDiffHotspotsDebugPage.render.test.tsx',
      ],
      outcome: 'passed',
      completedAt: '2026-07-18T05:10:00.000Z',
    },
  };

  assert.equal(typeof formatCodexEvidenceMarkdown, 'function');
  const markdown = formatCodexEvidenceMarkdown?.(verifiedEvidence) ?? '';
  assert.match(markdown, /## Friend Book hotspot calibration/);
  assert.match(markdown, /\/debug\/friend-book-diff-hotspots/);
  assert.match(markdown, /hotspot-1\.x.*42\.5%/s);
  assert.match(markdown, /GPT-5\.6/);
  assert.match(markdown, /src\/FriendBookDiffHotspotsDebugPage\.tsx/);
  assert.match(markdown, /node --import tsx --test/);
  assert.match(markdown, /passed/);
  assert.doesNotMatch(markdown, /undefined|null/);
});

test('formatCodexEvidenceMarkdown omits stages that have not happened', () => {
  const formatCodexEvidenceMarkdown = (
    codexReportModule as typeof codexReportModule & {
      formatCodexEvidenceMarkdown?: (value: unknown) => string;
    }
  ).formatCodexEvidenceMarkdown;

  assert.equal(typeof formatCodexEvidenceMarkdown, 'function');
  const markdown = formatCodexEvidenceMarkdown?.({
    id: evidenceInput.id,
    title: evidenceInput.title,
    problem: evidenceInput.problem,
    visualIntent: evidenceInput.visualIntent,
    createdAt: evidenceInput.createdAt,
  }) ?? '';

  assert.doesNotMatch(markdown, /Human calibration/);
  assert.doesNotMatch(markdown, /Implementation/);
  assert.doesNotMatch(markdown, /Verification/);
  assert.doesNotMatch(markdown, /undefined|null/);
});
