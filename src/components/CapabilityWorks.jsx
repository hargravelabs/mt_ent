import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { client } from '../sanityClient';
import MasonryGrid from './MasonryGrid';
import CustomCursor from '../CustomCursor'; // To ensure cursor behaves properly
import './CapabilityWorks.css';

const CapabilityWorks = () => {
    const { capability } = useParams();
    const [galleryItems, setGalleryItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useLayoutEffect(() => {
        // Use a small timeout to ensure Lenis smooth scroll destroy sequence doesn't intercept the native scroll jump
        const timeoutId = setTimeout(() => {
            window.scrollTo(0, 0);
        }, 50);
        return () => clearTimeout(timeoutId);
    }, [capability]);

    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const categoryMapping = {
                    'photography': 'Photography',
                    'videography': 'Videography',
                    'cinematography': 'Cinematography',
                    'event-media': 'Event Media'
                };
                const categoryName = categoryMapping[capability] || capability.replace('-', ' ');

                // Fetch both new gallery items and old projects to preserve existing content
                const query = `*[(_type == "galleryItem" || _type == "project") && category == $categoryName] | order(_createdAt desc) {
                    _type,
                    _id,
                    title,
                    category,
                    mediaType,
                    image { asset->{url, metadata { dimensions } } },
                    images[] { asset->{url} },
                    galleryImages[] { asset->{url} },
                    video { asset->{url} }
                }`;

                const data = await client.fetch(query, { categoryName });

                // Flatten old multi-image "projects" so each photo has its own spot in the masonry grid
                const flattenedItems = [];

                data.forEach(doc => {
                    if (doc._type === "galleryItem") {
                        flattenedItems.push(doc);
                    } else if (doc._type === "project") {
                        if (doc.mediaType === 'video' && doc.video) {
                            flattenedItems.push({
                                _id: doc._id + '-vid',
                                title: doc.title,
                                mediaType: 'video',
                                video: doc.video
                            });
                        }
                        if (doc.mediaType === 'image' && doc.image) {
                            flattenedItems.push({
                                _id: doc._id + '-img',
                                title: doc.title,
                                mediaType: 'image',
                                image: doc.image
                            });
                        }
                        if (doc.mediaType === 'image_collage' && doc.images) {
                            doc.images.forEach((img, idx) => {
                                flattenedItems.push({
                                    _id: doc._id + '-img-' + idx,
                                    title: idx === 0 ? doc.title : '',
                                    mediaType: 'image',
                                    image: img
                                });
                            });
                        }
                        if (doc.mediaType === 'gallery' && doc.galleryImages) {
                            doc.galleryImages.forEach((img, idx) => {
                                flattenedItems.push({
                                    _id: doc._id + '-gal-' + idx,
                                    title: idx === 0 ? doc.title : '',
                                    mediaType: 'image',
                                    image: img
                                });
                            });
                        }
                    }
                });

                setGalleryItems(flattenedItems);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, [capability]);

    return (
        <div className="capability-works-page">
            <div className="capability-works-content">
                <Link to="/" className="back-link">
                    &larr; Back to Studio
                </Link>

                <h1 className="capability-title">
                    {capability.replace('-', ' ')} Works
                </h1>

                {loading ? (
                    <div style={{ color: '#888', fontStyle: 'italic', height: '50vh', display: 'flex', alignItems: 'center' }}>Loading portfolio...</div>
                ) : galleryItems.length > 0 ? (
                    <MasonryGrid items={galleryItems} />
                ) : (
                    <div style={{ color: '#555', height: '50vh', display: 'flex', alignItems: 'center' }}>No works found for this capability.</div>
                )}
            </div>
        </div>
    );
};

export default CapabilityWorks;
