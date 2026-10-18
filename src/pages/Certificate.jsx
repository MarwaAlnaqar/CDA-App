import React, { useRef, useState } from 'react';
import { Download, Home } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import Shell from '../components/Shell.jsx';
import config from '../data/appData.json';
import advocacyConfig from '../data/advocacy.json';
import empowermentConfig from '../data/empowerment.json';
import { media, ui } from '../utils.js';

export default function Certificate({ lang, onHome, certificate, journey = 'protection' }) {
 const journeyConfig = journey === 'advocacy' ? advocacyConfig : journey === 'empowerment' ? empowermentConfig : config;
 const image = config.results[`certificate_image_${lang}`];
 const qr = config.results[`certificate_qr_image_${lang}`];
 const url = `${window.location.href.split('#')[0]}#/certificate?lang=${lang}`;
 const certificateRef = useRef(null);
 const [isDownloading, setIsDownloading] = useState(false);
 const copy = journeyConfig.certificate_copy?.participation;
 const certificateHeading = copy?.[`title_${lang}`] || (lang === 'ar' ? '\u0634\u0643\u0631\u0627\u064b' : 'Thank You!');
 const certificateMessage = copy?.[`description_${lang}`] || '';

 const downloadPersonalized = async () => {
  if (!certificateRef.current || isDownloading) return;
  setIsDownloading(true);
  try {
   if (document.fonts?.ready) await document.fonts.ready;
   const image = certificateRef.current.querySelector('img');
   if (image && !image.complete) {
    await new Promise((resolve, reject) => {
     image.addEventListener('load', resolve, { once: true });
     image.addEventListener('error', reject, { once: true });
    });
   }
   const canvas = await Promise.race([
    html2canvas(certificateRef.current, { scale: 1, useCORS: true, imageTimeout: 5000, logging: false, backgroundColor: '#fff' }),
    new Promise((_, reject) => setTimeout(() => reject(new Error('Certificate rendering timed out')), 15000))
   ]);
   const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
   const margin = 10;
   const maxWidth = 210 - margin * 2;
   const maxHeight = 297 - margin * 2;
   const ratio = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
   const width = canvas.width * ratio;
   const height = canvas.height * ratio;
   pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', (210 - width) / 2, (297 - height) / 2, width, height);
   pdf.save(`himaya-certificate-${certificate.participantName}.pdf`);
  } catch (error) {
   console.error('Certificate download failed:', error);
   window.alert(lang === 'ar' ? 'تعذر تجهيز الشهادة للتنزيل. يرجى المحاولة مرة أخرى.' : 'The certificate could not be prepared. Please try again.');
  } finally {
   setIsDownloading(false);
  }
 };

 if (certificate?.participantName) {
  return <Shell lang={lang}><main className="certificate-main" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
   <div className="certificate-card">
    <h2>{ui('results', 'certificate', lang)}</h2>
    <div className="personalized-certificate" ref={certificateRef}>
     <img src={media(image)} alt="" />
     <div className="personalized-certificate-copy">
      <div className="personalized-certificate-type">{certificateHeading}</div>
      <div className="personalized-certificate-name">{certificate.participantName}</div>
      <div className="personalized-certificate-message">{certificateMessage}</div>
     </div>
    </div>
    <button className="download-button" onClick={downloadPersonalized} disabled={isDownloading} aria-busy={isDownloading}><Download size={18} />{isDownloading ? (lang === 'ar' ? 'جارٍ تجهيز الشهادة...' : 'Preparing certificate...') : ui('results', 'certificate', lang)}</button>
   </div>
   <button className="brown-button" onClick={onHome}>{ui('hotline', 'home', lang)} <Home size={20} /></button>
  </main></Shell>;
 }

 return <Shell lang={lang}><main className="certificate-main">
  <div className="certificate-card"><h2>{ui('results', 'save_certificate', lang)}</h2>
   {image && <img className="himaya-certificate-image" src={media(image)} alt={ui('results', 'certificate', lang)} />}
   <div className="certificate-qr">{qr ? <img src={media(qr)} width="160" alt="Certificate QR" /> : <QRCodeSVG value={url} size={160} />}</div>
  </div><button className="brown-button" onClick={onHome}>{ui('hotline', 'home', lang)} <Home size={20} /></button>
 </main></Shell>;
}
