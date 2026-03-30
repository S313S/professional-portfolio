import test from 'node:test';
import assert from 'node:assert/strict';

import {
  WORKS_LOBBY_CTA_HINT_DELAY_MS,
  shouldHideWorksLobbyHint,
  shouldScheduleWorksLobbyHint,
} from './WorksLobbySection.hint.ts';

test('schedules the delayed CTA hint only while the works lobby is holding and clickable', () => {
  assert.equal(shouldScheduleWorksLobbyHint('holding', true, false), true);
  assert.equal(shouldScheduleWorksLobbyHint('holding', true, true), false);
  assert.equal(shouldScheduleWorksLobbyHint('holding', false, false), false);
  assert.equal(shouldScheduleWorksLobbyHint('revealing', true, false), false);
  assert.equal(shouldScheduleWorksLobbyHint('navigating', true, false), false);
});

test('hides the delayed CTA hint outside the holding phase and uses a 5 second delay', () => {
  assert.equal(shouldHideWorksLobbyHint('holding'), false);
  assert.equal(shouldHideWorksLobbyHint('revealing'), true);
  assert.equal(shouldHideWorksLobbyHint('navigating'), true);
  assert.equal(WORKS_LOBBY_CTA_HINT_DELAY_MS, 5000);
});
