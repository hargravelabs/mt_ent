import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import MasonryGrid from './MasonryGrid';
import { useGalleryCache } from '../context/GalleryCacheContext';
import Demo from './ui/demo';
import './CapabilityWorks.css';

const CapabilityWorks = () => {
    const { capability } = useParams();
    const { cache, fetchMore } = useGalleryCache();
    const loaderRef = useRef(null);

    const categoryMapping = {
        'photography': 'Photography',
        'videography': 'Videography',
        'cinematography': 'Cinematography',
        'event-media': 'Event Media'
    };
    const categoryName = categoryMapping[capability] || capability.replace('-', ' ');

    const categoryData = cache[categoryName] || { items: [], hasMore: true };
    const { items: galleryItems, hasMore } = categoryData;
    const isInitialLoad = galleryItems.length === 0 && hasMore;

    useLayoutEffect(() => {
        const timeoutId = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 50);
        return () => clearTimeout(timeoutId);
    }, [capability]);

    // Initial fetch if empty
    useEffect(() => {
        if (isInitialLoad) {
            fetchMore(categoryName);
        }
    }, [categoryName, isInitialLoad, fetchMore]);

    // Intersection Observer for Infinite Scroll
    useEffect(() => {
        const observerTarget = loaderRef.current;
        if (!observerTarget) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    fetchMore(categoryName);
                }
            },
            { rootMargin: '400px', threshold: 0.1 } // Start loading 400px before reaching the bottom
        );

        observer.observe(observerTarget);

        return () => {
            if (observerTarget) observer.unobserve(observerTarget);
        };
    }, [hasMore, fetchMore, categoryName]);

    return (
        <div className="capability-works-page">
            <div className="capability-works-content">
                <Link to="/" className="back-link">
                    &larr; Back to Studio
                </Link>

                <h1 className="capability-title">
                    {capability.replace('-', ' ')} Works
                </h1>

                {isInitialLoad ? (
                    <div style={{ color: '#888', fontStyle: 'italic', height: '50vh', display: 'flex', alignItems: 'center' }}>Loading portfolio...</div>
                ) : (
                    <>
                        {capability === 'cinematography' ? (
                            <div style={{ margin: '0 -4vw' }}>
                                <Demo items={galleryItems} />
                            </div>
                        ) : (
                            galleryItems.length > 0 ? (
                                <MasonryGrid items={galleryItems} />
                            ) : (
                                <div style={{ color: '#555', height: '50vh', display: 'flex', alignItems: 'center' }}>No works found for this capability.</div>
                            )
                        )}
                        
                        {/* Infinite Scroll Trigger */}
                        {hasMore && galleryItems.length > 0 && capability !== 'cinematography' && (
                            <div 
                                ref={loaderRef} 
                                style={{ height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginTop: '2rem', color: '#888' }}
                            >
                                Loading more...
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default CapabilityWorks;
