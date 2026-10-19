
import React, {
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

import {
  media,
  localized
} from '../utils.js';

import '../parent-protection.css';
import '../role-screen.css';

// =====================================
// GET LANGUAGE-SPECIFIC VIDEO
// =====================================

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

export default function QuizAdvocacyScreen({
  cards = [],
  lang = 'ar',
  mode = 'general',
  answers = {},
  onChoose,
  onComplete,
  hasNextSection = false
}) {
  // =====================================
  // STATE
  // =====================================

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState('question');

  const [videoFailed, setVideoFailed] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const isArabic = lang === 'ar';
  const direction = isArabic ? 'rtl' : 'ltr';

  // =====================================
  // ONLY ROLE AND GENERAL
  // =====================================

  const filteredCards = cards
    .filter(card =>
      card.category === 'role' ||
      card.category === 'general'
    )
    .sort((a, b) => {
      if (a.category !== b.category) {
        return a.category === 'role' ? -1 : 1;
      }

      return (
        Number(a.scenario_number ?? a.id ?? 0) -
        Number(b.scenario_number ?? b.id ?? 0)
      );
    });

  const card = filteredCards[currentIndex];

  const isRole =
    mode === 'role' ||
    card?.category === 'role';

  const generalCards = filteredCards.filter(
              item => item.category === 'general'
  );

  const generalIndex = generalCards.findIndex(
    item => String(item.id) === String(card?.id)
  );

  // =====================================
  // SELECTED ANSWER
  // =====================================

  const selectedId = card
    ? answers[card.id]
    : undefined;

  const hasSelected =
    selectedId !== undefined &&
    selectedId !== null;

  const selectedAnswer = card?.answers?.find(
    option =>
      String(option.id) === String(selectedId)
  );

  const isCorrect =
    typeof selectedAnswer?.correct === 'boolean'
      ? selectedAnswer.correct
      : null;

  // =====================================
  // VIDEOS
  // =====================================

  const questionVideo = getCardVideo(
    card,
    'question',
    lang
  );

  const correctVideo = getCardVideo(
    card,
    'correct',
    lang
  );

  const wrongVideo = getCardVideo(
    card,
    'wrong',
    lang
  );

  const feedbackVideo =
    isCorrect === true
      ? correctVideo
      : isCorrect === false
        ? wrongVideo
        : '';

  const videoUrl =
    !isRole && phase === 'feedback'
      ? (feedbackVideo || questionVideo)
      : questionVideo;

  // The selected answer unlocks the action immediately; video playback is independent.
  const canContinue = hasSelected && phase === 'feedback';

  // =====================================
  // RESET MEDIA ON QUESTION CHANGE
  // =====================================

  useEffect(() => {
    setVideoFailed(false);
  }, [
    videoUrl,
    card?.id,
    lang
  ]);

  useEffect(() => {
    setImageFailed(false);
  }, [
    card?.id,
    card?.card_image_url,
    card?.card_text_image_url_ar,
    card?.card_text_image_url_en
  ]);

  // =====================================
  // NEXT QUESTION / NEXT PAGE
  // =====================================

  const advance = () => {
    if (currentIndex + 1 < filteredCards.length) {
      setCurrentIndex(previous => previous + 1);

      setPhase('question');
      setVideoFailed(false);
      setImageFailed(false);

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      onComplete?.();
    }
  };

  // =====================================
  // SELECT GENERAL ANSWER
  // =====================================

  const handleAnswer = answerId => {
    if (!card || hasSelected) return;

    onChoose?.(card.id, answerId);

    if (!isRole) {
      setPhase('feedback');
      setVideoFailed(false);
    }
  };

  // =====================================
  // VIDEO COMPONENT
  // =====================================

  const renderVideo = () => (
    <div className="himaya-video-container">
      {videoUrl && !videoFailed ? (
        <VimeoVideo
          url={videoUrl}
          title={localized(
            card,
            'card_title',
            lang
          )}
          autoplay
          controls
          placeholderSrc={isArabic ? '/images/arabic_placeholder.png' : '/images/english_placeholder.png'}
          preloadUrls={[correctVideo, wrongVideo]}
          loadingLabel={isArabic
            ? (phase === 'feedback' ? 'جاري تحميل فيديو الإجابة...' : 'جاري تحميل فيديو السؤال...')
            : (phase === 'feedback' ? 'Loading answer video...' : 'Loading question video...')}
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

  // =====================================
  // NO QUESTIONS
  // =====================================

  if (!card) {
    return (
      <Shell lang={lang}>
        <main
          className="quiz-main"
          dir={direction}
        >
          <p className="journey-error">
            {isArabic
              ? 'لا توجد أسئلة متاحة.'
              : 'No questions available.'}
          </p>
        </main>
      </Shell>
    );
  }

  // =====================================
  // CATEGORY: ROLE
  // =====================================

  if (isRole) {
    // const roleImage =
    //   card[`card_text_image_url_${lang}`] ||
    //   card.card_text_image_url ||
    //   card.card_image_url ||
    //   '';
const roleImage =
  (lang === 'ar'
    ? card.card_image_url_ar
    : card.card_image_url_en) ||
  card.card_image_url ||
  '';
  console.log('roleImage:', roleImage);
    return (
      <Shell lang={lang}>
        <main
          className="himaya-role-screen"
          dir={direction}
        >
          {/* ROLE HERO: IMAGE + VIDEO */}

          <div className="himaya-role-hero">
            <div className="himaya-role-text-image">
              {roleImage && !imageFailed ? (
                <img
                  src={media(roleImage)}
                  alt={
                    localized(
                      card,
                      'card_title',
                      lang
                    ) ||
                    (isArabic
                      ? 'رسالة المناصرة'
                      : 'Advocacy message')
                  }
                  onError={() =>
                    setImageFailed(true)
                  }
                />
              ) : (
                <div className="himaya-role-text-fallback">
                  {localized(
                    card,
                    'card_title',
                    lang
                  ) ||
                    (isArabic
                      ? 'المناصرة تبدأ بصوتك'
                      : 'Advocacy Begins with Your Voice')}
                </div>
              )}
            </div>

            <div className="himaya-role-video">
              {renderVideo()}
            </div>
          </div>

          {/* ROLE QUESTION */}

          <div
            className="himaya-role-prompt"
            dir={direction}
          >
            {localized(
              card,
              'card_question',
              lang
            ) ||
              (isArabic
                ? 'اختر الصفة التي تمثّلك لنبدأ الرحلة.'
                : 'Select the role that best describes you to begin your journey.')}
          </div>

          {/* ROLE OPTIONS */}

          <div
            className="himaya-role-options"
            role="group"
            dir={direction}
            aria-label={localized(
              card,
              'card_question',
              lang
            )}
          >
            {(card.answers || []).map(
              (option, index) => {
                const optionId = option.id ?? index + 1;
                const chosen =
                  hasSelected &&
                  String(selectedId) ===
                    String(optionId);

                return (
                  <button
                    key={optionId}
                    type="button"
                    className={[
                      'himaya-role-option',
                      chosen ? 'is-selected' : ''
                    ].join(' ')}
                    aria-pressed={chosen}
                    onClick={() =>
                      onChoose?.(
                        card.id,
                        optionId
                      )
                    }
                  >
                    <span className="himaya-role-number">
                      {index + 1}
                    </span>

                    <span
                      className="himaya-role-option-text"
                      dir={direction}
                    >
                      {localized(
                        option,
                        'title',
                        lang
                      )}
                    </span>
                  </button>
                );
              }
            )}
          </div>

          {/* START JOURNEY BUTTON */}

          <button
            type="button"
            className="orange-button himaya-role-start"
            disabled={!hasSelected}
            onClick={advance}
          >
            {isArabic
              ? 'ابدأ الرحلة'
              : 'Start Journey'}
            <img className="navigation-arrow" src={media('/images/Navigation Arrow.svg')} alt="" aria-hidden="true" />
          </button>
        </main>
      </Shell>
    );
  }

  // =====================================
  // CATEGORY: GENERAL
  // =====================================

  return (
    <Shell lang={lang}>
      <main
        className="quiz-main himaya-general-page"
        dir={direction}
      >
        {/* QUESTION HEADER */}

        <div className="quiz-meta">
          <span
            className="scenario-name"
            dir={direction}
            style={{
              textAlign: isArabic
                ? 'right'
                : 'left'
            }}
          >
            {isArabic
              ? `الموقف ${
                  card.scenario_number ??
                  generalIndex + 1
                }`
              : `Scenario ${
                  card.scenario_number ??
                  generalIndex + 1
                }`}

            <strong>
              {localized(
                card,
                'card_title',
                lang
              )}
            </strong>
          </span>

          <span
            dir={direction}
            style={{
              textAlign: isArabic
                ? 'right'
                : 'left'
            }}
          >
            {isArabic
              ? `بطاقة اختبار ${
                  generalIndex + 1
                } من ${generalCards.length}`
              : `Quiz card ${
                  generalIndex + 1
                } of ${generalCards.length}`}
          </span>
        </div>

        {/* SCENARIO IMAGE + VIDEO */}

        <div className="scenario-media himaya-scenario-media">
          <div className="himaya-image-container">
            {card.card_image_url &&
            !imageFailed ? (
              <img
                className="scenario-photo"
                src={media(
                  card.card_image_url
                )}
                alt={localized(
                  card,
                  'card_title',
                  lang
                )}
                onError={() =>
                  setImageFailed(true)
                }
              />
            ) : (
              <div className="himaya-image-placeholder">
                {isArabic
                  ? 'صورة الموقف'
                  : 'Scenario image'}
              </div>
            )}
          </div>

          {renderVideo()}
        </div>

        {/* QUESTION */}

        <div
          className="question-panel"
          dir={direction}
        >
          {localized(
            card,
            'card_question',
            lang
          )}
        </div>

        {/* ANSWERS */}

        <div
          className="answer-grid"   style={{ gridTemplateColumns: 'repeat(1, minmax(0, 1fr))' }}
          dir={direction}
        >
          {(card.answers || []).map(
            (option, index) => {
              const optionId = option.id ?? index + 1;
              const chosen =
                hasSelected &&
                String(selectedId) ===
                  String(optionId);

              const correct =
                hasSelected &&
                option.correct === true;

              const wrong =
                hasSelected &&
                chosen &&
                option.correct === false;

              const dimmed =
                hasSelected &&
                !chosen &&
                !correct;

              return (
                <button
                  key={optionId}
                  type="button"
                  disabled={hasSelected}
                  onClick={() =>
                    handleAnswer(
                      optionId
                    )
                  }
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
                      <Check
                        size={24}
                        strokeWidth={3}
                      />
                    ) : wrong ? (
                      <X
                        size={24}
                        strokeWidth={3}
                      />
                    ) : (
                      index + 1
                    )}
                  </span>

                  <span
                    dir={direction}
                    style={{
                      textAlign: isArabic
                        ? 'right'
                        : 'left'
                    }}
                  >
                    {localized(
                      option,
                      'title',
                      lang
                    )}
                  </span>
                </button>
              );
            }
          )}
        </div>

        {/* EXPLANATION */}

        {hasSelected &&
          phase === 'feedback' &&
          localized(
            card,
            'card_explanation',
            lang
          ) && (
            <div
              className="explanation"
              dir={direction}
            >
              {localized(
                card,
                'card_explanation',
                lang
              )}
            </div>
          )}

        {/* NEXT QUESTION / RESULTS */}

        {hasSelected &&
          phase === 'feedback' && (
            <button
              type="button"
              className="orange-button next-button"
              disabled={!canContinue}
              onClick={advance}
            >
              {currentIndex ===
                filteredCards.length - 1 &&
              !hasNextSection
                ? isArabic
                  ? 'عرض النتائج'
                  : 'View Results'
                : isArabic
                  ? 'السؤال التالي'
                  : 'Next Question'}

              <img className="navigation-arrow" src={media('/images/Navigation Arrow.svg')} alt="" aria-hidden="true" />
            </button>
          )}
      </main>
    </Shell>
  );
}
