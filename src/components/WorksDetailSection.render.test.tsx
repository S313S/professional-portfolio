import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';

import WorksDetailSection from './WorksDetailSection';

test('renders the works detail transition stage with loading iframe and hidden background scene', () => {
  const markup = renderToStaticMarkup(<WorksDetailSection />);

  assert.match(markup, /id="works-detail-section"/);
  assert.match(markup, /data-works-detail-stage="transition"/);
  assert.match(markup, /data-works-detail-phase="idle"/);
  assert.match(markup, /\/detailWork-loading\.html\?embed=portfolio/);
  assert.match(markup, /\/images\/workDetail_bg\.jpeg/);
  assert.match(markup, />ON</);
  assert.match(markup, />OFF</);
  assert.match(markup, />CODING</);
  assert.match(markup, />DESIGN</);
  assert.doesNotMatch(markup, />TRACK</);
  assert.match(markup, /Workflows, systems and prototypes built to make ideas actually run\./);
  assert.match(markup, /Campaigns, shoots and other such promotional materials for fans/);
  assert.match(markup, /\/images\/workDetail_left_icon\.png\.png/);
  assert.match(markup, /\/images\/workDetail_rigtht_icon\.png/);
  assert.match(markup, /aria-label="Open On Track collection"/);
  assert.match(markup, /aria-label="Open Off Track collection"/);
  assert.doesNotMatch(markup, /Signal in Motion/);
  assert.doesNotMatch(markup, /Open the case/);
  assert.doesNotMatch(markup, /data-works-detail-nav="rail"/);
  assert.doesNotMatch(markup, /linear-gradient\(rgba\(0, 0, 0, 0\.18\), rgba\(0, 0, 0, 0\.28\)\)/);
  assert.doesNotMatch(markup, /radial-gradient\(circle_at_center/);
});

test('renders the in-page detail view with a close button when the left entry has been opened', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="settled" initialView="detail" initialTransitionProgress={1} />,
  );

  assert.match(markup, /data-works-detail-view="detail"/);
  assert.match(markup, /aria-label="Close work detail"/);
  assert.match(markup, /works-detail-stage/);
  assert.doesNotMatch(markup, /works-detail-stage__close-dock/);
  assert.match(markup, /works-detail-stage__footer-center/);
  assert.match(markup, /data-project-state="muted">/);
  assert.match(markup, /data-project-state="active">/);
  assert.match(markup, /data-visibility="preview"/);
  assert.match(markup, /data-visibility="active"/);
  assert.match(markup, />04</);
  assert.match(markup, />05</);
  assert.match(markup, />06</);
  assert.match(markup, />07</);
  assert.match(markup, />08</);
  assert.match(markup, /data-active="true"/);
  assert.match(markup, />KINDY</);
  assert.match(markup, />SANOFI</);
  assert.match(markup, />WHAT&#x27;S HOT</);
  assert.match(markup, />blacknegative</);
  assert.match(
    markup,
    /data-works-detail-layer="content" class="absolute inset-0 flex items-center justify-center"/,
  );
  assert.doesNotMatch(
    markup,
    /data-works-detail-layer="content" class="absolute inset-0 flex items-center justify-center px-4 sm:px-8"/,
  );
  assert.doesNotMatch(markup, /data-works-detail-nav="rail"/);
});

test('keeps the left entry button clickable once the reveal is visually complete', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="revealing" initialTransitionProgress={0.8} />,
  );

  assert.match(markup, /pointer-events:auto/);
  assert.match(markup, /aria-label="Open On Track collection" tabindex="0"/);
});

test('transparent loading fallback does not keep intercepting clicks after the transition settles', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="settled" initialTransitionProgress={1} />,
  );

  assert.match(markup, /data-works-detail-layer="loading"/);
  assert.match(markup, /opacity:0;pointer-events:none/);
});

test('keeps the current text blocks edge-aligned with equalized description heights', () => {
  const markup = renderToStaticMarkup(<WorksDetailSection />);
  const minHeightMatches = markup.match(/min-h-\[3\.8rem\]/g) ?? [];

  assert.match(
    markup,
    /class="flex flex-col items-end translate-y-\[6px\]"/,
  );
  assert.match(
    markup,
    /class="flex flex-col items-start translate-y-\[6px\]"/,
  );
  assert.match(
    markup,
    /Workflows, systems and prototypes built to make ideas actually run\.<\/p>/,
  );
  assert.match(
    markup,
    /Campaigns, shoots and other such promotional materials for fans<\/p>/,
  );
  assert.equal(minHeightMatches.length, 2);
});

test('exposes dedicated tuning hooks for each icon button size and vertical position', () => {
  const markup = renderToStaticMarkup(<WorksDetailSection />);
  const componentSource = readFileSync(new URL('./WorksDetailSection.tsx', import.meta.url), 'utf8');

  assert.match(markup, /data-works-detail-icon-button="left"/);
  assert.match(markup, /data-works-detail-icon-button="right"/);
  assert.match(componentSource, /WORKS_DETAIL_BUTTON_LAYOUT/);
  assert.match(componentSource, /iconSizeClassName/);
  assert.match(componentSource, /buttonSpacingClassName/);
  assert.match(componentSource, /buttonOffsetClassName/);
});
