const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3001';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('section')).some(
      (node) => node.querySelectorAll('video').length >= 2,
    ),
  );
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

  await page.waitForTimeout(400);

  const beforeEnteringSection = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    const videos = Array.from(section.querySelectorAll('video'));
    videos[0].currentTime = 1.2;
    videos[0]?.dispatchEvent(new Event('ended'));
    const cta = section.querySelector('button');

    return {
      phase: section.dataset.phase,
      loopTime: videos[0]?.currentTime ?? 0,
      ctaVisible: Boolean(cta),
    };
  });

  assert.equal(beforeEnteringSection.phase, 'loopPlaying');
  assert.equal(beforeEnteringSection.ctaVisible, false, 'Expected CTA to stay hidden before the video section enters view.');
  assert.ok(
    beforeEnteringSection.loopTime < 0.1,
    `Expected curtain loop to stay near the starting frame before entering the section. Got ${beforeEnteringSection.loopTime}`,
  );

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
      loopTime: videos[0]?.currentTime ?? 0,
    };
  });

  assert.equal(before.phase, 'loopPlaying');
  assert.equal(before.ctaVisible, false, 'Expected to see the curtain loop first when entering the section.');
  assert.ok(before.loopTime < 0.35, `Expected the first visible entry to restart the curtain loop near the beginning. Got ${before.loopTime}`);

  await page.waitForTimeout(450);

  const midPlayback = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    const videos = Array.from(section.querySelectorAll('video'));
    return {
      loopTime: videos[0]?.currentTime ?? 0,
    };
  });

  assert.ok(midPlayback.loopTime > 0.2, `Expected the curtain loop to visibly progress after first entry. Got ${midPlayback.loopTime}`);

  await page.evaluate((y) => window.scrollTo(0, y), Math.max(sectionTop - 40, 0));
  await page.waitForTimeout(150);
  await page.evaluate((y) => window.scrollTo(0, y), sectionTop);
  await page.waitForTimeout(150);

  const afterReturn = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    const videos = Array.from(section.querySelectorAll('video'));
    return {
      phase: section.dataset.phase,
      loopTime: videos[0]?.currentTime ?? 0,
      ctaVisible: Boolean(section.querySelector('button')),
    };
  });

  assert.equal(afterReturn.phase, 'loopPlaying');
  assert.equal(afterReturn.ctaVisible, false, 'Expected CTA to remain hidden when returning before the curtain loop completes.');
  assert.ok(
    afterReturn.loopTime > 0.2,
    `Expected returning to the section before completion to resume the curtain loop instead of restarting it. Got ${afterReturn.loopTime}`,
  );

  await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    const videos = Array.from(section.querySelectorAll('video'));
    videos[0]?.dispatchEvent(new Event('ended'));
  });
  await page.waitForTimeout(350);

  const afterFirstWheel = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    const videos = Array.from(section.querySelectorAll('video'));
    const overlay = videos[1]?.parentElement;
    const cta = section.querySelector('button');
    const hint = section.querySelector('p');
    return {
      phase: section.dataset.phase,
      scrollY: window.scrollY,
      loopOpacity: Number.parseFloat(getComputedStyle(videos[0]).opacity || '1'),
      overlayOpacity: overlay ? Number.parseFloat(getComputedStyle(overlay).opacity || '0') : 0,
      pushTime: videos[1]?.currentTime ?? 0,
      ctaVisible: Boolean(cta),
      ctaClassName: cta?.className ?? '',
      hintClassName: hint?.className ?? '',
      hintStyle: hint?.getAttribute('style') ?? '',
    };
  });

  assert.ok(
    Math.abs(afterFirstWheel.scrollY - sectionTop) <= 2,
    `Expected prompt reveal to keep the page pinned on the video section. Got scrollY=${afterFirstWheel.scrollY}, sectionTop=${sectionTop}`,
  );
  assert.equal(afterFirstWheel.phase, 'awaitingActivation');
  assert.equal(afterFirstWheel.ctaVisible, true, 'Expected CTA button to appear only after the in-view curtain loop ends.');
  assert.match(afterFirstWheel.ctaClassName, /\bvideo-cta-prompt-button\b/, 'Expected CTA button prompt animation class to be present.');
  assert.match(afterFirstWheel.hintClassName, /\bvideo-cta-prompt-text\b/, 'Expected CTA hint prompt animation class to be present.');
  assert.match(afterFirstWheel.hintStyle, /--video-cta-hint-left:\s*calc\(27\.8% \+ 80px\)/, 'Expected CTA hint text to expose the base offset via a tunable CSS variable.');
  assert.match(afterFirstWheel.hintStyle, /--video-cta-hint-left-md:\s*calc\(27\.6% \+ 80px\)/, 'Expected CTA hint text to expose the desktop offset via a tunable CSS variable.');
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
  assert.ok(afterActivation.overlayOpacity > 0.95, `Expected push-in layer to be visible during scrubbing. Got ${afterActivation.overlayOpacity}`);
  assert.ok(afterActivation.loopOpacity < 0.05, `Expected curtain layer to be hidden during scrubbing. Got ${afterActivation.loopOpacity}`);

  let completedAtTop = null;
  for (let index = 0; index < 16; index += 1) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(90);

    completedAtTop = await page.evaluate(() => {
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

    if (completedAtTop.phase === 'completed') {
      break;
    }
  }

  assert.ok(completedAtTop, 'Expected to capture completion state.');
  assert.equal(completedAtTop.phase, 'completed', 'Expected scrubbing to eventually reach the completed state.');

  completedAtTop = await page.evaluate(() => {
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
    Math.abs(completedAtTop.scrollY - sectionTop) <= 2,
    `Expected completion to keep the page pinned before the next downward wheel step. Got scrollY=${completedAtTop.scrollY}, sectionTop=${sectionTop}`,
  );
  assert.ok(completedAtTop.overlayOpacity > 0.95, `Expected final frame to remain visible at completion. Got ${completedAtTop.overlayOpacity}`);
  assert.ok(completedAtTop.loopOpacity < 0.05, `Expected curtain layer to stay hidden at completion. Got ${completedAtTop.loopOpacity}`);

  await page.mouse.wheel(0, -120);
  await page.waitForFunction(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    if (!section || section.dataset.phase !== 'loopPlaying') {
      return false;
    }

    const videos = Array.from(section.querySelectorAll('video'));
    const overlay = videos[1]?.parentElement;
    const overlayOpacity = overlay ? Number.parseFloat(getComputedStyle(overlay).opacity || '0') : 0;
    const loopOpacity = Number.parseFloat(getComputedStyle(videos[0]).opacity || '1');
    return overlayOpacity < 0.05 && loopOpacity > 0.95;
  });

  const afterRewind = await page.evaluate(() => {
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
    Math.abs(afterRewind.scrollY - sectionTop) <= 2,
    `Expected upward wheel from completion to keep the page pinned on the video section. Got scrollY=${afterRewind.scrollY}, sectionTop=${sectionTop}`,
  );
  assert.equal(afterRewind.phase, 'loopPlaying');
  assert.equal(afterRewind.ctaVisible, false, 'Expected CTA to stay hidden immediately after rewinding to the curtain loop.');
  assert.ok(afterRewind.overlayOpacity < 0.05, `Expected push-in layer to hide after rewinding. Got ${afterRewind.overlayOpacity}`);
  assert.ok(afterRewind.loopOpacity > 0.95, `Expected curtain layer to reappear after rewinding. Got ${afterRewind.loopOpacity}`);
  assert.ok(afterRewind.pushTime < 0.05, `Expected push-in video to reset after rewinding. Got ${afterRewind.pushTime}`);

  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);

  const afterRewindDown = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    return {
      phase: section.dataset.phase,
      hasButton: Boolean(section.querySelector('button')),
    };
  });

  assert.equal(afterRewindDown.phase, 'awaitingActivation');
  assert.equal(afterRewindDown.hasButton, true, 'Expected CTA to reappear after scrolling down from the rewound curtain loop.');

  await page.getByRole('button', { name: /start dragging|play the album transition video/i }).click();
  await page.waitForTimeout(150);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(150);
  let completedAgain = null;
  for (let index = 0; index < 16; index += 1) {
    await page.mouse.wheel(0, 120);
    await page.waitForTimeout(75);

    completedAgain = await page.evaluate(() => {
      const section = Array.from(document.querySelectorAll('section')).find(
        (node) => node.querySelectorAll('video').length >= 2,
      );
      return {
        phase: section.dataset.phase,
        scrollY: window.scrollY,
      };
    });

    if (completedAgain.phase === 'completed') {
      break;
    }
  }

  assert.ok(completedAgain, 'Expected to capture the second completion state.');
  assert.equal(completedAgain.phase, 'completed');

  completedAgain = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    return {
      phase: section.dataset.phase,
      scrollY: window.scrollY,
    };
  });

  assert.ok(Math.abs(completedAgain.scrollY - sectionTop) <= 2);

  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);

  const afterCompletion = await page.evaluate(() => window.scrollY);

  assert.ok(
    afterCompletion > sectionTop + 20,
    `Expected page scrolling to resume after the push-in animation completed. Got scrollY=${afterCompletion}, sectionTop=${sectionTop}`,
  );

  for (let index = 0; index < 8; index += 1) {
    const currentScrollY = await page.evaluate(() => window.scrollY);
    if (currentScrollY < sectionTop - 20) {
      break;
    }

    await page.mouse.wheel(0, -120);
    await page.waitForTimeout(120);
  }

  const afterReturnToPreviousPage = await page.evaluate(() => {
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
      ctaVisible: Boolean(section.querySelector('button')),
    };
  });

  assert.ok(
    afterReturnToPreviousPage.scrollY < sectionTop - 20,
    `Expected the page to scroll back above the video section. Got scrollY=${afterReturnToPreviousPage.scrollY}, sectionTop=${sectionTop}`,
  );
  await page.waitForFunction(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    if (!section || section.dataset.phase !== 'loopPlaying') {
      return false;
    }

    const videos = Array.from(section.querySelectorAll('video'));
    const overlay = videos[1]?.parentElement;
    const overlayOpacity = overlay ? Number.parseFloat(getComputedStyle(overlay).opacity || '0') : 0;
    const loopOpacity = Number.parseFloat(getComputedStyle(videos[0]).opacity || '1');
    return overlayOpacity < 0.05 && loopOpacity > 0.95;
  });

  const afterReturnResetSettled = await page.evaluate(() => {
    const section = Array.from(document.querySelectorAll('section')).find(
      (node) => node.querySelectorAll('video').length >= 2,
    );
    const videos = Array.from(section.querySelectorAll('video'));
    const overlay = videos[1]?.parentElement;
    return {
      phase: section.dataset.phase,
      loopOpacity: Number.parseFloat(getComputedStyle(videos[0]).opacity || '1'),
      overlayOpacity: overlay ? Number.parseFloat(getComputedStyle(overlay).opacity || '0') : 0,
      pushTime: videos[1]?.currentTime ?? 0,
      ctaVisible: Boolean(section.querySelector('button')),
    };
  });

  assert.equal(afterReturnResetSettled.phase, 'loopPlaying');
  assert.equal(afterReturnResetSettled.ctaVisible, false, 'Expected CTA to stay hidden while the loop video is restored in the background.');
  assert.ok(afterReturnResetSettled.overlayOpacity < 0.05, `Expected push-in layer to stay hidden after scrolling back upward. Got ${afterReturnResetSettled.overlayOpacity}`);
  assert.ok(afterReturnResetSettled.loopOpacity > 0.95, `Expected curtain layer to be restored after scrolling back upward. Got ${afterReturnResetSettled.loopOpacity}`);
  assert.ok(afterReturnResetSettled.pushTime < 0.05, `Expected push-in video to reset after scrolling back upward. Got ${afterReturnResetSettled.pushTime}`);

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
