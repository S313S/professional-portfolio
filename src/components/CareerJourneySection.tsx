import { useEffect, useRef, useState } from 'react';

const CAREER_TITLE_LINES = ['FROM CHANCE', 'TO CHOICE'] as const;
const CAREER_BODY =
  'I entered my first formal role with luck, reached the AI wave at a major turning point, then learned the hard way that leaving the spotlight did not guarantee clarity. Through setbacks, misjudgments, and difficult transitions, I kept building, sharpening my work, my communication, and my sense of direction.';

const CAREER_ASSETS = {
  background: '/images/career_bg.png',
  role: '/images/career_role.png',
  commerceIcon: '/images/career_icon_Cross-border e-commerce.png',
  socialMediaIcon: '/images/career_icon_socialMedia.png',
  championCard: '/images/career_icon_champion.png',
} as const;

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

type DecorativeLayout = {
  position: {
    base: string;
    sm?: string;
    lg?: string;
    xl?: string;
  };
  width: {
    base: string;
    sm?: string;
    lg?: string;
    xl?: string;
  };
  motionClassName: string;
};

const joinClasses = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ');

/* 这三组配置专门给装饰元素调位置用。
   调整规则：
   - 手机优先改 base / sm
   - 桌面优先改 lg / xl
   - 想左右移动就改 left/right
   - 想上下移动就改 top/bottom
   - 想改大小只改 width */
const DECORATIVE_LAYOUTS: Record<'championCard' | 'commerceIcon' | 'socialMediaIcon', DecorativeLayout> = {
  championCard: {
    /* 冠军卡：贴在右上视觉区。
       现在桌面主要由 lg/right + lg/top 控制。 */
    position: {
      base: 'right-[40%] top-[20%]',
      sm: 'sm:right-[8%] sm:top-[41%]',
      lg: 'lg:right-[3%] lg:top-[2%]',
      xl: 'xl:right-[-2%]',
    },
    width: {
      base: 'w-[9rem]',
      sm: 'sm:w-[10.5rem]',
      lg: 'lg:w-[clamp(10rem,12vw,14.5rem)]',
    },
    motionClassName: 'career-journey-float-champion',
  },
  commerceIcon: {
    /* 地球图标：放在左侧文案区下方。
       现在桌面主要由 lg/left + lg/bottom 控制。
       xl值越小越靠左，xl越到越靠右 */
    position: {
      base: 'bottom-[9%] left-[4%]',
      sm: 'sm:bottom-[8%] sm:left-[6%]',
      lg: 'lg:bottom-[-8%] lg:left-[7%]',
      xl: 'xl:left-[3%]',
    },
    width: {
      base: 'w-[6rem]',
      sm: 'sm:w-[7rem]',
      lg: 'lg:w-[clamp(7rem,8vw,9rem)]',
    },
    motionClassName: 'career-journey-float-slow',
  },
  socialMediaIcon: {
    /* 社媒卡：压在人物图左下附近。
       现在桌面主要由 lg/right + lg/bottom 控制。 */
    position: {
      base: 'bottom-[18%] right-[4%]',
      sm: 'sm:bottom-[16%] sm:right-[8%]',
      lg: 'lg:bottom-[10%] lg:right-[16.5%]',
      xl: 'xl:right-[48%]',
    },
    width: {
      base: 'w-[7.4rem]',
      sm: 'sm:w-[8.4rem]',
      lg: 'lg:w-[clamp(8.5rem,10.8vw,12.2rem)]',
    },
    motionClassName: 'career-journey-float-fast',
  },
};

export default function CareerJourneySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(reducedMotionQuery);
    const syncPreference = () => setPrefersReducedMotion(mediaQuery.matches);

    syncPreference();
    mediaQuery.addEventListener('change', syncPreference);

    return () => mediaQuery.removeEventListener('change', syncPreference);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }

    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        setIsVisible(true);
        observer.disconnect();
      },
      {
        threshold: 0.28,
      },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const revealClassName = isVisible
    ? 'translate-y-0 opacity-100'
    : 'translate-y-8 opacity-0';
  const roleRevealClassName = isVisible
    ? 'translate-y-0 opacity-100 md:translate-y-0'
    : 'translate-y-10 opacity-0 md:translate-y-8';

  return (
    <section
      ref={sectionRef}
      aria-labelledby="career-journey-title"
      className="relative isolate min-h-[100dvh] overflow-hidden bg-[#f6eee1] text-[#2b2018]"
    >
      <div className="absolute inset-0">
        <img
          src={CAREER_ASSETS.background}
          alt=""
          aria-hidden="true"
          className="h-full w-full object-cover object-center opacity-95"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_34%,rgba(255,252,246,0.92),rgba(248,239,228,0.64)_38%,rgba(240,225,207,0.18)_58%,rgba(234,220,202,0.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(246,238,225,0.82)_0%,rgba(246,238,225,0.42)_42%,rgba(246,238,225,0.06)_68%,rgba(246,238,225,0.18)_100%)]" />
        <div className="absolute left-[52%] top-[8%] h-[38vw] w-[38vw] rounded-full bg-[#f58a54]/20 blur-3xl md:bg-[#f58a54]/28" />
        <div className="absolute right-[-8%] top-[14%] h-[24vw] w-[24vw] rounded-full bg-[#e5b486]/18 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_58%,rgba(76,48,27,0.12)_100%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1600px] flex-col px-5 pb-10 pt-6 sm:px-8 md:px-10 lg:px-12 xl:px-16">
        <header
          className={`relative z-20 max-w-fit transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealClassName}`}
        >
          <p className="font-serif text-[2rem] font-semibold uppercase tracking-[-0.05em] text-[#1d1511] sm:text-[2.4rem] lg:text-[2.8rem]">
            XIAOCI
          </p>
          <p className="-mt-2 text-base font-semibold tracking-[-0.03em] text-[#1f1713] sm:text-[1.35rem]">
            Career Journey
          </p>
        </header>

        <div className="relative z-10 flex flex-1 flex-col justify-between gap-10 pt-8 md:pt-10 lg:block lg:pt-0">
          <div
            className={`relative z-20 max-w-[34rem] transition-all delay-100 duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:pt-10 lg:absolute lg:left-[5%] lg:top-[17%] lg:w-[39%] lg:max-w-[38rem] xl:left-[6%] xl:top-[18%] xl:w-[37%] ${revealClassName}`}
          >
            <div className="mb-5 flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#2e241d] sm:text-[0.85rem]">
              <span aria-hidden="true" className="text-[1rem] leading-none">
                ↗
              </span>
              <span>CAREER JOURNEY</span>
            </div>

            <h2
              id="career-journey-title"
              className="max-w-[12ch] font-sans text-[3.6rem] leading-[0.88] font-black tracking-[-0.08em] text-[#31251d] sm:text-[4.6rem] md:text-[5.3rem] lg:text-[clamp(4.8rem,6vw,7rem)]"
            >
              {CAREER_TITLE_LINES.map((line) => (
                <span key={line} className="block whitespace-nowrap">
                  {line}
                </span>
              ))}
            </h2>

            <p className="mt-6 max-w-[32rem] text-[1rem] leading-[1.35] text-[#2c221b] sm:mt-7 sm:text-[1.08rem] md:max-w-[31rem] lg:mt-8 lg:text-[clamp(1rem,1.2vw,1.35rem)]">
              {CAREER_BODY}
            </p>
          </div>

          <div
            className={`career-journey-role-wrap relative mx-auto mt-2 w-full max-w-[24rem] transition-all delay-200 duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] sm:max-w-[27rem] md:max-w-[31rem] lg:absolute lg:bottom-[4%] lg:right-[4%] lg:mt-0 lg:w-[46%] lg:max-w-none xl:right-[6%] xl:w-[44%] ${roleRevealClassName} ${prefersReducedMotion ? '' : 'career-journey-role-drift'
              }`}
          >
            <div className="absolute inset-x-[14%] bottom-[6%] h-[16%] rounded-[50%] bg-[radial-gradient(circle,rgba(63,41,24,0.4),rgba(63,41,24,0.16)_42%,transparent_74%)] blur-2xl" />
            <img
              src={CAREER_ASSETS.role}
              alt="A racing-suited figure looking toward the horizon at sunset"
              className="relative z-10 h-auto w-full object-contain object-bottom drop-shadow-[0_24px_60px_rgba(44,24,10,0.32)] lg:max-h-[78vh]"
            />
          </div>

          <div className="pointer-events-none absolute inset-0 z-20">
            {/* 冠军卡：具体位置参数已抽到文件顶部的 DECORATIVE_LAYOUTS.championCard。 */}
            <img
              src={CAREER_ASSETS.championCard}
              alt=""
              aria-hidden="true"
              className={joinClasses(
                'absolute rounded-[0.2rem] shadow-[0_18px_38px_rgba(82,55,18,0.2)]',
                DECORATIVE_LAYOUTS.championCard.position.base,
                DECORATIVE_LAYOUTS.championCard.position.sm,
                DECORATIVE_LAYOUTS.championCard.position.lg,
                DECORATIVE_LAYOUTS.championCard.position.xl,
                DECORATIVE_LAYOUTS.championCard.width.base,
                DECORATIVE_LAYOUTS.championCard.width.sm,
                DECORATIVE_LAYOUTS.championCard.width.lg,
                DECORATIVE_LAYOUTS.championCard.width.xl,
                prefersReducedMotion ? 'opacity-95' : `${DECORATIVE_LAYOUTS.championCard.motionClassName} opacity-95`,
              )}
            />
            {/* 地球图标：具体位置参数已抽到文件顶部的 DECORATIVE_LAYOUTS.commerceIcon。 */}
            <img
              src={CAREER_ASSETS.commerceIcon}
              alt=""
              aria-hidden="true"
              className={joinClasses(
                'absolute drop-shadow-[0_14px_24px_rgba(67,52,38,0.16)]',
                DECORATIVE_LAYOUTS.commerceIcon.position.base,
                DECORATIVE_LAYOUTS.commerceIcon.position.sm,
                DECORATIVE_LAYOUTS.commerceIcon.position.lg,
                DECORATIVE_LAYOUTS.commerceIcon.position.xl,
                DECORATIVE_LAYOUTS.commerceIcon.width.base,
                DECORATIVE_LAYOUTS.commerceIcon.width.sm,
                DECORATIVE_LAYOUTS.commerceIcon.width.lg,
                DECORATIVE_LAYOUTS.commerceIcon.width.xl,
                prefersReducedMotion ? '' : DECORATIVE_LAYOUTS.commerceIcon.motionClassName,
              )}
            />
            {/* 社媒卡：具体位置参数已抽到文件顶部的 DECORATIVE_LAYOUTS.socialMediaIcon。 */}
            <img
              src={CAREER_ASSETS.socialMediaIcon}
              alt=""
              aria-hidden="true"
              className={joinClasses(
                'absolute drop-shadow-[0_18px_30px_rgba(67,52,38,0.16)]',
                DECORATIVE_LAYOUTS.socialMediaIcon.position.base,
                DECORATIVE_LAYOUTS.socialMediaIcon.position.sm,
                DECORATIVE_LAYOUTS.socialMediaIcon.position.lg,
                DECORATIVE_LAYOUTS.socialMediaIcon.position.xl,
                DECORATIVE_LAYOUTS.socialMediaIcon.width.base,
                DECORATIVE_LAYOUTS.socialMediaIcon.width.sm,
                DECORATIVE_LAYOUTS.socialMediaIcon.width.lg,
                DECORATIVE_LAYOUTS.socialMediaIcon.width.xl,
                prefersReducedMotion ? 'opacity-95' : `${DECORATIVE_LAYOUTS.socialMediaIcon.motionClassName} opacity-95`,
              )}
            />
          </div>

          <div
            aria-hidden="true"
            className={`pointer-events-none absolute bottom-[7%] right-[3%] z-20 text-[3rem] font-black uppercase leading-none tracking-[-0.08em] text-transparent opacity-80 sm:text-[3.8rem] md:text-[4.6rem] lg:bottom-[6%] lg:right-[4%] lg:text-[clamp(5rem,7vw,7.8rem)] ${prefersReducedMotion ? '' : 'career-journey-float-gold'
              }`}
            style={{
              backgroundImage:
                'linear-gradient(180deg, #f7e3a1 0%, #f0c86e 28%, #b97621 48%, #7f4d12 66%, #f4dd99 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              textShadow:
                '0 2px 0 rgba(117, 73, 17, 0.38), 0 8px 18px rgba(108, 67, 21, 0.28), 0 0 1px rgba(255, 240, 190, 0.85)',
            }}
          >
            AIGC
          </div>
        </div>
      </div>
    </section>
  );
}
