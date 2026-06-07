// TCB — Admissions Page
pages.admissions=async function(){
  const r=await get('admissions');const rows=r.ok?r.data:[];
  makePage(`
  <div class="page-hdr"><div><h2>Admissions</h2><div class="page-hdr-sub">Student admission records</div></div></div>
  <div class="card"><div class="table-wrap"><table>
  <thead><tr><th>Student</th><th>Application</th><th>Admission</th><th>Type</th><th>Exam Score</th><th>High School</th><th>Docs Verified</th><th>Actions</th></tr></thead>
  <tbody>${rows.length?rows.map(x=>`
    <tr>
      <td><div style="font-weight:600">${esc(x.full_name_en)}</div><div style="font-size:.7rem;color:var(--light)">${esc(x.student_code)}</div></td>
      <td style="font-size:.78rem">${fmtDate(x.application_date)}</td>
      <td style="font-size:.78rem">${fmtDate(x.admission_date)}</td>
      <td><span class="badge badge-active">${esc(x.admission_type)}</span></td>
      <td>${x.national_exam_score?`<strong>${x.national_exam_score}</strong>`:'—'}</td>
      <td style="font-size:.75rem;color:var(--light)">${esc(x.high_school_name||'—')}</td>
      <td>${x.documents_verified?'<span class="badge badge-active"><i class="fas fa-check"></i> Verified</span>':'<span class="badge badge-warning">Pending</span>'}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick='admEdit(${JSON.stringify(x)})'><i class="fas fa-pen"></i></button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="delAdm(${x.admission_id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join(''):'<tr><td colspan="8">'+emptyState()+'</td></tr>'}
  </tbody></table></div></div>`);
};
function admForm(d={}){return `
  <div class="fg-row"><div class="fg"><label>Application Date</label><input id="a_app" type="date" value="${esc(d.application_date||'')}"></div><div class="fg"><label>Admission Date</label><input id="a_adm" type="date" value="${esc(d.admission_date||'')}"></div></div>
  <div class="fg"><label>Type</label><select id="a_type"><option value="National_Exam" ${d.admission_type==='National_Exam'?'selected':''}>National Exam</option><option value="Direct" ${d.admission_type==='Direct'?'selected':''}>Direct</option><option value="Transfer" ${d.admission_type==='Transfer'?'selected':''}>Transfer</option><option value="International" ${d.admission_type==='International'?'selected':''}>International</option></select></div>
  <div class="fg-row"><div class="fg"><label>Exam Score</label><input id="a_score" type="number" step="0.01" value="${d.national_exam_score||''}"></div><div class="fg"><label>High School GPA</label><input id="a_hsgpa" type="number" step="0.01" value="${d.high_school_gpa||''}"></div></div>
  <div class="fg"><label>High School Name</label><input id="a_hs" value="${esc(d.high_school_name||'')}"></div>
  <div class="fg"><label>Documents Verified</label><select id="a_docs"><option value="1" ${d.documents_verified?'selected':''}>Yes</option><option value="0" ${!d.documents_verified?'selected':''}>No</option></select></div>
  <div class="fg"><label>Remarks</label><textarea id="a_rem">${esc(d.remarks||'')}</textarea></div>`;}
function admEdit(d){openModal('Edit Admission','',admForm(d),async()=>{const r=await post('admission_edit',{admission_id:d.admission_id,application_date:val('a_app'),admission_date:val('a_adm'),admission_type:val('a_type'),national_exam_score:val('a_score'),high_school_gpa:val('a_hsgpa'),high_school_name:val('a_hs'),documents_verified:val('a_docs'),remarks:val('a_rem')});if(r.ok){toast('Updated');closeModal();pages.admissions();loadBadges();}else toast(r.error,'err');},'Save');}
function delAdm(id){confirm2('Delete Admission','Delete this admission record?',async()=>{const r=await post('admission_delete',{id});if(r.ok){toast('Deleted');pages.admissions();}else toast(r.error,'err');});}
