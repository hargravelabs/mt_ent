import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../sanityClient';
import MediaLoader from './MediaLoader';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Services = () => {
    const headerRef = useRef(null);
    const [categoryImages, setCategoryImages] = useState({
        photography: null,
        videography: null,
        cinematography: null,
        'event-media': null
    });

    useEffect(() => {
        const fetchImages = async () => {
            try {
                // Fetch the single 'studioCapabilities' document
                const query = `*[_type == "studioCapabilities"][0] {
                    "photography": photographyImage.asset->url,
                    "photographyVideo": photographyVideo.asset->url,
                    "videography": videographyImage.asset->url,
                    "videographyVideo": videographyVideo.asset->url,
                    "cinematography": cinematographyImage.asset->url,
                    "cinematographyVideo": cinematographyVideo.asset->url,
                    "eventMedia": eventMediaImage.asset->url,
                    "eventMediaVideo": eventMediaVideo.asset->url
                }`;
                const data = await client.fetch(query);

                if (data) {
                    setCategoryImages(data);
                }
            } catch (error) {
                console.error("Error fetching studio capabilities images:", error);
            }
        };

        fetchImages();
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            const words = gsap.utils.toArray('.services-statement .word');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: headerRef.current,
                    start: "top 70%",
                    toggleActions: "play none none none"
                }
            });

            tl.to('.services-label', {
                opacity: 1,
                y: -10,
                duration: 0.5,
                ease: "power2.out"
            }, 0);

            tl.to(words, {
                opacity: 1,
                y: 0,
                filter: "blur(0px)",
                stagger: 0.1,
                duration: 1.2,
                ease: "power3.out"
            }, 0.2);

        }, headerRef);

        return () => ctx.revert();
    }, []);

    const renderMedia = (image, video, alt) => {
        if (video) {
            return <MediaLoader src={video} type="video" mediaClass="service-card-img" />;
        }
        if (image) {
            return <MediaLoader src={image} type="image" alt={alt} mediaClass="service-card-img" />;
        }
        return null;
    };

    return (
        <section className="services-section" id="services">
            <div className="services-header" ref={headerRef}>
                <p className="services-label">Studio Capabilities</p>
                <h2 className="services-statement">
                    <span className="word">Our</span>
                    <span className="word"><i>Services</i></span>
                </h2>
            </div>


            <div className="services-container bento-layout">
                <div className="services-bento-grid modern-asymmetric-grid">

                    {/* PHOTOGRAPHY CARD (Main Hero Card) */}
                    <Link to="/works/photography" className="service-card modern-card photography-card">
                        {renderMedia(categoryImages.photography, categoryImages.photographyVideo, "Photography")}
                        <span className="modern-card-num">01 //</span>
                        <div className="card-content-layer">
                            <h2 className="modern-card-title">Photography</h2>
                        </div>
                    </Link>

                    {/* VIDEOGRAPHY CARD (Top Right) */}
                    <Link to="/works/videography" className="service-card modern-card videography-card">
                        {renderMedia(categoryImages.videography, categoryImages.videographyVideo, "Videography")}
                        <span className="modern-card-num">02 //</span>
                        <div className="card-content-layer">
                            <h2 className="modern-card-title">Videography</h2>
                        </div>
                    </Link>

                    {/* CINEMATOGRAPHY CARD (Bottom Right) */}
                    <Link to="/works/cinematography" className="service-card modern-card cinematography-card">
                        {renderMedia(categoryImages.cinematography, categoryImages.cinematographyVideo, "Cinematography")}
                        <span className="modern-card-num">03 //</span>
                        <div className="card-content-layer">
                            <h2 className="modern-card-title">Cinematography</h2>
                        </div>
                    </Link>

                    {/* EVENT MEDIA CARD (Wide Footer Card) */}
                    <Link to="/works/event-media" className="service-card modern-card event-media-card">
                        {renderMedia(categoryImages.eventMedia, categoryImages.eventMediaVideo, "Event Media")}
                        <span className="modern-card-num">04 //</span>
                        <div className="card-content-layer horizontal-content">
                            <h2 className="modern-card-title">Event Media</h2>
                        </div>
                    </Link>

                </div>
            </div>
        </section>
    );
};

export default Services;
