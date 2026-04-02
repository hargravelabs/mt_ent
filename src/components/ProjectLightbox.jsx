import React, { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getYouTubeId } from '../lib/utils';
import './ProjectLightbox.css';
import './MediaLoader.css';

const ProjectLightbox = ({ project, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState(false);
    const imgRef = useRef(null);

    let items = [];
    if (project?.mediaType === 'video' && project?.video?.asset?.url) {
        items = [{ type: 'video', url: project.video.asset.url }];
    } else if (project?.mediaType === 'video' && project?.youtubeUrl) {
        items = [{ type: 'youtube', url: project.youtubeUrl }];
    } else if (project?.mediaType === 'gallery' && project?.galleryImages) {
        items = project.galleryImages.map(img => ({ type: 'image', url: img.asset.url }));
    } else if (project?.mediaType === 'image_collage' && project?.images) {
        items = project.images.map(img => ({ type: 'image', url: img.asset.url }));
    } else if (project?.image) { // Fallback to cover image if schema isn't fully migrated
        items = [{ type: 'image', url: project.image.asset.url }];
    }

    const hasMultiple = items.length > 1;
    const currentItem = items[currentIndex];

    // Reset loading state when navigating to a new image
    useEffect(() => {
        if (currentItem?.type === 'image') {
            setImageLoaded(false);
            // Check if already cached
            if (imgRef.current?.complete && imgRef.current.naturalHeight > 0) {
                setImageLoaded(true);
            }
        }
    }, [currentIndex, currentItem?.type]);

    // Handle ESC key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
        };
        window.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto'; // Restore scroll
        }
    }, [items]);

    const handleNext = (e) => {
        if (e) e.stopPropagation();
        if (hasMultiple) {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }
    };

    const handlePrev = (e) => {
        if (e) e.stopPropagation();
        if (hasMultiple) {
            setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
        }
    };

    if (!project || items.length === 0) return null;

    return (
        <AnimatePresence>
            <div className="lightbox-overlay" onClick={onClose}>
                <motion.div
                    className="lightbox-backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                />

                <div className="lightbox-content-wrapper">
                    <button className="lightbox-close" onClick={onClose}>
                        <X size={32} />
                    </button>

                    {hasMultiple && (
                        <>
                            <button className="lightbox-nav nav-prev" onClick={handlePrev}>
                                <ChevronLeft size={48} />
                            </button>
                            <button className="lightbox-nav nav-next" onClick={handleNext}>
                                <ChevronRight size={48} />
                            </button>
                        </>
                    )}

                    <motion.div
                        className="lightbox-image-container"
                        layoutId={`project-${project._id}`}
                        onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    >
                        <AnimatePresence mode="wait">
                            {items[currentIndex]?.type === 'video' ? (
                                <motion.video
                                    key={currentIndex}
                                    src={items[currentIndex].url}
                                    className="lightbox-image"
                                    controls
                                    autoPlay
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                />
                            ) : items[currentIndex]?.type === 'youtube' ? (
                                <motion.iframe
                                    key={currentIndex}
                                    src={`https://www.youtube.com/embed/${getYouTubeId(items[currentIndex].url)}?autoplay=1&mute=0`}
                                    className="lightbox-image"
                                    allow="autoplay; fullscreen"
                                    allowFullScreen
                                    style={{ border: 'none' }}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                />
                            ) : (
                                <motion.div
                                    key={currentIndex}
                                    className="lightbox-image-wrapper"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {!imageLoaded && (
                                        <div className="lightbox-spinner">
                                            <div className="media-loader-spinner"></div>
                                        </div>
                                    )}
                                    <img
                                        ref={imgRef}
                                        src={items[currentIndex]?.url}
                                        alt={`${project.title} - ${currentIndex + 1}`}
                                        className={`lightbox-image ${imageLoaded ? 'lightbox-img-loaded' : 'lightbox-img-loading'}`}
                                        onLoad={() => setImageLoaded(true)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="lightbox-info">
                            <h2>{project.title}</h2>
                            {hasMultiple && (
                                <div className="lightbox-counter">
                                    {currentIndex + 1} / {items.length}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AnimatePresence>
    );
};

export default ProjectLightbox;
