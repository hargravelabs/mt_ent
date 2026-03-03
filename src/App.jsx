import React from 'react';
import CustomCursor from './CustomCursor';
import useSmoothScroll from './hooks/useSmoothScroll';
import Hero from './components/Hero';
import HorizontalReel from './components/HorizontalReel';
import Services from './components/Services';
import Footer from './components/Footer';
import './index.css';

function App() {
  useSmoothScroll();

  return (
    <>
      <CustomCursor />
      <div className="void-bg"></div>

      <div className="main-app">
        <Hero />
        <HorizontalReel />
        <Services />
        <div className="footer-spacer"></div>
      </div>

      <Footer />
    </>
  );
}

export default App;
