import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <footer id="contact" className="bg-mt-black text-mt-white w-full flex flex-col items-center justify-center pt-32 pb-16 px-6 md:px-16 overflow-hidden relative">
            <div className="max-w-7xl mx-auto w-full flex flex-col items-center text-center z-10">
                <motion.p
                    className="font-sans text-xs tracking-[0.3em] font-medium uppercase mb-8 text-mt-gray"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                >
                    Have a project in mind?
                </motion.p>

                <motion.h2
                    className="font-display text-6xl md:text-[8rem] font-light leading-none tracking-tight hover:italic cursor-none transition-all duration-300 mix-blend-difference z-20"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                    Let's Create
                </motion.h2>

                <div className="mt-20 w-full pt-12 border-t border-mt-gray/20 flex flex-col md:flex-row justify-between items-center text-xs tracking-widest font-sans text-mt-gray uppercase gap-8 md:gap-0 block">
                    <div>© {new Date().getFullYear()} MT Media. All rights reserved.</div>
                    <div className="flex gap-8">
                        <a href="#" className="hover:text-mt-white transition-colors duration-300">Instagram</a>
                        <a href="#" className="hover:text-mt-white transition-colors duration-300">Twitter</a>
                        <a href="#" className="hover:text-mt-white transition-colors duration-300">LinkedIn</a>
                    </div>
                    <div>Milan | Media & Visual Storytelling</div>
                </div>
            </div>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-mt-white opacity-5 rounded-full blur-[100px] pointer-events-none z-0" />
        </footer>
    );
};

export default Footer;
