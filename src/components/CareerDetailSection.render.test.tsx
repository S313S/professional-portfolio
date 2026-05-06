import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';

import CareerDetailSection from './CareerDetailSection';

test('renders the career detail stage with category-scoped bookmarks and default sharing logs', () => {
  const markup = renderToStaticMarkup(<CareerDetailSection />);

  assert.match(markup, /id="career-detail-section"/);
  assert.match(markup, /\/images\/careerDetail_bg\.png/);
  assert.match(markup, /\/images\/careerDetail_share_icon\.png/);
  assert.match(markup, /\/images\/careerDetail_career_icon\.png/);
  assert.match(markup, /\/images\/careerDetail_Industry knowledge_icon\.png/);
  assert.match(markup, /\/images\/careerDetail_scroll_icon\.png/);
  assert.match(markup, /\/images\/careerDetail_pageSwitch\.png/);
  assert.match(markup, /\/images\/careerDetail_litteleBg_01\.png/);
  assert.doesNotMatch(markup, /\/images\/careerDetail_litteleBg\.png/);
  assert.doesNotMatch(markup, /\/images\/careerDetail_map\.(png|svg)/);
  assert.match(markup, /data-career-detail-tab="sharingJourney"/);
  assert.match(markup, /data-career-detail-tab="workExperience"/);
  assert.match(markup, /data-career-detail-tab="industryKnowledge"/);
  assert.match(markup, /data-career-detail-select="record"/);
  assert.match(markup, /data-career-detail-drag-track="desktop"/);
  assert.match(
    markup,
    /data-career-detail-drag-track="desktop"[^>]*class="[^"]*left-\[calc\(32%\+17px\)\][^"]*"/,
  );
  assert.match(markup, /data-career-detail-drag-thumb="desktop"/);
  assert.match(markup, /data-career-detail-drag-thumb-icon="desktop"/);
  assert.match(markup, /data-career-detail-cta="page-switch"/);
  assert.match(markup, /data-career-detail-cta-visible="false"/);
  assert.match(markup, /data-career-detail-cta-hint="page-switch"/);
  assert.match(markup, /data-career-detail-cta-hint-visible="false"/);
  assert.match(markup, /aria-label="Open works lobby section"/);
  assert.match(markup, /Click to continue/);
  assert.match(markup, /data-career-detail-record-button="sharing-essay-first-post"/);
  assert.match(markup, /data-career-detail-record-button="sharing-essay-pattern-library"/);
  assert.match(markup, /data-career-detail-record-button="sharing-essay-editorial-rhythm"/);
  assert.doesNotMatch(markup, /data-career-detail-record-button="work-system-campaign-ops"/);
  assert.doesNotMatch(markup, /data-career-detail-record-button="industry-signal-ai-adoption"/);
  assert.doesNotMatch(markup, />CLASSIFIED</);
  assert.doesNotMatch(markup, /Topographic map/);
  assert.match(markup, /alt="Archipelago survey reference card"/);
  assert.doesNotMatch(markup, /data-career-detail-divider="chapter-ii"/);
  assert.doesNotMatch(markup, /data-career-detail-icon="shield"/);
  assert.doesNotMatch(markup, /data-career-detail-icon="anchor"/);
  assert.match(markup, /April 12th, 2021/);
  assert.match(markup, /Dispatch Log I: Sharing Journey/);
  assert.match(markup, /Publishing Before It Felt Polished/);
  assert.match(markup, /I started sharing small working notes before they felt complete/);
  assert.match(markup, /The First Audience Was Future Me/);
  assert.match(markup, /Marked after the first month of consistent public notes\./);
  assert.match(markup, /First Public Notes/);
  assert.match(markup, /Pattern Library/);
  assert.match(markup, /Editorial Rhythm/);
  assert.doesNotMatch(markup, /Campaign Ops Foundations/);
  assert.doesNotMatch(markup, /AI Adoption Signals/);
  assert.match(
    markup,
    /data-career-detail-drag-thumb-icon="desktop"[^>]*src="\/images\/careerDetail_scroll_icon\.png"/,
  );
  assert.doesNotMatch(
    markup,
    /class="absolute inset-y-0 left-1\/2 h-full -translate-x-1\/2 object-contain opacity-95"/,
  );
});

test('renders the desktop text content in separate upper and lower pinned regions', () => {
  const markup = renderToStaticMarkup(<CareerDetailSection />);

  assert.match(
    markup,
    /<div class="absolute left-\[35%\] top-\[-1\.5%\] w-\[44%\]">/,
  );
  assert.match(
    markup,
    /data-career-detail-card-stack="desktop-primary"[^>]*class="absolute left-\[37%\] top-\[22%\] w-\[29%\]"/,
  );
  assert.match(
    markup,
    /data-career-detail-card-stack="desktop-secondary"[^>]*class="absolute left-\[37%\] top-\[63%\] w-\[29%\]"/,
  );
  assert.doesNotMatch(markup, /data-career-detail-card-stack="desktop"[^>]*flex w-\[29%\] flex-col/);
});

test('locks the desktop archive aside to the measured notebook region and renders the full archival card image', () => {
  const markup = renderToStaticMarkup(<CareerDetailSection />);

  assert.match(markup, /data-career-detail-aside="desktop"/);
  assert.match(markup, /data-career-detail-aside="desktop"[^>]*class="[^"]*absolute[^"]*"/);
  assert.match(markup, /data-career-detail-aside="desktop"[^>]*class="[^"]*left-\[67\.48%\][^"]*"/);
  assert.match(markup, /data-career-detail-aside="desktop"[^>]*class="[^"]*top-\[15\.89%\][^"]*"/);
  assert.match(markup, /data-career-detail-aside="desktop"[^>]*class="[^"]*h-\[82\.62%\][^"]*"/);
  assert.match(markup, /data-career-detail-aside="desktop"[^>]*class="[^"]*w-\[26\.47%\][^"]*"/);
  assert.match(
    markup,
    /data-career-detail-aside="desktop"[\s\S]*src="\/images\/careerDetail_litteleBg_01\.png"/,
  );
  assert.match(
    markup,
    /data-career-detail-aside="desktop"[\s\S]*class="block h-auto w-full"/,
  );
  assert.match(
    markup,
    /data-career-detail-aside="desktop"[\s\S]*style="transform:translate\(-13px, -2px\)"/,
  );
  assert.doesNotMatch(markup, /data-career-detail-aside="desktop"[^>]*right-\[7\.5%\] top-\[19\.5%\] w-\[25%\]/);
  assert.doesNotMatch(markup, /data-career-detail-block="classified"/);
  assert.doesNotMatch(markup, /Magnetic variance noted/);
  assert.doesNotMatch(markup, /X: 14\.22 \/ 9-98\.11/);
  assert.doesNotMatch(markup, /data-career-detail-aside="desktop"[^>]*rounded-\[0\.55rem\]/);
  assert.doesNotMatch(markup, /data-career-detail-aside="desktop"[^>]*bg-\[#f7f2ea\]/);
  assert.doesNotMatch(markup, /data-career-detail-aside="desktop"[\s\S]*object-cover/);
  assert.doesNotMatch(markup, /data-career-detail-aside="desktop"[\s\S]*object-position:/);
});

test('maps each category to its dedicated desktop archival card image', () => {
  const componentSource = readFileSync(new URL('./CareerDetailSection.tsx', import.meta.url), 'utf8');

  assert.match(componentSource, /asideImageSrc:\s*'\/images\/careerDetail_litteleBg_01\.png'/);
  assert.match(componentSource, /asideImageSrc:\s*'\/images\/careerDetail_litteleBg_02\.png'/);
  assert.match(componentSource, /asideImageSrc:\s*'\/images\/careerDetail_litteleBg_03\.png'/);
});

test('keeps the default sharing bookmark rail on its original distributed spacing', () => {
  const markup = renderToStaticMarkup(<CareerDetailSection />);

  assert.match(markup, /data-career-detail-record-rail="desktop"/);
  assert.match(markup, /data-career-detail-record-rail-layout="distributed"/);
  assert.match(
    markup,
    /data-career-detail-record-rail="desktop"[^>]*class="[^"]*justify-between[^"]*"/,
  );
  assert.doesNotMatch(
    markup,
    /data-career-detail-record-rail="desktop"[^>]*class="[^"]*gap-\[1\.2rem\][^"]*"/,
  );
});

test('renders the desktop and mobile text typography with non-clipping line heights from the latest QA spec', () => {
  const markup = renderToStaticMarkup(<CareerDetailSection />);

  assert.match(
    markup,
    /data-career-detail-block="date-title"[^>]*class="mt-3 font-serif text-\[clamp\(3\.6rem,4\.2vw,4\.8rem\)\] leading-none tracking-\[-0\.06em\] text-\[#241b14\]"/,
  );
  assert.match(
    markup,
    /<h3 class="mt-3 max-w-\[24ch\] font-serif text-\[2\.2rem\] leading-none tracking-\[-0\.04em\] text-\[#2d241c\]">/,
  );
  assert.match(
    markup,
    /<h3 class="mt-3 max-w-\[24ch\] font-serif text-\[clamp\(1\.8rem,2vw,2\.2rem\)\] leading-none tracking-\[-0\.04em\] text-\[#251c15\]">/,
  );
  assert.match(
    markup,
    /data-career-detail-block="body"[^>]*class="mt-4 text-\[0\.92rem\] leading-\[1\.5\] text-\[#322720\]"/,
  );
  assert.match(
    markup,
    /data-career-detail-card-stack="desktop-secondary"[\s\S]*<h4 class="font-serif text-\[clamp\(1\.6rem,1\.8vw,2rem\)\] leading-none tracking-\[-0\.04em\] text-\[#261d16\]">/,
  );
  assert.match(
    markup,
    /<p class="mt-3 text-\[0\.9rem\] leading-\[1\.5\] text-\[#342821\]">/,
  );
});

test('renders desktop tabs in the main stage coordinate system so they overlap the background markers', () => {
  const markup = renderToStaticMarkup(<CareerDetailSection />);

  assert.match(markup, /data-career-detail-tab-overlay="desktop"/);
  assert.match(markup, /data-career-detail-tab-positioning="background-pixel-lock"/);
  assert.match(markup, /data-career-detail-connector-layer="desktop"/);
  assert.match(markup, /data-career-detail-connector-svg="desktop"/);
  assert.match(markup, /data-career-detail-connector-arrowhead="desktop"/);
  assert.match(
    markup,
    /data-career-detail-connector="sharingJourney"[^>]*data-career-detail-connector-active="true"/,
  );
  assert.match(
    markup,
    /data-career-detail-connector="sharingJourney"[\s\S]*stroke-dasharray:[^;"']+/,
  );
  assert.match(
    markup,
    /data-career-detail-connector="sharingJourney"[\s\S]*marker-end:url\(#career-detail-connector-arrow\)/,
  );
  assert.match(
    markup,
    /data-career-detail-connector="workExperience"[^>]*data-career-detail-connector-active="false"/,
  );
  assert.match(
    markup,
    /data-career-detail-connector="industryKnowledge"[^>]*data-career-detail-connector-active="false"/,
  );
  assert.match(
    markup,
    /data-career-detail-tab="sharingJourney"[^>]*style="left:[^"]*px;top:[^"]*px;width:[^"]*px;height:[^"]*px"/,
  );
  assert.match(
    markup,
    /data-career-detail-tab="sharingJourney"[^>]*aria-pressed="true"/,
  );
  assert.match(
    markup,
    /data-career-detail-tab="workExperience"[^>]*style="left:[^"]*px;top:[^"]*px;width:[^"]*px;height:[^"]*px"/,
  );
  assert.match(
    markup,
    /data-career-detail-tab="workExperience"[^>]*aria-pressed="false"/,
  );
  assert.match(
    markup,
    /data-career-detail-tab="industryKnowledge"[^>]*style="left:[^"]*px;top:[^"]*px;width:[^"]*px;height:[^"]*px"/,
  );
  assert.match(
    markup,
    /data-career-detail-tab="industryKnowledge"[^>]*aria-pressed="false"/,
  );
});

test('keeps bookmark labels aligned to the shared 2-3 word theme-label rhythm across every category', () => {
  const componentSource = readFileSync(new URL('./CareerDetailSection.tsx', import.meta.url), 'utf8');
  const bookmarkLabels = Array.from(
    componentSource.matchAll(/bookmarkLabel:\s*'([^']+)'/g),
    (match) => match[1],
  );

  assert.deepEqual(bookmarkLabels, [
    'First Public Notes',
    'Pattern Library',
    'Editorial Rhythm',
    'Campaign Ops',
    'Process Design',
    'AI Delivery',
    'Adoption Signals',
    'Creator Commerce',
  ]);

  for (const label of bookmarkLabels) {
    assert.equal(label.trim().length > 0, true);
    assert.equal(label.trim().split(/\s+/).length <= 3, true);
  }

  assert.doesNotMatch(componentSource, /Campaign Ops Foundations/);
  assert.doesNotMatch(componentSource, /AI Delivery Systems/);
  assert.doesNotMatch(componentSource, /AI Adoption Signals/);
});

test('uses the fixed-gap bookmark rail only for non-sharing categories', () => {
  const componentSource = readFileSync(new URL('./CareerDetailSection.tsx', import.meta.url), 'utf8');

  assert.match(componentSource, /const isSharingCategory = selectedCategory\.key === 'sharingJourney';/);
  assert.match(componentSource, /data-career-detail-record-rail-layout=\{isSharingCategory \? 'distributed' : 'fixed-gap'\}/);
  assert.match(componentSource, /justify-between/);
  assert.match(componentSource, /justify-start gap-\[1\.2rem\] pt-\[0\.6rem\]/);
});

test('uses a single page-switch position and size config across desktop widths', () => {
  const componentSource = readFileSync(new URL('./CareerDetailSection.tsx', import.meta.url), 'utf8');

  assert.match(componentSource, /const CAREER_DETAIL_PAGE_SWITCH_LAYOUT = \{/);
  assert.match(componentSource, /position:\s*'lg:bottom-\[[^\]]+\] lg:right-\[[^\]]+\]'/);
  assert.match(componentSource, /size:\s*'lg:h-\[[^\]]+\] lg:w-\[[^\]]+\]'/);
  assert.doesNotMatch(componentSource, /wrapper:\s*\{/);
  assert.doesNotMatch(componentSource, /desktop:\s*'lg:/);
  assert.doesNotMatch(componentSource, /xl:\s*'xl:/);
});

test('renders the delayed CTA hint layer with dedicated hover-state hooks', () => {
  const componentSource = readFileSync(new URL('./CareerDetailSection.tsx', import.meta.url), 'utf8');

  assert.match(componentSource, /const CAREER_DETAIL_PAGE_SWITCH_REVEAL_DELAY_MS = 3000;/);
  assert.match(componentSource, /const CAREER_DETAIL_PAGE_SWITCH_HINT_COPY = 'Click to continue';/);
  assert.match(componentSource, /const CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT = \{/);
  assert.match(componentSource, /wrapper:\s*'[^']+'/);
  assert.match(componentSource, /textOffset:\s*'[^']*'/);
  assert.match(componentSource, /textBox:\s*'[^']+'/);
  assert.match(componentSource, /arrowOffset:\s*'[^']*'/);
  assert.match(componentSource, /arrowSize:\s*'[^']+'/);
  assert.match(componentSource, /arrowPath:\s*'[^']+'/);
  assert.match(componentSource, /data-career-detail-cta-visible=\{shouldShowPageSwitchCta \? 'true' : 'false'\}/);
  assert.match(componentSource, /data-career-detail-cta-hint="page-switch"/);
  assert.match(
    componentSource,
    /data-career-detail-cta-hint-visible=\{shouldShowPageSwitchHint \? 'true' : 'false'\}/,
  );
  assert.match(componentSource, /setIsPageSwitchHintHovered\(true\)/);
  assert.match(componentSource, /setIsPageSwitchHintHovered\(false\)/);
  assert.match(componentSource, /data-career-detail-cta-hint-arrow="page-switch"/);
  assert.match(componentSource, /data-career-detail-cta-hint-arrowhead="page-switch"/);
  assert.match(componentSource, /CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT\.textOffset/);
  assert.match(componentSource, /CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT\.arrowOffset/);
  assert.match(componentSource, /CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT\.arrowSize/);
  assert.match(componentSource, /CAREER_DETAIL_PAGE_SWITCH_HINT_LAYOUT\.arrowPath/);
  assert.match(componentSource, /markerEnd="url\(#career-detail-cta-hint-arrowhead\)"/);
});
