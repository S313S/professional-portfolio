const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

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

  const getAsideImageSrc = async () =>
    page.evaluate(() => {
      const asideImage = document.querySelector('[data-career-detail-aside="desktop"] img');
      if (!(asideImage instanceof HTMLImageElement)) {
        throw new Error('Career detail aside image not found');
      }

      return asideImage.getAttribute('src') ?? '';
    });

  assert.match(await getAsideImageSrc(), /\/images\/careerDetail_litteleBg_01\.png$/);

  await page
    .locator('[data-career-detail-tab-surface="desktop"][data-career-detail-tab="workExperience"]')
    .click();
  await page.waitForTimeout(150);
  assert.match(await getAsideImageSrc(), /\/images\/careerDetail_litteleBg_02\.png$/);

  await page
    .locator(
      '[data-career-detail-tab-surface="desktop"][data-career-detail-tab="industryKnowledge"]',
    )
    .click();
  await page.waitForTimeout(150);
  assert.match(await getAsideImageSrc(), /\/images\/careerDetail_litteleBg_03\.png$/);

  await page
    .locator('[data-career-detail-tab-surface="desktop"][data-career-detail-tab="sharingJourney"]')
    .click();
  await page.waitForTimeout(150);
  assert.match(await getAsideImageSrc(), /\/images\/careerDetail_litteleBg_01\.png$/);

  await browser.close().catch(() => {});
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
