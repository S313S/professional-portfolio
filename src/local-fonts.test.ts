import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('uses bundled local fonts instead of remote Google Fonts imports', () => {
  const cssSource = readFileSync(new URL('./index.css', import.meta.url), 'utf8');
  const careerJourneySource = readFileSync(
    new URL('./components/CareerJourneySection.tsx', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(cssSource, /fonts\.googleapis\.com/);
  assert.ok(cssSource.includes('font-family: "Inter";'));
  assert.ok(cssSource.includes('url("/fonts/Inter/Inter-VariableFont_opsz,wght.ttf")'));
  assert.ok(cssSource.includes('font-weight: 300;'));
  assert.ok(cssSource.includes('font-weight: 700;'));
  assert.ok(cssSource.includes('url("/fonts/Playfair_Display/PlayfairDisplay-Italic-VariableFont_wght.ttf")'));
  assert.ok(cssSource.includes('url("/fonts/Playfair_Display/PlayfairDisplay-VariableFont_wght.ttf")'));
  assert.ok(cssSource.includes('url("/fonts/Cormorant_Garamond/CormorantGaramond-VariableFont_wght.ttf")'));
  assert.ok(cssSource.includes('url("/fonts/Caveat/Caveat-VariableFont_wght.ttf")'));
  assert.ok(cssSource.includes('url("/fonts/Dancing_Script/DancingScript-VariableFont_wght.ttf")'));
  assert.ok(cssSource.includes('url("/fonts/JetBrains_Mono/JetBrainsMono-VariableFont_wght.ttf")'));
  assert.match(cssSource, /font-family:\s*"Great Vibes";[\s\S]*\/fonts\/Great_Vibes\/GreatVibes-Regular\.ttf/);
  assert.match(cssSource, /font-family:\s*"Pacifico";[\s\S]*\/fonts\/Pacifico\/Pacifico-Regular\.ttf/);
  assert.ok(cssSource.includes('url("/fonts/Manrope/static/Manrope-Regular.ttf")'));
  assert.ok(cssSource.includes('url("/fonts/Manrope/static/Manrope-SemiBold.ttf")'));
  assert.ok(cssSource.includes('url("/fonts/Manrope/static/Manrope-ExtraBold.ttf")'));
  assert.match(careerJourneySource, /"Manrope", sans-serif/);
});
