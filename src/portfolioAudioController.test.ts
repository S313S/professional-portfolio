import test from 'node:test';
import assert from 'node:assert/strict';

import {
  COVER_AND_SELF_INTRO_AUDIO_SRC,
  HOMETOWN_SERIES_1_AUDIO_SRC,
  HOMETOWN_SERIES_2_AUDIO_SRC,
} from './App.logic';
import { PortfolioAudioController, type PortfolioAudioElement } from './portfolioAudioController';

class FakeAudioElement implements PortfolioAudioElement {
  currentTime = 0;
  loop = false;
  preload = '';
  pauseCalls = 0;
  playCalls = 0;

  constructor(readonly src: string) {}

  pause() {
    this.pauseCalls += 1;
  }

  async play() {
    this.playCalls += 1;
  }
}

function createController() {
  const createdAudio: FakeAudioElement[] = [];
  const controller = new PortfolioAudioController((src) => {
    const audio = new FakeAudioElement(src);
    createdAudio.push(audio);
    return audio;
  });

  return { controller, createdAudio };
}

test('loader sound switch enables the cover and self-introduction track from the beginning', () => {
  const { controller, createdAudio } = createController();

  controller.enableCoverAndSelfIntro();

  assert.equal(controller.getSoundPreference(), 'enabled');
  assert.equal(createdAudio.length, 3);
  assert.equal(createdAudio[0].src, COVER_AND_SELF_INTRO_AUDIO_SRC);
  assert.equal(createdAudio[0].loop, true);
  assert.equal(createdAudio[0].preload, 'auto');
  assert.equal(createdAudio[0].currentTime, 0);
  assert.equal(createdAudio[0].playCalls, 1);
});

test('app mount keeps loader-started audio playing without restarting it', () => {
  const { controller, createdAudio } = createController();

  controller.enableCoverAndSelfIntro();
  createdAudio[0].currentTime = 12;

  controller.startCoverAndSelfIntroForAppMount();

  assert.equal(createdAudio[0].currentTime, 12);
  assert.equal(createdAudio[0].playCalls, 2);
});

test('track change stops the cover track and starts the first hometown track from the beginning', () => {
  const { controller, createdAudio } = createController();

  controller.enableCoverAndSelfIntro();
  createdAudio[0].currentTime = 18;
  controller.requestTrackChange(HOMETOWN_SERIES_1_AUDIO_SRC);

  assert.equal(createdAudio[0].pauseCalls, 1);
  assert.equal(createdAudio[0].currentTime, 0);
  assert.equal(createdAudio[1].currentTime, 0);
  assert.equal(createdAudio[1].playCalls, 1);
});

test('track change stops the active track and starts the second hometown track from the beginning', () => {
  const { controller, createdAudio } = createController();

  controller.enableCoverAndSelfIntro();
  controller.requestTrackChange(HOMETOWN_SERIES_1_AUDIO_SRC);
  createdAudio[1].currentTime = 18;
  controller.requestTrackChange(HOMETOWN_SERIES_2_AUDIO_SRC);

  assert.equal(createdAudio[1].pauseCalls, 1);
  assert.equal(createdAudio[1].currentTime, 0);
  assert.equal(createdAudio[2].currentTime, 0);
  assert.equal(createdAudio[2].playCalls, 1);
});

test('explicitly disabled sound blocks later automatic playback attempts', () => {
  const { controller, createdAudio } = createController();

  controller.enableCoverAndSelfIntro();
  controller.disable();
  controller.startCoverAndSelfIntroForAppMount();
  controller.retryActiveTrack();

  assert.equal(controller.getSoundPreference(), 'disabled');
  assert.equal(createdAudio[0].pauseCalls, 1);
  assert.equal(createdAudio[0].playCalls, 1);
});
