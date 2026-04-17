import type { ReactNode } from 'react';
import { BookOpenText } from 'lucide-react';

import type { FriendBookFinalGameCard } from '../data';
import type { FriendBookStage } from './FriendBookFinalSection.logic';

function getCssUrlValue(imageUrl: string) {
  return `url("${encodeURI(imageUrl)}")`;
}

function getPaperBackgroundStyle(imageUrl: string) {
  return {
    backgroundImage: `linear-gradient(rgba(255, 249, 241, 0.94), rgba(255, 248, 240, 0.92)), ${getCssUrlValue(imageUrl)}`,
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
  } as const;
}

export interface FriendBookGameOverlayProps {
  activeGame: FriendBookFinalGameCard;
  stage: Exclude<FriendBookStage, 'landing' | 'note-entry'>;
  prompt: string;
  progressLabel?: string | null;
  children: ReactNode;
  onClose?: () => void;
}

export default function FriendBookGameOverlay({
  activeGame,
  stage,
  prompt,
  progressLabel,
  children,
  onClose,
}: FriendBookGameOverlayProps) {
  return (
    <section
      data-friend-book-game-overlay="true"
      data-friend-book-overlay-game={activeGame.id}
      data-friend-book-overlay-stage={stage}
      className="fixed inset-0 z-50 overflow-y-auto bg-[rgba(39,24,18,0.56)] px-4 py-5 backdrop-blur-[2px] sm:px-6 sm:py-6"
    >
      <div className="mx-auto flex min-h-full max-w-[1180px] items-center">
        <div className="w-full rounded-[2rem] bg-[#5a4032] p-[6px] shadow-[0_30px_80px_rgba(40,24,18,0.28)]">
          <div
            className="rounded-[1.7rem] border border-[rgba(117,86,64,0.12)] px-5 py-5 sm:px-7 sm:py-7"
            style={getPaperBackgroundStyle(activeGame.backgroundImage)}
          >
            <div className="flex flex-col gap-3 border-b border-[rgba(117,86,64,0.16)] pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-[0.72rem] uppercase tracking-[0.3em] text-[#6a5040]">
                  Friend Book / Play
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h3 className="font-serif text-[clamp(2rem,4vw,3rem)] leading-[0.95] tracking-[-0.045em] text-[#2c2220]">
                    {activeGame.title}
                  </h3>
                  {progressLabel ? (
                    <span className="rounded-full border border-[rgba(122,93,77,0.22)] bg-[rgba(255,248,241,0.9)] px-3 py-1 text-[0.74rem] font-medium uppercase tracking-[0.24em] text-[#6f5243]">
                      {progressLabel}
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 max-w-[42rem] text-[0.98rem] leading-7 text-[#4c3b32]">
                  {prompt}
                </p>
              </div>

              {onClose ? (
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 self-start rounded-full border border-[#8f715c] bg-[rgba(255,248,240,0.82)] px-4 py-2 text-sm text-[#4b392f]"
                >
                  <BookOpenText className="h-4 w-4" strokeWidth={1.8} />
                  <span>Back to landing</span>
                </button>
              ) : null}
            </div>

            <div className="mt-5">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
