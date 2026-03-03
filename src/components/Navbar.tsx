import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'motion/react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() ?? 0;
    if (latest > previous && latest > 150 && !isOpen) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  });

  const navLinks = [
    { name: "About", href: "#home" },
    { name: "Experience", href: "#experience" },
    { name: "Projects", href: "#projects" },
    { name: "Skills", href: "#skills" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <motion.nav
      variants={{
        visible: { y: 0 },
        hidden: { y: "-100%" },
      }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-100"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <a href="#" className="text-xl font-bold tracking-tighter font-mono">
          Xiao Ci<span className="text-zinc-400">.</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link, i) => (
            <a 
              key={i} 
              href={link.href} 
              className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              <span className="font-mono text-zinc-400 mr-1">0{i + 1}.</span> {link.name}
            </a>
          ))}
          <a 
            href="/resume.pdf" 
            className="px-4 py-2 border border-zinc-900 rounded text-sm font-medium hover:bg-zinc-50 transition-colors"
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
              onClick={() => setIsOpen(false)}
            >
              <span className="font-mono text-zinc-400 mr-2">0{i + 1}.</span> {link.name}
            </a>
          ))}
          <a 
            href="/resume.pdf" 
            className="px-4 py-3 border border-zinc-900 rounded text-center font-medium"
          >
            Resume
          </a>
        </div>
      )}
    </motion.nav>
  );
}
