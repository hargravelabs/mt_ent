'use client';

import { useRef, useState, useEffect, ReactNode } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';

interface ScrollExpandMediaProps {
  mediaType?: 'video' | 'image';
  mediaSrc: string;
  posterSrc?: string;
  bgImageSrc: string;
  title?: string;
  date?: string;
  scrollToExpand?: string;
  textBlend?: boolean;
  children?: ReactNode;
}

const ScrollExpandMedia = ({
  mediaType = 'video',
  mediaSrc,
  posterSrc,
  bgImageSrc,
  title,
  date,
  scrollToExpand,
  textBlend,
  children,
}: ScrollExpandMediaProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobileState, setIsMobileState] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  useEffect(() => {
    const checkIfMobile = () => setIsMobileState(window.innerWidth < 768);
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
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

  // Math: With h-[200vh] and 100vh sticky box, it stays sticky for 100vh of scroll.
  // 0 -> 0.3: Expand (snap)
  // 0.3 -> 0.7: Stay Full Screen
  // 0.7 -> 1.0: Move away
  const progress = useTransform(sectionProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 1]);

  const mediaWidth = useTransform(progress, [0, 1], [300, isMobileState ? 950 : 1600]);
  const mediaHeight = useTransform(progress, [0, 1], [400, isMobileState ? 600 : 900]);
  const textTranslateX = useTransform(progress, [0, 1], [0, isMobileState ? 180 : 250]);
  const textTranslateXNeg = useTransform(progress, [0, 1], [0, isMobileState ? -180 : -250]);
  
  const bgOpacity = useTransform(progress, [0, 0.8], [1, 0]);
  const bgBlur = useTransform(progress, [0, 1], ["blur(0px)", "blur(20px)"]);
  const overlayOpacity = useTransform(progress, [0, 1], [0.7, 0.2]);
  
  // Fade out titles early
  const titleOpacity = useTransform(progress, [0.05, 0.25], [1, 0]);
  
  // Fade in children (scroll indicator) as we reach full expansion
  const contentOpacity = useTransform(sectionProgress, [0.25, 0.35, 0.65, 0.8], [0, 1, 1, 0]);

  // Auto-play/mute management
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    // Narrower range for playback and sound for higher sensitivity
    if (latest > 0.25 && latest < 0.75) {
      if (videoRef.current && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      }
    } else if (!isVideoMuted) {
      // Mute immediately when it leaves the center-focus peak
      setIsVideoMuted(true);
    }
  });

  const firstWord = title ? title.split(' ')[0] : '';
  const restOfTitle = title ? title.split(' ').slice(1).join(' ') : '';

  return (
    <div
      className="relative w-full bg-black"
    >
      <section ref={containerRef} className="relative w-full h-[200vh]">
        <div className="sticky top-0 w-full flex flex-col items-center justify-center min-h-[100dvh] overflow-hidden">
          
          <motion.div
            className="absolute inset-0 z-0 h-full w-full"
            style={{ opacity: bgOpacity, filter: bgBlur }}
          >
            <img
              src={bgImageSrc}
              alt="Background"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black/40" />
          </motion.div>

          <div className="container mx-auto flex flex-col items-center justify-center relative z-10 h-[100dvh]">
            <div className="flex flex-col items-center justify-center w-full h-[100dvh] relative">
              <motion.div
                className="absolute z-0 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden"
                style={{
                  width: mediaWidth,
                  height: mediaHeight,
                  maxWidth: '95vw',
                  maxHeight: '85vh',
                  boxShadow: '0px 0px 50px rgba(0, 0, 0, 0.3)',
                }}
              >
                {mediaType === 'video' ? (
                  mediaSrc.includes('youtube.com') ? (
                    <div className="relative w-full h-full pointer-events-none">
                      <iframe
                        width="100%"
                        height="100%"
                        src={
                          mediaSrc.includes('embed')
                            ? mediaSrc +
                              (mediaSrc.includes('?') ? '&' : '?') +
                              `autoplay=1&mute=${isVideoMuted ? 1 : 0}&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1`
                            : mediaSrc.replace('watch?v=', 'embed/') +
                              `?autoplay=1&mute=${isVideoMuted ? 1 : 0}&loop=1&controls=0&showinfo=0&rel=0&disablekb=1&modestbranding=1&playlist=` +
                              mediaSrc.split('v=')[1]
                        }
                        className="pointer-events-none w-full h-full rounded-xl"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                      <motion.div
                        className="absolute inset-0 bg-black/30 rounded-xl"
                        style={{ opacity: overlayOpacity }}
                      />
                    </div>
                  ) : (
                    <div className="relative w-full h-full pointer-events-none">
                       <video
                        ref={videoRef}
                        src={mediaSrc}
                        poster={posterSrc}
                        autoPlay
                        muted={isVideoMuted}
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover rounded-xl"
                        controls={false}
                        disablePictureInPicture
                        disableRemotePlayback
                      />
                      <motion.div
                        className="absolute inset-0 bg-black/30 rounded-xl"
                        style={{ opacity: overlayOpacity }}
                      />
                    </div>
                  )
                ) : (
                  <div className="relative w-full h-full">
                    <img
                      src={mediaSrc}
                      alt={title || 'Media content'}
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <motion.div
                      className="absolute inset-0 bg-black/50 rounded-xl"
                      style={{ opacity: overlayOpacity }}
                    />
                  </div>
                )}

                <div className="flex flex-col items-center text-center relative z-10 mt-4 h-full pt-10 px-4">
                  {date && (
                    <motion.p
                      className="text-2xl text-blue-200"
                      style={{ x: textTranslateXNeg }}
                    >
                      {date}
                    </motion.p>
                  )}
                  {scrollToExpand && (
                    <motion.p
                      className="text-blue-200 font-medium text-center"
                      style={{ x: textTranslateX }}
                    >
                      {scrollToExpand}
                    </motion.p>
                  )}
                </div>
              </motion.div>

              <div
                className={`flex items-center justify-center text-center gap-4 w-full relative z-10 flex-col pointer-events-none ${
                  textBlend ? 'mix-blend-difference' : 'mix-blend-normal'
                }`}
              >
                <motion.h2
                  className="text-4xl md:text-5xl lg:text-7xl font-bold text-blue-200"
                  style={{ x: textTranslateXNeg, opacity: titleOpacity }}
                >
                  {firstWord}
                </motion.h2>
                <motion.h2
                  className="text-4xl md:text-5xl lg:text-7xl font-bold text-center text-blue-200"
                  style={{ x: textTranslateX, opacity: titleOpacity }}
                >
                  {restOfTitle}
                </motion.h2>
              </div>
            </div>

            <motion.div
              className="absolute bottom-10 left-0 right-0 flex flex-col items-center w-full px-8 md:px-16 pb-10 pointer-events-auto"
              style={{ opacity: contentOpacity }}
            >
              <div className="max-w-4xl mx-auto w-full text-white">
                {children}
              </div>
            </motion.div>
          </div>
          {/* Unmute/Play Indicator overlay */}
          <motion.div 
            className="absolute bottom-10 right-10 z-50 p-3 bg-black/50 backdrop-blur-md rounded-full border border-white/20 cursor-pointer pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setIsVideoMuted(!isVideoMuted)}
          >
            {isVideoMuted ? (
              <div className="flex items-center gap-2 px-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
                <span className="text-[10px] uppercase tracking-widest text-white font-bold">Unmute</span>
              </div>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ScrollExpandMedia;
