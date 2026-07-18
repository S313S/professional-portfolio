import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import CodexReportPage from './CodexReportPage';
import {createDefaultCodexGuideDocument} from './codexReport';

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

test('renders a selectable visual debug evidence record with its verified facts', () => {
  const initialDocument = {
    ...createDefaultCodexGuideDocument(),
    title: 'Build Week Visual Debugging',
    summary: 'A human-in-the-loop evidence trail.',
    evidence: [
      {
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
          outcome: 'passed' as const,
          completedAt: '2026-07-18T05:10:00.000Z',
        },
      },
    ],
  };
  const evidenceProps = {
    initialDocument,
    initialEvidenceId: 'friend-book-hotspots',
  } as never;
  const markup = renderToStaticMarkup(<CodexReportPage {...evidenceProps} />);

  assert.match(markup, /data-codex-report-nav-group="visual-debug-evidence"/);
  assert.match(markup, /data-codex-report-nav-item="friend-book-hotspots"/);
  assert.match(markup, /data-codex-evidence-stage="verified"/);
  assert.match(markup, /Visual Debug Evidence/);
  assert.match(markup, /Friend Book hotspot calibration/);
  assert.match(markup, /href="\/debug\/friend-book-diff-hotspots"/);
  assert.match(markup, /hotspot-1\.x/);
  assert.match(markup, /42\.5%/);
  assert.match(markup, /User-confirmed current Codex task used GPT-5\.6\./);
  assert.match(markup, /src\/FriendBookDiffHotspotsDebugPage\.tsx/);
  assert.match(markup, /node --import tsx --test/);
  assert.match(markup, /Copy evidence Markdown/);
});
