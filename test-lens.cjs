const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3006');
  await page.waitForTimeout(1000);

  // Scroll downwards to ExperienceHero
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight * 2.2);
  });
  await page.waitForTimeout(1000);
  
  // Hover over center of the text
  const rects = await page.evaluate(() => {
    const title = document.querySelector('h2.text-6xl');
    return title ? JSON.parse(JSON.stringify(title.getBoundingClientRect())) : null;
  });

  if (rects) {
    const cx = rects.left + rects.width / 2;
    const cy = rects.top + rects.height / 2;
    
    await page.mouse.move(cx, cy);
    await page.waitForTimeout(300);
    await page.screenshot({ path: '/tmp/lens-test3.png' });

    // Hover over far left edge of text
    await page.mouse.move(rects.left, cy);
    await page.waitForTimeout(300);
    await page.screenshot({ path: '/tmp/lens-test4.png' });
  }

  await browser.close();
})();
