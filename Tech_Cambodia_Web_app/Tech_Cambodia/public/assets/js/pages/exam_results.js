// ICB — Exam Results Page
pages.results=async function(){
  const[r,secr]=await Promise.all([get('exam_results'),get('list_sections')]);const rows=r.ok?r.data:[];
  makePage(`
  <div class="page-hdr"><div><h2>Exam Results</h2><div class="page-hdr-sub">Student marks entry</div></div>
  <div class="page-hdr-actions"><button class="btn btn-primary" onclick='resultAdd(${JSON.stringify(secr.ok?secr.data:[])})'><i class="fas fa-plus"></i> Enter Result</button></div></div>
  <div class="card"><div class="table-wrap"><table>
  <thead><tr><th>Student</th><th>Course</th><th>Exam</th><th>Type</th><th>Marks</th><th>Percentage</th><th>Absent</th><th>Date</th><th>Actions</th></tr></thead>
  <tbody>${rows.length?rows.map(x=>`
    <tr>
      <td><div style="font-weight:600;font-size:.8rem">${esc(x.full_name_en)}</div><div style="font-size:.7rem;color:var(--light)">${esc(x.student_code)}</div></td>
      <td style="font-size:.78rem">${esc(x.course_name_en)}</td>
      <td style="font-size:.78rem">${esc(x.exam_name)}</td>
      <td><span class="badge ${x.exam_type==='Final'?'badge-suspended':x.exam_type==='Midterm'?'badge-warning':'badge-active'}">${esc(x.exam_type)}</span></td>
      <td><strong>${x.marks_obtained}</strong>/${x.total_marks}</td>
      <td>${Math.round(x.marks_obtained/x.total_marks*100)}%</td>
      <td>${x.is_absent?'<span class="badge badge-suspended">Absent</span>':'—'}</td>
      <td style="font-size:.75rem">${fmtDate(x.entry_date)}</td>
      <td class="td-actions"><button class="btn btn-danger btn-sm btn-icon" onclick="delResult(${x.result_id})"><i class="fas fa-trash"></i></button></td>
    </tr>`).join(''):'<tr><td colspan="9">'+emptyState()+'</td></tr>'}
  </tbody></table></div></div>`);
};
async function resultAdd(secs){
  const secSel=`<div class="fg"><label>Section</label><select id="rs_sec" onchange="loadExamsForSec()">${secs.map(x=>`<option value="${x.section_id}">${esc(x.label)}</option>`).join('')}</select></div>`;
  openModal('Enter Exam Result','',`${secSel}
    <div id="rs_exam_wrap"><div class="fg"><label>Exam</label><select id="rs_exam"><option>Loading…</option></select></div></div>
    <div id="rs_stud_wrap"><div class="fg"><label>Student</label><select id="rs_stud"><option>—</option></select></div></div>
    <div class="fg-row"><div class="fg"><label>Marks Obtained</label><input id="rs_marks" type="number" step="0.01" value="0"></div><div class="fg"><label>Absent</label><select id="rs_absent"><option value="0">No</option><option value="1">Yes</option></select></div></div>`,
    async()=>{const r=await post('exam_result_add',{exam_id:val('rs_exam'),student_id:val('rs_stud'),marks_obtained:val('rs_marks'),is_absent:val('rs_absent')});if(r.ok){toast('Result saved');closeModal();pages.results();}else toast(r.error,'err');},'Save Result');
  loadExamsForSec();
}
async function loadExamsForSec(){
  const sid=val('rs_sec');if(!sid)return;
  const[er,sr]=await Promise.all([get('list_exams_for_section',{section_id:sid}),get('list_enrollments_for_section',{section_id:sid})]);
  document.getElementById('rs_exam_wrap').innerHTML=`<div class="fg"><label>Exam *</label><select id="rs_exam">${er.ok?er.data.map(x=>`<option value="${x.exam_id}">${esc(x.label)} (/${x.total_marks})</option>`).join(''):'<option>None</option>'}</select></div>`;
  document.getElementById('rs_stud_wrap').innerHTML=`<div class="fg"><label>Student *</label><select id="rs_stud">${sr.ok?sr.data.map(x=>`<option value="${x.student_id}">${esc(x.label)}</option>`).join(''):'<option>None</option>'}</select></div>`;
}
function delResult(id){confirm2('Delete Result','Remove this exam result?',async()=>{const r=await post('exam_result_delete',{id});if(r.ok){toast('Deleted');pages.results();}else toast(r.error,'err');},'Remove');}
