// ICB — Examinations Page
pages.examinations=async function(){
  const[r,secr]=await Promise.all([get('examinations'),get('list_sections')]);const rows=r.ok?r.data:[];
  makePage(`
  <div class="page-hdr"><div><h2>Examinations</h2><div class="page-hdr-sub">Quizzes, midterms and finals</div></div>
  <div class="page-hdr-actions"><button class="btn btn-primary" onclick='examAdd(${JSON.stringify(secr.ok?secr.data:[])})'><i class="fas fa-plus"></i> Add Exam</button></div></div>
  <div class="card"><div class="table-wrap"><table>
  <thead><tr><th>Section</th><th>Exam Name</th><th>Type</th><th>Date</th><th>Duration</th><th>Marks</th><th>Weight %</th><th>Invigilator</th><th>Actions</th></tr></thead>
  <tbody>${rows.length?rows.map(x=>`
    <tr>
      <td><code style="font-size:.72rem;background:var(--mist);padding:.15rem .4rem;border-radius:5px">${esc(x.section_code)}</code><div style="font-size:.7rem;color:var(--light)">${esc(x.course_name_en)}</div></td>
      <td style="font-weight:600;font-size:.8rem">${esc(x.exam_name)}</td>
      <td><span class="badge ${x.exam_type==='Final'?'badge-suspended':x.exam_type==='Midterm'?'badge-warning':'badge-active'}">${esc(x.exam_type)}</span></td>
      <td style="font-size:.78rem">${fmtDate(x.exam_date)}</td>
      <td>${x.duration_minutes} min</td><td>${x.total_marks}</td>
      <td><strong>${x.weight_percent}%</strong></td>
      <td style="font-size:.75rem">${esc(x.invigilator||'—')}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick='examEdit(${JSON.stringify(x)},${JSON.stringify(secr.ok?secr.data:[])})'><i class="fas fa-pen"></i></button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="delExam(${x.exam_id},'${esc(x.exam_name)}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join(''):'<tr><td colspan="9">'+emptyState()+'</td></tr>'}
  </tbody></table></div></div>`);
};
function examForm(d={},secs=[]){return `
  <div class="fg"><label>Section *</label><select id="ex_sec">${secs.map(x=>`<option value="${x.section_id}" ${d.section_id==x.section_id?'selected':''}>${esc(x.label)}</option>`).join('')}</select></div>
  <div class="fg-row">
    <div class="fg"><label>Type</label><select id="ex_type"><option value="Quiz" ${d.exam_type==='Quiz'?'selected':''}>Quiz</option><option value="Midterm" ${d.exam_type==='Midterm'||!d.exam_type?'selected':''}>Midterm</option><option value="Final" ${d.exam_type==='Final'?'selected':''}>Final</option><option value="Lab" ${d.exam_type==='Lab'?'selected':''}>Lab</option><option value="Assignment" ${d.exam_type==='Assignment'?'selected':''}>Assignment</option><option value="Project" ${d.exam_type==='Project'?'selected':''}>Project</option></select></div>
    <div class="fg"><label>Date *</label><input id="ex_date" type="date" value="${esc(d.exam_date||'')}"></div>
  </div>
  <div class="fg"><label>Exam Name *</label><input id="ex_name" value="${esc(d.exam_name||'')}"></div>
  <div class="fg-row"><div class="fg"><label>Duration (min)</label><input id="ex_dur" type="number" value="${d.duration_minutes||120}"></div><div class="fg"><label>Total Marks</label><input id="ex_marks" type="number" step="0.01" value="${d.total_marks||100}"></div></div>
  <div class="fg"><label>Weight % *</label><input id="ex_wt" type="number" step="0.01" value="${d.weight_percent||0}" min="0" max="100"></div>
  <div class="fg"><label>Invigilator</label><input id="ex_inv" value="${esc(d.invigilator||'')}"></div>`;}
function examAdd(secs){openModal('Add Examination','',examForm({},secs),async()=>{const r=await post('examination_add',{section_id:val('ex_sec'),exam_type:val('ex_type'),exam_name:val('ex_name'),exam_date:val('ex_date'),duration_minutes:val('ex_dur'),total_marks:val('ex_marks'),weight_percent:val('ex_wt'),invigilator:val('ex_inv')});if(r.ok){toast('Exam added');closeModal();pages.examinations();}else toast(r.error,'err');},'Add Exam');}
function examEdit(d,secs){openModal('Edit Examination','',examForm(d,secs),async()=>{const r=await post('examination_edit',{exam_id:d.exam_id,section_id:val('ex_sec'),exam_type:val('ex_type'),exam_name:val('ex_name'),exam_date:val('ex_date'),duration_minutes:val('ex_dur'),total_marks:val('ex_marks'),weight_percent:val('ex_wt'),invigilator:val('ex_inv')});if(r.ok){toast('Updated');closeModal();pages.examinations();}else toast(r.error,'err');},'Save');}
function delExam(id,name){confirm2('Delete Exam',`Delete "${name}"?`,async()=>{const r=await post('examination_delete',{id});if(r.ok){toast('Deleted');pages.examinations();}else toast(r.error,'err');});}
