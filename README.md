# Himaya CDA Quiz (React + Vite)

## Start

```bash
npm install
npm run dev
```

## Replace sample media

Add these official, authorized assets in `public/`:

- `images/government-of-dubai.png`
- `images/cda-logo.png`
- `images/sign-language-icon.png`
- `images/question1.jpg` through `images/question4.jpg`
- `videos/background.mp4` (autoplay, muted, looping background)
- `videos/intro.mp4` (welcome sign-language video)
- `videos/question1.mp4` through `videos/question4.mp4`
- `videos/question1-correct.mp4` through `videos/question4-correct.mp4`
- `videos/question1-wrong.mp4` through `videos/question4-wrong.mp4`

Missing assets show placeholders instead of crashing the application. The supplied reference screenshots are design references, **not** separate licensed logo or video files.

## Content

Edit `src/data/appData.json` for all bilingual questions, answers, video paths, and hotline information. Questions 3 and 4 are illustrative placeholders; replace with approved CDA content. Verify all hotline numbers, legal descriptions and privacy notices before publication. The source screenshots show different hotline numbers for different purposes.

## QR and certificate

The result screen creates a QR linking to `#/certificate` on the current public site. **It will only work across devices after deployment to a publicly accessible HTTPS URL.** The certificate is a common participation certificate, with no participant name/score. It downloads as PDF using html2canvas + jsPDF. No participant data is stored. QR codes on the certificate page link back to the certificate page. For personalized certificates and audit trails, add a backend.

## GitHub Pages

The Vite base is `./`, and the certificate uses a hash route for compatibility with static hosting. You may deploy `dist/` using GitHub Actions or `gh-pages`. `npm run build` generates `dist/`.

## Accessibility

The videos default to muted autoplay for browser compatibility. Add caption/transcript support and approved accessibility review before production. Arabic and English text changes when language is selected; the sign-language video files are currently shared per question and can be extended for language-specific media.
