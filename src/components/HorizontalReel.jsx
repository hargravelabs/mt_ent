import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MagneticButton from './MagneticButton';
import { client } from '../sanityClient';

gsap.registerPlugin(ScrollTrigger);

const HorizontalReel = () => {
    const horizontalRef = useRef(null);
    const wrapperRef = useRef(null);
    const [projects, setProjects] = useState([]);
    const videoRefs = useRef([]);

    // 1. Fetch Projects from Sanity
    useEffect(() => {
        const fetchProjects = async () => {
            const query = `*[_type == "project"] | order(order asc) {
        _id,
        title,
        category,
        mediaType,
        "imageUrl": image.asset->url,
        "imageDimensions": image.asset->metadata.dimensions,
        "imageCollageUrls": images[].asset->url,
        "videoUrl": video.asset->url
      }`;
            const data = await client.fetch(query);
            console.log("SANITY DATA LOADED:", data);
            setProjects(data);
        };
        fetchProjects();
    }, []);

    // 2. Intersection Observer for playing/pausing videos
    useEffect(() => {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.15 // Play when 15% visible
        };

        const handleVideoIntersection = (entries) => {
            entries.forEach(entry => {
                if (entry.target && entry.target.tagName === 'VIDEO') {
                    if (entry.isIntersecting) {
                        entry.target.play().catch(e => console.log("Autoplay prevented:", e));
                    } else {
                        entry.target.pause();
                    }
                }
            });
        };

        const observer = new IntersectionObserver(handleVideoIntersection, observerOptions);

        videoRefs.current.forEach(video => {
            if (video) observer.observe(video);
        });

        return () => observer.disconnect();
    }, [projects]); // Re-run when projects load

    // 3. GSAP Horizontal Scroll Logic
    useEffect(() => {
        if (projects.length === 0) return; // Wait until cards are rendered

        const ctx = gsap.context(() => {
            const horizontalSection = horizontalRef.current;
            const scrollWrapper = wrapperRef.current;

            const getScrollAmount = () => -(scrollWrapper.scrollWidth - window.innerWidth);

            // Create scroll trigger for horizontal movement
            const scrollTween = gsap.to(scrollWrapper, {
                x: getScrollAmount,
                ease: "none",
                scrollTrigger: {
                    trigger: horizontalSection,
                    pin: true,
                    scrub: 1.5,
                    start: "top top",
                    end: () => `+=${scrollWrapper.scrollWidth - window.innerWidth}`,
                    invalidateOnRefresh: true
                }
            });

            // Internal Image Parallax during horizontal scroll
            gsap.utils.toArray('.scroll-card').forEach((card) => {
                const media = card.querySelector('.parallax-media');
                if (media) {
                    gsap.fromTo(media,
                        { xPercent: -10 },
                        {
                            xPercent: 10,
                            ease: "none",
                            scrollTrigger: {
                                trigger: card,
                                containerAnimation: scrollTween,
                                start: "left right",
                                end: "right left",
                                scrub: true,
                                invalidateOnRefresh: true
                            }
                        }
                    );
                }
            });
        }, horizontalRef);

        return () => ctx.revert();
    }, [projects]); // Depend on projects so GSAP knows how many cards there are

    // Helper: Determine CSS class based on dimensions
    const getAspectRatioClass = (project) => {
        if (project.mediaType === 'image' && project.imageMetadata?.dimensions) {
            const { width, height } = project.imageMetadata.dimensions;
            return width > height ? 'aspect-video' : 'aspect-[4/5]';
        }
        // For video (assuming wide by default unless specified differently by client)
        // You could theoretically extract video dimensions if Sanity plugin provides it, but letting it default based on file handles most cases
        // Here we default to setting wide aspect-video, but CSS object-fit cover takes over based on parent containers
        return 'aspect-video'; // Defaulting to wide, but can be customized later if needed
    };

    return (
        <section className="horizontal-section" ref={horizontalRef} id="portfolio">
            <div className="scroll-wrapper" ref={wrapperRef}>

                {projects.map((project, index) => {
                    // Logic to figure out if it's landscape or portrait purely by class for styling hooks
                    let orientationClass = 'landscape'; // default 16:9
                    if (project.mediaType === 'image' && project.imageDimensions) {
                        const { width, height } = project.imageDimensions;
                        if (height > width) orientationClass = 'portrait';
                    } else if (project.mediaType === 'video' || project.mediaType === 'image_collage') {
                        orientationClass = 'landscape';
                    }

                    return (
                        <div className="scroll-card" key={project._id}>
                            <div className={`card-inner ${orientationClass}`}>
                                <div className="card-media" style={{ display: 'flex', flexDirection: 'row', gap: '5px', width: '100%', height: '100%' }}>
                                    {project.mediaType === 'image_collage' && project.imageCollageUrls && project.imageCollageUrls.length > 0 ? (
                                        project.imageCollageUrls.map((url, i) => (
                                            <img
                                                key={i}
                                                src={url}
                                                alt={`${project.title} - part ${i + 1}`}
                                                className="collage-image"
                                            />
                                        ))
                                    ) : project.mediaType === 'image' && project.imageUrl ? (
                                        <img
                                            src={project.imageUrl}
                                            alt={project.title}
                                            className="parallax-media"
                                        />
                                    ) : project.mediaType === 'video' && project.videoUrl ? (
                                        <video
                                            ref={el => videoRefs.current[index] = el}
                                            src={project.videoUrl}
                                            loop
                                            muted
                                            playsInline
                                            className="parallax-media"
                                        />
                                    ) : null}
                                    <div className="card-overlay"></div>
                                </div>
                                <div className="card-info">
                                    <p className="card-role">{project.category}</p>
                                    <h2>{project.title}</h2>
                                </div>
                            </div>
                        </div>
                    );
                })}

                <div className="scroll-card end-card">
                    <div className="card-inner cta-inner landscape">
                        <h2 className="massive-text">Full <br />Archive</h2>
                        <MagneticButton className="cta-primary view-all-btn">
                            <span className="btn-text">Explore All Work</span>
                        </MagneticButton>
                    </div>
                </div>

            </div>
        </section>
    );
};

export default HorizontalReel;
