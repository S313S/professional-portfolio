import { Github, Linkedin, Mail, Twitter, ExternalLink, Globe } from 'lucide-react';

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
