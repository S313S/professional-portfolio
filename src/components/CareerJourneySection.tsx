import { useEffect, useRef, useState, type CSSProperties } from 'react';

const CAREER_ASSETS = {
  background: '/images/career_bg.png',
  role: '/images/career_role.png',
  commerceIcon: '/images/career_icon_Cross-border e-commerce.png',
  socialMediaIcon: '/images/career_icon_socialMedia.png',
  championCard: '/images/career_icon_champion.png',
} as const;

const reducedMotionQuery = '(prefers-reduced-motion: reduce)';

type ResponsiveClassGroup = {
  base: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
};

type DecorativeLayout = {
  position: {
    base: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  width: {
    base: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
  };
  motionClassName: string;
  dataKey: 'champion' | 'commerce' | 'social';
};

const joinClasses = (...classNames: Array<string | false | null | undefined>) =>
  classNames.filter(Boolean).join(' ');

const getResponsiveClasses = (group: ResponsiveClassGroup) =>
  joinClasses(group.base, group.sm, group.md, group.lg, group.xl);

/* 这一页的所有“可调参数”都集中在这里。
   后面如果你要微调版式，优先只改这个配置对象，不改下面 JSX 布局。 */
const CAREER_JOURNEY_CONFIG = {
  /* 参数读法：
     - base / sm / md / lg / xl：分别对应默认、sm、md、lg、xl 断点
     - wrapper：控制一个整块区域的位置、宽度、层级
     - title / body / subtitle：控制文字字号、字距、行高、边距
     - position：主要改 left/right/top/bottom
     - width：主要改 w-[...] 或 max-w-[...]
     - motionClassName：控制浮动动画类名；不想动效时可以留空 */

  /* 文案区：品牌名、副标题、眉标题、大标题、正文、右下角 AIGC 字样都在这里改。 */
  text: {
    brand: 'XIAOCI',
    subtitle: 'Career Journey',
    eyebrow: 'CAREER JOURNEY',
    titleLines: ['FROM CHANCE', 'TO CHOICE'],
    body:
      'I entered my first formal role with luck, reached the AI wave at a major turning point, then learned the hard way that leaving the spotlight did not guarantee clarity. Through setbacks, misjudgments, and difficult transitions, I kept building, sharpening my work, my communication, and my sense of direction.',
    aigcBadge: 'AIGC',
  },

  /* 顶部左上角品牌区。
     想调这整块的位置，改 wrapper 里的 left / top。
     想单独改 XIAOCI 或副标题的字体，改各自 style.fontFamily。 */
  brandLayout: {
    wrapper: {
      base: 'relative z-20 max-w-fit',
      lg: 'lg:absolute lg:left-[5%] lg:top-[4%]',
      xl: 'xl:left-[3%] xl:top-[0.2%]',
    },
    brandTitle: {
      base:
        'font-serif text-[2rem] font-semibold tracking-[-0.05em] text-[#1d1511]',
      sm: 'sm:text-[2.4rem]',
      lg: 'lg:text-[1.49rem]',
      style: {
        fontFamily: '"Cormorant Garamond", serif',
      } satisfies CSSProperties,
    },
    subtitle: {
      base: '-mt-2 text-base font-semibold tracking-[-0.03em] text-[#1f1713]',
      sm: 'sm:text-[1.0rem]',
      style: {
        fontFamily: '"Manrope", ui-sans-serif, system-ui, sans-serif',
      } satisfies CSSProperties,
    },
  },

  /* 左侧主内容区。
     改位置看 wrapper，改眉标题/主标题/正文大小看对应 class。
     如果想把整块内容整体左移/右移，优先改 lg:left / xl:left；
     如果想把整块内容整体上移/下移，优先改 lg:top / xl:top。 */
  contentLayout: {
    wrapper: {
      base: 'relative z-20 max-w-[34rem]',
      md: 'md:pt-10',
      lg: 'lg:absolute lg:left-[5%] lg:top-[17%] lg:w-[39%] lg:max-w-[38rem]',
      xl: 'xl:left-[4%] xl:top-[15%] xl:w-[37%]',
    },
    eyebrowRow: {
      base:
        'mb-5 flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-[#2e241d]',
      sm: 'sm:text-[0.85rem]',
    },
    eyebrowArrow: {
      base: 'text-[1rem] leading-none',
    },
    title: {
      base:
        'max-w-[12ch] font-sans text-[3.6rem] leading-[0.88] font-black tracking-[-0.08em] text-[#31251d]',
      sm: 'sm:text-[4.6rem]',
      md: 'md:text-[5.3rem]',
      lg: 'lg:text-[clamp(4.8rem,6vw,7rem)]',
    },
    body: {
      base: 'mt-6 max-w-[32rem] text-[1rem] leading-[1.35] text-[#2c221b]',
      sm: 'sm:mt-7 sm:text-[1.08rem]',
      md: 'md:max-w-[31rem]',
      lg: 'lg:mt-8 lg:text-[clamp(1rem,1.2vw,1.35rem)]',
    },
  },

  /* 右侧人物主图。
     改人物图位置看 wrapper，改人物图大小看 image，改漂浮动画可改 motionClassName。
     常用调整：
     - 往左/右移动：改 lg:right、xl:right
     - 往上/下移动：改 lg:bottom
     - 变宽/变窄：改 lg:w、xl:w
     - 最高高度限制：改 image.lg 里的 max-h */
  roleLayout: {
    wrapper: {
      base: 'career-journey-role-wrap relative mx-auto mt-2 w-full max-w-[24rem]',
      sm: 'sm:max-w-[27rem]',
      md: 'md:max-w-[31rem]',
      lg: 'lg:absolute lg:bottom-[4%] lg:right-[4%] lg:mt-0 lg:w-[46%] lg:max-w-none',
      xl: 'xl:right-[6%] xl:w-[44%]',
    },
    shadow: {
      base:
        'absolute inset-x-[14%] bottom-[6%] h-[16%] rounded-[50%] bg-[radial-gradient(circle,rgba(63,41,24,0.4),rgba(63,41,24,0.16)_42%,transparent_74%)] blur-2xl',
    },
    image: {
      base:
        'relative z-10 h-auto w-full object-contain object-bottom drop-shadow-[0_24px_60px_rgba(44,24,10,0.32)]',
      lg: 'lg:max-h-[78vh]',
    },
    motionClassName: 'career-journey-role-drift',
  },

  /* 三张装饰图片。
     调整规则：
     - 手机先看 base / sm
     - 桌面先看 lg / xl
     - 左右移动改 left/right
     - 上下移动改 top/bottom
     - 尺寸改 width
     - 每张图的 dataKey 只是测试和定位锚点，不建议改 */
  decorativeLayouts: {
    championCard: {
      /* 冠军卡：右上角小金卡。 */
      position: {
        base: 'right-[40%] top-[20%]',
        sm: 'sm:right-[8%] sm:top-[41%]',
        lg: 'lg:right-[3%] lg:top-[15%]',
        xl: 'xl:right-[-5%]',
      },
      width: {
        base: 'w-[29rem]',
        sm: 'sm:w-[40.5rem]',
        lg: 'lg:w-[clamp(15rem,2vw,2rem)]',
      },
      motionClassName: 'career-journey-float-champion',
      dataKey: 'champion',
    },
    commerceIcon: {
      /* 地球图：左下角跨境电商图标。 */
      position: {
        base: 'bottom-[9%] left-[4%]',
        sm: 'sm:bottom-[8%] sm:left-[6%]',
        lg: 'lg:bottom-[-1%] lg:left-[7%]',
        xl: 'xl:left-[-2%]',
      },
      width: {
        base: 'w-[6rem]',
        sm: 'sm:w-[7rem]',
        lg: 'lg:w-[clamp(7rem,8vw,9rem)]',
      },
      motionClassName: 'career-journey-float-slow',
      dataKey: 'commerce',
    },
    socialMediaIcon: {
      /* 社媒图：靠近人物图左下区域的小图。 */
      position: {
        base: 'bottom-[18%] right-[4%]',
        sm: 'sm:bottom-[16%] sm:right-[8%]',
        lg: 'lg:bottom-[14%] lg:right-[16.5%]',
        xl: 'xl:right-[48%]',
      },
      width: {
        base: 'w-[7.4rem]',
        sm: 'sm:w-[8.4rem]',
        lg: 'lg:w-[clamp(8.5rem,10.8vw,12.2rem)]',
      },
      motionClassName: 'career-journey-float-fast',
      dataKey: 'social',
    },
  } satisfies Record<'championCard' | 'commerceIcon' | 'socialMediaIcon', DecorativeLayout>,

  /* 右下角 AIGC 金属字。
     改位置看 wrapper，改字号也看 wrapper，改文案看 text.aigcBadge。
     常用调整：
     - 往左/右移动：改 right，lg:right-[8%]
     - 往上/下移动：改 bottom
     - 放大/缩小：改 text-[...] 或 clamp(...) */
  aigcBadgeLayout: {
    wrapper: {
      base:
        'pointer-events-none absolute bottom-[7%] right-[3%] z-20 text-[3rem] font-black uppercase leading-none tracking-[-0.08em] text-transparent opacity-95',
      sm: 'sm:text-[3.8rem]',
      md: 'md:text-[4.6rem]',
      lg: 'lg:bottom-[-3%] lg:right-[4%] lg:text-[clamp(5rem,7vw,7.8rem)]',
    },
    motionClassName: 'career-journey-float-gold',
    style: {
      backgroundImage:
        'linear-gradient(180deg, #f7e3a1 0%, #f0c86e 28%, #b97621 48%, #7f4d12 66%, #f4dd99 100%)',
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      textShadow:
        '0 2px 0 rgba(117, 73, 17, 0.38), 0 8px 18px rgba(108, 67, 21, 0.28), 0 0 1px rgba(255, 240, 190, 0.85)',
    } satisfies CSSProperties,
  },
} as const;

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
  const {
    text,
    brandLayout,
    contentLayout,
    roleLayout,
    decorativeLayouts,
    aigcBadgeLayout,
  } = CAREER_JOURNEY_CONFIG;

  return (
    <section
      ref={sectionRef}
      id="career-journey-section"
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
          data-career-block="brand"
          className={joinClasses(
            getResponsiveClasses(brandLayout.wrapper),
            `transition-all duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealClassName}`,
          )}
        >
          <p
            className={getResponsiveClasses(brandLayout.brandTitle)}
            style={brandLayout.brandTitle.style}
          >
            {text.brand}
          </p>
          <p
            className={getResponsiveClasses(brandLayout.subtitle)}
            style={brandLayout.subtitle.style}
          >
            {text.subtitle}
          </p>
        </header>

        <div className="relative z-10 flex flex-1 flex-col justify-between gap-10 pt-8 md:pt-10 lg:block lg:pt-0">
          <div
            data-career-block="content"
            className={joinClasses(
              getResponsiveClasses(contentLayout.wrapper),
              `transition-all delay-100 duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${revealClassName}`,
            )}
          >
            <div className={getResponsiveClasses(contentLayout.eyebrowRow)}>
              <span aria-hidden="true" className={getResponsiveClasses(contentLayout.eyebrowArrow)}>
                ↗
              </span>
              <span>{text.eyebrow}</span>
            </div>

            <h2
              id="career-journey-title"
              data-career-block="title"
              className={getResponsiveClasses(contentLayout.title)}
            >
              {text.titleLines.map((line) => (
                <span key={line} className="block whitespace-nowrap">
                  {line}
                </span>
              ))}
            </h2>

            <p className={getResponsiveClasses(contentLayout.body)}>
              {text.body}
            </p>
          </div>

          <div
            data-career-block="role"
            className={joinClasses(
              getResponsiveClasses(roleLayout.wrapper),
              `transition-all delay-200 duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${roleRevealClassName}`,
              prefersReducedMotion ? '' : roleLayout.motionClassName,
            )}
          >
            <div className={getResponsiveClasses(roleLayout.shadow)} />
            <img
              src={CAREER_ASSETS.role}
              alt="A racing-suited figure looking toward the horizon at sunset"
              className={getResponsiveClasses(roleLayout.image)}
            />
          </div>

          <div className="pointer-events-none absolute inset-0 z-20">
            <img
              src={CAREER_ASSETS.championCard}
              alt=""
              aria-hidden="true"
              data-career-card={decorativeLayouts.championCard.dataKey}
              className={joinClasses(
                'absolute rounded-[0.2rem] shadow-[0_18px_38px_rgba(82,55,18,0.2)]',
                getResponsiveClasses(decorativeLayouts.championCard.position),
                getResponsiveClasses(decorativeLayouts.championCard.width),
                prefersReducedMotion
                  ? 'opacity-95'
                  : `${decorativeLayouts.championCard.motionClassName} opacity-95`,
              )}
            />
            <img
              src={CAREER_ASSETS.commerceIcon}
              alt=""
              aria-hidden="true"
              data-career-card={decorativeLayouts.commerceIcon.dataKey}
              className={joinClasses(
                'absolute drop-shadow-[0_14px_24px_rgba(67,52,38,0.16)]',
                getResponsiveClasses(decorativeLayouts.commerceIcon.position),
                getResponsiveClasses(decorativeLayouts.commerceIcon.width),
                prefersReducedMotion ? '' : decorativeLayouts.commerceIcon.motionClassName,
              )}
            />
            <img
              src={CAREER_ASSETS.socialMediaIcon}
              alt=""
              aria-hidden="true"
              data-career-card={decorativeLayouts.socialMediaIcon.dataKey}
              className={joinClasses(
                'absolute drop-shadow-[0_18px_30px_rgba(67,52,38,0.16)]',
                getResponsiveClasses(decorativeLayouts.socialMediaIcon.position),
                getResponsiveClasses(decorativeLayouts.socialMediaIcon.width),
                prefersReducedMotion
                  ? 'opacity-95'
                  : `${decorativeLayouts.socialMediaIcon.motionClassName} opacity-95`,
              )}
            />
          </div>

          <div
            data-career-block="aigc"
            aria-hidden="true"
            className={joinClasses(
              getResponsiveClasses(aigcBadgeLayout.wrapper),
              prefersReducedMotion ? '' : aigcBadgeLayout.motionClassName,
            )}
            style={aigcBadgeLayout.style}
          >
            {text.aigcBadge}
          </div>
        </div>
      </div>
    </section>
  );
}
