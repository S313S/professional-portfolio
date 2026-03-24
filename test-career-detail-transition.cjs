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

  const sectionTop = await page.evaluate(() => {
    const section = document.getElementById('career-detail-section');
    if (!section) {
      throw new Error('CareerDetailSection not found');
    }

    return section.getBoundingClientRect().top + window.scrollY;
  });

  await page.mouse.move(720, 450);
  await page.evaluate((y) => window.scrollTo(0, y - 520), sectionTop);
  await page.waitForTimeout(200);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(500);

  const snapped = await page.evaluate(() => {
    const section = document.getElementById('career-detail-section');
    const select = section?.querySelector('[data-career-detail-select="record"]');
    const customSelector = section?.querySelector('[data-career-detail-selector="desktop"]');
    return {
      scrollY: window.scrollY,
      rectTop: section?.getBoundingClientRect().top ?? null,
      sectionTop: section ? section.getBoundingClientRect().top + window.scrollY : null,
      selectExists: Boolean(select),
      customSelectorExists: Boolean(customSelector),
    };
  });

  assert.equal(snapped.selectExists, true, 'Expected the detail record dropdown to render.');
  assert.equal(snapped.customSelectorExists, true, 'Expected the desktop custom record selector to render.');
  assert.ok(
    Math.abs(snapped.rectTop) <= 2,
    `Expected CareerDetailSection to snap flush to the viewport top. Got rectTop=${snapped.rectTop}, scrollY=${snapped.scrollY}, sectionTop=${snapped.sectionTop}`,
  );

  const initialContent = await page.evaluate(() => ({
    heading: document.querySelector('[data-career-detail-block="date-title"]')?.textContent ?? '',
    eyebrow: document.querySelector('[data-career-detail-block="eyebrow"]')?.textContent ?? '',
    headline: document.querySelector('h3')?.textContent ?? '',
  }));

  assert.match(initialContent.heading, /October 14th, 1894/);
  assert.match(initialContent.eyebrow, /Chronicle I:/);
  assert.match(initialContent.headline, /Chief Surveyor & Field Archivist/);

  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);

  const wheelUpdated = await page.evaluate(() => ({
    heading: document.querySelector('[data-career-detail-block="date-title"]')?.textContent ?? '',
    eyebrow: document.querySelector('[data-career-detail-block="eyebrow"]')?.textContent ?? '',
    body: document.querySelector('[data-career-detail-block="body"]')?.textContent ?? '',
  }));

  assert.match(wheelUpdated.heading, /May 3rd, 1901/);
  assert.match(wheelUpdated.eyebrow, /Chronicle I: Sharing Journey/);
  assert.match(wheelUpdated.body, /By the second chapter, sharing was less about confession/i);

  const dragTrack = page.locator('[data-career-detail-drag-track="desktop"]');
  const dragBox = await dragTrack.boundingBox();
  if (!dragBox) {
    throw new Error('Career detail drag track not found');
  }

  const dragX = dragBox.x + dragBox.width / 2;
  const dragStartY = dragBox.y + dragBox.height * 0.38;
  await page.mouse.move(dragX, dragStartY);
  await page.mouse.down();
  await page.mouse.move(dragX, dragStartY + 96, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(250);

  const dragUpdated = await page.evaluate(() => ({
    heading: document.querySelector('[data-career-detail-block="date-title"]')?.textContent ?? '',
    eyebrow: document.querySelector('[data-career-detail-block="eyebrow"]')?.textContent ?? '',
    body: document.querySelector('[data-career-detail-block="body"]')?.textContent ?? '',
  }));

  assert.match(dragUpdated.heading, /January 18th, 1908/);
  assert.match(dragUpdated.eyebrow, /Chronicle I: Sharing Journey/);
  assert.match(dragUpdated.body, /Sharing entered a steadier phase here/i);

  const archivePanel = await page.evaluate(() => ({
    classified: document.querySelector('[data-career-detail-block="classified"]')?.textContent ?? '',
  }));

  assert.match(archivePanel.classified, /CLASSIFIED/);

  await browser.close().catch(() => {});
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
