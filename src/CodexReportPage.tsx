import { startTransition, useEffect, useState } from 'react';

import {
  CODEX_REPORT_ENDPOINT,
  CODEX_REPORT_REFRESH_INTERVAL_MS,
  CODEX_REPORT_UPDATE_ENDPOINT,
  createDefaultCodexReport,
  getCodexReportSectionDescriptors,
  normalizeCodexReport,
  type CodexReportData,
} from './codexReport';

function formatUpdatedAt(updatedAt: string | null): string {
  if (!updatedAt) {
    return 'Waiting for the first synced update.';
  }

  const parsed = new Date(updatedAt);
  if (Number.isNaN(parsed.getTime())) {
    return updatedAt;
  }

  return parsed.toLocaleString();
}

async function readLatestCodexReport(signal?: AbortSignal): Promise<CodexReportData> {
  const response = await fetch(CODEX_REPORT_ENDPOINT, {
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Unable to load Codex report (${response.status}).`);
  }

  return normalizeCodexReport((await response.json()) as Partial<CodexReportData>);
}

export default function CodexReportPage() {
  const [report, setReport] = useState(createDefaultCodexReport);
  const [statusMessage, setStatusMessage] = useState('Auto refresh is on.');
  const sections = getCodexReportSectionDescriptors(report);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let isDisposed = false;

    const syncReport = async () => {
      const controller = new AbortController();

      try {
        const nextReport = await readLatestCodexReport(controller.signal);
        if (isDisposed) {
          return;
        }

        startTransition(() => {
          setReport(nextReport);
          setStatusMessage('Auto refresh is on.');
        });
      } catch (error) {
        if (isDisposed || controller.signal.aborted) {
          return;
        }

        setStatusMessage(
          error instanceof Error ? error.message : 'Unable to refresh the Codex report.',
        );
      }

      return () => controller.abort();
    };

    void syncReport();
    const intervalId = window.setInterval(() => {
      void syncReport();
    }, CODEX_REPORT_REFRESH_INTERVAL_MS);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f7efe2] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-[#d9c6af] bg-[rgba(252,247,239,0.96)] px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#7a5d4d]">
            Dev Only Standalone Preview
          </p>
          <h1 className="font-serif text-[1.8rem] leading-none text-[#2f2120]">
            Codex Report Panel
          </h1>
          <p className="max-w-[820px] text-sm leading-6 text-[#5b473d]">
            Automatically refreshes the latest Codex summary and keeps long implementation notes in
            collapsed sections on the right-side browser.
          </p>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1320px] gap-6 px-4 py-6 lg:grid-cols-[260px_minmax(0,1fr)_320px] lg:px-6">
        <aside
          data-codex-report-panel="toc"
          className="rounded-[1.6rem] border border-[#d8c3ab] bg-[rgba(255,249,242,0.9)] p-5 shadow-[0_16px_32px_rgba(70,43,29,0.07)] lg:sticky lg:top-[96px] lg:h-fit"
        >
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#8b6a56]">
            目录
          </p>
          <nav className="mt-4 grid gap-3">
            <a
              href="#codex-report-summary"
              className="rounded-[1rem] border border-[#eadbc7] bg-white/70 px-3 py-3 no-underline transition hover:bg-white"
            >
              <p className="text-sm font-medium text-[#3f2f28]">结论</p>
              <p className="mt-1 text-xs leading-5 text-[#7a6253]">{report.summary}</p>
            </a>
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-[1rem] border border-[#eadbc7] bg-white/70 px-3 py-3 no-underline transition hover:bg-white"
              >
                <p className="text-sm font-medium text-[#3f2f28]">{section.label}</p>
                <p className="mt-1 text-xs leading-5 text-[#7a6253]">{section.preview}</p>
              </a>
            ))}
          </nav>
        </aside>

        <section className="grid gap-5">
          <article
            id="codex-report-summary"
            data-codex-report-panel="summary"
            className="rounded-[1.6rem] border border-[#d8c3ab] bg-[rgba(255,249,242,0.92)] p-6 shadow-[0_18px_36px_rgba(70,43,29,0.08)]"
          >
            <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#8b6a56]">
              结论
            </p>
            <h2 className="mt-3 font-serif text-[2rem] leading-[1.05] text-[#2f2120]">
              {report.title}
            </h2>
            <div className="mt-5 grid gap-3 text-[1rem] leading-7 text-[#4e3c33]">
              <p>{report.summary}</p>
              <p>{report.impact}</p>
              <p>{report.risk}</p>
            </div>
          </article>

          <section
            data-codex-report-panel="details"
            className="grid gap-3 rounded-[1.6rem] border border-[#d8c3ab] bg-[rgba(255,252,247,0.88)] p-4 shadow-[0_14px_32px_rgba(70,43,29,0.06)]"
          >
            {sections.map((section) => (
              <details
                key={section.id}
                id={section.id}
                className="overflow-hidden rounded-[1.1rem] border border-[#deccb8] bg-white/70 open:bg-white"
              >
                <summary className="cursor-pointer list-none px-4 py-3">
                  <p className="font-medium text-[#3f2f28]">{section.label}</p>
                  <p className="mt-1 text-xs leading-5 text-[#7a6253]">一句话概括：{section.preview}</p>
                </summary>
                <div className="border-t border-[#eadfd1] px-4 py-4 text-sm leading-7 text-[#5d4b41]">
                  {section.content}
                </div>
              </details>
            ))}
          </section>
        </section>

        <aside
          data-codex-report-panel="meta"
          className="rounded-[1.6rem] border border-[#d8c3ab] bg-[rgba(255,249,242,0.9)] p-5 shadow-[0_16px_32px_rgba(70,43,29,0.07)] lg:sticky lg:top-[96px] lg:h-fit"
        >
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#8b6a56]">
            面板状态
          </p>
          <dl className="mt-4 grid gap-4 text-sm leading-6 text-[#5b473d]">
            <div>
              <dt className="font-medium text-[#3f2f28]">状态</dt>
              <dd>{statusMessage}</dd>
            </div>
            <div>
              <dt className="font-medium text-[#3f2f28]">最近更新时间</dt>
              <dd>{formatUpdatedAt(report.updatedAt)}</dd>
            </div>
            <div>
              <dt className="font-medium text-[#3f2f28]">数据来源</dt>
              <dd>{report.sourceLabel}</dd>
            </div>
            <div>
              <dt className="font-medium text-[#3f2f28]">更新接口</dt>
              <dd className="font-mono text-[0.78rem] break-all">
                POST {CODEX_REPORT_UPDATE_ENDPOINT}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[#3f2f28]">读取接口</dt>
              <dd className="font-mono text-[0.78rem] break-all">
                GET {CODEX_REPORT_ENDPOINT}
              </dd>
            </div>
          </dl>
        </aside>
      </main>
    </div>
  );
}
