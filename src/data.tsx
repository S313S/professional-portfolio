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
      detail: {
        problem:
          'Release work was moving through scattered threads, so blockers and owner gaps surfaced too late for calm correction.',
        approach: [
          'Grouped every handoff by owner, blocker state, and review readiness.',
          'Separated urgent risks from routine progress so the board could be scanned quickly.',
          'Kept next actions visible beside each item instead of burying them in notes.',
        ],
        outcome:
          'The team could spot fragile handoffs earlier and turn review follow-up into a visible operating rhythm.',
      },
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
      detail: {
        problem:
          'Prompt changes were easy to approve on tone while missing assumptions, regressions, and output-shape drift.',
        approach: [
          'Split review into assumptions, expected format, model behavior, and edge-case checks.',
          'Created a repeatable acceptance pass that could be reused across prompt iterations.',
          'Made failure notes short enough to feed directly into the next revision.',
        ],
        outcome:
          'Prompt reviews became easier to compare across versions, reducing subjective approvals and late fixes.',
      },
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
      detail: {
        problem:
          'Useful decisions and references were getting lost between chat history, screenshots, and implementation notes.',
        approach: [
          'Turned raw signals into lightweight entries with source, decision, and follow-up context.',
          'Grouped visual references and build notes around the project moment where they mattered.',
          'Kept the archive searchable without forcing a heavy documentation workflow.',
        ],
        outcome:
          'Past decisions became easier to recover, making future edits less dependent on memory or repeated explanations.',
      },
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
      detail: {
        problem:
          'Reviewers needed to jump between diff context, intent, and follow-up actions before they could make a decision.',
        approach: [
          'Placed rationale, changed surface, and next action in a single inspection path.',
          'Prioritized unresolved questions over passive status text.',
          'Kept the layout dense enough for repeated review without feeling like a dashboard wall.',
        ],
        outcome:
          'Review sessions became more direct, with fewer context switches and clearer decision points.',
      },
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
      detail: {
        problem:
          'AI-assisted implementation could move quickly, but work became harder to trust when validation was not attached to each batch.',
        approach: [
          'Broke implementation into small batches with an explicit verification command per batch.',
          'Kept acceptance notes close to the task list so checks did not become an afterthought.',
          'Made blockers visible before they turned into hidden scope changes.',
        ],
        outcome:
          'The workflow made faster delivery more reviewable and reduced uncertainty around what had actually been validated.',
      },
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
      detail: {
        problem:
          'Ambiguous requests were jumping straight into build mode before scope, constraints, and verification were stable.',
        approach: [
          'Converted fuzzy intent into concrete success criteria and implementation steps.',
          'Separated product decisions from discoverable repo facts to avoid unnecessary questions.',
          'Included test checkpoints so the playbook could be handed to another builder.',
        ],
        outcome:
          'The playbook helped turn open-ended asks into work that was easier to execute, review, and continue later.',
      },
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
      detail: {
        problem:
          'Motion ideas were hard to judge from static references, and copy changes often shifted the timing after the fact.',
        approach: [
          'Built the interaction as a live prototype so timing, copy, and layout could be tuned together.',
          'Used small animation passes to compare pacing without rewriting the whole scene.',
          'Kept the prototype close to production markup to reduce translation loss.',
        ],
        outcome:
          'The team could make faster decisions about motion feel because the prototype showed the real interaction rhythm.',
      },
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
      detail: {
        problem:
          'The page needed a sharper direction, but the strongest visual ideas were still split across references and rough notes.',
        approach: [
          'Translated mood references into concrete layout, color, and component experiments.',
          'Tested the visual hierarchy directly in the browser instead of extending static mockups.',
          'Removed ideas that looked interesting but did not support the portfolio story.',
        ],
        outcome:
          'The remix turned scattered inspiration into a usable direction with clearer hierarchy and faster iteration paths.',
      },
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
      detail: {
        problem:
          'Hero directions looked promising in isolation, but it was unclear which one would hold up with real type and interaction.',
        approach: [
          'Created a playground for swapping type scale, image depth, and foreground controls.',
          'Compared scenes at multiple viewport sizes before choosing the final direction.',
          'Kept test variants lightweight so weak ideas could be discarded quickly.',
        ],
        outcome:
          'The final hero direction was selected from working interaction evidence rather than static preference alone.',
      },
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
      detail: {
        problem:
          'Early product ideas needed spatial validation, but static comps were too slow for rapid scene-level exploration.',
        approach: [
          'Turned layout sketches into reusable scene blocks that could be rearranged quickly.',
          'Validated density, focus, and scrolling behavior in the same environment as the final page.',
          'Kept experiments constrained to the decision being tested.',
        ],
        outcome:
          'The scene builder made abstract product ideas easier to evaluate before committing to a full implementation.',
      },
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
      detail: {
        problem:
          'Stakeholders needed to compare interface tone and density, but async screenshots made feedback slow and fragmented.',
        approach: [
          'Prepared component alternatives that could be swapped live during the session.',
          'Focused discussion on hierarchy, scan speed, and emotional tone instead of isolated styling.',
          'Captured decisions immediately as implementation changes.',
        ],
        outcome:
          'The session compressed visual alignment into a shorter loop and left behind a clearer component direction.',
      },
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
      detail: {
        problem:
          'The interface worked structurally, but weak contrast and uneven surfaces made it feel unfinished.',
        approach: [
          'Audited text, borders, and background surfaces for hierarchy breaks.',
          'Adjusted contrast in small passes so the existing layout did not need to be rebuilt.',
          'Kept accent colors restrained to avoid turning polish into a new visual system.',
        ],
        outcome:
          'The pass made the interface feel more deliberate while preserving delivery speed and existing structure.',
      },
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
      detail: {
        problem:
          'Agent workflows could feel opaque when operators could not quickly read state, confidence, or the next best action.',
        approach: [
          'Separated current status, confidence cues, and recommended actions into distinct visual zones.',
          'Used plain-language state labels instead of exposing raw model or system details.',
          'Designed the console around operator decisions rather than agent activity alone.',
        ],
        outcome:
          'The concept made agent behavior easier to supervise and turned uncertain states into clearer operator choices.',
      },
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
      detail: {
        problem:
          'Vague requests caused repeated clarification loops before a builder had enough structure to start safely.',
        approach: [
          'Guided users from intent to constraints, scope, and acceptance criteria.',
          'Turned missing details into focused prompts instead of open-ended forms.',
          'Formatted the output as an execution-ready brief.',
        ],
        outcome:
          'The copilot reduced back-and-forth by producing clearer inputs for planning, implementation, and review.',
      },
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
      detail: {
        problem:
          'Research signals and model summaries were useful separately, but product decisions needed a combined readout.',
        approach: [
          'Grouped raw user signals beside synthesized themes and strategic implications.',
          'Made source context visible so summaries could be challenged or trusted quickly.',
          'Used concise sections to keep the surface useful for repeated product review.',
        ],
        outcome:
          'The surface helped move from scattered insight capture to a clearer product interpretation layer.',
      },
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
      detail: {
        problem:
          'Prompt decisions, UI states, and validation notes were drifting apart as implementation evolved.',
        approach: [
          'Linked each prompt or behavior decision to the UI state it affected.',
          'Attached expected outcomes and test notes to the same planning surface.',
          'Kept the structure lightweight enough for iterative product work.',
        ],
        outcome:
          'Spec changes became easier to trace, reducing confusion when implementation and prompt behavior changed together.',
      },
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
      detail: {
        problem:
          'AI feature launches needed stronger preflight checks because behavior risk was not limited to UI bugs.',
        approach: [
          'Organized readiness around validation, rollback, monitoring, and communication checks.',
          'Highlighted incomplete launch criteria before a feature reached the final approval moment.',
          'Kept team alignment visible beside technical readiness.',
        ],
        outcome:
          'The concept framed launch readiness as an operational surface, not just a final checklist.',
      },
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
      detail: {
        problem:
          'Long-running agent work could lose important context when plans, edits, and decisions stretched across sessions.',
        approach: [
          'Captured durable context as a thread timeline with decisions, changed files, and pending questions.',
          'Separated stable project facts from temporary conversation state.',
          'Made resume points explicit so future work could continue without restarting discovery.',
        ],
        outcome:
          'The idea made agent collaboration feel more continuous and less dependent on fragile conversational memory.',
      },
      tags: ['Memory', 'Product Strategy'],
      image: '/images/easel-removebg.png',
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
