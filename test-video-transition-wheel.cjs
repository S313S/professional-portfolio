const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(baseUrl, { waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
  });

  const sectionTop = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );

    if (!section) {
      throw new Error('Video section not found');
    }

    return section.getBoundingClientRect().top + window.scrollY;
  });

  await page.mouse.move(720, 450);
  await page.evaluate((y) => window.scrollTo(0, y), sectionTop);
  await page.waitForTimeout(250);

  const before = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    const videos = Array.from(section.querySelectorAll('video'));
    const overlay = videos[1]?.parentElement;
    const cta = section.querySelector('button');
    return {
      phase: section.dataset.phase,
      scrollY: window.scrollY,
      loopOpacity: Number.parseFloat(getComputedStyle(videos[0]).opacity || '1'),
      overlayOpacity: overlay ? Number.parseFloat(getComputedStyle(overlay).opacity || '0') : 0,
      pushTime: videos[1]?.currentTime ?? 0,
      ctaVisible: Boolean(cta),
    };
  });

  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(350);

  const afterFirstWheel = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    const videos = Array.from(section.querySelectorAll('video'));
    const overlay = videos[1]?.parentElement;
    const cta = section.querySelector('button');
    return {
      phase: section.dataset.phase,
      scrollY: window.scrollY,
      loopOpacity: Number.parseFloat(getComputedStyle(videos[0]).opacity || '1'),
      overlayOpacity: overlay ? Number.parseFloat(getComputedStyle(overlay).opacity || '0') : 0,
      pushTime: videos[1]?.currentTime ?? 0,
      ctaVisible: Boolean(cta),
    };
  });

  assert.ok(
    Math.abs(afterFirstWheel.scrollY - sectionTop) <= 2,
    `Expected first wheel step to keep the page pinned on the video section. Got scrollY=${afterFirstWheel.scrollY}, sectionTop=${sectionTop}`,
  );
  assert.equal(afterFirstWheel.phase, 'awaitingActivation');
  assert.equal(afterFirstWheel.ctaVisible, true, 'Expected CTA button to appear after the first wheel step.');
  assert.equal(afterFirstWheel.pushTime, before.pushTime, 'Expected push-in video to stay idle before CTA click.');
  assert.ok(afterFirstWheel.overlayOpacity < 0.05, `Expected push-in layer to remain hidden before CTA click. Got ${afterFirstWheel.overlayOpacity}`);
  assert.ok(afterFirstWheel.loopOpacity > 0.95, `Expected curtain layer to remain visible while awaiting activation. Got ${afterFirstWheel.loopOpacity}`);

  await page.getByRole('button', { name: /start dragging|play the album transition video/i }).click();
  await page.waitForTimeout(150);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(200);

  const afterActivation = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    const videos = Array.from(section.querySelectorAll('video'));
    const overlay = videos[1]?.parentElement;
    return {
      phase: section.dataset.phase,
      scrollY: window.scrollY,
      loopOpacity: Number.parseFloat(getComputedStyle(videos[0]).opacity || '1'),
      overlayOpacity: overlay ? Number.parseFloat(getComputedStyle(overlay).opacity || '0') : 0,
      pushTime: videos[1]?.currentTime ?? 0,
    };
  });

  assert.ok(
    Math.abs(afterActivation.scrollY - sectionTop) <= 2,
    `Expected CTA activation to keep the page pinned on the video section. Got scrollY=${afterActivation.scrollY}, sectionTop=${sectionTop}`,
  );
  assert.equal(afterActivation.phase, 'scrubbing');
  assert.ok(afterActivation.pushTime > afterFirstWheel.pushTime, 'Expected push-in video to advance only after CTA activation.');
  assert.ok(afterActivation.overlayOpacity > 0.95, `Expected push-in layer to be visible during scrubbing. Got ${afterActivation.overlayOpacity}`);
  assert.ok(afterActivation.loopOpacity < 0.05, `Expected curtain layer to be hidden during scrubbing. Got ${afterActivation.loopOpacity}`);

  for (let index = 0; index < 10; index += 1) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(80);
  }

  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);

  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);

  const afterCompletion = await page.evaluate(() => window.scrollY);

  assert.ok(
    afterCompletion > sectionTop + 20,
    `Expected page scrolling to resume after the push-in animation completed. Got scrollY=${afterCompletion}, sectionTop=${sectionTop}`,
  );

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
