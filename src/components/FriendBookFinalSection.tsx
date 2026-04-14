import { motion } from 'motion/react';
import { ArrowRight, MoonStar, PenLine, Search } from 'lucide-react';

import { friendBookFinalSectionData } from '../data';

const GAME_CARD_ICONS = {
  'Between Two Pages': Search,
  'Moon Run': MoonStar,
  'One Stroke Mark': PenLine,
} as const;

export default function FriendBookFinalSection() {
  return (
    <section
      id="friend-book-finale-section"
      aria-labelledby="friend-book-finale-title"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#10211d_0%,#2f3a33_18%,#d9d5ca_48%,#f3eee4_100%)] px-6 py-18 text-stone-900 sm:px-8 lg:px-12 lg:py-20"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-60 bg-[radial-gradient(circle_at_top,rgba(255,247,232,0.26),transparent_62%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[linear-gradient(180deg,transparent,rgba(255,248,238,0.3))]"
      />

      <div className="mx-auto flex max-w-7xl flex-col gap-8 lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2rem] border border-stone-200/75 bg-[rgba(247,241,231,0.94)] px-7 py-7 shadow-[0_24px_72px_rgba(17,33,29,0.14)] sm:px-9 sm:py-8 lg:px-11"
        >
          <p className="font-mono text-[0.7rem] uppercase tracking-[0.42em] text-stone-500">
            {friendBookFinalSectionData.overline}
          </p>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h2
                id="friend-book-finale-title"
                className="max-w-2xl font-serif text-4xl leading-[0.95] tracking-[-0.04em] text-stone-900 sm:text-5xl lg:text-6xl"
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
                  className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/75 px-5 py-2.5 text-sm font-medium text-stone-700 transition-colors duration-200 hover:border-stone-400 hover:text-stone-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
                >
                  <span>{ctaLink.label}</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          id="friend-book-game-grid"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-4 lg:grid-cols-3"
        >
          {friendBookFinalSectionData.gameCards.map((card) => {
            const Icon = GAME_CARD_ICONS[card.title];

            return (
              <article
                key={card.id}
                data-friend-book-game-card={card.id}
                className="rounded-[1.85rem] border border-stone-200/80 bg-[rgba(249,244,236,0.95)] p-6 shadow-[0_16px_50px_rgba(39,39,42,0.08)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e7dece] text-[#23352f]">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>
                <h3 className="mt-5 font-serif text-[2rem] leading-none tracking-[-0.03em] text-stone-900">
                  {card.title}
                </h3>
                <p className="mt-4 min-h-[4.8rem] text-sm leading-7 text-stone-600">
                  {card.description}
                </p>
                <button
                  type="button"
                  className="mt-6 inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white/70 px-4 py-2 text-sm font-medium text-stone-700"
                >
                  <span>{card.ctaLabel}</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </article>
            );
          })}
        </motion.div>

        <motion.div
          id="friend-book-preview"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-[2rem] border border-stone-200/80 bg-[rgba(248,243,236,0.95)] px-7 py-7 shadow-[0_18px_52px_rgba(31,47,42,0.08)] sm:px-8"
        >
          <div className="flex flex-col gap-2 border-b border-stone-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-[0.7rem] uppercase tracking-[0.38em] text-stone-500">
                {friendBookFinalSectionData.previewEyebrow}
              </p>
              <h3 className="mt-3 font-serif text-3xl tracking-[-0.03em] text-stone-900">
                {friendBookFinalSectionData.previewTitle}
              </h3>
            </div>
            <p className="max-w-xl text-sm leading-7 text-stone-600">
              {friendBookFinalSectionData.previewDescription}
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            {friendBookFinalSectionData.entries.map((entry) => (
              <article
                key={entry.id}
                data-friend-book-preview-item={entry.id}
                className="grid gap-3 rounded-[1.3rem] bg-white/55 px-4 py-4 sm:grid-cols-[1.1fr_auto] sm:items-start"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <h4 className="font-serif text-2xl tracking-[-0.02em] text-stone-900">
                      {entry.nickname}
                    </h4>
                    <span className="rounded-full border border-[#d7dfd7] bg-[#eff4f0] px-3 py-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#5d786c]">
                      {entry.seal}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-stone-700">
                    {entry.excerpt}
                  </p>
                  <p className="text-sm leading-7 text-stone-600">
                    {entry.note}
                  </p>
                </div>
                <p className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-stone-500 sm:pt-1 sm:text-right">
                  {entry.date}
                </p>
              </article>
            ))}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="px-1 text-center font-mono text-[0.72rem] uppercase tracking-[0.34em] text-stone-500"
        >
          {friendBookFinalSectionData.footerLine}
        </motion.p>
      </div>
    </section>
  );
}
