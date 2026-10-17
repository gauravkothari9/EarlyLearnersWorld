(function () {
  const $ = (id) => document.getElementById(id);
  const DAYN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const post = (url, body) => fetch(url, { method: 'POST', body: JSON.stringify(body || {}) }).then(async (r) => { const j = await r.json().catch(() => ({})); if (!r.ok) throw new Error(j.error || r.status); return j; });
  const when = (iso) => (iso ? new Date(iso).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—');
  let loaded = false;

  DAYN.forEach((d, i) => $('sDays').insertAdjacentHTML('beforeend', `<label><input type="checkbox" value="${i}"> ${d}</label>`));

  function fillSettings(s) {
    $('sEnabled').checked = s.enabled; $('sSlots').value = s.slots.join(', '); $('sAhead').value = String(s.daysAhead);
    [...$('sDays').querySelectorAll('input')].forEach((x) => (x.checked = s.days.includes(+x.value)));
    $('sFormat').value = s.format; $('sPrivacy').value = s.privacy; $('sUpload').value = String(s.upload); $('sCategory').value = s.categoryId;
    $('sChannel').value = s.channel; $('sLessons').value = String(s.learningOnly !== false); $('sName').value = s.name; $('sKids').checked = s.madeForKids;
    $('sTitle').value = s.titleTemplate; $('sDesc').value = s.descriptionTemplate; $('sTags').value = s.tags; $('sVoice').value = s.voice;
  }
  function readSettings() {
    const slots = $('sSlots').value.split(',').map((x) => x.trim()).filter((x) => /^\d{1,2}:\d{2}$/.test(x)).map((x) => x.padStart(5, '0'));
    return {
      enabled: $('sEnabled').checked, slots: slots.length ? slots : ['09:00'], daysAhead: +$('sAhead').value,
      days: [...$('sDays').querySelectorAll('input')].filter((x) => x.checked).map((x) => +x.value),
      format: $('sFormat').value, privacy: $('sPrivacy').value, upload: $('sUpload').value === 'true', categoryId: $('sCategory').value,
      channel: $('sChannel').value || 'EarlyLearnersWorld', learningOnly: $('sLessons').value === 'true', madeForKids: $('sKids').checked,
      titleTemplate: $('sTitle').value, descriptionTemplate: $('sDesc').value, tags: $('sTags').value, voice: $('sVoice').value,
    };
  }

  async function refresh() {
    let st;
    try { st = await (await fetch('/api/autopilot/status')).json(); } catch (e) { $('busyBadge').textContent = 'server offline'; $('busyBadge').className = 'badge warn'; return; }
    if (!loaded) { fillSettings(st.settings); loaded = true; }
    const y = st.youtube;
    $('ytStatus').innerHTML = y.connected ? `✅ Connected${y.channel ? ` to <b>${esc(y.channel.title)}</b>` : ''}${y.error ? ` <span class="pill failed">${esc(y.error)}</span>` : ''}` : y.hasClient ? 'Credentials saved, not connected yet.' : 'Not connected.';
    $('ytSetup').style.display = y.connected ? 'none' : ''; $('ytConnected').style.display = y.connected ? '' : 'none';
    $('busyBadge').textContent = st.busy ? 'working: ' + (st.current || '…') : st.settings.enabled ? 'autopilot on' : 'idle';
    $('busyBadge').className = 'badge ' + (st.busy ? 'warn' : st.settings.enabled ? 'ok' : '');
    $('slots').innerHTML = st.slots.length ? st.slots.map((s) => `<div class="slot"><span>${when(s.at)}</span><span>${s.entry ? `<span class="pill ${s.entry.status}">${s.entry.status}</span> ${esc(s.entry.styleName)}` : '<span class="muted">open</span>'}</span></div>`).join('') : '<p class="muted">No slots in the planning window.</p>';
    $('totals').textContent = `· ${st.totals.all} made, ${st.totals.published} on YouTube`;
    $('hist').innerHTML = st.history.map((h) => `<tr><td>${when(h.createdAt)}</td><td>${esc(h.styleName || h.styleId)}</td><td class="mono2">#${h.seed}</td><td>${esc(h.name || '')}</td><td><span class="pill ${h.status}">${h.status}</span>${h.error ? `<div class="muted">${esc(h.error.slice(0, 140))}</div>` : ''}</td><td>${when(h.publishAt)}</td><td>${(h.files || []).map((f) => `<a href="/output/${encodeURIComponent(f)}" target="_blank">${esc(f)}</a>`).join('<br>')}${(h.videos || []).map((v) => `<br><a href="${esc(v.url)}" target="_blank">▶ YouTube (${v.format})</a>`).join('')}</td></tr>`).join('') || '<tr><td colspan="7" class="muted">Nothing yet.</td></tr>';
    $('log').textContent = (st.lastError ? 'Last error: ' + st.lastError + '\n\n' : '') + (st.log.join('\n') || 'No activity yet.');
  }

  $('ytSave').onclick = async () => { try { const r = await post('/api/youtube/client', { json: $('ytJson').value, clientId: $('ytId').value, clientSecret: $('ytSecret').value }); alertBox(`Saved. Redirect used: ${r.redirectUri} ${r.redirectUri.startsWith('https:') ? '(add it to your Web application client in Google Cloud).' : '(Desktop app clients accept it automatically).'}`); refresh(); } catch (e) { alertBox(e.message, true); } };
  $('ytConnect').onclick = () => { location.href = '/api/youtube/connect'; };
  $('ytDisconnect').onclick = async () => { await post('/api/youtube/disconnect'); refresh(); };
  $('sSave').onclick = async () => { try { await post('/api/autopilot/settings', readSettings()); alertBox('Schedule saved.'); refresh(); } catch (e) { alertBox(e.message, true); } };
  $('sEnabled').onchange = async () => { await post('/api/autopilot/settings', { enabled: $('sEnabled').checked }); refresh(); };
  document.querySelectorAll('[data-mode]').forEach((b) => (b.onclick = async () => {
    const mode = b.dataset.mode;
    if (mode === 'now' && !confirm('Render and publish to YouTube right away?')) return;
    try { await post('/api/autopilot/run', { mode, count: +$('runCount').value, format: $('runFormat').value }); alertBox('Started. Rendering takes about 30–60 seconds per video; watch the history below.'); setTimeout(refresh, 800); } catch (e) { alertBox(e.message, true); }
  }));
  function alertBox(msg, err) { const n = $('runMsg'); n.style.display = ''; n.className = 'note' + (err ? ' err' : ''); n.textContent = msg; }

  (async () => {
    try { const v = await (await fetch('/api/voices')).json(); $('sVoice').innerHTML = v.voices.map((x) => `<option value="${esc(x.id)}">${esc(x.label)}</option>`).join(''); } catch (e) {}
    const q = new URLSearchParams(location.search);
    if (q.get('yt') === 'connected') alertBox('YouTube connected!');
    if (q.get('yt') === 'error') alertBox('YouTube connection failed: ' + (q.get('msg') || ''), true);
    await refresh(); setInterval(refresh, 4000);
  })();
})();
