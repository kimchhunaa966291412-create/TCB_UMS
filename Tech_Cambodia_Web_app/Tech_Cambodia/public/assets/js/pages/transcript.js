// ICB — Transcript Page
pages.transcript=async function(){
  makePage(`
  <div class="page-hdr"><div><h2>Transcript</h2><div class="page-hdr-sub">Official student academic transcript</div></div></div>
  <div class="card" style="padding:1.2rem;margin-bottom:1rem">
    <div style="display:flex;gap:.7rem;align-items:flex-start;flex-wrap:wrap">
      <div style="flex:1;min-width:200px">
        <label style="display:block;font-size:.72rem;font-weight:600;color:var(--light);margin-bottom:.35rem;text-transform:uppercase;letter-spacing:.06em">Student ID</label>
        <div style="position:relative">
          <i class="fas fa-id-card" style="position:absolute;left:.75rem;top:50%;transform:translateY(-50%);color:var(--light);font-size:.8rem;pointer-events:none"></i>
          <input type="text" id="tr_code" placeholder="e.g. e20230312"
            style="width:100%;padding:.55rem .8rem .55rem 2.2rem;border:1.5px solid var(--border);border-radius:10px;font-size:.85rem;font-family:inherit;outline:none;background:var(--surface,#fff);transition:border-color .2s"
            onfocus="this.style.borderColor='var(--ink)'" onblur="this.style.borderColor='var(--border)'"
            onkeydown="if(event.key==='Enter')loadTranscript()">
        </div>
        <div style="font-size:.7rem;color:var(--light);margin-top:.3rem"><i class="fas fa-circle-info" style="margin-right:.3rem"></i>Enter the student code (e.g. <code style="font-size:.68rem">e20230312</code>)</div>
      </div>
      <div style="display:flex;gap:.5rem;align-items:flex-end;padding-bottom:1.6rem">
        <button class="btn btn-primary" onclick="loadTranscript()"><i class="fas fa-scroll"></i> Load Transcript</button>
        <button class="btn btn-ghost" onclick="printTranscript()"><i class="fas fa-print"></i> Print</button>
      </div>
    </div>
  </div>
  <div id="transcript-area"></div>`);
};

async function loadTranscript(){
  const code=(document.getElementById('tr_code')||{}).value;
  const codeVal=code?code.trim():'';
  if(!codeVal){toast('Enter a student ID','err');return;}
  const d=document.getElementById('transcript-area');
  d.innerHTML='<div class="empty"><div class="spin" style="margin:0 auto .5rem"></div><p>Looking up student…</p></div>';

  // Lookup student_id by student_code
  const lookup=await get('student_by_code',{code:codeVal});
  if(!lookup.ok){
    d.innerHTML=emptyState(lookup.error||'Student not found — check the ID and try again','fa-user-slash');
    return;
  }
  const sid=lookup.data.student_id;

  d.innerHTML='<div class="empty"><div class="spin" style="margin:0 auto .5rem"></div><p>Loading transcript…</p></div>';
  const r=await get('transcript',{student_id:sid});
  if(!r.ok){d.innerHTML=emptyState(r.error,'fa-exclamation-circle');return;}
  const s=r.student,gr=r.grades,gpa=r.gpa_records;
  const byYearSem={};
  gr.forEach(g=>{const k=g.academic_year+'|'+g.semester;if(!byYearSem[k])byYearSem[k]={year:g.academic_year,sem:g.semester,courses:[]};byYearSem[k].courses.push(g);});
  const gpaMap={};gpa.forEach(g=>gpaMap[g.academic_year+'|'+g.semester]=g);
  d.innerHTML=`
  <div class="transcript" id="transcript-print">
    <div class="tr-header">
      <div><div class="tr-logo">ITC</div><div style="font-size:.7rem;color:var(--light);font-weight:600;text-transform:uppercase;letter-spacing:.08em">Institute of Technology of Cambodia</div></div>
      <div style="text-align:right"><div style="font-size:1.1rem;font-weight:700;color:var(--ink)">OFFICIAL ACADEMIC TRANSCRIPT</div><div style="font-size:.75rem;color:var(--light)">Registrar's Office · ${new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</div></div>
    </div>
    <div class="tr-student-grid">
      <div class="tr-field"><span class="tr-fk">Student Code:</span><span class="tr-fv">${esc(s.student_code)}</span></div>
      <div class="tr-field"><span class="tr-fk">Name:</span><span class="tr-fv">${esc(s.full_name_en)}</span></div>
      <div class="tr-field"><span class="tr-fk">Date of Birth:</span><span class="tr-fv">${fmtDate(s.date_of_birth)}</span></div>
      <div class="tr-field"><span class="tr-fk">Gender:</span><span class="tr-fv">${esc(s.gender)}</span></div>
      <div class="tr-field"><span class="tr-fk">Faculty:</span><span class="tr-fv">${esc(s.faculty_name_en)}</span></div>
      <div class="tr-field"><span class="tr-fk">Program:</span><span class="tr-fv">${esc(s.program_name_en)}</span></div>
      <div class="tr-field"><span class="tr-fk">Degree:</span><span class="tr-fv">${esc(s.degree_level)}</span></div>
      <div class="tr-field"><span class="tr-fk">Status:</span><span class="tr-fv">${esc(s.status)}</span></div>
      <div class="tr-field"><span class="tr-fk">Admission Year:</span><span class="tr-fv">${s.admission_year}</span></div>
      <div class="tr-field"><span class="tr-fk">Credits Earned:</span><span class="tr-fv">${r.credits_earned} / ${s.total_credits}</span></div>
    </div>
    ${Object.values(byYearSem).map(ys=>{const gpaR=gpaMap[ys.year+'|'+ys.sem];return`
      <div style="margin-bottom:1.2rem">
        <div style="background:var(--ink);color:#fff;padding:.4rem .8rem;border-radius:8px 8px 0 0;font-size:.75rem;font-weight:700;display:flex;justify-content:space-between">
          <span>${esc(ys.year)} · ${esc(ys.sem)}</span>
          ${gpaR?`<span>Sem GPA: ${parseFloat(gpaR.semester_gpa).toFixed(3)} · CGPA: ${parseFloat(gpaR.cumulative_gpa).toFixed(3)} · ${esc(gpaR.academic_standing)}</span>`:''}
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:.8rem;border:1px solid var(--border);border-top:none">
          <thead><tr style="background:var(--mist)"><th style="padding:.4rem .8rem;text-align:left;font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Course Code</th><th style="padding:.4rem .8rem;text-align:left;font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Course Name</th><th style="padding:.4rem .8rem;text-align:center;font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Credits</th><th style="padding:.4rem .8rem;text-align:center;font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Score</th><th style="padding:.4rem .8rem;text-align:center;font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Grade</th><th style="padding:.4rem .8rem;text-align:center;font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase">GP</th><th style="padding:.4rem .8rem;text-align:center;font-size:.65rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase">Result</th></tr></thead>
          <tbody>${ys.courses.map(c=>`<tr style="border-bottom:1px solid var(--border)"><td style="padding:.4rem .8rem"><code style="font-size:.72rem">${esc(c.course_code)}</code></td><td style="padding:.4rem .8rem">${esc(c.course_name_en)}</td><td style="padding:.4rem .8rem;text-align:center">${c.credit_hours}</td><td style="padding:.4rem .8rem;text-align:center">${parseFloat(c.total_weighted_score).toFixed(2)}</td><td style="padding:.4rem .8rem;text-align:center">${gradeBadge(c.letter_grade)}</td><td style="padding:.4rem .8rem;text-align:center">${parseFloat(c.grade_point).toFixed(1)}</td><td style="padding:.4rem .8rem;text-align:center">${c.is_passed?'<span style="color:var(--green);font-weight:700;font-size:.7rem">PASS</span>':'<span style="color:var(--red);font-weight:700;font-size:.7rem">FAIL</span>'}</td></tr>`).join('')}</tbody>
        </table>
      </div>`}).join('')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:1rem;padding-top:1rem;border-top:2px solid var(--ink)">
      <div><div style="font-size:.75rem;font-weight:700;margin-bottom:.5rem;color:var(--ink)">GRADING SCALE (ITC/ACC)</div><table style="font-size:.72rem;border-collapse:collapse"><tr><td style="padding:.15rem .5rem .15rem 0;font-weight:700">A (≥85)</td><td style="color:var(--light)">4.0 pts — Excellent</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;font-weight:700">B (75–84)</td><td style="color:var(--light)">3.0 pts — Good</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;font-weight:700">C+ (65–74)</td><td style="color:var(--light)">2.5 pts — Satisfactory</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;font-weight:700">C (55–64)</td><td style="color:var(--light)">2.0 pts — Pass</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;font-weight:700">D+ (45–54)</td><td style="color:var(--light)">1.5 pts</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;font-weight:700">D (35–44)</td><td style="color:var(--light)">1.0 pts</td></tr><tr><td style="padding:.15rem .5rem .15rem 0;font-weight:700">F (&lt;25)</td><td style="color:var(--light)">0.0 pts — Fail</td></tr></table></div>
      <div style="text-align:right"><div style="font-size:.75rem;color:var(--light);margin-bottom:.3rem">Final CGPA</div><div style="font-size:2.5rem;font-weight:800;color:var(--ink)">${r.cgpa?parseFloat(r.cgpa).toFixed(3):'—'}</div>${r.cgpa?standingBadge(r.cgpa>=3.5?'Excellent':r.cgpa>=2.5?'Good Standing':r.cgpa>=2.0?'Warning':r.cgpa>=1.5?'Probation':'Suspension Risk'):''}<div style="margin-top:1.5rem;font-size:.7rem;color:var(--light);line-height:1.8">This transcript is for academic reference only.<br>Official copies must be stamped by the Registrar.</div></div>
    </div>
  </div>`;
}

function viewTranscript(code){
  nav('transcript');
  setTimeout(async()=>{
    const el=document.getElementById('tr_code');
    if(el){el.value=code;await loadTranscript();}
  },200);
}

function printTranscript(){
  const content=document.getElementById('transcript-print');
  if(!content){toast('Load a transcript first','err');return;}
  const w=window.open('','_blank');
  w.document.write(`<html><head><title>Transcript</title><style>body{font-family:Arial,sans-serif;font-size:12px;margin:20px;color:#000}table{width:100%;border-collapse:collapse}th,td{padding:4px 8px;border:1px solid #ccc;font-size:11px}th{background:#f0f0f0;font-weight:700}.badge{font-weight:700}@media print{@page{margin:15mm}}</style></head><body>${content.innerHTML}</body></html>`);
  w.document.close();w.print();
}
