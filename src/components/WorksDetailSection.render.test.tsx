import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';

import { personalData } from '../data';
import WorksDetailSection from './WorksDetailSection';

test('renders the works detail transition stage with loading iframe and hidden background scene', () => {
  const markup = renderToStaticMarkup(<WorksDetailSection />);

  assert.match(markup, /id="works-detail-section"/);
  assert.match(markup, /data-works-detail-stage="transition"/);
  assert.match(markup, /data-works-detail-phase="idle"/);
  assert.match(markup, /\/detailWork-loading\.html\?embed=portfolio/);
  assert.match(markup, /\/images\/workDetail_bg\.jpeg/);
  assert.match(markup, />ON</);
  assert.match(markup, />ON</);
  assert.match(markup, />CODING</);
  assert.match(markup, />DESIGN</);
  assert.doesNotMatch(markup, />TRACK</);
  assert.match(markup, /Fusing concepts in mind with art and bringing them into life/);
  assert.match(markup, /Workflows and prototypes built to make ideas actually run/);
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
  assert.match(markup, /data-works-detail-scene="gallery"/);
  assert.match(markup, /aria-label="Close work detail"/);
  assert.match(markup, /works-detail-stage/);
  assert.doesNotMatch(markup, /works-detail-stage__close-dock/);
  assert.match(markup, /works-detail-stage__footer-center/);
  assert.match(markup, /data-project-state="muted">/);
  assert.match(markup, /data-project-state="active">/);
  assert.match(markup, /data-visibility="preview"/);
  assert.match(markup, /data-visibility="active"/);
  assert.match(markup, /data-detail-scene-panel="gallery"/);
  assert.match(markup, /data-scene-active="true"/);
  assert.match(markup, />04</);
  assert.match(markup, />05</);
  assert.match(markup, />06</);
  assert.match(markup, />07</);
  assert.match(markup, />08</);
  assert.match(markup, /data-active="true"/);
  assert.match(markup, new RegExp(personalData.featuredWorks[1]!.title));
  assert.match(markup, new RegExp(personalData.featuredWorks[2]!.title));
  assert.match(markup, new RegExp(personalData.featuredWorks[3]!.title));
  assert.match(
    markup,
    new RegExp(
      personalData.featuredWorks[2]!.subtitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    ),
  );
  assert.doesNotMatch(markup, />SANOFI</);
  assert.match(markup, />VisualMemory</);
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

test('detail markup includes a fullscreen project scene with the active work image, title, and description', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection initialPhase="settled" initialView="detail" initialTransitionProgress={1} />,
  );

  assert.match(markup, /data-detail-scene-panel="project"/);
  assert.match(markup, /works-detail-project__panel/);
  assert.match(markup, /works-detail-project__backdrop/);
  assert.match(markup, /works-detail-project__media/);
  assert.match(markup, /works-detail-project__image/);
  assert.match(markup, /works-detail-project__meta/);
  assert.match(
    markup,
    new RegExp(personalData.featuredWorks[3]!.eyebrow.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  assert.match(
    markup,
    new RegExp(personalData.featuredWorks[3]!.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
  );
  assert.match(
    markup,
    new RegExp(
      personalData.featuredWorks[3]!.description.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
    ),
  );
  assert.doesNotMatch(markup, />Get In Touch</);
  assert.doesNotMatch(markup, />Say Hello</);
  assert.doesNotMatch(markup, />MENU</);
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
    /Workflows and prototypes built to make ideas actually run<\/p>/,
  );
  assert.match(markup, /Fusing concepts in mind with art and bringing them into life<\/p>/);
  assert.equal(minHeightMatches.length, 2);
});

test('renders the coding detail mode with a new background, draggable category cards, and a six-card project grid', () => {
  const markup = renderToStaticMarkup(
    <WorksDetailSection
      initialPhase="settled"
      initialView="detail"
      initialTransitionProgress={1}
      initialDetailMode="coding"
    />,
  );

  assert.match(markup, /data-works-detail-detail-mode="coding"/);
  assert.match(markup, /data-detail-scene-panel="coding"/);
  assert.match(markup, /data-scene-active="true"/);
  assert.match(markup, /\/images\/careerDetail_bg\.png/);
  assert.doesNotMatch(markup, /\/images\/workDetail_bg\.jpeg/);
  assert.match(markup, /workflow/i);
  assert.match(markup, /vibecoding/i);
  assert.match(markup, /AI product/i);
  assert.match(markup, /data-coding-card-drag-hint="true"/);
  assert.match(markup, /data-coding-category-card="workflow"/);
  assert.match(markup, /data-coding-category-card="vibecoding"/);
  assert.match(markup, /data-coding-category-card="ai-product"/);
  assert.match(markup, /data-coding-project-grid="workflow"/);
  assert.match(markup, /data-coding-project-card=/);
  assert.match(markup, /target="_blank"/);
  const codingCards = markup.match(/data-coding-project-card=/g) ?? [];
  assert.equal(codingCards.length, 6);
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
  assert.match(markup, /class="works-detail-track__corridor-layer"/);
  assert.match(markup, />f \| t \| ▶</);
  assert.match(componentSource, /const WORKS_DETAIL_STAGE_SOCIALS = \['f', 't', '▶'\] as const;/);
  assert.match(componentSource, /from 'gsap'/);
  assert.match(componentSource, /const WORKS_DETAIL_GALLERY_LAYOUT = \{/);
  assert.match(componentSource, /'--works-detail-projects-offset-x'/);
  assert.match(componentSource, /'--works-detail-projects-offset-y'/);
  assert.match(componentSource, /'--works-detail-corridor-center-y'/);
  assert.match(componentSource, /'--works-detail-corridor-rail-offset'/);
  assert.match(componentSource, /'--works-detail-slot-x'/);
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
  assert.match(
    cssSource,
    /\.works-detail-project__panel\s*\{[\s\S]*inset:\s*-2rem -2rem -3rem;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-project__media\s*\{[\s\S]*inset:\s*0;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-project__image\s*\{[\s\S]*object-fit:\s*cover;/,
  );
  assert.match(
    cssSource,
    /\.works-detail-project__meta\s*\{[\s\S]*inset:\s*auto 0 0 0;[\s\S]*background:/,
  );
});

test('locks the gallery cards, corridor, and background grid to the same 45 degree diagonal system', () => {
  const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');
  const componentSource = readFileSync(new URL('./WorksDetailSection.tsx', import.meta.url), 'utf8');

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
    /\.works-detail-track__corridor\s*\{[\s\S]*top:\s*var\(--works-detail-corridor-center-y, 50%\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__corridor--top\s*\{[\s\S]*top:\s*calc\(var\(--works-detail-corridor-center-y, 50%\) - var\(--works-detail-corridor-rail-offset\)\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__corridor--bottom\s*\{[\s\S]*top:\s*calc\(var\(--works-detail-corridor-center-y, 50%\) \+ var\(--works-detail-corridor-rail-offset\)\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-stage__projects\s*\{[\s\S]*transform:\s*translate3d\(var\(--works-detail-projects-offset-x,\s*[^)]+\),\s*var\(--works-detail-projects-offset-y,\s*[^)]+\),\s*0\);/,
  );
  assert.match(
    cssSource,
    /\.works-detail-track__item\s*\{[\s\S]*translate3d\(var\(--works-detail-slot-x\), var\(--works-detail-slot-y\), 0\)\s*rotate\(45deg\)\s*scale\(var\(--works-detail-slot-scale\)\)/,
  );
  assert.match(
    componentSource,
    /slots:\s*\[\s*\{[\s\S]*x:\s*'-37\.5rem'[\s\S]*y:\s*'33\.7rem'[\s\S]*scale:\s*1\.04/,
  );
  assert.match(
    componentSource,
    /x:\s*'-26\.5rem'[\s\S]*y:\s*'22\.7rem'[\s\S]*scale:\s*1\.04/,
  );
  assert.match(
    componentSource,
    /x:\s*'-15\.5rem'[\s\S]*y:\s*'11\.7rem'[\s\S]*scale:\s*1\.04/,
  );
  assert.match(
    componentSource,
    /x:\s*'-4\.5rem'[\s\S]*y:\s*'0\.7rem'[\s\S]*scale:\s*1\.04/,
  );
  assert.match(
    componentSource,
    /x:\s*'6\.5rem'[\s\S]*y:\s*'-10\.3rem'[\s\S]*scale:\s*1\.04/,
  );
  assert.doesNotMatch(
    componentSource,
    /const diagonalOffset = \(activeProjectIndex - WORKS_DETAIL_DEFAULT_ACTIVE_INDEX\) \* 18;/,
  );
  assert.doesNotMatch(
    componentSource,
    /gsap\.to\(trackRef\.current,\s*\{[\s\S]*x:\s*-diagonalOffset,[\s\S]*y:\s*diagonalOffset,[\s\S]*\}\);/,
  );
});
