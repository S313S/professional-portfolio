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
  assert.match(markup, /\/images\/works-detail-07-square\.png/);
  assert.doesNotMatch(markup, /\/images\/WorksCollectionRoom_Bg\.jpg/);
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

test('matches the approved works gallery footer spacing, socials format, and film corridor structure', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="settled" initialView="detail" initialTransitionProgress={1} />,
  );
  const componentSource = readFileSync(new URL('./WorksDetailSection.tsx', import.meta.url), 'utf8');

  assert.match(
    markup,
    /class="works-detail-stage relative flex h-full w-full flex-col overflow-hidden px-5 pt-6 pb-10 text-\[#f8ebdb\] sm:px-8 sm:pt-8 sm:pb-12"/,
  );
  assert.match(markup, /works-detail-track__corridor works-detail-track__corridor--band/);
  assert.match(markup, /works-detail-track__corridor works-detail-track__corridor--top/);
  assert.match(markup, /works-detail-track__corridor works-detail-track__corridor--bottom/);
  assert.match(markup, />f \| t \| ▶</);
  assert.match(componentSource, /const WORKS_DETAIL_STAGE_SOCIALS = \['f', 't', '▶'\] as const;/);
});

test('keeps the works gallery dashed SVG grid and socials styling aligned with the approved css treatment', () => {
  const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

  assert.match(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*background-image:\s*url\("data:image\/svg\+xml,/);
  assert.match(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*stroke-dasharray='8,6'/);
  assert.match(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*background-size:\s*260px 260px;/);
  assert.match(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*background-position:\s*[^;]+;/);
  assert.match(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*opacity:\s*0\.6;/);
  assert.doesNotMatch(cssSource, /\.works-detail-stage__grid\s*\{[\s\S]*repeating-linear-gradient\(/);
  assert.match(
    cssSource,
    /\.works-detail-track__corridor--top,\s*\.works-detail-track__corridor--bottom\s*\{[\s\S]*border-top:\s*1\.5px dashed rgba\(200, 210, 220, 0\.25\);/,
  );
  assert.match(cssSource, /\.works-detail-stage__socials\s*\{[\s\S]*text-transform:\s*none;/);
});

test('locks the gallery cards, corridor, and background grid to the same 45 degree diagonal system', () => {
  const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

  assert.match(
    cssSource,
    /\.works-detail-stage__grid\s*\{[\s\S]*x1='0' y1='260' x2='260' y2='0'[\s\S]*x1='0' y1='0' x2='260' y2='260'/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__corridor--band\s*\{[\s\S]*rotate\(-45deg\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__corridor--top,\s*\.works-detail-track__corridor--bottom\s*\{[\s\S]*rotate\(-45deg\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__item\[data-slot="0"\]\s*\{[\s\S]*translate3d\(-26\.2rem,\s*21\.5rem,\s*0\)\s*rotate\(45deg\)\s*scale\(0\.9\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__item\[data-slot="1"\]\s*\{[\s\S]*translate3d\(-15\.2rem,\s*10\.5rem,\s*0\)\s*rotate\(45deg\)\s*scale\(0\.94\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__item\[data-slot="2"\]\s*\{[\s\S]*translate3d\(-4\.2rem,\s*0\.5rem,\s*0\)\s*rotate\(45deg\)\s*scale\(0\.98\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__item\[data-slot="3"\]\s*\{[\s\S]*translate3d\(6\.8rem,\s*-10\.5rem,\s*0\)\s*rotate\(45deg\)\s*scale\(1\.04\)/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__item\[data-slot="4"\]\s*\{[\s\S]*translate3d\(17\.8rem,\s*-21\.5rem,\s*0\)\s*rotate\(45deg\)\s*scale\(0\.94\)/,
  );
});
