
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import Player from '@vimeo/player';

// Get the video URL based on selected language.
export function getCardVideo(card, type = 'question', lang = 'ar') {
  if (!card) return '';

  const language = lang === 'ar' ? 'ar' : 'en';

  const fields = {
    question: `card_video_url_${language}`,
    correct: `card_video_correct_answer_url_${language}`,
    wrong: `card_video_wrong_answer_url_${language}`
  };

  return card[fields[type]] || '';
}

// Convert a Vimeo link to an embeddable Vimeo player URL.
export function getVimeoEmbedUrl(url) {
  if (!url || typeof url !== 'string') return '';

  try {
    const parsed = new URL(url.trim());

    const host = parsed.hostname.toLowerCase();

    if (
      host !== 'vimeo.com' &&
      host !== 'www.vimeo.com' &&
      host !== 'player.vimeo.com'
    ) {
      return '';
    }

    const segments = parsed.pathname.split('/').filter(Boolean);

    const videoIndex = segments.findIndex(segment =>
      /^\d+$/.test(segment)
    );

    if (videoIndex === -1) return '';

    const videoId = segments[videoIndex];

    // Vimeo unlisted videos may contain a privacy hash.
    const nextSegment = segments[videoIndex + 1];

    const privacyHash =
      parsed.searchParams.get('h') ||
      (
        nextSegment &&
        /^[a-f0-9]+$/i.test(nextSegment)
          ? nextSegment
          : ''
      );

    const embed = new URL(
      `https://player.vimeo.com/video/${videoId}`
    );

    if (privacyHash) {
      embed.searchParams.set('h', privacyHash);
    }

    embed.searchParams.set('autoplay', '1');
    embed.searchParams.set('muted', '1');
    embed.searchParams.set('playsinline', '1');
    embed.searchParams.set('controls', '0');
    embed.searchParams.set('dnt', '1');

    return embed.toString();
  } catch (error) {
    console.error('Invalid Vimeo URL:', error);
    return '';
  }
}

export default function VimeoVideo({
  url,
  title = 'Himaya Sign Language Video',
  onEnded,
  onError,
  autoplay = true,
  muted = true,
  controls = false,
  className = ''
}) {
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const onEndedRef = useRef(onEnded);
  const onErrorRef = useRef(onError);

  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);

  const embedUrl = useMemo(() => {
    const result = getVimeoEmbedUrl(url);

    if (!result) return '';

    const parsed = new URL(result);

    parsed.searchParams.set(
      'autoplay',
      autoplay ? '1' : '0'
    );

    parsed.searchParams.set(
      'muted',
      muted ? '0' : '0'
    );

    parsed.searchParams.set(
      'controls',
      controls ? '0' : '0'
    );

    return parsed.toString();
  }, [url, autoplay, muted, controls]);

  useEffect(() => {
    onEndedRef.current = onEnded;
    onErrorRef.current = onError;
  }, [onEnded, onError]);

  useEffect(() => {
    setFailed(false);
    setReady(false);

    if (!embedUrl || !iframeRef.current) return;

    let active = true;

    const player = new Player(iframeRef.current);

    playerRef.current = player;

    const handleEnded = () => {
      if (active) {
        onEndedRef.current?.();
      }
    };

    const handleError = error => {
      if (!active) return;

      console.error('Vimeo Player Error:', error);

      setFailed(true);
      onErrorRef.current?.(error);
    };

    player.on('ended', handleEnded);
    player.on('error', handleError);

    player
      .ready()
      .then(async () => {
        if (!active) return;

        setReady(true);

        try {
          await player.setVolume(muted ? 0 : 1);

          if (autoplay) {
            await player.play();
          }
        } catch (error) {
          // Browser autoplay restrictions may block playback.
          // The user can start playback if controls are enabled.
          console.warn('Vimeo autoplay:', error);
        }
      })
      .catch(handleError);

    return () => {
      active = false;

      player.off('ended', handleEnded);
      player.off('error', handleError);

      if (playerRef.current === player) {
        playerRef.current = null;
      }
    };
  }, [embedUrl, autoplay, muted]);

  if (!embedUrl || failed) {
    return (
      <div className={`himaya-video-placeholder ${className}`}>
        <span>Video unavailable</span>
      </div>
    );
  }

  return (
    <div className={`himaya-vimeo-wrapper ${className}`}>
      <iframe
        ref={iframeRef}
        key={embedUrl}
        src={embedUrl}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        style={{
          width: '100%',
          height: '100%',
          border: 0,
          display: 'block'
        }}
      />

      {!ready && (
        <div className="himaya-vimeo-loading">
          Loading video...
        </div>
      )}
    </div>
  );
}
