const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';
const alignmentTolerancePx = 10;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1470, height: 835 } });

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#career-detail-section');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';

    const section = document.getElementById('career-detail-section');
    if (!section) {
      throw new Error('CareerDetailSection not found');
    }

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, sectionTop);
  });
  await page.waitForTimeout(300);

  await page
    .locator(
      '[data-career-detail-tab-surface="desktop"][data-career-detail-tab="industryKnowledge"]',
    )
    .click();
  await page.waitForTimeout(250);

  await page.locator('[data-career-detail-record-button="industry-signal-creator-commerce"]').click();
  await page.waitForTimeout(250);

  const metrics = await page.evaluate(() => {
    const selectedButton = document.querySelector(
      '[data-career-detail-record-button="industry-signal-creator-commerce"][aria-pressed="true"]',
    );
    const thumb = document.querySelector('[data-career-detail-drag-thumb="desktop"]');

    if (!(selectedButton instanceof HTMLElement)) {
      throw new Error('Selected industry record button not found');
    }

    if (!(thumb instanceof HTMLElement)) {
      throw new Error('Career detail drag thumb not found');
    }

    const selectedButtonRect = selectedButton.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();

    return {
      selectedButtonCenterY: selectedButtonRect.top + selectedButtonRect.height / 2,
      thumbCenterY: thumbRect.top + thumbRect.height / 2,
      selectedButtonLeft: selectedButtonRect.left,
      selectedButtonWidth: selectedButtonRect.width,
      selectedButtonHeight: selectedButtonRect.height,
      thumbCenterX: thumbRect.left + thumbRect.width / 2,
      thumbRight: thumbRect.right,
      thumbWidth: thumbRect.width,
      thumbHeight: thumbRect.height,
    };
  });

  assert.ok(
    Math.abs(metrics.thumbCenterY - metrics.selectedButtonCenterY) <= alignmentTolerancePx,
    `Expected thumb to align with selected industry record button within ${alignmentTolerancePx}px, got ΔY=${Math.abs(
      metrics.thumbCenterY - metrics.selectedButtonCenterY,
    )}`,
  );
  assert.ok(
    metrics.thumbCenterX < metrics.selectedButtonLeft,
    `Expected thumb to sit left of the selected record button, got thumbCenterX=${metrics.thumbCenterX}, selectedButtonLeft=${metrics.selectedButtonLeft}`,
  );
  assert.ok(
    metrics.selectedButtonLeft - metrics.thumbCenterX >= 10,
    `Expected thumb to keep a visible gap from the selected record button, got gap=${metrics.selectedButtonLeft - metrics.thumbCenterX}`,
  );
  assert.ok(
    metrics.thumbRight <= metrics.selectedButtonLeft - 2,
    `Expected thumb to sit outside the selected record button edge, got thumbRight=${metrics.thumbRight}, selectedButtonLeft=${metrics.selectedButtonLeft}`,
  );
  assert.ok(
    metrics.thumbWidth >= metrics.selectedButtonWidth * 0.8,
    `Expected thumb to remain visibly sized next to bookmarks, got thumbWidth=${metrics.thumbWidth}, selectedButtonWidth=${metrics.selectedButtonWidth}`,
  );
  assert.ok(
    metrics.thumbHeight >= metrics.selectedButtonHeight * 0.75,
    `Expected thumb height to remain visibly sized next to bookmarks, got thumbHeight=${metrics.thumbHeight}, selectedButtonHeight=${metrics.selectedButtonHeight}`,
  );

  await browser.close().catch(() => {});
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
