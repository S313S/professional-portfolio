import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import WorksDetailSection from './WorksDetailSection';

test('renders the works detail transition stage with loading iframe and hidden background scene', () => {
  const markup = renderToStaticMarkup(<WorksDetailSection />);

  assert.match(markup, /id="works-detail-section"/);
  assert.match(markup, /data-works-detail-stage="transition"/);
  assert.match(markup, /data-works-detail-phase="idle"/);
  assert.match(markup, /\/detailWork-loading\.html\?embed=portfolio/);
  assert.match(markup, /\/images\/workDetail_bg\.jpeg/);
  assert.match(markup, />ON</);
  assert.match(markup, />OFF</);
  assert.match(markup, />TRACK</);
  assert.match(markup, /Most recent results, career stats and photos from trackside\./);
  assert.match(markup, /Campaigns, shoots and other such promotional materials for fans/);
  assert.match(markup, /\/images\/workDetail_left_icon\.png\.png/);
  assert.match(markup, /\/images\/workDetail_rigtht_icon\.png/);
  assert.match(markup, /aria-label="Open On Track collection"/);
  assert.match(markup, /aria-label="Open Off Track collection"/);
  assert.doesNotMatch(markup, /Signal in Motion/);
  assert.doesNotMatch(markup, /Open the case/);
  assert.doesNotMatch(markup, /data-works-detail-nav="rail"/);
  assert.doesNotMatch(markup, /linear-gradient\(rgba\(0, 0, 0, 0\.18\), rgba\(0, 0, 0, 0\.28\)\)/);
  assert.doesNotMatch(markup, /radial-gradient\(circle_at_center/);
});

test('uses the approved symmetric text offsets and equalized description heights', () => {
  const markup = renderToStaticMarkup(<WorksDetailSection />);
  const minHeightMatches = markup.match(/min-h-\[3\.8rem\]/g) ?? [];

  assert.match(
    markup,
    /class="flex flex-col items-center translate-x-\[50px\] translate-y-\[6px\]"/,
  );
  assert.match(
    markup,
    /class="flex flex-col items-center translate-x-\[-50px\] translate-y-\[6px\]"/,
  );
  assert.match(
    markup,
    /Most recent results, career stats and photos from trackside\.<\/p>/,
  );
  assert.match(
    markup,
    /Campaigns, shoots and other such promotional materials for fans<\/p>/,
  );
  assert.equal(minHeightMatches.length, 2);
});
