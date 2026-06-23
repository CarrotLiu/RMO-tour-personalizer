# My Field Journal Mobile Web Prototype

React + Vite mobile web prototype for the field-journal museum interaction flow.

## Run

```bash
npm install
npm run dev
```

## Camera testing

The pottery challenge uses the real device camera through `navigator.mediaDevices.getUserMedia`.
Camera access requires a secure browser context. It works on `localhost`; for testing on a physical phone, serve the app over HTTPS or use a trusted tunnel/domain. A plain `http://192.168.x.x` Vite URL may load the app but block camera permission.

## Firebase data capture

Create `final-prototype/.env.local` from `.env.example` and fill in the Firebase web app config values. When all values are present, the app writes:

- `visitorSessions/{sessionId}`: username, profiling selections, timestamps.
- `visitorSessions/{sessionId}/acceptedPhotos/{challengeId}`: metadata for each accepted artifact photo.
- Firebase Storage `visitorSessions/{sessionId}/acceptedPhotos/`: the accepted JPEG photo files.

If the Firebase env values are missing, the app still runs normally and skips remote writes.

## 已包含
- Mobile app shell
- Safe area / dynamic viewport
- PWA manifest
- Home / Map / Collection / Challenge pages
- Swipe challenge carousel
- Long press + drag demo
- Drop correct/wrong feedback
- Flip card interaction
- Mock challenge data

## Asset handoff

Put real assets in `public/assets/`, then reference them from `src/data/challenges.ts` with absolute public paths like `/assets/coin.png`.

Recommended folders:

```text
public/assets/
  fonts/
    ginto-regular.woff2
    ginto-medium.woff2
  map/
    exhibition-map.png
  artifacts/
    byzantine-coin.png
    burial-drawing.png
    bronze-age-fashion.png
    pottery.png
  options/
    coin-sketch.png
    padlock-sketch.png
    cloak-pin-sketch.png
  pottery/
    camera.png
    preview.png
    journal-note.png
  journal/
    coin-page.png
    burial-page.png
```

Recommended formats:
- Use licensed Ginto `.woff2` webfont files named `ginto-regular.woff2` and `ginto-medium.woff2` in `public/assets/fonts/`.
- Use PNG or WebP for transparent sketches and UI cutouts.
- Use JPG/WebP for photos.
- Export images at 2x mobile size. For example, an option card image that appears around 120 px wide should be at least 240 px wide.
- Keep filenames lowercase with hyphens.
- Provide a short alt text for every image; the data file already has `alt` fields.

Each challenge supports:
- `artifact.src`: main object/card/journal image.
- `options[].asset.src`: draggable sketch image.
- `options[].explanation`: flip-card text for image challenges.
- `capture.camera`, `capture.preview`, `capture.journalNote`: camera challenge states for the pottery task.
- `location`: map cross position as percentages.
