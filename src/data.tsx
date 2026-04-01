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
