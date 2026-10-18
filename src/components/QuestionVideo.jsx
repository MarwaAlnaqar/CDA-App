import React, { useEffect, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { media } from '../utils.js';
export default function QuestionVideo({ card, phase, correct, onFinished, lang }) {
  const src = phase === 'feedback'
    ? correct === true ? card.card_video_correct_answer_url : correct === false ? card.card_video_wrong_answer_url : ''
    : card.card_video_url;
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const available = !!src && !failed;
  return <div className="journey-video-box">
    {available ? <video key={`${card.id}-${phase}-${src}`} src={media(src)} autoPlay playsInline controls
      onEnded={() => { if (phase === 'feedback') onFinished(); }}
      onError={() => setFailed(true)} />
      : <div className="journey-video-placeholder">
          {card.card_image_url ? <img src={media(card.card_image_url)} alt="" /> : <Play size={46} />}
        </div>}
    {phase === 'feedback' && !available && <button className="orange-button" onClick={onFinished}>
      {lang === 'ar' ? 'متابعة' : 'Continue'} <ArrowRight size={17} />
    </button>}
  </div>;
}
