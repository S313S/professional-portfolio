const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

const expectedRect = {
  left: 978,
  top: 154,
  width: 368,
  height: 637,
};

const tolerancePx = 2;

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1470, height: 835 } });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
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

  const metrics = await page.evaluate(() => {
    const section = document.getElementById('career-detail-section');
    const aside = section?.querySelector('aside');

    if (!section || !aside) {
      throw new Error('CareerDetail aside not found');
    }

    const sectionRect = section.getBoundingClientRect();
    const asideRect = aside.getBoundingClientRect();

    return {
      section: {
        width: sectionRect.width,
        height: sectionRect.height,
      },
      aside: {
        left: asideRect.left,
        top: asideRect.top,
        width: asideRect.width,
        height: asideRect.height,
      },
    };
  });

  for (const [key, expectedValue] of Object.entries(expectedRect)) {
    const actualValue = metrics.aside[key];
    assert.ok(
      Math.abs(actualValue - expectedValue) <= tolerancePx,
      `Expected aside ${key} to be ${expectedValue}px ±${tolerancePx}px, got ${actualValue}px`,
    );
  }

  await browser.close().catch(() => {});
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
