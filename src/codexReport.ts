export interface CodexGuideItem {
  id: string;
  label: string;
  summary: string;
  steps: string[];
  promptHint?: string;
}

export interface CodexGuideGroup {
  id: string;
  label: string;
  items: CodexGuideItem[];
}

export type CodexEvidenceStage =
  | 'described'
  | 'calibrated'
  | 'implemented'
  | 'verified';

export interface CodexEvidenceParameter {
  label: string;
  value: string;
}

export interface CodexVisualDebugEvidence {
  id: string;
  title: string;
  problem: string;
  visualIntent: string;
  debugRoute?: string;
  createdAt?: string;
  calibration?: {
    summary: string;
    parameters: CodexEvidenceParameter[];
    confirmedAt?: string;
  };
  implementation?: {
    summary: string;
    changedFiles: string[];
    modelNote?: string;
    completedAt?: string;
  };
  verification?: {
    summary: string;
    commands: string[];
    outcome: 'passed' | 'failed' | 'pending';
    completedAt?: string;
  };
}

export interface CodexGuideDocument {
  title: string;
  summary: string;
  groups: CodexGuideGroup[];
  evidence: CodexVisualDebugEvidence[];
  updatedAt?: string | null;
}

export interface CodexGuideSelection {
  group: CodexGuideGroup;
  item: CodexGuideItem;
}

export const CODEX_REPORT_FILE_PATH = 'tmp/codex-report.json';
export const CODEX_REPORT_ENDPOINT = '/__codex-report/current';
export const CODEX_REPORT_UPDATE_ENDPOINT = '/__codex-report/update';
export const CODEX_REPORT_REFRESH_INTERVAL_MS = 5000;

const CODEX_REPORT_ALLOWED_DEBUG_ROUTES = new Set([
  '/debug/friend-book-finale',
  '/debug/friend-book-diff-hotspots',
  '/debug/works-detail',
  '/debug/career-detail',
  '/debug/codex-report',
]);

const SENTENCE_END_PATTERN = /[。！？!?]/;

function asTrimmedString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeGuideSteps(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => asTrimmedString(entry))
    .filter(Boolean);
}

function normalizeEvidenceParameter(value: unknown): CodexEvidenceParameter | null {
  if (!isRecord(value)) {
    return null;
  }

  const label = asTrimmedString(value.label);
  const parameterValue = asTrimmedString(value.value);
  if (!label || !parameterValue) {
    return null;
  }

  return {label, value: parameterValue};
}

function normalizeEvidenceCalibration(
  value: unknown,
): CodexVisualDebugEvidence['calibration'] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const summary = asTrimmedString(value.summary);
  if (!summary) {
    return undefined;
  }

  const parameters = Array.isArray(value.parameters)
    ? value.parameters
        .map((parameter) => normalizeEvidenceParameter(parameter))
        .filter((parameter): parameter is CodexEvidenceParameter => parameter !== null)
    : [];

  return {
    summary,
    parameters,
    confirmedAt: asTrimmedString(value.confirmedAt) || undefined,
  };
}

function normalizeEvidenceImplementation(
  value: unknown,
): CodexVisualDebugEvidence['implementation'] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const summary = asTrimmedString(value.summary);
  if (!summary) {
    return undefined;
  }

  return {
    summary,
    changedFiles: normalizeGuideSteps(value.changedFiles),
    modelNote: asTrimmedString(value.modelNote) || undefined,
    completedAt: asTrimmedString(value.completedAt) || undefined,
  };
}

function normalizeEvidenceVerification(
  value: unknown,
): CodexVisualDebugEvidence['verification'] | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const summary = asTrimmedString(value.summary);
  const outcome = asTrimmedString(value.outcome);
  if (
    !summary ||
    (outcome !== 'passed' && outcome !== 'failed' && outcome !== 'pending')
  ) {
    return undefined;
  }

  return {
    summary,
    commands: normalizeGuideSteps(value.commands),
    outcome,
    completedAt: asTrimmedString(value.completedAt) || undefined,
  };
}

function normalizeVisualDebugEvidence(value: unknown): CodexVisualDebugEvidence | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asTrimmedString(value.id);
  const title = asTrimmedString(value.title);
  const problem = asTrimmedString(value.problem);
  const visualIntent = asTrimmedString(value.visualIntent);

  if (!id || !title || !problem || !visualIntent) {
    return null;
  }

  const debugRoute = asTrimmedString(value.debugRoute);

  return {
    id,
    title,
    problem,
    visualIntent,
    debugRoute: CODEX_REPORT_ALLOWED_DEBUG_ROUTES.has(debugRoute)
      ? debugRoute
      : undefined,
    createdAt: asTrimmedString(value.createdAt) || undefined,
    calibration: normalizeEvidenceCalibration(value.calibration),
    implementation: normalizeEvidenceImplementation(value.implementation),
    verification: normalizeEvidenceVerification(value.verification),
  };
}

function normalizeGuideItem(value: unknown): CodexGuideItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asTrimmedString(value.id);
  const label = asTrimmedString(value.label);
  const summary = asTrimmedString(value.summary);

  if (!id || !label || !summary) {
    return null;
  }

  return {
    id,
    label,
    summary,
    steps: normalizeGuideSteps(value.steps),
    promptHint: asTrimmedString(value.promptHint) || undefined,
  };
}

function normalizeGuideGroup(value: unknown): CodexGuideGroup | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = asTrimmedString(value.id);
  const label = asTrimmedString(value.label);
  const items = Array.isArray(value.items)
    ? value.items.map((item) => normalizeGuideItem(item)).filter(Boolean)
    : [];

  if (!id || !label || items.length === 0) {
    return null;
  }

  return {
    id,
    label,
    items,
  };
}

function createBuildWeekVisualDebugEvidence(): CodexVisualDebugEvidence {
  return {
    id: 'gpt56-visual-debug-evidence-loop',
    title: 'Visual debugging evidence loop',
    problem:
      'The existing standalone debugging interfaces helped translate visual intent, but the report panel could not show how human calibration became traceable source changes.',
    visualIntent:
      'Keep the public portfolio untouched while presenting a concise, inspectable developer-only trail from subjective feedback to implementation and verification.',
    debugRoute: '/debug/codex-report',
    createdAt: '2026-07-18T11:57:29+08:00',
    calibration: {
      summary:
        'The user approved a developer-only evidence loop that reuses the existing Friend Book, Career, Works, and Codex Report debugging routes.',
      parameters: [
        {label: 'exposure', value: 'development-only route'},
        {label: 'public portfolio', value: 'no new production entry point'},
        {
          label: 'evidence stages',
          value: 'problem → human calibration → implementation → verification',
        },
      ],
      confirmedAt: '2026-07-18T11:57:29+08:00',
    },
    implementation: {
      summary:
        'GPT-5.6 extended Codex Report with normalized evidence records, a debug-route allowlist, stage calculation, Markdown export, evidence navigation, and a detailed evidence view.',
      changedFiles: [
        'src/codexReport.ts',
        'src/codexReport.test.ts',
        'src/CodexReportPage.tsx',
        'src/CodexReportPage.render.test.tsx',
      ],
      modelNote:
        'The user-confirmed current Codex task used GPT-5.6; the active task selector and Codex session are the primary model-use evidence.',
      completedAt: '2026-07-18T12:09:01+08:00',
    },
  };
}

export function createDefaultCodexGuideDocument(): CodexGuideDocument {
  return {
    title: '等待最新指南',
    summary: '这里会自动显示 Codex 最新整理好的行动指南。',
    groups: [
      {
        id: 'start-here',
        label: '开始这里',
        items: [
          {
            id: 'waiting-guide',
            label: '等待新的行动指南',
            summary: '新内容到来后，这里会替换成经过整理的短行动建议。',
            steps: [
              '保持这个页面打开，等待 Codex 写入新内容。',
              '点左侧条目查看不同主题的行动建议。',
            ],
            promptHint: '如果你想看细节，可以直接回到聊天里追问。',
          },
        ],
      },
    ],
    evidence: [createBuildWeekVisualDebugEvidence()],
    updatedAt: null,
  };
}

export function normalizeCodexGuideDocument(value: unknown): CodexGuideDocument {
  if (!isRecord(value) || !Array.isArray(value.groups)) {
    return createDefaultCodexGuideDocument();
  }

  const groups = value.groups
    .map((group) => normalizeGuideGroup(group))
    .filter(Boolean);

  if (groups.length === 0) {
    return createDefaultCodexGuideDocument();
  }

  return {
    title: asTrimmedString(value.title) || '未命名行动指南',
    summary: asTrimmedString(value.summary) || '从左侧选择一个主题，查看当前最该做的事。',
    groups,
    evidence: Array.isArray(value.evidence)
      ? value.evidence
          .map((record) => normalizeVisualDebugEvidence(record))
          .filter((record): record is CodexVisualDebugEvidence => record !== null)
      : [],
    updatedAt: asTrimmedString(value.updatedAt) || null,
  };
}

export function getCodexEvidenceStage(
  record: CodexVisualDebugEvidence,
): CodexEvidenceStage {
  if (record.verification) {
    return 'verified';
  }
  if (record.implementation) {
    return 'implemented';
  }
  if (record.calibration) {
    return 'calibrated';
  }
  return 'described';
}

export function formatCodexEvidenceMarkdown(
  record: CodexVisualDebugEvidence,
): string {
  const lines = [
    `## ${record.title}`,
    '',
    `**Stage:** ${getCodexEvidenceStage(record)}`,
    '',
    '### Problem',
    '',
    record.problem,
    '',
    '### Visual intent',
    '',
    record.visualIntent,
  ];

  if (record.debugRoute) {
    lines.push('', `**Debug route:** \`${record.debugRoute}\``);
  }

  if (record.calibration) {
    lines.push('', '### Human calibration', '', record.calibration.summary);
    if (record.calibration.parameters.length > 0) {
      lines.push(
        '',
        ...record.calibration.parameters.map(
          (parameter) => `- \`${parameter.label}\`: ${parameter.value}`,
        ),
      );
    }
  }

  if (record.implementation) {
    lines.push('', '### Implementation', '', record.implementation.summary);
    if (record.implementation.modelNote) {
      lines.push('', `**Model note:** ${record.implementation.modelNote}`);
    }
    if (record.implementation.changedFiles.length > 0) {
      lines.push(
        '',
        '**Changed files:**',
        '',
        ...record.implementation.changedFiles.map((file) => `- \`${file}\``),
      );
    }
  }

  if (record.verification) {
    lines.push(
      '',
      '### Verification',
      '',
      `**Outcome:** ${record.verification.outcome}`,
      '',
      record.verification.summary,
    );
    if (record.verification.commands.length > 0) {
      lines.push(
        '',
        '**Commands:**',
        '',
        ...record.verification.commands.map((command) => `- \`${command}\``),
      );
    }
  }

  const timeline = [
    record.createdAt ? `- Created: ${record.createdAt}` : '',
    record.calibration?.confirmedAt
      ? `- Calibration confirmed: ${record.calibration.confirmedAt}`
      : '',
    record.implementation?.completedAt
      ? `- Implementation completed: ${record.implementation.completedAt}`
      : '',
    record.verification?.completedAt
      ? `- Verification completed: ${record.verification.completedAt}`
      : '',
  ].filter(Boolean);

  if (timeline.length > 0) {
    lines.push('', '### Timeline', '', ...timeline);
  }

  return `${lines.join('\n').trim()}\n`;
}

export function summarizeReportText(text: string, maxLength = 34): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '等待补充摘要。';
  }

  const sentenceMatch = normalized.match(/^.*?[。！？!?]/);
  const candidate = sentenceMatch?.[0]?.trim() || normalized;
  if (candidate.length <= maxLength) {
    return candidate;
  }

  return `${candidate.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function getInitialCodexGuideItemId(document: CodexGuideDocument): string | null {
  return document.groups[0]?.items[0]?.id ?? null;
}

export function findCodexGuideSelection(
  document: CodexGuideDocument,
  itemId: string | null,
): CodexGuideSelection | null {
  if (!itemId) {
    return null;
  }

  for (const group of document.groups) {
    const item = group.items.find((entry) => entry.id === itemId);
    if (item) {
      return {group, item};
    }
  }

  return null;
}

export function resolveCodexGuideSelection(
  document: CodexGuideDocument,
  currentItemId: string | null,
): string | null {
  if (findCodexGuideSelection(document, currentItemId)) {
    return currentItemId;
  }

  return getInitialCodexGuideItemId(document);
}

export function getVisibleCodexGuideSteps(item: CodexGuideItem): string[] {
  return item.steps
    .map((step) => step.trim())
    .filter(Boolean)
    .slice(0, 4);
}
