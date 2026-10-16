
import React, { useState } from 'react';

import Shell from '../components/Shell.jsx';
import ChoiceButtons from '../components/ChoiceButtons.jsx';
import { media, localized } from '../utils.js';

// Convert Vimeo URLs into embeddable player URLs.
function getVimeoEmbedUrl(url) {
  if (!url) return '';

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    const isVimeo =
      hostname === 'vimeo.com' ||
      hostname === 'www.vimeo.com' ||
      hostname === 'player.vimeo.com';

    if (!isVimeo) return '';

    const segments = parsed.pathname.split('/').filter(Boolean);
    const videoId = segments.find(segment => /^\d+$/.test(segment));

    if (!videoId) return '';

    // Support private/unlisted Vimeo videos.
    const idIndex = segments.indexOf(videoId);
    const pathHash = segments[idIndex + 1];
    const hash = parsed.searchParams.get('h') ||
      (pathHash && /^[a-f0-9]+$/i.test(pathHash) ? pathHash : '');

    const embedUrl = new URL(
      `https://player.vimeo.com/video/${videoId}`
    );

    if (hash) {
      embedUrl.searchParams.set('h', hash);
    }

    embedUrl.searchParams.set('autoplay', '1');
    embedUrl.searchParams.set('muted', '1');
    embedUrl.searchParams.set('playsinline', '1');
    embedUrl.searchParams.set('controls', '1');

    return embedUrl.toString();
  } catch {
    return '';
  }
}

export default function ParentGateway({
  card,
  lang = 'ar',
  selected,
  onSelect,
  onContinue
}) {
  const [videoFailed, setVideoFailed] = useState(false);

  const isArabic = lang === 'ar';
  const videoUrl = card?.card_video_url || '';
  const vimeoEmbedUrl = getVimeoEmbedUrl(videoUrl);

  const isSelected =
    selected !== undefined && selected !== null;

  const renderVideo = () => {
    if (!videoUrl || videoFailed) {
      return (
        <div className="himaya-video-placeholder">
          {isArabic
            ? 'الفيديو غير متاح'
            : 'Video unavailable'}
        </div>
      );
    }

    if (vimeoEmbedUrl) {
      return (
        <iframe
          key={vimeoEmbedUrl}
          src={vimeoEmbedUrl}
          title={localized(card, 'card_title', lang) || 'Himaya video'}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onError={() => setVideoFailed(true)}
        />
      );
    }

    // Local video stored in /public/videos/
    return (
      <video
        key={videoUrl}
        src={media(videoUrl)}
        autoPlay
        muted
        playsInline
        controls
        onError={() => setVideoFailed(true)}
      />
    );
  };

  if (!card) return null;

  return (
    <Shell lang={lang}>
      <main
        className="journey-parent-gateway"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="journey-parent-video">
          {renderVideo()}
        </div>

        <div className="journey-gateway-question">
          {localized(card, 'card_question', lang)}
        </div>

        <ChoiceButtons
          card={card}
          lang={lang}
          selectedId={selected}
          onChoose={onSelect}
          graded={false}
          compact
        />

        <button
          type="button"
          className="orange-button journey-action"
          disabled={!isSelected}
          onClick={onContinue}
        >
          {isArabic ? 'متابعة' : 'Continue'}
        </button>
      </main>
    </Shell>
  );
}
