
import React from 'react';
import { Home, Download } from 'lucide-react';
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

  const score = result?.correct ?? 0;
  const total = result?.total ?? 0;

  const journeyData = journey === 'empowerment' ? empowerment : advocacy;
  const content = journeyData.results;
  const authority = advocacy.authority_role;
  const finalVideo = journeyData.media?.[`video_${lang}`];

  const certificateUrl = certificateToken
    ? `${window.location.origin}${window.location.pathname}#/certificate-claim?token=${encodeURIComponent(certificateToken)}&lang=${lang}`
    : `${window.location.origin}${window.location.pathname}#/certificate?lang=${lang}`;

  return (
    <Shell lang={lang}>
      <main
        className="results-main advocacy-results"
        dir={isArabic ? 'rtl' : 'ltr'}
      >
        <div className="results-video-wrap journey-final-video">
          <video className="results-video" src={media(finalVideo)} playsInline controls preload="metadata" />
        </div>
        {/* =====================================
            RESULTS
        ===================================== */}

        <Section
          title={t(content, 'title', lang)}
          className="advocacy-score-section"
        >
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

              <button
                type="button"
                className="download-button"
                onClick={onCertificate}
              >
                {t(content, 'certificate', lang)}
                <Download size={16} />
              </button>
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

        {/* =====================================
            ROLE OF THE AUTHORITY
        ===================================== */}

        <Section
          title={t(authority, 'title', lang)}
          className="advocacy-authority-section"
        >
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

        {/* =====================================
            HOME BUTTON
        ===================================== */}

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

      </main>
    </Shell>
  );
}
