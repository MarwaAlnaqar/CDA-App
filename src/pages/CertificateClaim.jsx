import React, { useEffect, useMemo, useState } from 'react';
import { Home } from 'lucide-react';
import Shell from '../components/Shell.jsx';
import Certificate from './Certificate.jsx';
import { claimCertificate, getCertificate } from '../services/service.jsx';
import { ui } from '../utils.js';

function getTokenFromHash() {
  const query = window.location.hash.split('?')[1] || '';
  return new URLSearchParams(query).get('token') || '';
}

function getJourneyFromPath() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes('/advocacy')) return 'advocacy';
  if (path.includes('/empowerment')) return 'empowerment';
  return 'protection';
}

export default function CertificateClaim({ lang, onHome }) {
  const token = useMemo(getTokenFromHash, []);
  const journey = useMemo(getJourneyFromPath, []);
  const [info, setInfo] = useState(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    if (!/^[a-f0-9]{64}$/i.test(token)) {
      setError(lang === 'ar' ? 'رابط الشهادة غير صالح.' : 'This certificate link is invalid.');
      setLoading(false);
      return () => { active = false; };
    }

    getCertificate(journey, token)
      .then((result) => {
        if (active) setInfo(result);
      })
      .catch(() => {
        if (active) setError(lang === 'ar' ? 'تعذر العثور على هذه الشهادة.' : 'This certificate could not be found.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [journey, lang, token]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(lang === 'ar' ? 'يرجى إدخال الاسم.' : 'Please enter your name.');
      return;
    }

    setClaiming(true);
    setError('');
    try {
      const claimed = await claimCertificate(journey, token, trimmedName);
      setInfo({ ...info, ...claimed, claimed: true });
    } catch (claimError) {
      setError(claimError.message || (lang === 'ar' ? 'تعذر إصدار الشهادة.' : 'The certificate could not be claimed.'));
    } finally {
      setClaiming(false);
    }
  };

  if (info?.claimed && info.participantName) {
    return (
      <Certificate
        lang={lang}
        onHome={onHome}
        certificate={{ ...info, journey }}
      />
    );
  }

  const journeyLabel = {
    protection: lang === 'ar' ? 'الحماية' : 'Protection',
    advocacy: lang === 'ar' ? 'المناصرة' : 'Advocacy',
    empowerment: lang === 'ar' ? 'التمكين' : 'Empowerment'
  }[journey];
  const title = lang === 'ar'
    ? `إصدار شهادة ${journeyLabel}`
    : `Claim your ${journeyLabel} certificate`;
  const description = lang === 'ar'
    ? 'أدخل اسمك كما تريد أن يظهر على الشهادة.'
    : 'Enter the name you want displayed on your certificate.';

  return (
    <Shell lang={lang}>
      <main className="certificate-claim-main" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        <section className="certificate-claim-card">
          <h1>
            {lang === 'ar' ? <>احصل على شهادة<br />{journeyLabel} الخاصة بك</> : <>Claim your {journeyLabel}<br />certificate</>}
          </h1>
          {loading && <p>{lang === 'ar' ? 'جارٍ تحميل الشهادة...' : 'Loading certificate...'}</p>}
          {!loading && error && <p className="certificate-claim-error" role="alert">{error}</p>}
          {!loading && !error && info && (
            <>
              <p>{description}</p>
              <p className="certificate-score">
                {info.result?.total > 0
                  ? `${info.result.correct} / ${info.result.total}`
                  : (lang === 'ar' ? 'شكرًا لمشاركتك' : 'Thank you for participating')}
              </p>
              <form onSubmit={handleSubmit} className="certificate-claim-form">
                <label htmlFor="certificate-name">
                  {lang === 'ar' ? 'الاسم' : 'Name'}
                </label>
                <input
                  id="certificate-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={120}
                  autoComplete="name"
                  disabled={claiming}
                  required
                />
                <button className="orange-button" type="submit" disabled={claiming}>
                  {claiming
                    ? (lang === 'ar' ? 'جارٍ الإصدار...' : 'Issuing...')
                    : (lang === 'ar' ? 'إصدار الشهادة' : 'Claim certificate')}
                </button>
              </form>
            </>
          )}
        </section>
        <button className="brown-button" onClick={onHome}>
          {ui('hotline', 'home', lang)} <Home size={20} />
        </button>
      </main>
    </Shell>
  );
}
