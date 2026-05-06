const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function openWorksDetailGallery(page) {
  await page.goto(baseUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#works-detail-section');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';

    const section = document.getElementById('works-detail-section');
    if (!section) {
      throw new Error('WorksDetailSection not found');
    }

    window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY);
    window.dispatchEvent(new Event('works-detail-transition:start'));
  });
  await page.waitForTimeout(50);
  await page.evaluate(() => {
    window.postMessage('detail-work-loading:completed', window.location.origin);
  });
  await page.waitForSelector('[aria-label="Open On Track collection"][tabindex="0"]');
  await page.locator('[aria-label="Open On Track collection"]').click();
  await page.waitForSelector('.works-detail-gallery__visual-plane');
  await page.waitForTimeout(120);
  await page.waitForFunction(() => {
    const plane = document.querySelector('.works-detail-gallery__visual-plane');
    const activeCard = document.querySelector('.works-detail-track__item[data-active="true"]');
    return Boolean(plane && activeCard && activeCard.getBoundingClientRect().width > 0);
  });
}

async function readGalleryGeometry(page) {
  return page.evaluate(() => {
    const plane = document.querySelector('.works-detail-gallery__visual-plane');
    const cards = Array.from(document.querySelectorAll('.works-detail-track__item[data-empty="false"]'));
    const activeCard = document.querySelector('.works-detail-track__item[data-active="true"]');
    const topRail = document.querySelector('.works-detail-track__corridor--top');
    const bottomRail = document.querySelector('.works-detail-track__corridor--bottom');

    if (!plane || !activeCard || !topRail || !bottomRail) {
      throw new Error('Works detail gallery geometry targets not found');
    }

    const planeRect = plane.getBoundingClientRect();
    const cardRect = activeCard.getBoundingClientRect();
    const topRailRect = topRail.getBoundingClientRect();
    const bottomRailRect = bottomRail.getBoundingClientRect();
    const designWidth = Number.parseFloat(getComputedStyle(plane).getPropertyValue('--works-detail-gallery-plane-width'));
    const designHeight = Number.parseFloat(getComputedStyle(plane).getPropertyValue('--works-detail-gallery-plane-height'));
    const cssScale = Number.parseFloat(getComputedStyle(plane).getPropertyValue('--works-detail-gallery-plane-scale'));
    const scale = planeRect.width / designWidth;
    const cardCenterX = (cardRect.left + cardRect.width / 2 - planeRect.left) / scale;
    const cardCenterY = (cardRect.top + cardRect.height / 2 - planeRect.top) / scale;
    const railCenterY = (
      topRailRect.top + topRailRect.height / 2 +
      bottomRailRect.top + bottomRailRect.height / 2
    ) / 2;
    const cardRailMargins = cards.map((card) => {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const corners = [
        [centerX, rect.top],
        [rect.right, centerY],
        [centerX, rect.bottom],
        [rect.left, centerY],
      ];
      const topRailCenterX = topRailRect.left + topRailRect.width / 2;
      const topRailCenterY = topRailRect.top + topRailRect.height / 2;
      const bottomRailCenterX = bottomRailRect.left + bottomRailRect.width / 2;
      const bottomRailCenterY = bottomRailRect.top + bottomRailRect.height / 2;
      const distances = corners.map(([cornerX, cornerY]) => {
        const topDistance = ((cornerX - topRailCenterX) + (cornerY - topRailCenterY)) / Math.SQRT2;
        const bottomDistance = ((cornerX - bottomRailCenterX) + (cornerY - bottomRailCenterY)) / Math.SQRT2;

        return {
          top: topDistance / scale,
          bottom: bottomDistance / scale,
        };
      });

      return {
        slot: card.getAttribute('data-slot'),
        minTop: Math.min(...distances.map((distance) => distance.top)),
        maxBottom: Math.max(...distances.map((distance) => distance.bottom)),
      };
    });

    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      designWidth,
      designHeight,
      planeWidth: planeRect.width,
      planeHeight: planeRect.height,
      cssScale,
      cardCenterX,
      cardCenterY,
      cardRailDistance: ((cardRect.top + cardRect.height / 2) - railCenterY) / scale,
      cardRailMargins,
    };
  });
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const normalPage = await browser.newPage({ viewport: { width: 1470, height: 835 } });
  await openWorksDetailGallery(normalPage);
  const normal = await readGalleryGeometry(normalPage);

  const zoomedPage = await browser.newPage({ viewport: { width: 1336, height: 759 } });
  await openWorksDetailGallery(zoomedPage);
  const zoomed = await readGalleryGeometry(zoomedPage);

  assert.equal(normal.designWidth, zoomed.designWidth);
  assert.equal(normal.designHeight, zoomed.designHeight);
  assert.ok(
    normal.cssScale > zoomed.cssScale,
    `Expected zoom-equivalent smaller CSS viewport to lower scene scale. normal=${normal.cssScale}, zoomed=${zoomed.cssScale}`,
  );
  assert.ok(
    normal.cssScale / zoomed.cssScale > 1.08 && normal.cssScale / zoomed.cssScale < 1.13,
    `Expected scale ratio to stay near 110%. normal=${normal.cssScale}, zoomed=${zoomed.cssScale}`,
  );
  assert.ok(
    Math.abs(normal.cardCenterX - zoomed.cardCenterX) <= 1,
    `Expected card x design coordinate to survive zoom. normal=${normal.cardCenterX}, zoomed=${zoomed.cardCenterX}`,
  );
  assert.ok(
    Math.abs(normal.cardCenterY - zoomed.cardCenterY) <= 1,
    `Expected card y design coordinate to survive zoom. normal=${normal.cardCenterY}, zoomed=${zoomed.cardCenterY}`,
  );
  assert.ok(
    Math.abs(normal.cardRailDistance - zoomed.cardRailDistance) <= 1,
    `Expected card-to-rail design distance to survive zoom. normal=${normal.cardRailDistance}, zoomed=${zoomed.cardRailDistance}`,
  );
  for (const geometry of [normal, zoomed]) {
    for (const margin of geometry.cardRailMargins) {
      assert.ok(
        margin.minTop >= 8,
        `Expected slot ${margin.slot} to stay at least 8 design px below the top rail. Got ${margin.minTop}`,
      );
      assert.ok(
        margin.maxBottom <= -8,
        `Expected slot ${margin.slot} to stay at least 8 design px above the bottom rail. Got ${margin.maxBottom}`,
      );
    }
  }

  await browser.close().catch(() => {});
  process.exit(0);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
