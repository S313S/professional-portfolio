import FriendBookFinalSection from './components/FriendBookFinalSection';

export default function FriendBookFinaleDebugPage() {
  return (
    <div className="min-h-screen bg-[#f8f2e8] text-stone-900">
      <header className="sticky top-0 z-20 border-b border-[#d9c6af] bg-[rgba(252,247,239,0.96)] px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-1">
          <p className="font-mono text-[0.72rem] uppercase tracking-[0.24em] text-[#7a5d4d]">
            Dev Only Standalone Preview
          </p>
          <h1 className="font-serif text-[1.7rem] leading-none text-[#2f2120]">
            Friend Book Finale Debug
          </h1>
          <p className="text-sm leading-6 text-[#5b473d]">
            Edit <code>FRIEND_BOOK_BUTTON_POSITIONING</code> in{' '}
            <code>src/components/FriendBookFinalSection.tsx</code>, then refresh this page to
            inspect the final layout directly.
          </p>
        </div>
      </header>

      <main>
        <FriendBookFinalSection />
      </main>
    </div>
  );
}
