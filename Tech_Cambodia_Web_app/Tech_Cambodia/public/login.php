<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title> Academic System — Sign In</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="assets/css/variables.css">
<style>
/* ── LOGO LINK ── */
.logo-link{text-decoration:none;display:flex;align-items:center;gap:.75rem;}
.logo-link:hover .logo-circle{transform:scale(1.06);box-shadow:0 0 0 3px rgba(255,255,255,.25);}
.logo-circle{transition:transform .2s,box-shadow .2s;}
.ams-visit{display:inline-flex;align-items:center;gap:.45rem;font-size:.72rem;color:var(--log-muted,#94A3B8);text-decoration:none;border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:.3rem .75rem;transition:all .2s;margin-top:1.2rem;}
.ams-visit:hover{color:#fff;border-color:rgba(255,255,255,.35);background:rgba(255,255,255,.06);}
.card-footer-link{margin-top:1.2rem;text-align:center;font-size:.75rem;color:var(--log-muted,#94A3B8);}
.card-footer-link a{color:inherit;text-decoration:underline;text-underline-offset:3px;opacity:.75;}
.card-footer-link a:hover{opacity:1;}

/* ── TOP NAVIGATION BAR ── */
.top-nav{
  position:fixed;top:0;left:0;right:0;z-index:200;
  display:flex;align-items:center;justify-content:space-between;
  padding:0 2.5rem;height:58px;
  background:rgba(2,6,23,.82);
  backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
  border-bottom:1px solid rgba(255,255,255,.08);
  box-shadow:0 4px 32px rgba(0,0,0,.4);
}
.top-nav .nav-brand{
  display:flex;align-items:center;gap:.65rem;text-decoration:none;
}
.top-nav .nav-logo{
  width:32px;height:32px;border-radius:8px;
  background:linear-gradient(135deg,#6366f1,#4f46e5);
  display:flex;align-items:center;justify-content:center;
  font-size:.7rem;font-weight:800;color:#fff;letter-spacing:.03em;
  box-shadow:0 0 12px rgba(99,102,241,.45);
}
.top-nav .nav-brand-text{
  font-family:'DM Sans',sans-serif;font-size:.85rem;
  font-weight:600;color:#e2e8f0;letter-spacing:.01em;
}
.top-nav .nav-links{
  display:flex;align-items:center;gap:.25rem;list-style:none;margin:0;padding:0;
}
.top-nav .nav-links li a,
.top-nav .nav-links li button.nav-btn{
  display:flex;align-items:center;gap:.45rem;
  padding:.42rem 1rem;border-radius:8px;
  font-size:.82rem;font-weight:500;color:#94a3b8;
  text-decoration:none;letter-spacing:.01em;
  border:1px solid transparent;
  background:transparent;
  cursor:pointer;font-family:inherit;
  transition:all .2s;
}
.top-nav .nav-links li a:hover,
.top-nav .nav-links li button.nav-btn:hover{
  color:#fff;background:rgba(99,102,241,.14);
  border-color:rgba(99,102,241,.3);
}
.top-nav .nav-links li a.active{
  color:#a5b4fc;background:rgba(99,102,241,.18);
  border-color:rgba(99,102,241,.35);
}

/* ── LOGIN NAV BUTTON (pill CTA style) ── */
.top-nav .nav-links li button.nav-login-btn{
  display:flex;align-items:center;gap:.5rem;
  padding:.38rem 1.1rem;border-radius:9px;
  font-size:.82rem;font-weight:600;
  color:#fff;letter-spacing:.02em;
  background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);
  border:1px solid rgba(99,102,241,.6);
  box-shadow:0 0 14px rgba(99,102,241,.35);
  cursor:pointer;font-family:inherit;
  transition:all .22s cubic-bezier(.16,1,.3,1);
}
.top-nav .nav-links li button.nav-login-btn:hover{
  background:linear-gradient(135deg,#818cf8 0%,#6366f1 100%);
  box-shadow:0 0 22px rgba(99,102,241,.55);
  transform:translateY(-1px);
}
.top-nav .nav-links li button.nav-login-btn:active{transform:translateY(0);box-shadow:none;}
.top-nav .nav-links li button.nav-login-btn i{font-size:.72rem;}
.top-nav .nav-links li a i{font-size:.72rem;opacity:.8;}

/* ── MODAL OVERLAY ── */
.modal-overlay{
  position:fixed;inset:0;z-index:999;
  background:rgba(2,4,18,.75);
  backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);
  display:flex;align-items:center;justify-content:center;
  padding:1rem;
  opacity:0;pointer-events:none;
  transition:opacity .28s cubic-bezier(.16,1,.3,1);
}
.modal-overlay.open{opacity:1;pointer-events:all;}

/* ── MODAL CARD ── */
.modal-card{
  background:rgba(15,20,45,.96);
  border:1px solid rgba(99,102,241,.25);
  border-radius:24px;
  padding:2.25rem 2.25rem 1.75rem;
  width:100%;max-width:420px;
  position:relative;
  box-shadow:0 24px 80px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.04);
  transform:translateY(28px) scale(.97);
  transition:transform .32s cubic-bezier(.16,1,.3,1),opacity .28s;
  opacity:0;
}
.modal-overlay.open .modal-card{
  transform:translateY(0) scale(1);
  opacity:1;
}

/* ── MODAL CLOSE ── */
.modal-close{
  position:absolute;top:1.1rem;right:1.1rem;
  width:30px;height:30px;border-radius:8px;
  background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
  color:#94a3b8;font-size:.8rem;
  display:flex;align-items:center;justify-content:center;
  cursor:pointer;transition:all .18s;
}
.modal-close:hover{background:rgba(239,68,68,.12);border-color:rgba(239,68,68,.3);color:#fca5a5;}

/* ── CARD HEAD ── */
.modal-card .card-head{margin-bottom:1.5rem;}
.modal-card .chip{
  display:inline-flex;align-items:center;gap:.4rem;
  font-size:.72rem;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
  color:#a5b4fc;background:rgba(99,102,241,.14);
  border:1px solid rgba(99,102,241,.28);border-radius:20px;
  padding:.28rem .8rem;margin-bottom:.85rem;
}
.modal-card h2{
  font-family:'DM Serif Display',Georgia,serif;
  font-size:1.65rem;font-weight:400;
  color:#f1f5f9;letter-spacing:-.01em;
  margin-bottom:.35rem;line-height:1.22;
}
.modal-card .card-head p{font-size:.88rem;color:#94a3b8;}

/* ── ALERTS ── */
.alert{
  display:none;align-items:center;gap:.65rem;
  padding:.7rem 1rem;border-radius:10px;margin-bottom:1rem;
  font-size:.82rem;font-weight:500;
}
.alert.show{display:flex;}
.alert-err{background:rgba(239,68,68,.12);border:1px solid rgba(239,68,68,.3);color:#fca5a5;}
.alert-warn{background:rgba(245,158,11,.1);border:1px solid rgba(245,158,11,.28);color:#fcd34d;}

/* ── FORM FIELDS ── */
.field{margin-bottom:1rem;}
.field label{display:block;font-size:.78rem;font-weight:600;color:#94a3b8;margin-bottom:.45rem;letter-spacing:.04em;text-transform:uppercase;}
.inp-wrap{position:relative;display:flex;align-items:center;}
.inp-wrap .pre{position:absolute;left:.85rem;font-size:.75rem;color:#64748b;pointer-events:none;z-index:1;}
.inp-wrap input{
  width:100%;padding:.7rem .85rem .7rem 2.5rem;
  background:rgba(255,255,255,.05);
  border:1px solid rgba(255,255,255,.1);
  border-radius:11px;font-size:.9rem;color:#f1f5f9;
  font-family:inherit;outline:none;
  transition:border-color .2s,box-shadow .2s,background .2s;
}
.inp-wrap input::placeholder{color:#475569;}
.inp-wrap input:focus{
  background:rgba(99,102,241,.07);
  border-color:rgba(99,102,241,.55);
  box-shadow:0 0 0 3px rgba(99,102,241,.15);
}
.eye{
  position:absolute;right:.75rem;background:none;border:none;
  color:#64748b;cursor:pointer;padding:.25rem;
  font-size:.82rem;transition:color .15s;
}
.eye:hover{color:#94a3b8;}

/* ── SIGN IN BUTTON ── */
.btn-primary{
  width:100%;padding:.78rem;border-radius:12px;
  background:linear-gradient(135deg,#6366f1 0%,#4f46e5 100%);
  color:#fff;font-size:.9rem;font-weight:600;
  border:none;cursor:pointer;font-family:inherit;
  display:flex;align-items:center;justify-content:center;gap:.55rem;
  margin-top:.25rem;margin-bottom:1.2rem;
  box-shadow:0 4px 20px rgba(99,102,241,.4);
  transition:all .22s cubic-bezier(.16,1,.3,1);
}
.btn-primary:hover:not(:disabled){
  background:linear-gradient(135deg,#818cf8 0%,#6366f1 100%);
  box-shadow:0 6px 28px rgba(99,102,241,.55);
  transform:translateY(-1px);
}
.btn-primary:active:not(:disabled){transform:translateY(0);}
.btn-primary:disabled{opacity:.55;cursor:not-allowed;}
.btn-primary.success{background:linear-gradient(135deg,#22c55e,#16a34a);box-shadow:0 4px 20px rgba(34,197,94,.35);}

/* ── QUICK FILL CREDS ── */
.creds{border-top:1px solid rgba(255,255,255,.07);padding-top:1rem;}
.creds-title{font-size:.72rem;color:#64748b;margin-bottom:.6rem;display:flex;align-items:center;gap:.4rem;}
.cred{
  display:flex;align-items:center;justify-content:space-between;
  padding:.55rem .75rem;border-radius:9px;
  border:1px solid rgba(255,255,255,.06);
  background:rgba(255,255,255,.03);
  cursor:pointer;margin-bottom:.4rem;
  transition:all .18s;
}
.cred:hover{background:rgba(99,102,241,.1);border-color:rgba(99,102,241,.25);}
.cred-role{font-size:.8rem;font-weight:500;color:#cbd5e1;}
.cred-badge{font-size:.73rem;font-family:'Courier New',monospace;color:#818cf8;background:rgba(99,102,241,.12);padding:.18rem .55rem;border-radius:6px;border:1px solid rgba(99,102,241,.2);}

@keyframes modalShake{0%,100%{transform:translateX(0) scale(1)}20%{transform:translateX(-8px) scale(1)}40%{transform:translateX(7px) scale(1)}60%{transform:translateX(-5px) scale(1)}80%{transform:translateX(4px) scale(1)}}
.modal-card.shake{animation:modalShake .38s ease;}

@media(max-width:900px){
  .top-nav{padding:0 1.2rem;}
  .top-nav .nav-brand-text{display:none;}
  .top-nav .nav-links li a span,
  .top-nav .nav-links li button.nav-btn span{display:none;}
  .top-nav .nav-links li a{padding:.42rem .7rem;}
  .top-nav .nav-links li button.nav-login-btn span{display:inline;}
}
@media(max-width:560px){
  .modal-card{padding:1.75rem 1.25rem 1.4rem;}
  .modal-card h2{font-size:1.4rem;}
  .top-nav .nav-links li button.nav-login-btn{padding:.34rem .8rem;}
  .top-nav .nav-links li button.nav-login-btn span{font-size:.78rem;}
}
</style>
</head>
<body>

<!-- TOP NAV -->
<nav class="top-nav">
  <a href="index.php" class="nav-brand">
    <div class="nav-logo">ITC</div>
    <span class="nav-brand-text">ITC Academic System</span>
  </a>
  <ul class="nav-links">
    <li>
      <a href="index.php" class="active">
        <i class="fas fa-house"></i><span>Home</span>
      </a>
    </li>
    <li>
      <a href="assets/css/eLearning/index.html" target="_blank">
        <i class="fas fa-graduation-cap"></i><span>eLearning</span>
      </a>
    </li>
    <li>
      <button class="nav-login-btn" onclick="openLogin()" aria-haspopup="dialog" aria-controls="loginModal">
        <i class="fas fa-right-to-bracket"></i><span>Login</span>
      </button>
    </li>
    <li><a href="about.php"><i class="fas fa-circle-info"></i><span>About</span></a></li>
    <li><a href="instructor.php"><i class="fas fa-chalkboard-user"></i><span>Instructor</span></a></li>
    <li><a href="contact.php"><i class="fas fa-envelope"></i><span>Contact</span></a></li>
    <li><a href="news.php"><i class="fas fa-newspaper"></i><span>News &amp; Events</span></a></li>
  </ul>
</nav>

<!-- HERO -->
<div class="shell" style="padding-top:58px;min-height:100vh;">
  <div class="left" style="flex:1;padding:5rem 8% 5rem 10%;">
    <div class="geo"></div><div class="geo2"></div>
    <div class="logo-row">
      <a href="index.php" class="logo-link">
        <div class="logo-circle">ITC</div>
        <div class="logo-text"><strong>Institute of Technology</strong>of Cambodia</div>
      </a>
    </div>
    <div class="hero">
      <div class="hero-sup">Academic Management</div>
      <h1>One Platform.<br>Every <em>Student Journey.</em></h1>
      <p class="hero-desc">Manage admissions, courses, grades, GPA and official transcripts with ICB's integrated academic portal — built for Cambodia's premier engineering institution.</p>
      <a class="ams-visit" href="ams.php"><i class="fas fa-external-link-alt" style="font-size:.65rem"></i> Visit ITC Academic Portal (AMS)</a>
      <a class="ams-visit" href="assets/css/eLearning/index.html" style="margin-top:.5rem"><i class="fas fa-graduation-cap" style="font-size:.65rem"></i> Visit eLearning Portal</a>
    </div>
    <div class="pillars">
      <div class="pillar"><div class="pillar-icon"><i class="fas fa-users-gear"></i></div><div><div class="pillar-label">Student Lifecycle</div><div class="pillar-sub">Admission → Enrollment → Graduation</div></div></div>
      <div class="pillar"><div class="pillar-icon"><i class="fas fa-chart-line"></i></div><div><div class="pillar-label">GPA & Academic Standing</div><div class="pillar-sub">Real-time CGPA with ITC grading scale</div></div></div>
      <div class="pillar"><div class="pillar-icon"><i class="fas fa-scroll"></i></div><div><div class="pillar-label">Official Transcripts</div><div class="pillar-sub">Registrar-controlled finalized grades</div></div></div>
      <div class="pillar"><div class="pillar-icon"><i class="fas fa-shield-halved"></i></div><div><div class="pillar-label">Role-Based Access</div><div class="pillar-sub">Admin, Registrar, Lecturer, Staff</div></div></div>
    </div>
  </div>
</div>

<!-- LOGIN MODAL -->
<div class="modal-overlay" id="loginModal" role="dialog" aria-modal="true" aria-label="Sign in" onclick="overlayClose(event)">
  <div class="modal-card" id="card">
    <button class="modal-close" onclick="closeLogin()" aria-label="Close login"><i class="fas fa-xmark"></i></button>
    <div class="card-head">
      <div class="chip"><i class="fas fa-lock"></i>&nbsp;Secure Portal</div>
      <h2>Welcome back</h2>
      <p>Sign in to your academic account</p>
    </div>
    <div class="alert alert-err" id="err"><i class="fas fa-triangle-exclamation"></i><span id="err-msg">Invalid credentials</span></div>
    <div class="alert alert-warn" id="warn-timeout"><i class="fas fa-clock"></i><span>Your session expired. Please sign in again.</span></div>
    <div class="field">
      <label>Username or Email</label>
      <div class="inp-wrap">
        <i class="fas fa-user pre"></i>
        <input type="text" id="username" placeholder="admin" autocomplete="username">
      </div>
    </div>
    <div class="field">
      <label>Password</label>
      <div class="inp-wrap">
        <i class="fas fa-lock pre"></i>
        <input type="password" id="password" placeholder="••••••••" autocomplete="current-password">
        <button class="eye" onclick="togglePw(this)" type="button" tabindex="-1"><i class="fas fa-eye"></i></button>
      </div>
    </div>
    <button class="btn-primary" id="btn" onclick="doLogin()">
      <i class="fas fa-right-to-bracket"></i> Sign In
    </button>
    <div class="creds">
      <div class="creds-title"><i class="fas fa-circle-info"></i> Default accounts — click to fill</div>
      <div class="cred" onclick="fill('admin','Admin@123')">
        <span class="cred-role"><i class="fas fa-user-shield" style="color:#818cf8;margin-right:.4rem;font-size:.75rem"></i>Administrator</span>
        <span class="cred-badge">admin</span>
      </div>
      <div class="cred" onclick="fill('registrar','Admin@123')">
        <span class="cred-role"><i class="fas fa-clipboard-user" style="color:#34d399;margin-right:.4rem;font-size:.75rem"></i>Registrar</span>
        <span class="cred-badge">registrar</span>
      </div>
      <div class="cred" onclick="fill('lecturer1','Admin@123')">
        <span class="cred-role"><i class="fas fa-chalkboard-user" style="color:#fb923c;margin-right:.4rem;font-size:.75rem"></i>Lecturer</span>
        <span class="cred-badge">lecturer1</span>
      </div>
      <div class="cred" onclick="fill('staff1','Admin@123')">
        <span class="cred-role"><i class="fas fa-id-badge" style="color:#c084fc;margin-right:.4rem;font-size:.75rem"></i>Staff</span>
        <span class="cred-badge">staff1</span>
      </div>
      <div class="card-footer-link">
        Not a system user? <a href="">Visit IBC Portal</a>
      </div>
    </div>
  </div>
</div>

<script>
function openLogin(){
  const m=document.getElementById('loginModal');
  m.classList.add('open');
  document.body.style.overflow='hidden';
  setTimeout(()=>{const u=document.getElementById('username');if(u)u.focus();},320);
}
function closeLogin(){
  document.getElementById('loginModal').classList.remove('open');
  document.body.style.overflow='';
}
function overlayClose(e){if(e.target===document.getElementById('loginModal'))closeLogin();}
document.addEventListener('DOMContentLoaded', openLogin);
if(new URLSearchParams(location.search).get('timeout')==='1'){
  document.addEventListener('DOMContentLoaded',()=>{document.getElementById('warn-timeout').classList.add('show');});
}
['username','password'].forEach(id=>{
  const el=document.getElementById(id);
  if(!el)return;
  el.addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});
  el.addEventListener('input',()=>{document.getElementById('err').classList.remove('show');document.getElementById('warn-timeout').classList.remove('show');});
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeLogin();});
function togglePw(btn){const inp=btn.closest('.inp-wrap').querySelector('input');const show=inp.type==='password';inp.type=show?'text':'password';btn.querySelector('i').className=show?'fas fa-eye-slash':'fas fa-eye';}
function fill(u,p){document.getElementById('username').value=u;document.getElementById('password').value=p;document.getElementById('err').classList.remove('show');document.getElementById('username').focus();}
async function doLogin(){
  const btn=document.getElementById('btn');
  const u=document.getElementById('username').value.trim();
  const pw=document.getElementById('password').value;
  if(!u||!pw){showErr('Please enter your username and password');return;}
  btn.innerHTML='<i class="fas fa-spinner fa-spin"></i> Signing in…';btn.disabled=true;
  try{
    const fd=new FormData();fd.append('action','login');fd.append('username',u);fd.append('password',pw);
    const r=await fetch('api.php',{method:'POST',body:fd});
    const j=await r.json();
    if(j.ok){localStorage.setItem('csrf_token',j.data.csrf_token);btn.classList.add('success');btn.innerHTML='<i class="fas fa-check"></i> Success!';setTimeout(()=>window.location.href='index.php',400);return;}
    else{showErr(j.error||'Invalid credentials. Please try again.');document.getElementById('card').classList.add('shake');setTimeout(()=>document.getElementById('card').classList.remove('shake'),400);}
  }catch(e){showErr('Cannot connect to server. Make sure Apache & MySQL are running.');}
  btn.innerHTML='<i class="fas fa-right-to-bracket"></i> Sign In';btn.disabled=false;
}
function showErr(m){document.getElementById('err-msg').textContent=m;document.getElementById('err').classList.add('show');}
</script>
</body>
</html>
