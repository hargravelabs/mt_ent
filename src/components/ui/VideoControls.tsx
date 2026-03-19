'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

interface VideoControlsProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  variant?: 'full' | 'minimal';
  className?: string;
  onMuteToggle?: (muted: boolean) => void;
  externalMuted?: boolean;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const VideoControls = ({
  videoRef,
  variant = 'full',
  className = '',
  onMuteToggle,
  externalMuted,
}: VideoControlsProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with external muted state
  useEffect(() => {
    if (externalMuted !== undefined) {
      setIsMuted(externalMuted);
    }
  }, [externalMuted]);

  // Sync play state from video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (!isScrubbing) setCurrentTime(video.currentTime);
    };
    const onLoadedMetadata = () => setDuration(video.duration);
    const onDurationChange = () => setDuration(video.duration);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('durationchange', onDurationChange);

    // Initialize state
    setIsPlaying(!video.paused);
    setIsMuted(video.muted);
    if (video.duration) setDuration(video.duration);
    setCurrentTime(video.currentTime);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('durationchange', onDurationChange);
    };
  }, [videoRef, isScrubbing]);

  const showControls = useCallback(() => {
    setIsVisible(true);
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    hideTimeout.current = setTimeout(() => {
      if (!isScrubbing) setIsVisible(false);
    }, 3000);
  }, [isScrubbing]);

  const togglePlay = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
    showControls();
  }, [videoRef, showControls]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    const newMuted = !video.muted;
    video.muted = newMuted;
    setIsMuted(newMuted);
    if (onMuteToggle) onMuteToggle(newMuted);
    showControls();
  }, [videoRef, onMuteToggle, showControls]);

  const seekTo = useCallback((clientX: number) => {
    const video = videoRef.current;
    const bar = progressRef.current;
    if (!video || !bar || !video.duration) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
    setCurrentTime(video.currentTime);
  }, [videoRef]);

  const handleProgressClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    seekTo(e.clientX);
    showControls();
  }, [seekTo, showControls]);

  const handleScrubStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    setIsScrubbing(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    seekTo(clientX);
  }, [seekTo]);

  useEffect(() => {
    if (!isScrubbing) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      seekTo(clientX);
    };
    const handleUp = () => setIsScrubbing(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleMove);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleUp);
    };
  }, [isScrubbing, seekTo]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Keyboard accessibility
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const video = videoRef.current;
    if (!video) return;
    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlay(e as unknown as React.MouseEvent);
        break;
      case 'm':
        e.preventDefault();
        toggleMute(e as unknown as React.MouseEvent);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 5);
        showControls();
        break;
      case 'ArrowRight':
        e.preventDefault();
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
        showControls();
        break;
    }
  }, [videoRef, togglePlay, toggleMute, showControls]);

  if (variant === 'minimal') {
    return (
      <div
        className={`video-controls-minimal ${className}`}
        onMouseEnter={showControls}
        onMouseMove={showControls}
        onClick={togglePlay}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="toolbar"
        aria-label="Video controls"
      >
        {/* Play/pause overlay */}
        <div className={`video-controls-play-overlay ${!isPlaying ? 'visible' : isVisible ? 'visible' : ''}`}>
          {isPlaying ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          )}
        </div>

        {/* Bottom bar */}
        <div className={`video-controls-bar-minimal ${isVisible || !isPlaying ? 'visible' : ''}`}>
          <div
            ref={progressRef}
            className="video-controls-progress"
            onClick={handleProgressClick}
            onMouseDown={handleScrubStart}
            onTouchStart={handleScrubStart}
            role="slider"
            aria-label="Video progress"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            tabIndex={0}
          >
            <div className="video-controls-progress-fill" style={{ width: `${progress}%` }} />
            <div className="video-controls-progress-thumb" style={{ left: `${progress}%` }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`video-controls-wrapper ${className}`}
      onMouseEnter={showControls}
      onMouseMove={showControls}
      onMouseLeave={() => { if (!isScrubbing) setIsVisible(false); }}
      onClick={togglePlay}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="toolbar"
      aria-label="Video controls"
    >
      {/* Center play/pause indicator */}
      <div className={`video-controls-center-icon ${!isPlaying ? 'visible' : ''}`}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-lg"><polygon points="5 3 19 12 5 21 5 3" /></svg>
      </div>

      {/* Bottom control bar */}
      <div
        className={`video-controls-bar ${isVisible || !isPlaying || isScrubbing ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div
          ref={progressRef}
          className="video-controls-progress"
          onClick={handleProgressClick}
          onMouseDown={handleScrubStart}
          onTouchStart={handleScrubStart}
          role="slider"
          aria-label="Video progress"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          tabIndex={0}
        >
          <div className="video-controls-progress-fill" style={{ width: `${progress}%` }} />
          <div className="video-controls-progress-thumb" style={{ left: `${progress}%` }} />
        </div>

        {/* Buttons row */}
        <div className="video-controls-buttons">
          <div className="video-controls-left">
            <button
              className="video-controls-btn"
              onClick={togglePlay}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              )}
            </button>

            <button
              className="video-controls-btn"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
              )}
            </button>

            <span className="video-controls-time">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
