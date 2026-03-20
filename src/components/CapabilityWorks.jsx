import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Camera, Video, Music, Users, Sparkles, Mic } from 'lucide-react';
import MasonryGrid from './MasonryGrid';
import { useGalleryCache } from '../context/GalleryCacheContext';
import Demo from './ui/demo';
import './CapabilityWorks.css';

const EVENT_SERVICES = [
    { icon: Users, title: 'Weddings', desc: 'Full-day photo & video coverage of your special day.' },
    { icon: Sparkles, title: 'Corporate Events', desc: 'Conferences, galas, and brand activations captured professionally.' },
    { icon: Music, title: 'Music Events', desc: 'Concert photography, music video production, and live sessions.' },
    { icon: Mic, title: 'Private Functions', desc: 'Birthdays, engagements, and milestone celebrations.' },
    { icon: Camera, title: 'Dance Videos', desc: 'Dynamic dance choreography and performance videography.' },
    { icon: Video, title: 'Live Streaming', desc: 'Multi-camera live broadcast for hybrid and virtual events.' },
];

const EventServicesSection = () => (
    <div className="event-services-grid">
        <p className="event-services-label">What We Cover</p>
        <div className="event-services-cards">
            {EVENT_SERVICES.map((svc) => (
                <div className="event-service-card" key={svc.title}>
                    <svc.icon size={28} strokeWidth={1.5} />
                    <h3>{svc.title}</h3>
                    <p>{svc.desc}</p>
                </div>
            ))}
        </div>
    </div>
);

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
        <div className={`capability-works-page ${capability === 'cinematography' ? 'bg-black' : ''}`}>
            {capability === 'cinematography' ? (
                <div style={{ margin: '0', width: '100%' }}>
                    <Demo items={galleryItems} />
                </div>
            ) : (
                <div className="capability-works-content">
                    {/* Sticky Back to Studio button — always visible */}
                    <Link to="/#services" className="back-to-studio-fixed">
                        &larr; Back to Studio
                    </Link>

                    <h1 className="capability-title">
                        {capability.replace('-', ' ')} Works
                    </h1>

                    {capability === 'event-media' && <EventServicesSection />}

                    {isInitialLoad ? (
                        <div style={{ color: '#888', fontStyle: 'italic', height: '50vh', display: 'flex', alignItems: 'center' }}>Loading portfolio...</div>
                    ) : (
                        <>
                            {galleryItems.length > 0 && (
                                <MasonryGrid items={galleryItems} />
                            )}
                            
                            {/* Infinite Scroll Trigger */}
                            {hasMore && galleryItems.length > 0 && (
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
            )}
        </div>
    );
};

export default CapabilityWorks;
