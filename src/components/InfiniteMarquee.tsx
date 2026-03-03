import React from "react";
import { 
  Sparkles, 
  Share2, 
  LayoutTemplate, 
  Image, 
  Bot, 
  Hammer, 
  Database, 
  Tag 
} from "lucide-react";

const LobsterIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M12 16.5V22" />
    <path d="M9 22h6" />
    <path d="M12 16.5c-2.5 0-4-1.5-4-5.5a4 4 0 1 1 8 0c0 4-1.5 5.5-4 5.5Z" />
    <path d="M8 11L5 8" />
    <path d="M5 8c-1.5 0-2.5 1-2.5 2.5" />
    <path d="M5 8c0-1.5-1-2.5-2.5-2.5" />
    <path d="M16 11l3-3" />
    <path d="M19 8c1.5 0 2.5 1 2.5 2.5" />
    <path d="M19 8c0-1.5 1-2.5 2.5-2.5" />
  </svg>
);

const skills = [
  { name: "Vibe coding", icon: Sparkles },
  { name: "N8N", icon: Share2 },
  { name: "Comfyui", icon: LayoutTemplate },
  { name: "Midjourney", icon: Image },
  { name: "Claude code", icon: Bot },
  { name: "Build Skills", icon: Hammer },
  { name: "Open Claw", icon: LobsterIcon },
  { name: "Knowledge Base", icon: Database },
  { name: "Data label design", icon: Tag },
];

export default function InfiniteMarquee() {
  return (
    <div className="w-full overflow-hidden py-10 bg-transparent relative z-10">
      <div className="flex w-max animate-marquee">
        {/* First set of items */}
        <div className="flex gap-8 px-4">
          {skills.map((skill, index) => (
            <div
              key={`skill-1-${index}`}
              className="flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-sm text-zinc-800 rounded-full text-lg font-medium whitespace-nowrap shadow-sm border border-zinc-200/60 hover:bg-white hover:border-zinc-300 transition-colors"
            >
              <skill.icon className="w-5 h-5 text-zinc-500" />
              <span>{skill.name}</span>
            </div>
          ))}
        </div>
        {/* Duplicate set for seamless loop */}
        <div className="flex gap-8 px-4">
          {skills.map((skill, index) => (
            <div
              key={`skill-2-${index}`}
              className="flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-sm text-zinc-800 rounded-full text-lg font-medium whitespace-nowrap shadow-sm border border-zinc-200/60 hover:bg-white hover:border-zinc-300 transition-colors"
            >
              <skill.icon className="w-5 h-5 text-zinc-500" />
              <span>{skill.name}</span>
            </div>
          ))}
        </div>
        {/* Triplicate set just in case screen is very wide */}
        <div className="flex gap-8 px-4">
          {skills.map((skill, index) => (
            <div
              key={`skill-3-${index}`}
              className="flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-sm text-zinc-800 rounded-full text-lg font-medium whitespace-nowrap shadow-sm border border-zinc-200/60 hover:bg-white hover:border-zinc-300 transition-colors"
            >
              <skill.icon className="w-5 h-5 text-zinc-500" />
              <span>{skill.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
