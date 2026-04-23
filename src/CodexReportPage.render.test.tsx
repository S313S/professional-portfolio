import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import CodexReportPage from './CodexReportPage';

test('renders a standalone codex report page with summary-first layout and collapsible details', () => {
  const markup = renderToStaticMarkup(<CodexReportPage />);

  assert.match(markup, /Codex Report Panel/);
  assert.match(markup, /Automatically refreshes the latest Codex summary/);
  assert.match(markup, /目录/);
  assert.match(markup, /结论/);
  assert.match(markup, /等待最新汇报/);
  assert.match(markup, /data-codex-report-panel="toc"/);
  assert.match(markup, /data-codex-report-panel="summary"/);
  assert.match(markup, /data-codex-report-panel="meta"/);
  assert.match(markup, /data-codex-report-panel="details"/);
  assert.match(markup, /一句话概括/);
  assert.match(markup, /href="#codex-report-changes"/);
  assert.match(markup, /href="#codex-report-why"/);
  assert.match(markup, /href="#codex-report-technical"/);
  assert.match(markup, /href="#codex-report-verification"/);
  assert.match(markup, /<details/);
  assert.match(markup, /改了什么/);
  assert.match(markup, /为什么这么改/);
  assert.match(markup, /技术细节/);
  assert.match(markup, /验证结果/);
  assert.doesNotMatch(markup, /id="career-detail-section"/);
  assert.doesNotMatch(markup, /id="works-detail-section"/);
});
