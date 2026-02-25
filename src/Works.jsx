import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import CustomCursor from './CustomCursor';
import './Works.css';

gsap.registerPlugin(ScrollTrigger);

export default function Works() {
    const [data, setData] = useState({ categories: [] });
    const [activeCategory, setActiveCategory] = useState('all');
    const [loading, setLoading] = useState(true);
    const containerRef = useRef(null);
    const videoRefs = useRef({});

    useEffect(() => {
        // Elegant Lenis wrapper for buttery cinematic scrolling
        const lenis = new Lenis({
            duration: 1.5,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
        });

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        return () => {
            lenis.destroy();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    // Fetch the JSON payload
    useEffect(() => {
        fetch('/content/data.json')
            .then(r => r.json())
            .then(json => {
                setData(json);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load content JSON:", err);
                setLoading(false);
            });
    }, []);

    const allItems = useMemo(() => {
        return data.categories.reduce((acc, cat) => {
            const itemsWithCat = cat.items.map(item => ({ ...item, categoryId: cat.id }));
            return [...acc, ...itemsWithCat];
        }, []);
    }, [data]);

    const displayedItems = useMemo(() => {
        if (activeCategory === 'all') return allItems;
        return allItems.filter(item => item.categoryId === activeCategory);
    }, [allItems, activeCategory]);

    useEffect(() => {
        if (!loading && displayedItems.length > 0) {
            // Cinematic Entrance Reveal
            gsap.fromTo('.gallery-card',
                { opacity: 0, y: 100, scale: 0.95 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    duration: 1.2,
                    stagger: 0.1,
                    ease: 'expo.out',
                    scrollTrigger: {
                        trigger: '.premium-gallery',
                        start: 'top 80%',
                    }
                }
            );
        }
    }, [loading, displayedItems, activeCategory]);

    const handleMouseEnter = (index) => {
        const vid = videoRefs.current[index];
        if (vid) {
            vid.play().catch(e => console.log('Video play error:', e));
        }
    };

    const handleMouseLeave = (index) => {
        const vid = videoRefs.current[index];
        if (vid) {
            vid.pause();
        }
    };

    return (
        <div className="works-page-dark" ref={containerRef}>
            <CustomCursor />

            {/* Top Navigation */}
            <header className="works-header-nav">
                <Link to="/" className="works-brand">mt_ent_</Link>
                <span className="works-tagline">SELECTED ARCHIVE</span>
            </header>

            <main className="works-main-content">

                {/* Massive Cinematic Title */}
                <section className="works-hero-intro">
                    <h1 className="giant-title">
                        <span className="playfair italic">Selected</span><br />
                        <span className="sans-bold">WORKS</span><br />
                        <span className="playfair italic indent">2026—</span>
                    </h1>
                    <p className="works-hero-desc">
                        A highly curated collection of our finest commercial footage,
                        music cinema, and narrative storytelling. Everything is rendered
                        in stunning 4K resolution directly from the vault.
                    </p>
                </section>

                {/* Categories Navigation */}
                <nav className="editorial-filter-nav">
                    <button
                        onClick={() => setActiveCategory('all')}
                        className={activeCategory === 'all' ? 'active' : ''}
                    >
                        All Archive
                    </button>
                    {data.categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={activeCategory === cat.id ? 'active' : ''}
                        >
                            {cat.title}
                        </button>
                    ))}
                </nav>

                {loading ? (
                    <div className="loading-void-dark">Connecting to Vault...</div>
                ) : (
                    <div className="premium-gallery">
                        {displayedItems.map((item, index) => {
                            // Creating an alternating, high-fashion editorial layout
                            // using specific CSS classes based on index mathematics.
                            let layoutClass = 'gallery-card ';
                            if (index % 5 === 0) layoutClass += 'card-huge';
                            else if (index % 4 === 0) layoutClass += 'card-tall';
                            else if (index % 3 === 0) layoutClass += 'card-wide';
                            else layoutClass += 'card-standard';

                            return (
                                <div
                                    key={`${item.url}-${index}`}
                                    className={layoutClass}
                                    onMouseEnter={() => handleMouseEnter(index)}
                                    onMouseLeave={() => handleMouseLeave(index)}
                                >
                                    <div className="card-media-shell showreel-container">
                                        {item.type === 'image' ? (
                                            <img src={item.url} alt={item.title} className="card-visual" loading="lazy" />
                                        ) : (
                                            <video
                                                ref={el => videoRefs.current[index] = el}
                                                src={item.url}
                                                loop
                                                muted
                                                playsInline
                                                className="card-visual"
                                            />
                                        )}

                                        {/* Dark gradient overlay for typography readability */}
                                        <div className="card-visual-overlay"></div>
                                    </div>

                                    <div className="card-typography">
                                        <p className="card-meta">0{index + 1} // {item.categoryId.toUpperCase()}</p>
                                        <h3 className="card-headline">{item.title}</h3>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer className="works-footer-dark">
                <div className="footer-line"></div>
                <p>MT ENTERTAINMENT STUDIO &copy; 2026. ALL RIGHTS RESERVED.</p>
            </footer>
        </div>
    );
}
