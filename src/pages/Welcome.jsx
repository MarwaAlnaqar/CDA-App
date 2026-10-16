import React from 'react';
import Shell from '../components/Shell.jsx';
import config from '../data/appData.json';
import { media } from '../utils.js';
import VimeoVideo from '../components/VimeoVideo.jsx';
export default function Welcome({onLanguage,busy,error}) {
 return <Shell lang="ar">
    
    <main className="journey-welcome">
  {/* <h1>{config.title_en}　{config.title_ar}</h1> */}


  {/* <div className="welcome-descriptions">
    
   <div dir="rtl">
    
    <h2>{config.title_ar}</h2>
    <p>{config.subtitle_ar}</p>
    </div>
    <div dir="ltr"><h2>{config.title_en}</h2><p>{config.subtitle_en}</p></div>
</div> */}
  {config.media.intro &&<VimeoVideo
            key={`intro`}
            url={config.media.intro}
            title='intro'
            autoplay
            muted
            controls
            onEnded={() => {
            
            }}
            onError={() => {
              setVideoFailed(true);
            }}
          />
  // <video src={media(config.media.intro)} autoPlay muted loop playsInline/>

  }
  <div className="journey-languages">
     <button className="orange-button" disabled={busy} onClick={()=>onLanguage('ar')}>العربية</button>
    <button className="orange-button" disabled={busy} onClick={()=>onLanguage('en')}>ENGLISH</button>
  
   </div>
  {error && <p className="journey-error" role="alert">{error}</p>}
 </main></Shell>;
}
