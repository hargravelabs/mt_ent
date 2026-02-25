import React from 'react';
import { motion } from 'framer-motion';

const Hero = () => {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-mt-black flex items-center justify-center">
            {/* Auto-playing muted background video */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover z-0"
            >
                <source src="/MT_logo_animations.mp4" type="video/mp4" />
            </video>

            {/* Gradient overlays removed to showcase the original video quality plainly */}

            {/* Empty Foreground Content wrapper, text removed as it's included in background video */}
            <div className="relative z-20 flex flex-col items-center justify-center text-center pb-20 pointer-events-none w-full h-full">
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
            >
                <span className="text-mt-white text-xs tracking-widest uppercase mb-4 opacity-50 font-sans">Scroll to explore</span>
                <div className="w-[1px] h-12 bg-mt-white opacity-40">
                    <motion.div
                        className="w-full bg-mt-white"
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default Hero;
