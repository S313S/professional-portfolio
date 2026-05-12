import {
  COVER_AND_SELF_INTRO_AUDIO_SRC,
  HOMETOWN_SERIES_1_AUDIO_SRC,
  HOMETOWN_SERIES_2_AUDIO_SRC,
} from './App.logic';

export type PortfolioAudioPreference = 'unset' | 'enabled' | 'disabled';

export interface PortfolioAudioElement {
  currentTime: number;
  loop: boolean;
  preload: string;
  pause: () => void;
  play: () => Promise<void> | void;
}

type PortfolioAudioFactory = (src: string) => PortfolioAudioElement | null;

const SUPPORTED_AUDIO_SRCS = [
  COVER_AND_SELF_INTRO_AUDIO_SRC,
  HOMETOWN_SERIES_1_AUDIO_SRC,
  HOMETOWN_SERIES_2_AUDIO_SRC,
] as const;

function createBrowserAudio(src: string): PortfolioAudioElement | null {
  if (typeof Audio === 'undefined') {
    return null;
  }

  return new Audio(src);
}

export class PortfolioAudioController {
  private activeAudio: PortfolioAudioElement | null = null;
  private activeSrc = COVER_AND_SELF_INTRO_AUDIO_SRC;
  private audioBySrc = new Map<string, PortfolioAudioElement>();
  private initialized = false;
  private soundPreference: PortfolioAudioPreference = 'unset';

  constructor(private readonly createAudio: PortfolioAudioFactory = createBrowserAudio) {}

  getSoundPreference() {
    return this.soundPreference;
  }

  enableCoverAndSelfIntro() {
    this.soundPreference = 'enabled';
    this.switchToTrack(COVER_AND_SELF_INTRO_AUDIO_SRC, true);
  }

  disable() {
    this.soundPreference = 'disabled';

    if (!this.ensureInitialized()) {
      return;
    }

    this.audioBySrc.forEach((audio) => this.stopAudio(audio));
  }

  startCoverAndSelfIntroForAppMount() {
    if (this.soundPreference === 'disabled') {
      return;
    }

    if (this.soundPreference === 'enabled' && this.activeSrc === COVER_AND_SELF_INTRO_AUDIO_SRC) {
      this.retryActiveTrack();
      return;
    }

    this.switchToTrack(COVER_AND_SELF_INTRO_AUDIO_SRC, true);
  }

  restartCoverAndSelfIntro() {
    if (this.soundPreference === 'disabled') {
      return;
    }

    this.switchToTrack(COVER_AND_SELF_INTRO_AUDIO_SRC, true);
  }

  requestTrackChange(src: string) {
    if (
      this.soundPreference === 'disabled' ||
      (SUPPORTED_AUDIO_SRCS as readonly string[]).includes(src) === false
    ) {
      return;
    }

    this.switchToTrack(src, true);
  }

  retryActiveTrack() {
    if (this.soundPreference === 'disabled') {
      return;
    }

    if (!this.ensureInitialized()) {
      return;
    }

    this.playAudio(this.activeAudio);
  }

  private ensureInitialized() {
    if (this.initialized) {
      return true;
    }

    for (const src of SUPPORTED_AUDIO_SRCS) {
      const audio = this.createAudio(src);

      if (!audio) {
        return false;
      }

      audio.loop = true;
      audio.preload = 'auto';
      audio.currentTime = 0;
      this.audioBySrc.set(src, audio);
    }

    this.activeAudio = this.audioBySrc.get(COVER_AND_SELF_INTRO_AUDIO_SRC) ?? null;
    this.activeSrc = COVER_AND_SELF_INTRO_AUDIO_SRC;
    this.initialized = true;
    return true;
  }

  private switchToTrack(src: string, restart: boolean) {
    if (!this.ensureInitialized()) {
      return;
    }

    const nextAudio = this.audioBySrc.get(src);

    if (!nextAudio) {
      return;
    }

    if (this.activeAudio && this.activeAudio !== nextAudio) {
      this.stopAudio(this.activeAudio);
    }

    this.activeAudio = nextAudio;
    this.activeSrc = src;

    if (restart) {
      this.activeAudio.currentTime = 0;
    }

    this.playAudio(this.activeAudio);
  }

  private playAudio(audio: PortfolioAudioElement | null) {
    if (!audio) {
      return;
    }

    const playResult = audio.play();

    if (playResult && 'catch' in playResult) {
      void playResult.catch(() => {
        // Browsers may require the first user gesture before unmuted audio can play.
      });
    }
  }

  private stopAudio(audio: PortfolioAudioElement) {
    audio.pause();
    audio.currentTime = 0;
  }
}

export const portfolioAudioController = new PortfolioAudioController();
