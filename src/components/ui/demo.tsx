'use client';

import { useEffect } from 'react';
import ScrollExpandMedia from './scroll-expansion-hero';
import { ChevronDown } from 'lucide-react';
import { urlFor } from '../../context/GalleryCacheContext';

const Demo = ({ items }: { items?: any[] }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className='flex flex-col w-full bg-black'>
      {items.map((item, index) => {
        const isVideo = item.mediaType === 'video' && item.video?.asset?.url;
        const imageSource = isVideo ? item.videoThumbnail : item.image;
        
        // Use urlFor to generate a proper image URL with format and scaling
        const bgImageSrc = imageSource?.asset?.url 
          ? urlFor(imageSource).width(1920).auto('format').url() 
          : 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop';
          
        const mediaSrc = isVideo ? item.video.asset.url : bgImageSrc;
        const posterSrc = isVideo && imageSource?.asset?.url ? bgImageSrc : undefined;

        if (!mediaSrc && !bgImageSrc) return null;

        return (
            <ScrollExpandMedia
                key={item._id || `cin-item-${index}`}
                mediaType={isVideo ? 'video' : 'image'}
                mediaSrc={mediaSrc}
                posterSrc={posterSrc}
                bgImageSrc={bgImageSrc}
                title={item.title || `Production Reel ${index + 1}`}
                scrollToExpand=""
                textBlend={false}
            >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="flex flex-col items-center animate-bounce opacity-80">
                    <span className="text-white/60 text-xs uppercase tracking-[0.3em] font-medium mb-2">Scroll for next video</span>
                    <ChevronDown className="w-6 h-6 text-white/40" />
                  </div>
                </div>
            </ScrollExpandMedia>
        );
      })}
    </div>
  );
};

export default Demo;
