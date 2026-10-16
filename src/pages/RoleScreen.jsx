import React from 'react';
import Shell from '../components/Shell.jsx';
import ChoiceButtons from '../components/ChoiceButtons.jsx';
import config from '../data/appData.json';
import { media,localized } from '../utils.js';
export default function RoleScreen({ card, lang, selected, onSelect, onStart }) {
  return <Shell lang={lang}>
    <main className="journey-role-screen">
      <h1>{localized(card, 'card_title', lang) || (lang === 'ar' ? 'المناصرة' : 'Advocacy')}</h1>
      <h2>{lang === 'ar' ? 'المناصرة تبدأ بصوتك' : 'Advocacy Begins with Your Voice'}</h2>
      <div className="journey-role-hero">
        <div>{lang === 'ar' ? 'نحمي الحقوق ونزيل الحواجز وندعم بناء مجتمع أكثر شمولاً.' : 'We protect rights, remove barriers and help build a more inclusive society that supports empowerment.'}</div>
        <img src={media(card.card_image_url || config.media.intro)} alt="" onError={e => { e.currentTarget.style.display = 'none'; }} />
      </div>
      <div className="journey-role-prompt">{localized(card, 'card_question', lang)}</div>
      <ChoiceButtons card={card} lang={lang} selectedId={selected} onChoose={onSelect} graded={false}/>
      <button className="orange-button journey-action" disabled={selected === undefined} onClick={onStart}>
        {lang === 'ar' ? 'ابدأ رحلتك' : 'START YOUR JOURNEY'}
      </button>
    </main>
  </Shell>;
}
