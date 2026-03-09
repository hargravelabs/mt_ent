import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

const useSmoothScroll = () => {
    useEffect(() => {
        // Initialize Lenis Smooth Scrolling for luxury feel
        const lenis = new Lenis({
            duration: 1.6, // Longer duration for an elegant, heavy feel
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 0.8,
            smoothTouch: false,
        });

        window.lenis = lenis;

        lenis.on('scroll', ScrollTrigger.update);

        const raf = (time) => {
            lenis.raf(time * 1000);
        };

        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        return () => {
            gsap.ticker.remove(raf);
            lenis.destroy();
            delete window.lenis;
        };
    }, []);
};

export default useSmoothScroll;
