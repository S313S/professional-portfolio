import { startTransition, useEffect, useState } from 'react';

import {
  CODEX_REPORT_ENDPOINT,
  CODEX_REPORT_REFRESH_INTERVAL_MS,
  createDefaultCodexGuideDocument,
  findCodexGuideSelection,
  getInitialCodexGuideItemId,
  getVisibleCodexGuideSteps,
  normalizeCodexGuideDocument,
  resolveCodexGuideSelection,
  type CodexGuideDocument,
} from './codexReport';

async function readLatestCodexGuide(signal?: AbortSignal): Promise<CodexGuideDocument> {
  const response = await fetch(CODEX_REPORT_ENDPOINT, {
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache',
    },
    cache: 'no-store',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Unable to load Codex guide (${response.status}).`);
  }

  return normalizeCodexGuideDocument(await response.json());
}

interface GuideNavigationTreeProps {
  document: CodexGuideDocument;
  selectedItemId: string | null;
  onSelect: (itemId: string) => void;
}

const CHINESE_SECTION_NUMERALS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

function getSectionIndexLabel(index: number): string {
  return CHINESE_SECTION_NUMERALS[index] ?? `${index + 1}`;
}

function GuideNavigationTree({
  document,
  selectedItemId,
  onSelect,
}: GuideNavigationTreeProps) {
  return (
    <nav className="grid gap-6">
      {document.groups.map((group, groupIndex) => (
        <section
          key={group.id}
          data-codex-report-nav-group={group.id}
          data-codex-report-nav-level="group"
          className="grid gap-3"
        >
          <p className="text-[1.15rem] font-semibold leading-7 tracking-[-0.01em] text-[#171311]">
            {getSectionIndexLabel(groupIndex)}、{group.label}
          </p>
          <div className="grid gap-1 border-l border-[#ebe0d3] pl-5">
            {group.items.map((item, itemIndex) => {
              const isActive = item.id === selectedItemId;
              return (
                <button
                  key={item.id}
                  type="button"
                  data-codex-report-nav-item={item.id}
                  data-codex-report-nav-level="item"
                  onClick={() => onSelect(item.id)}
                  className={[
                    'group flex items-start gap-3 rounded-[0.75rem] px-2 py-1.5 text-left transition',
                    isActive
                      ? 'bg-[#f7efe6] text-[#171311]'
                      : 'text-[#73675e] hover:bg-[rgba(255,255,255,0.72)] hover:text-[#26201c]',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'mt-[0.38rem] h-3.5 w-[2px] rounded-full transition',
                      isActive ? 'bg-[#b98f73]' : 'bg-transparent',
                    ].join(' ')}
                  />
                  <div className="grid gap-0.5">
                    <p className={isActive ? 'font-medium' : 'font-normal'}>
                      {groupIndex + 1}.{itemIndex + 1} {item.label}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}

interface CodexReportPageProps {
  initialNavCollapsed?: boolean;
}

export default function CodexReportPage({
  initialNavCollapsed = false,
}: CodexReportPageProps) {
  const [document, setDocument] = useState(createDefaultCodexGuideDocument);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(() =>
    getInitialCodexGuideItemId(createDefaultCodexGuideDocument()),
  );
  const [isNavCollapsed, setIsNavCollapsed] = useState(initialNavCollapsed);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let isDisposed = false;

    const syncGuide = async () => {
      const controller = new AbortController();

      try {
        const nextDocument = await readLatestCodexGuide(controller.signal);
        if (isDisposed) {
          return;
        }

        startTransition(() => {
          setDocument(nextDocument);
          setSelectedItemId((current) => resolveCodexGuideSelection(nextDocument, current));
        });
      } catch {
        if (isDisposed || controller.signal.aborted) {
          return;
        }
      }
    };

    void syncGuide();
    const intervalId = window.setInterval(() => {
      void syncGuide();
    }, CODEX_REPORT_REFRESH_INTERVAL_MS);

    return () => {
      isDisposed = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const activeSelection =
    findCodexGuideSelection(document, selectedItemId) ??
    findCodexGuideSelection(document, getInitialCodexGuideItemId(document));
  const visibleSteps = activeSelection ? getVisibleCodexGuideSteps(activeSelection.item) : [];
  const promptHint =
    activeSelection?.item.promptHint || '如果你想看细节，可以直接继续追问。';

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
            Automatically refreshes the latest Codex guide and turns each topic into a short,
            action-first reading view.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-[1340px] px-4 py-6 lg:px-6">
        <details
          className="overflow-hidden rounded-[1.4rem] border border-[#d8c3ab] bg-[rgba(255,249,242,0.92)] shadow-[0_14px_32px_rgba(70,43,29,0.07)] lg:hidden"
        >
          <summary className="cursor-pointer list-none px-5 py-4 font-medium text-[#3f2f28]">
            目录
          </summary>
          <div className="border-t border-[#eadfd1] px-4 py-4">
            <GuideNavigationTree
              document={document}
              selectedItemId={selectedItemId}
              onSelect={setSelectedItemId}
            />
          </div>
        </details>

        <section
          className={[
            'hidden lg:block',
            isNavCollapsed ? '' : '',
          ].join(' ')}
        >
          <div className="relative">
            <aside
              data-codex-report-panel="toc"
              data-codex-report-nav-shell={isNavCollapsed ? 'collapsed' : 'expanded'}
              className={[
                'absolute left-0 top-0 z-20 transition-all duration-200',
                isNavCollapsed ? 'w-[58px]' : 'w-[320px]',
              ].join(' ')}
            >
              <div
                className={[
                  'relative overflow-hidden rounded-[0.95rem] border border-[#e3d8cb] bg-[rgba(255,255,255,0.98)] shadow-[0_18px_48px_rgba(78,61,40,0.1)]',
                  isNavCollapsed ? 'min-h-[220px]' : 'min-h-[640px]',
                ].join(' ')}
              >
                <button
                  type="button"
                  data-codex-report-nav-toggle="true"
                  onClick={() => setIsNavCollapsed((current) => !current)}
                  className={[
                    'absolute right-0 top-[108px] -mr-5 flex h-[108px] w-10 items-center justify-center rounded-[0.95rem] border border-[#e7dccf] bg-[rgba(255,252,247,0.98)] text-[0.88rem] text-[#6d6156] shadow-[0_12px_24px_rgba(88,67,42,0.08)]',
                  ].join(' ')}
                  aria-label={isNavCollapsed ? '展开目录' : '收起目录'}
                  style={{ writingMode: 'vertical-rl' }}
                >
                  目录
                </button>

                {!isNavCollapsed ? (
                  <div className="max-h-[calc(100vh-156px)] overflow-y-auto px-9 py-8">
                    <div className="mb-7 flex items-center gap-2 text-[#817568]">
                      <span className="text-[0.95rem]">▾</span>
                      <p className="text-[1rem] font-medium tracking-[0.08em]">目录</p>
                    </div>
                    <GuideNavigationTree
                      document={document}
                      selectedItemId={selectedItemId}
                      onSelect={setSelectedItemId}
                    />
                  </div>
                ) : null}
              </div>
            </aside>

            <div
              className={[
                'transition-all duration-200',
                isNavCollapsed ? 'pl-[92px]' : 'pl-[360px]',
              ].join(' ')}
            >
              <article
                data-codex-report-panel="guide"
                className="rounded-[1.6rem] border border-[#d8c3ab] bg-[rgba(255,249,242,0.92)] p-6 shadow-[0_18px_36px_rgba(70,43,29,0.08)] lg:min-h-[720px] lg:p-8"
              >
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#8b6a56]">
                  当前建议
                </p>
                <h2 className="mt-3 font-serif text-[2rem] leading-[1.05] text-[#2f2120] lg:text-[3.4rem]">
                  {document.title}
                </h2>
                <p className="mt-3 max-w-[760px] text-[0.98rem] leading-7 text-[#5d4a3f] lg:text-[1.1rem] lg:leading-8">
                  {document.summary}
                </p>

                {activeSelection ? (
                  <section className="mt-10 grid gap-7">
                    <div className="grid gap-2">
                      <p className="text-[0.78rem] font-medium uppercase tracking-[0.2em] text-[#8b6a56]">
                        {activeSelection.group.label}
                      </p>
                      <h3 className="font-serif text-[1.75rem] leading-[1.08] text-[#2f2120] lg:text-[2.4rem]">
                        {activeSelection.item.label}
                      </h3>
                      <p className="max-w-[760px] text-[1rem] leading-7 text-[#4d3d34] lg:text-[1.12rem] lg:leading-8">
                        {activeSelection.item.summary}
                      </p>
                    </div>

                    <section className="grid gap-4">
                      <p className="text-sm font-medium text-[#3f2f28] lg:text-[1.02rem]">
                        现在可以直接这样做：
                      </p>
                      {visibleSteps.length > 0 ? (
                        <ol className="grid gap-4">
                          {visibleSteps.map((step, index) => (
                            <li
                              key={`${activeSelection.item.id}-${index}`}
                              className="rounded-[1.15rem] border border-[#eadbc7] bg-[rgba(255,255,255,0.8)] px-5 py-4 text-sm leading-7 text-[#5d4a3f] lg:px-6 lg:py-5 lg:text-[1.02rem]"
                            >
                              <span className="mr-3 font-semibold text-[#2c241f]">
                                {index + 1}.
                              </span>
                              {step}
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="rounded-[1rem] border border-dashed border-[#d8c3ab] px-4 py-4 text-sm leading-6 text-[#7a6253]">
                          当前没有可执行步骤，请继续追问你想解决的具体问题。
                        </p>
                      )}
                    </section>

                    <p className="text-sm leading-7 text-[#7a6253] lg:text-[1rem]">
                      如需细节可继续追问：{promptHint}
                    </p>
                  </section>
                ) : (
                  <p className="mt-8 rounded-[1rem] border border-dashed border-[#d8c3ab] px-4 py-4 text-sm leading-6 text-[#7a6253]">
                    当前没有可显示的行动指南，请等待下一次同步。
                  </p>
                )}
              </article>
            </div>
          </div>
        </section>

        <article
          data-codex-report-panel="guide"
          className="mt-6 rounded-[1.6rem] border border-[#d8c3ab] bg-[rgba(255,249,242,0.92)] p-6 shadow-[0_18px_36px_rgba(70,43,29,0.08)] lg:hidden"
        >
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#8b6a56]">
            当前建议
          </p>
          <h2 className="mt-3 font-serif text-[2rem] leading-[1.05] text-[#2f2120]">
            {document.title}
          </h2>
          <p className="mt-3 max-w-[720px] text-[0.98rem] leading-7 text-[#5d4a3f]">
            {document.summary}
          </p>

          {activeSelection ? (
            <section className="mt-8 grid gap-6">
              <div className="grid gap-2">
                <p className="text-[0.72rem] font-medium uppercase tracking-[0.2em] text-[#8b6a56]">
                  {activeSelection.group.label}
                </p>
                <h3 className="font-serif text-[1.75rem] leading-[1.08] text-[#2f2120]">
                  {activeSelection.item.label}
                </h3>
                <p className="max-w-[700px] text-[1rem] leading-7 text-[#4d3d34]">
                  {activeSelection.item.summary}
                </p>
              </div>

              <section className="grid gap-3">
                <p className="text-sm font-medium text-[#3f2f28]">现在可以直接这样做：</p>
                {visibleSteps.length > 0 ? (
                  <ol className="grid gap-3">
                    {visibleSteps.map((step, index) => (
                      <li
                        key={`${activeSelection.item.id}-${index}`}
                        className="rounded-[1rem] border border-[#eadbc7] bg-white/72 px-4 py-3 text-sm leading-6 text-[#5d4a3f]"
                      >
                        <span className="mr-2 font-medium text-[#3f2f28]">{index + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="rounded-[1rem] border border-dashed border-[#d8c3ab] px-4 py-4 text-sm leading-6 text-[#7a6253]">
                    当前没有可执行步骤，请继续追问你想解决的具体问题。
                  </p>
                )}
              </section>

              <p className="text-sm leading-6 text-[#7a6253]">
                如需细节可继续追问：{promptHint}
              </p>
            </section>
          ) : (
            <p className="mt-8 rounded-[1rem] border border-dashed border-[#d8c3ab] px-4 py-4 text-sm leading-6 text-[#7a6253]">
              当前没有可显示的行动指南，请等待下一次同步。
            </p>
          )}
        </article>
      </main>
    </div>
  );
}
