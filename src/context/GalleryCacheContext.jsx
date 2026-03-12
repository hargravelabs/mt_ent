import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { client } from '../sanityClient';
import imageUrlBuilder from '@sanity/image-url';

// Initialize the Sanity image builder
export const urlFor = (source) => imageUrlBuilder(client).image(source);

const GalleryCacheContext = createContext();

export const useGalleryCache = () => useContext(GalleryCacheContext);

export const GalleryCacheProvider = ({ children }) => {
    // Cache structure:
    // {
    //    'Photography': { items: [], hasMore: true },
    //    'Videography': { items: [], hasMore: true },
    //    ...
    // }
    const [cache, setCache] = useState({});
    
    // Track categories currently being fetched so we don't trigger simultaneous redundant loaders
    const fetchingStates = useRef({});

    const fetchMore = useCallback(async (category) => {
        // Prevent concurrent fetching for the exact same block of items
        if (fetchingStates.current[category]) return;
        
        const cachedData = cache[category] || { items: [], hasMore: true };
        
        if (!cachedData.hasMore) return;

        fetchingStates.current[category] = true;

        const currentCount = cachedData.items.length;
        const limitSize = 15; // The number of items to fetch per 'page'

        try {
            // Only pull native galleryItem entries, sorted newest-first
            // We slice the exact portion of the paginated list we want [start...end]
            const query = `*[_type == "galleryItem" && category == $category] | order(orderRank asc, _createdAt desc) [$start...$end] {
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
                videoThumbnail {
                    asset->{
                        url,
                        metadata { lqip, dimensions }
                    }
                }
            }`;

            const params = {
                category,
                start: currentCount,
                end: currentCount + limitSize
            };

            const data = await client.fetch(query, params);

            setCache(prev => ({
                ...prev,
                [category]: {
                    items: [...(prev[category]?.items || []), ...data],
                    // If we get fewer items back than we requested, we've hit the exact end of the list
                    hasMore: data.length === limitSize
                }
            }));
            
        } catch (error) {
            console.error(`Failed to fetch gallery items for ${category}:`, error);
            // On hard fail, assume there is theoretically more to grab later rather than disabling
        } finally {
            fetchingStates.current[category] = false;
        }
    }, [cache]);

    return (
        <GalleryCacheContext.Provider value={{ cache, fetchMore }}>
            {children}
        </GalleryCacheContext.Provider>
    );
};
