import { personalData } from "../data";

export default function ScrollTextBackground() {
  // Create a repeated string of text to ensure it fills the path
  const textItem = personalData.heroScrollText.join(" • ") + " • ";
  // Repeat text enough times to ensure it covers the path multiple times for smooth scrolling
  const repeatedText = textItem.repeat(10); 

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-[0.03]">
      <svg
        className="w-full h-full"
        viewBox="0 0 1000 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* A more complex, looping path */}
          <path
            id="textPath"
            d="M -200 300 C 200 100 400 100 600 300 S 800 500 1200 300 S 1600 100 2000 300"
            fill="none"
          />
        </defs>
        <text
          fontFamily="var(--font-sans)"
          fontSize="50"
          fontWeight="800"
          fill="currentColor"
          className="text-zinc-900 uppercase tracking-widest"
          dy="10"
        >
          <textPath
            href="#textPath"
            startOffset="0"
            method="stretch"
            spacing="auto"
          >
            {repeatedText}
            <animate 
              attributeName="startOffset" 
              from="0%" 
              to="-100%" 
              dur="60s" 
              repeatCount="indefinite" 
            />
          </textPath>
        </text>
      </svg>
    </div>
  );
}
