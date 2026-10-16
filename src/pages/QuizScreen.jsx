

import React, {

  useCallback,

  useEffect,

  useState

} from 'react';

import {

  ArrowLeft,

  ArrowRight,

  Check,

  X

} from 'lucide-react';

import Shell from '../components/Shell.jsx';

import VimeoVideo from '../components/VimeoVideo.jsx';

import { media, localized } from '../utils.js';

import '../parent-protection.css';
import '../role-screen.css';

const getCardVideo = (card, type, lang) => {

  if (!card) return '';

  const language = lang === 'en' ? 'en' : 'ar';

  const fields = {

    question: `card_video_url_${language}`,

    correct: `card_video_correct_answer_url_${language}`,

    wrong: `card_video_wrong_answer_url_${language}`

  };

  return card[fields[type]] || '';

};

export default function QuizScreen({

  cards = [],

  lang = 'ar',

  mode = 'general',

  answers = {},

  onChoose,

  onComplete,

  hasNextSection = false

}) {

  const [currentIndex, setCurrentIndex] = useState(0);

  const [phase, setPhase] = useState('question');

  const [videoFailed, setVideoFailed] = useState(false);

  const [imageFailed, setImageFailed] = useState(false);

  const [feedbackFinished, setFeedbackFinished] = useState(false);

  const [completed, setCompleted] = useState(false);

  const isArabic = lang === 'ar';

  const isParent = mode === 'parent_protection_card';
  const isRole = mode === 'role' || cards[0]?.category === 'role';

  const direction = isArabic ? 'rtl' : 'ltr';

  const card = cards[currentIndex];

  const selectedId = card ? answers[card.id] : undefined;

  const hasSelected =

    selectedId !== undefined &&

    selectedId !== null;

  const selectedAnswer = card?.answers?.find(

    answer => String(answer.id) === String(selectedId)

  );

  const isCorrect =

    typeof selectedAnswer?.correct === 'boolean'

      ? selectedAnswer.correct

      : isParent && selectedAnswer

        ? String(selectedAnswer.value || '').toLowerCase() === 'yes'

        : null;

  // =====================================

  // SELECT VIMEO BASED ON LANGUAGE

  // =====================================

  const questionVideo = getCardVideo(card, 'question', lang);

  const correctVideo = getCardVideo(card, 'correct', lang);

  const wrongVideo = getCardVideo(card, 'wrong', lang);

  const feedbackVideo =

    isCorrect === true

      ? correctVideo

      : isCorrect === false

        ? wrongVideo

        : '';

  const videoUrl =

    phase === 'feedback'

      ? (feedbackVideo || (isParent ? questionVideo : ''))

      : questionVideo;

  const hasFeedbackVideo = Boolean(feedbackVideo);

  const canContinue =

    hasSelected &&

    phase === 'feedback' &&

    (

      !hasFeedbackVideo ||

      videoFailed ||

      feedbackFinished

    );

  // =====================================

  // RESET VIDEO WHEN CARD/LANGUAGE CHANGES

  // =====================================

  useEffect(() => {

    setVideoFailed(false);

    setFeedbackFinished(false);

  }, [videoUrl, card?.id, lang]);

  useEffect(() => {

    setImageFailed(false);

  }, [card?.card_image_url, card?.id]);

  // =====================================

  // NEXT QUESTION

  // =====================================

  const advance = useCallback(() => {

    if (currentIndex + 1 < cards.length) {

      setCurrentIndex(previous => previous + 1);

      setPhase('question');

      setVideoFailed(false);

      setImageFailed(false);

      setFeedbackFinished(false);

      if (!isParent) {

        window.scrollTo({

          top: 0,

          behavior: 'smooth'

        });

      }

    } else {

      onComplete?.();

    }

  }, [currentIndex, cards.length, isParent, onComplete]);

  // Advance after either Yes or No; wait only for an actual feedback video.

  useEffect(() => {

    if (!isParent || !canContinue || completed) return;

    if (currentIndex === cards.length - 1) return;

    advance();

  }, [isParent, canContinue, completed, currentIndex, cards.length, advance]);

  // =====================================

  // PARENT QUESTION SCROLL

  // =====================================

  useEffect(() => {

    if (!isParent || currentIndex === 0) return;

    document

      .getElementById(`himaya-question-${currentIndex}`)

      ?.scrollIntoView({

        behavior: 'smooth',

        block: 'center'

      });

  }, [currentIndex, isParent]);

  // =====================================

  // ANSWER SELECTION

  // =====================================

  const handleAnswer = answerId => {

    if (completed || !card) return;

    // Each parent response (Yes or No) is valid for progressing.

    if (hasSelected) return;

    onChoose(card.id, answerId);

    setPhase('feedback');

    setVideoFailed(false);

    setFeedbackFinished(false);

  };

  // =====================================

  // ANSWER BUTTONS

  // =====================================

  const renderChoices = (question, active) => {

    const selected = answers[question.id];

    const answered =

      selected !== undefined &&

      selected !== null;

    const gradedQuestion = (question.answers || []).some(

      option => typeof option.correct === 'boolean'

    );

    return (

      <div

        className={`answer-grid ${

          isParent ? 'parent-answer-grid' : ''

        }`}

        dir={direction}

      >

        {(question.answers || []).map((option, index) => {

          const chosen =

            answered &&

            String(selected) === String(option.id);

          const correct =

            answered &&

            gradedQuestion &&

            option.correct === true;

          const wrong =

            answered &&

            gradedQuestion &&

            chosen &&

            option.correct === false;

          const dimmed =

            answered && !chosen && !correct;

          return (

            <button

              key={option.id}

              type="button"

              disabled={!active || answered || completed}

              onClick={() => handleAnswer(option.id)}

              className={[

                'answer-option',

                chosen ? 'chosen' : '',

                correct ? 'is-correct' : '',

                wrong ? 'is-wrong' : '',

                dimmed ? 'is-dimmed' : ''

              ].join(' ')}

            >

              <span className="answer-circle">

                {correct ? (

                  <Check size={24} strokeWidth={3} />

                ) : wrong ? (

                  <X size={24} strokeWidth={3} />

                ) : (

                  index + 1

                )}

              </span>

              <span

                dir={direction}

                style={{ textAlign: isArabic ? 'right' : 'left' }}

              >

                {localized(option, 'title', lang)}

              </span>

            </button>

          );

        })}

      </div>

    );

  };

  // =====================================

  // VIMEO VIDEO

  // =====================================

  const renderVideo = () => {

    if (!card) return null;

    return (

      <div className="himaya-video-container">

        {videoUrl && !videoFailed ? (

          <VimeoVideo

            key={`${card.id}-${phase}-${lang}-${videoUrl}`}

            url={videoUrl}

            title={localized(card, 'card_title', lang)}

            autoplay

            muted

            controls

            onEnded={() => {

              if (phase === 'feedback') {

                setFeedbackFinished(true);

              }

            }}

            onError={() => {

              setVideoFailed(true);

            }}

          />

        ) : (

          <div className="himaya-video-placeholder">

            {isArabic

              ? 'الفيديو غير متاح'

              : 'Video unavailable'}

          </div>

        )}

      </div>

    );

  };

  // =====================================

  // CONTINUE BUTTON BELOW ANSWERS

  // =====================================

  const renderContinue = () => {

    if (!hasSelected || phase !== 'feedback' || completed || isParent) {

      return null;

    }

    return (

      <button

        type="button"

        className="orange-button next-button"

        onClick={advance}

        disabled={!canContinue}

      >

        {currentIndex + 1 === cards.length && !hasNextSection

          ? (isArabic ? 'عرض النتائج' : 'View Results')

          : (isArabic ? 'السؤال التالي' : 'Next Question')}

        {isArabic

          ? <ArrowLeft size={22} />

          : <ArrowRight size={22} />}

      </button>

    );

  };

  // The role screen is selected by the card's CATEGORY, not a separate route.
  // App.jsx may continue passing mode="general"; category="role" takes priority.
  if (isRole && cards.length) {
    const roleCard = cards.find(item => item.category === 'role') || cards[0];
    const roleSelected = answers[roleCard.id];
    const roleHasSelected = roleSelected !== undefined && roleSelected !== null;
    const roleImage = roleCard[`card_text_image_url_${lang}`] ||
      roleCard.card_text_image_url || roleCard.card_image_url || '';
    const roleVideo = getCardVideo(roleCard, 'question', lang);

    return (
      <Shell lang={lang} name="protection">
        <main className="himaya-role-screen" dir={direction}>
          <div className="himaya-role-hero">
            <div className="himaya-role-text-image">
              {roleImage && !imageFailed ? (
                <img src={media(roleImage)}
                  alt={localized(roleCard, 'card_title', lang) || (isArabic ? 'رسالة الحماية' : 'Protection message')}
                  onError={() => setImageFailed(true)} />
              ) : (
                <div className="himaya-role-text-fallback">
                  {isArabic ? 'نحمي الحقوق، ونزيل العوائق، ونسهم في بناء مجتمع أكثر شمولاً يدعم التمكين.' : 'We protect rights, remove barriers, and help build a more inclusive society.'}
                </div>
              )}
            </div>
            <div className="himaya-role-video">
              {roleVideo && !videoFailed ? (
                <VimeoVideo key={`${roleCard.id}-${lang}-${roleVideo}`}
                  url={roleVideo}
                  title={localized(roleCard, 'card_title', lang)}
                  autoplay muted controls onError={() => setVideoFailed(true)} />
              ) : (
                <div className="himaya-role-video-placeholder">
                  {isArabic ? 'الفيديو غير متاح' : 'Video unavailable'}
                </div>
              )}
            </div>
          </div>
          <div className="himaya-role-prompt" dir={direction}>
            {localized(roleCard, 'card_question', lang) ||
              (isArabic ? 'اختر الصفة التي تمثّلك لنبدأ رحلة تفاعلية للتعرّف على الحقوق والممارسات الدامجة.' : 'Choose the role that represents you to begin the journey.')}
          </div>
          <div className="himaya-role-options" role="group" aria-label={localized(roleCard, 'card_question', lang)}>
            {(roleCard.answers || []).map((option, index) => {
              const chosen = roleHasSelected && String(roleSelected) === String(option.id);
              return (
                <button key={option.id} type="button"
                  className={`himaya-role-option ${chosen ? 'is-selected' : ''}`}
                  aria-pressed={chosen}
                  onClick={() => onChoose?.(roleCard.id, option.id)}>
                  <span className="himaya-role-number">{index + 1}</span>
                  <span className="himaya-role-option-text" dir={direction}>
                    {localized(option, 'title', lang)}
                  </span>
                </button>
              );
            })}
          </div>
          <button type="button" className="orange-button himaya-role-start"
            disabled={!roleHasSelected} onClick={() => onComplete?.()}>
            {isArabic ? 'ابدأ الرحلة' : 'Start Journey'}
          </button>
        </main>
      </Shell>
    );
  }

  if (!cards.length || !card) {

    return (

      <Shell lang={lang}>

        <p className="journey-error">

          {isArabic

            ? 'لا توجد أسئلة متاحة.'

            : 'No questions available.'}

        </p>

      </Shell>

    );

  }

  return (

    <Shell lang={lang}>

      <main

        className={

          isParent

            ? 'quiz-main himaya-parent-page'

            : 'quiz-main himaya-general-page'

        }

        dir={direction}

      >

        {/* GENERAL QUESTIONS */}

        {!isParent && (

          <>

            <div className="quiz-meta">

              <span className="scenario-name" style={{textAlign: isArabic ? 'right' : 'left'}} dir={direction}>

                {isArabic

                  ? `الموقف ${card.scenario_number ?? currentIndex + 1}`

                  : `Scenario ${card.scenario_number ?? currentIndex + 1}`}

                <strong>

                  {localized(card, 'card_title', lang)}

                </strong>

              </span>

              <span  style={{textAlign: isArabic ? 'right' : 'left'}} dir={direction}>

                {isArabic

                  ? `بطاقة اختبار ${currentIndex + 1} من ${cards.length}`

                  : `Quiz card ${currentIndex + 1} of ${cards.length}`}

              </span>

            </div>

            {/* IMAGE LEFT + VIMEO RIGHT */}

            <div className="scenario-media himaya-scenario-media">

              <div className="himaya-image-container">

                {card.card_image_url && !imageFailed ? (

                  <img

                    className="scenario-photo"

                    src={media(card.card_image_url)}

                    alt={localized(card, 'card_title', lang)}

                    onError={() => setImageFailed(true)}

                  />

                ) : (

                  <div className="himaya-image-placeholder">

                    {isArabic ? 'صورة الموقف' : 'Scenario image'}

                  </div>

                )}

              </div>

              {renderVideo()}

            </div>

            {/* QUESTION */}

            <div className="question-panel" dir={direction}>

              {localized(card, 'card_question', lang)}

            </div>

            {/* ANSWERS */}

            {renderChoices(card, !completed)}

            {/* EXPLANATION */}

            {hasSelected &&

              phase === 'feedback' &&

              localized(card, 'card_explanation', lang) && (

                <div className="explanation" dir={direction}>

                  {localized(card, 'card_explanation', lang)}

                </div>

              )}

            {renderContinue()}

          </>

        )}

        {/* PARENT PROTECTION QUESTIONS — compact reference layout */}

        {isParent && (

          <>

            <div className="himaya-parent-video">{renderVideo()}</div>

            <div className="himaya-parent-card">

              <h2 className="himaya-parent-card-title">

                {localized(cards[0], 'card_title', lang) ||

                  (isArabic ? 'أعزّاءنا أولياء الأمور' : 'Dear parents and guardians,')}

              </h2>

              <div className="himaya-parent-rows">

                {cards.map((question, index) => {

                  const active = index === currentIndex;

                  const future = index > currentIndex;

                  const value = answers[question.id];

                  const answered = value !== undefined && value !== null;

                  return (

                    <div

                      key={question.id}

                      id={`himaya-question-${index}`}

                      className={`himaya-parent-row ${future ? 'is-future' : ''} ${active ? 'is-active' : ''}`}

                    >

                      <span className="himaya-parent-row-number">{index + 1}</span>

                      <span

                        className="himaya-parent-row-question"

                        dir={direction}

                        style={{ textAlign: isArabic ? 'right' : 'left' }}

                      >

                        {localized(question, 'card_question', lang)}

                      </span>

                      <div className="himaya-parent-toggle" role="group" aria-label={localized(question, 'card_question', lang)}>

                        {(question.answers || []).map((option) => {

                          const chosen = answered && String(value) === String(option.id);

                          const correct = typeof option.correct === 'boolean'

                            ? option.correct

                            : String(option.value || '').toLowerCase() === 'yes';

                          const questionIsCorrect = (question.answers || []).some(

                            answer => String(answer.id) === String(value) &&

                              (typeof answer.correct === 'boolean'

                                ? answer.correct === true

                                : String(answer.value || '').toLowerCase() === 'yes')

                          );

                          return (

                            <button

                              key={option.id}

                              type="button"

                              className={`himaya-parent-toggle-option ${chosen ? 'is-selected' : ''} ${chosen && correct ? 'is-correct' : ''} ${chosen && !correct ? 'is-wrong' : ''}`}

                              disabled={!active || answered || completed}

                              aria-pressed={chosen}

                              onClick={() => handleAnswer(option.id)}

                            >

                              {localized(option, 'title', lang)}

                            </button>

                          );

                        })}

                      </div>

                    </div>

                  );

                })}

              </div>

              <p className="himaya-parent-card-footer">

                {isArabic

                  ? 'نعلّم أبناءنا اليوم… لنَبني مجتمعًا أكثر احترامًا ودمجًا غدًا'

                  : 'What we teach our children today helps build a more respectful and inclusive society tomorrow.'}

              </p>

            </div>

            <button

              type="button"

              className="orange-button next-button himaya-parent-results-button"

              disabled={!(currentIndex === cards.length - 1 && canContinue)}

              onClick={onComplete}

            >

              {isArabic ? 'عرض النتائج' : 'View Results'}

              {isArabic ? <ArrowLeft size={22} /> : <ArrowRight size={22} />}

            </button>

          </>

        )}

        {/* VIEW RESULTS */}

        {!isParent && completed && (

          <button

            type="button"

            className="orange-button next-button"

            onClick={onComplete}

          >

            {isArabic ? 'عرض النتائج' : 'View Results'}

            {isArabic

              ? <ArrowLeft size={22} />

              : <ArrowRight size={22} />}

          </button>

        )}

      </main>

    </Shell>

  );

}
