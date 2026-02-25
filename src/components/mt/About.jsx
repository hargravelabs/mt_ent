import React from 'react';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2,
            delayChildren: 0.3
        }
    }
};

const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
};

const About = () => {
    return (
        <section id="about" className="bg-mt-black text-mt-white w-full py-32 md:py-48 px-6 md:px-16 flex justify-center">
            <motion.div
                className="max-w-7xl flex flex-col md:flex-row w-full justify-between"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                <motion.div variants={itemVariants} className="md:w-1/3 mb-10 md:mb-0">
                    <h3 className="font-sans text-xs tracking-[0.2em] font-medium uppercase opacity-50">
                        01 — Vision
                    </h3>
                </motion.div>

                <div className="md:w-2/3 flex flex-col gap-12">
                    <motion.h2
                        variants={itemVariants}
                        className="font-display text-4xl md:text-5xl lg:text-7xl font-light leading-[1.1] tracking-tight"
                    >
                        We translate abstract ideas into <span className="italic font-display">compelling visualizations</span> that evoke emotion and drive narrative.
                    </motion.h2>

                    <motion.div variants={itemVariants} className="max-w-xl text-mt-gray font-sans text-lg md:text-xl font-light leading-relaxed">
                        At MT Media, precision meets art. Based on a foundation of professional aesthetic and relentless creativity, we specialize in high-end cinematography, dynamic video editing, and modern digital experiences that define brands.
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        className="border-t border-mt-gray/30 pt-10 mt-6 flex flex-wrap gap-8 font-sans text-xs tracking-widest uppercase text-mt-white/80"
                    >
                        <span>Art Direction</span>
                        <span>Cinematography</span>
                        <span>Post/Fx</span>
                        <span>Motion Graphics</span>
                    </motion.div>
                </div>
            </motion.div>
        </section>
    );
};

export default About;
