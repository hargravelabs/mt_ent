import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { urlFor } from '../context/GalleryCacheContext';
import { getYouTubeThumbnail } from '../lib/utils';
import './MasonryGrid.css';

/* ─── Video Lightbox Player ─── */
const VideoLightbox = ({ src, poster, onClose }) => {
    const videoRef = useRef(null);
    const progressRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Auto-play on mount
    useEffect(() => {
        const vid = videoRef.current;
        if (vid) {
            vid.play().catch(() => setIsPlaying(false));
        }
        // Lock body scroll
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    // Close on Escape
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

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

    const handleTimeUpdate = () => {
        const vid = videoRef.current;
        if (!vid || !vid.duration) return;
        setProgress((vid.currentTime / vid.duration) * 100);
        setCurrentTime(vid.currentTime);
        setDuration(vid.duration);
    };

    const handleScrub = (e) => {
        const vid = videoRef.current;
        const bar = progressRef.current;
        if (!vid || !bar) return;
        const rect = bar.getBoundingClientRect();
        const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        vid.currentTime = pct * vid.duration;
    };

    const fmt = (s) => {
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <motion.div
            className="video-lightbox-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
        >
            <div className="video-lightbox-content" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button className="video-lightbox-close" onClick={onClose}>✕</button>

                {/* Video */}
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleTimeUpdate}
                    onClick={togglePlay}
                    className="video-lightbox-video"
                />

                {/* Controls */}
                <div className="video-lightbox-controls">
                    {/* Play/Pause */}
                    <button className="vlb-btn" onClick={togglePlay}>
                        {isPlaying ? (
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                        )}
                    </button>

                    {/* Time */}
                    <span className="vlb-time">{fmt(currentTime)}</span>

                    {/* Progress bar */}
                    <div className="vlb-progress" ref={progressRef} onClick={handleScrub}>
                        <div className="vlb-progress-filled" style={{ width: `${progress}%` }} />
                    </div>

                    {/* Duration */}
                    <span className="vlb-time">{fmt(duration)}</span>

                    {/* Mute/Unmute */}
                    <button className="vlb-btn" onClick={toggleMute}>
                        {isMuted ? (
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                        ) : (
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="white"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                        )}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

/* ─── Masonry Grid Item ─── */
const MasonryGridItem = ({ item, index, onVideoClick }) => {
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
                className="masonry-item"
                style={{
                    backgroundColor: '#222',
                    backgroundImage: lqip ? `url(${lqip})` : 'none',
                    aspectRatio: aspectRatioString
                }}
            >
                {isVideo && item.video?.asset?.url ? (
                    <div className="video-container" onClick={() => onVideoClick(item.video.asset.url, optimizedImageUrl)}>
                        <img
                            src={optimizedImageUrl}
                            alt={item.title || "Video thumbnail"}
                            loading="lazy"
                            className="masonry-image"
                        />
                        <div className="video-play-btn">
                            <svg viewBox="0 0 24 24" fill="white" width="32" height="32">
                                <polygon points="5,3 19,12 5,21" />
                            </svg>
                        </div>
                    </div>
                ) : optimizedImageUrl ? (
                    <img 
                        src={optimizedImageUrl} 
                        alt={item.title || "Gallery photo"} 
                        loading="lazy" 
                        className="masonry-image" 
                    />
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

/* ─── Masonry Grid ─── */
const MasonryGrid = ({ items }) => {
    const [lightboxVideo, setLightboxVideo] = useState(null);

    const handleVideoClick = useCallback((src, poster) => {
        setLightboxVideo({ src, poster });
    }, []);

    return (
        <>
            <div className="masonry-grid">
                {items.map((item, index) => (
                    <MasonryGridItem key={item._id} item={item} index={index} onVideoClick={handleVideoClick} />
                ))}
            </div>

            <AnimatePresence>
                {lightboxVideo && (
                    <VideoLightbox
                        src={lightboxVideo.src}
                        poster={lightboxVideo.poster}
                        onClose={() => setLightboxVideo(null)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

export default MasonryGrid;
