<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Academic System</title>
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' rx='8' fill='%234F46E5'/><text x='50%' y='55%' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='13' font-family='Arial' font-weight='700'>ITC</text></svg>">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<link rel="stylesheet" href="assets/css/variables.css">
<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/layout.css">
<link rel="stylesheet" href="assets/css/components.css">
</head>
<body>

<!-- ── Topbar ─────────────────────────────────────────── -->
<div id="topbar">
  <div class="tb-brand">
    <div class="tb-logo">TCB</div>
    <div class="tb-name">Academic System<small>Tech Cambo</small></div>
  </div>
  <div class="tb-sep"></div>
  <div class="tb-search">
    <i class="fas fa-search si"></i>
    <input type="text" placeholder="Search students, courses… (Ctrl+K)" id="gSearch"
      oninput="globalSearch(this.value)"
      onfocus="if(this.value)document.getElementById('searchDrop').style.display='block'"
      onblur="setTimeout(()=>document.getElementById('searchDrop').style.display='none',200)">
    <div id="searchDrop"></div>
  </div>
  <div class="tb-right">
    <!-- Dark mode toggle -->
    <button class="theme-toggle" title="Toggle dark mode" onclick="toggleTheme()" id="themeBtn">
      <i class="fas fa-moon"></i>
    </button>
    <!-- Notification bell -->
    <button class="tb-btn" title="At-risk students" onclick="nav('gpa')">
      <i class="fas fa-bell"></i>
      <span class="tb-notif" id="notifBadge" style="display:none">0</span>
    </button>
    <!-- Profile dropdown -->
    <div style="position:relative">
      <div class="tb-user" onclick="toggleProfileDrop()" style="cursor:pointer">
        <div class="tb-avatar" id="avatarEl">?</div>
        <div class="tb-user-info">
          <div class="tb-user-name" id="userName">—</div>
          <div class="tb-user-role" id="userRole">—</div>
        </div>
      </div>
      <div class="profile-drop" id="profileDrop">
        <div class="profile-drop-item" onclick="closeProfileDrop();openChangePassword()">
          <i class="fas fa-key"></i> Change Password
        </div>
        <div class="profile-drop-sep"></div>
        <div class="profile-drop-item danger" onclick="closeProfileDrop();doLogout()">
          <i class="fas fa-right-from-bracket"></i> Sign Out
        </div>
      </div>
    </div>
  </div>
</div>

<!-- ── Sidebar ────────────────────────────────────────── -->
<div id="sidebar">
  <div class="nav-section">
    <div class="nav-section-label">Overview</div>
    <div class="nav-item active" onclick="nav('dashboard')" data-page="dashboard"><i class="fas fa-gauge-high"></i> Dashboard</div>
  </div>
  <div class="nav-section">
    <div class="nav-section-label">Academic Structure</div>
    <div class="nav-item" onclick="nav('faculties')"   data-page="faculties">  <i class="fas fa-university"></i>       Faculties</div>
    <div class="nav-item" onclick="nav('departments')" data-page="departments"><i class="fas fa-building-columns"></i> Departments</div>
    <div class="nav-item" onclick="nav('programs')"    data-page="programs">   <i class="fas fa-graduation-cap"></i>  Programs</div>
    <div class="nav-item" onclick="nav('courses')"     data-page="courses">    <i class="fas fa-book"></i>            Courses</div>
    <div class="nav-item" onclick="nav('classrooms')"  data-page="classrooms"> <i class="fas fa-door-open"></i>       Classrooms</div>
    <div class="nav-item" onclick="nav('sections')"    data-page="sections">   <i class="fas fa-chalkboard"></i>      Sections</div>
  </div>
  <div class="nav-section">
    <div class="nav-section-label">Students</div>
    <div class="nav-item" onclick="nav('students')"    data-page="students">   <i class="fas fa-users"></i>           Students</div>
    <div class="nav-item" onclick="nav('admissions')"  data-page="admissions"> <i class="fas fa-file-signature"></i>  Admissions <span class="nav-badge warn" id="admBadge" style="display:none">0</span></div>
    <div class="nav-item" onclick="nav('enrollments')" data-page="enrollments"><i class="fas fa-list-check"></i>      Enrollments</div>
  </div>
  <div class="nav-section">
    <div class="nav-section-label">Academics</div>
    <div class="nav-item" onclick="nav('examinations')" data-page="examinations"><i class="fas fa-pencil"></i>           Examinations</div>
    <div class="nav-item" onclick="nav('results')"      data-page="results">     <i class="fas fa-star-half-stroke"></i> Exam Results</div>
    <div class="nav-item" onclick="nav('grades')"       data-page="grades">      <i class="fas fa-ranking-star"></i>     Final Grades <span class="nav-badge" id="gradeBadge" style="display:none">0</span></div>
    <div class="nav-item" onclick="nav('gpa')"          data-page="gpa">         <i class="fas fa-chart-line"></i>       GPA Records</div>
    <div class="nav-item" onclick="nav('transcript')"   data-page="transcript">  <i class="fas fa-scroll"></i>           Transcript</div>
    <div class="nav-item" onclick="nav('attendance')"   data-page="attendance">  <i class="fas fa-calendar-check"></i>   Attendance</div>
  </div>
  <div class="nav-section">
    <div class="nav-section-label">Administration</div>
    <div class="nav-item" onclick="nav('users')"   data-page="users">  <i class="fas fa-user-gear"></i>     System Users</div>
    <div class="nav-item" onclick="nav('reports')" data-page="reports"><i class="fas fa-chart-pie"></i>      Reports</div>
    <div class="nav-item" onclick="nav('audit')"   data-page="audit">  <i class="fas fa-clipboard-list"></i> Audit Log</div>
  </div>
  <div class="sidebar-footer">
    <div class="nav-item" onclick="doLogout()"><i class="fas fa-right-from-bracket"></i> Sign Out</div>
  </div>
</div>

<!-- ── Main ───────────────────────────────────────────── -->
<div id="main">
  <div id="page-content">
    <div class="empty"><div class="spin" style="margin:0 auto 1rem"></div><p>Loading…</p></div>
  </div>
</div>

<!-- ── Modal ─────────────────────────────────────────── -->
<div class="overlay" id="overlay" onclick="if(event.target===this)closeModal()">
  <div class="modal" id="modal">
    <div class="modal-hdr">
      <div>
        <h3 id="modal-title">Title</h3>
        <div class="modal-hdr-sub" id="modal-sub"></div>
      </div>
      <button class="modal-close" onclick="closeModal()"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="modal-body" id="modal-body"></div>
    <div class="modal-footer" id="modal-footer">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" id="modal-save" onclick="modalSave()">Save</button>
    </div>
  </div>
</div>

<!-- ── Confirm Dialog ─────────────────────────────────── -->
<div class="overlay" id="confirm-overlay">
  <div class="modal" style="max-width:380px">
    <div class="modal-hdr">
      <div><h3 id="confirm-title">Confirm</h3></div>
      <button class="modal-close" onclick="closeConfirm()"><i class="fas fa-xmark"></i></button>
    </div>
    <div class="modal-body">
      <p id="confirm-msg" style="font-size:.88rem;color:var(--text);line-height:1.6"></p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-ghost" onclick="closeConfirm()">Cancel</button>
      <button class="btn btn-danger" id="confirm-ok">Delete</button>
    </div>
  </div>
</div>

<!-- ── Toast ──────────────────────────────────────────── -->
<div id="toast"></div>

<!-- ── Scripts ────────────────────────────────────────── -->
<script src="assets/js/components/helpers.js"></script>
<script>const pages = {};</script>
<script src="assets/js/pages/dashboard.js"></script>
<script src="assets/js/pages/faculties.js"></script>
<script src="assets/js/pages/departments.js"></script>
<script src="assets/js/pages/programs.js"></script>
<script src="assets/js/pages/classrooms.js"></script>
<script src="assets/js/pages/courses.js"></script>
<script src="assets/js/pages/sections.js"></script>
<script src="assets/js/pages/students.js"></script>
<script src="assets/js/pages/admissions.js"></script>
<script src="assets/js/pages/enrollments.js"></script>
<script src="assets/js/pages/examinations.js"></script>
<script src="assets/js/pages/exam_results.js"></script>
<script src="assets/js/pages/final_grades.js"></script>
<script src="assets/js/pages/gpa_records.js"></script>
<script src="assets/js/pages/transcript.js"></script>
<script src="assets/js/pages/users.js"></script>
<script src="assets/js/pages/reports.js"></script>
<script src="assets/js/pages/audit.js"></script>
<script src="assets/js/pages/attendance.js"></script>
<script src="assets/js/components/nav.js"></script>
</body>
</html>
