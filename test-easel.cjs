const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3006');
  await page.waitForTimeout(1000);

  // Scroll to 0.7 progress roughly (where easel and texts are fully visible)
  // Total container is 600vh, screen is 100vh. Scroll range = 500vh
  // 0.7 * 500vh = 3.5 * window.innerHeight
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight * 3.7);
  });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: '/tmp/easel-test-1.png' });
  
  await browser.close();
})();
