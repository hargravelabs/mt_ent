import React, { useState, useEffect, forwardRef, useRef } from 'react';
import VideoControls from './ui/VideoControls';
import './ui/VideoControls.css';
import './MediaLoader.css';

const MediaLoader = forwardRef(({ src, type = 'image', alt = '', className = '', mediaClass = '', showControls = false, controlsVariant = 'minimal' }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);
    const internalRef = useRef(null);

    useEffect(() => {
        setIsLoaded(false);
        setHasError(false);

        // Check if media is already loaded from cache
        if (internalRef.current) {
            if (type === 'image' && internalRef.current.complete && internalRef.current.naturalHeight > 0) {
                setIsLoaded(true);
            } else if (type === 'video' && internalRef.current.readyState >= 3) {
                setIsLoaded(true);
            }
        }
    }, [src, type]);

    if (!src) return null;

    const handleLoad = () => setIsLoaded(true);
    const handleError = () => {
        setHasError(true);
        setIsLoaded(true);
    };

    const setRefs = (node) => {
        internalRef.current = node;
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
    };

    return (
        <div className={`media-loader-container ${className}`}>
            {!isLoaded && !hasError && (
                <div className="media-loader-overlay">
                    <div className="media-loader-spinner"></div>
                </div>
            )}

            {type === 'video' ? (
                <>
                    <video
                        ref={setRefs}
                        src={src}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className={`media-element ${mediaClass} ${isLoaded ? 'loaded' : ''}`}
                        onLoadedData={handleLoad}
                        onError={handleError}
                    />
                    {showControls && (
                        <VideoControls
                            videoRef={internalRef}
                            variant={controlsVariant}
                        />
                    )}
                </>
            ) : (
                <img
                    ref={setRefs}
                    src={src}
                    alt={alt}
                    className={`media-element ${mediaClass} ${isLoaded ? 'loaded' : ''}`}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}

            {hasError && (
                <div className="media-error-overlay">
                    <span>Media unavailable</span>
                </div>
            )}
        </div>
    );
});

export default MediaLoader;
