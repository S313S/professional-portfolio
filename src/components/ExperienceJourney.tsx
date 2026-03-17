import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'motion/react';
import { ExternalLink } from 'lucide-react';
import { personalData } from '../data';

export default function ExperienceJourney() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Fade maps for the 5 scenes
  // 0.0 - 0.2: Act 1 (Sprout)
  // 0.2 - 0.4: Act 2 (Growth)
  // 0.4 - 0.6: Act 3 (Experience)
  // 0.6 - 0.8: Act 4 (Works)
  // 0.8 - 1.0: Act 5 (Crystal)

  // Opacities for the 5 illustrations
  const img1Op = useTransform(smoothProgress, [0, 0.15, 0.25], [1, 1, 0]);
  const img2Op = useTransform(smoothProgress, [0.15, 0.25, 0.35, 0.45], [0, 1, 1, 0]);
  const img3Op = useTransform(smoothProgress, [0.35, 0.45, 0.55, 0.65], [0, 1, 1, 0]);
  const img4Op = useTransform(smoothProgress, [0.55, 0.65, 0.75, 0.85], [0, 1, 1, 0]);
  const img5Op = useTransform(smoothProgress, [0.75, 0.85, 1], [0, 1, 1]);

  // Image scales for subtle breathing effect
  const breathingScale = useTransform(smoothProgress, [0, 1], [1, 1.1]);

  // Dialogue Texts Opacities
  const text1Op = img1Op;
  const text2Op = img2Op;
  const text3Op = img3Op;
  const text4Op = img4Op;
  const text5Op = img5Op;

  // Act 3 (Experience) Cards specific
  const expCardsY = useTransform(smoothProgress, [0.35, 0.45], ['50px', '0px']);

  // Act 4 (Works) scroll specific
  const worksX = useTransform(smoothProgress, [0.6, 0.8], ['0%', '-50%']);

  return (
    <div ref={containerRef} className="relative h-[600vh] w-full bg-[#f4eee5] text-[#2c2825]">

      {/* 噪点质感背景 - 模拟旧纸布或帆布 */}
      <div className="fixed inset-0 pointer-events-none opacity-40 z-0 mix-blend-multiply" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

      <motion.div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center p-4 md:p-12 z-10 font-serif">

        {/* ==================== 顶部指示器 ==================== */}
        <div className="absolute top-8 w-full text-center opacity-50 text-sm tracking-[0.3em] uppercase pointer-events-none">
          - Storybook -
        </div>

        {/* ==================== 主插画框 (The Stage) ==================== */}
        <div className="relative w-full max-w-5xl h-[55vh] md:h-[60vh] border-4 border-[#3e3a35] rounded-t-full rounded-b-lg overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.2)] bg-[#d9d0c1] flex items-center justify-center">

          {/* 这里是内层画框线 */}
          <div className="absolute inset-4 border border-[#3e3a35]/40 rounded-t-full rounded-b pointer-events-none z-20"></div>

          {/* 幕 1 */}
          <motion.img
            style={{ opacity: img1Op, scale: breathingScale }}
            src="/images/scene_sprout.png"
            className="absolute inset-0 w-full h-full object-cover z-10"
            alt="Sprouting Seed"
          />
          {/* 幕 2 */}
          <motion.img
            style={{ opacity: img2Op, scale: breathingScale }}
            src="/images/scene_growth.png"
            className="absolute inset-0 w-full h-full object-cover z-11"
            alt="Growing Tree"
          />
          {/* 幕 3 */}
          <motion.img
            style={{ opacity: img3Op, scale: breathingScale }}
            src="/images/scene_experience.png"
            className="absolute inset-0 w-full h-full object-cover z-12"
            alt="Majestic Tree"
          />
          {/* 幕 4 */}
          <motion.img
            style={{ opacity: img4Op, scale: breathingScale }}
            src="/images/scene_works.png"
            className="absolute inset-0 w-full h-full object-cover z-13"
            alt="Blooming Flowers"
          />
          {/* 幕 5 */}
          <motion.img
            style={{ opacity: img5Op, scale: breathingScale }}
            src="/images/scene_crystal.png"
            className="absolute inset-0 w-full h-full object-cover z-14"
            alt="Crystal Monument"
          />

          {/* --- 前景叠加元素 (Works 的可滑动卡片、Experience 的经历卡片) --- */}
          {/* 幕 3: 职业经历卡片 */}
          <motion.div
            style={{ opacity: img3Op, y: expCardsY }}
            className="absolute inset-x-0 bottom-10 flex gap-4 px-10 justify-center z-30 pointer-events-none"
          >
            {personalData.experience.slice(0, 3).map((job, idx) => (
              <div key={idx} className="bg-[#f4efe6]/95 backdrop-blur-md border-2 border-[#3e3a35] p-4 text-center rounded-sm shadow-xl flex-1 max-w-[200px]">
                <h4 className="font-bold text-sm mb-1 line-clamp-1">{job.role}</h4>
                <p className="text-xs opacity-70 mb-2">{job.company}</p>
                <div className="w-4 h-[1px] bg-[#3e3a35] mx-auto opacity-30"></div>
                <p className="text-[10px] mt-2 opacity-60">{job.period}</p>
              </div>
            ))}
          </motion.div>

          {/* 幕 4: 作品画廊 */}
          <motion.div
            style={{ opacity: img4Op, pointerEvents: 'auto' }}
            className="absolute inset-0 z-30 flex items-center overflow-hidden"
          >
            <motion.div style={{ x: worksX }} className="flex gap-8 pl-[20%] pr-[50%] h-[60%]">
              {personalData.projects.map((proj, idx) => (
                <a key={idx} href={proj.link} target="_blank" rel="noreferrer" className="w-[300px] flex-shrink-0 bg-[#f4efe6] p-3 border-2 border-[#3e3a35] shadow-lg hover:-translate-y-2 transition-transform duration-300">
                  <div className="w-full h-3/5 bg-[#d9d0c1] border border-[#3e3a35] mb-4 overflow-hidden">
                    <img src={proj.image} className="w-full h-full object-cover grayscale mix-blend-multiply opacity-80" alt={proj.title} />
                  </div>
                  <h4 className="font-bold text-lg mb-1">{proj.title}</h4>
                  <p className="text-xs opacity-80 line-clamp-2 md:line-clamp-3 leading-relaxed">{proj.description}</p>
                </a>
              ))}
            </motion.div>
          </motion.div>

        </div>

        {/* ==================== 底部 RPG 对话框 ==================== */}
        <div className="relative mt-8 w-full max-w-4xl min-h-[160px] bg-[#fdfcf8] border-4 border-[#3e3a35] p-6 shadow-md rounded flex items-center">

          {/* 内边框装饰 */}
          <div className="absolute inset-1 border border-[#3e3a35]/20 rounded-sm pointer-events-none"></div>

          {/* 幕 1 对白 */}
          <motion.div style={{ opacity: text1Op }} className="absolute inset-0 flex items-center justify-center p-8 text-center pointer-events-none">
            <p className="text-lg md:text-xl leading-relaxed">
              <span className="font-bold text-xl block mb-2">Opening | 初始之地：萌发</span>
              泥土之下，种子开始苏醒...<br />
              {personalData.about}
            </p>
          </motion.div>

          {/* 幕 2 对白 */}
          <motion.div style={{ opacity: text2Op }} className="absolute inset-0 flex items-center justify-center p-8 text-center pointer-events-none">
            <p className="text-lg md:text-xl leading-relaxed">
              <span className="font-bold text-xl block mb-2">Growth | 成长路径：抽青</span>
              破土而出，迎接天光。<br />
              在持续的探索与代码构建中，认知架构如枝脉般舒展，每一次突破，都沉淀为向上的力量。
            </p>
          </motion.div>

          {/* 幕 3 对白 */}
          <motion.div style={{ opacity: text3Op }} className="absolute inset-0 flex items-center justify-center p-8 text-center pointer-events-none">
            <p className="text-lg md:text-xl leading-relaxed">
              <span className="font-bold text-xl block mb-2">Experience | 职业旅程：挺拔</span>
              主干逐渐挺拔，扎根深处。<br />
              那些无数个日夜的历练，化作了年轮，记录下我在各个团队与项目中的深深印记。
            </p>
          </motion.div>

          {/* 幕 4 对白 */}
          <motion.div style={{ opacity: text4Op }} className="absolute inset-0 flex items-center justify-center p-8 text-center pointer-events-none">
            <p className="text-lg md:text-xl leading-relaxed">
              <span className="font-bold text-xl block mb-2">Works | 作品宇宙：盛放</span>
              繁花盛开，色彩斑斓。<br />
              每一个作品都是一次思维的绽放，在数字世界里留下独特的芬芳。(在此画框内拖动浏览)
            </p>
          </motion.div>

          {/* 幕 5 对白 */}
          <motion.div style={{ opacity: text5Op }} className="absolute inset-0 flex items-center justify-center p-8 text-center pointer-events-auto">
            <div className="flex flex-col items-center">
              <span className="font-bold text-xl block mb-2">Next | 下一段旅程：结晶</span>
              <p className="text-lg md:text-xl leading-relaxed mb-4">
                果实凝结为结晶，成为了新周期的种子。<br />
                如果这段旅程触动了你，让我们一起开启下一个篇章。
              </p>
              <div className="flex gap-4 opacity-100 flex-wrap justify-center">
                <a href={personalData.email} className="px-6 py-2 bg-[#3e3a35] text-[#f4efe6] font-bold text-sm hover:bg-[#5a554f] transition-colors rounded-full flex items-center gap-2">
                  Let's Connect <ExternalLink size={16} />
                </a>
              </div>
            </div>
          </motion.div>

        </div>

        {/* 底部小箭头指示 */}
        <motion.div
          style={{ opacity: useTransform(smoothProgress, [0, 0.05], [1, 0]) }}
          className="absolute bottom-4 animate-bounce text-[#3e3a35] mt-4 tracking-widest text-xs uppercase"
        >
          Scroll Down
        </motion.div>

      </motion.div>
    </div>
  );
}
