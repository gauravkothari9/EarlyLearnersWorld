// YouTube Data API v3: OAuth (installed-app loopback flow) + resumable upload with scheduling.
// Credentials and tokens stay on this computer in data/ (never sent anywhere except Google).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { DATA } = require('./core');

const CLIENT = path.join(DATA, 'youtube-client.json');
const TOKEN = path.join(DATA, 'youtube-token.json');
const SCOPES = ['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly'];
let pendingState = null;

const read = (f) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch (e) { return null; } };
const write = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1));

// Accepts {clientId, clientSecret} or the raw client_secret_*.json downloaded from Google Cloud.
function setClient(input) {
  let o = input;
  if (typeof input.json === 'string' && input.json.trim()) { const j = JSON.parse(input.json); o = j.installed || j.web || j; o = { clientId: o.client_id, clientSecret: o.client_secret }; }
  if (!o.clientId || !o.clientSecret) throw new Error('Client ID and client secret are required.');
  write(CLIENT, { clientId: String(o.clientId).trim(), clientSecret: String(o.clientSecret).trim() });
}
function disconnect() { try { fs.unlinkSync(TOKEN); } catch (e) {} }

function authUrl(redirectUri) {
  const c = read(CLIENT); if (!c) throw new Error('Add your Google OAuth client first.');
  pendingState = crypto.randomBytes(16).toString('hex');
  const q = new URLSearchParams({ client_id: c.clientId, redirect_uri: redirectUri, response_type: 'code', scope: SCOPES.join(' '), access_type: 'offline', prompt: 'consent', state: pendingState });
  return 'https://accounts.google.com/o/oauth2/v2/auth?' + q;
}
async function tokenRequest(params) {
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(params) });
  const j = await r.json(); if (!r.ok) throw new Error('Google token error: ' + (j.error_description || j.error || r.status));
  return j;
}
async function handleCallback(code, state, redirectUri) {
  if (!pendingState || state !== pendingState) throw new Error('OAuth state mismatch — please try connecting again.');
  pendingState = null;
  const c = read(CLIENT);
  const j = await tokenRequest({ code, client_id: c.clientId, client_secret: c.clientSecret, redirect_uri: redirectUri, grant_type: 'authorization_code' });
  write(TOKEN, { access_token: j.access_token, refresh_token: j.refresh_token, expiry: Date.now() + (j.expires_in - 60) * 1000 });
}
async function accessToken() {
  const t = read(TOKEN), c = read(CLIENT);
  if (!t || !c) throw new Error('YouTube is not connected.');
  if (t.expiry > Date.now()) return t.access_token;
  if (!t.refresh_token) throw new Error('YouTube login expired — please reconnect.');
  const j = await tokenRequest({ refresh_token: t.refresh_token, client_id: c.clientId, client_secret: c.clientSecret, grant_type: 'refresh_token' });
  t.access_token = j.access_token; t.expiry = Date.now() + (j.expires_in - 60) * 1000; write(TOKEN, t);
  return t.access_token;
}
async function api(url, opts = {}) {
  const r = await fetch(url, Object.assign({}, opts, { headers: Object.assign({ Authorization: 'Bearer ' + (await accessToken()) }, opts.headers || {}) }));
  const txt = await r.text(); let j = null; try { j = JSON.parse(txt); } catch (e) {}
  if (!r.ok) { const err = new Error('YouTube API ' + r.status + ': ' + ((j && j.error && j.error.message) || txt.slice(0, 200))); err.reason = j && j.error && j.error.errors && j.error.errors[0] && j.error.errors[0].reason; throw err; }
  return { r, j };
}

let channelCache = null;
async function status() {
  const out = { hasClient: !!read(CLIENT), connected: !!read(TOKEN), channel: null };
  if (out.connected) {
    try {
      if (!channelCache) { const { j } = await api('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true'); channelCache = j.items && j.items[0] ? { id: j.items[0].id, title: j.items[0].snippet.title } : null; }
      out.channel = channelCache;
    } catch (e) { out.error = e.message; }
  }
  return out;
}

// meta: { title, description, tags[], categoryId, privacyStatus, publishAt(ISO)|null, madeForKids }
async function upload(file, meta) {
  const size = fs.statSync(file).size;
  const body = {
    snippet: { title: meta.title.slice(0, 100), description: (meta.description || '').slice(0, 4900), tags: meta.tags || [], categoryId: String(meta.categoryId || '1'), defaultLanguage: 'en', defaultAudioLanguage: 'en' },
    status: { privacyStatus: meta.publishAt ? 'private' : meta.privacyStatus || 'public', selfDeclaredMadeForKids: meta.madeForKids !== false, embeddable: true },
  };
  if (meta.publishAt) body.status.publishAt = meta.publishAt;
  const { r } = await api('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Length': String(size), 'X-Upload-Content-Type': 'video/mp4' }, body: JSON.stringify(body),
  });
  const loc = r.headers.get('location'); if (!loc) throw new Error('YouTube did not return an upload URL.');
  const { j } = await api(loc, { method: 'PUT', headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(size) }, body: fs.readFileSync(file) });
  return j.id;
}
async function setThumbnail(videoId, jpg) {
  await api('https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=' + encodeURIComponent(videoId), { method: 'POST', headers: { 'Content-Type': 'image/jpeg' }, body: fs.readFileSync(jpg) });
}

module.exports = { setClient, disconnect, authUrl, handleCallback, status, upload, setThumbnail };
