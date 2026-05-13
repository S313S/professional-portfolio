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
      'Node-based AI workflows built with ComfyUI, Coze, and Wordware to connect inputs, model steps, data handling, and repeatable outputs.',
    iconLabel: 'WF',
    accent: '#62d98d',
  },
  {
    id: 'vibecoding',
    sequence: '02',
    title: 'Vibecoding',
    description:
      'AI-assisted builds outside the workflow and product buckets: portfolio systems, commerce demos, reusable skills, and learning workstations.',
    iconLabel: 'VC',
    accent: '#8ad9ff',
  },
  {
    id: 'ai-product',
    sequence: '03',
    title: 'AI product',
    description:
      'Deployed or product-shaped AI applications with persistent data, structured interaction logic, and clear user workflows.',
    iconLabel: 'AI',
    accent: '#f4c46b',
  },
];

const codingProjects: Record<CodingCategoryId, CodingProjectCard[]> = {
  workflow: [
    {
      id: 'comfyui-aigc-workflow',
      categoryId: 'workflow',
      title: 'ComfyUI AIGC Creation Workflow',
      description:
        'A node-based AIGC image and video creation workflow for making visual ideas repeatable instead of one-off prompts.',
      detail: {
        problem:
          'AIGC creation can look impressive once, but without a reusable node workflow it is hard to repeat style, inputs, motion, and recovery steps.',
        approach: [
          'Used ComfyUI and Stable Diffusion style workflows to turn text, image references, model choices, and output checks into visible steps.',
          'Documented image generation, image-to-video, tail-frame stitching, character motion, and marketing-video experiments from the Feishu portfolio.',
          'Kept the workflow framed around creator needs: repeatability, lower learning cost, and clearer tool selection for different visual jobs.',
        ],
        outcome:
          'The material shows AIGC creation as an inspectable workflow, not just a gallery of final images.',
      },
      tags: ['ComfyUI', 'AIGC', 'Nodes'],
      image: '/images/CodingWorks/comfyui-aigc-workflow-cover.svg',
      link: '#',
    },
    {
      id: 'coze-social-data-fetch',
      categoryId: 'workflow',
      title: 'Coze Social Data Fetch Workflow',
      description:
        'A Coze workflow for fetching hot short-video data by keyword and writing structured results into Feishu Base.',
      detail: {
        problem:
          'Social trend research needs repeated keyword collection, but manual copying loses rank, author, title, and continuation context.',
        approach: [
          'Connected a Coze data-download workflow with a Feishu Base destination so collected items can append into a structured table.',
          'Used cursor-style continuation because single workflow runs return limited batches under platform execution limits.',
          'Let the model normalize string-like plugin output into fields such as title, author, and content before storage.',
        ],
        outcome:
          'The workflow turns platform search into a repeatable data-collection loop for later AIGC trend analysis.',
      },
      tags: ['Coze', 'Feishu Base', 'Data'],
      image: '/images/CodingWorks/Coze_SocialDataFetch.png',
      link: 'https://www.coze.cn/work_flow?bot_id=7468859639569186879&space_id=7463017999541207052&workflow_id=7467024551915782180',
    },
    {
      id: 'xhs-comment-translation-workflow',
      categoryId: 'workflow',
      title: 'XHS Comment Translation Workflow',
      description:
        'A translation and reply workflow for the wave of international users who entered Xiaohongshu during the TikTok ban scare.',
      detail: {
        problem:
          'When TikTok faced a ban scare, many international users moved into Xiaohongshu, creating a real need for bilingual translation and reply support inside comment threads.',
        approach: [
          'Used a Coze crawler workflow as the data source when the app platform could not directly access Xiaohongshu comments.',
          'Added a cursor marker to locate already-fetched comments across repeated workflow calls.',
          'Designed prompts that preserve parent and child comment relationships while producing bilingual translation and reply-ready output.',
        ],
        outcome:
          'The workflow turned a sudden cross-cultural platform migration into a structured assistant for understanding and responding to comments.',
      },
      tags: ['Wordware', 'Coze', 'Translation'],
      image: "/images/CodingWorks/XiaoHongShu'sTranslation.png",
      link: 'https://app.wordware.ai/explore/apps/aa67898c-7bc2-4bd8-916a-e76afbed664b?tab=playground',
    },
  ],
  vibecoding: [
    {
      id: 'professional-portfolio',
      categoryId: 'vibecoding',
      title: 'Professional Portfolio',
      description:
        'A long-form immersive portfolio built with AI-assisted iteration, custom interactions, and local verification routes.',
      detail: {
        problem:
          'A normal resume page could not show AI product judgment, visual taste, interaction craft, and real coding workflow in one place.',
        approach: [
          'Built full-screen narrative sections with scroll state machines, motion transitions, audio switching, local media loading, and responsive debug entry points.',
          'Folded works detail, FriendBook finale, and section-specific repair routes into one cohesive portfolio system instead of separate display cards.',
          'Backed fragile interactions with logic tests and Playwright scripts for refresh, wheel, zoom, navigation, and detail-view behavior.',
        ],
        outcome:
          'The site itself became the proof of work: story, visuals, interaction, and engineering all reinforce the personal brand.',
      },
      tags: ['React', 'Motion', 'Portfolio'],
      image: '/images/CodingWorks/portfolioWorks.jpg',
      link: 'http://xiaoci-ai.com/',
    },
    {
      id: 'shopping',
      categoryId: 'vibecoding',
      title: 'Shopping',
      description:
        'An e-commerce competitor-remix prototype for practicing product page structure, interaction, and AI-assisted iteration.',
      detail: {
        problem:
          'Commerce interfaces need many small product decisions before they feel usable: product hierarchy, visual emphasis, input flow, and conversion cues.',
        approach: [
          'Used the shopping repo as a fast vibecoding exercise around e-commerce layout and competitor reference reconstruction.',
          'Kept the card here at project level rather than inventing separate sub-features without stronger material evidence.',
          'Left the public URL unset until the project has a deployed or screenshot-backed browsing surface.',
        ],
        outcome:
          'The project remains a useful coding sample for interface reconstruction, but still needs a dedicated screenshot before final publication polish.',
      },
      tags: ['Commerce', 'Prototype', 'UI'],
      image: '/images/CodingWorks/shopping-vibecoding-cover.svg',
      link: 'https://github.com/S313S/shopping',
    },
    {
      id: 'openclaw-backup-skill',
      categoryId: 'vibecoding',
      title: 'OpenClaw Backup Skill',
      description:
        'A reusable local agent skill that turns a natural-language backup request into a reviewed GitHub sync.',
      detail: {
        problem:
          'OpenClaw assets needed a repeatable GitHub backup path, but manual syncs risked missed folders, noisy commits, and accidental secret exposure.',
        approach: [
          'Packaged the operation as an installable skill with a shell script, docs, and a focused validation harness.',
          'Synced selected workspace, skill, and extension assets while excluding runtime state, logs, queues, databases, and credentials.',
          'Converted a plain-language request into Git diff review, Chinese update summary, commit-message generation, commit, and push.',
        ],
        outcome:
          'The backup flow became a reusable vibecoding operation instead of a fragile personal checklist.',
      },
      tags: ['Skill', 'Backup', 'Git'],
      image: '/images/CodingWorks/openclaw-backup-skill.png',
      link: 'https://github.com/S313S/openclaw-backup-skill',
    },
    {
      id: 'vibe-coding-workstation',
      categoryId: 'vibecoding',
      title: 'Vibe Coding Workstation',
      description:
        'A Chinese Vibe Coding workstation that combines translated development practice, experience notes, and prompt-library thinking.',
      detail: {
        problem:
          'AI-assisted coding knowledge is often scattered across English references, personal notes, and prompt fragments.',
        approach: [
          'Organized Vibe Coding concepts into a Chinese learning and practice surface.',
          'Added prompt-library framing so useful development patterns can be reused instead of rediscovered every session.',
          'Kept the material close to hands-on building rather than only conceptual translation.',
        ],
        outcome:
          'The project works as a personal operating manual for faster, more structured AI-assisted development.',
      },
      tags: ['Prompt Library', 'Learning', 'Ops'],
      image: '/images/CodingWorks/vibe-coding-workstation-cover.svg',
      link: 'https://github.com/S313S/vibe-coding-cn',
    },
    {
      id: 'ai-teaching-video-interactive-lesson',
      categoryId: 'vibecoding',
      title: 'AI Teaching Video & Interactive Lesson',
      description:
        "A vibe-coded learning prototype that turns a learner's question into an auto-play HTML teaching animation and interactive lesson.",
      detail: {
        problem:
          'When a learner meets an unfamiliar concept, dense reference text can be harder to absorb than a short visual explanation.',
        approach: [
          'Started from a topic and keywords, then asked a large model to generate auto-play HTML animation code instead of writing the frames by hand.',
          'Iterated the prompt template with feedback so the model output could move closer to a clean teaching-video rhythm.',
          'Extended the same idea into locally opened interactive HTML lessons, including a black-hole exploration example from the Feishu attachment.',
        ],
        outcome:
          'The experiment shows how a question can become a lightweight animated or interactive learning material without a full production platform.',
      },
      tags: ['HTML Animation', 'Learning', 'Prompting'],
      image: '/images/CodingWorks/Al TeachingVideo.png',
      link: '#',
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
      image: '/images/CodingWorks/AIGC_InsightVault_dashboard.png',
      link: 'https://aigc-insight-vault.vercel.app/',
    },
    {
      id: 'visual-bridge-assistance',
      categoryId: 'ai-product',
      title: 'Visual Bridge Assistance',
      description:
        'An AI visual-brief product for turning vague client intent into concrete prompts, references, and image-gallery decisions.',
      detail: {
        problem:
          'Clients often know the feeling they want but cannot express it in language that designers can directly execute.',
        approach: [
          'Built a chat-first React app with image gallery, thought panel, settings, and a local knowledge base.',
          'Connected the Visual Bridge repositories into one product story: early assistance prototype, then V2 sharing through GitHub Pages.',
          'Kept the interaction centered on designer-client alignment rather than treating image generation as a standalone toy.',
        ],
        outcome:
          'The tool reframes generation as communication support: it helps both sides inspect and align on visual direction.',
      },
      tags: ['Visual Brief', 'Gemini', 'Design'],
      image: '/images/CodingWorks/Visual Bridge Assistance_chat.png',
      link: 'https://s313s.github.io/Visual-Bridge-V2/',
    },
    {
      id: 'pd-data-analyst',
      categoryId: 'ai-product',
      title: 'Product Data Analyst',
      description:
        'A local Streamlit AI product that turns product links and materials into selling points, scripts, and creator-ready copy.',
      detail: {
        problem:
          'Commerce content work starts with scattered product links, media, and manual interpretation before a creator can write anything useful.',
        approach: [
          'Built a two-layer scraping flow: static requests first, then Playwright rendering when title, image, or video data is missing.',
          'Generated selling-point breakdowns, 30-second video scripts, and Xiaohongshu-style rewrites in one inspectable result page.',
          'Added AI output with a local-template fallback so the MVP still produces a usable draft without a configured model key.',
        ],
        outcome:
          'The product turns raw product material into a structured content assistant, while staying local until a public deployment is ready.',
      },
      tags: ['Streamlit', 'Commerce', 'Local MVP'],
      image: '/images/CodingWorks/pd-data-analyst.png',
      link: '#',
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
