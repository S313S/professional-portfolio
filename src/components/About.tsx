import { motion } from "motion/react";
import { personalData } from "../data";
import InfiniteMarquee from "./InfiniteMarquee";

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  return (
    <section id="about" className="min-h-screen flex flex-col relative overflow-hidden bg-[#FDFCF8]">
      <div className="flex-grow flex flex-col justify-center px-6 md:px-12 max-w-7xl mx-auto py-20 w-full">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
          className="max-w-4xl"
        >
          <motion.span variants={itemVariants} className="font-mono text-zinc-500 mb-4 block text-lg">
            Hi, my name is
          </motion.span>
          
          <motion.h1 
            variants={itemVariants} 
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-zinc-900 mb-6"
          >
            {personalData.name}.
          </motion.h1>
          
          <motion.h2 
            variants={itemVariants} 
            className="text-4xl md:text-6xl font-semibold text-zinc-400 mb-8 leading-tight"
          >
            {personalData.tagline}
          </motion.h2>
          
          <motion.p 
            variants={itemVariants} 
            className="text-lg md:text-xl text-zinc-600 max-w-2xl leading-relaxed mb-10"
          >
            {personalData.about}
          </motion.p>
          
          <motion.div variants={itemVariants} className="flex gap-4">
            <a 
              href="#projects" 
              className="bg-zinc-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-zinc-800 transition-colors"
            >
              View My Work
            </a>
            <a 
              href="#contact" 
              className="border border-zinc-300 px-8 py-4 rounded-lg font-medium hover:bg-zinc-100 transition-colors"
            >
              Personal CV
            </a>
          </motion.div>
        </motion.div>
      </div>
      
      <div className="w-full pb-12">
        <InfiniteMarquee />
      </div>
    </section>
  );
}
