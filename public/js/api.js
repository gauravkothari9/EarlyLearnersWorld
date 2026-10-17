// Connects the pages to the studio server.
// Served by the server itself (localhost, or headless Chrome on AWS): calls stay same-origin, no login.
// Served by Vercel: calls go to window.STUDIO_API (see config.js) with the admin key, which is asked once
// and kept in this browser.
(function () {
  const here = location.origin;
  const remote = (window.STUDIO_API || '').replace(/\/+$/, '');
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const BASE = !remote || local || remote === here ? '' : remote;
  const KEY_NAME = 'studio-key';
  const getKey = () => { try { return localStorage.getItem(KEY_NAME) || ''; } catch (e) { return ''; } };
  const isServerPath = (u) => typeof u === 'string' && /^\/(api|output)\//.test(u);

  // Full URL for links and media (<a href>, <video src>): adds the key as a query value.
  window.studioUrl = (path) => {
    if (!BASE || !isServerPath(path)) return path;
    const k = getKey();
    return BASE + path + (k ? (path.includes('?') ? '&' : '?') + 'key=' + encodeURIComponent(k) : '');
  };

  if (!BASE) return;
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (url, opts = {}) => {
    if (!isServerPath(url)) return nativeFetch(url, opts);
    const headers = new Headers(opts.headers || {});
    const k = getKey();
    if (k) headers.set('Authorization', 'Bearer ' + k);
    const r = await nativeFetch(BASE + url, Object.assign({}, opts, { headers }));
    if (r.status === 401) showLogin();
    return r;
  };

  let shown = false;
  function showLogin() {
    if (shown) return; shown = true;
    const draw = () => {
      const box = document.createElement('div');
      box.style.cssText = 'position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:rgba(20,24,40,.75);font:15px Nunito,system-ui,sans-serif';
      box.innerHTML = '<form style="background:#fff;color:#222;padding:24px;border-radius:14px;width:min(320px,90vw);box-shadow:0 10px 40px rgba(0,0,0,.3)">'
        + '<div style="font:700 20px Fredoka,sans-serif;margin-bottom:12px">Studio login</div>'
        + '<input type="password" placeholder="Admin password" autocomplete="current-password" style="width:100%;box-sizing:border-box;padding:10px;border:1px solid #ccc;border-radius:8px;font:inherit">'
        + '<button style="margin-top:12px;width:100%;padding:10px;border:0;border-radius:8px;background:#ff7a3d;color:#fff;font:700 15px Nunito,sans-serif;cursor:pointer">Log in</button>'
        + '<div class="msg" style="margin-top:8px;font-size:13px;color:#c33"></div></form>';
      const form = box.querySelector('form'), input = box.querySelector('input'), msg = box.querySelector('.msg');
      form.onsubmit = async (e) => {
        e.preventDefault();
        const r = await nativeFetch(BASE + '/api/ping', { headers: { Authorization: 'Bearer ' + input.value } }).catch(() => null);
        if (r && r.ok) { try { localStorage.setItem(KEY_NAME, input.value); } catch (err) {} location.reload(); }
        else msg.textContent = r ? 'Wrong password.' : 'Server not reachable.';
      };
      document.body.appendChild(box);
      input.focus();
    };
    document.body ? draw() : document.addEventListener('DOMContentLoaded', draw);
  }
  window.studioLogout = () => { try { localStorage.removeItem(KEY_NAME); } catch (e) {} location.reload(); };
})();
