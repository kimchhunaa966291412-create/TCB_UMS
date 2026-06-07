
//  ICB — Reports Page  v3.2  (enhanced with visual bars)

let _reportType = 'gpa_by_program';

pages.reports = async function () {
  makePage(`
  <div class="page-hdr">
    <div><h2>Reports</h2><div class="page-hdr-sub">Academic analytics and statistics</div></div>
    <div class="page-hdr-actions">
      <button class="btn btn-ghost" onclick="exportReportCSV()"><i class="fas fa-file-csv"></i> Export CSV</button>
    </div>
  </div>
  <div class="filter-bar">
    <select onchange="_reportType=this.value;loadReport()" id="rep_type">
      <option value="gpa_by_program"     ${_reportType==='gpa_by_program'     ?'selected':''}>Average GPA by Program</option>
      <option value="enrollment_by_course" ${_reportType==='enrollment_by_course'?'selected':''}>Enrollment by Course (Top 10)</option>
      <option value="students_by_status"  ${_reportType==='students_by_status' ?'selected':''}>Students by Status</option>
      <option value="standing_dist"       ${_reportType==='standing_dist'      ?'selected':''}>Academic Standing Distribution</option>
      <option value="admissions_by_type"  ${_reportType==='admissions_by_type' ?'selected':''}>Admissions by Type</option>
    </select>
    <button class="btn btn-primary" onclick="loadReport()"><i class="fas fa-chart-bar"></i> Generate</button>
  </div>
  <div id="report-area"><div class="empty"><i class="fas fa-chart-pie"></i><p>Select a report and click Generate</p></div></div>`);

  loadReport();
};

let _lastReportData = [];

async function loadReport() {
  const type = document.getElementById('rep_type')?.value || _reportType;
  _reportType = type;
  const area = document.getElementById('report-area');
  area.innerHTML = '<div class="empty"><div class="spin" style="margin:0 auto .5rem"></div><p>Loading…</p></div>';

  const r = await get('reports', { type });
  if (!r.ok) { area.innerHTML = emptyState(r.error); return; }
  _lastReportData = r.data;

  const titles = {
    gpa_by_program:     'Average CGPA by Program',
    enrollment_by_course:'Top 10 Courses by Enrollment',
    students_by_status:  'Student Status Distribution',
    standing_dist:       'Academic Standing Distribution',
    admissions_by_type:  'Admissions by Type',
  };

  const statusColors = {
    Active:'#10B981', Graduated:'#3B82F6', Suspended:'#EF4444',
    Withdrawn:'#94A3B8', Deferred:'#F59E0B',
    Excellent:'#10B981','Good Standing':'#3B82F6', Warning:'#F59E0B',
    Probation:'#EF4444','Suspension Risk':'#7F1D1D',
    National_Exam:'#4F46E5', Direct:'#10B981', Transfer:'#F59E0B', International:'#3B82F6',
  };

  let html = `<div class="card">
    <div class="card-hdr"><i class="fas fa-chart-bar" style="color:var(--primary)"></i><h3>${titles[type]||type}</h3>
      <div class="card-hdr-right"><span style="font-size:.78rem;color:var(--text-muted)">${r.data.length} records</span></div>
    </div>
    <div style="padding:1.5rem">`;

  if (!r.data.length) {
    html += emptyState('No data available');
  } else if (type === 'gpa_by_program') {
    const max = Math.max(...r.data.map(x => +x.avg_cgpa), 0.01);
    html += r.data.map(x => `
      <div class="report-bar-row">
        <div class="report-bar-label" title="${esc(x.program_name_en)}">${esc(x.program_name_en)}</div>
        <div class="report-bar-track">
          <div class="report-bar-fill" style="width:${Math.round(+x.avg_cgpa/4*100)}%;background:${+x.avg_cgpa>=3?'#10B981':+x.avg_cgpa>=2.5?'#3B82F6':+x.avg_cgpa>=2?'#F59E0B':'#EF4444'}"></div>
        </div>
        <div class="report-bar-val">${parseFloat(x.avg_cgpa).toFixed(3)}</div>
        <div style="font-size:.72rem;color:var(--text-muted);min-width:60px;text-align:right">${x.students} students</div>
      </div>`).join('');

  } else if (type === 'enrollment_by_course') {
    const max = Math.max(...r.data.map(x => +x.enrolled), 1);
    html += r.data.map(x => `
      <div class="report-bar-row">
        <div class="report-bar-label" title="${esc(x.course_name_en)}">
          <code style="font-size:.7rem;background:var(--mist);padding:.1rem .3rem;border-radius:4px;margin-right:.4rem">${esc(x.course_code)}</code>${esc(x.course_name_en)}
        </div>
        <div class="report-bar-track">
          <div class="report-bar-fill" style="width:${Math.round(+x.enrolled/max*100)}%"></div>
        </div>
        <div class="report-bar-val">${x.enrolled} enrolled</div>
      </div>`).join('');

  } else if (type === 'students_by_status' || type === 'standing_dist') {
    const key = type === 'students_by_status' ? 'status' : 'academic_standing';
    const total = r.data.reduce((a, x) => a + +x.cnt, 0);
    const max = Math.max(...r.data.map(x => +x.cnt), 1);
    html += r.data.map(x => {
      const pct = total ? Math.round(x.cnt / total * 100) : 0;
      const color = statusColors[x[key]] || '#94A3B8';
      return `
      <div class="report-bar-row">
        <div class="report-bar-label">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color};margin-right:.5rem;flex-shrink:0"></span>
          ${esc(x[key])}
        </div>
        <div class="report-bar-track">
          <div class="report-bar-fill" style="width:${Math.round(+x.cnt/max*100)}%;background:${color}"></div>
        </div>
        <div class="report-bar-val">${x.cnt}</div>
        <div style="font-size:.72rem;color:var(--text-muted);min-width:42px;text-align:right">${pct}%</div>
      </div>`;}).join('');

  } else if (type === 'admissions_by_type') {
    const max = Math.max(...r.data.map(x => +x.cnt), 1);
    html += r.data.map(x => {
      const color = statusColors[x.admission_type] || '#94A3B8';
      return `
      <div class="report-bar-row">
        <div class="report-bar-label">${esc(x.admission_type.replace(/_/g,' '))}</div>
        <div class="report-bar-track">
          <div class="report-bar-fill" style="width:${Math.round(+x.cnt/max*100)}%;background:${color}"></div>
        </div>
        <div class="report-bar-val">${x.cnt} admitted</div>
        <div style="font-size:.72rem;color:var(--text-muted);min-width:90px;text-align:right">
          ${x.avg_score ? 'Avg score: ' + parseFloat(x.avg_score).toFixed(1) : '—'}
        </div>
      </div>`;}).join('');
  }

  html += `</div></div>`;
  area.innerHTML = html;
}

function exportReportCSV() {
  if (!_lastReportData.length) { toast('No data to export', 'err'); return; }
  const keys = Object.keys(_lastReportData[0]);
  const csv = [keys.join(','), ..._lastReportData.map(r =>
    keys.map(k => JSON.stringify(r[k] ?? '')).join(',')
  )].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.download = `itc_report_${_reportType}_${new Date().toISOString().slice(0,10)}.csv`;
  a.click(); URL.revokeObjectURL(url);
  toast('CSV exported');
}
