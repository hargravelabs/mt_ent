import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { urlFor } from '../context/GalleryCacheContext';
import './MasonryGrid.css';

const MasonryGridItem = ({ item, index }) => {
    const isVideo = item.mediaType === 'video' && item.video?.asset?.url;
                
    // For videos, use the videoThumbnail if provided, else it falls back
    const imageSource = isVideo ? item.videoThumbnail : item.image;
    const coverImage = imageSource?.asset?.url;
    
    // Low quality image placeholder (LQIP)
    const lqip = imageSource?.asset?.metadata?.lqip;
    
    // Original dimensions for preserving exact aspect ratio
    const dimensions = imageSource?.asset?.metadata?.dimensions;
    const aspectRatioString = dimensions ? `${dimensions.width} / ${dimensions.height}` : 'auto';

    // Responsive sizing via Sanity builder (max 1200px width for 2-col spans)
    const optimizedImageUrl = coverImage ? urlFor(imageSource).width(1200).auto('format').url() : null;

    const innerRef = useRef(null);
    const [span, setSpan] = useState(20); // Fallback until measurement

    useEffect(() => {
        if (!innerRef.current) return;
        
        const observer = new ResizeObserver((entries) => {
            for (let entry of entries) {
                const height = entry.borderBoxSize 
                    ? entry.borderBoxSize[0].blockSize 
                    : entry.contentRect.height;
                // Span equals the pixel height + 20px for the gap
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
                    backgroundColor: '#222', // Fallback color
                    backgroundImage: lqip ? `url(${lqip})` : 'none',
                    aspectRatio: aspectRatioString
                }}
            >
                {isVideo ? (
                    // Use the optimized poster image to save bandwidth before play
                    <video 
                        src={item.video.asset.url} 
                        poster={optimizedImageUrl} 
                        autoPlay 
                        muted 
                        loop 
                        playsInline 
                        className="masonry-image" 
                    />
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

const MasonryGrid = ({ items }) => {
    return (
        <div className="masonry-grid">
            {items.map((item, index) => (
                <MasonryGridItem key={item._id} item={item} index={index} />
            ))}
        </div>
    );
};

export default MasonryGrid;
