import React, { useState } from 'react';
import { Home, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Shell from '../components/Shell.jsx';
import config from '../data/appData.json';
import { media, ui } from '../utils.js';

function Section({ title, children }) { return <section className="result-section"><h2 className="floating-title">{title}</h2>{children}</section>; }
export default function Results({ lang, result, onHome, onCertificate }) {
 const steps = config.need_protection.protection_step || [];
 const score = result?.correct ?? 0;
 const total = result?.total ?? 0;
 const certificateUrl = `${window.location.href.split('#')[0]}#/certificate?lang=${lang}`;
 return <Shell lang={lang}><main className="results-main" dir={lang==='ar'?'rtl':'ltr'}>
  <Section title={ui('need_protection','title',lang)}>
   <p className="section-intro">{ui('need_protection','description',lang)}</p>
   <div className="protection-grid">{steps.map(step=><div className="protection-step" key={step.id}>
    <div className="step-icon">{step.step_icon && <img src={media(step.step_icon)} width="50" alt=""/>}<span>{step.id}</span></div>
    <h3>{step[`step_title_${lang}`]}</h3><p>{step[`step_description_${lang}`]}</p>
   </div>)}</div>
  </Section>
  <Section title={ui('results','title',lang)}>
   <div className="result-columns">
    <div className="qr-column"><strong>{ui('results','save_certificate',lang)}</strong><QRCodeSVG value={certificateUrl} size={180}/>
     <button className="download-button" onClick={onCertificate}>{ui('results','certificate',lang)} <Download size={18}/></button></div>
    <div className="score-column"><p>{lang==='ar'?'أحسنت! لقد اجتزت الاختبار بنجاح.':'Well done! You have successfully completed the quiz.'}</p>
     {total>0?<><p>{ui('results','result_text',lang)}</p><div className="score-line" dir="ltr"><span className="score-bubble">{score}</span><strong>{ui('results','out_of',lang)}</strong><span className="score-bubble">{total}</span><strong>{ui('results','questions_label',lang)}</strong></div></>:<p>{lang==='ar'?'شكراً لمشاركتك.':'Thank you for participating.'}</p>}
    </div>
   </div>
  </Section>
  <Section title={ui('hotline','hotline_title',lang)}>
   <div className="hotline-columns"><div className="qr-column"><QRCodeSVG value={config.hotline.url} size={180}/></div>
    <div className="hotline-copy"><h3>{ui('hotline','hotline_subtitle',lang)}</h3><div className="hotline-number" dir="ltr">{config.hotline.number}</div>
     <strong>{ui('hotline','protection_title',lang)}</strong><p>{ui('hotline','protection_text',lang)}</p></div></div>
  </Section>
  <button className="orange-button home-button" onClick={onHome}>{ui('hotline','home',lang)} <Home size={20}/></button>
 </main></Shell>;
}
