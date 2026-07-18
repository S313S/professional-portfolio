import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Menu, X } from 'lucide-react';

import { shouldHideNavbar } from './Navbar.logic';
import { VIDEO_SCROLL_TRANSITION_SECTION_ID } from './VideoScrollTransition.logic';
import { trackAnalyticsEvent } from '../analytics';

const TOP_SECTION_IDS = ['home', 'about'] as const;

const IMMERSIVE_SECTION_IDS = [
  'experience',
  VIDEO_SCROLL_TRANSITION_SECTION_ID,
  'career-journey-section',
  'career-detail-section',
  'works-lobby-section',
  'works-detail-section',
] as const;

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);
  const previousScrollYRef = useRef(0);

  useEffect(() => {
    const syncNavbarVisibility = () => {
      const topSectionRects = TOP_SECTION_IDS.map((sectionId) =>
        document.getElementById(sectionId)?.getBoundingClientRect(),
      ).filter((sectionRect): sectionRect is DOMRect => Boolean(sectionRect));
      const immersiveSectionRects = IMMERSIVE_SECTION_IDS.map((sectionId) =>
        document.getElementById(sectionId)?.getBoundingClientRect(),
      ).filter((sectionRect): sectionRect is DOMRect => Boolean(sectionRect));
      const latestScrollY = window.scrollY;

      setShouldHide(
        shouldHideNavbar({
          latestScrollY,
          previousScrollY: previousScrollYRef.current,
          isOpen,
          topSectionRects,
          immersiveSectionRects,
          viewportHeight: window.innerHeight,
        }),
      );

      previousScrollYRef.current = latestScrollY;
    };

    let rafId = 0;
    let secondRafId = 0;
    let timeoutId = 0;

    const scheduleNavbarSync = () => {
      syncNavbarVisibility();

      rafId = window.requestAnimationFrame(() => {
        syncNavbarVisibility();
        secondRafId = window.requestAnimationFrame(syncNavbarVisibility);
      });

      timeoutId = window.setTimeout(syncNavbarVisibility, 160);
    };

    previousScrollYRef.current = window.scrollY;
    scheduleNavbarSync();
    window.addEventListener('scroll', syncNavbarVisibility, { passive: true });
    window.addEventListener('resize', syncNavbarVisibility);
    window.addEventListener('load', scheduleNavbarSync);
    window.addEventListener('pageshow', scheduleNavbarSync);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.cancelAnimationFrame(secondRafId);
      window.clearTimeout(timeoutId);
      window.removeEventListener('scroll', syncNavbarVisibility);
      window.removeEventListener('resize', syncNavbarVisibility);
      window.removeEventListener('load', scheduleNavbarSync);
      window.removeEventListener('pageshow', scheduleNavbarSync);
    };
  }, [isOpen]);

  const navLinks = [
    { name: "About", href: "#home" },
    { name: "Experience", href: "#experience" },
    { name: "Projects", href: "#projects" },
    { name: "Skills", href: "#skills" },
    { name: "Contact", href: "#contact" },
  ];

  const trackNavClick = (targetId: string, label: string) => {
    trackAnalyticsEvent('nav_click', {
      targetId,
      metadata: { label },
    });
  };

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={shouldHide ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <a
          href="#"
          className="text-xl font-bold tracking-tighter font-mono"
          onClick={() => trackNavClick('brand-home', 'Xiao Ci')}
        >
          Xiao Ci<span className="text-zinc-400">.</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link, i) => (
            <a 
              key={i} 
              href={link.href} 
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              onClick={() => trackNavClick(link.href, link.name)}
            >
              <span className="font-mono text-zinc-400 mr-1">0{i + 1}.</span> {link.name}
            </a>
          ))}
          <a 
            href="/resume.pdf" 
            className="px-4 py-2 border border-zinc-900 rounded text-sm font-medium hover:bg-zinc-50 transition-colors"
            onClick={() => trackAnalyticsEvent('resume_click', { targetId: 'desktop-resume' })}
          >
            Resume
          </a>
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-zinc-900"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-zinc-100 p-6 flex flex-col gap-6 shadow-xl">
          {navLinks.map((link, i) => (
            <a 
              key={i} 
              href={link.href} 
              className="text-lg font-medium text-zinc-600"
              onClick={() => {
                trackNavClick(link.href, link.name);
                setIsOpen(false);
              }}
            >
              <span className="font-mono text-zinc-400 mr-2">0{i + 1}.</span> {link.name}
            </a>
          ))}
          <a 
            href="/resume.pdf" 
            className="px-4 py-3 border border-zinc-900 rounded text-center font-medium"
            onClick={() => trackAnalyticsEvent('resume_click', { targetId: 'mobile-resume' })}
          >
            Resume
          </a>
        </div>
      )}
    </motion.nav>
  );
}
