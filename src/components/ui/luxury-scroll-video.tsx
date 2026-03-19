'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, useSpring } from 'framer-motion';
import { Link } from 'react-router-dom';
import VideoControls from './VideoControls';
import './VideoControls.css';

interface LuxuryScrollVideoProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  label?: string; // e.g. "Cinematography Works"
  scrollToExpand?: string;
  children?: ReactNode;
}

const LuxuryScrollVideo = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  label = "Cinematography Works",
  scrollToExpand,
  children,
}: LuxuryScrollVideoProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMobileState, setIsMobileState] = useState(() => typeof window !== 'undefined' ? window.matchMedia("(pointer: coarse)").matches : false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // Handle YouTube mute/unmute via postMessage API
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: isVideoMuted ? 'mute' : 'unMute',
          args: []
        }),
        '*'
      );
    }
  }, [isVideoMuted]);

  const [dimensions, setDimensions] = useState({ width: 1600, height: 900 });

  useEffect(() => {
    const updateDimensions = () => {
      const isTouch = window.matchMedia("(pointer: coarse)").matches;
      setIsMobileState(isTouch);
      const isSmallScreen = window.innerWidth < 768;
      setDimensions({
        width: isSmallScreen ? window.innerWidth - 32 : window.innerWidth - 96,
        height: isSmallScreen ? window.innerHeight - 160 : window.innerHeight - 96
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'], // Capture more range to ensure playback trigger
  });

  // Second Scroll Progress for the sticky section specifically
  const { scrollYProgress: sectionProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Add spring physics to match the "scrub: 1.5" feel from HorizontalReel
  const smoothSectionProgress = useSpring(sectionProgress, {
    stiffness: 60,
    damping: 20,
    restDelta: 0.001
  });

  // Math: With h-[200vh] and 100vh sticky box, it stays sticky for 100vh of scroll.
  // 0 -> 0.3: Expand (snap)
  // 0.3 -> 0.7: Stay Full Screen
  // 0.7 -> 1.0: Move away
  const progress = useTransform(smoothSectionProgress, [0, 0.4, 0.8, 1], [0, 1, 1, 1]);

  const mediaWidth = useTransform(progress, [0, 1], [300, dimensions.width]);
  const mediaHeight = useTransform(progress, [0, 1], [400, dimensions.height]);

  const bgOpacity = useTransform(progress, [0, 0.8], [1, 0]);
  const bgBlur = useTransform(progress, [0, 1], ["blur(0px)", "blur(20px)"]);
  const overlayOpacity = useTransform(progress, [0, 1], [0.5, 0.1]); // Lighter overlay for premium feel
  

  // Fade in children (scroll indicator) as we reach full expansion
  const contentOpacity = useTransform(smoothSectionProgress, [0.25, 0.35, 0.65, 0.8], [0, 1, 1, 0]);

  // Fade out header elements as we expand
  const headerOpacity = useTransform(progress, [0, 0.15], [1, 0]);

  // Auto-play/mute management
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Narrower range for playback and sound for higher sensitivity
    if (latest > 0.25 && latest < 0.75) {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
      }
    } else {
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause();
      }
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
      }
      if (!isVideoMuted) {
        // Mute immediately when it leaves the center-focus peak
        setIsVideoMuted(true);
      }
    }
  });

  return (
    <div className="relative w-full bg-[#050505]">
      <section ref={containerRef} className={`relative w-full ${isMobileState ? 'h-[100dvh] snap-start snap-always' : 'h-[200vh]'}`}>
        {/* Invisible snap points to create dampening and resting states */}
        {!isMobileState && (
          <>
            <div className="absolute top-0 w-full h-[1px] snap-start snap-always pointer-events-none" />
            <div className="absolute top-[40vh] w-full h-[1px] snap-start snap-always pointer-events-none" />
          </>
        )}
        
        <div className="sticky top-0 w-full flex flex-col items-center justify-center min-h-[100dvh] overflow-hidden">
          
          <motion.div
            className="absolute inset-0 z-0 h-full w-full"
            style={{ 
              opacity: isMobileState ? 0 : bgOpacity, 
              filter: isMobileState ? 'blur(0px)' : bgBlur 
            }}
          >
            <img
              src={bgImageSrc}
              alt="Background"
              className="w-full h-full object-cover object-center opacity-40 scale-105" // Subtle zoom on BG
            />
            {/* Elegant gradient overlay instead of heavy noise */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#050505]/60 to-[#050505] mix-blend-multiply" />
          </motion.div>

          {/* Integrated Header Elements */}
          <motion.div 
            className={`absolute top-0 left-0 w-full z-50 pointer-events-auto flex items-center justify-between ${isMobileState ? 'px-4 pt-6 bg-gradient-to-b from-black/80 to-transparent pb-6' : 'px-6 md:px-12 pt-10'}`}
            style={{ opacity: isMobileState ? 1 : headerOpacity }}
          >
             <Link to="/#services" className={`${isMobileState ? 'text-white' : 'text-white/60 hover:text-white'} transition-colors duration-500 ease-out text-sm uppercase tracking-[0.2em] font-medium flex items-center gap-2 group min-h-[44px]`}>
                <span className="transform transition-transform duration-500 group-hover:-translate-x-1">&larr;</span> Back to Studio
            </Link>
            
            <div className={`${isMobileState ? 'text-white/80' : 'text-white/40'} uppercase tracking-[0.3em] text-xs font-semibold`}>
                {label}
            </div>
          </motion.div>


          <div className="container mx-auto flex flex-col items-center justify-center relative z-10 h-[100dvh]">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">
              <motion.div
                className={`absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 overflow-hidden ${isMobileState ? 'rounded-none w-full h-full' : 'rounded-2xl md:rounded-[2rem]'}`} // Generous rounding as shown in the screenshot
                style={{
                  width: isMobileState ? '100vw' : mediaWidth,
                  height: isMobileState ? '100dvh' : mediaHeight,
                  boxShadow: isMobileState ? 'none' : '0 20px 80px -20px rgba(0,0,0,0.8)', // deeper, softer shadow
                }}
              >
                {mediaType === 'video' ? (
                  mediaSrc.includes('youtube.com') ? (
                    <div className="relative w-full h-full pointer-events-none overflow-hidden flex items-center justify-center">
                      <iframe
                        ref={iframeRef}
                        src={
                          mediaSrc.includes('embed')
                            ? mediaSrc +
                              (mediaSrc.includes('?') ? '&' : '?') +
                              `enablejsapi=1&autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1`
                            : mediaSrc.replace('watch?v=', 'embed/') +
                              `?enablejsapi=1&autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=` +
                              mediaSrc.split('v=')[1]
                        }
                        style={{
                          width: '100vw',
                          height: '56.25vw', /* 100 * 9 / 16 */
                          minHeight: isMobileState ? '0' : '100vh',
                          minWidth: isMobileState ? '0' : '177.77vh', /* 100 * 16 / 9 */
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                        className="pointer-events-none"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <motion.div
                        className="absolute inset-0 bg-black/20"
                        style={{ opacity: isMobileState ? 0.3 : overlayOpacity }}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full">
                       <video
                        ref={videoRef}
                        src={mediaSrc}
                        poster={posterSrc}
                        autoPlay
                        muted={isVideoMuted}
                        loop
                        playsInline
                        preload="auto"
                        className={`w-full h-full ${isMobileState ? 'object-contain bg-black' : 'object-cover'}`}
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                      />
                      <VideoControls
                        videoRef={videoRef}
                        variant="full"
                        onMuteToggle={(muted) => setIsVideoMuted(muted)}
                        externalMuted={isVideoMuted}
                      />
                    </div>
                  )
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={mediaSrc}
                      alt={title || 'Media content'}
                      className={`w-full h-full ${isMobileState ? 'object-contain bg-black' : 'object-cover'}`} // remove rounded-xl
                    />
                    <motion.div
                      className="absolute inset-0 bg-black/20"
                      style={{ opacity: isMobileState ? 0.3 : overlayOpacity }}
                    />
                  </div>
                )}
              </motion.div>

            </div>

            <motion.div
              className={`absolute left-0 right-0 flex flex-col items-center w-full pb-10 pointer-events-auto ${isMobileState ? 'bottom-24 px-4' : 'bottom-12 px-8 md:px-16'}`}
              style={{ opacity: isMobileState ? 1 : contentOpacity }}
            >
              <div className="max-w-4xl mx-auto w-full text-white">
                {children}
              </div>
            </motion.div>
          </div>
          
        </div>
      </section>
    </div>
  );
};

export default LuxuryScrollVideo;
