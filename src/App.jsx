import { useEffect, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import CustomCursor from './CustomCursor';
import Footer from './components/Footer';
import Home from './components/Home';
import CapabilityWorks from './components/CapabilityWorks';
import { GalleryCacheProvider } from './context/GalleryCacheContext';
import useSmoothScroll from './hooks/useSmoothScroll';
import './index.css';

/**
 * /intro route — clears the intro-played flag and redirects to /
 * so the Hero cinematic animation plays from the beginning.
 */
const IntroRedirect = () => {
  sessionStorage.removeItem('mt_intro_played');
  return <Navigate to="/" replace />;
};

// Force top scroll on page refresh before React even renders
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}
window.onbeforeunload = function () {
  window.scrollTo(0, 0);
};

const ScrollToHash = () => {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();

  // Disable global Lenis on the cinematography page so CSS scroll snapping can work natively
  const isCinematography = pathname.includes('/works/cinematography');
  useSmoothScroll(!isCinematography);

  useLayoutEffect(() => {
    if (pathname !== '/' || hash !== '#services') return;

    let rafId;
    let intervalId;
    let timeoutId;
    let finished = false;

    const isReady = () => Boolean(window.__mtServicesReady) && Boolean(window.__mtHorizontalReelReady);

    document.documentElement.classList.add('hash-jump-pending');

    const jumpToServices = () => {
      const target = document.getElementById('services');
      if (!target) return false;

      const targetY = target.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({ top: targetY, left: 0, behavior: 'auto' });

      if (window.lenis) {
        window.lenis.scrollTo(targetY, { immediate: true, force: true });
      }

      return Math.abs(target.getBoundingClientRect().top) <= 2;
    };

    const finish = () => {
      if (finished) return;
      finished = true;
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      window.removeEventListener('mt:services-ready', tryResolve);
      window.removeEventListener('mt:horizontal-reel-ready', tryResolve);
      document.documentElement.classList.remove('hash-jump-pending');
      
      // Clean up the URL hash so a page refresh starts at the top
      navigate(pathname, { replace: true });
    };

    function tryResolve() {
      if (finished) return;
      if (!isReady()) return;

      const aligned = jumpToServices();
      if (!aligned) {
        rafId = requestAnimationFrame(() => {
          jumpToServices();
          finish();
        });
        return;
      }

      finish();
    }

    window.addEventListener('mt:services-ready', tryResolve);
    window.addEventListener('mt:horizontal-reel-ready', tryResolve);

    intervalId = setInterval(() => {
      if (finished) return;

      if (isReady()) {
        tryResolve();
      }
    }, 100);

    timeoutId = setTimeout(() => {
      if (finished) return;

      const aligned = jumpToServices();
      if (!aligned) {
        rafId = requestAnimationFrame(() => {
          jumpToServices();
          finish();
        });
        return;
      }

      finish();
    }, 5000);

    tryResolve();

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      window.removeEventListener('mt:services-ready', tryResolve);
      window.removeEventListener('mt:horizontal-reel-ready', tryResolve);
      document.documentElement.classList.remove('hash-jump-pending');
    };
  }, [pathname, hash]);

  useEffect(() => {
    if (pathname !== '/') {
      window.__mtHorizontalReelReady = false;
      window.__mtServicesReady = false;
    }
  }, [pathname]);

  useEffect(() => {
    // Other scroll/lenis logic can go here if needed
  }, []);

  useEffect(() => {
    if (!pathname.startsWith('/works/')) return;

    const goTop = () => {
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true, force: true });
      } else {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    };

    goTop();
    const rafId = requestAnimationFrame(goTop);

    return () => cancelAnimationFrame(rafId);
  }, [pathname]);

  useEffect(() => {
    if (!hash || pathname !== '/') return;

    const id = hash.replace('#', '');
    if (id === 'services') return;

    let rafId;

    const scrollToTarget = () => {
      const target = document.getElementById(id);
      if (!target) return;

      if (window.lenis) {
        window.lenis.scrollTo(target, { offset: 0, duration: 2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    rafId = requestAnimationFrame(scrollToTarget);

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [pathname, hash]);

  return null;
};

function App() {
  return (
    <GalleryCacheProvider>
      <Router>
        <ScrollToHash />
        <CustomCursor />
        <div className="void-bg"></div>

        <div className="main-app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/intro" element={<IntroRedirect />} />
            <Route path="/works/:capability" element={<CapabilityWorks />} />
          </Routes>
        </div>

        {/* This spacer provides the natural scroll height to reveal the fixed footer below main-app */}
        <div className="footer-spacer" style={{ height: '100vh', pointerEvents: 'none' }}></div>

        <Footer />
      </Router>
    </GalleryCacheProvider>
  );
}

export default App;
