export interface CodexReportSections {
  changes: string;
  why: string;
  technical: string;
  verification: string;
}

export interface CodexReportData {
  title: string;
  summary: string;
  impact: string;
  risk: string;
  updatedAt: string | null;
  sourceLabel: string;
  sections: CodexReportSections;
}

export interface CodexReportSectionDescriptor {
  id: string;
  label: string;
  content: string;
  preview: string;
}

export const CODEX_REPORT_FILE_PATH = 'tmp/codex-report.json';
export const CODEX_REPORT_ENDPOINT = '/__codex-report/current';
export const CODEX_REPORT_UPDATE_ENDPOINT = '/__codex-report/update';
export const CODEX_REPORT_REFRESH_INTERVAL_MS = 5000;

const SENTENCE_END_PATTERN = /[。！？!?]/;

export function createDefaultCodexReport(): CodexReportData {
  return {
    title: '等待最新汇报',
    summary: '这里会自动显示 Codex 最新整理好的结论。',
    impact: '适合把长步骤、修复说明和验证结果收成一个更好扫读的面板。',
    risk: '当前还没有新的汇报内容。',
    updatedAt: null,
    sourceLabel: 'Local dev report feed',
    sections: {
      changes: '等待新的“改了什么”内容。',
      why: '等待新的“为什么这么改”内容。',
      technical: '等待新的“技术细节”内容。',
      verification: '等待新的“验证结果”内容。',
    },
  };
}

export function normalizeCodexReport(
  value: Partial<CodexReportData> | null | undefined,
): CodexReportData {
  const fallback = createDefaultCodexReport();

  return {
    title: value?.title?.trim() || fallback.title,
    summary: value?.summary?.trim() || fallback.summary,
    impact: value?.impact?.trim() || fallback.impact,
    risk: value?.risk?.trim() || fallback.risk,
    updatedAt: value?.updatedAt ?? fallback.updatedAt,
    sourceLabel: value?.sourceLabel?.trim() || fallback.sourceLabel,
    sections: {
      changes: value?.sections?.changes?.trim() || fallback.sections.changes,
      why: value?.sections?.why?.trim() || fallback.sections.why,
      technical: value?.sections?.technical?.trim() || fallback.sections.technical,
      verification:
        value?.sections?.verification?.trim() || fallback.sections.verification,
    },
  };
}

export function summarizeReportText(text: string, maxLength = 34): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return '等待补充摘要。';
  }

  const firstSentence = normalized
    .split(SENTENCE_END_PATTERN)
    .map((segment) => segment.trim())
    .find(Boolean);

  const candidate = firstSentence ? `${firstSentence}${normalized.match(SENTENCE_END_PATTERN)?.[0] ?? ''}` : normalized;
  if (candidate.length <= maxLength) {
    return candidate;
  }

  return `${candidate.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function getCodexReportSectionDescriptors(
  report: CodexReportData,
): CodexReportSectionDescriptor[] {
  return [
    {
      id: 'codex-report-changes',
      label: '改了什么',
      content: report.sections.changes,
      preview: summarizeReportText(report.sections.changes),
    },
    {
      id: 'codex-report-why',
      label: '为什么这么改',
      content: report.sections.why,
      preview: summarizeReportText(report.sections.why),
    },
    {
      id: 'codex-report-technical',
      label: '技术细节',
      content: report.sections.technical,
      preview: summarizeReportText(report.sections.technical),
    },
    {
      id: 'codex-report-verification',
      label: '验证结果',
      content: report.sections.verification,
      preview: summarizeReportText(report.sections.verification),
    },
  ];
}
