import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { client } from '../sanityClient';
import MasonryGrid from './MasonryGrid';

const ITEMS_PER_PAGE = 15;

const EventAlbumPage = () => {
    const { slug } = useParams();
    const [albumTitle, setAlbumTitle] = useState('');
    const [albumId, setAlbumId] = useState(null);
    const [items, setItems] = useState([]);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(true);
    const loaderRef = useRef(null);
    const fetchingRef = useRef(false);

    // Fetch album metadata
    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const query = `*[_type == "eventAlbum" && slug.current == $slug][0] {
                    _id,
                    title
                }`;
                const album = await client.fetch(query, { slug });
                if (album) {
                    setAlbumTitle(album.title);
                    setAlbumId(album._id);
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error('Failed to fetch event album:', error);
                setLoading(false);
            }
        };

        fetchAlbum();
    }, [slug]);

    // Fetch media items for this album
    const fetchMore = useCallback(async () => {
        if (!albumId || fetchingRef.current || !hasMore) return;
        fetchingRef.current = true;

        try {
            const query = `*[_type == "galleryItem" && category == "Event Media" && eventAlbum._ref == $albumId] | order(orderRank asc, _createdAt desc) [$start...$end] {
                _id,
                _type,
                title,
                category,
                mediaType,
                image {
                    asset->{
                        url,
                        metadata { lqip, dimensions }
                    }
                },
                video {
                    asset->{
                        url
                    }
                },
                youtubeUrl,
                videoThumbnail {
                    asset->{
                        url,
                        metadata { lqip, dimensions }
                    }
                }
            }`;

            const params = {
                albumId,
                start: items.length,
                end: items.length + ITEMS_PER_PAGE,
            };

            const data = await client.fetch(query, params);
            setItems((prev) => [...prev, ...data]);
            setHasMore(data.length === ITEMS_PER_PAGE);
        } catch (error) {
            console.error('Failed to fetch event media items:', error);
        } finally {
            fetchingRef.current = false;
            setLoading(false);
        }
    }, [albumId, items.length, hasMore]);

    // Initial fetch when albumId is set
    useEffect(() => {
        if (albumId && items.length === 0) {
            fetchMore();
        }
    }, [albumId]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const observerTarget = loaderRef.current;
        if (!observerTarget) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore) {
                    fetchMore();
                }
            },
            { rootMargin: '400px', threshold: 0.1 }
        );

        observer.observe(observerTarget);

        return () => {
            if (observerTarget) observer.unobserve(observerTarget);
        };
    }, [hasMore, fetchMore]);

    const isInitialLoad = loading && items.length === 0;

    return (
        <div className="capability-works-page">
            <div className="capability-works-content">
                <Link to="/works/event-media" className="back-to-studio-fixed">
                    &larr; Back to Events
                </Link>

                <h1 className="capability-title">
                    {albumTitle || 'Event'}
                </h1>

                {isInitialLoad ? (
                    <div style={{ color: '#888', fontStyle: 'italic', height: '50vh', display: 'flex', alignItems: 'center' }}>
                        Loading portfolio...
                    </div>
                ) : items.length === 0 ? (
                    <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', paddingTop: '4rem' }}>
                        No media in this event yet.
                    </div>
                ) : (
                    <>
                        <MasonryGrid items={items} />

                        {hasMore && items.length > 0 && (
                            <div
                                ref={loaderRef}
                                style={{
                                    height: '50px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: '2rem',
                                    color: '#888',
                                }}
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

export default EventAlbumPage;
