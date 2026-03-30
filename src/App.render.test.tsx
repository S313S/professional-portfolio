import test from 'node:test';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';

import App from './App';

test('renders works lobby and works detail after career detail in the main page flow', () => {
  const markup = renderToStaticMarkup(<App />);

  const careerDetailIndex = markup.indexOf('id="career-detail-section"');
  const worksLobbyIndex = markup.indexOf('id="works-lobby-section"');
  const worksDetailIndex = markup.indexOf('id="works-detail-section"');

  assert.notEqual(careerDetailIndex, -1);
  assert.notEqual(worksLobbyIndex, -1);
  assert.notEqual(worksDetailIndex, -1);
  assert.ok(worksLobbyIndex > careerDetailIndex);
  assert.ok(worksDetailIndex > worksLobbyIndex);
});
