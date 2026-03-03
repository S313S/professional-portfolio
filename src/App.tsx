import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import ExperienceHero from './components/ExperienceHero';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Contact from './components/Contact';

export default function App() {
  return (
    <div className="bg-zinc-50 min-h-screen selection:bg-zinc-900 selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <About />
        <ExperienceHero />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
      </main>

      <footer className="py-8 text-center text-zinc-400 text-sm font-mono">
        <p>Designed & Built by Xiao Ci - AI Builder</p>
      </footer>
    </div>
  );
}
