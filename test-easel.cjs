const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3006');
  await page.waitForTimeout(1000);

  // Scroll to 0.7 progress smoothly
  await page.evaluate(async () => {
    let currentScroll = 0;
    const targetScroll = window.innerHeight * 3.7;
    const step = 50;
    while(currentScroll < targetScroll) {
      window.scrollBy(0, step);
      currentScroll += step;
      await new Promise(r => setTimeout(r, 20));
    }
  });
  
  await page.waitForTimeout(1000);
  
  await page.screenshot({ path: '/tmp/easel-test-2.png' });
  
  await browser.close();
})();
