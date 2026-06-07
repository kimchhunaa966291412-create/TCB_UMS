
//  IBC Academic System — Shared JavaScript Helpers
//  Include this before any page script.

// ── API ───────────────────────────────────────────────────
const API = 'api.php';
let CSRF = localStorage.getItem('csrf_token') || '';
let currentUser = {};

async function api(action, params = {}, method = 'GET') {
  try {
    let url  = API + '?action=' + action;
    let opts = {};
    if (method === 'POST') {
      const fd = new FormData();
      fd.append('action', action);
      if (CSRF) fd.append('csrf_token', CSRF);
      Object.entries(params).forEach(([k, v]) => fd.append(k, v ?? ''));
      opts = { method: 'POST', body: fd };
    } else {
      const q = Object.entries(params).map(([k, v]) => `${k}=${encodeURIComponent(v ?? '')}`).join('&');
      if (q) url += '&' + q;
    }
    const r = await fetch(url, opts);
    const j = await r.json();
    if (!j.ok && j.error === 'Authentication required') window.location.href = 'login.php?timeout=1';
    return j;
  } catch (e) {
    return { ok: false, error: 'Network error' };
  }
}

function post(action, params = {}) { return api(action, params, 'POST'); }
function get(action, params = {})  { return api(action, params, 'GET');  }

// ── Toast ─────────────────────────────────────────────────
function toast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  const d = document.createElement('div');
  d.className = `toast-item toast-${type}`;
  const ico = type === 'ok' ? 'fa-check-circle' : type === 'err' ? 'fa-circle-xmark' : 'fa-info-circle';
  d.innerHTML = `<i class="fas ${ico}"></i>${msg}`;
  t.appendChild(d);
  setTimeout(() => {
    d.style.opacity = '0'; d.style.transform = 'translateX(20px)'; d.style.transition = 'all .3s';
    setTimeout(() => d.remove(), 300);
  }, 3000);
}

// ── Modal ─────────────────────────────────────────────────
let _modalSaveFn = null;

function openModal(title, sub, body, saveFn, saveLabel = 'Save') {
  document.getElementById('modal-title').textContent  = title;
  document.getElementById('modal-sub').textContent    = sub || '';
  document.getElementById('modal-body').innerHTML     = body;
  document.getElementById('modal-save').textContent   = saveLabel;
  document.getElementById('modal-save').style.display = saveFn ? '' : 'none';
  _modalSaveFn = saveFn;
  document.getElementById('overlay').classList.add('show');
}
function closeModal() { document.getElementById('overlay').classList.remove('show'); }
function modalSave()  { if (_modalSaveFn) _modalSaveFn(); }

function confirm2(title, msg, fn, label = 'Delete') {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent   = msg;
  const btn = document.getElementById('confirm-ok');
  btn.textContent = label;
  btn.onclick = () => { closeConfirm(); fn(); };
  document.getElementById('confirm-overlay').classList.add('show');
}
function closeConfirm() { document.getElementById('confirm-overlay').classList.remove('show'); }

// ── Badge Helpers ─────────────────────────────────────────
function gradeBadge(g) {
  const map = { 'A':'a','B':'b','C+':'cp','C':'c','D+':'dp','D':'d','E':'e','F':'f' };
  return `<span class="badge badge-${map[g] || 'f'}">${g}</span>`;
}
function standingBadge(s) {
  const map = { 'Excellent':'excellent','Good Standing':'good','Warning':'warning','Probation':'probation','Suspension Risk':'risk' };
  return `<span class="badge badge-${map[s] || 'good'}">${s}</span>`;
}
function statusBadge(s) {
  const map = { 'Active':'active','Graduated':'graduated','Suspended':'suspended','Withdrawn':'withdrawn','Deferred':'deferred' };
  return `<span class="badge badge-${map[s] || 'active'}">${s}</span>`;
}
function roleBadge(r) { return `<span class="badge badge-${r}">${r}</span>`; }

// ── Formatters ────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function val(id)           { return (document.getElementById(id) || {}).value || ''; }
function emptyState(msg = 'No records found', ico = 'fa-inbox') {
  return `<div class="empty"><i class="fas ${ico}"></i><p>${msg}</p></div>`;
}
function makePage(content) { document.getElementById('page-content').innerHTML = content; }

// ── Pagination ────────────────────────────────────────────
function renderPager(page, pages2, fn) {
  if (pages2 <= 1) return '';
  let btns = `<button class="pager-btn" ${page <= 1 ? 'disabled' : ''} onclick="${fn}(${page - 1})"><i class="fas fa-chevron-left"></i></button>`;
  for (let i = 1; i <= pages2; i++) {
    if (i === 1 || i === pages2 || Math.abs(i - page) <= 1)
      btns += `<button class="pager-btn ${i === page ? 'active' : ''}" onclick="${fn}(${i})">${i}</button>`;
    else if (Math.abs(i - page) === 2)
      btns += `<span style="padding:0 .2rem;color:var(--light);font-size:.8rem">…</span>`;
  }
  btns += `<button class="pager-btn" ${page >= pages2 ? 'disabled' : ''} onclick="${fn}(${page + 1})"><i class="fas fa-chevron-right"></i></button>`;
  return `<div class="pager">${btns}<span class="pager-info">Page ${page} of ${pages2}</span></div>`;
}

// ── Global Search ─────────────────────────────────────────
let _searchTimer;
async function globalSearch(q) {
  const drop = document.getElementById('searchDrop');
  if (!q.trim()) { drop.style.display = 'none'; return; }
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(async () => {
    const r = await get('search', { q });
    if (!r.ok || !r.data.length) { drop.style.display = 'none'; return; }
    drop.innerHTML = r.data.map(x => `
      <div class="s-item" onclick="searchClick('${x.type}',${x.id})">
        <i class="fas ${x.type === 'student' ? 'fa-user' : 'fa-book'}" style="color:var(--sky2);font-size:.75rem"></i>
        <span>${esc(x.name)}</span>
        <span style="font-size:.7rem;color:var(--light)">${esc(x.code)}</span>
        <span class="s-badge" style="background:var(--sky-lt);color:var(--sky2)">${x.type}</span>
      </div>`).join('');
    drop.style.display = 'block';
  }, 280);
}
function searchClick(type, id) {
  document.getElementById('searchDrop').style.display = 'none';
  document.getElementById('gSearch').value = '';
  if (type === 'student') nav('students');
}
