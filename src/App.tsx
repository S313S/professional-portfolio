import { useEffect } from 'react';

import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import ExperienceHero from './components/ExperienceHero';
import GrowPathScrollSection from './components/GrowPathScrollSection';
import VideoScrollTransition from './components/VideoScrollTransition';
import CareerJourneySection from './components/CareerJourneySection';
import CareerDetailSection from './components/CareerDetailSection';
import WorksDetailSection from './components/WorksDetailSection';
import WorksLobbySection from './components/WorksLobbySection';
import FriendBookFinalSection from './components/FriendBookFinalSection';
import {
  getInitialFocusTarget,
  getPortfolioAudioPlaybackIntent,
  PORTFOLIO_AUDIO_TRACK_CHANGE_EVENT,
  type PortfolioAudioTrackChangeDetail,
} from './App.logic';
import { portfolioAudioController } from './portfolioAudioController';
import { isScrollMomentumLocked } from './scrollMomentumLock';

export default function App() {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    let previousScrollY = window.scrollY;

    const handleHomeReturn = () => {
      const nextScrollY = window.scrollY;
      const playbackIntent = getPortfolioAudioPlaybackIntent({
        previousScrollY,
        nextScrollY,
      });

      previousScrollY = nextScrollY;

      if (playbackIntent === 'restart') {
        portfolioAudioController.restartSeries1();
      }
    };

    const handleFirstUserGesture = () => {
      portfolioAudioController.retryActiveTrack();
    };

    const handleAudioTrackChange = (event: Event) => {
      const { src } = (event as CustomEvent<PortfolioAudioTrackChangeDetail>).detail ?? {};
      portfolioAudioController.requestTrackChange(src);
    };

    portfolioAudioController.startSeries1ForAppMount();

    window.addEventListener('scroll', handleHomeReturn, { passive: true });
    window.addEventListener(PORTFOLIO_AUDIO_TRACK_CHANGE_EVENT, handleAudioTrackChange);
    window.addEventListener('pointerdown', handleFirstUserGesture, { once: true });
    window.addEventListener('keydown', handleFirstUserGesture, { once: true });
    window.addEventListener('touchstart', handleFirstUserGesture, { once: true });

    return () => {
      window.removeEventListener('scroll', handleHomeReturn);
      window.removeEventListener(PORTFOLIO_AUDIO_TRACK_CHANGE_EVENT, handleAudioTrackChange);
      window.removeEventListener('pointerdown', handleFirstUserGesture);
      window.removeEventListener('keydown', handleFirstUserGesture);
      window.removeEventListener('touchstart', handleFirstUserGesture);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const focusTarget = getInitialFocusTarget(window.location.search);

    if (!focusTarget) {
      return undefined;
    }

    const scrollToFocusTarget = () => {
      document.getElementById(focusTarget)?.scrollIntoView({
        behavior: 'auto',
        block: 'start',
      });
    };

    scrollToFocusTarget();
    requestAnimationFrame(scrollToFocusTarget);
    window.addEventListener('load', scrollToFocusTarget, { once: true });

    return () => {
      window.removeEventListener('load', scrollToFocusTarget);
    };
  }, []);

  useEffect(() => {
    const handleWheelCapture = (event: WheelEvent) => {
      if (!isScrollMomentumLocked()) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    };

    window.addEventListener('wheel', handleWheelCapture, { passive: false, capture: true });

    return () => {
      window.removeEventListener('wheel', handleWheelCapture, { capture: true });
    };
  }, []);

  return (
    <div className="bg-zinc-50 min-h-screen selection:bg-zinc-900 selection:text-white overflow-x-hidden font-sans">
      <Navbar />
      <main>
        <Hero />
        <About />
        <ExperienceHero />
        <VideoScrollTransition />
        <GrowPathScrollSection />
        <CareerJourneySection />
        <CareerDetailSection />
        <WorksLobbySection />
        <WorksDetailSection />
        <FriendBookFinalSection />
      </main>
    </div>
  );
}
