const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#career-journey-section');
  await page.waitForSelector('#career-detail-section');
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
  await page.waitForFunction(
    () => {
      const section = document.getElementById('career-detail-section');
      if (!section) {
        return false;
      }

      return Math.abs(section.getBoundingClientRect().top) <= 2;
    },
    { timeout: 2500 },
  );

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

  const readPrimaryContent = () =>
    page.evaluate(() => {
      const section = document.getElementById('career-detail-section');
      const dateTitles = section?.querySelectorAll('[data-career-detail-block="date-title"]') ?? [];
      const headings = section?.querySelectorAll('h3') ?? [];
      const eyebrows = section?.querySelectorAll('[data-career-detail-block="eyebrow"]') ?? [];
      const bodies = section?.querySelectorAll('[data-career-detail-block="body"]') ?? [];

      return {
        heading: dateTitles[0]?.textContent?.trim() ?? '',
        eyebrow: eyebrows[0]?.textContent?.trim() ?? '',
        headline: headings[0]?.textContent?.trim() ?? '',
        body: bodies[0]?.textContent?.trim() ?? '',
      };
    });

  const initialContent = await readPrimaryContent();

  assert.match(initialContent.heading, /January 8th, 2025/);
  assert.match(initialContent.eyebrow, /Dispatch Log I: Sharing Journey/);
  assert.match(initialContent.headline, /Visual Tests Became Workflows/);

  const initialCtaState = await page.evaluate(() => {
    const cta = document.querySelector('[data-career-detail-cta="page-switch"]');
    const hint = document.querySelector('[data-career-detail-cta-hint="page-switch"]');
    const wrapper = cta?.closest('[data-career-detail-cta-visible]');

    return {
      ctaVisible: wrapper?.getAttribute('data-career-detail-cta-visible') ?? '',
      hintVisible: hint?.getAttribute('data-career-detail-cta-hint-visible') ?? '',
    };
  });

  assert.equal(initialCtaState.ctaVisible, 'false');
  assert.equal(initialCtaState.hintVisible, 'false');

  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);

  const earlyWheelState = await page.evaluate(() => {
    const section = document.getElementById('career-detail-section');
    const cta = document.querySelector('[data-career-detail-cta="page-switch"]');
    const hint = document.querySelector('[data-career-detail-cta-hint="page-switch"]');
    const wrapper = cta?.closest('[data-career-detail-cta-visible]');
    return {
      rectTop: section?.getBoundingClientRect().top ?? null,
      ctaVisible: wrapper?.getAttribute('data-career-detail-cta-visible') ?? '',
      hintVisible: hint?.getAttribute('data-career-detail-cta-hint-visible') ?? '',
    };
  });

  assert.equal(earlyWheelState.ctaVisible, 'false');
  assert.equal(earlyWheelState.hintVisible, 'false');
  assert.ok(
    Math.abs(earlyWheelState.rectTop ?? 999) <= 2,
    `Expected locked wheel input to keep CareerDetailSection pinned before CTA reveal. Got rectTop=${earlyWheelState.rectTop}`,
  );

  await page.waitForTimeout(3200);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(250);

  const wheelUpdated = await readPrimaryContent();
  const afterLockedWheel = await page.evaluate(() => {
    const section = document.getElementById('career-detail-section');
    const cta = document.querySelector('[data-career-detail-cta="page-switch"]');
    const hint = document.querySelector('[data-career-detail-cta-hint="page-switch"]');
    const wrapper = cta?.closest('[data-career-detail-cta-visible]');
    return {
      rectTop: section?.getBoundingClientRect().top ?? null,
      ctaVisible: wrapper?.getAttribute('data-career-detail-cta-visible') ?? '',
      hintVisible: hint?.getAttribute('data-career-detail-cta-hint-visible') ?? '',
    };
  });

  assert.match(wheelUpdated.heading, /January 8th, 2025/);
  assert.match(wheelUpdated.eyebrow, /Dispatch Log I: Sharing Journey/);
  assert.match(wheelUpdated.body, /I treated AI images and short videos as small field tests/i);
  assert.equal(afterLockedWheel.ctaVisible, 'true');
  assert.equal(afterLockedWheel.hintVisible, 'true');
  assert.ok(
    Math.abs(afterLockedWheel.rectTop ?? 999) <= 2,
    `Expected locked wheel input to keep CareerDetailSection pinned. Got rectTop=${afterLockedWheel.rectTop}`,
  );

  const pageSwitchButton = page.locator('[data-career-detail-cta="page-switch"]');
  await pageSwitchButton.hover();
  await page.waitForTimeout(150);

  const hoveredHintState = await page.evaluate(() => {
    const hint = document.querySelector('[data-career-detail-cta-hint="page-switch"]');
    return {
      hintVisible: hint?.getAttribute('data-career-detail-cta-hint-visible') ?? '',
    };
  });

  assert.equal(hoveredHintState.hintVisible, 'false');

  await page.mouse.move(720, 450);
  await page.waitForTimeout(150);

  const restoredHintState = await page.evaluate(() => {
    const hint = document.querySelector('[data-career-detail-cta-hint="page-switch"]');
    return {
      hintVisible: hint?.getAttribute('data-career-detail-cta-hint-visible') ?? '',
    };
  });

  assert.equal(restoredHintState.hintVisible, 'true');

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

  const dragUpdated = await readPrimaryContent();

  assert.match(dragUpdated.heading, /May 18th, 2025/);
  assert.match(dragUpdated.eyebrow, /Dispatch Log II: Sharing Journey/);
  assert.match(dragUpdated.body, /Travel photos, ticket stubs, and quick notes/i);

  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(250);

  const upwardWheelUpdated = await readPrimaryContent();

  assert.match(upwardWheelUpdated.heading, /January 8th, 2025/);
  assert.match(upwardWheelUpdated.eyebrow, /Dispatch Log I: Sharing Journey/);
  assert.match(
    upwardWheelUpdated.body,
    /I treated AI images and short videos as small field tests/i,
  );

  await page
    .locator('[data-career-detail-tab-surface="desktop"][data-career-detail-tab="workExperience"]')
    .click();
  await page.waitForTimeout(250);

  const clickedWorkExperience = await page.evaluate(() => {
    const section = document.getElementById('career-detail-section');
    const eyebrows = section?.querySelectorAll('[data-career-detail-block="eyebrow"]') ?? [];
    const headlines = section?.querySelectorAll('h3') ?? [];
    const bodies = section?.querySelectorAll('[data-career-detail-block="body"]') ?? [];

    return {
      eyebrow: eyebrows[0]?.textContent?.trim() ?? '',
      headline: headlines[0]?.textContent?.trim() ?? '',
      body: bodies[0]?.textContent?.trim() ?? '',
      workExperiencePressed:
        section
          ?.querySelector(
            '[data-career-detail-tab-surface="desktop"][data-career-detail-tab="workExperience"]',
          )
          ?.getAttribute('aria-pressed') ?? '',
      workExperienceConnectorActive:
        section
          ?.querySelector('[data-career-detail-connector="workExperience"]')
          ?.getAttribute('data-career-detail-connector-active') ?? '',
    };
  });

  assert.match(clickedWorkExperience.eyebrow, /Dispatch Log I: Work Experience/);
  assert.match(clickedWorkExperience.headline, /Data Had To Serve Action/);
  assert.match(clickedWorkExperience.body, /At Ping An, data work became useful/i);
  assert.equal(clickedWorkExperience.workExperiencePressed, 'true');
  assert.equal(clickedWorkExperience.workExperienceConnectorActive, 'true');

  await page
    .locator(
      '[data-career-detail-tab-surface="desktop"][data-career-detail-tab="industryKnowledge"]',
    )
    .click();
  await page.waitForTimeout(250);

  const clickedIndustryKnowledge = await page.evaluate(() => {
    const section = document.getElementById('career-detail-section');
    const eyebrows = section?.querySelectorAll('[data-career-detail-block="eyebrow"]') ?? [];
    const headlines = section?.querySelectorAll('h3') ?? [];
    const bodies = section?.querySelectorAll('[data-career-detail-block="body"]') ?? [];

    return {
      eyebrow: eyebrows[0]?.textContent?.trim() ?? '',
      headline: headlines[0]?.textContent?.trim() ?? '',
      body: bodies[0]?.textContent?.trim() ?? '',
      industryKnowledgePressed:
        section
          ?.querySelector(
            '[data-career-detail-tab-surface="desktop"][data-career-detail-tab="industryKnowledge"]',
          )
          ?.getAttribute('aria-pressed') ?? '',
      industryKnowledgeConnectorActive:
        section
          ?.querySelector('[data-career-detail-connector="industryKnowledge"]')
          ?.getAttribute('data-career-detail-connector-active') ?? '',
    };
  });

  assert.match(clickedIndustryKnowledge.eyebrow, /Dispatch Log I: Industry Knowledge/);
  assert.match(clickedIndustryKnowledge.headline, /Automation Needs A Business Spine/);
  assert.match(clickedIndustryKnowledge.body, /Most AI adoption problems are not tool problems first/i);
  assert.equal(clickedIndustryKnowledge.industryKnowledgePressed, 'true');
  assert.equal(clickedIndustryKnowledge.industryKnowledgeConnectorActive, 'true');

  const archivePanel = await page.evaluate(() => ({
    classified: document.querySelector('[data-career-detail-block="classified"]')?.textContent ?? '',
  }));

  assert.equal(archivePanel.classified, '');

  await browser.close().catch(() => {});
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
