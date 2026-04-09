const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#career-detail-section');
  await page.waitForSelector('#works-lobby-section');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
  });

  const worksLobbyTop = await page.evaluate(() => {
    const section = document.getElementById('works-lobby-section');
    if (!section) {
      throw new Error('WorksLobbySection not found');
    }

    return section.getBoundingClientRect().top + window.scrollY;
  });

  await page.evaluate((y) => window.scrollTo(0, y - 520), worksLobbyTop);
  await page.waitForTimeout(200);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(300);

  const afterWheel = await page.evaluate(() => {
    const section = document.getElementById('works-lobby-section');
    return {
      scrollY: window.scrollY,
      rectTop: section?.getBoundingClientRect().top ?? null,
      sectionTop: section ? section.getBoundingClientRect().top + window.scrollY : null,
    };
  });

  assert.ok(
    (afterWheel.rectTop ?? 0) > 2,
    `Expected WorksLobbySection to stay below the viewport until the page-switch button is clicked. Got rectTop=${afterWheel.rectTop}, scrollY=${afterWheel.scrollY}, sectionTop=${afterWheel.sectionTop}`,
  );

  const careerDetailTop = await page.evaluate(() => {
    const section = document.getElementById('career-detail-section');
    if (!section) {
      throw new Error('CareerDetailSection not found');
    }

    return section.getBoundingClientRect().top + window.scrollY;
  });

  await page.evaluate((y) => window.scrollTo(0, y), careerDetailTop);
  await page.waitForTimeout(200);
  await page.waitForTimeout(3200);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);

  const revealedCtaState = await page.evaluate(() => {
    const cta = document.querySelector('[data-career-detail-cta="page-switch"]');
    const hint = document.querySelector('[data-career-detail-cta-hint="page-switch"]');
    const wrapper = cta?.closest('[data-career-detail-cta-visible]');

    return {
      ctaVisible: wrapper?.getAttribute('data-career-detail-cta-visible') ?? '',
      hintVisible: hint?.getAttribute('data-career-detail-cta-hint-visible') ?? '',
    };
  });

  assert.equal(revealedCtaState.ctaVisible, 'true');
  assert.equal(revealedCtaState.hintVisible, 'true');

  await page.locator('[data-career-detail-cta="page-switch"]').click();
  await page.waitForTimeout(1400);

  const snapped = await page.evaluate(() => {
    const section = document.getElementById('works-lobby-section');
    return {
      rectTop: section?.getBoundingClientRect().top ?? null,
      phase: section?.getAttribute('data-works-lobby-phase') ?? '',
      buttonLayerExists: Boolean(section?.querySelector('[data-works-lobby-layer="button"]')),
    };
  });

  assert.ok(
    Math.abs(snapped.rectTop ?? 999) <= 2,
    `Expected WorksLobbySection to snap flush to the viewport top after CTA click. Got rectTop=${snapped.rectTop}`,
  );
  assert.equal(snapped.buttonLayerExists, true, 'Expected works lobby CTA layer to render.');
  assert.match(snapped.phase, /revealing|holding/);

  await browser.close().catch(() => {});
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
