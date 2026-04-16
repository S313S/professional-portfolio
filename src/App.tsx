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
import { getInitialFocusTarget } from './App.logic';

export default function App() {
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
