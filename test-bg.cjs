const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3006');
  await page.waitForTimeout(1000);

  // Scroll to halfway through ExperienceHero so card is scaled down
  await page.evaluate(() => {
    // Experience starts around 2.2 * innerHeight, card shrinks completely by scrub=0.3 (out of 600vh height, so ~ 1.8 * innerHeight after start)
    window.scrollBy(0, window.innerHeight * 3);
  });
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: '/tmp/bg-test.png' });
  await browser.close();
})();
