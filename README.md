# Kids Shorts Studio

Make kids cartoon videos in the style of the two reference clips: bright 3D-look characters,
quick 1–2 s cuts, bouncy captions, nursery music and a natural narrator voice.

- **Leo the teacher** hosts every video: he greets the kids, teaches the lesson (from the corner when the lesson fills the screen) and says goodbye. He looks the same in every video.
- **Learning lessons by default.** Random videos and Autopilot only pick lessons (shapes, counting, colours, letters, animals, birds, vehicles, planets, routines...). Untick *learning lessons only* in the Studio, or pick *All styles* in Autopilot, to include stories.
- **56 styles**, each available as a **Short (9:16)** or a **Video (16:9)**.
- **Random, never-repeating videos.** Every video has a variation number (seed). The seed changes
  the content (which fruits, letters or animals appear), the hero's look, the sky, the music key,
  tempo and instrument, and the highlight colour. A fingerprint of each variation is stored in
  `data/history.json`, so the same variation is never made twice.
- **YouTube Autopilot.** Connect your channel, pick publish times, and the studio keeps the next
  days scheduled with fresh random videos. It uses YouTube's own scheduled publishing.

## Setup
You need **Node 18+**, **ffmpeg** on PATH and **Chrome or Edge**.
```
npm install          # one-time: installs the natural-voice client
node server.js       # then open http://localhost:5180
```

## Studio (http://localhost:5180)
- Pick any of the 52 styles and press ▶ to preview with music and narration.
- **🎲 Random new video** jumps to a style and variation that has never been made.
  **Shuffle** gives a new variation of the current style. **Classic** goes back to variation 0.
- Customize the hero name, channel name, skin tone, outfit, captions, narrator voice and outro.
- **Export this style** saves an MP4 to `output/`.

## YouTube Autopilot (http://localhost:5180/autopilot.html)
1. **Connect YouTube.** In Google Cloud Console, create a project and enable *YouTube Data API v3*.
   Set the OAuth consent screen to External and add yourself as a test user. Then create an OAuth
   client of type **Desktop app**, paste its JSON into the page and press **Connect**.
2. **Make videos now.** The page has three buttons:
   - *Generate only*: saves the MP4 without uploading.
   - *Generate + publish now*: uploads and publishes right away.
   - *Generate + schedule next free slot*: uploads with a future publish time.
3. **Autopilot.** Set publish times (for example `09:00, 17:00`), days, format and title/description
   templates, then turn Autopilot ON. While `node server.js` runs, it checks every minute and fills
   any open slot in the planning window. Each video uploads as private with a publish time, and
   YouTube makes it public at that time.

**Important YouTube limits**
- If your Google Cloud project hasn't passed Google's API audit, YouTube keeps every upload
  **private**. Request the audit (it's free) so uploads can become public.
- If the consent screen is still in Testing, the login expires after 7 days. Publish the consent
  screen to stop that.
- Each upload costs about 1,600 of the default 10,000 daily quota units, so the limit is roughly
  6 uploads a day.
- Uploads are marked *Made for kids* by default. That's required for content aimed at children
  (COPPA).

## Batch render from the command line
```
node render-all.js                         # all 52 styles, classic variation, shorts + videos
node render-all.js --formats short --styles farm,dance --res 720 --name Mia
```

## Styles
| # | Style | # | Style | # | Style | # | Style |
|---|---|---|---|---|---|---|---|
| 1 | Wheels Adventure | 14 | Veggie Garden | 27 | Mix the Colors | 40 | Good Morning Routine |
| 2 | Farm Friends | 15 | Things That Go | 28 | Big and Small | 41 | Wash Your Hands |
| 3 | Count to Ten | 16 | Beep Beep Quiz | 29 | Pattern Game | 42 | Teddy's Picnic |
| 4 | Rainbow Colors | 17 | Opposites | 30 | Rocket Countdown | 43 | Puddle Jumping |
| 5 | ABC Letters | 18 | My Feelings | 31 | Hello Planets | 44 | Snowy Day |
| 6 | Shapes Party | 19 | Weather Song | 32 | Jungle Friends | 45 | Beach Day |
| 7 | Bedtime Lullaby | 20 | Four Seasons | 33 | Who's in the Jungle? | 46 | Little Seed |
| 8 | Animal Sounds Quiz | 21 | My Body | 34 | My Pets | 47 | Fire Truck Rescue |
| 9 | Bath Time Bubbles | 22 | Days of the Week | 35 | Bugs in the Garden | 48 | Trip to the Moon |
| 10 | Dance Party | 23 | Count the Animals | 36 | Up in the Sky | 49 | Hide and Seek |
| 11 | Under the Sea | 24 | Alphabet Balloons | 37 | Dino Stomp | 50 | The Lost Balloon |
| 12 | Birthday Surprise | 25 | Letter Sounds | 38 | Music Time | 51 | Move and Freeze |
| 13 | Fruit Friends | 26 | Shape Hunt | 39 | Brush Your Teeth | 52 | Peekaboo! |

All melodies are public-domain nursery tunes played by the built-in synth. Narration uses
Microsoft Edge's online neural voices (Ana, Jenny, Aria and others). If there is no internet,
it falls back to the offline Windows voice.

## Files
- `public/js/engine.js`, `props.js`: characters, props and backgrounds drawn on canvas.
- `public/js/styles.js`, `styles2.js`: the 52 styles (scene lists with pick/build for random content).
- `public/js/render.js`: variations (seeds and fingerprints), timeline and frame renderer.
- `public/js/audio.js`: music and sound-effect synth.
- `server.js`: web server and MP4 export (frames go into ffmpeg, then narration and music are mixed).
- `voice.js`: natural narration with cache. `core.js`: style library on the server and history.
- `runner.js`: headless-browser renderer. `youtube.js`: OAuth and upload. `autopilot.js`: scheduler.
- `data/`: your settings, YouTube credentials, tokens and history. **Keep this folder private.**

## Hosting on AWS
The studio runs on the shared TurtleReels EC2 box (ap-south-1) at
`https://earlylearners.43-205-166-13.sslip.io`, behind Caddy with HTTPS and a password (user `admin`).
- **Deploy or update:** commit, then run `powershell -ExecutionPolicy Bypass -File deploy\update.ps1`.
  It ships the committed code only; the server keeps its own `data/`, `output/` and password.
- **SSH times out:** your home IP changed. Run `node deploy\aws-provision.mjs` in the *Turtle Reels* folder.
- **YouTube on the server:** create a Google OAuth client of type *Web application* and add
  `https://earlylearners.43-205-166-13.sslip.io/oauth2callback` as an authorized redirect URI.
- **Logs:** `sudo journalctl -u kids-shorts -f`. Password: `~/kids-shorts/.admin-password`.
- Autopilot times use India time (`TZ=Asia/Kolkata` in the service). Stop Autopilot on your PC once the server runs it, or both will upload.
