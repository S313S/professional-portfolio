import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import ExperienceHero from './components/ExperienceHero';
import VideoScrollTransition from './components/VideoScrollTransition';

export default function App() {
  return (
    <div className="bg-zinc-50 min-h-screen selection:bg-zinc-900 selection:text-white overflow-x-hidden font-sans">
      <Navbar />
      <main>
        <Hero />
        <About />
        <ExperienceHero />
        <VideoScrollTransition />
      </main>

      <footer className="py-8 text-center text-zinc-400 text-sm font-mono relative z-50">
        <p>Designed & Built by {new Date().getFullYear()} Xiao Ci - AI Builder</p>
      </footer>
    </div>
  );
}
