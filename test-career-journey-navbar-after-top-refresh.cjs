const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function getNavbarSnapshot(page, label) {
  return page.evaluate((label) => {
    const nav = document.querySelector('nav');
    const section = document.getElementById('career-journey-section');

    if (!nav || !section) {
      throw new Error('Navbar or CareerJourneySection not found');
    }

    const navRect = nav.getBoundingClientRect();
    const sectionRect = section.getBoundingClientRect();
    const computedStyle = getComputedStyle(nav);

    return {
      label,
      scrollY: window.scrollY,
      navTop: navRect.top,
      navBottom: navRect.bottom,
      navTransform: computedStyle.transform,
      sectionTop: sectionRect.top,
      sectionBottom: sectionRect.bottom,
      viewportHeight: window.innerHeight,
    };
  }, label);
}

function assertNavbarHidden(snapshot) {
  assert.ok(
    snapshot.navBottom <= 2,
    `${snapshot.label}: expected navbar to stay hidden. Got navTop=${snapshot.navTop}, navBottom=${snapshot.navBottom}, transform=${snapshot.navTransform}, sectionTop=${snapshot.sectionTop}, sectionBottom=${snapshot.sectionBottom}, scrollY=${snapshot.scrollY}`,
  );
}

function logSnapshot(snapshot) {
  console.log(JSON.stringify(snapshot));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(300);

  await page.reload({ waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
  });

  const sectionTop = await page.evaluate(() => {
    const section = document.getElementById('career-journey-section');
    if (!section) {
      throw new Error('CareerJourneySection not found');
    }

    return section.getBoundingClientRect().top + window.scrollY;
  });

  await page.evaluate((targetY) => window.scrollTo(0, targetY), sectionTop);
  await page.waitForTimeout(800);

  const atSection = await getNavbarSnapshot(page, 'at-section-after-top-refresh');
  logSnapshot(atSection);
  assertNavbarHidden(atSection);

  await page.mouse.move(720, 450);
  await page.mouse.wheel(0, 120);
  await page.waitForTimeout(500);

  const afterScrollDown = await getNavbarSnapshot(page, 'after-scroll-down');
  logSnapshot(afterScrollDown);
  assertNavbarHidden(afterScrollDown);

  await page.mouse.wheel(0, -120);
  await page.waitForTimeout(500);

  const afterScrollUp = await getNavbarSnapshot(page, 'after-scroll-up');
  logSnapshot(afterScrollUp);
  assertNavbarHidden(afterScrollUp);

  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
