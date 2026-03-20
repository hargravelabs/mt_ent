import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { urlFor } from '../context/GalleryCacheContext';
import { getYouTubeThumbnail, getYouTubeId } from '../lib/utils';
import './MasonryGrid.css';

/* ─── Shared Lightbox Shell ─── */
const LightboxShell = ({ onClose, isVideo, hasPrev, hasNext, onPrev, onNext, children }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        if (isVideo) document.body.setAttribute('data-video-lightbox', '');
        return () => {
            document.body.style.overflow = '';
            document.body.removeAttribute('data-video-lightbox');
        };
    }, [isVideo]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft' && hasPrev) onPrev();
            if (e.key === 'ArrowRight' && hasNext) onNext();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose, hasPrev, hasNext, onPrev, onNext]);

    return (
        <motion.div
            className="vlb-overlay"
            data-lightbox-open
            {...(isVideo ? { 'data-lightbox-video': true } : {})}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
        >
            {/* Left arrow */}
            {hasPrev && (
                <button className="vlb-nav vlb-nav-prev" onClick={(e) => { e.stopPropagation(); onPrev(); }} aria-label="Previous">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>
            )}

            <div className="vlb-container" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>

            {/* Right arrow */}
            {hasNext && (
                <button className="vlb-nav vlb-nav-next" onClick={(e) => { e.stopPropagation(); onNext(); }} aria-label="Next">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>
            )}
        </motion.div>
    );
};

/* ─── Video Lightbox Player (Sanity-hosted videos) ─── */
const VideoLightbox = ({ src, poster }) => {
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [volume, setVolume] = useState(1);
    const containerRef = useRef(null);
    const hideTimerRef = useRef(null);

    useEffect(() => {
        const vid = videoRef.current;
        if (vid) {
            vid.play().catch(() => setIsPlaying(false));
        }
    }, []);

    // Auto-hide controls
    useEffect(() => {
        const resetTimer = () => {
            setShowControls(true);
            clearTimeout(hideTimerRef.current);
            if (isPlaying) {
                hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
            }
        };
        const container = containerRef.current;
        if (container) {
            container.addEventListener('mousemove', resetTimer);
            container.addEventListener('touchstart', resetTimer);
        }
        resetTimer();
        return () => {
            clearTimeout(hideTimerRef.current);
            if (container) {
                container.removeEventListener('mousemove', resetTimer);
                container.removeEventListener('touchstart', resetTimer);
            }
        };
    }, [isPlaying]);

    // Fullscreen change listener
    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    const togglePlay = () => {
        const vid = videoRef.current;
        if (!vid) return;
        if (vid.paused) { vid.play(); setIsPlaying(true); }
        else { vid.pause(); setIsPlaying(false); }
    };

    const toggleMute = () => {
        const vid = videoRef.current;
        if (!vid) return;
        vid.muted = !vid.muted;
        setIsMuted(vid.muted);
    };

    const handleVolumeChange = (e) => {
        const vid = videoRef.current;
        if (!vid) return;
        const vol = parseFloat(e.target.value);
        vid.volume = vol;
        setVolume(vol);
        if (vol === 0) { vid.muted = true; setIsMuted(true); }
        else { vid.muted = false; setIsMuted(false); }
    };

    const handleTimeUpdate = () => {
        const vid = videoRef.current;
        if (!vid || !vid.duration) return;
        setProgress((vid.currentTime / vid.duration) * 100);
        setCurrentTime(vid.currentTime);
        setDuration(vid.duration);
        // Update buffered
        if (vid.buffered.length > 0) {
            setBuffered((vid.buffered.end(vid.buffered.length - 1) / vid.duration) * 100);
        }
    };

    const handleScrub = (e) => {
        const vid = videoRef.current;
        const bar = progressRef.current;
        if (!vid || !bar) return;
        const rect = bar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        vid.currentTime = pct * vid.duration;
    };

    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    const fmt = (s) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div ref={containerRef} className="vlb-player-wrapper">
            <video
                ref={videoRef}
                src={src}
                poster={poster}
                playsInline
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleTimeUpdate}
                onProgress={handleTimeUpdate}
                onClick={togglePlay}
                onEnded={() => setIsPlaying(false)}
                className="video-lightbox-video"
            />

            {/* Big center play button when paused */}
            {!isPlaying && (
                <div className="vlb-center-play" onClick={togglePlay}>
                    <svg viewBox="0 0 68 48" width="68" height="48">
                        <path d="M66.52,7.74c-0.78-2.93-2.49-5.41-5.42-6.19C55.79,.13,34,0,34,0S12.21,.13,6.9,1.55C3.97,2.33,2.27,4.81,1.48,7.74C0.06,13.05,0,24,0,24s0.06,10.95,1.48,16.26c0.78,2.93,2.49,5.41,5.42,6.19C12.21,47.87,34,48,34,48s21.79-0.13,27.1-1.55c2.93-0.78,4.64-3.26,5.42-6.19C67.94,34.95,68,24,68,24S67.94,13.05,66.52,7.74z" fill="rgba(255,0,0,0.85)"/>
                        <path d="M 45,24 27,14 27,34" fill="white"/>
                    </svg>
                </div>
            )}

            {/* Controls bar */}
            <div className={`video-lightbox-controls ${showControls ? 'vlb-controls-visible' : 'vlb-controls-hidden'}`}>
                {/* Progress bar (above controls, full width like YouTube) */}
                <div className="vlb-progress-container">
                    <div className="vlb-progress" ref={progressRef} onClick={handleScrub}>
                        <div className="vlb-progress-buffered" style={{ width: `${buffered}%` }} />
                        <div className="vlb-progress-filled" style={{ width: `${progress}%` }}>
                            <div className="vlb-progress-handle" />
                        </div>
                    </div>
                </div>

                <div className="vlb-controls-row">
                    {/* Left controls */}
                    <div className="vlb-controls-left">
                        <button className="vlb-btn" onClick={togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'}>
                            {isPlaying ? (
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                            )}
                        </button>

                        {/* Volume */}
                        <div className="vlb-volume-group">
                            <button className="vlb-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
                                {isMuted || volume === 0 ? (
                                    <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                                ) : (
                                    <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                                )}
                            </button>
                            <input
                                type="range"
                                className="vlb-volume-slider"
                                min="0"
                                max="1"
                                step="0.05"
                                value={isMuted ? 0 : volume}
                                onChange={handleVolumeChange}
                            />
                        </div>

                        <span className="vlb-time">{fmt(currentTime)} / {fmt(duration)}</span>
                    </div>

                    {/* Right controls */}
                    <div className="vlb-controls-right">
                        <button className="vlb-btn" onClick={toggleFullscreen} aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}>
                            {isFullscreen ? (
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="22" height="22" fill="white"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

/* ─── YouTube Lightbox Player ─── */
const YouTubeLightbox = ({ youtubeUrl }) => {
    const videoId = getYouTubeId(youtubeUrl);
    if (!videoId) return null;

    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

    return (
        <div className="vlb-player-wrapper vlb-youtube-wrapper">
            <iframe
                src={embedUrl}
                title="YouTube video player"
                style={{ border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="vlb-youtube-iframe"
            />
        </div>
    );
};

/* ─── Photo Lightbox ─── */
const PhotoLightbox = ({ src, alt }) => {
    return (
        <img src={src} alt={alt || 'Expanded photo'} className="vlb-expanded-image" />
    );
};

/* ─── Helper: build lightbox data for an item ─── */
const getLightboxData = (item) => {
    const isVideo = item.mediaType === 'video' && (item.video?.asset?.url || item.youtubeUrl);
    const imageSource = isVideo ? item.videoThumbnail : item.image;
    const coverImage = imageSource?.asset?.url;
    const optimizedImageUrl = coverImage
        ? urlFor(imageSource).width(1200).auto('format').url()
        : (isVideo && item.youtubeUrl ? getYouTubeThumbnail(item.youtubeUrl) : null);

    if (isVideo && item.video?.asset?.url) {
        return { type: 'video', src: item.video.asset.url, poster: optimizedImageUrl };
    } else if (isVideo && item.youtubeUrl) {
        return { type: 'youtube', youtubeUrl: item.youtubeUrl };
    } else if (optimizedImageUrl) {
        return { type: 'photo', src: optimizedImageUrl, alt: item.title };
    }
    return null;
};

/* ─── Masonry Grid Item ─── */
const MasonryGridItem = ({ item, index, onItemClick }) => {
    const isVideo = item.mediaType === 'video' && (item.video?.asset?.url || item.youtubeUrl);

    const imageSource = isVideo ? item.videoThumbnail : item.image;
    const coverImage = imageSource?.asset?.url;
    const lqip = imageSource?.asset?.metadata?.lqip;
    const dimensions = imageSource?.asset?.metadata?.dimensions;
    const aspectRatioString = dimensions ? `${dimensions.width} / ${dimensions.height}` : 'auto';

    const optimizedImageUrl = coverImage
        ? urlFor(imageSource).width(1200).auto('format').url()
        : (isVideo && item.youtubeUrl ? getYouTubeThumbnail(item.youtubeUrl) : null);

    const innerRef = useRef(null);
    const [span, setSpan] = useState(20);

    useEffect(() => {
        if (!innerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const height = entry.borderBoxSize
                    ? entry.borderBoxSize[0].blockSize
                    : entry.contentRect.height;
                setSpan(Math.ceil(height + 20));
            }
        });
        observer.observe(innerRef.current);
        return () => observer.disconnect();
    }, []);

    const isClickable = isVideo || !!optimizedImageUrl;

    return (
        <motion.div
            className="masonry-item-wrapper"
            layoutId={`project-${item._id}`}
            style={{ gridRowEnd: `span ${span}` }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: (index % 4) * 0.1 }}
            whileHover={{ scale: 0.98 }}
        >
            <div
                ref={innerRef}
                className={`masonry-item ${isClickable ? 'masonry-item-clickable' : ''}`}
                style={{
                    backgroundColor: '#222',
                    backgroundImage: lqip ? `url(${lqip})` : 'none',
                    aspectRatio: aspectRatioString
                }}
                onClick={isClickable ? () => onItemClick(index) : undefined}
            >
                {optimizedImageUrl ? (
                    <>
                        <img
                            src={optimizedImageUrl}
                            alt={item.title || (isVideo ? "Video thumbnail" : "Gallery photo")}
                            loading="lazy"
                            className="masonry-image"
                        />
                        {isVideo && (
                            <div className="video-play-btn">
                                <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
                                    <circle cx="32" cy="32" r="31" fill="rgba(0,0,0,0.35)" />
                                    <polygon points="26,20 26,44 46,32" fill="white" />
                                </svg>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="placeholder-image"></div>
                )}
                {item.title && (
                    <div className="item-overlay">
                        <h3>{item.title}</h3>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/* ─── Lightbox Content Renderer ─── */
const LightboxContent = ({ data }) => {
    if (!data) return null;
    if (data.type === 'video') return <VideoLightbox src={data.src} poster={data.poster} />;
    if (data.type === 'youtube') return <YouTubeLightbox youtubeUrl={data.youtubeUrl} />;
    if (data.type === 'photo') return <PhotoLightbox src={data.src} alt={data.alt} />;
    return null;
};

/* ─── Masonry Grid ─── */
const MasonryGrid = ({ items }) => {
    const [openIndex, setOpenIndex] = useState(null);

    // Build list of expandable item indices
    const expandableIndices = React.useMemo(() => {
        const indices = [];
        items.forEach((item, i) => {
            if (getLightboxData(item)) indices.push(i);
        });
        return indices;
    }, [items]);

    const handleItemClick = useCallback((index) => {
        setOpenIndex(index);
    }, []);

    const currentData = openIndex !== null ? getLightboxData(items[openIndex]) : null;
    const isVideo = currentData && (currentData.type === 'video' || currentData.type === 'youtube');

    // Find prev/next expandable indices
    const posInExpandable = openIndex !== null ? expandableIndices.indexOf(openIndex) : -1;
    const hasPrev = posInExpandable > 0;
    const hasNext = posInExpandable >= 0 && posInExpandable < expandableIndices.length - 1;

    const goPrev = useCallback(() => {
        if (hasPrev) setOpenIndex(expandableIndices[posInExpandable - 1]);
    }, [hasPrev, expandableIndices, posInExpandable]);

    const goNext = useCallback(() => {
        if (hasNext) setOpenIndex(expandableIndices[posInExpandable + 1]);
    }, [hasNext, expandableIndices, posInExpandable]);

    return (
        <>
            <div className="masonry-grid">
                {items.map((item, index) => (
                    <MasonryGridItem key={item._id} item={item} index={index} onItemClick={handleItemClick} />
                ))}
            </div>

            <AnimatePresence>
                {currentData && (
                    <LightboxShell
                        onClose={() => setOpenIndex(null)}
                        isVideo={isVideo}
                        hasPrev={hasPrev}
                        hasNext={hasNext}
                        onPrev={goPrev}
                        onNext={goNext}
                    >
                        <LightboxContent data={currentData} />
                    </LightboxShell>
                )}
            </AnimatePresence>
        </>
    );
};

export default MasonryGrid;
