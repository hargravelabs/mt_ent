import React, { useEffect, useRef } from 'react';
import { MapPin, Film, Eye } from 'lucide-react';
import gsap from 'gsap';
import MagneticButton from './MagneticButton';
import mtLogo from '../assets/MT_white.png';

const Hero = () => {
    const containerRef = useRef(null);

    const handleNavClick = (e, targetId) => {
        e.preventDefault();

        if (targetId === '#contact') {
            // The footer is position: fixed underneath the main content reveal.
            // We just need to scroll to the absolute bottom of the document.
            if (window.lenis) {
                window.lenis.scrollTo(document.body.scrollHeight, { duration: 3.5 });
            } else {
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
            }
            return;
        }

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            if (window.lenis) {
                window.lenis.scrollTo(targetElement, { offset: 0, duration: 2 });
            } else {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    useEffect(() => {
        // 2. Hero "Lights On" Cinematic Intro Animation
        const ctx = gsap.context(() => {
            const introPlayed = sessionStorage.getItem('mt_intro_played');

            if (introPlayed) {
                gsap.set('.header', { opacity: 1, y: 0 });
                gsap.set('.float-word', { opacity: 1, y: '0%' });
                gsap.set('.bio-grid', { opacity: 1, y: 0 });
                gsap.set('.cta-group', { opacity: 1, y: 0 });
                gsap.set('.studio-light', { opacity: 0.4 });
                gsap.set('.left .diffuser-screen', { fill: '#ffffff' });
                gsap.set('.left .light-beam', { opacity: 0.8 });
                gsap.set('.right .diffuser-screen', { fill: '#ffffff' });
                gsap.set('.right .light-beam', { opacity: 0.8 });
                gsap.set(document.querySelector('.home-content'), { backgroundColor: 'var(--bg-light)' });
                gsap.set('.light-theme-bg', { opacity: 1, position: 'absolute' });
                gsap.set('.light-wipe', { opacity: 0, scale: 3.5 });
                gsap.set('.light-beam', { opacity: 0.02, mixBlendMode: 'normal' });
                gsap.set(document.querySelector('.void-bg'), { opacity: 0 });
            } else {
                gsap.set('.header', { opacity: 0, y: 30 });
                gsap.set('.float-word', { opacity: 0, y: '115%' });
                gsap.set('.bio-grid', { opacity: 0, y: 30 });
                gsap.set('.cta-group', { opacity: 0, y: 30 });
                gsap.set(document.querySelector('.reveal-footer'), { opacity: 0 });

                const tl = gsap.timeline({
                    defaults: { ease: "power3.out" },
                    onComplete: () => sessionStorage.setItem('mt_intro_played', 'true')
                });

                const isMobile = window.innerWidth < 768;

                if (isMobile) {
                    // Simplified mobile intro — skip flicker, just fade in
                    tl.set('.studio-light', { opacity: 0 })
                      .set('.light-wipe', { opacity: 0 })
                      .to(document.querySelector('.home-content'), { backgroundColor: 'var(--bg-light)', duration: 0.3 }, 0)
                      .to('.light-theme-bg', { opacity: 1, duration: 0.3 }, 0)
                      .set('.light-theme-bg', { position: 'absolute' })
                      .set(document.querySelector('.void-bg'), { opacity: 0 })
                      .to('.light-beam', { opacity: 0.02, mixBlendMode: 'normal', duration: 0.3 }, 0)
                      .to('.header', { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, 0.1)
                      .to('.float-word', { opacity: 1, y: '0%', stagger: 0.04, duration: 0.8, ease: "expo.out" }, 0.15)
                      .to('.bio-grid', { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, 0.25)
                      .to('.cta-group', { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" }, 0.3)
                      .to(document.querySelector('.reveal-footer'), { opacity: 1, duration: 0.4 });
                } else {

                tl.to('.studio-light', { opacity: 0.4, duration: 0.6, ease: "power2.inOut" });

                // Realistic LED flicker
                const flickerTl = gsap.timeline();

                // Left light flicker - diffuser and beam in sync
                flickerTl.to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.04 }, 0)
                    .to('.left .light-beam', { opacity: 0.8, duration: 0.04 }, 0)
                    .to('.left .diffuser-screen', { fill: '#0a0a0a', duration: 0.08 }, ">")
                    .to('.left .light-beam', { opacity: 0, duration: 0.08 }, "<")
                    .to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.05 }, ">")
                    .to('.left .light-beam', { opacity: 0.9, duration: 0.05 }, "<")
                    .to('.left .diffuser-screen', { fill: '#0a0a0a', duration: 0.12 }, ">")
                    .to('.left .light-beam', { opacity: 0, duration: 0.12 }, "<")
                    .to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.1 }, ">")
                    .to('.left .light-beam', { opacity: 1, duration: 0.1 }, "<");

                // Right light flicker - slightly offset for realism
                flickerTl.to('.right .diffuser-screen', { fill: '#ffffff', duration: 0.05 }, 0.08)
                    .to('.right .light-beam', { opacity: 0.8, duration: 0.05 }, 0.08)
                    .to('.right .diffuser-screen', { fill: '#0a0a0a', duration: 0.1 }, ">")
                    .to('.right .light-beam', { opacity: 0, duration: 0.1 }, "<")
                    .to('.right .diffuser-screen', { fill: '#ffffff', duration: 0.06 }, "+=0.05")
                    .to('.right .light-beam', { opacity: 0.9, duration: 0.06 }, "<")
                    .to('.right .diffuser-screen', { fill: '#0a0a0a', duration: 0.15 }, ">")
                    .to('.right .light-beam', { opacity: 0, duration: 0.15 }, "<")
                    .to('.right .diffuser-screen', { fill: '#ffffff', duration: 0.12 }, "+=0.05")
                    .to('.right .light-beam', { opacity: 1, duration: 0.12 }, "<");

                tl.add(flickerTl, "+=0.1");

                // The Reveal Wipe
                tl.addLabel("wipeStart", "-=0.2");
                tl.to('.light-wipe', { scale: 3.5, opacity: 1, duration: 2.5, ease: "expo.out" }, "wipeStart")
                    .to(document.querySelector('.home-content'), { backgroundColor: 'var(--bg-light)', duration: 0.2 }, "wipeStart+=0.5")
                    .to('.light-theme-bg', { opacity: 1, duration: 0.2 }, "wipeStart+=0.5")
                    // Move to absolute immediately after fade-in so it no longer covers the footer area as position:fixed
                    .set('.light-theme-bg', { position: 'absolute' })
                    .to('.light-wipe', { opacity: 0, duration: 1.6, ease: "power2.out" }, ">")
                    .to('.light-beam', { opacity: 0.02, mixBlendMode: 'normal', duration: 1.2 }, "-=1.2")
                    // After wipe: hide void-bg, show footer
                    .set(document.querySelector('.void-bg'), { opacity: 0 })
                    .to(document.querySelector('.reveal-footer'), { opacity: 1, duration: 0.6, ease: 'power2.out' });

                // Typography Stagger
                tl.to('.header', { opacity: 1, y: 0, duration: 1.4, ease: "expo.out" }, "wipeStart+=1.2")
                    .to('.float-word', { opacity: 1, y: '0%', stagger: 0.06, duration: 1.4, ease: "expo.out" }, "wipeStart+=1.3")
                    .to('.bio-grid', { opacity: 1, y: 0, duration: 1.4, ease: "expo.out" }, "wipeStart+=1.5")
                    .to('.cta-group', { opacity: 1, y: 0, duration: 1.4, ease: "expo.out" }, "wipeStart+=1.6");
                } // end else (desktop)
            }

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
        <div ref={containerRef} style={{ position: 'relative' }}>
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
                            <a href="#portfolio" className="nav-link" onClick={(e) => handleNavClick(e, '#portfolio')}>The Reel</a>
                            <a href="#services" className="nav-link" onClick={(e) => handleNavClick(e, '#services')}>Services</a>
                            <a href="#about" className="nav-link" onClick={(e) => handleNavClick(e, '#about')}>About Us</a>
                            <a href="#contact" className="nav-link" onClick={(e) => handleNavClick(e, '#contact')}>Let's create</a>
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
                                <div className="bio-item"><MapPin /><span>Melbourne</span></div>
                                <div className="bio-item"><Eye /><span>High Edit</span></div>
                            </div>

                            <div className="cta-group" id="cta-group">
                                <MagneticButton className="cta-secondary" onClick={(e) => handleNavClick(e, '#contact')}>
                                    <span className="btn-text">Let's create</span>
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
