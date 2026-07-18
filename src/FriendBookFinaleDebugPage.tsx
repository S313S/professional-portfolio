import FriendBookFinalSection from './components/FriendBookFinalSection';
import {
  createDefaultFriendBookProgress,
  type FriendBookGameId,
  type FriendBookStage,
  upsertFriendBookGuestbookEntry,
} from './components/FriendBookFinalSection.logic';

function createDebugGuestbookProgress() {
  let progress = createDefaultFriendBookProgress();

  for (const entry of [
    {
      nickname: '林间拾页人',
      identityIntro: '一个偏爱慢节奏产品的界面观察者，常常先记住气味和纸感。',
      portfolioReview: 'Between Two Pages 的双页对照很克制，像把细节藏进了呼吸里。',
      latestGameId: 'between-two-pages' as const,
      avatarId: 'cat' as const,
      medalId: '/images/PurpleMedal01.png',
      displayDate: 'APR 17, 2026',
      updatedAt: '2026-04-17T10:00:00.000Z',
    },
    {
      nickname: '夜航漫游者',
      identityIntro: '一个总在深夜上线的人，喜欢会自己留白的作品。',
      portfolioReview: 'Moon Run 的节奏比我预想得轻，像在作品之间偷偷跑了一段夜路。',
      latestGameId: 'moon-run' as const,
      avatarId: 'dog' as const,
      medalId: '/images/GreenMedal01.png',
      displayDate: 'APR 17, 2026',
      updatedAt: '2026-04-17T10:10:00.000Z',
    },
    {
      nickname: '纸边侦探',
      identityIntro: '一个喜欢从边角料里读人设的普通访客，习惯先看影子再看答案。',
      portfolioReview: 'Who’s This? 这张卡最有记忆点，猜人物的时候会顺手把整个作品区再看一遍。',
      latestGameId: 'one-stroke-mark' as const,
      avatarId: 'rabbit' as const,
      medalId: '/images/Animalmedals04.png',
      displayDate: 'APR 17, 2026',
      updatedAt: '2026-04-17T10:20:00.000Z',
    },
    {
      nickname: '站台风景员',
      identityIntro: '一个会为了转场多停两秒的人，也会认真看每一段说明文字。',
      portfolioReview: '第二次翻回来时，发现 friend book 把作品区的气质也一起收进来了。',
      latestGameId: 'between-two-pages' as const,
      avatarId: 'tree' as const,
      medalId: '/images/PurpleMedal02.png',
      displayDate: 'APR 17, 2026',
      updatedAt: '2026-04-17T10:30:00.000Z',
    },
    {
      nickname: '月背收集者',
      identityIntro: '一个对小机制很宽容、但对整体氛围很挑剔的深夜访客。',
      portfolioReview: '我喜欢这里不是把内容堆出来，而是让每个作品像被认真摆在台面上。',
      latestGameId: 'moon-run' as const,
      avatarId: 'cat-pi' as const,
      medalId: '/images/GreenMedal03.png',
      displayDate: 'APR 17, 2026',
      updatedAt: '2026-04-17T10:40:00.000Z',
    },
  ]) {
    progress = upsertFriendBookGuestbookEntry(progress, entry);
  }

  return progress;
}

const friendBookDebugProgress = createDebugGuestbookProgress();

interface FriendBookFinaleDebugPageProps {
  initialStage?: FriendBookStage;
  initialActiveGameId?: FriendBookGameId | null;
}

export default function FriendBookFinaleDebugPage({
  initialStage,
  initialActiveGameId,
}: FriendBookFinaleDebugPageProps = {}) {
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
        <FriendBookFinalSection
          initialProgress={friendBookDebugProgress}
          initialStage={initialStage}
          initialActiveGameId={initialActiveGameId}
        />
      </main>
    </div>
  );
}
