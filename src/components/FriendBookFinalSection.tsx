import { motion } from 'motion/react';
import { ArrowRight, BookOpen, Gamepad2, LibraryBig, PenSquare } from 'lucide-react';

import { friendBookFinalSectionData } from '../data';

const PILLAR_ICONS = {
  Works: BookOpen,
  Play: Gamepad2,
  'Leave a Name': PenSquare,
  'Friend Book': LibraryBig,
} as const;

export default function FriendBookFinalSection() {
  return (
    <section
      id="friend-book-finale-section"
      aria-labelledby="friend-book-finale-title"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#11211d_0%,#172b25_18%,#efe5d2_52%,#f7f1e6_100%)] px-6 py-24 text-stone-900 sm:px-8 lg:px-12"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,245,226,0.34),transparent_64%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[-6rem] top-[16rem] h-56 w-56 rounded-full bg-[rgba(99,129,109,0.16)] blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-20 right-[-5rem] h-64 w-64 rounded-full bg-[rgba(182,141,98,0.14)] blur-3xl"
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] border border-stone-200/70 bg-[rgba(247,241,230,0.92)] px-6 py-8 shadow-[0_32px_90px_rgba(17,33,29,0.16)] sm:px-8 lg:px-12 lg:py-12"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.42),transparent_48%,rgba(109,139,120,0.08)_100%)]"
          />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="font-mono text-xs uppercase tracking-[0.38em] text-stone-500">
                {friendBookFinalSectionData.overline}
              </p>
              <h2
                id="friend-book-finale-title"
                className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-stone-900 sm:text-5xl lg:text-6xl"
              >
                {friendBookFinalSectionData.title}
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-600 sm:text-lg">
                {friendBookFinalSectionData.description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {friendBookFinalSectionData.ctaLinks.map((ctaLink) => (
                <a
                  key={ctaLink.id}
                  href={ctaLink.href}
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300/90 bg-white/70 px-4 py-2.5 text-sm font-medium text-stone-700 transition-transform duration-200 hover:-translate-y-0.5 hover:border-stone-400 hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
                >
                  <span>{ctaLink.label}</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          id="friend-book-pillars"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-4"
        >
          {friendBookFinalSectionData.pillars.map((pillar) => {
            const Icon = PILLAR_ICONS[pillar.title];

            return (
              <article
                key={pillar.id}
                className="group relative overflow-hidden rounded-[1.75rem] border border-stone-200/80 bg-[rgba(251,246,238,0.94)] p-6 shadow-[0_18px_48px_rgba(39,39,42,0.08)] transition-transform duration-200 hover:-translate-y-1"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.4),transparent_35%,rgba(24,39,34,0.03)_100%)] opacity-80"
                />
                <div className="relative flex h-full flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e6ddce] text-[#24352f]">
                      <Icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                    <span className="rounded-full border border-[#cdbca0] bg-[#f5ecdd] px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.3em] text-[#8f6b3b]">
                      {pillar.status}
                    </span>
                  </div>
                  <h3 className="mt-6 font-serif text-2xl text-stone-900">
                    {pillar.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    {pillar.description}
                  </p>
                </div>
              </article>
            );
          })}
        </motion.div>

        <motion.div
          id="leave-name-band"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-[2rem] border border-[#d8c8ae] bg-[linear-gradient(120deg,rgba(248,239,224,0.96),rgba(241,232,216,0.9))] px-6 py-8 shadow-[0_20px_55px_rgba(74,62,47,0.08)] sm:px-8 lg:px-10"
        >
          <div
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1.5 bg-[linear-gradient(180deg,#9b7750,#557464)]"
          />
          <p className="pl-4 font-mono text-xs uppercase tracking-[0.34em] text-[#7c6142]">
            Leave a name
          </p>
          <p className="mt-3 max-w-4xl pl-4 font-serif text-3xl leading-tight text-[#1f2f2a] sm:text-4xl">
            {friendBookFinalSectionData.thesis}
          </p>
          <p className="mt-4 max-w-3xl pl-4 text-base leading-8 text-[#5e564a]">
            {friendBookFinalSectionData.thesisDescription}
          </p>
        </motion.div>

        <motion.div
          id="friend-book-preview"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-5 lg:grid-cols-3"
        >
          {friendBookFinalSectionData.entries.map((entry) => (
            <article
              key={entry.id}
              className="relative overflow-hidden rounded-[1.9rem] border border-stone-200/80 bg-[rgba(250,245,237,0.96)] p-6 shadow-[0_18px_52px_rgba(31,47,42,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[0.68rem] uppercase tracking-[0.3em] text-stone-500">
                    {entry.source}
                  </p>
                  <h3 className="mt-3 font-serif text-2xl text-stone-900">
                    {entry.nickname}
                  </h3>
                </div>
                <span className="rounded-full border border-[#cad8d0] bg-[#edf3ef] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#557464]">
                  {entry.seal}
                </span>
              </div>

              <p className="mt-5 text-base leading-8 text-stone-700">
                “{entry.resonance}”
              </p>

              <div className="mt-6 rounded-[1.4rem] bg-white/65 px-4 py-4 text-sm leading-7 text-stone-600">
                {entry.blessing}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-dashed border-stone-300 pt-4 text-xs uppercase tracking-[0.28em] text-stone-500">
                <span>Friend Book preview</span>
                <span>{entry.date}</span>
              </div>
            </article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
