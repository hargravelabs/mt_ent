import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Camera, MapPin, Film, Eye } from 'lucide-react';
import CustomCursor from './CustomCursor';
import './index.css';

gsap.registerPlugin(ScrollTrigger);

function Home() {
  const navigate = useNavigate();
  const tlRef = useRef(null);
  const containerRef = useRef(null);
  const horizontalRef = useRef(null);
  const servicesRef = useRef(null);
  const footerRef = useRef(null);

  useEffect(() => {
    // 1. Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.5, // Slightly longer duration for a highly luxurious feel
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // 2. Hero "Lights On" Animation - Refined for Elegance
    // Set initial hidden states via GSAP (not CSS) so cleanup reverts to visible
    const ctx = gsap.context(() => {
      gsap.set('.header', { opacity: 0, y: 20 });
      gsap.set('.headline .word', { y: '115%' });
      gsap.set('.micro-sans', { opacity: 0, y: 20 });
      gsap.set('.cta-group', { opacity: 0, y: 20 });
      gsap.set('.showreel-container', { opacity: 0, clipPath: 'inset(100% 0 0 0)' });
      gsap.set('.floating-badge', { opacity: 0, y: 20 });
    }, containerRef);

    // Swapped "back.out" bounces for sharp, authoritative "expo.out" and "power3.out"
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tlRef.current = tl;

    tl.to('.studio-light', { opacity: 0.15, duration: 0.6, ease: "power2.inOut" });

    // Tighter, more realistic LED flicker
    const flickerTl = gsap.timeline();
    flickerTl.to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.03 })
      .to('.left .diffuser-screen', { fill: '#050505', duration: 0.05 })
      .to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.04 })
      .to('.left .diffuser-screen', { fill: '#050505', duration: 0.08 })
      .to('.left .diffuser-screen', { fill: '#ffffff', duration: 0.1 });

    flickerTl.to('.right .diffuser-screen', { fill: '#ffffff', duration: 0.04 }, 0.06)
      .to('.right .diffuser-screen', { fill: '#050505', duration: 0.06 }, ">")
      .to('.right .diffuser-screen', { fill: '#ffffff', duration: 0.1 }, "+=0.03");

    tl.add(flickerTl, "+=0.1");
    tl.to('.light-beam', { opacity: 0.4, duration: 0.3, ease: "power2.out" }, "-=0.1");

    // The Reveal: Wipes to elegant off-white
    tl.to('.light-wipe', { scale: 3.5, opacity: 1, duration: 1.4, ease: "expo.out" }, "-=0.2")
      .to('.main-app', { backgroundColor: 'var(--bg-light)', duration: 0.1 }, "-=0.2")
      .to('.light-theme-bg', { opacity: 1, duration: 0.1 }, "-=0.2")
      .to('.light-wipe', { opacity: 0, duration: 1, ease: "power2.out" }, ">")
      .to('.light-beam', { opacity: 0.03, mixBlendMode: 'normal', duration: 1 }, "-=1");

    // Refined Typography Stagger
    tl.to('.header', { opacity: 1, y: 0, duration: 1.2, ease: "expo.out" }, "-=1.6")
      .to('.headline .word', { y: '0%', stagger: 0.05, duration: 1.2, ease: "expo.out" }, "-=1.4")
      .to('.micro-sans', { opacity: 1, y: 0, duration: 1.2, ease: "expo.out" }, "-=1.3")
      .to('.cta-group', { opacity: 1, y: 0, duration: 1.2, ease: "expo.out" }, "-=1.4")
      .to('.showreel-container', { opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.5, ease: "power3.out" }, "-=1.2")
      .to('.floating-badge', { opacity: 1, y: 0, duration: 1, ease: "power2.out" }, "-=1");

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
          end: "+=3000"
        }
      });
    }

    // 4. Parallax Hero Interactions (toned down multipliers for realism)
    const handleMouseMove = (e) => {
      if (window.innerWidth > 768) {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;

        gsap.to('.studio-light.left', { rotation: -35 + (mouseX * 4), x: mouseX * 20, y: mouseY * 15, duration: 2, ease: "power3.out" });
        gsap.to('.studio-light.right', { rotation: 35 + (mouseX * -4), x: mouseX * -20, y: mouseY * 10, duration: 2, ease: "power3.out" });
        gsap.to('.bg-pattern', { x: mouseX * -15, y: mouseY * -15, duration: 2, ease: "power3.out" });
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    // 5. Services Split Sticky Scroll
    const serviceItems = gsap.utils.toArray('.service-scroll-item');
    if (serviceItems.length > 0) {
      serviceItems[0].classList.add('active');
      const targetBg = document.getElementById(serviceItems[0].getAttribute('data-target'));
      if (targetBg) targetBg.style.opacity = '1';
    }

    const activateService = (activeItem, bgTarget) => {
      serviceItems.forEach(el => el.classList.remove('active'));
      activeItem.classList.add('active');
      document.querySelectorAll('.service-bg').forEach(bg => bg.style.opacity = '0');
      const targetElement = document.getElementById(bgTarget);
      if (targetElement) targetElement.style.opacity = '1';
    };

    serviceItems.forEach((item) => {
      const bgTarget = item.getAttribute('data-target');
      ScrollTrigger.create({
        trigger: item,
        start: 'top 50%',
        end: 'bottom 50%',
        onEnter: () => activateService(item, bgTarget),
        onEnterBack: () => activateService(item, bgTarget),
      });
    });

    return () => {
      ctx.revert();
      tl.kill();
      lenis.destroy();
      ScrollTrigger.getAll().forEach(t => t.kill());
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Magnetic bounds reduced to feel stiff & premium, not loose/bouncy
  const handleMagneticMove = (e, target) => {
    const rect = target.getBoundingClientRect();
    const x = (e.clientX - rect.left) - (rect.width / 2);
    const y = (e.clientY - rect.top) - (rect.height / 2);

    gsap.to(target, { x: x * 0.15, y: y * 0.15, duration: 0.6, ease: "power3.out" });
    const text = target.querySelector('.btn-text');
    if (text) gsap.to(text, { x: x * 0.08, y: y * 0.08, duration: 0.6, ease: "power3.out" });
  };

  const handleMagneticLeave = (target) => {
    gsap.to(target, { x: 0, y: 0, duration: 0.8, ease: "expo.out" });
    const text = target.querySelector('.btn-text');
    if (text) gsap.to(text, { x: 0, y: 0, duration: 0.8, ease: "expo.out" });
  };

  const [isVideoHovered, setIsVideoHovered] = React.useState(false);

  const handleShowreelEnter = () => setIsVideoHovered(true);
  const handleShowreelLeave = () => setIsVideoHovered(false);

  return (
    <>
      <CustomCursor />
      <div className="void-bg"></div>

      <div className="main-app" ref={containerRef}>

        {/* --- SECTION 1: HERO --- */}
        <div className="light-theme-bg">
          <div className="bg-pattern"></div>
        </div>
        <div className="light-wipe left-wipe"></div>
        <div className="light-wipe right-wipe"></div>

        <section className="hero-section">
          <div className="parallax-container">
            {/* Minimalist sleek LED Panel Light Vectors */}
            <div className="studio-light left">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <g className="fixture">
                  <rect x="98" y="0" width="4" height="60" fill="#151515" />
                  <rect x="30" y="60" width="140" height="15" rx="2" fill="#0d0d0d" />
                  <path d="M 25 75 L 175 75 L 185 95 L 15 95 Z" fill="#0a0a0a" />
                  <path d="M 27 77 L 173 77 L 181 93 L 19 93 Z" className="diffuser-screen" fill="#050505" />
                  {/* Subtle barn door lines for realism */}
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
              <div className="logo">
                <span className="logo-text">MT Entertainment</span>
              </div>
              <div className="menu-toggle">
                <div className="hamburger">
                  <span className="lineh"></span>
                  <span className="lineh"></span>
                </div>
              </div>
            </header>

            <div className={`hero-content hero-editorial-split ${isVideoHovered ? 'video-hovered' : ''}`}>
              <div className="text-wrapper">
                <h1 className="headline" id="main-headline">
                  <span className="line"><span className="word">Illuminating</span></span>
                  <span className="line"><span className="word playfair italic-flair">Your</span> <span className="word">Vision.</span></span>
                </h1>

                <div className="sub-text-wrapper">
                  <p className="micro-sans">MELBOURNE BASED // CINEMATOGRAPHY &amp; EDITING</p>
                </div>

                <div className="cta-group" id="cta-group">
                  <button onClick={() => navigate('/works')} className="cta-primary magnetic-btn" onMouseMove={(e) => handleMagneticMove(e, e.currentTarget)} onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}>
                    <span className="btn-text">View the Reel</span>
                  </button>
                  <button className="cta-secondary magnetic-btn" onMouseMove={(e) => handleMagneticMove(e, e.currentTarget)} onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}>
                    <span className="btn-text">Work with me</span>
                  </button>
                </div>
              </div>

              <div className="showreel-container" onMouseEnter={handleShowreelEnter} onMouseLeave={handleShowreelLeave}>
                <video src="/content/SnapInsta.to_AQOB7PWo-agS0xjxh-Y_ZFy7js1Y3CXUr-HPe_wD38Zc4lrkEhB6XcJlLRAwrlQPWJXc-On1q9xM9JCuUncjZWZ7ANxJRq-N8G5mOXw.mp4" autoPlay loop muted playsInline className="showreel-video" />
              </div>
            </div>

            <div className="floating-badge">
              <div className="equalizer">
                <span></span><span></span><span></span>
              </div>
              <span className="badge-text">Audio &amp; Visual Mastery</span>
            </div>
          </main>
        </section>

        {/* --- SECTION 2: HORIZONTAL REEL --- */}
        <section className="horizontal-section" ref={horizontalRef} id="portfolio">
          <div className="scroll-wrapper">

            <div className="scroll-card">
              <div className="card-inner">
                <div className="card-media mock-media gradient-1">
                  <video src="/content/SnapInsta.to_AQM_zPUIBIsj_08JSxAU2kacpt6zlCj5kqm4dDaHP4wvkjHnZKA-JDEVAIi2yn8PQvC9LapQVN1kJTUYNvqdAQJfTd9Kwe9764KIcR8.mp4" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="card-info">
                  <p className="card-role">Cinematography &amp; Editing</p>
                  <h2>M&amp;M Feature</h2>
                </div>
              </div>
            </div>

            <div className="scroll-card">
              <div className="card-inner">
                <div className="card-media mock-media gradient-2">
                  <video src="/content/SnapInsta.to_AQO8zAcgo7VW11DrmEHr7hPuSspOBScVyLMEDPwKZoj0CYFkiyKqgAqbrlbdLKars65BnpPmu9YSFylNnRg7LXU59mZqrJrk4JjGwW0.mp4" autoPlay loop muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="card-info">
                  <p className="card-role">VFX &amp; Composition</p>
                  <h2>The Fire Reveal</h2>
                </div>
              </div>
            </div>

            <div className="scroll-card">
              <div className="card-inner">
                <div className="card-media mock-media gradient-3">
                  <img src="/content/SnapInsta.to_540220226_18499878019067658_8227351228374282959_n.jpg" alt="Wedding" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div className="card-info">
                  <p className="card-role">Photography Suite</p>
                  <h2>Color &amp; Emotion</h2>
                </div>
              </div>
            </div>

            <div className="scroll-card end-card">
              <div className="card-inner cta-inner">
                <h2 className="massive-text">See the <br />Archive</h2>
                <button onClick={() => navigate('/works')} className="cta-primary magnetic-btn view-all-btn" onMouseMove={(e) => handleMagneticMove(e, e.currentTarget)} onMouseLeave={(e) => handleMagneticLeave(e.currentTarget)}>
                  <span className="btn-text">Explore All Work</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* --- SECTION 3: SERVICES CAPABILITIES SPLIT SCROLL --- */}
        <section className="services-section" ref={servicesRef} id="services">
          <div className="services-bgs">
            <div className="service-bg" id="bg-commercial">
              <video src="/content/SnapInsta.to_AQM_zPUIBIsj_08JSxAU2kacpt6zlCj5kqm4dDaHP4wvkjHnZKA-JDEVAIi2yn8PQvC9LapQVN1kJTUYNvqdAQJfTd9Kwe9764KIcR8.mp4" autoPlay loop muted playsInline />
            </div>
            <div className="service-bg" id="bg-music">
              <video src="/content/SnapInsta.to_AQOB7PWo-agS0xjxh-Y_ZFy7js1Y3CXUr-HPe_wD38Zc4lrkEhB6XcJlLRAwrlQPWJXc-On1q9xM9JCuUncjZWZ7ANxJRq-N8G5mOXw.mp4" autoPlay loop muted playsInline />
            </div>
            <div className="service-bg" id="bg-wedding">
              <video src="/content/SnapInsta.to_AQOu2n3tcuaBus1UZsMeBhKMoZhVOPhXNSfp_3-biQ_4JXgNXEDEKiq6oi7whbjGJwc0Y9BFXwqR3POPZ-bZd9QY9qlsFDkLUnGig0c.mp4" autoPlay loop muted playsInline />
            </div>
            <div className="service-bg" id="bg-brand">
              <video src="/content/SnapInsta.to_AQOmJHnkeKGOKHzSC-aMLDIF2LnduJu5bR6Tn6woQiuq67PYd0FWhGRq_cyaoEMkJODiDRnsdG6ruVoUYxa77ERIeWxqIio0ZnqCOik.mp4" autoPlay loop muted playsInline />
            </div>
          </div>

          <div className="services-split">
            <div className="services-left">
              <div className="services-sticky-title">
                <span className="micro-sans">Capabilities</span>
                <h3 className="section-title">What<br />We Do.</h3>
              </div>
            </div>

            <div className="services-right">
              <div className="service-scroll-item" data-target="bg-commercial">
                <span className="service-num">01</span>
                <h2 className="service-name">Commercial Film</h2>
                <p className="service-desc">High-end promotional content tailored to elevate brand presence and deliver impactful messaging that resonates with your core demographic seamlessly.</p>
              </div>
              <div className="service-scroll-item" data-target="bg-music">
                <span className="service-num">02</span>
                <h2 className="service-name">Music Videos</h2>
                <p className="service-desc">Creative, narrative-driven visuals that capture the rhythm, soul, and pure aesthetic of your sound—bringing the artist's deepest conceptual visions to life.</p>
              </div>
              <div className="service-scroll-item" data-target="bg-wedding">
                <span className="service-num">03</span>
                <h2 className="service-name">Weddings</h2>
                <p className="service-desc">Authentic, sweeping cinematic storytelling for your most intimate, celebrated, and unforgettable moments, capturing memories that transcend generation.</p>
              </div>
              <div className="service-scroll-item" data-target="bg-brand">
                <span className="service-num">04</span>
                <h2 className="service-name">Brand Identity</h2>
                <p className="service-desc">Comprehensive visual packages combining photography, cinema, and foundational graphic design principles to completely reinvent and define your business.</p>
              </div>
            </div>
          </div>
        </section>

        <div className="footer-spacer"></div>
      </div>

      {/* --- SECTION 4: REVEAL FOOTER --- */}
      <footer className="reveal-footer" id="contact" ref={footerRef}>
        <div className="footer-content">
          <h2 className="footer-headline">Let's Create.</h2>
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Inquiries</h4>
              <a href="mailto:contact@milan.com" className="email-link">
                contact@milan.com
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

export default Home;
