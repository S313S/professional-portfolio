import { motion } from "motion/react";
import { personalData } from "../data";

export default function Experience() {
  return (
    <section id="experience" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-12 flex items-center gap-4">
          <span className="text-zinc-400 font-mono text-xl">02.</span> Experience
        </h2>

        <div className="space-y-12 border-l-2 border-zinc-200 ml-3 md:ml-6 pl-8 md:pl-12 relative">
          {personalData.experience.map((job, index) => (
            <div key={index} className="relative">
              <span className="absolute -left-[41px] md:-left-[57px] top-2 w-4 h-4 rounded-full bg-zinc-900 border-4 border-zinc-50"></span>
              <h3 className="text-xl md:text-2xl font-bold text-zinc-900">{job.role}</h3>
              <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 mb-4">
                <span className="text-lg font-medium text-zinc-700">{job.company}</span>
                <span className="hidden md:inline text-zinc-300">•</span>
                <span className="font-mono text-sm text-zinc-500">{job.period}</span>
              </div>
              <p className="text-zinc-600 leading-relaxed max-w-2xl">
                {job.description}
              </p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
