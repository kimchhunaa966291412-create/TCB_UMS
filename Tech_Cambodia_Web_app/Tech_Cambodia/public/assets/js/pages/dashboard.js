
//  ITC — Dashboard Page  

pages.dashboard = async function () {
  makePage(`<div class="empty"><div class="spin" style="margin:0 auto .8rem"></div><p>Loading dashboard…</p></div>`);

  const [sr, gr, ar, rr] = await Promise.all([
    get('stats'), get('grade_dist'), get('at_risk_list'), get('recent_activity')
  ]);
  if (!sr.ok) { makePage(emptyState('Failed to load stats')); return; }

  const s = sr.data;
  const gradeColors = {
    'A':'#10B981','B':'#3B82F6','C+':'#6366F1','C':'#8B5CF6',
    'D+':'#F59E0B','D':'#EF4444','E':'#DC2626','F':'#991B1B'
  };
  const maxGrade = gr.ok && gr.data.length ? Math.max(...gr.data.map(x => +x.cnt), 1) : 1;
  const totalGrades = gr.ok ? gr.data.reduce((a, x) => a + +x.cnt, 0) : 0;

  makePage(`
  <div class="page-hdr">
    <div>
      <h2>Dashboard</h2>
      <div class="page-hdr-sub">Welcome back, ${esc(currentUser.full_name)} &nbsp;·&nbsp; ${new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</div>
    </div>
    <div class="page-hdr-actions">
      <button class="btn btn-ghost btn-sm" onclick="loadBadges();pages.dashboard()"><i class="fas fa-rotate-right"></i> Refresh</button>
    </div>
  </div>

  <!-- Stat Cards -->
  <div class="stat-grid">
    <div class="stat-card blue">
      <div class="stat-label">Total Students</div>
      <div class="stat-num">${s.students}</div>
      <div class="stat-sub"><i class="fas fa-circle-check"></i> ${s.active_students} active</div>
      <i class="fas fa-users stat-icon"></i>
    </div>
    <div class="stat-card green">
      <div class="stat-label">Graduated</div>
      <div class="stat-num">${s.graduated}</div>
      <div class="stat-sub"><i class="fas fa-graduation-cap"></i> Alumni</div>
      <i class="fas fa-graduation-cap stat-icon"></i>
    </div>
    <div class="stat-card teal">
      <div class="stat-label">Enrolled Now</div>
      <div class="stat-num">${s.enrollments}</div>
      <div class="stat-sub"><i class="fas fa-chalkboard"></i> Active enrollments</div>
      <i class="fas fa-list-check stat-icon"></i>
    </div>
    <div class="stat-card orange">
      <div class="stat-label">At Risk</div>
      <div class="stat-num">${s.at_risk}</div>
      <div class="stat-sub" style="color:var(--warning)"><i class="fas fa-triangle-exclamation"></i> Warning & below</div>
      <i class="fas fa-triangle-exclamation stat-icon"></i>
    </div>
    <div class="stat-card purple">
      <div class="stat-label">Faculties</div>
      <div class="stat-num">${s.faculties}</div>
      <div class="stat-sub"><i class="fas fa-building-columns"></i> ${s.departments} departments</div>
      <i class="fas fa-university stat-icon"></i>
    </div>
    <div class="stat-card blue">
      <div class="stat-label">Programs</div>
      <div class="stat-num">${s.programs}</div>
      <div class="stat-sub"><i class="fas fa-book"></i> ${s.courses} courses</div>
      <i class="fas fa-graduation-cap stat-icon"></i>
    </div>
    <div class="stat-card gold">
      <div class="stat-label">Exams</div>
      <div class="stat-num">${s.exams}</div>
      <div class="stat-sub"><i class="fas fa-star"></i> ${s.results} results entered</div>
      <i class="fas fa-pencil stat-icon"></i>
    </div>
    <div class="stat-card ${s.pending_verify > 0 ? 'orange' : 'green'}">
      <div class="stat-label">Pending Verification</div>
      <div class="stat-num">${s.pending_verify}</div>
      <div class="stat-sub" style="color:${s.pending_verify > 0 ? 'var(--warning)' : 'var(--success)'}">
        <i class="fas fa-${s.pending_verify > 0 ? 'clock' : 'check'}"></i>
        ${s.pending_verify > 0 ? 'Admissions awaiting docs' : 'All verified'}
      </div>
      <i class="fas fa-file-signature stat-icon"></i>
    </div>
  </div>

  <!-- Charts Row -->
  <div class="two-col" style="margin-bottom:1.5rem">
    <div class="chart-box">
      <h4><i class="fas fa-chart-bar" style="color:var(--primary)"></i> Grade Distribution
        <span style="font-size:.72rem;font-weight:400;color:var(--text-muted);margin-left:auto">${totalGrades} grades recorded</span>
      </h4>
      ${gr.ok && gr.data.length ? gr.data.map(x => `
        <div class="bar-row">
          <span class="bar-label">${esc(x.letter_grade)}</span>
          <div class="bar-track">
            <div class="bar-fill" style="width:${Math.round(+x.cnt/maxGrade*100)}%;background:${gradeColors[x.letter_grade]||'#94A3B8'}"></div>
          </div>
          <span class="bar-count">${x.cnt}</span>
          <span style="font-size:.7rem;color:var(--text-muted);width:36px;text-align:right">${totalGrades ? Math.round(x.cnt/totalGrades*100) : 0}%</span>
        </div>`).join('') : '<p style="font-size:.82rem;color:var(--text-muted)">No grade data yet</p>'}
    </div>

    <div class="chart-box">
      <h4><i class="fas fa-triangle-exclamation" style="color:var(--warning)"></i> Students At Risk</h4>
      ${ar.ok && ar.data.length ? `
      <div class="table-wrap"><table>
        <thead><tr><th>Student</th><th>Program</th><th>CGPA</th><th>Standing</th></tr></thead>
        <tbody>${ar.data.map(x => `
          <tr>
            <td>
              <div style="font-weight:600;font-size:.8rem">${esc(x.full_name)}</div>
              <div style="font-size:.7rem;color:var(--text-muted)">${esc(x.student_code)}</div>
            </td>
            <td style="font-size:.75rem;color:var(--text-muted);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.program_name_en)}</td>
            <td><strong style="font-size:.88rem">${parseFloat(x.cumulative_gpa).toFixed(3)}</strong></td>
            <td>${standingBadge(x.academic_standing)}</td>
          </tr>`).join('')}
        </tbody>
      </table></div>` : `
      <div class="empty" style="padding:2rem">
        <i class="fas fa-check-circle" style="color:var(--success)"></i>
        <p>No at-risk students — great!</p>
      </div>`}
    </div>
  </div>

  <!-- Quick Actions -->
  <div class="two-col" style="margin-bottom:1.5rem">
    <div class="card">
      <div class="card-hdr"><i class="fas fa-bolt" style="color:var(--warning)"></i><h3>Quick Actions</h3></div>
      <div style="padding:1rem;display:grid;grid-template-columns:1fr 1fr;gap:.75rem">
        <button class="btn btn-ghost" onclick="nav('students')" style="justify-content:flex-start">
          <i class="fas fa-user-plus" style="color:var(--primary)"></i> Add Student
        </button>
        <button class="btn btn-ghost" onclick="nav('enrollments')" style="justify-content:flex-start">
          <i class="fas fa-list-check" style="color:var(--info)"></i> Enroll Student
        </button>
        <button class="btn btn-ghost" onclick="nav('examinations')" style="justify-content:flex-start">
          <i class="fas fa-pencil" style="color:var(--success)"></i> Add Exam
        </button>
        <button class="btn btn-ghost" onclick="nav('transcript')" style="justify-content:flex-start">
          <i class="fas fa-scroll" style="color:var(--warning)"></i> View Transcript
        </button>
        <button class="btn btn-ghost" onclick="nav('attendance')" style="justify-content:flex-start">
          <i class="fas fa-calendar-check" style="color:var(--info)"></i> Attendance
        </button>
        <button class="btn btn-ghost" onclick="nav('reports')" style="justify-content:flex-start">
          <i class="fas fa-chart-pie" style="color:var(--primary)"></i> Reports
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-hdr"><i class="fas fa-circle-info" style="color:var(--info)"></i><h3>System Summary</h3></div>
      <div style="padding:1rem">
        ${[
          ['Active Sections', s.sections, 'fa-chalkboard', 'var(--primary)'],
          ['Unfinalized Grades', s.unfinalized, 'fa-ranking-star', s.unfinalized > 0 ? 'var(--warning)' : 'var(--success)'],
          ['Active Students', s.active_students, 'fa-users', 'var(--info)'],
          ['Exam Results', s.results, 'fa-star', 'var(--success)'],
        ].map(([label, val2, icon, color]) => `
          <div style="display:flex;align-items:center;gap:.75rem;padding:.6rem 0;border-bottom:1px solid var(--border-light)">
            <i class="fas ${icon}" style="color:${color};width:18px;text-align:center"></i>
            <span style="font-size:.85rem;color:var(--ink-light);flex:1">${label}</span>
            <strong style="font-size:.9rem;color:var(--ink)">${val2}</strong>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Recent Activity -->
  <div class="card">
    <div class="card-hdr">
      <i class="fas fa-clock-rotate-left" style="color:var(--text-muted)"></i>
      <h3>Recent Activity</h3>
      <div class="card-hdr-right">
        <button class="btn btn-ghost btn-sm" onclick="nav('audit')"><i class="fas fa-arrow-right"></i> View All</button>
      </div>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Action</th><th>Table</th><th>User</th><th>IP</th><th>Time</th></tr></thead>
      <tbody>${rr.ok && rr.data.length ? rr.data.map(x => `
        <tr>
          <td><code style="font-size:.75rem;background:var(--mist);padding:.15rem .4rem;border-radius:5px">${esc(x.action)}</code></td>
          <td style="font-size:.75rem;color:var(--text-muted)">${esc(x.table_name || '—')}</td>
          <td style="font-size:.82rem">${esc(x.full_name || 'System')}</td>
          <td style="font-size:.72rem;color:var(--text-muted);font-family:monospace">${esc(x.ip_address || '')}</td>
          <td style="font-size:.75rem;color:var(--text-muted);white-space:nowrap">${fmtDate(x.created_at)}</td>
        </tr>`).join('') :
        '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:2rem;font-size:.82rem">No activity yet</td></tr>'}
      </tbody>
    </table></div>
  </div>`);
};
