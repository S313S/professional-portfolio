import {
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
  private activeSrc = HOMETOWN_SERIES_1_AUDIO_SRC;
  private audioBySrc = new Map<string, PortfolioAudioElement>();
  private initialized = false;
  private soundPreference: PortfolioAudioPreference = 'unset';

  constructor(private readonly createAudio: PortfolioAudioFactory = createBrowserAudio) {}

  getSoundPreference() {
    return this.soundPreference;
  }

  enableSeries1() {
    this.soundPreference = 'enabled';
    this.switchToTrack(HOMETOWN_SERIES_1_AUDIO_SRC, true);
  }

  disable() {
    this.soundPreference = 'disabled';

    if (!this.ensureInitialized()) {
      return;
    }

    this.audioBySrc.forEach((audio) => this.stopAudio(audio));
  }

  startSeries1ForAppMount() {
    if (this.soundPreference === 'disabled') {
      return;
    }

    if (this.soundPreference === 'enabled' && this.activeSrc === HOMETOWN_SERIES_1_AUDIO_SRC) {
      this.retryActiveTrack();
      return;
    }

    this.switchToTrack(HOMETOWN_SERIES_1_AUDIO_SRC, true);
  }

  restartSeries1() {
    if (this.soundPreference === 'disabled') {
      return;
    }

    this.switchToTrack(HOMETOWN_SERIES_1_AUDIO_SRC, true);
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

    this.activeAudio = this.audioBySrc.get(HOMETOWN_SERIES_1_AUDIO_SRC) ?? null;
    this.activeSrc = HOMETOWN_SERIES_1_AUDIO_SRC;
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
