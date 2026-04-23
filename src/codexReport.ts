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

export interface CodexGuideDocument {
  title: string;
  summary: string;
  groups: CodexGuideGroup[];
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
    updatedAt: asTrimmedString(value.updatedAt) || null,
  };
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
