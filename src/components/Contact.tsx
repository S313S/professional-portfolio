import { motion } from "motion/react";
import { personalData } from "../data";

export default function Contact() {
  return (
    <section id="contact" className="py-24 px-6 md:px-12 max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <span className="text-zinc-500 font-mono mb-4 block">05. What's Next?</span>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-zinc-900">Get In Touch</h2>
        <p className="text-lg text-zinc-600 mb-10 max-w-xl mx-auto">
          I'm currently looking for new opportunities. Whether you have a question or just want to say hi, I'll try my best to get back to you!
        </p>
        
        <a 
          href={`mailto:${personalData.email}`}
          className="inline-block bg-zinc-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-zinc-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Say Hello
        </a>

        <div className="mt-20 flex justify-center gap-8">
          {personalData.socials.map((social, index) => {
            const Icon = social.icon;
            return (
              <a 
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-zinc-900 transition-colors"
                aria-label={social.name}
              >
                <Icon size={24} />
              </a>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
