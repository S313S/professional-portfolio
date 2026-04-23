import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import CodexReportPage from './CodexReportPage';

test('renders a standalone codex report page with document-style navigation and action-guide content', () => {
  const markup = renderToStaticMarkup(<CodexReportPage />);

  assert.match(markup, /Codex Report Panel/);
  assert.match(markup, /Automatically refreshes the latest Codex guide/);
  assert.match(markup, /目录/);
  assert.match(markup, /等待最新指南/);
  assert.match(markup, /开始这里/);
  assert.match(markup, /等待新的行动指南/);
  assert.match(markup, /data-codex-report-panel="toc"/);
  assert.match(markup, /data-codex-report-panel="guide"/);
  assert.match(markup, /data-codex-report-nav-shell="expanded"/);
  assert.match(markup, /data-codex-report-nav-toggle=/);
  assert.match(markup, /data-codex-report-nav-group="start-here"/);
  assert.match(markup, /data-codex-report-nav-item="waiting-guide"/);
  assert.match(markup, /data-codex-report-nav-level="group"/);
  assert.match(markup, /data-codex-report-nav-level="item"/);
  assert.match(markup, /当前建议/);
  assert.match(markup, /保持这个页面打开，等待 Codex 写入新内容。/);
  assert.match(markup, /点左侧条目查看不同主题的行动建议。/);
  assert.match(markup, /如需细节可继续追问/);
  assert.doesNotMatch(markup, /data-codex-report-panel="meta"/);
  assert.doesNotMatch(markup, /data-codex-report-panel="details"/);
  assert.doesNotMatch(markup, /id="career-detail-section"/);
  assert.doesNotMatch(markup, /id="works-detail-section"/);
});

test('renders a collapsed directory shell with a slim toc tab when requested', () => {
  const markup = renderToStaticMarkup(<CodexReportPage initialNavCollapsed />);

  assert.match(markup, /data-codex-report-nav-shell="collapsed"/);
  assert.match(markup, /data-codex-report-nav-toggle=/);
  assert.match(markup, /目录/);
});
