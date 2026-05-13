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
  detail: {
    problem: string;
    approach: string[];
    outcome: string;
  };
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
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  hitArea: Array<{
    x: number;
    y: number;
  }>;
}

export interface FriendBookBetweenTwoPagesScene {
  id: string;
  baseImage: string;
  variantImage: string;
  aspectRatio: number;
  targets: FriendBookBetweenTwoPagesTarget[];
}

export interface FriendBookMoonRunPlatform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FriendBookMoonRunPitZone {
  startX: number;
  width: number;
}

export interface FriendBookMoonRunEnemyConfig {
  id: string;
  x: number;
  y: number;
  patrolMinX: number;
  patrolMaxX: number;
  width: number;
  height: number;
  speed: number;
}

export interface FriendBookMoonRunDecoration {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: 'moon' | 'star' | 'paper';
  opacity?: number;
}

export interface FriendBookMoonRunLevel {
  viewportWidth: number;
  worldWidth: number;
  worldHeight: number;
  groundY: number;
  artwork: {
    player: string;
    enemy: string;
    platform: string;
    finish: string;
    heart: string;
  };
  start: {
    x: number;
    y: number;
  };
  finish: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  platforms: FriendBookMoonRunPlatform[];
  pitZones: FriendBookMoonRunPitZone[];
  enemies: FriendBookMoonRunEnemyConfig[];
  decorations: FriendBookMoonRunDecoration[];
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
    id: 'first-light-in-ai',
    title: 'First Light in AI',
    eyebrow: 'Origin Work',
    subtitle: 'The first image that made the whole craft feel real.',
    description:
      'This was the first AI image I felt truly proud of. I spent long hours refining the pose, prompt, and mood, and the response from friends made it the starting point of my visual journey.',
    tags: ['AI Image', 'Prompt Craft', 'Creative Origin'],
    image: '/images/VisualWorks/VisualWorks_Myfirst_cg.jpeg',
    link: '#',
  },
  {
    id: 'midjourney-ocean-mark',
    title: 'Midjourney Ocean Mark',
    eyebrow: 'Recognized Study',
    subtitle: 'Turning a daily visual signal into an oceanic icon.',
    description:
      'At the time, Midjourney felt like the strongest tool for AI painting. I used it to translate things I noticed in daily life into an artistic ocean image, and it was later recognized officially.',
    tags: ['Midjourney', 'Icon Concept', 'Official Recognition'],
    image: '/images/VisualWorks/VisualWorks_MJ_Ocean.jpeg',
    link: '#',
  },
  {
    id: 'earth-symbol-study',
    title: 'Earth Symbol Study',
    eyebrow: 'Concept Work',
    subtitle: 'A non-realistic idea about scale, meaning, and distance.',
    description:
      'After the realistic experiments, I wanted to try something more symbolic. This Earth concept received a lot of encouragement and expanded how I understood beauty beyond literal images.',
    tags: ['Concept Art', 'Symbolic Image', 'Aesthetic Range'],
    image: '/images/VisualWorks/VisualWorks_MJ_Earth.jpeg',
    link: '#',
  },
  {
    id: 'lazy-girl-monet-study',
    title: 'Lazy Girl Monet Study',
    eyebrow: 'Style Exploration',
    subtitle: 'A softer painterly direction opened by non-realistic work.',
    description:
      'The earlier non-realistic work made me curious about how different subjects change the final feeling. This piece explored a Monet-like atmosphere and showed me how surprising a new style could be.',
    tags: ['ComfyUI', 'Painterly Style', 'Mood Study'],
    image: '/images/VisualWorks/VisualWorks_ComfyUI_theLazygirl.jpeg',
    link: '#',
  },
  {
    id: 'oil-painter-world',
    title: 'Oil Painter World',
    eyebrow: 'Milestone Style',
    subtitle: 'A colorful proof that subject and style can meet precisely.',
    description:
      'This oil-painting experiment became a milestone. It helped me see that my taste and visual judgment were becoming more concrete, and that I could match objects with the right artistic language.',
    tags: ['Oil Painting', 'Visual Judgment', 'Style Matching'],
    image: '/images/VisualWorks/VisualWorks_OilPatiner.jpeg',
    link: '#',
  },
  {
    id: 'lofi-loop-companion',
    title: 'Lofi Loop Companion',
    eyebrow: 'Image to Video',
    subtitle: 'A companion-style loop shaped from still image craft.',
    description:
      'Inspired by animation and the popular lofi girl format, I turned the image into a looping companion video. The result strengthened both my image direction and my video-making workflow.',
    tags: ['Loop Video', 'Lofi Mood', 'Motion Craft'],
    image: '/images/VisualWorks/VisualWorks_circlVideo.jpeg',
    link: '#',
  },
  {
    id: 'new-year-visual-greeting',
    title: 'New Year Visual Greeting',
    eyebrow: 'Life Application',
    subtitle: 'A personal artwork carried into a real holiday moment.',
    description:
      'After building a foundation in visual creation, I began bringing these works into everyday life. This New Year image, paired with wishes, brought back many warm responses.',
    tags: ['Holiday Visual', 'Personal Gift', 'Everyday Art'],
    image: '/images/VisualWorks/VisualWorks_happyNewYork.jpeg',
    link: '#',
  },
  {
    id: 'travel-guide-merge',
    title: 'Travel Guide Merge',
    eyebrow: 'Information Design',
    subtitle: 'A practical guide where AI helped information become useful.',
    description:
      'I made this travel guide for friends visiting from other places. The process showed me that AI is not only strong at images, but also powerful for extracting, arranging, and expressing information.',
    tags: ['Travel Guide', 'Information Design', 'AI Assistance'],
    image: '/images/VisualWorks/VisualWorks_IP_Mearge.jpeg',
    link: '#',
  },
  {
    id: 'daylight-photo-practice',
    title: 'Daylight Photo Practice',
    eyebrow: 'Photography Growth',
    subtitle: 'A small proof of better angles, light, and framing.',
    description:
      'Working with visual pieces also changed how I photographed the world. This image reflects real improvement in angle, brightness, and shooting method through repeated observation.',
    tags: ['Photography', 'Composition', 'Light Study'],
    image: '/images/VisualWorks/VisualWorks_TakePhoto.jpeg',
    link: '#',
  },
  {
    id: 'night-sense',
    title: 'Night Sense',
    eyebrow: 'Daily Beauty',
    subtitle: 'A quieter image about patience and noticing beauty in life.',
    description:
      'This night photograph reminded me that life is not short of beauty. What matters is patience, timing, and the ability to notice the right moment when it appears.',
    tags: ['Night Photo', 'Observation', 'Sense of Beauty'],
    image: '/images/VisualWorks/VisualWorks_TakePhoto_Night.jpeg',
    link: '#',
  },
];

const codingCategories: CodingCategory[] = [
  {
    id: 'workflow',
    sequence: '01',
    title: 'Workflow',
    description:
      'Reusable agent workflows for backup, research capture, social fetching, monitoring, and prompt-library operations.',
    iconLabel: 'WF',
    accent: '#62d98d',
  },
  {
    id: 'vibecoding',
    sequence: '02',
    title: 'Vibecoding',
    description:
      'Live-built portfolio, commerce, and visual-generation prototypes where interaction decisions become working code.',
    iconLabel: 'VC',
    accent: '#8ad9ff',
  },
  {
    id: 'ai-product',
    sequence: '03',
    title: 'AI product',
    description:
      'AI products and playbooks that turn AIGC signals, visual briefs, commerce scripts, and model strategy into usable decisions.',
    iconLabel: 'AI',
    accent: '#f4c46b',
  },
];

const codingProjects: Record<CodingCategoryId, CodingProjectCard[]> = {
  workflow: [
    {
      id: 'openclaw-backup-skill',
      categoryId: 'workflow',
      title: 'OpenClaw Backup Skill',
      description:
        'Natural-language backup automation for turning a repeat local agent operation into a reusable skill.',
      detail: {
        problem:
          'OpenClaw assets needed a repeatable GitHub backup path, but doing it manually risked missed folders, noisy commits, and accidental secret exposure.',
        approach: [
          'Packaged the backup flow as an installable skill with a shell script, docs, and a focused test harness.',
          'Synced only selected workspace, skill, and extension assets while excluding runtime state, logs, queues, databases, and credentials.',
          'Converted a plain-language request into Git diff review, Chinese update summary, commit message generation, commit, and push.',
        ],
        outcome:
          'The workflow became a reusable agent operation instead of a fragile personal checklist, with safer defaults and repeatable validation.',
      },
      tags: ['Skill', 'Backup', 'Git'],
      image: '/images/career_bg.png',
      link: 'https://github.com/S313S/openclaw-backup-skill',
    },
    {
      id: 'product-content-analyst',
      categoryId: 'workflow',
      title: 'Product Content Analyst',
      description:
        'A Streamlit MVP that turns a product link into selling points, a short video script, and Xiaohongshu copy.',
      detail: {
        problem:
          'Commerce content work starts with scattered product links, media, and manual interpretation before a creator can write anything useful.',
        approach: [
          'Built a two-layer scraping flow: static requests first, then Playwright rendering when title, image, or video data is missing.',
          'Added login-state reuse and manual confirmation for links that require authenticated browsing.',
          'Used AI output with a local-template fallback so the tool still produces a usable draft without a configured model key.',
        ],
        outcome:
          'A product URL can become an inspectable content brief, reducing the gap between raw product material and creator-ready scripts.',
      },
      tags: ['Streamlit', 'Scraping', 'Commerce'],
      image: '/images/careerDetail_bg.png',
      link: 'https://github.com/S313S/pd-data-analyst',
    },
    {
      id: 'social-fetch-pipeline',
      categoryId: 'workflow',
      title: 'Social Fetch Pipeline',
      description:
        'A GitHub-backed workflow for fetching Xiaohongshu and Twitter/X signals into a searchable AIGC content vault.',
      detail: {
        problem:
          'AIGC trend research depends on fast-moving social posts, but manual collection loses source context and makes later comparison hard.',
        approach: [
          'Connected platform fetch and search endpoints to a single content-management interface.',
          'Normalized notes, covers, tags, and source metadata so different social platforms can be reviewed together.',
          'Kept provider fallbacks configurable for Xiaohongshu search and single-note fetches.',
        ],
        outcome:
          'Research moved from isolated links into a vault that can be searched, filtered, and reused for product insight work.',
      },
      tags: ['XHS', 'Twitter', 'Pipeline'],
      image: '/images/bg_growpath.jpeg',
      link: 'https://github.com/S313S/AIGC_InsightVault',
    },
    {
      id: 'quality-filter-spec',
      categoryId: 'workflow',
      title: 'Quality Filter Spec',
      description:
        'A documented filtering layer for separating high-signal AIGC posts from noisy trend data.',
      detail: {
        problem:
          'A raw pile of viral posts is not automatically useful; product decisions need semantic quality, platform context, and evidence.',
        approach: [
          'Wrote a quality-filter specification covering structure, semantic tags, source reliability, and reviewer decisions.',
          'Separated trend evidence from generated summaries so weak model output can still be challenged.',
          'Added test scripts around data snapshots, prompt tagging, fallback covers, and URL normalization.',
        ],
        outcome:
          'The vault became more than a bookmark list: it gained a reviewable signal-processing workflow.',
      },
      tags: ['Filtering', 'Spec', 'Signals'],
      image: '/images/video-transition-poster.png',
      link: 'https://github.com/S313S/AIGC_InsightVault',
    },
    {
      id: 'cron-monitor',
      categoryId: 'workflow',
      title: 'Cron Monitor',
      description:
        'A scheduled monitoring surface for keeping AIGC signal collection alive without manual checking.',
      detail: {
        problem:
          'Trend monitoring loses value when collection only happens during a manual research session.',
        approach: [
          'Added cron-oriented API logic and response guidance for scheduled social-content monitoring.',
          'Stored run logs and handled timeout behavior so failures are visible instead of silent.',
          'Kept owner and RLS setup explicit for safer multi-user data access.',
        ],
        outcome:
          'The research system can keep collecting and reporting signals as an operational workflow.',
      },
      tags: ['Cron', 'Monitoring', 'Supabase'],
      image: '/images/growPath_03.png',
      link: 'https://github.com/S313S/AIGC_InsightVault',
    },
    {
      id: 'vibe-coding-workstation',
      categoryId: 'workflow',
      title: 'Vibe Coding Workstation',
      description:
        'A Chinese Vibe Coding workstation that combines translated development practice with a prompt library.',
      detail: {
        problem:
          'AI-assisted coding knowledge is often scattered across English references, prompt fragments, and personal notes.',
        approach: [
          'Organized Vibe Coding concepts into a Chinese learning and practice surface.',
          'Added prompt-library framing so patterns can be reused instead of rediscovered in every session.',
          'Kept the material close to hands-on building rather than only conceptual translation.',
        ],
        outcome:
          'The project works as a personal operating manual for faster, more structured AI-assisted development.',
      },
      tags: ['Prompt Library', 'Learning', 'Ops'],
      image: '/images/growPath_04.png',
      link: 'https://github.com/S313S/vibe-coding-cn',
    },
  ],
  vibecoding: [
    {
      id: 'professional-portfolio',
      categoryId: 'vibecoding',
      title: 'Professional Portfolio',
      description:
        'A long-form immersive portfolio built as a product surface, not a static resume.',
      detail: {
        problem:
          'A normal resume page could not show AI product judgment, visual taste, interaction craft, and real coding workflow in one place.',
        approach: [
          'Built full-screen narrative sections with scroll state machines, motion transitions, audio switching, and local media loading.',
          'Created standalone debug routes for complex sections so detail views can be inspected without replaying the whole page.',
          'Backed fragile interactions with logic tests and Playwright scripts for refresh, wheel, zoom, and navigation behavior.',
        ],
        outcome:
          'The site makes the personal brand inspectable through the product itself: story, visuals, interaction, and engineering all reinforce one another.',
      },
      tags: ['React', 'Motion', 'Portfolio'],
      image: '/images/after.png',
      link: 'https://github.com/S313S/professional-portfolio',
    },
    {
      id: 'works-detail-system',
      categoryId: 'vibecoding',
      title: 'Works Detail System',
      description:
        'The portfolio detail section that switches between visual works and coding projects inside one immersive stage.',
      detail: {
        problem:
          'The works page needed to present visual artifacts and engineering projects without feeling like two unrelated galleries.',
        approach: [
          'Used a shared detail stage with separate gallery and coding modes, each tuned to its own visual language.',
          'Kept project expansion inside the same card grid so scanning and deep reading stay connected.',
          'Added render tests for structure, compact expanded cards, night-sky palette, and diagonal gallery alignment.',
        ],
        outcome:
          'Coding projects can now be browsed as part of the same portfolio world instead of a detached technical appendix.',
      },
      tags: ['Detail View', 'Testing', 'UI'],
      image: '/images/before.png',
      link: 'https://github.com/S313S/professional-portfolio',
    },
    {
      id: 'friendbook-finale',
      categoryId: 'vibecoding',
      title: 'FriendBook Finale',
      description:
        'A final interactive friend-book scene with mini games, local progress, avatars, medals, and a message board.',
      detail: {
        problem:
          'The ending of the portfolio needed to feel personal and memorable rather than becoming a plain contact form.',
        approach: [
          'Designed three small games around attention, timing, and recognition rather than pure decoration.',
          'Modeled game state in testable logic files so interaction rules can be verified outside the browser.',
          'Used local storage progress, hidden avatars, and medals to make the final section feel collectible.',
        ],
        outcome:
          'The portfolio ends with an interaction that invites participation and makes the visitor relationship part of the work.',
      },
      tags: ['Game UI', 'State', 'Finale'],
      image: '/images/growPath_01.png',
      link: 'https://github.com/S313S/professional-portfolio',
    },
    {
      id: 'shopping-remix',
      categoryId: 'vibecoding',
      title: 'Shopping Remix',
      description:
        'An e-commerce prototype that combines product input, AI analysis, upload flow, and generated creative output.',
      detail: {
        problem:
          'A commerce tool needed to show how competitor references and product material could become an interactive AI generation workflow.',
        approach: [
          'Built form, uploader, analysis-result, and generated-gallery components around a single product workflow.',
          'Connected Gemini service logic to structured product analysis and content generation.',
          'Kept the prototype small enough to evaluate core interaction before expanding into a full commerce platform.',
        ],
        outcome:
          'The project demonstrates a fast path from competitor/product reference to a usable AI commerce interface.',
      },
      tags: ['E-commerce', 'Prototype', 'Gemini'],
      image: '/images/growPath_02.png',
      link: 'https://github.com/S313S/shopping',
    },
    {
      id: 'visual-bridge-v2',
      categoryId: 'vibecoding',
      title: 'Visual Bridge V2',
      description:
        'A pure frontend image-direction prototype using OpenRouter image and text models.',
      detail: {
        problem:
          'Visual ideation tools often hide the prompt-to-image process, making it hard to refine direction quickly.',
        approach: [
          'Kept model configuration explicit through VITE OpenRouter environment variables.',
          'Used a lightweight Vite app so prompt, model, and result iteration can happen inside a fast local loop.',
          'Separated the prototype from production backend concerns while documenting why browser-exposed keys need a backend later.',
        ],
        outcome:
          'The project is a quick proving ground for image-generation product direction before hardening the architecture.',
      },
      tags: ['OpenRouter', 'Image Gen', 'Prototype'],
      image: '/images/works-detail-07-square.png',
      link: 'https://github.com/S313S/Visual-Bridge-V2',
    },
    {
      id: 'portfolio-debug-routes',
      categoryId: 'vibecoding',
      title: 'Portfolio Debug Routes',
      description:
        'Development-only routes that make complex portfolio scenes easier to test, inspect, and repair.',
      detail: {
        problem:
          'Immersive scroll scenes are expensive to debug when every change requires manually reaching the right page state.',
        approach: [
          'Added standalone debug entries for friend-book, works detail, career detail, and codex report views.',
          'Allowed query parameters to open coding mode or a specific active project directly.',
          'Kept debug routing limited to development mode so production visitors only see the intended narrative flow.',
        ],
        outcome:
          'The workflow makes high-motion UI repair faster and reduces the chance of fixing one scene while breaking another.',
      },
      tags: ['Debugging', 'Routes', 'QA'],
      image: '/images/workDetail_bg.jpeg',
      link: 'https://github.com/S313S/professional-portfolio',
    },
  ],
  'ai-product': [
    {
      id: 'aigc-insight-vault',
      categoryId: 'ai-product',
      title: 'AIGC Insight Vault',
      description:
        'A research product for collecting, monitoring, and interpreting viral AIGC content signals.',
      detail: {
        problem:
          'AIGC product ideas need evidence from real social behavior, but viral posts are noisy, perishable, and hard to compare manually.',
        approach: [
          'Built dashboard, detail, search-results, monitoring, settings, and chat views around a single insight workflow.',
          'Integrated social fetch/search APIs, Supabase persistence, authentication, fallback covers, and semantic tagging.',
          'Used docs and tests to keep platform-specific fetching, quality filtering, and fallback rendering reviewable.',
        ],
        outcome:
          'The product turns scattered AIGC posts into a reusable research layer for trend discovery and product judgment.',
      },
      tags: ['Insight', 'Dashboard', 'AIGC'],
      image: '/images/careerDetail_litteleBg_01.png',
      link: 'https://github.com/S313S/AIGC_InsightVault',
    },
    {
      id: 'visual-bridge-assistance',
      categoryId: 'ai-product',
      title: 'Visual Bridge Assistance',
      description:
        'An AI visual communication assistant for turning vague client intent into concrete image references.',
      detail: {
        problem:
          'Clients often know the feeling they want but cannot express it in language that designers can directly execute.',
        approach: [
          'Built a chat-first React app with image gallery, thought panel, settings, and a local knowledge base.',
          'Connected Gemini and Volcengine service layers so text understanding and visual generation can work together.',
          'Added GitHub Pages and Cloudflare Worker deployment paths to make the prototype easier to share.',
        ],
        outcome:
          'The tool reframes generation as communication support: it helps both sides inspect and align on visual direction.',
      },
      tags: ['Visual Brief', 'Gemini', 'Design'],
      image: '/images/careerDetail_litteleBg_02.png',
      link: 'https://github.com/S313S/Visual-Bridge-assistance',
    },
    {
      id: 'commerce-script-generator',
      categoryId: 'ai-product',
      title: 'Commerce Script Generator',
      description:
        'A product-content workflow that converts raw item pages into platform-ready selling scripts.',
      detail: {
        problem:
          'Small commerce teams need repeatable content output, but product analysis, script structure, and platform tone are usually handled separately.',
        approach: [
          'Pulled product title, main image, and video signals from a pasted link or shared text.',
          'Generated selling-point breakdowns, 30-second video scripts, and Xiaohongshu-style rewrites in one flow.',
          'Added scraping fallbacks and browser login reuse to survive real-world page variation.',
        ],
        outcome:
          'The project shows how AI can move from generic writing to a practical commerce operations assistant.',
      },
      tags: ['Commerce', 'Script', 'Ops'],
      image: '/images/careerDetail_litteleBg_03.png',
      link: 'https://github.com/S313S/pd-data-analyst',
    },
    {
      id: 'social-trend-monitor',
      categoryId: 'ai-product',
      title: 'Social Trend Monitor',
      description:
        'A monitoring product concept for watching AIGC topics instead of manually checking platforms.',
      detail: {
        problem:
          'Knowing which AI formats are rising requires repeated platform checking, but manual collection is too inconsistent for product work.',
        approach: [
          'Added monitoring UI and cron-oriented API routes around saved topics and collection runs.',
          'Stored run logs, normalized provider responses, and surfaced fetch failures as product states.',
          'Connected the idea back to the Feishu research method: search keywords, filter high-engagement content, tag features, then extract common patterns.',
        ],
        outcome:
          'The monitor makes AIGC trend discovery an operating system rather than an occasional research sprint.',
      },
      tags: ['Monitoring', 'Trends', 'Signals'],
      image: '/images/careerDetail_map.png',
      link: 'https://github.com/S313S/AIGC_InsightVault',
    },
    {
      id: 'model-customization-playbook',
      categoryId: 'ai-product',
      title: 'Model Customization Playbook',
      description:
        'A product-thinking framework for choosing between prompt engineering, fine-tuning, and feedback training.',
      detail: {
        problem:
          'AI product discussions often jump to model training before clarifying data, task difficulty, expected outputs, and evaluation criteria.',
        approach: [
          'Structured the decision path from prompt engineering to SFT, CPT, DPO, and manual/model-assisted evaluation.',
          'Separated low-cost validation from expensive customization so product teams can prove value earlier.',
          'Kept domain data, positive/negative examples, and scoring criteria visible as product requirements.',
        ],
        outcome:
          'The framework helps explain AI implementation choices in product language instead of only model terminology.',
      },
      tags: ['PE', 'Fine-tuning', 'Evaluation'],
      image: '/images/top-title.png',
      link: 'https://github.com/S313S/AIGC_InsightVault',
    },
    {
      id: 'aigc-creation-toolchain',
      categoryId: 'ai-product',
      title: 'AIGC Creation Toolchain',
      description:
        'A documented creator workflow covering image generation, image-to-video, character motion, and marketing video tests.',
      detail: {
        problem:
          'AIGC creation is easy to demo once, but hard to turn into repeatable product value without knowing which tool fits which creative need.',
        approach: [
          'Mapped creative needs to tools such as Midjourney, ComfyUI, Jimeng, Kling, Pika, Veo, and Live Portrait.',
          'Recorded inputs, prompts, outputs, limitations, and recovery patterns like tail-frame stitching for longer AI videos.',
          'Connected creator experiments to product thinking: lower learning cost, workflow the viral play, and build community support.',
        ],
        outcome:
          'The material supports both personal creation and AI product judgment by showing how workflows become repeatable.',
      },
      tags: ['AIGC', 'Video', 'Workflow'],
      image: '/images/easel-removebg.png',
      link: 'https://github.com/S313S/professional-portfolio',
    },
  ],
};

const friendBookBetweenTwoPagesScenes: FriendBookBetweenTwoPagesScene[] = [
  {
    id: 'moon-cottage',
    baseImage: '/images/friend-book-between-two-pages/base-scene-v1.png',
    variantImage: '/images/friend-book-between-two-pages/variant-scene-v1.png',
    aspectRatio: 2752 / 1536,
    targets: [
      {
        id: 'moon-stamp',
        label: 'moon seal',
        x: 17,
        y: 15,
        width: 18,
        height: 18,
        hitArea: [
          { x: 17, y: 15 },
          { x: 35, y: 15 },
          { x: 35, y: 33 },
          { x: 17, y: 33 },
        ],
      },
      {
        id: 'cat-tail',
        label: 'cat tail',
        x: 77,
        y: 75,
        width: 17,
        height: 15,
        hitArea: [
          { x: 73, y: 71 },
          { x: 90, y: 71 },
          { x: 90, y: 86 },
          { x: 73, y: 86 },
        ],
      },
      {
        id: 'page-fold',
        label: 'page fold',
        x: 83,
        y: 19,
        width: 10,
        height: 12,
        hitArea: [
          { x: 84, y: 7 },
          { x: 97, y: 7 },
          { x: 97, y: 21 },
          { x: 88, y: 21 },
        ],
      },
    ],
  },
  {
    id: 'moon-bridge',
    baseImage: '/images/friend-book-between-two-pages/base-scene-v2.png',
    variantImage: '/images/friend-book-between-two-pages/variant-scene-v2.png',
    aspectRatio: 2752 / 1536,
    targets: [
      {
        id: 'bridge-lantern',
        label: 'bridge lantern',
        x: 47,
        y: 58,
        width: 10,
        height: 20,
        hitArea: [
          { x: 44, y: 54 },
          { x: 51, y: 54 },
          { x: 51, y: 75 },
          { x: 44, y: 75 },
        ],
      },
      {
        id: 'tea-cup',
        label: 'tea cup',
        x: 53,
        y: 80,
        width: 15,
        height: 17,
        hitArea: [
          { x: 52, y: 77 },
          { x: 67, y: 77 },
          { x: 67, y: 94 },
          { x: 52, y: 94 },
        ],
      },
      {
        id: 'bamboo-cluster',
        label: 'bamboo cluster',
        x: 61,
        y: 36,
        width: 15,
        height: 18,
        hitArea: [
          { x: 53, y: 27 },
          { x: 70, y: 30 },
          { x: 76, y: 48 },
          { x: 58, y: 50 },
        ],
      },
    ],
  },
  {
    id: 'moon-shrine',
    baseImage: '/images/friend-book-between-two-pages/base-scene-v3.png',
    variantImage: '/images/friend-book-between-two-pages/variant-scene-v3.png',
    aspectRatio: 2752 / 1536,
    targets: [
      {
        id: 'torii-plaque',
        label: 'torii plaque',
        x: 41,
        y: 36,
        width: 11,
        height: 11,
        hitArea: [
          { x: 34, y: 28 },
          { x: 53, y: 28 },
          { x: 53, y: 51 },
          { x: 34, y: 51 },
        ],
      },
      {
        id: 'blossom-branch',
        label: 'blossom branch',
        x: 58,
        y: 38,
        width: 15,
        height: 16,
        hitArea: [
          { x: 53, y: 31 },
          { x: 71, y: 31 },
          { x: 74, y: 47 },
          { x: 56, y: 49 },
        ],
      },
      {
        id: 'cushion-tassel',
        label: 'cushion tassel',
        x: 92,
        y: 82,
        width: 8,
        height: 15,
        hitArea: [
          { x: 86, y: 74 },
          { x: 100, y: 74 },
          { x: 100, y: 98 },
          { x: 86, y: 98 },
        ],
      },
    ],
  },
  {
    id: 'dusk-field-road',
    baseImage: '/images/friend-book-between-two-pages/base-scene-v4.png',
    variantImage: '/images/friend-book-between-two-pages/variant-scene-v4.png',
    aspectRatio: 2752 / 1536,
    targets: [
      {
        id: 'sign-charm',
        label: 'sign charm',
        x: 16,
        y: 49,
        width: 8,
        height: 12,
        hitArea: [
          { x: 15, y: 49 },
          { x: 23, y: 49 },
          { x: 23, y: 61 },
          { x: 15, y: 61 },
        ],
      },
      {
        id: 'notebook-corner',
        label: 'notebook corner',
        x: 70,
        y: 63,
        width: 10,
        height: 11,
        hitArea: [
          { x: 70, y: 63 },
          { x: 80, y: 63 },
          { x: 80, y: 74 },
          { x: 70, y: 74 },
        ],
      },
      {
        id: 'schoolbag-badge',
        label: 'schoolbag badge',
        x: 87,
        y: 56,
        width: 6,
        height: 8,
        hitArea: [
          { x: 86, y: 55 },
          { x: 93, y: 55 },
          { x: 93, y: 64 },
          { x: 86, y: 64 },
        ],
      },
    ],
  },
];

const friendBookMoonRunLevel: FriendBookMoonRunLevel = {
  viewportWidth: 860,
  worldWidth: 2220,
  worldHeight: 380,
  groundY: 304,
  artwork: {
    player: '/images/friend-book-moon-run/moon-runner-cat.svg',
    enemy: '/images/friend-book-moon-run/ink-mouse.svg',
    platform: '/images/friend-book-moon-run/paper-platform.svg',
    finish: '/images/friend-book-moon-run/moon-gate.svg',
    heart: '/images/friend-book-moon-run/heart-token.svg',
  },
  start: {
    x: 88,
    y: 258,
  },
  finish: {
    x: 2050,
    y: 168,
    width: 74,
    height: 128,
  },
  platforms: [
    { id: 'step-1', x: 310, y: 244, width: 180, height: 16 },
    { id: 'step-2', x: 700, y: 216, width: 204, height: 16 },
    { id: 'step-3', x: 1030, y: 190, width: 168, height: 16 },
    { id: 'step-4', x: 1380, y: 228, width: 222, height: 16 },
    { id: 'step-5', x: 1700, y: 196, width: 204, height: 16 },
  ],
  pitZones: [
    { startX: 522, width: 124 },
    { startX: 1246, width: 150 },
  ],
  enemies: [
    {
      id: 'paper-hopper',
      x: 784,
      y: 182,
      patrolMinX: 724,
      patrolMaxX: 842,
      width: 38,
      height: 34,
      speed: 92,
    },
    {
      id: 'ink-mouse',
      x: 1768,
      y: 162,
      patrolMinX: 1722,
      patrolMaxX: 1846,
      width: 40,
      height: 34,
      speed: 108,
    },
  ],
  decorations: [
    { id: 'moon-disc', x: 1900, y: 56, width: 104, height: 104, kind: 'moon', opacity: 0.9 },
    { id: 'paper-star-1', x: 470, y: 56, width: 28, height: 28, kind: 'star', opacity: 0.78 },
    { id: 'paper-star-2', x: 1280, y: 92, width: 22, height: 22, kind: 'star', opacity: 0.74 },
    { id: 'paper-strip-1', x: 1110, y: 132, width: 86, height: 20, kind: 'paper', opacity: 0.54 },
  ],
};

const friendBookQuizQuestionBank: FriendBookQuizQuestion[] = [
  {
    id: 'napoleon-crossing-the-alps',
    silhouetteImage: '/images/friend-book-quiz/Painting exam/拿破仑-剪影图.png',
    referenceImage: '/images/friend-book-quiz/Painting exam/拿破仑.jpg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: [
      'Benjamin Franklin',
      'Richard Feynman',
      'Napoleon Crossing the Alps',
      'Mona Lisa',
    ],
    correctAnswer: 'Napoleon Crossing the Alps',
    resultCopy: 'The rearing horse and cloak point to Napoleon Crossing the Alps.',
  },
  {
    id: 'abraham-lincoln',
    silhouetteImage: '/images/friend-book-quiz/Painting exam/亚伯拉罕·林肯-剪影图.png',
    referenceImage: '/images/friend-book-quiz/Painting exam/亚伯拉罕·林肯.jpeg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: [
      'Abraham Lincoln',
      'Benjamin Franklin',
      'Napoleon Crossing the Alps',
      'Nyanko-sensei and Natsume',
    ],
    correctAnswer: 'Abraham Lincoln',
    resultCopy: 'The stovepipe hat and beard identify Abraham Lincoln.',
  },
  {
    id: 'benjamin-franklin',
    silhouetteImage: '/images/friend-book-quiz/Painting exam/本杰明·富兰克林-剪影图.png',
    referenceImage: '/images/friend-book-quiz/Painting exam/本杰明·富兰克林.jpeg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: [
      'Benjamin Franklin',
      'Abraham Lincoln',
      'Mona Lisa',
      'Napoleon Crossing the Alps',
    ],
    correctAnswer: 'Benjamin Franklin',
    resultCopy: 'The round spectacles and period portrait profile belong to Benjamin Franklin.',
  },
  {
    id: 'nyanko-sensei-and-natsume',
    silhouetteImage: '/images/friend-book-quiz/Painting exam/猫咪老师跟夏目-剪影图.png',
    referenceImage: '/images/friend-book-quiz/Painting exam/猫咪老师跟夏目.jpg',
    prompt: 'Observe the silhouette and guess who it is.',
    options: [
      'Nyanko-sensei and Natsume',
      'Mona Lisa',
      'Benjamin Franklin',
      'Napoleon Crossing the Alps',
    ],
    correctAnswer: 'Nyanko-sensei and Natsume',
    resultCopy: 'The paired figures reveal Nyanko-sensei and Natsume from Book of Friends.',
  },
  {
    id: 'mona-lisa',
    silhouetteImage: '/images/friend-book-quiz/Painting exam/蒙娜丽莎-剪影图.png',
    referenceImage: '/images/friend-book-quiz/Painting exam/蒙娜丽莎.webp',
    prompt: 'Observe the silhouette and guess who it is.',
    options: [
      'Mona Lisa',
      'Benjamin Franklin',
      'Abraham Lincoln',
      'Nyanko-sensei and Natsume',
    ],
    correctAnswer: 'Mona Lisa',
    resultCopy: 'The iconic seated pose and folded hands point to the Mona Lisa.',
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
        'Cross the quiet platforms, dodge the night creatures, and reach the moon gate.',
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
  betweenTwoPagesScenes: friendBookBetweenTwoPagesScenes,
  moonRunLevel: friendBookMoonRunLevel,
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
      emptyDescription: 'Reach the moon gate with a few hearts left to write this page.',
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
