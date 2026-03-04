const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3006');
  await page.waitForTimeout(1000);

  // Scroll to ExperienceHero
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight * 2.2);
  });
  
  await page.waitForTimeout(1000);
  
  // Move mouse to top left of the Experience component viewport
  await page.mouse.move(100, 100);
  await page.waitForTimeout(100);
  
  await page.screenshot({ path: '/tmp/mouse-test.png' });

  // Move mouse to bottom right
  await page.mouse.move(1200, 700);
  await page.waitForTimeout(100);
  
  await page.screenshot({ path: '/tmp/mouse-test2.png' });

  await browser.close();
})();
