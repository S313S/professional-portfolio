const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

async function getVideoSection(page) {
  return page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );

    if (!section) {
      throw new Error('Video section not found');
    }

    const videos = Array.from(section.querySelectorAll('video'));
    const overlay = videos[1]?.parentElement;
    const cta = section.querySelector('button');

    return {
      phase: section.dataset.phase,
      sectionTop: section.getBoundingClientRect().top + window.scrollY,
      scrollY: window.scrollY,
      sectionViewportTop: section.getBoundingClientRect().top,
      overlayOpacity: overlay ? Number.parseFloat(getComputedStyle(overlay).opacity || '0') : 0,
      pushTime: videos[1]?.currentTime ?? 0,
      ctaVisible: Boolean(cta),
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

  const initial = await getVideoSection(page);
  const targetY = await page.evaluate((sectionTop) => {
    const maxScrollY = Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
    const nextTargetY = Math.min(sectionTop + 120, maxScrollY);
    window.scrollTo(0, nextTargetY);
    return nextTargetY;
  }, initial.sectionTop);
  await page.waitForFunction((expectedY) => Math.abs(window.scrollY - expectedY) <= 2, targetY);

  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
  });
  await page.waitForTimeout(1200);

  const reloaded = await getVideoSection(page);

  assert.ok(
    Math.abs(reloaded.scrollY - reloaded.sectionTop) <= 2,
    `Expected reload to reset scroll to the video section top. Got scrollY=${reloaded.scrollY}, sectionTop=${reloaded.sectionTop}`,
  );
  assert.ok(
    Math.abs(reloaded.sectionViewportTop) <= 2,
    `Expected video section to stay pinned at the top after reload. Got top=${reloaded.sectionViewportTop}`,
  );
  assert.equal(reloaded.phase, 'loopPlaying');
  assert.equal(reloaded.ctaVisible, false);
  assert.ok(reloaded.overlayOpacity < 0.05, `Expected push-in layer to stay hidden after reload. Got ${reloaded.overlayOpacity}`);
  assert.ok(reloaded.pushTime < 0.05, `Expected push-in video to reset to the start after reload. Got ${reloaded.pushTime}`);

  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(300);

  const afterWheel = await getVideoSection(page);

  assert.ok(
    Math.abs(afterWheel.scrollY - reloaded.sectionTop) <= 2,
    `Expected first wheel step after reload to keep the page pinned. Got scrollY=${afterWheel.scrollY}, sectionTop=${reloaded.sectionTop}`,
  );
  assert.equal(afterWheel.phase, 'awaitingActivation');
  assert.equal(afterWheel.ctaVisible, true, 'Expected reload recovery to show the CTA on first downward wheel intent.');
  assert.ok(afterWheel.overlayOpacity < 0.05, `Expected push-in layer to stay hidden until CTA activation. Got ${afterWheel.overlayOpacity}`);
  assert.ok(afterWheel.pushTime < 0.05, `Expected push-in video to stay reset until CTA activation. Got ${afterWheel.pushTime}`);

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
