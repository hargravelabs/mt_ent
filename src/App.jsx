import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import Navbar from './components/mt/Navbar';
import Hero from './components/mt/Hero';
import About from './components/mt/About';
import Works from './components/mt/Works';
import Footer from './components/mt/Footer';

function App() {
  const cursorRef = useRef(null);

  useEffect(() => {
    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      smoothTouch: false,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    // Custom Cursor logic
    const handleMouseMove = (e) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };

    const handleMouseOver = (e) => {
      if (cursorRef.current) {
        // Handle links, buttons or their children
        if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
          cursorRef.current.classList.add('hovered');
        } else {
          cursorRef.current.classList.remove('hovered');
        }

        // Handle project cards
        if (e.target.closest('.project-card') || (e.target.classList && e.target.classList.contains('project-card'))) {
          cursorRef.current.classList.add('play-hovered');
        } else {
          cursorRef.current.classList.remove('play-hovered');
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver);

    return () => {
      lenis.destroy();
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <div className="bg-mt-black min-h-screen text-mt-white selection:bg-mt-white selection:text-mt-black font-sans">
      {/* Custom Cursor Indicator Layer */}
      <div id="cursor" ref={cursorRef} />

      <Navbar />
      <main>
        <Hero />
        <About />
        <Works />
      </main>
      <Footer />
    </div>
  );
}

export default App;
