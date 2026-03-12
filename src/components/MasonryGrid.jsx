import React from 'react';
import { motion } from 'framer-motion';
import './MasonryGrid.css';

const MasonryGrid = ({ items }) => {
    return (
        <div className="masonry-grid">
            {items.map((item, index) => {
                const isVideo = item.mediaType === 'video' && item.video?.asset?.url;
                const coverImage = item.image?.asset?.url;

                return (
                    <motion.div
                        key={item._id}
                        className="masonry-item"
                        layoutId={`project-${item._id}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, delay: (index % 3) * 0.1 }}
                        whileHover={{ scale: 0.98 }}
                    >
                        {isVideo ? (
                            <video src={item.video.asset.url} autoPlay muted loop playsInline className="masonry-image" />
                        ) : coverImage ? (
                            <img src={coverImage} alt={item.title || "Gallery photo"} loading="lazy" className="masonry-image" />
                        ) : (
                            <div className="placeholder-image"></div>
                        )}
                        {item.title && (
                            <div className="item-overlay">
                                <h3>{item.title}</h3>
                            </div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

export default MasonryGrid;
