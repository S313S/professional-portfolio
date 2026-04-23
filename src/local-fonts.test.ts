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
  assert.match(cssSource, /font-family:\s*"Inter";[\s\S]*\/fonts\/Inter\/Inter-VariableFont_opsz,wght\.ttf/);
  assert.match(
    cssSource,
    /font-family:\s*"Playfair Display";[\s\S]*\/fonts\/Playfair_Display\/PlayfairDisplay-VariableFont_wght\.ttf/,
  );
  assert.match(
    cssSource,
    /font-family:\s*"Cormorant Garamond";[\s\S]*\/fonts\/Cormorant_Garamond\/CormorantGaramond-VariableFont_wght\.ttf/,
  );
  assert.match(cssSource, /font-family:\s*"Caveat";[\s\S]*\/fonts\/Caveat\/Caveat-VariableFont_wght\.ttf/);
  assert.match(
    cssSource,
    /font-family:\s*"Dancing Script";[\s\S]*\/fonts\/Dancing_Script\/DancingScript-VariableFont_wght\.ttf/,
  );
  assert.match(
    cssSource,
    /font-family:\s*"JetBrains Mono";[\s\S]*\/fonts\/JetBrains_Mono\/JetBrainsMono-VariableFont_wght\.ttf/,
  );
  assert.match(cssSource, /font-family:\s*"Great Vibes";[\s\S]*\/fonts\/Great_Vibes\/GreatVibes-Regular\.ttf/);
  assert.match(cssSource, /font-family:\s*"Pacifico";[\s\S]*\/fonts\/Pacifico\/Pacifico-Regular\.ttf/);
  assert.match(cssSource, /font-family:\s*"Manrope";[\s\S]*\/fonts\/Manrope\/Manrope-VariableFont_wght\.ttf/);
  assert.match(careerJourneySource, /"Manrope", ui-sans-serif, system-ui, sans-serif/);
});
