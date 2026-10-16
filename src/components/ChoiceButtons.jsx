import React from 'react';
import { Check, X } from 'lucide-react';
import { localized } from '../utils.js';
export default function ChoiceButtons({ card, lang, selectedId, onChoose, locked, graded = true, compact = false }) {
  const selected = selectedId !== undefined;
  return <div className={compact ? 'journey-yesno' : 'journey-choices'} style={{ 'flex-direction': compact && lang === 'en' ? 'row-reverse' : 'row' }}>
    {(card.answers || []).map(option => {
      const chosen = selected && String(selectedId) === String(option.id);
      const right = selected && graded && option.correct === true;
      const wrong = selected && graded && chosen && option.correct === false;
      return <button type="button" key={option.id} disabled={locked || selected}
        className={`journey-choice ${chosen ? 'chosen' : ''} ${right ? 'correct' : ''} ${wrong ? 'wrong' : ''} ${selected && !chosen && !right ? 'dimmed' : ''}`}
        onClick={() => onChoose(option.id)}>
        <span>{localized(option, 'title', lang)}</span>
        {!compact && <span className="journey-choice-number">{right ? <Check size={18}/> : wrong ? <X size={18}/> : option.id}</span>}
      </button>;
    })}
  </div>;
}
