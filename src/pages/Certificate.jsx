import React from 'react';
import { Download, Home } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import Shell from '../components/Shell.jsx';
import config from '../data/appData.json';
import { media, ui } from '../utils.js';
export default function Certificate({lang,onHome}) {
 const image=config.results[`certificate_image_${lang}`];
 const qr=config.results[`certificate_qr_image_${lang}`];
 const url=`${window.location.href.split('#')[0]}#/certificate?lang=${lang}`;
 return <Shell lang={lang}><main className="certificate-main">
  <div className="certificate-card"><h2>{ui('results','save_certificate',lang)}</h2>
   {image && <img className="himaya-certificate-image" src={media(image)} alt={ui('results','certificate',lang)}/>}
   <div className="certificate-qr">{qr?<img src={media(qr)} width="160" alt="Certificate QR"/>:<QRCodeSVG value={url} size={160}/>}</div>
   {image && <a className="download-button" href={media(image)} download><Download size={18}/>{ui('results','certificate',lang)}</a>}
  </div><button className="brown-button" onClick={onHome}>{ui('hotline','home',lang)} <Home size={20}/></button>
 </main></Shell>;
}
