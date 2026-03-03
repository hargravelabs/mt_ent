import React, { useEffect, useRef } from 'react';
import { Camera, MapPin, Film, Eye } from 'lucide-react';
import gsap from 'gsap';
import MagneticButton from './MagneticButton';
import mtLogo from '../assets/MT_white.png';

const Hero = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        // 2. Hero "Lights On" Cinematic Intro Animation
        const ctx = gsap.context(() => {
            gsap.set('.header', { opacity: 0, y: 30 });
            gsap.set('.float-word', { opacity: 0, y: '115%' });
            gsap.set('.bio-grid', { opacity: 0, y: 30 });
            gsap.set('.cta-group', { opacity: 0, y: 30 });

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.to('.studio-light', { opacity: 0.1, duration: 0.6, ease: "power2.inOut" });

            // Realistic LED flicker
            const flickerTl = gsap.timeline();
            flickerTl.to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.03 })
                .to('.left .diffuser-screen', { fill: '#0a0a0a', duration: 0.05 })
                .to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.04 })
                .to('.left .diffuser-screen', { fill: '#0a0a0a', duration: 0.08 })
                .to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.1 });

            flickerTl.to('.right .diffuser-screen', { fill: '#ffffff', duration: 0.04 }, 0.06)
                .to('.right .diffuser-screen', { fill: '#0a0a0a', duration: 0.06 }, ">")
                .to('.right .diffuser-screen', { fill: '#ffffff', duration: 0.1 }, "+=0.03");

            tl.add(flickerTl, "+=0.1");
            tl.to('.light-beam', { opacity: 0.5, duration: 0.3, ease: "power2.out" }, "-=0.1");

            // The Reveal Wipe
            tl.addLabel("wipeStart", "-=0.2");
            tl.to('.light-wipe', { scale: 3.5, opacity: 1, duration: 1.6, ease: "expo.out" }, "wipeStart")
                .to(document.querySelector('.main-app'), { backgroundColor: 'var(--bg-light)', duration: 0.1 }, "wipeStart+=0.3")
                .to('.light-theme-bg', { opacity: 1, duration: 0.1 }, "wipeStart+=0.3")
                .to('.light-wipe', { opacity: 0, duration: 1.2, ease: "power2.out" }, ">")
                .to('.light-beam', { opacity: 0.02, mixBlendMode: 'normal', duration: 1 }, "-=1");

            // Typography Stagger
            tl.to('.header', { opacity: 1, y: 0, duration: 1.4, ease: "expo.out" }, "wipeStart+=0.8")
                .to('.float-word', { opacity: 1, y: '0%', stagger: 0.06, duration: 1.4, ease: "expo.out" }, "wipeStart+=0.9")
                .to('.bio-grid', { opacity: 1, y: 0, duration: 1.4, ease: "expo.out" }, "wipeStart+=1.1")
                .to('.cta-group', { opacity: 1, y: 0, duration: 1.4, ease: "expo.out" }, "wipeStart+=1.2");

            // 4. Parallax Hero Background Interactions
            const handleMouseMove = (e) => {
                if (window.innerWidth > 768) {
                    const mouseX = (e.clientX / window.innerWidth) - 0.5;
                    const mouseY = (e.clientY / window.innerHeight) - 0.5;

                    gsap.to('.studio-light.left', { rotation: -35 + (mouseX * 4), x: mouseX * 25, y: mouseY * 20, duration: 2.5, ease: "power3.out" });
                    gsap.to('.studio-light.right', { rotation: 35 + (mouseX * -4), x: mouseX * -25, y: mouseY * 15, duration: 2.5, ease: "power3.out" });
                    gsap.to('.bg-pattern', { x: mouseX * -20, y: mouseY * -20, duration: 2.5, ease: "power3.out" });
                }
            };

            document.addEventListener('mousemove', handleMouseMove);

            return () => {
                document.removeEventListener('mousemove', handleMouseMove);
            };
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef}>
            <div className="light-theme-bg">
                <div className="bg-pattern"></div>
            </div>
            <div className="light-wipe left-wipe"></div>
            <div className="light-wipe right-wipe"></div>

            <section className="hero-section">
                <div className="parallax-container">
                    <div className="studio-light left">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <g className="fixture">
                                <rect x="98" y="0" width="4" height="60" fill="#151515" />
                                <rect x="30" y="60" width="140" height="15" rx="2" fill="#0d0d0d" />
                                <path d="M 25 75 L 175 75 L 185 95 L 15 95 Z" fill="#0a0a0a" />
                                <path d="M 27 77 L 173 77 L 181 93 L 19 93 Z" className="diffuser-screen" fill="#050505" />
                                <path d="M 15 95 L 0 130 M 185 95 L 200 130" stroke="#151515" strokeWidth="1.5" fill="none" />
                            </g>
                        </svg>
                        <div className="light-beam"></div>
                    </div>

                    <div className="studio-light right">
                        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                            <g className="fixture">
                                <rect x="98" y="0" width="4" height="60" fill="#151515" />
                                <rect x="30" y="60" width="140" height="15" rx="2" fill="#0d0d0d" />
                                <path d="M 25 75 L 175 75 L 185 95 L 15 95 Z" fill="#0a0a0a" />
                                <path d="M 27 77 L 173 77 L 181 93 L 19 93 Z" className="diffuser-screen" fill="#050505" />
                                <path d="M 15 95 L 0 130 M 185 95 L 200 130" stroke="#151515" strokeWidth="1.5" fill="none" />
                            </g>
                        </svg>
                        <div className="light-beam"></div>
                    </div>
                </div>

                <main className="hero-container">
                    <header className="header">
                        <div className="logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: '#111', // Dark background for contrast with white logo
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <img src={mtLogo} alt="MT Entertainment" style={{ height: '70%', width: 'auto' }} />
                            </div>
                            <span className="logo-text">MT Entertainment</span>
                        </div>
                        <nav className="nav-links">
                            <a href="#portfolio" className="nav-link">The Reel</a>
                            <a href="#services" className="nav-link">Capabilities</a>
                            <a href="#contact" className="nav-link">Contact</a>
                        </nav>
                    </header>

                    <div className="hero-content">
                        <div className="text-wrapper">
                            <h1 className="headline" id="main-headline">
                                <span className="line"><span className="word initial-visible">Cinematic</span> <span className="word playfair initial-visible">craft</span></span>
                                <span className="line"><span className="word float-word">for</span> <span className="word float-word">modern</span> <span className="word playfair float-word">storytellers.</span></span>
                            </h1>

                            <div className="bio-grid">
                                <div className="bio-item"><Film /><span>Director & DP</span></div>
                                <div className="bio-item"><MapPin /><span>Global Operations</span></div>
                                <div className="bio-item"><Camera /><span>ARRI Alexa Mini</span></div>
                                <div className="bio-item"><Eye /><span>High Edit</span></div>
                            </div>

                            <div className="cta-group" id="cta-group">
                                <MagneticButton className="cta-primary">
                                    <span className="btn-text">View the Archive</span>
                                </MagneticButton>
                                <MagneticButton className="cta-secondary">
                                    <span className="btn-text">Collaborate</span>
                                </MagneticButton>
                            </div>
                        </div>
                    </div>
                </main>
            </section>
        </div>
    );
};

export default Hero;
