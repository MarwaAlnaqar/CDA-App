
import React from 'react';
import config from '../data/appData.json';

// Resolve files inside public/
function getPublicUrl(path) {
  if (!path) return '';

  const value = String(path).trim();

  // External URL
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const base = import.meta.env.BASE_URL || '/';

  const cleanPath = value
    .replace(/^\/+/, '')
    .replace(/^public\//i, '');

  return new URL(
    `${base}${cleanPath}`,
    window.location.origin
  ).href;
}

export default function Shell({
  children,
  lang = 'ar',name,
  backgroundVideo
}) {
  const currentLang = lang === 'en' ? 'en' : 'ar';
  const isArabic = currentLang === 'ar';
console.log(window.href)
  // Use supplied video, otherwise use the JSON default
  const selectedVideo =
    backgroundVideo ?? config.media.bg;

  const videoSrc = getPublicUrl(selectedVideo);

  return (
    <div
      className="blue-screen journey-screen"
      lang={currentLang}
      dir={isArabic ? 'rtl' : 'ltr'}
      style={{
        fontFamily: isArabic
          ? '"GE SS Two", sans-serif'
          : '"Source Sans Pro", sans-serif'
      }}
    >
      <div className="journey-bg" aria-hidden="true" />

      {videoSrc && (
        <video
          key={videoSrc}
          className="journey-background-video"
          src={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          onError={(event) => {
            console.error(
              'Background video failed:',
              event.currentTarget.currentSrc,
              event.currentTarget.error
            );
          }}
        />
      )}

      <div className="screen-content journey-content">
        <header className="brand-header" dir="ltr">
          <img
            src={getPublicUrl(config.media.governmentLogo)}
            alt="Government of Dubai"
          />

          <img
            src={getPublicUrl(config.media.cdaLogo)}
            alt="Community Development Authority"
          />
        </header>

        {children}
      </div>
    </div>
  );
}
