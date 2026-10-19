import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Shell from '../components/Shell.jsx';
import config from '../data/appData.json';
import { media, ui } from '../utils.js';

function Section({ title, children }) {
 return <section className="result-section"><h2 className="floating-title">{title}</h2>{children}</section>;
}

export default function Results({ lang, result, certificateToken, onHome, onCertificate }) {
 const [showSupport, setShowSupport] = useState(false);
 const steps = config.need_protection.protection_step || [];
 const score = result?.correct ?? 0;
 const total = result?.total ?? 0;
 const certificateUrl = certificateToken
  ? `${window.location.origin}/protection#/certificate-claim?token=${encodeURIComponent(certificateToken)}&lang=${lang}`
  : `${window.location.href.split('#')[0]}#/certificate?lang=${lang}`;
 const resultsVideo = lang === 'ar' ? '/videos/RESULTS_AR.mp4' : '/videos/RESULTS_EN.mp4';
 const nextLabel = lang === 'ar' ? '\u0627\u0644\u062a\u0627\u0644\u064a' : 'Next';
 const scoreMessage = lang === 'ar' ? '\u0644\u0642\u062f \u0623\u062c\u0628\u062a \u0628\u0634\u0643\u0644 \u0635\u062d\u064a\u062d \u0639\u0644\u0649' : 'You answered correctly on';

 if (showSupport) {
  return <Shell lang={lang}><main className="results-main results-support" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
   <div className="results-video-wrap journey-final-video">
    <video className="results-video" src={media(config.media?.[`video_${lang}`])} autoPlay playsInline loop controls preload="auto"
      onCanPlay={event => event.currentTarget.play().catch(() => {})} />
   </div>
   <Section title={ui('need_protection', 'title', lang)}>
    <p className="section-intro">{ui('need_protection', 'description', lang)}</p>
    <div className="protection-grid">{steps.map(step => <div className="protection-step" key={step.id}>
     <div className="step-icon">{step.step_icon && <img src={media(step.step_icon)} width="50" alt="" />}<span>{step.id}</span></div>
     <h3>{step[`step_title_${lang}`]}</h3><p>{step[`step_description_${lang}`]}</p>
    </div>)}</div>
   </Section>
   <Section title={ui('hotline', 'hotline_title', lang)}>
    <div className="hotline-columns"><div className="qr-column"><QRCodeSVG value={config.hotline.url} size={180} /></div>
     <div className="hotline-copy"><h3>{ui('hotline', 'hotline_subtitle', lang)}</h3><div className="hotline-number" dir="ltr">{config.hotline.number}</div>
      <strong>{ui('hotline', 'protection_title', lang)}</strong><p>{ui('hotline', 'protection_text', lang)}</p></div></div>
   </Section>
   <button className="orange-button home-button" onClick={onHome}>{ui('hotline', 'home', lang)} <Home size={20} /></button>
  </main></Shell>;
 }

 return <Shell lang={lang}><main className="results-main results-overview" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
  <div className="results-video-wrap">
   <video className="results-video" src={media(resultsVideo)} autoPlay playsInline loop controls preload="auto"
    onCanPlay={event => event.currentTarget.play().catch(() => {})} />
  </div>
  <Section title={ui('results', 'title', lang)}>
   <div className="result-columns">
    <div className="qr-column"><strong>{ui('results', 'save_certificate', lang)}</strong><QRCodeSVG value={certificateUrl} size={180} />
     <a className="mobile-certificate-button" href={certificateUrl}>
      {lang === 'ar' ? 'تحميل الشهادة' : 'Download Certificate'}
     </a>
    </div>
    <div className="score-column"><p>{scoreMessage}</p><div className="score-line"><span className="score-bubble">{score}</span><strong>{ui('results', 'out_of', lang)}</strong><span className="score-bubble">{total}</span><strong>{ui('results', 'questions_label', lang)}</strong></div></div>
   </div>
  </Section>
  <button className="orange-button next-button results-next-button" onClick={() => setShowSupport(true)}>{nextLabel} <img className="navigation-arrow" src={media('/images/Navigation Arrow.svg')} alt="" aria-hidden="true" /></button>
 </main></Shell>;
}
