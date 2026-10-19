
import React, { useState } from 'react';
import { Home } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import Shell from '../components/Shell.jsx';
import empowerment from '../data/empowerment.json';
import { media } from '../utils.js';

import '../journey.css';

// =======================================
// TRANSLATION
// =======================================

function t(object, field, lang) {
  return (
    object?.[`${field}_${lang}`] ??
    object?.[`${field}_en`] ??
    ''
  );
}

// =======================================
// SECTION
// =======================================

function Section({ title, children, className = '' }) {
  return (
    <section className={`result-section ${className}`}>
      <h2 className="floating-title">{title}</h2>
      {children}
    </section>
  );
}

// =======================================
// EMPOWERMENT RESULTS
// =======================================

export default function ResultsEmpowerment({
  lang = 'ar',
  result,
  certificateToken,
  onHome,
  onCertificate
}) {
  const isArabic = lang === 'ar';
  const [showDetails, setShowDetails] = useState(false);

  const strategic = empowerment.strategic_role;
  const results = empowerment.results;
  const hotline = empowerment.hotline;
  const finalVideo = empowerment.media?.[`video_${lang}`];

  const score = Number(result?.correct ?? 0);
  const total = Number(result?.total ?? 0);

  const certificateUrl = certificateToken
    ? `${window.location.origin}${window.location.pathname}#/certificate-claim?token=${encodeURIComponent(certificateToken)}&lang=${lang}`
    : `${window.location.origin}${window.location.pathname}#/certificate?lang=${lang}`;

  const strategicSection = (
    <Section title={t(strategic, 'title', lang)} className="empowerment-strategic-section">
          <div className="empowerment-strategic-content">

            <h3 className="empowerment-subtitle">
              {t(strategic, 'pillars_title', lang)}
            </h3>

            <div className="empowerment-pillars-grid">
              {strategic.pillars.map((pillar) => (
                <div
                  className="empowerment-pillar-card"
                  key={pillar.id}
                >
                  <h4>{t(pillar, 'title', lang)}</h4>
                  <p>
                    {t(pillar, 'description', lang)}
                  </p>
                </div>
              ))}
            </div>

            <h3 className="empowerment-subtitle empowerment-impact-heading">
              {t(strategic, 'impact_title', lang)}
            </h3>

            <div className="empowerment-impact-grid">
              {strategic.impact.map((item) => (
                <div
                  className="empowerment-impact-card"
                  key={item.id}
                >
                  <strong className="empowerment-impact-number">
                    {item.value}
                  </strong>

                  <h4>{t(item, 'title', lang)}</h4>

                  <p>
                    {t(item, 'description', lang)}
                  </p>
                </div>
              ))}
            </div>

            <div className="empowerment-closing">
              <h3>
                {t(strategic, 'closing_title', lang)}
              </h3>

              <p>
                {t(strategic, 'closing_description', lang)}
              </p>
            </div>

          </div>
    </Section>
  );

  const resultsSection = (
    <Section title={t(results, 'title', lang)} className="empowerment-score-section">
          <div className="empowerment-result-columns">

            <div className="empowerment-qr-column">
              <strong>
                {t(results, 'save_certificate', lang)}
              </strong>

              <QRCodeSVG
                value={certificateUrl}
                size={145}
                marginSize={0}
              />

              <a className="mobile-certificate-button" href={certificateUrl}>
                {isArabic ? 'تحميل الشهادة' : 'Download Certificate'}
              </a>

            </div>

            <div className="empowerment-score-column">
              <p className="empowerment-score-intro">
                {t(results, 'success_message', lang)}
              </p>

              {total > 0 ? (
                <div className="empowerment-score-line">
                  {isArabic ? (
                    <>
                      <span className="empowerment-score-bubble">
                        {score}
                      </span>
                      <strong>
                        {t(results, 'out_of', lang)}
                      </strong>
                      <span className="empowerment-score-bubble">
                        {total}
                      </span>
                      <strong>
                        {t(results, 'questions_label', lang)}
                      </strong>
                    </>
                  ) : (
                    <>
                      <span className="empowerment-score-bubble">
                        {score}
                      </span>
                      <strong>
                        {t(results, 'out_of', lang)}
                      </strong>
                      <span className="empowerment-score-bubble">
                        {total}
                      </span>
                      <strong>
                        {t(results, 'questions_label', lang)}
                      </strong>
                    </>
                  )}
                </div>
              ) : (
                <p>{t(results, 'thank_you', lang)}</p>
              )}
            </div>

          </div>
    </Section>
  );

  const hotlineSection = (
    <Section title={t(hotline, 'title', lang)} className="empowerment-hotline-section">
          <div className="empowerment-hotline-columns">

            <div className="empowerment-hotline-qr">
              <QRCodeSVG
                value={hotline.url}
                size={145}
                marginSize={0}
              />
            </div>

            <div className="empowerment-hotline-copy">
              <h3>
                {t(hotline, 'authority', lang)}
              </h3>

              <div
                className="empowerment-hotline-number"
                dir="ltr"
              >
                {hotline.number}
              </div>

              <p>
                {t(hotline, 'description', lang)}
              </p>

              <a
                href={hotline.url}
                target="_blank"
                rel="noopener noreferrer"
                className="empowerment-hotline-website"
              >
                {hotline.website}
              </a>
            </div>

          </div>
    </Section>
  );

  return (
    <Shell lang={lang}>
      <main className="results-main empowerment-results" dir={isArabic ? 'rtl' : 'ltr'}>
        {!showDetails && (
          <div className="results-video-wrap journey-final-video">
            <video className="results-video" src={media(finalVideo)} autoPlay playsInline loop controls preload="auto"
              onCanPlay={event => event.currentTarget.play().catch(() => {})} />
          </div>
        )}
        {showDetails ? (
          <>
            {strategicSection}
            {hotlineSection}
          </>
        ) : (
          resultsSection
        )}
        {!showDetails && (
          <button
            type="button"
            className="orange-button next-button results-next-button"
            onClick={() => setShowDetails(true)}
          >
            {isArabic ? 'التالي' : 'Next'}
            <img className="navigation-arrow" src={media('/images/Navigation Arrow.svg')} alt="" />
          </button>
        )}
        {showDetails && (
        <button
          type="button"
          className="orange-button home-button empowerment-home-button"
          onClick={onHome}
        >
          {t(empowerment.navigation, 'home', lang)}
          <Home size={20} />
        </button>
        )}

      </main>
    </Shell>
  );
}
