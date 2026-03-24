import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import CareerDetailSection from './CareerDetailSection';

test('renders the career detail stage with desktop archive panel, custom selector, and default sharing content', () => {
  const markup = renderToStaticMarkup(<CareerDetailSection />);

  assert.match(markup, /id="career-detail-section"/);
  assert.match(markup, /\/images\/careerDetail_bg\.png/);
  assert.match(markup, /\/images\/careerDetail_share_icon\.png/);
  assert.match(markup, /\/images\/careerDetail_career_icon\.png/);
  assert.match(markup, /\/images\/careerDetail_Industry knowledge_icon\.png/);
  assert.match(markup, /\/images\/careerDetail_scroll_icon\.png/);
  assert.match(markup, /\/images\/careerDetail_map\.png/);
  assert.match(markup, /data-career-detail-tab="sharingJourney"/);
  assert.match(markup, /data-career-detail-tab="workExperience"/);
  assert.match(markup, /data-career-detail-tab="industryKnowledge"/);
  assert.match(markup, /data-career-detail-select="record"/);
  assert.match(markup, /data-career-detail-drag-track="desktop"/);
  assert.match(markup, /data-career-detail-drag-thumb="desktop"/);
  assert.match(markup, /data-career-detail-record-button="aurora-basin-expedition"/);
  assert.match(markup, /data-career-detail-record-button="signal-house-residency"/);
  assert.match(markup, /data-career-detail-record-button="northwind-relay-office"/);
  assert.match(markup, /data-career-detail-record-button="glass-harbor-ledger"/);
  assert.match(markup, /CLASSIFIED/);
  assert.doesNotMatch(markup, /REF: E8\.22 \/ SECTOR 4/);
  assert.doesNotMatch(markup, /ELEV: 1,344M/);
  assert.match(markup, /X: 14\.22 \/ 9-98\.11/);
  assert.match(markup, /Magnetic variance noted/);
  assert.match(markup, /data-career-detail-divider="chapter-ii"/);
  assert.match(markup, /data-career-detail-icon="shield"/);
  assert.match(markup, /data-career-detail-icon="anchor"/);
  assert.match(markup, /October 14th, 1894/);
  assert.match(markup, /Chronicle I:/);
  assert.match(markup, /Chief Surveyor &amp; Field Archivist/);
  assert.match(markup, /Appointed by the Royal Geographical Society/);
  assert.match(markup, /Instrument Calibration Specialist/);
  assert.match(markup, /HMS Discovery/);
  assert.match(markup, /Aurora Basin Expedition/);
  assert.match(markup, /Signal House Residency/);
  assert.match(markup, /Northwind Relay Office/);
  assert.match(markup, /Glass Harbor Ledger/);
});

test('renders the desktop text cards in a single flow stack instead of separate absolute blocks', () => {
  const markup = renderToStaticMarkup(<CareerDetailSection />);

  assert.match(markup, /data-career-detail-card-stack="desktop"/);
  assert.match(markup, /data-career-detail-divider="chapter-ii"/);
  assert.doesNotMatch(
    markup,
    /rounded-\[0\.4rem\] border border-\[#8f775f\]\/30 bg-\[rgba\(249,244,236,0\.85\)\] p-5 shadow-\[0_18px_40px_rgba\(70,51,35,0\.08\)\]/,
  );
  assert.doesNotMatch(
    markup,
    /rounded-\[0\.4rem\] border border-\[#8f775f\]\/30 bg-\[rgba\(250,246,240,0\.88\)\] p-5 shadow-\[0_18px_40px_rgba\(70,51,35,0\.08\)\]/,
  );
  assert.doesNotMatch(markup, /top-\[59\.8%\]/);
  assert.doesNotMatch(markup, /top-\[63\.5%\]/);
});

test('renders desktop tabs in the main stage coordinate system so they overlap the background markers', () => {
  const markup = renderToStaticMarkup(<CareerDetailSection />);

  assert.match(markup, /data-career-detail-tab-overlay="desktop"/);
  assert.match(markup, /data-career-detail-tab-positioning="background-pixel-lock"/);
  assert.match(
    markup,
    /data-career-detail-tab="sharingJourney"[^>]*style="left:[^"]*px;top:[^"]*px;width:[^"]*px;height:[^"]*px"/,
  );
  assert.match(
    markup,
    /data-career-detail-tab="workExperience"[^>]*style="left:[^"]*px;top:[^"]*px;width:[^"]*px;height:[^"]*px"/,
  );
  assert.match(
    markup,
    /data-career-detail-tab="industryKnowledge"[^>]*style="left:[^"]*px;top:[^"]*px;width:[^"]*px;height:[^"]*px"/,
  );
});
