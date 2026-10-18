
import React, { useState } from 'react';

import Shell from '../components/Shell.jsx';
import ChoiceButtons from '../components/ChoiceButtons.jsx';
import VimeoVideo from '../components/VimeoVideo.jsx';
import { localized } from '../utils.js';
import isParent from"../../public/images/isParent.png";
import ParentorGuardian from"../../public/images/ParentorGuardian.png";
const cleanVideoUrl = value => String(value || '')
  .trim()
  .replace(/^["']|["']$/g, '');

export default function ParentGateway({
  card,
  lang = 'ar',
  selected,
  onSelect,
  onContinue
}) {
  const [videoFailed, setVideoFailed] = useState(false);

  const isArabic = lang === 'ar';
  const videoUrl = cleanVideoUrl(
    card?.[`card_video_url_${isArabic ? 'ar' : 'en'}`] ||
    card?.card_video_url
  );

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

    return <VimeoVideo
      key={`${card.id}-${lang}-${videoUrl}`}
      url={videoUrl}
      title={localized(card, 'card_title', lang) || 'Himaya video'}
      autoplay
              controls
      onError={() => setVideoFailed(true)}
    />;
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

        <div className="journey-gateway-question" style={{backgroundImage: `url(${isParent})`,backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    height: '164px',
   backgroundColor: 'unset',
    flexDirection: 'column',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
    
    
    }}>
      <img src={ParentorGuardian} alt="Parent"   width="45" height="45"/>
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
