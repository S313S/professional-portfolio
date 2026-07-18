import test from 'node:test';
import assert from 'node:assert/strict';

import * as codexReportModule from './codexReport';
import {
  createDefaultCodexGuideDocument,
  getCodexEvidenceStage,
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
  const record = guide.evidence?.find((entry) => entry.id === evidenceInput.id);

  assert.equal(guide.evidence?.length, 3);
  assert.equal(record?.debugRoute, '/debug/friend-book-diff-hotspots');
  assert.deepEqual(record?.calibration, evidenceInput.calibration);
});

test('normalizeCodexGuideDocument keeps evidence but removes unsafe debug routes', () => {
  const guide = guideWithEvidence([
    {
      ...evidenceInput,
      debugRoute: 'https://example.com/debug',
    },
  ]);
  const record = guide.evidence?.find((entry) => entry.id === evidenceInput.id);

  assert.equal(guide.evidence?.length, 3);
  assert.equal(record?.debugRoute, undefined);
});

test('normalizeCodexGuideDocument keeps built-in evidence when old documents omit it', () => {
  const fallback = createDefaultCodexGuideDocument();
  const guide = normalizeCodexGuideDocument({
    title: 'Legacy guide',
    summary: 'Still readable.',
    groups: fallback.groups,
  }) as ReturnType<typeof normalizeCodexGuideDocument> & {evidence?: unknown[]};

  assert.deepEqual(
    guide.evidence.map((record) => record.id),
    ['gpt56-visual-debug-evidence-loop', 'gpt56-hotspot-debug-refactor'],
  );
});

test('normalizeCodexGuideDocument merges built-in evidence with runtime records', () => {
  const emptyRuntimeGuide = guideWithEvidence([]);
  const additionalRuntimeGuide = guideWithEvidence([evidenceInput]);
  const overriddenRuntimeGuide = guideWithEvidence([
    {
      id: 'gpt56-visual-debug-evidence-loop',
      title: 'Runtime-updated evidence loop',
      problem: 'Updated problem statement.',
      visualIntent: 'Updated visual intent.',
      debugRoute: '/debug/codex-report',
    },
  ]);

  assert.deepEqual(
    emptyRuntimeGuide.evidence?.map((record) => record.id),
    ['gpt56-visual-debug-evidence-loop', 'gpt56-hotspot-debug-refactor'],
  );
  assert.deepEqual(
    additionalRuntimeGuide.evidence?.map((record) => record.id),
    [
      'gpt56-visual-debug-evidence-loop',
      'gpt56-hotspot-debug-refactor',
      'friend-book-hotspots',
    ],
  );
  assert.equal(overriddenRuntimeGuide.evidence?.length, 2);
  assert.equal(overriddenRuntimeGuide.evidence?.[0]?.title, 'Runtime-updated evidence loop');
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

test('getCodexEvidenceStage does not invent missing prerequisite stages', () => {
  const verification = {
    summary: 'A command was attempted.',
    commands: ['npm run lint'],
    outcome: 'failed' as const,
  };
  const implementation = {
    summary: 'A change was made.',
    changedFiles: ['src/example.ts'],
  };

  assert.equal(
    getCodexEvidenceStage({
      id: evidenceInput.id,
      title: evidenceInput.title,
      problem: evidenceInput.problem,
      visualIntent: evidenceInput.visualIntent,
      verification,
    }),
    'described',
  );
  assert.equal(
    getCodexEvidenceStage({
      ...evidenceInput,
      verification,
    }),
    'calibrated',
  );
  assert.equal(
    getCodexEvidenceStage({
      id: evidenceInput.id,
      title: evidenceInput.title,
      problem: evidenceInput.problem,
      visualIntent: evidenceInput.visualIntent,
      implementation,
      verification,
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

test('the default report includes the truthful GPT-5.6 Build Week extension record', () => {
  const record = createDefaultCodexGuideDocument().evidence.find(
    (entry) => entry.id === 'gpt56-visual-debug-evidence-loop',
  );

  assert.ok(record);
  assert.equal(record.debugRoute, '/debug/codex-report');
  assert.equal(getCodexEvidenceStage(record), 'verified');
  assert.match(record.implementation?.modelNote ?? '', /user-confirmed current Codex task/i);
  assert.match(record.implementation?.modelNote ?? '', /GPT-5\.6/);
  assert.doesNotMatch(record.implementation?.modelNote ?? '', /platform-certified/i);
  assert.equal(record.verification?.outcome, 'passed');
  assert.ok(record.verification?.commands.includes('npm run lint'));
  assert.ok(record.verification?.commands.includes('npm run build'));
});

test('the default report records the GPT-5.6 refactor of the existing hotspot tool', () => {
  const record = createDefaultCodexGuideDocument().evidence.find(
    (entry) => entry.id === 'gpt56-hotspot-debug-refactor',
  );

  assert.ok(record);
  assert.equal(record.debugRoute, '/debug/friend-book-diff-hotspots');
  assert.match(record.implementation?.summary ?? '', /refactored and extended/i);
  assert.match(record.implementation?.modelNote ?? '', /existing tool/i);
  assert.match(record.implementation?.modelNote ?? '', /GPT-5\.6/);
  assert.doesNotMatch(
    `${record.implementation?.summary ?? ''} ${record.implementation?.modelNote ?? ''}`,
    /built (?:the )?original .* from scratch/i,
  );
  assert.equal(record.verification?.outcome, 'passed');
  assert.equal(getCodexEvidenceStage(record), 'verified');
  assert.ok(record.verification?.commands.includes('npm run lint'));
  assert.ok(record.verification?.commands.includes('npm run build'));
});

test('parseCodexGuideDocumentText falls back safely for malformed runtime JSON', () => {
  const parseCodexGuideDocumentText = (
    codexReportModule as typeof codexReportModule & {
      parseCodexGuideDocumentText?: (value: string) => {
        loadWarning?: string | null;
        evidence: Array<{id: string}>;
      };
    }
  ).parseCodexGuideDocumentText;

  assert.equal(typeof parseCodexGuideDocumentText, 'function');
  const guide = parseCodexGuideDocumentText?.('{"title":') as {
    loadWarning?: string | null;
    evidence: Array<{id: string}>;
  };

  assert.match(guide.loadWarning ?? '', /invalid/i);
  assert.ok(
    guide.evidence.some((record) => record.id === 'gpt56-visual-debug-evidence-loop'),
  );
});
