
import React, {
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

import Shell from './components/Shell.jsx';
import Welcome from './pages/Welcome.jsx';
import QuizAdvocacyScreen from './pages/QuizAdvocacyScreen.jsx';
import Results from './pages/ResultsEmpowerment.jsx';
import Certificate from './pages/Certificate.jsx';
import CertificateClaim from './pages/CertificateClaim.jsx';

import {
  getEmpowermentCards,
  saveEmpowermentAnswers
} from './services/service.jsx';

import { getCategory, ui } from './utils.js';

import './App.css';
import './journey.css';

export default function Empowerment() {
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
    window.location.hash.includes('lang=en')
      ? 'en'
      : 'ar'
  );

  const [cards, setCards] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submitting = useRef(false);
  const answersRef = useRef({});

  // =====================================
  // ONLY TWO CATEGORIES
  // =====================================

  const roleCards = useMemo(
    () => getCategory(cards, 'role'),
    [cards]
  );

  const generalCards = useMemo(
    () => getCategory(cards, 'general'),
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
  // CERTIFICATE HASH
  // =====================================

  useEffect(() => {
    const sync = () => {
      if (window.location.hash.startsWith('#/certificate-claim')) {
        setLang(window.location.hash.includes('lang=en') ? 'en' : 'ar');
        setPage('certificateClaim');
      } else if (window.location.hash.startsWith('#/certificate')) {
        setLang(
          window.location.hash.includes('lang=en')
            ? 'en'
            : 'ar'
        );

        setPage('certificate');
      }
    };

    window.addEventListener('hashchange', sync);

    return () => {
      window.removeEventListener(
        'hashchange',
        sync
      );
    };
  }, []);

  // =====================================
  // HELPERS
  // =====================================

  const scrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const updateAnswers = updated => {
    answersRef.current = updated;
    setAnswers(updated);
  };

  const home = () => {
    window.location.hash = '';

    setPage('welcome');
    setCards([]);
    updateAnswers({});
    setResult(null);
    setError('');
    setBusy(false);

    scrollTop();
  };

  // =====================================
  // WELCOME -> ROLE
  // =====================================

  const start = async language => {
    if (busy) return;

    setBusy(true);
    setError('');

    try {
      const response = await getEmpowermentCards();

      const fetched = Array.isArray(response)
        ? response
        : response?.cards || [];

      const role = getCategory(fetched, 'role');
      const general = getCategory(
        fetched,
        'general'
      );

      if (!role.length) {
        throw new Error(
          'No role card found in CDA.advocacycards'
        );
      }

      if (!general.length) {
        throw new Error(
          'No general empowerment questions found in CDA.empowermentcards'
        );
      }

      window.location.hash = '';

      setLang(language);
      setCards(fetched);
      updateAnswers({});
      setResult(null);

      // Always display Role first.
      setPage('role');

      scrollTop();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  // =====================================
  // SAVE SELECTED ANSWER LOCALLY
  // =====================================

  const choose = (questionId, answerId) => {
    if (
      questionId === undefined ||
      answerId === undefined ||
      answerId === null
    ) {
      return;
    }

    const updated = {
      ...answersRef.current,
      [questionId]: answerId
    };

    updateAnswers(updated);
  };

  // =====================================
  // ROLE -> GENERAL
  // =====================================

  const completeRole = () => {
    if (busy || !roleCards.length) return;

    const allRolesSelected = roleCards.every(
      card =>
        answersRef.current[card.id] !== undefined &&
        answersRef.current[card.id] !== null
    );

    if (!allRolesSelected) {
      setError(
        lang === 'ar'
          ? 'يرجى اختيار الصفة أولاً.'
          : 'Please select your role first.'
      );
      return;
    }

    setError('');
    setPage('general');
    scrollTop();
  };

  // =====================================
  // SUBMIT ANSWERS TO getEmpowermentCards API
  // =====================================

  const submit = async (
    finalAnswers = answersRef.current
  ) => {
    if (submitting.current) return;

    submitting.current = true;
    setBusy(true);
    setError('');

    try {
      const validCardIds = new Set(
        [...roleCards, ...generalCards].map(
          card => Number(card.id)
        )
      );

      const payload = Object.entries(finalAnswers)
        .filter(([questionId, answerId]) =>
          validCardIds.has(Number(questionId)) &&
          answerId !== undefined &&
          answerId !== null &&
          answerId !== ''
        )
        .map(([questionId, answerId]) => ({
          questionId: Number(questionId),
          answerId: Number(answerId)
        }));

      const allAnswered = [
        ...roleCards,
        ...generalCards
      ].every(card =>
        payload.some(
          item => item.questionId === Number(card.id)
        )
      );

      if (!allAnswered) {
        throw new Error(
          lang === 'ar'
            ? 'يرجى الإجابة عن جميع الأسئلة.'
            : 'Please answer all questions.'
        );
      }

      const response =
        await saveEmpowermentAnswers(payload);

      if (response?.success === false) {
        throw new Error(
          response.message ||
          'Unable to save your answers.'
        );
      }

      setResult({
        ...(response?.result || {}),
        submissionId: response?.submissionId,
        certificateToken: response?.certificateToken
      });
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
  // GENERAL -> RESULTS
  // =====================================

  const completeGeneral = () => {
    submit(answersRef.current);
  };

  // =====================================
  // WELCOME
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
  // ROLE SELECTION
  // =====================================

  if (page === 'role' && roleCards.length) {
    return (
      <>
        <QuizAdvocacyScreen
          key="advocacy-role"
          cards={roleCards}
          lang={lang}
          mode="role"
          answers={answers}
          onChoose={choose}
          onComplete={completeRole}
          hasNextSection
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
  // GENERAL QUESTIONS
  // =====================================

  if (page === 'general' && generalCards.length) {
    return (
      <>
        <QuizAdvocacyScreen
          key="advocacy-general"
          cards={generalCards}
          lang={lang}
          mode="general"
          answers={answers}
          onChoose={choose}
          onComplete={completeGeneral}
          hasNextSection={false}
        />

        {error && (
          <div
            className="journey-error floating-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {busy && (
          <div
            className="journey-loading"
            role="status"
          >
            {lang === 'ar'
              ? 'جارٍ حفظ الإجابات...'
              : 'Saving answers...'}
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
        journey="empowerment"
        certificateToken={result?.certificateToken}
        score={result?.correct ?? 0}
        total={
          result?.total ?? generalCards.length
        }
        onHome={home}
        onCertificate={() => {
          const route = result?.certificateToken
            ? 'certificate-claim'
            : 'certificate';
          window.location.hash = `#/${route}?lang=${lang}`;
          setPage(result?.certificateToken ? 'certificateClaim' : 'certificate');
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
        journey="empowerment"
      />
    );
  }

  if (page === 'certificateClaim') {
    return <CertificateClaim lang={lang} onHome={home} />;
  }

  // =====================================
  // FALLBACK
  // =====================================

  return (
    <Shell lang={lang}>
      <div className="journey-error">
        {lang === 'ar'
          ? 'لا توجد أسئلة متاحة.'
          : 'No questions available.'}

        <button
          type="button"
          className="orange-button"
          onClick={home}
        >
          {ui('hotline', 'home', lang, 'Home')}
        </button>
      </div>
    </Shell>
  );
}
