const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const tolerance = 0.003;

async function openCareerDetail(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#career-detail-section');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';

    const section = document.getElementById('career-detail-section');
    if (!section) {
      throw new Error('CareerDetailSection not found');
    }

    window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY);
  });
  await page.waitForTimeout(300);
}

async function readSelectorGeometry(page) {
  return page.evaluate(() => {
    const section = document.getElementById('career-detail-section');
    const selector = document.querySelector('[data-career-detail-selector="desktop"]');
    const track = document.querySelector('[data-career-detail-drag-track="desktop"]');
    const thumb = document.querySelector('[data-career-detail-drag-thumb="desktop"]');
    const rail = document.querySelector('[data-career-detail-record-rail="desktop"]');

    if (!section || !selector || !track || !thumb || !rail) {
      throw new Error('Career detail selector geometry targets not found');
    }

    const sectionRect = section.getBoundingClientRect();
    const selectorRect = selector.getBoundingClientRect();
    const trackRect = track.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();
    const railRect = rail.getBoundingClientRect();
    const toUnitRect = (rect) => ({
      left: (rect.left - sectionRect.left) / sectionRect.width,
      top: (rect.top - sectionRect.top) / sectionRect.height,
      width: rect.width / sectionRect.width,
      height: rect.height / sectionRect.height,
      centerX: (rect.left + rect.width / 2 - sectionRect.left) / sectionRect.width,
      centerY: (rect.top + rect.height / 2 - sectionRect.top) / sectionRect.height,
    });

    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      section: {
        width: sectionRect.width,
        height: sectionRect.height,
      },
      selector: toUnitRect(selectorRect),
      track: toUnitRect(trackRect),
      thumb: toUnitRect(thumbRect),
      rail: toUnitRect(railRect),
    };
  });
}

function assertClose(label, actual, expected) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `Expected ${label} to stay zoom-stable. normal=${expected}, zoomed=${actual}`,
  );
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const normalPage = await browser.newPage({ viewport: { width: 1470, height: 835 } });
  await openCareerDetail(normalPage);
  const normal = await readSelectorGeometry(normalPage);

  const zoomedPage = await browser.newPage({ viewport: { width: 1336, height: 759 } });
  await openCareerDetail(zoomedPage);
  const zoomed = await readSelectorGeometry(zoomedPage);

  for (const key of ['left', 'top', 'width', 'height', 'centerX', 'centerY']) {
    assertClose(`selector.${key}`, zoomed.selector[key], normal.selector[key]);
  }

  assertClose('track.centerX', zoomed.track.centerX, normal.track.centerX);
  assertClose('track.top', zoomed.track.top, normal.track.top);
  assertClose('track.height', zoomed.track.height, normal.track.height);
  assertClose('thumb.centerX', zoomed.thumb.centerX, normal.thumb.centerX);
  assertClose('rail.centerX', zoomed.rail.centerX, normal.rail.centerX);
  assertClose('rail.top', zoomed.rail.top, normal.rail.top);
  assertClose('rail.height', zoomed.rail.height, normal.rail.height);

  await browser.close().catch(() => {});
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
