import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Camera, MapPin, Film, Eye } from 'lucide-react';
import CustomCursor from './CustomCursor';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const tlRef = useRef(null);
  const containerRef = useRef(null);
  const horizontalRef = useRef(null);
  const servicesRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 2. Hero "Lights On" Animation (From previous implementation)
    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tlRef.current = tl;

    tl.to('.studio-light', { opacity: 0.15, duration: 1.5, ease: "power2.inOut" });

    const flickerTl = gsap.timeline();
    flickerTl.to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.04 })
      .to('.left .diffuser-screen', { fill: '#050505', duration: 0.06 })
      .to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.05 })
      .to('.left .diffuser-screen', { fill: '#050505', duration: 0.1 })
      .to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.15 });

    flickerTl.to('.right .diffuser-screen', { fill: '#ffffff', duration: 0.05 }, 0.08)
      .to('.right .diffuser-screen', { fill: '#050505', duration: 0.07 }, ">")
      .to('.right .diffuser-screen', { fill: '#ffffff', duration: 0.15 }, "+=0.04");

    tl.add(flickerTl, "+=0.2");
    tl.to('.light-beam', { opacity: 0.5, duration: 0.2, ease: "power2.out" }, "-=0.15");

    tl.to('.light-wipe', { scale: 3, opacity: 1, duration: 1.1, ease: "power3.inOut" }, "-=0.25")
      .to('.light-theme-bg', { opacity: 1, duration: 0.1 }, "-=0.2")
      .to('.light-wipe', { opacity: 0, duration: 0.8, ease: "power2.out" }, ">")
      .to('.light-beam', { opacity: 0.04, mixBlendMode: 'normal', duration: 0.8 }, "-=0.8");

    tl.to('.header', { opacity: 1, y: 0, duration: 1, ease: "power3.out" }, "-=1")
      .to('.headline .word', { y: '0%', stagger: 0.08, duration: 0.8, ease: "back.out(1.2)" }, "-=0.8")
      .to('.bio-grid', { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, "-=0.5")
      .to('.cta-group', { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, "-=0.6");

    // 3. Horizontal Scroll Pinning Logic
    if (horizontalRef.current) {
      const horizontalSection = horizontalRef.current;
      const scrollCards = gsap.utils.toArray('.scroll-card');

      gsap.to(scrollCards, {
        xPercent: -100 * (scrollCards.length - 1),
        ease: "none",
        scrollTrigger: {
          trigger: horizontalSection,
          pin: true,
          scrub: 1,
          snap: 1 / (scrollCards.length - 1),
          start: "top top",
          end: "+=3000" // Scroll for 3000px to view all cards
        }
      });
    }

    // 4. Parallax Hero Interactions
    const handleMouseMove = (e) => {
      if (window.innerWidth > 768) {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;

        gsap.to('.studio-light.left', { rotation: -35 + (mouseX * 6), x: mouseX * 30, y: mouseY * 30, duration: 1.5, ease: "power2.out" });
        gsap.to('.studio-light.right', { rotation: 35 + (mouseX * -6), x: mouseX * -30, y: mouseY * 20, duration: 1.5, ease: "power2.out" });
        gsap.to('.bg-pattern', { x: mouseX * -25, y: mouseY * -25, duration: 1.5, ease: "power2.out" });
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      tl.kill();
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const handleMagneticMove = (e, target) => {
    const rect = target.getBoundingClientRect();
    const x = (e.clientX - rect.left) - (rect.width / 2);
    const y = (e.clientY - rect.top) - (rect.height / 2);
    gsap.to(target, { x: x * 0.35, y: y * 0.35, duration: 0.4, ease: "power2.out" });
    const text = target.querySelector('.btn-text');
    if (text) gsap.to(text, { x: x * 0.15, y: y * 0.15, duration: 0.4, ease: "power2.out" });
  };

  const handleMagneticLeave = (target) => {
    gsap.to(target, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
    const text = target.querySelector('.btn-text');
    if (text) gsap.to(text, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.3)" });
  };

  // Service Hover Handler
  const handleServiceHover = (e, videoId) => {
    gsap.to('.service-video-preview', { opacity: 0, duration: 0.3 });
    gsap.to(`#${videoId}`, { opacity: 1, duration: 0.4, ease: "power2.out" });
  };

  return (
    <>
      <CustomCursor />
      <div className="void-bg"></div>

      {/* GLOBAL WRAPPER FOR SCROLL */}
      <div className="main-app" ref={containerRef}>

        {/* --- SECTION 1: HERO --- */}
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
                  <rect x="95" y="0" width="10" height="50" fill="#151515" />
                  <path d="M 100 45 L 70 80 L 130 80 Z" fill="#1a1a1a" />
                  <path d="M 30 80 L 170 80 L 190 180 L 10 180 Z" fill="#0d0d0d" stroke="#222" strokeWidth="1" />
                  <path d="M 35 85 L 165 85 L 180 170 L 20 170 Z" className="diffuser-screen" fill="#050505" />
                </g>
              </svg>
              <div className="light-beam"></div>
            </div>
            <div className="studio-light right">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <g className="fixture">
                  <rect x="95" y="0" width="10" height="50" fill="#151515" />
                  <path d="M 100 45 L 70 80 L 130 80 Z" fill="#1a1a1a" />
                  <path d="M 30 80 L 170 80 L 190 180 L 10 180 Z" fill="#0d0d0d" stroke="#222" strokeWidth="1" />
                  <path d="M 35 85 L 165 85 L 180 170 L 20 170 Z" className="diffuser-screen" fill="#050505" />
                </g>
              </svg>
              <div className="light-beam"></div>
            </div>
          </div>

          <main className="hero-container">
            <header className="header">
              <div className="logo">
                <svg className="logo-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="48" fill="#000" />
                  <text x="50" y="72" fill="#fff" fontFamily="'Playfair Display', serif" fontSize="65" textAnchor="middle" fontStyle="italic">M</text>
                  <line x1="18" y1="78" x2="82" y2="25" stroke="#fff" strokeWidth="2.5" />
                </svg>
                <span className="logo-text">mt_ent_</span>
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
                  <span className="line"><span className="word">Illuminating</span></span>
                  <span className="line"><span className="word">Your</span> <span className="word accent">Vision.</span></span>
                </h1>
                <div className="bio-grid">
                  <div className="bio-item"><Film size={20} /><span className="bio-text">Media</span></div>
                  <div className="bio-item"><MapPin size={20} /><span className="bio-text">Melb South-East</span></div>
                  <div className="bio-item"><Camera size={20} /><span className="bio-text">sony a7 iii</span></div>
                  <div className="bio-item"><span className="emoji">📷</span><span className="bio-text">DM for shoots</span></div>
                  <div className="bio-item"><Eye size={20} /><span className="bio-text">Latest work</span></div>
                </div>
                <div className="cta-group" id="cta-group">
                  <button className="cta-primary magnetic-btn" onMouseMove={(e) => handleMagneticMove(e, e.currentTarget)} onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}>
                    <span className="btn-text">View the Reel</span>
                  </button>
                  <button className="cta-secondary magnetic-btn" onMouseMove={(e) => handleMagneticMove(e, e.currentTarget)} onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}>
                    <span className="btn-text">Work with Milan</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </section>

        {/* --- SECTION 2: HORIZONTAL REEL --- */}
        <section className="horizontal-section" ref={horizontalRef} id="portfolio">
          <div className="scroll-wrapper">

            {/* Card 1 */}
            <div className="scroll-card">
              <div className="card-inner">
                <div className="card-media mock-media gradient-1">
                  <span className="mock-label">Team Spicemix</span>
                </div>
                <div className="card-info">
                  <p className="card-role">Cinematography & Editing</p>
                  <h2>M&M Feature</h2>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="scroll-card">
              <div className="card-inner">
                <div className="card-media mock-media gradient-2">
                  <span className="mock-label">Kazhugu Showcase</span>
                </div>
                <div className="card-info">
                  <p className="card-role">VFX & Composition</p>
                  <h2>The Fire Reveal</h2>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="scroll-card">
              <div className="card-inner">
                <div className="card-media mock-media gradient-3">
                  <span className="mock-label">Wedding & Portraiture</span>
                </div>
                <div className="card-info">
                  <p className="card-role">Photography Suite</p>
                  <h2>Color & Emotion</h2>
                </div>
              </div>
            </div>

            {/* Card 4 (CTA End) */}
            <div className="scroll-card end-card">
              <div className="card-inner cta-inner">
                <h2 className="massive-text">See the <br />Full Archive</h2>
                <button className="cta-primary magnetic-btn view-all-btn" onMouseMove={(e) => handleMagneticMove(e, e.currentTarget)} onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}>
                  <span className="btn-text">Explore All Work</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* --- SECTION 3: SERVICES KINETIC TYPOGRAPHY --- */}
        <section className="services-section" ref={servicesRef} id="services">
          <div className="services-container">

            <div className="media-preview-container">
              {/* Empty divs purely acting as background placeholders to represent hover media */}
              <div id="v-commercial" className="service-video-preview gradient-1"></div>
              <div id="v-music" className="service-video-preview gradient-2"></div>
              <div id="v-wedding" className="service-video-preview gradient-3"></div>
              <div id="v-brand" className="service-video-preview gradient-1"></div>
            </div>

            <div className="services-list">
              <div className="service-item" onMouseEnter={(e) => handleServiceHover(e, 'v-commercial')} onMouseLeave={() => gsap.to('.service-video-preview', { opacity: 0 })}>
                <span className="service-num">01</span>
                <h2 className="service-title">Commercial Film</h2>
              </div>
              <div className="service-item" onMouseEnter={(e) => handleServiceHover(e, 'v-music')} onMouseLeave={() => gsap.to('.service-video-preview', { opacity: 0 })}>
                <span className="service-num">02</span>
                <h2 className="service-title">Music Videos</h2>
              </div>
              <div className="service-item" onMouseEnter={(e) => handleServiceHover(e, 'v-wedding')} onMouseLeave={() => gsap.to('.service-video-preview', { opacity: 0 })}>
                <span className="service-num">03</span>
                <h2 className="service-title">Weddings</h2>
              </div>
              <div className="service-item" onMouseEnter={(e) => handleServiceHover(e, 'v-brand')} onMouseLeave={() => gsap.to('.service-video-preview', { opacity: 0 })}>
                <span className="service-num">04</span>
                <h2 className="service-title">Brand Identity</h2>
              </div>
            </div>

          </div>
        </section>

        {/* Helper spacer so footer can slide up from underneath */}
        <div className="footer-spacer"></div>
      </div>

      {/* --- SECTION 4: REVEAL FOOTER --- */}
      <footer className="reveal-footer" id="contact" ref={footerRef}>
        <div className="footer-content">
          <h2 className="footer-headline">Let's Create.</h2>
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Drop a line</h4>
              <a href="mailto:contact@milan.com" className="email-link magnetic-btn" onMouseMove={(e) => handleMagneticMove(e, e.currentTarget)} onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}>
                <span className="btn-text">contact@milan.com</span>
              </a>
            </div>
            <div className="footer-col">
              <h4>Socials</h4>
              <a href="#" className="footer-link">Instagram</a>
              <a href="#" className="footer-link">YouTube</a>
              <a href="#" className="footer-link">TikTok</a>
            </div>
            <div className="footer-col">
              <h4>Location</h4>
              <p>Melbourne<br />South-East, AUS</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 MT Entertainment. All rights reserved.</p>
            <div className="small-logo">mt_ent_</div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
