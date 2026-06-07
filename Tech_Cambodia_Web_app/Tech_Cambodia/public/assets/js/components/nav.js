
// ICB Academic System — Navigation & App Bootstrap  

let currentPage = '';

function nav(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el =>
    el.classList.toggle('active', el.dataset.page === page)
  );
  closeProfileDrop();
  const fn = pages[page];
  if (fn) fn();
  else document.getElementById('page-content').innerHTML =
    `<div class="empty"><i class="fas fa-construction"></i><p>Page "${page}" coming soon</p></div>`;
}

async function init() {
  // Restore theme preference
  const saved = localStorage.getItem('itc_theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('themeBtn').querySelector('i').className =
      saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  const r = await get('me');
  if (!r.ok) { window.location.href = 'login.php'; return; }
  currentUser = r.data;
  document.getElementById('userName').textContent = r.data.full_name;
  document.getElementById('userRole').textContent = r.data.role;
  document.getElementById('avatarEl').textContent = (r.data.full_name || '?')[0].toUpperCase();
  loadBadges();
  nav('dashboard');
}

async function loadBadges() {
  const r = await get('stats');
  if (!r.ok) return;
  const d = r.data;
  if (d.pending_verify > 0) {
    const b = document.getElementById('admBadge');
    b.textContent = d.pending_verify; b.style.display = '';
  }
  if (d.unfinalized > 0) {
    const b = document.getElementById('gradeBadge');
    b.textContent = d.unfinalized; b.style.display = '';
  }
  if (d.at_risk > 0) {
    const nb = document.getElementById('notifBadge');
    nb.textContent = d.at_risk; nb.style.display = '';
  }
}

async function doLogout() {
  await post('logout');
  localStorage.removeItem('csrf_token');
  window.location.href = 'login.php';
}

// ── Dark Mode ─────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.getAttribute('data-theme') === 'dark';
  const next = isDark ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('itc_theme', next);
  document.getElementById('themeBtn').querySelector('i').className =
    next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ── Profile Dropdown ──────────────────────────────────────
function toggleProfileDrop() {
  document.getElementById('profileDrop').classList.toggle('show');
}
function closeProfileDrop() {
  document.getElementById('profileDrop').classList.remove('show');
}
document.addEventListener('click', e => {
  const drop = document.getElementById('profileDrop');
  if (!e.target.closest('.tb-user') && !e.target.closest('.profile-drop')) {
    drop.classList.remove('show');
  }
});

// ── Change Password ───────────────────────────────────────
function openChangePassword() {
  openModal('Change Password', 'Enter your current and new password',
    `<div class="fg"><label>Current Password</label><input id="cp_old" type="password" placeholder="Current password"></div>
     <div class="fg"><label>New Password</label><input id="cp_new" type="password" placeholder="At least 8 characters"></div>
     <div class="fg"><label>Confirm New Password</label><input id="cp_confirm" type="password" placeholder="Repeat new password"></div>`,
    async () => {
      const old_password = val('cp_old');
      const new_password = val('cp_new');
      const confirm = val('cp_confirm');
      if (!old_password || !new_password) { toast('All fields required', 'err'); return; }
      if (new_password.length < 8) { toast('New password must be at least 8 characters', 'err'); return; }
      if (new_password !== confirm) { toast('Passwords do not match', 'err'); return; }
      const r = await post('change_password', { old_password, new_password });
      if (r.ok) { toast('Password changed successfully'); closeModal(); }
      else toast(r.error, 'err');
    }, 'Update Password');
}

// ── Keyboard Shortcut: Ctrl+K → focus search ─────────────
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    const s = document.getElementById('gSearch');
    s.focus(); s.select();
  }
  if (e.key === 'Escape') {
    closeModal(); closeConfirm(); closeProfileDrop();
    document.getElementById('searchDrop').style.display = 'none';
  }
});

// Boot
init();
