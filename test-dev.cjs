const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://localhost:3006');
  
  await page.waitForTimeout(1000);

  const rects = await page.evaluate(() => {
    // We are at top, scrollYProgress is 0 for the ExperienceHero component!
    const card = document.querySelector('.absolute.z-20.flex.items-center.justify-center.overflow-hidden.bg-black');
    return card ? getComputedStyle(card).width : 'null';
  });
  
  console.log("Card width at top (no scroll):", rects);
  
  await page.evaluate(() => {
    window.scrollBy(0, window.innerHeight * 2.2);
  });
  
  await page.waitForTimeout(500);

  const widthAfterScrolledDown = await page.evaluate(() => {
    const card = document.querySelector('.absolute.z-20.flex.items-center.justify-center.overflow-hidden.bg-black');
    return card ? getComputedStyle(card).width : 'null';
  });
  console.log("Card width at ExperienceHero (scrolled down):", widthAfterScrolledDown);
  
  await browser.close();
})();
