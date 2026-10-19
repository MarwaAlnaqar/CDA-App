
import React, { useState } from 'react';
import { Home } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import Shell from '../components/Shell.jsx';
import advocacy from '../data/advocacy.json';
import empowerment from '../data/empowerment.json';
import { media } from '../utils.js';

// =====================================
// TRANSLATION HELPER
// =====================================

const t = (object, field, lang) =>
  object?.[`${field}_${lang}`] ||
  object?.[`${field}_en`] ||
  '';

// =====================================
// SECTION COMPONENT
// =====================================

function Section({ title, children, className = '' }) {
  return (
    <section className={`result-section ${className}`}>
      <h2 className="floating-title">
        {title}
      </h2>

      {children}
    </section>
  );
}

// =====================================
// ADVOCACY RESULTS
// =====================================

export default function ResultsAdvocacy({
  lang = 'ar',
  result,
  journey = 'advocacy',
  certificateToken,
  onHome,
  onCertificate
}) {
  const isArabic = lang === 'ar';
  const [showAuthority, setShowAuthority] = useState(false);

  const score = result?.correct ?? 0;
  const total = result?.total ?? 0;

  const journeyData = journey === 'empowerment' ? empowerment : advocacy;
  const content = journeyData.results;
  const authority = advocacy.authority_role;
  const finalVideo = journeyData.media?.[`video_${lang}`];

  const certificateUrl = certificateToken
    ? `${window.location.origin}${window.location.pathname}#/certificate-claim?token=${encodeURIComponent(certificateToken)}&lang=${lang}`
    : `${window.location.origin}${window.location.pathname}#/certificate?lang=${lang}`;

  const resultsSection = (
    <Section title={t(content, 'title', lang)} className="advocacy-score-section">
          <div className="result-columns">

            {/* CERTIFICATE QR */}

            <div className="qr-column">
              <strong>
                {t(
                  content,
                  'save_certificate',
                  lang
                )}
              </strong>

              <QRCodeSVG
                value={certificateUrl}
                size={180}
              />

              <a className="mobile-certificate-button" href={certificateUrl}>
                {isArabic ? 'تحميل الشهادة' : 'Download Certificate'}
              </a>

            </div>

            {/* SCORE */}

            <div className="score-column">
              <p>
                {t(
                  content,
                  'success_message',
                  lang
                )}
              </p>

              {total > 0 ? (
                <div
                  className="score-line"
                  dir={isArabic ? 'rtl' : 'ltr'}
                >
                  <span className="score-bubble">
                    {score}
                  </span>

                  <strong>
                    {t(content, 'out_of', lang)}
                  </strong>

                  <span className="score-bubble">
                    {total}
                  </span>

                  <strong>
                    {t(
                      content,
                      'questions_label',
                      lang
                    )}
                  </strong>
                </div>
              ) : (
                <p>
                  {t(content, 'thank_you', lang)}
                </p>
              )}
            </div>

          </div>
    </Section>
  );

  const authoritySection = (
    <Section title={t(authority, 'title', lang)} className="advocacy-authority-section">
          <div className="advocacy-authority-content">

            <p className="advocacy-authority-intro">
              {t(
                authority,
                'introduction',
                lang
              )}
            </p>

            {/* BULLET POINTS */}

            <ul className="advocacy-authority-list">
              {authority.points.map(point => (
                <li key={point.id}>
                  <strong>
                    {t(point, 'title', lang)}:
                  </strong>{' '}

                  {t(
                    point,
                    'description',
                    lang
                  )}
                </li>
              ))}
            </ul>

            {/* IMPACT */}

            <div className="advocacy-authority-impact">
              <strong>
                {t(
                  authority.impact,
                  'title',
                  lang
                )}
              </strong>

              <p>
                {t(
                  authority.impact,
                  'description',
                  lang
                )}
              </p>
            </div>

            {/* CLOSING STATEMENT */}

            <p className="advocacy-authority-closing">
              <strong>
                {t(
                  authority,
                  'closing',
                  lang
                )}
              </strong>
            </p>

          </div>
    </Section>
  );

  return (
    <Shell lang={lang}>
      <main className="results-main advocacy-results" dir={isArabic ? 'rtl' : 'ltr'}>
        {!showAuthority && (
          <div className="results-video-wrap journey-final-video">
            <video className="results-video" src={media(finalVideo)} autoPlay playsInline loop controls preload="auto"
              onCanPlay={event => event.currentTarget.play().catch(() => {})} />
          </div>
        )}
        {showAuthority ? authoritySection : resultsSection}
        {!showAuthority && (
          <button
            type="button"
            className="orange-button next-button results-next-button"
            onClick={() => setShowAuthority(true)}
          >
            {isArabic ? 'التالي' : 'Next'}
            <img className="navigation-arrow" src={media('/images/Navigation Arrow.svg')} alt="" />
          </button>
        )}
        {showAuthority && (
        <button
          type="button"
          className="orange-button home-button"
          onClick={onHome}
        >
          {t(
            journeyData.navigation || advocacy.navigation,
            'home',
            lang
          )}

          <Home size={20} />
        </button>
        )}

      </main>
    </Shell>
  );
}
