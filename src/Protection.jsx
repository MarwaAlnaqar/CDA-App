
import React, { useEffect, useMemo, useRef, useState } from 'react';

import Shell from './components/Shell.jsx';
import Welcome from './pages/Welcome.jsx';
import ParentGateway from './pages/ParentGateway.jsx';
import QuizScreen from './pages/QuizScreen.jsx';
import Results from './pages/Results.jsx';
import Certificate from './pages/Certificate.jsx';
import CertificateClaim from './pages/CertificateClaim.jsx';

import {
  getProtectionCards,
  saveProtectionAnswers
} from './services/service.jsx';

import {
  getCategory,
  isYes,
  ui
} from './utils.js';

import './App.css';
import './journey.css';

export default function Protection() {

  // =====================================
  // STATE
  // =====================================

  const [page, setPage] = useState(
    window.location.hash.startsWith('#/certificate-claim')
      ? 'certificateClaim'
      : window.location.hash.startsWith('#/certificate')
        ? 'certificate'
        : 'welcome'
  );

  const [lang, setLang] = useState(
    window.location.hash.includes('lang=en') ? 'en' : 'ar'
  );

  const [cards, setCards] = useState([]);
  const [selectedParent, setSelectedParent] = useState(undefined);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submitting = useRef(false);
  const answersRef = useRef({});

  // =====================================
  // CARD CATEGORIES
  // =====================================

  const generalCards = useMemo(
    () => getCategory(cards, 'general'),
    [cards]
  );

  const parentCards = useMemo(
    () => getCategory(cards, 'parent_protection_card'),
    [cards]
  );

  const parentGateway = useMemo(
    () => getCategory(cards, 'parent_protection_role')[0],
    [cards]
  );

  // =====================================
  // LANGUAGE
  // =====================================

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir =
      lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // =====================================
  // CERTIFICATE ROUTE
  // =====================================

  useEffect(() => {
    const sync = () => {
      if (
        window.location.hash.startsWith('#/certificate-claim')
      ) {
        setLang(
          window.location.hash.includes('lang=en') ? 'en' : 'ar'
        );
        setPage('certificateClaim');
      } else if (window.location.hash.startsWith('#/certificate')) {
        setLang(
          window.location.hash.includes('lang=en') ? 'en' : 'ar'
        );
        setPage('certificate');
      }
    };

    window.addEventListener('hashchange', sync);

    return () => {
      window.removeEventListener('hashchange', sync);
    };
  }, []);

  // =====================================
  // HELPERS
  // =====================================

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateAnswers = (updatedAnswers) => {
    answersRef.current = updatedAnswers;
    setAnswers(updatedAnswers);
  };

  const home = () => {
    window.location.hash = '';

    setPage('welcome');
    setCards([]);
    updateAnswers({});
    setSelectedParent(undefined);
    setResult(null);
    setError('');

    scrollTop();
  };

  // =====================================
  // WELCOME -> GENERAL QUESTIONS
  // =====================================

  const start = async (language) => {
    if (busy) return;

    setBusy(true);
    setError('');

    try {
      const response = await getProtectionCards();

      const fetched = Array.isArray(response)
        ? response
        : response?.cards || [];

      const general = getCategory(fetched, 'general');

      if (!general.length) {
        throw new Error(
          'No general protection questions found in CDA.protectioncards'
        );
      }

      window.location.hash = '';

      setLang(language);
      setCards(fetched);
      updateAnswers({});
      setSelectedParent(undefined);
      setResult(null);

      setPage('general');

      scrollTop();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  // =====================================
  // SAVE ANSWER IN LOCAL STATE
  // =====================================

  const choose = (questionId, answerId) => {
    if (
      questionId === undefined ||
      answerId === undefined ||
      answerId === null
    ) {
      return;
    }

    const updatedAnswers = {
      ...answersRef.current,
      [questionId]: answerId
    };

    updateAnswers(updatedAnswers);
  };

  // =====================================
  // SUBMIT ALL SELECTED ANSWERS
  // =====================================

  const submit = async (finalAnswers = answersRef.current) => {
    if (submitting.current) return;

    submitting.current = true;
    setBusy(true);
    setError('');

    try {
      const payload = Object.entries(finalAnswers)
        .filter(([, answerId]) =>
          answerId !== undefined &&
          answerId !== null &&
          answerId !== ''
        )
        .map(([questionId, answerId]) => ({
          questionId: Number(questionId),
          answerId: Number(answerId)
        }));

      if (!payload.length) {
        throw new Error(
          lang === 'ar'
            ? 'يرجى الإجابة عن الأسئلة أولاً.'
            : 'Please answer the questions first.'
        );
      }

      const response = await saveProtectionAnswers(payload);

      if (response?.success === false) {
        throw new Error(
          response.message || 'Unable to save your answers.'
        );
      }

      setResult({
        ...(response?.result || {}),
        submissionId: response?.submissionId,
        certificateToken: response?.certificateToken
      });

      // IMPORTANT:
      // Quiz completion always opens Results,
      // never the Certificate directly.
      setPage('results');

      scrollTop();
    } catch (e) {
      setError(e.message);
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  // =====================================
  // GENERAL -> PARENT GATEWAY
  // =====================================

  const completeGeneral = () => {
    setError('');

    if (parentGateway) {
      // Do not display Results yet.
      // The user must answer the parent role question.
      setSelectedParent(undefined);
      setPage('parentGateway');
      scrollTop();
      return;
    }

    // If there is no parent role card,
    // finish the general quiz.
    submit(answersRef.current);
  };

  // =====================================
  // PARENT GATEWAY -> PARENT QUIZ / RESULTS
  // =====================================

  const continueParent = () => {
    // Do not navigate unless an option is selected.
    if (
      !parentGateway ||
      selectedParent === undefined ||
      selectedParent === null ||
      selectedParent === '' ||
      busy ||
      submitting.current
    ) {
      return;
    }

    const selectedOption = (
      parentGateway.answers || []
    ).find(
      option =>
        String(option.id) === String(selectedParent)
    );

    // Make sure the selected answer belongs
    // to the parent role question.
    if (!selectedOption) {
      setError(
        lang === 'ar'
          ? 'يرجى اختيار إجابة للمتابعة.'
          : 'Please select an answer to continue.'
      );
      return;
    }

    const updatedAnswers = {
      ...answersRef.current,
      [parentGateway.id]: selectedOption.id
    };

    updateAnswers(updatedAnswers);
    setError('');

    if (isYes(selectedOption)) {
      // YES -> Parent self-assessment questions.
      if (parentCards.length) {
        setPage('parent');
        scrollTop();
      } else {
        setError(
          lang === 'ar'
            ? 'أسئلة أولياء الأمور غير متاحة حالياً.'
            : 'Parent questions are currently unavailable.'
        );
      }

      return;
    }

    // NO -> Results (after saving).
    // Never redirect directly to Certificate.
    submit(updatedAnswers);
  };

  // =====================================
  // PARENT QUESTIONS -> RESULTS
  // =====================================

  const completeParent = () => {
    setError('');

    // Use the latest answers, including
    // the final parent question.
    submit(answersRef.current);
  };

  // =====================================
  // WELCOME PAGE
  // =====================================

  if (page === 'welcome') {
    return (
      <Welcome
        onLanguage={start}
        busy={busy}
        error={error}
      />
    );
  }

  // =====================================
  // GENERAL QUESTIONS
  // =====================================

  if (page === 'general' && generalCards.length) {
    return (
      <>
        <QuizScreen
          key="general"
          cards={generalCards}
          lang={lang}
          mode="general"
          answers={answers}
          onChoose={choose}
          onComplete={completeGeneral}
          hasNextSection={Boolean(parentGateway)}
        />

        {error && (
          <div
            className="journey-error floating-error"
            role="alert"
          >
            {error}
          </div>
        )}
      </>
    );
  }

  // =====================================
  // PARENT / GUARDIAN QUESTION
  // =====================================

  if (page === 'parentGateway' && parentGateway) {
    return (
      <>
        <ParentGateway
          card={parentGateway}
          lang={lang}
          selected={selectedParent}
          onSelect={(answerId) => {
            setSelectedParent(answerId);
            setError('');
          }}
          onContinue={continueParent}
          busy={busy}
        />

        {error && (
          <div
            className="journey-error floating-error"
            role="alert"
          >
            {error}

            <button
              type="button"
              onClick={continueParent}
              disabled={
                busy ||
                selectedParent === undefined ||
                selectedParent === null
              }
            >
              {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}
      </>
    );
  }

  // =====================================
  // PARENT PROTECTION QUESTIONS
  // =====================================

  if (page === 'parent' && parentCards.length) {
    return (
      <>
        <QuizScreen
          key="parent"
          cards={parentCards}
          lang={lang}
          mode="parent_protection_card"
          answers={answers}
          onChoose={choose}
          onComplete={completeParent}
          hasNextSection={false}
        />

        {error && (
          <div
            className="journey-error floating-error"
            role="alert"
          >
            {error}

            <button
              type="button"
              onClick={completeParent}
              disabled={busy}
            >
              {lang === 'ar' ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        )}
      </>
    );
  }

  // =====================================
  // RESULTS
  // =====================================

  if (page === 'results') {
    return (
      <Results
        lang={lang}
        result={result}
        score={result?.correct ?? 0}
        total={result?.total ?? generalCards.length}
        certificateToken={result?.certificateToken}
        onHome={home}
        onCertificate={() => {
          const route = result?.certificateToken
            ? 'certificate-claim'
            : 'certificate';
          window.location.hash = `#/${route}?lang=${lang}`;
          setPage(
            result?.certificateToken
              ? 'certificateClaim'
              : 'certificate'
          );
          scrollTop();
        }}
      />
    );
  }

  // =====================================
  // CERTIFICATE
  // =====================================

  if (page === 'certificate') {
    return (
      <Certificate
        lang={lang}
        onHome={home}
        journey="protection"
      />
    );
  }

  if (page === 'certificateClaim') {
    return (
      <CertificateClaim
        lang={lang}
        onHome={home}
      />
    );
  }

  // =====================================
  // FALLBACK
  // =====================================

  return (
    <Shell lang={lang} >
      <div className="journey-error">
        {lang === 'ar'
          ? 'لا توجد أسئلة متاحة.'
          : 'No questions available.'}

        <button
          className="orange-button"
          onClick={home}
        >
          {ui('hotline', 'home', lang, 'Home')}
        </button>
      </div>
    </Shell>
  );
}
