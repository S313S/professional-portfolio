import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import CareerJourneySection from './CareerJourneySection';

test('renders the career journey poster content and decorative assets', () => {
  const markup = renderToStaticMarkup(<CareerJourneySection />);

  assert.match(markup, /id="career-journey-section"/);
  assert.match(markup, /CAREER JOURNEY/);
  assert.match(markup, /FROM CHANCE/);
  assert.match(markup, /TO CHOICE/);
  assert.match(markup, /I entered my first formal role with luck/);
  assert.match(markup, /\/images\/career_role\.png/);
  assert.match(markup, /\/images\/career_icon_Cross-border e-commerce\.png/);
  assert.match(markup, /\/images\/career_icon_socialMedia\.png/);
  assert.match(markup, /\/images\/career_icon_champion\.png/);
  assert.match(markup, />AIGC</);
  assert.match(markup, /data-career-block="brand"/);
  assert.match(markup, /data-career-block="content"/);
  assert.match(markup, /data-career-block="title"/);
  assert.match(markup, /data-career-block="role"/);
  assert.match(markup, /data-career-block="aigc"/);
  assert.match(markup, /data-career-card="champion"/);
  assert.match(markup, /data-career-card="commerce"/);
  assert.match(markup, /data-career-card="social"/);
  assert.match(markup, /font-family:&quot;Cormorant Garamond&quot;, serif/);
  assert.match(markup, /font-family:&quot;Manrope&quot;, ui-sans-serif, system-ui, sans-serif/);
});
