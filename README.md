# Kids Shorts Studio

A platform that makes kids learning cartoons (Shorts 9:16 and Videos 16:9) and uploads them to YouTube.
It works like Stick Reels: accounts, paid plans, a render queue, a Shorts library, schedules and YouTube upload.

```
client/   React (Vite) app: style cards, Create card with live preview, Profile, Pricing
server/   Express + MongoDB API: accounts, Razorpay plans, job queue, schedules, YouTube OAuth + upload
public/   drawing engine (js/*.js, 56 styles) and render.html, the page headless Chrome renders from
core.js   style library on the server + data/history.json (a variation is never made twice)
runner.js opens render.html in headless Chrome; voice.js makes the narration
```

## How a video is made

1. The user picks a style on the Dashboard and clicks Create. The server saves a `Job` in MongoDB.
2. The queue picks a never-used variation (seed) of the style and opens `public/render.html` in headless Chrome.
3. The page draws every frame with the same engine the browser preview uses and streams them to the server.
   ffmpeg encodes the MP4 and mixes the nursery music with the narrator's voice (music ducks under the voice).
4. The server writes the title, description and tags (your tags first, then style tags, then popular kids tags).
5. The video waits in **Your Shorts** until you upload it, or is uploaded on time when it came from a schedule
   or "Once later". Uploads are marked *Made for kids* by default (COPPA).

## Pages

- **Dashboard (`/`)**: 56 styles in groups (Learning, Story, Animals, Quiz…), search, *Surprise me*, *Autopilot*.
  Cards show a live frame and play on hover. Clicking one opens the Create card: preview with music and
  narration, Short or Video format, and *Create now*, *Once later* or *Repeat*.
- **Profile**: Account & Channel (YouTube connect, tags, Google credentials for the admin), Plan & billing,
  Your Shorts (filters, upload, edit, download, retry, delete), Schedule, Video settings
  (format, narrator voice, channel name, captions, narration, outro, watermark, lessons only, made for kids).
- **Pricing**: Basic ₹500, Pro ₹1,200, Max ₹2,500 per month (yearly = 10 months). Limits are in
  `server/src/services/plans.js`. Free accounts get 1 watermarked trial video.

The first account to sign up is the admin: full access without paying, and it receives the videos made
before accounts existed (from `data/history.json` + `output/`).

## Setup (Windows)

Needs Node 20+, ffmpeg on PATH, Chrome or Edge, and MongoDB (local, or an Atlas URI).

```powershell
npm run setup                                  # installs root, server and client packages
copy server\.env.example server\.env           # then edit it (MONGO_URI, Razorpay keys)
npm run build                                  # builds the React app into client/dist
npm start                                      # http://localhost:5180
```

For hot reload run `npm run dev` and `npm run dev:client`, then open http://localhost:5173.

### YouTube

1. In Google Cloud Console enable **YouTube Data API v3** and set up the OAuth consent screen.
2. Create an OAuth client of type **Web application** with the redirect URI shown in
   Profile → Account & Channel (locally `http://localhost:5180/api/youtube/callback`).
3. As the admin, paste the client ID and secret there. Each user then clicks **Connect YouTube**.

Until the Google project passes the API audit, YouTube keeps uploads private. Each upload uses about
1,600 of the 10,000 daily quota units (roughly 6 uploads a day).

### Razorpay

Put `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` and `RAZORPAY_WEBHOOK_SECRET` in `server/.env`. Add the webhook
`https://<your-domain>/api/billing/webhook` with all `subscription.*` events. Plans are created in Razorpay
the first time someone subscribes.

## Hosting: Vercel (app) + AWS (API)

- **App**: Vercel builds `client/` (see `vercel.json`) and forwards `/api` and `/media` to the EC2 server,
  so login cookies stay on one domain.
- **API**: runs on the shared EC2 box at `https://earlylearners.43-205-166-13.sslip.io` (port 5002).
  First time, copy `server/.env` (with an Atlas `MONGO_URI`) to `~/kids-shorts/server/.env`.
  Then commit and run `powershell -ExecutionPolicy Bypass -File deploy\update.ps1`.
- Add `https://<vercel-domain>/api/youtube/callback` to the Google OAuth client's redirect URIs.
- **Logs**: `sudo journalctl -u kids-shorts -f`.
