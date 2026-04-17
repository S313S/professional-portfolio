import { Github, Linkedin, Mail, Twitter, ExternalLink, Globe } from 'lucide-react';
import type {
  FriendBookAvatarId,
  FriendBookGameId,
  FriendBookQuizQuestion,
} from './components/FriendBookFinalSection.logic';

export interface FeaturedWork {
  id: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  description: string;
  tags: string[];
  image: string;
  link: string;
}

export type CodingCategoryId = 'workflow' | 'vibecoding' | 'ai-product';

export interface CodingCategory {
  id: CodingCategoryId;
  sequence: string;
  title: string;
  description: string;
  iconLabel: string;
  accent: string;
}

export interface CodingProjectCard {
  id: string;
  categoryId: CodingCategoryId;
  title: string;
  description: string;
  tags: string[];
  image: string;
  link: string;
}

export interface FriendBookFinalGameCard {
  id: FriendBookGameId;
  title: string;
  description: string;
  ctaLabel: string;
  backgroundImage: string;
}

export interface FriendBookBetweenTwoPagesTarget {
  id: 'moon-stamp' | 'cat-tail' | 'page-fold';
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FriendBookBetweenTwoPagesScene {
  baseImage: string;
  variantImage: string;
  targets: FriendBookBetweenTwoPagesTarget[];
}

export interface FriendBookFinalEntrySeal {
  label: string;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
}

export interface FriendBookFinalEntry {
  id: string;
  nickname: string;
  seal: FriendBookFinalEntrySeal;
  excerpt: string;
  note: string;
  date: string;
  avatarImage: string;
  medalImage: string;
}

export interface FriendBookFinalAvatarOption {
  id: FriendBookAvatarId;
  label: string;
  asset: string;
  hidden?: boolean;
}

export interface FriendBookFinalUserSlot {
  gameId: FriendBookGameId;
  label: string;
  emptyTitle: string;
  emptyDescription: string;
  previewDate: string;
}

const featuredWorks: FeaturedWork[] = [
  {
    id: 'signal-in-motion',
    title: 'Signal in Motion',
    eyebrow: 'Selected Work',
    subtitle: 'The operator dashboard where strategy turned into repeatable delivery.',
    description:
      'Built to make campaign momentum legible at a glance, this stage combined decision framing, execution tracking, and narrative reporting into one calmer operating surface.',
    tags: ['Operator UI', 'System Framing', 'Delivery Rhythm'],
    image: '/images/WorksCollectionRoom_Bg.jpg',
    link: '#',
  },
  {
    id: 'midnight-launch-notes',
    title: 'Midnight Launch Notes',
    eyebrow: 'Launch System',
    subtitle: 'A release layer shaped for fast alignment under pressure.',
    description:
      'This concept focused on compressing launch context into a visual system that could help teams synchronize handoff details, timing, and priorities without extra meetings.',
    tags: ['Launch Ops', 'Cross-Functional UX', 'Narrative Surface'],
    image: '/images/video-transition-poster.png',
    link: '#',
  },
  {
    id: 'quiet-growth-atlas',
    title: 'Quiet Growth Atlas',
    eyebrow: 'Growth Story',
    subtitle: 'A softer interface for seeing long-term movement more clearly.',
    description:
      'Designed as a slower, more reflective product story, this work translated gradual traction, user insight, and evolving positioning into a scene that felt measured rather than loud.',
    tags: ['Growth Mapping', 'Signal Design', 'Editorial UI'],
    image: '/images/bg_growpath.jpeg',
    link: '#',
  },
  {
    id: 'operator-protocol',
    title: 'Operator Protocol',
    eyebrow: 'Workflow Layer',
    subtitle: 'The backstage view for keeping systems useful after the first demo.',
    description:
      'Here the emphasis moved from polished presentation to durable internal use: cleaner states, clearer ownership cues, and enough structure for collaborators to inherit the work smoothly.',
    tags: ['Workflow Design', 'Internal Tools', 'AI Delivery'],
    image: '/images/career_bg.png',
    link: '#',
  },
  {
    id: 'proof-of-rhythm',
    title: 'Proof of Rhythm',
    eyebrow: 'Experience Study',
    subtitle: 'A case study in pacing product storytelling without losing precision.',
    description:
      'This direction explored how editorial pacing, visual restraint, and stronger transitions could make a portfolio feel less like a gallery and more like a guided experience.',
    tags: ['Portfolio System', 'Interaction Design', 'Creative Direction'],
    image: '/images/careerDetail_bg.png',
    link: '#',
  },
];

const codingCategories: CodingCategory[] = [
  {
    id: 'workflow',
    sequence: '01',
    title: 'Workflow',
    description:
      'Systems for keeping AI-assisted delivery reliable, reviewable, and calm under iteration.',
    iconLabel: 'WF',
    accent: '#62d98d',
  },
  {
    id: 'vibecoding',
    sequence: '02',
    title: 'Vibecoding',
    description:
      'Fast prototype loops where product direction, interface polish, and implementation move together.',
    iconLabel: 'VC',
    accent: '#8ad9ff',
  },
  {
    id: 'ai-product',
    sequence: '03',
    title: 'AI product',
    description:
      'Applied product ideas that turn model capabilities into clearer user value and operational leverage.',
    iconLabel: 'AI',
    accent: '#f4c46b',
  },
];

const codingProjects: Record<CodingCategoryId, CodingProjectCard[]> = {
  workflow: [
    {
      id: 'handoff-radar',
      categoryId: 'workflow',
      title: 'Handoff Radar',
      description:
        'A release handoff board that made ownership gaps, blockers, and review state visible before they slowed the team down.',
      tags: ['Workflow', 'Review Ops'],
      image: '/images/career_bg.png',
      link: '#',
    },
    {
      id: 'prompt-qa-sheet',
      categoryId: 'workflow',
      title: 'Prompt QA Sheet',
      description:
        'A structured prompt review surface for checking assumptions, model drift, and expected output shape before shipping.',
      tags: ['Prompting', 'QA'],
      image: '/images/careerDetail_bg.png',
      link: '#',
    },
    {
      id: 'signal-archive',
      categoryId: 'workflow',
      title: 'Signal Archive',
      description:
        'An internal archive flow for capturing working decisions, visual references, and implementation notes without losing context.',
      tags: ['Documentation', 'Knowledge'],
      image: '/images/bg_growpath.jpeg',
      link: '#',
    },
    {
      id: 'review-rail',
      categoryId: 'workflow',
      title: 'Review Rail',
      description:
        'A reviewer-first layout that compressed diffs, rationale, and next actions into one faster inspection loop.',
      tags: ['Review', 'Decision Making'],
      image: '/images/video-transition-poster.png',
      link: '#',
    },
    {
      id: 'execution-docket',
      categoryId: 'workflow',
      title: 'Execution Docket',
      description:
        'A task flow that paired small implementation batches with explicit validation, making AI assistance safer to scale.',
      tags: ['Delivery', 'Automation'],
      image: '/images/growPath_03.png',
      link: '#',
    },
    {
      id: 'ops-playbook',
      categoryId: 'workflow',
      title: 'Ops Playbook',
      description:
        'A reusable playbook for turning ambiguous product requests into testable, sequenced implementation work.',
      tags: ['Planning', 'Ops System'],
      image: '/images/growPath_04.png',
      link: '#',
    },
  ],
  vibecoding: [
    {
      id: 'motion-sprint',
      categoryId: 'vibecoding',
      title: 'Motion Sprint',
      description:
        'A rapid interaction prototype where animation timing and copy changed in the same loop as code.',
      tags: ['Prototype', 'Motion'],
      image: '/images/after.png',
      link: '#',
    },
    {
      id: 'portfolio-remix',
      categoryId: 'vibecoding',
      title: 'Portfolio Remix',
      description:
        'A concept page built from mood, references, and implementation experiments in a single focused session.',
      tags: ['Creative Coding', 'UI'],
      image: '/images/before.png',
      link: '#',
    },
    {
      id: 'hero-lab',
      categoryId: 'vibecoding',
      title: 'Hero Lab',
      description:
        'A hero-section playground for testing typography, scene layering, and interaction feel before settling visual direction.',
      tags: ['Landing Page', 'Experiment'],
      image: '/images/growPath_01.png',
      link: '#',
    },
    {
      id: 'scene-builder',
      categoryId: 'vibecoding',
      title: 'Scene Builder',
      description:
        'A layout sketching flow where product ideas were validated through live-coded scene composition instead of static comps.',
      tags: ['Layout', 'Iteration'],
      image: '/images/growPath_02.png',
      link: '#',
    },
    {
      id: 'interface-jam',
      categoryId: 'vibecoding',
      title: 'Interface Jam',
      description:
        'A collaborative build session that used fast component swaps to test tone, density, and hierarchy live.',
      tags: ['Component', 'Collaboration'],
      image: '/images/works-detail-07-square.png',
      link: '#',
    },
    {
      id: 'contrast-pass',
      categoryId: 'vibecoding',
      title: 'Contrast Pass',
      description:
        'A series of quick contrast and surface studies that made a rough interface feel intentional without slowing down delivery.',
      tags: ['Polish', 'Visual System'],
      image: '/images/workDetail_bg.jpeg',
      link: '#',
    },
  ],
  'ai-product': [
    {
      id: 'agent-console',
      categoryId: 'ai-product',
      title: 'Agent Console',
      description:
        'A product concept for making agent status, confidence, and next-step recommendations understandable to operators.',
      tags: ['AI Product', 'Console'],
      image: '/images/careerDetail_litteleBg_01.png',
      link: '#',
    },
    {
      id: 'brief-copilot',
      categoryId: 'ai-product',
      title: 'Brief Copilot',
      description:
        'A guided brief generator that translated vague requests into structured execution inputs with less back-and-forth.',
      tags: ['Copilot', 'Workflow'],
      image: '/images/careerDetail_litteleBg_02.png',
      link: '#',
    },
    {
      id: 'insight-merge',
      categoryId: 'ai-product',
      title: 'Insight Merge',
      description:
        'A synthesis surface that grouped user signals, model output, and strategic framing into a single product readout.',
      tags: ['Insights', 'Synthesis'],
      image: '/images/careerDetail_litteleBg_03.png',
      link: '#',
    },
    {
      id: 'spec-orbit',
      categoryId: 'ai-product',
      title: 'Spec Orbit',
      description:
        'A planning tool that linked prompts, UI states, and test expectations so product decisions stayed traceable.',
      tags: ['Specs', 'Traceability'],
      image: '/images/careerDetail_map.png',
      link: '#',
    },
    {
      id: 'launch-sentinel',
      categoryId: 'ai-product',
      title: 'Launch Sentinel',
      description:
        'A launch assistant concept focused on preflight validation, rollback readiness, and team alignment for AI features.',
      tags: ['Launch', 'Reliability'],
      image: '/images/top-title.png',
      link: '#',
    },
    {
      id: 'memory-thread',
      categoryId: 'ai-product',
      title: 'Memory Thread',
      description:
        'A product idea for preserving thread context across edits so agent collaboration felt less fragile over time.',
      tags: ['Memory', 'Product Strategy'],
      image: '/images/easel-removebg.png',
      link: '#',
    },
  ],
};

const friendBookBetweenTwoPagesScene: FriendBookBetweenTwoPagesScene = {
  baseImage: '/images/friend-book-between-two-pages/base-scene-v1.png',
  variantImage: '/images/friend-book-between-two-pages/variant-scene-v1.png',
  targets: [
    {
      id: 'moon-stamp',
      label: 'moon seal',
      x: 28,
      y: 17,
      width: 24,
      height: 18,
    },
    {
      id: 'cat-tail',
      label: 'cat tail',
      x: 71,
      y: 75,
      width: 18,
      height: 20,
    },
    {
      id: 'page-fold',
      label: 'page fold',
      x: 89,
      y: 9,
      width: 14,
      height: 14,
    },
  ],
};

const friendBookQuizQuestionBank: FriendBookQuizQuestion[] = [
  {
    id: 'mona-lisa',
    silhouetteImage: '/images/friend-book-quiz/mona-lisa-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['Mona Lisa', 'The Scream', 'The Birth of Venus', 'Girl with a Pearl Earring'],
    correctAnswer: 'Mona Lisa',
    resultCopy: 'The quiet smile belongs to Mona Lisa.',
  },
  {
    id: 'the-scream',
    silhouetteImage: '/images/friend-book-quiz/the-scream-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['The Scream', 'The Kiss', 'Guernica', 'The Night Watch'],
    correctAnswer: 'The Scream',
    resultCopy: 'That stretched figure is The Scream.',
  },
  {
    id: 'girl-with-pearl-earring',
    silhouetteImage: '/images/friend-book-quiz/girl-with-pearl-earring-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['Girl with a Pearl Earring', 'The Last Supper', 'American Gothic', 'The Birth of Venus'],
    correctAnswer: 'Girl with a Pearl Earring',
    resultCopy: 'The turned head and pearl fit Girl with a Pearl Earring.',
  },
  {
    id: 'starry-night',
    silhouetteImage: '/images/friend-book-quiz/starry-night-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['Starry Night', 'The Scream', 'The Night Watch', 'Guernica'],
    correctAnswer: 'Starry Night',
    resultCopy: 'The swirling sky points to Starry Night.',
  },
  {
    id: 'the-kiss',
    silhouetteImage: '/images/friend-book-quiz/the-kiss-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['The Kiss', 'Mona Lisa', 'The Birth of Venus', 'American Gothic'],
    correctAnswer: 'The Kiss',
    resultCopy: 'The close embrace belongs to The Kiss.',
  },
  {
    id: 'american-gothic',
    silhouetteImage: '/images/friend-book-quiz/american-gothic-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['American Gothic', 'The Last Supper', 'Guernica', 'The Night Watch'],
    correctAnswer: 'American Gothic',
    resultCopy: 'The stern pair is American Gothic.',
  },
  {
    id: 'birth-of-venus',
    silhouetteImage: '/images/friend-book-quiz/birth-of-venus-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['The Birth of Venus', 'The Scream', 'Mona Lisa', 'Girl with a Pearl Earring'],
    correctAnswer: 'The Birth of Venus',
    resultCopy: 'The shell-born figure is The Birth of Venus.',
  },
  {
    id: 'the-persistence-of-memory',
    silhouetteImage: '/images/friend-book-quiz/persistence-of-memory-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['The Persistence of Memory', 'Starry Night', 'The Kiss', 'Guernica'],
    correctAnswer: 'The Persistence of Memory',
    resultCopy: 'The soft clocks belong to The Persistence of Memory.',
  },
  {
    id: 'the-night-watch',
    silhouetteImage: '/images/friend-book-quiz/the-night-watch-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['The Night Watch', 'American Gothic', 'The Last Supper', 'Mona Lisa'],
    correctAnswer: 'The Night Watch',
    resultCopy: 'That bold group scene points to The Night Watch.',
  },
  {
    id: 'guernica',
    silhouetteImage: '/images/friend-book-quiz/guernica-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['Guernica', 'The Scream', 'The Kiss', 'The Birth of Venus'],
    correctAnswer: 'Guernica',
    resultCopy: 'The fractured forms match Guernica.',
  },
  {
    id: 'the-last-supper',
    silhouetteImage: '/images/friend-book-quiz/the-last-supper-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['The Last Supper', 'Mona Lisa', 'The Night Watch', 'Starry Night'],
    correctAnswer: 'The Last Supper',
    resultCopy: 'The long table belongs to The Last Supper.',
  },
  {
    id: 'liberty-leading-the-people',
    silhouetteImage: '/images/friend-book-quiz/liberty-leading-the-people-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['Liberty Leading the People', 'The Kiss', 'American Gothic', 'Guernica'],
    correctAnswer: 'Liberty Leading the People',
    resultCopy: 'The raised flag makes this Liberty Leading the People.',
  },
  {
    id: 'self-portrait-thorn-necklace',
    silhouetteImage: '/images/friend-book-quiz/self-portrait-thorn-necklace-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['Self-Portrait with Thorn Necklace and Hummingbird', 'Mona Lisa', 'Girl with a Pearl Earring', 'The Scream'],
    correctAnswer: 'Self-Portrait with Thorn Necklace and Hummingbird',
    resultCopy: 'The floral crown and thorn necklace point to Frida Kahlo.',
  },
  {
    id: 'campbells-soup-cans',
    silhouetteImage: '/images/friend-book-quiz/campbells-soup-cans-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ["Campbell's Soup Cans", 'The Night Watch', 'The Last Supper', 'Guernica'],
    correctAnswer: "Campbell's Soup Cans",
    resultCopy: 'The repeating labels belong to Campbell\'s Soup Cans.',
  },
  {
    id: 'the-great-wave',
    silhouetteImage: '/images/friend-book-quiz/the-great-wave-shadow.svg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: ['The Great Wave off Kanagawa', 'Starry Night', 'The Scream', 'The Birth of Venus'],
    correctAnswer: 'The Great Wave off Kanagawa',
    resultCopy: 'The cresting arc is The Great Wave off Kanagawa.',
  },
];

export const friendBookFinalSectionData = {
  assets: {
    sectionBackground: '/images/BookofFriends_Bg01.png',
    heroPanelBackground: '/images/BookofFriends_Bg02.png',
    archiveBoardBackground: '/images/BookofFriends_Bg_Message Board.png',
    buttons: {
      startPlayingPrimary: '/images/BookofFriends_Btn0_StartPlaying.png',
      startPlayingSecondary: '/images/BookofFriends_Btn0_StartPlayingArrow.png',
      openFriendBook: '/images/BookofFriends_Btn0_OpenFriendBook.png',
      begin: '/images/BookofFriends_Btn_Begin.png',
    },
  },
  topHeading: {
    english: 'THE BOOK OF FRIENDS /',
    chinese: '友人帐 (BOOK OF FRIENDS)',
  },
  overline: 'THE BOOK OF FRIENDS / 友人帐 (BOOK OF FRIENDS)',
  title: 'Where would you like to begin tonight?',
  description:
    'A few short interactions. When they end, you can decide whether to leave an echo in the Friend Book.',
  ctaLinks: [
    {
      id: 'friend-book-start-link',
      label: 'Start Playing',
      href: '#friend-book-game-grid',
      asset: '/images/BookofFriends_Btn0_StartPlayingArrow.png',
    },
    {
      id: 'friend-book-open-link',
      label: 'Open Friend Book',
      href: '#friend-book-preview',
      asset: '/images/BookofFriends_Btn0_OpenFriendBook.png',
    },
  ],
  gameCards: [
    {
      id: 'between-two-pages',
      title: 'Between Two Pages',
      description:
        'Find a few small differences before the page closes for the night.',
      ctaLabel: 'Begin',
      backgroundImage: '/images/BookofFriends_Bg_CatBook_Left.png',
    },
    {
      id: 'moon-run',
      title: 'Moon Run',
      description:
        'A short night run where timing matters more than speed.',
      ctaLabel: 'Begin',
      backgroundImage: '/images/BookofFriends_Bg_CatBook_middle.png',
    },
    {
      id: 'one-stroke-mark',
      title: "Who’s This?",
      description:
        'Observe a shadow, guess who it belongs to, and turn the page to the next silhouette.',
      ctaLabel: 'Begin',
      backgroundImage: '/images/BookofFriends_Bg_CatBook_Right.png',
    },
  ] satisfies FriendBookFinalGameCard[],
  betweenTwoPagesScene: friendBookBetweenTwoPagesScene,
  quizQuestionBank: friendBookQuizQuestionBank,
  avatars: [
    {
      id: 'cat-pi',
      label: 'CaPi',
      asset: '/images/Avatar_caPI01.png',
    },
    {
      id: 'cat',
      label: 'Cat',
      asset: '/images/Avatar_cat01.png',
    },
    {
      id: 'dog',
      label: 'Dog',
      asset: '/images/Avatar_dog01.png',
    },
    {
      id: 'rabbit',
      label: 'Rabbit',
      asset: '/images/Avatar_rabit01.png',
    },
    {
      id: 'tree',
      label: 'Tree',
      asset: '/images/Avatar_tree.png',
    },
    {
      id: 'hidden-cat',
      label: 'Hidden Cat',
      asset: '/images/Avatar_cat_Hidden Edition.png',
      hidden: true,
    },
  ] satisfies FriendBookFinalAvatarOption[],
  medalPools: {
    'between-two-pages': [
      '/images/Animalmedals01.png',
      '/images/Animalmedals02.png',
      '/images/Animalmedals03.png',
      '/images/Animalmedals04.png',
      '/images/Animalmedals05.png',
      '/images/Animalmedals06.png',
      '/images/Animalmedals07.png',
      '/images/Animalmedals08.png',
    ],
    'moon-run': [
      '/images/GreenMedal01.png',
      '/images/GreenMedal02.png',
      '/images/GreenMedal03.png',
      '/images/GreenMedal04.png',
    ],
    'one-stroke-mark': [
      '/images/PurpleMedal01.png',
      '/images/PurpleMedal02.png',
      '/images/PurpleMedal03.png',
      '/images/PurpleMedal04.png',
      '/images/PurpleMedal05.png',
    ],
  } satisfies Record<FriendBookGameId, string[]>,
  previewEyebrow: 'ARCHIVE OF BONDS / 羁绊存档',
  previewTitle: 'Soft Archive of Tonight',
  previewDescription: '',
  entries: [
    {
      id: 'spring-wind',
      nickname: '樱花季的风',
      seal: {
        label: 'Two Pages',
        backgroundColor: 'rgba(238,205,206,0.72)',
        borderColor: '#d7a7a6',
        textColor: '#7a5450',
      },
      excerpt: '今晚的风具温柔，在这个情里，我留下了温柔的心情。',
      note: 'A gentle mood stayed with the page long after the round ended.',
      date: 'APR 12, 2024',
      avatarImage: '/images/Avatar_cat01.png',
      medalImage: '/images/PurpleMedal01.png',
    },
    {
      id: 'book-sea-diver',
      nickname: '书海潜水员',
      seal: {
        label: 'Moon Run',
        backgroundColor: 'rgba(214,225,194,0.84)',
        borderColor: '#b4c69a',
        textColor: '#66724a',
      },
      excerpt: '简单的一划，初记住了今天最特别的一刻。',
      note: 'Some memories arrive as a single line and stay longer than expected.',
      date: 'APR 18, 2026',
      avatarImage: '/images/Avatar_tree.png',
      medalImage: '/images/GreenMedal02.png',
    },
    {
      id: 'night-watcher',
      nickname: '深夜守望者',
      seal: {
        label: "Who's This",
        backgroundColor: 'rgba(221,210,225,0.78)',
        borderColor: '#c0b0c7',
        textColor: '#6b5e74',
      },
      excerpt: '这本书的最后一页，我想用这个故事填满。',
      note: 'A small promise to come back when the night grows quiet again.',
      date: 'APR 06, 2026',
      avatarImage: '/images/Avatar_dog01.png',
      medalImage: '/images/Animalmedals04.png',
    },
  ] satisfies FriendBookFinalEntry[],
  userSlots: [
    {
      gameId: 'between-two-pages',
      label: 'Between Two Pages',
      emptyTitle: 'A page still waiting',
      emptyDescription: 'Find the three quiet marks to leave the first archive note here.',
      previewDate: 'APR 12, 2024',
    },
    {
      gameId: 'moon-run',
      label: 'Moon Run',
      emptyTitle: 'A night run not yet finished',
      emptyDescription: 'Stop inside the moon band to write the memory for this slot.',
      previewDate: 'APR 18, 2026',
    },
    {
      gameId: 'one-stroke-mark',
      label: "Who’s This?",
      emptyTitle: 'A silhouette round still unopened',
      emptyDescription: 'Recognize five shadowed figures to let this page remember you.',
      previewDate: 'APR 06, 2026',
    },
  ] satisfies FriendBookFinalUserSlot[],
  footerLine:
    'START WITH A SHORT PLAY SESSION, THEN DECIDE YOUR VALUABLE SUCCESS FROM ARCHIVE.',
} as const;

export const personalData = {
  name: "Xiao Ci - AI Builder",
  role: "Senior Product Designer & Frontend Developer",
  tagline: "Crafting digital experiences with precision and passion.",
  about: "I am a multidisciplinary developer and designer with a passion for creating intuitive, engaging, and scalable digital products. With over 5 years of experience, I bridge the gap between design and engineering.",
  email: "hello@example.com",
  socials: [
    { name: "GitHub", url: "https://github.com", icon: Github },
    { name: "LinkedIn", url: "https://linkedin.com", icon: Linkedin },
    { name: "Twitter", url: "https://twitter.com", icon: Twitter },
    { name: "Email", url: "mailto:hello@example.com", icon: Mail },
  ],
  experience: [
    {
      company: "Tech Innovators Inc.",
      role: "Senior Frontend Engineer",
      period: "2021 - Present",
      description: "Leading the frontend team in rebuilding the core product dashboard using React and TypeScript. Improved performance by 40%."
    },
    {
      company: "Creative Studio",
      role: "UI/UX Designer & Developer",
      period: "2018 - 2021",
      description: "Designed and developed award-winning marketing websites for Fortune 500 clients. Collaborated closely with backend teams."
    },
    {
      company: "StartUp Hero",
      role: "Junior Web Developer",
      period: "2016 - 2018",
      description: "Implemented responsive user interfaces and maintained legacy codebases. Participated in agile development cycles."
    }
  ],
  projects: [
    {
      title: "E-Commerce Dashboard",
      description: "A comprehensive analytics dashboard for online retailers, featuring real-time data visualization.",
      tags: ["React", "TypeScript", "D3.js", "Tailwind"],
      link: "#",
      image: "https://picsum.photos/seed/dashboard/800/600"
    },
    {
      title: "Travel Companion App",
      description: "Mobile-first web application helping travelers plan their trips and discover local gems.",
      tags: ["Next.js", "Framer Motion", "Mapbox"],
      link: "#",
      image: "https://picsum.photos/seed/travel/800/600"
    },
    {
      title: "Finance Tracker",
      description: "Personal finance management tool with budget planning and expense categorization.",
      tags: ["Vue", "Firebase", "Chart.js"],
      link: "#",
      image: "https://picsum.photos/seed/finance/800/600"
    },
    {
      title: "Portfolio V1",
      description: "My previous portfolio site, focusing on brutalist design aesthetics.",
      tags: ["HTML/CSS", "JavaScript", "GSAP"],
      link: "#",
      image: "https://picsum.photos/seed/portfolio/800/600"
    }
  ],
  featuredWorks,
  codingCategories,
  codingProjects,
  skills: [
    "React", "TypeScript", "Next.js", "Tailwind CSS", "Node.js", 
    "UI/UX Design", "Figma", "Git", "PostgreSQL", "GraphQL",
    "System Design", "Accessibility"
  ],
  heroScrollText: [
    "Product Design",
    "Frontend Development",
    "User Experience",
    "Creative Coding",
    "Interaction Design",
    "Web Accessibility",
    "Design Systems"
  ],
  heroSpiralText: "I build accessible, pixel-perfect, performant, and delightful digital experiences. I bridge the gap between design and engineering. "
};
