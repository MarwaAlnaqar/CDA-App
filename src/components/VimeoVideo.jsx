
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Player from '@vimeo/player';
import { media } from '../utils.js';

export function getCardVideo(card, type = 'question', lang = 'ar') {
  if (!card) return '';

  const language = lang === 'ar' ? 'ar' : 'en';

  const fields = {
    question: `card_video_url_${language}`,
    correct: `card_video_correct_answer_url_${language}`,
    wrong: `card_video_wrong_answer_url_${language}`,
  };

  return card[fields[type]] || '';
}

const normalizeVideoUrl = (value) =>
  String(value || '').trim().replace(/^['"]|['"]$/g, '');

const isVimeoUrl = (value) => {
  const normalized = normalizeVideoUrl(value);
  if (!normalized) return false;

  try {
    const host = new URL(normalized).hostname.toLowerCase();
    return host === 'vimeo.com' || host.endsWith('.vimeo.com');
  } catch {
    return false;
  }
};

export function getVimeoEmbedUrl(url, options = {}) {
  const normalized = normalizeVideoUrl(url);

  if (!normalized || !isVimeoUrl(normalized)) return '';

  try {
    const parsed = new URL(normalized);
    const segments = parsed.pathname.split('/').filter(Boolean);

    const videoIndex = segments.findIndex((segment) =>
      /^\d+$/.test(segment)
    );

    if (videoIndex === -1) return '';

    const videoId = segments[videoIndex];

    const privacyHash =
      parsed.searchParams.get('h') ||
      (/^[a-f0-9]+$/i.test(segments[videoIndex + 1] || '')
        ? segments[videoIndex + 1]
        : '');

    const embed = new URL(
      `https://player.vimeo.com/video/${videoId}`
    );

    if (privacyHash) {
      embed.searchParams.set('h', privacyHash);
    }

    embed.searchParams.set(
      'autoplay',
      options.autoplay === false ? '0' : '1'
    );
    embed.searchParams.set('muted', options.muted ? '1' : '0');
    embed.searchParams.set('playsinline', '1');
    embed.searchParams.set(
      'controls',
      options.controls === false ? '0' : '1'
    );
    embed.searchParams.set('loop', options.loop ? '1' : '0');
    embed.searchParams.set('dnt', '1');

    return embed.toString();
  } catch {
    return '';
  }
}

export default function VimeoVideo({
  url,
  title = 'Himaya Sign Language Video',
  onEnded,
  onError,
  autoplay = true,
  muted = false,
  controls = true,
  loadingLabel = 'Loading video...',
  className = '',
  fallbackSrc = '',
  placeholderSrc = '',
}) {
  const iframeRef = useRef(null);
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const callbacksRef = useRef({ onEnded, onError });

  const [ready, setReady] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [localReady, setLocalReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(false);

  const normalizedUrl = useMemo(
    () => normalizeVideoUrl(url),
    [url]
  );

  const isVimeo = isVimeoUrl(normalizedUrl);

  const directVideoUrl = useMemo(
    () =>
      normalizedUrl && !isVimeo
        ? media(normalizedUrl)
        : '',
    [normalizedUrl, isVimeo]
  );

  const fallbackVideoUrl = useMemo(
    () => (fallbackSrc ? media(fallbackSrc) : ''),
    [fallbackSrc]
  );

  const placeholderImage = useMemo(
    () => (placeholderSrc ? media(placeholderSrc) : ''),
    [placeholderSrc]
  );

  const embedUrl = useMemo(
    () =>
      getVimeoEmbedUrl(normalizedUrl, {
        autoplay,
        muted,
        controls,
        loop: !onEnded,
      }),
    [normalizedUrl, autoplay, muted, controls, onEnded]
  );

  const localSource =
    directVideoUrl ||
    (!isVimeo || !embedUrl ? fallbackVideoUrl : '');

  const useVimeo = Boolean(isVimeo && embedUrl && !localSource);

  const videoKey = useVimeo ? embedUrl : localSource;

  useEffect(() => {
    callbacksRef.current = { onEnded, onError };
  }, [onEnded, onError]);

  useEffect(() => {
    setReady(false);
    setVideoStarted(false);
    setLocalReady(false);
    setFailed(false);
    setShowPlayButton(false);
  }, [videoKey]);

  useEffect(() => {
    if (!useVimeo || !iframeRef.current) return;

    let disposed = false;
    const player = new Player(iframeRef.current);
    playerRef.current = player;

    const handleEnded = () => {
      if (!disposed) {
        callbacksRef.current.onEnded?.();
      }
    };

    const handlePlaying = () => {
      if (!disposed) setVideoStarted(true);
    };

    const handleError = (error) => {
      if (disposed) return;

      console.error('[Vimeo] Player error:', error);

      setFailed(true);
      callbacksRef.current.onError?.(error);
    };

    player.on('ended', handleEnded);
    player.on('playing', handlePlaying);
    player.on('error', handleError);

    const initialize = async () => {
      try {
        await player.ready();

        if (disposed) return;

        setReady(true);

        if (!autoplay) return;

        try {
          await player.play();

          if (!disposed) {
            setShowPlayButton(false);
          }

        } catch (error) {
          if (disposed) return;

          console.warn(
            '[Vimeo] Autoplay blocked or failed:',
            error
          );

          setShowPlayButton(true);

        }
      } catch (error) {
        if (disposed) return;

        console.error(
          '[Vimeo] Initialization failed:',
          error
        );

        setFailed(true);
        callbacksRef.current.onError?.(error);
      }
    };

    void initialize();

    return () => {
      disposed = true;

      player.off('ended', handleEnded);
      player.off('playing', handlePlaying);
      player.off('error', handleError);

      if (playerRef.current === player) {
        playerRef.current = null;
      }

      // React owns the iframe element. Do not call destroy()
      // here, which can remove it during cleanup.
    };
  }, [videoKey, useVimeo, autoplay]);

  const handleManualPlay = async () => {
    try {
      const player = playerRef.current;
      if (!player) return;

      await player.play();
      setShowPlayButton(false);
    } catch (error) {
      console.error('[Vimeo] Manual playback failed:', error);
      callbacksRef.current.onError?.(error);
    }
  };

  if (localSource) {
    return (
      <div className={`himaya-vimeo-wrapper ${className}`}>
        {placeholderImage && (
          <img
            className={`himaya-video-loading-placeholder ${localReady ? 'is-hidden' : ''}`}
            src={placeholderImage}
            alt=""
            aria-hidden="true"
          />
        )}
        <video
          key={localSource}
          ref={videoRef}
          className="himaya-video-fallback"
          src={localSource}
          autoPlay={autoplay}
          muted={muted}
          controls={controls}
          loop={!onEnded}
          preload="auto"
          playsInline
          style={{ opacity: placeholderImage && !localReady ? 0 : 1 }}
          aria-label={title}
          onCanPlay={() => setLocalReady(true)}
          onEnded={() => callbacksRef.current.onEnded?.()}
          onError={(error) => {
            console.error('[Video] Local playback error:', error);
            callbacksRef.current.onError?.(error);
          }}
        />
      </div>
    );
  }

  if (!useVimeo || failed) {
    return (
      <div className={`himaya-video-placeholder ${className}`}>
        <span>Video unavailable</span>
      </div>
    );
  }

  return (
    <div
      className={`himaya-vimeo-wrapper ${className}`}
      style={{ position: 'relative' }}
    >
      <iframe
        key={embedUrl}
        ref={iframeRef}
        src={embedUrl}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        loading="eager"
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          display: 'block',
        }}
      />

      {placeholderImage ? (
        <img
          className={`himaya-video-loading-placeholder ${videoStarted ? 'is-hidden' : ''}`}
          src={placeholderImage}
          alt=""
          aria-hidden="true"
        />
      ) : !videoStarted && (
        <div
          className="himaya-vimeo-loading"
          aria-live="polite"
        >
          {loadingLabel}
        </div>
      )}

      {ready && showPlayButton && (
        <div className="himaya-vimeo-play-overlay">
          <button
            type="button"
            className="himaya-vimeo-play-button"
            onClick={handleManualPlay}
          >
            ▶ Play Video
          </button>
        </div>
      )}
    </div>
  );
}
