const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

async function getGrowPathState(page) {
  return page.evaluate(() => {
    const stageImage = document.querySelector('img[src="/images/bg_growpath.jpeg"]');
    const section = stageImage?.closest('section');
    const firstCard = section?.querySelector('button[aria-label*="growth path step 01"]');

    if (!section || !firstCard) {
      throw new Error('GrowPath section or first card not found');
    }

    return {
      sectionTop: section.getBoundingClientRect().top + window.scrollY,
      scrollY: window.scrollY,
      firstCardOpacity: Number.parseFloat(getComputedStyle(firstCard).opacity || '0'),
      firstCardTransform: getComputedStyle(firstCard).transform,
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
  });

  const initial = await getGrowPathState(page);
  const offsetScrollY = initial.sectionTop + 240;

  await page.mouse.move(720, 450);
  await page.evaluate((nextY) => window.scrollTo(0, nextY), offsetScrollY);
  await page.waitForTimeout(150);

  const beforeWheel = await getGrowPathState(page);
  assert.ok(
    beforeWheel.firstCardOpacity < 0.01,
    `Expected first card to be hidden before GrowPath capture. Got opacity=${beforeWheel.firstCardOpacity}`,
  );

  await page.mouse.wheel(0, 120);

  await page.waitForTimeout(40);
  const afterWheelImmediate = await getGrowPathState(page);
  await page.waitForTimeout(80);

  const afterWheel = await getGrowPathState(page);

  assert.ok(
    afterWheelImmediate.scrollY < beforeWheel.scrollY,
    `Expected GrowPath soft repin to start pulling scroll upward immediately. Before=${beforeWheel.scrollY}, after=${afterWheelImmediate.scrollY}`,
  );
  assert.ok(
    afterWheel.firstCardOpacity > 0.01,
    `Expected the first captured wheel to start revealing the first GrowPath card. Got opacity=${afterWheel.firstCardOpacity}`,
  );

  await page.waitForTimeout(430);
  const beforeSecondWheel = await getGrowPathState(page);

  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(60);

  const afterSecondWheel = await getGrowPathState(page);

  assert.ok(
    afterSecondWheel.firstCardOpacity > beforeSecondWheel.firstCardOpacity + 0.01,
    `Expected the first wheel after soft repin to keep revealing the GrowPath card instead of being swallowed. Before=${beforeSecondWheel.firstCardOpacity}, after=${afterSecondWheel.firstCardOpacity}`,
  );

  await browser.close().catch(() => {});
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
