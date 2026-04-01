import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { client } from '../sanityClient';
import { urlFor } from '../context/GalleryCacheContext';
import './EventMediaGallery.css';

const ALBUMS_CACHE_KEY = 'mt_event_albums_v1';
const ALBUMS_CACHE_TTL = 1000 * 60 * 60 * 2; // 2 hours

const EventMediaGallery = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const cached = localStorage.getItem(ALBUMS_CACHE_KEY);
                if (cached) {
                    const parsed = JSON.parse(cached);
                    if (Date.now() - parsed.timestamp < ALBUMS_CACHE_TTL && parsed.data) {
                        setAlbums(parsed.data);
                        setLoading(false);
                        return;
                    }
                }

                const query = `*[_type == "eventAlbum"] | order(orderRank asc, date desc) {
                    _id,
                    title,
                    "slug": slug.current,
                    thumbnail {
                        asset->{
                            url,
                            metadata { lqip, dimensions }
                        }
                    },
                    description,
                    date
                }`;

                const data = await client.fetch(query);
                setAlbums(data);
                localStorage.setItem(
                    ALBUMS_CACHE_KEY,
                    JSON.stringify({ data, timestamp: Date.now() })
                );
            } catch (error) {
                console.error('Failed to fetch event albums:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAlbums();
    }, []);

    if (loading) {
        return (
            <div className="capability-works-page">
                <div className="capability-works-content">
                    <Link to="/#services" className="back-to-studio-fixed">
                        &larr; Back to Studio
                    </Link>
                    <h1 className="capability-title">event media</h1>
                    <div style={{ color: '#888', fontStyle: 'italic', height: '50vh', display: 'flex', alignItems: 'center' }}>
                        Loading events...
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="capability-works-page">
            <div className="capability-works-content">
                <Link to="/#services" className="back-to-studio-fixed">
                    &larr; Back to Studio
                </Link>

                <h1 className="capability-title">event media</h1>

                {albums.length === 0 ? (
                    <div style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', paddingTop: '4rem' }}>
                        No events yet.
                    </div>
                ) : (
                    <div className="event-albums-grid">
                        {albums.map((album) => {
                            const thumbnailUrl = album.thumbnail
                                ? urlFor(album.thumbnail).width(800).auto('format').url()
                                : null;
                            const lqip = album.thumbnail?.asset?.metadata?.lqip;

                            return (
                                <Link
                                    to={`/works/event-media/${album.slug}`}
                                    className="event-album-card"
                                    key={album._id}
                                >
                                    <div className="event-album-thumbnail">
                                        {thumbnailUrl && (
                                            <img
                                                src={thumbnailUrl}
                                                alt={album.title}
                                                loading="lazy"
                                                style={{
                                                    backgroundImage: lqip ? `url(${lqip})` : undefined,
                                                    backgroundSize: 'cover',
                                                }}
                                            />
                                        )}
                                        <div className="event-album-overlay" />
                                    </div>
                                    <div className="event-album-info">
                                        <h2 className="event-album-title">{album.title}</h2>
                                        {album.date && (
                                            <span className="event-album-date">
                                                {new Date(album.date).toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                })}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventMediaGallery;
