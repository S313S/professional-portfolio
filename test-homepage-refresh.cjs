const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
  });

  const targetY = await page.evaluate(() => {
    const section = document.getElementById('career-detail-section');
    if (!section) {
      throw new Error('Career detail section not found');
    }

    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    window.scrollTo(0, sectionTop);
    return sectionTop;
  });

  await page.waitForFunction((expectedY) => Math.abs(window.scrollY - expectedY) <= 2, targetY);
  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1200);

  const reloadedState = await page.evaluate(() => {
    const hero = document.getElementById('home');

    return {
      scrollY: window.scrollY,
      heroTop: hero ? hero.getBoundingClientRect().top : null,
    };
  });

  assert.ok(
    reloadedState.scrollY <= 2,
    `Expected reload to return to the homepage top. Got scrollY=${reloadedState.scrollY}`,
  );
  assert.ok(
    reloadedState.heroTop === null || Math.abs(reloadedState.heroTop) <= 2,
    `Expected the hero section to be back at the viewport top. Got heroTop=${reloadedState.heroTop}`,
  );

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
