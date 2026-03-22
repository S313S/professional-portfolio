const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
  });

  await page.mouse.move(720, 450);
  await page.evaluate(() => window.scrollTo(0, 3600));
  await page.waitForTimeout(200);

  for (let index = 0; index < 8; index += 1) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(80);
  }

  for (let index = 0; index < 8; index += 1) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(120);
  }

  await page.waitForTimeout(500);

  const result = await page.evaluate(() => {
    const careerJourneySection = document.getElementById('career-journey-section');
    if (!careerJourneySection) {
      throw new Error('CareerJourneySection not found');
    }

    return {
      scrollY: window.scrollY,
      careerRectTop: careerJourneySection.getBoundingClientRect().top,
      careerTop: careerJourneySection.getBoundingClientRect().top + window.scrollY,
    };
  });

  assert.ok(
    Math.abs(result.careerRectTop) <= 2,
    `Expected CareerJourneySection to snap flush to the viewport top. Got careerRectTop=${result.careerRectTop}, scrollY=${result.scrollY}, careerTop=${result.careerTop}`,
  );

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
