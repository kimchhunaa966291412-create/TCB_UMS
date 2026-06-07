// ICB — GPA Records Page
pages.gpa=async function(){
  const[r,sr]=await Promise.all([get('gpa_records'),get('list_students_all')]);const rows=r.ok?r.data:[];
  makePage(`
  <div class="page-hdr"><div><h2>GPA Records</h2><div class="page-hdr-sub">Semester and cumulative GPA</div></div>
  <div class="page-hdr-actions"><button class="btn btn-primary" onclick='gpaAdd(${JSON.stringify(sr.ok?sr.data:[])})'><i class="fas fa-plus"></i> Add GPA Record</button></div></div>
  <div class="card"><div class="table-wrap"><table>
  <thead><tr><th>Student</th><th>Program</th><th>Year / Semester</th><th>Credits Att.</th><th>Credits Earned</th><th>Sem GPA</th><th>CGPA</th><th>Standing</th><th>Actions</th></tr></thead>
  <tbody>${rows.length?rows.map(x=>`
    <tr>
      <td><div style="font-weight:600;font-size:.8rem">${esc(x.full_name_en)}</div><div style="font-size:.7rem;color:var(--light)">${esc(x.student_code)}</div></td>
      <td style="font-size:.75rem;color:var(--light)">${esc(x.program_name_en)}</td>
      <td style="font-size:.78rem">${esc(x.academic_year)} · <span class="badge badge-enrolled">${esc(x.semester)}</span></td>
      <td>${x.credits_attempted}</td><td>${x.credits_earned}</td>
      <td><strong>${parseFloat(x.semester_gpa).toFixed(3)}</strong></td>
      <td><strong style="font-size:1rem">${parseFloat(x.cumulative_gpa).toFixed(3)}</strong></td>
      <td>${standingBadge(x.academic_standing)}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick='gpaEdit(${JSON.stringify(x)},${JSON.stringify(sr.ok?sr.data:[])})'><i class="fas fa-pen"></i></button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="delGpa(${x.gpa_id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join(''):'<tr><td colspan="9">'+emptyState()+'</td></tr>'}
  </tbody></table></div></div>`);
};
function gpaForm(d={},studs=[]){return `
  <div class="fg"><label>Student *</label><select id="g_stud">${studs.map(x=>`<option value="${x.student_id}" ${d.student_id==x.student_id?'selected':''}>${esc(x.label)}</option>`).join('')}</select></div>
  <div class="fg-row"><div class="fg"><label>Academic Year</label><input id="g_yr" value="${esc(d.academic_year||'2024-2025')}"></div><div class="fg"><label>Semester</label><select id="g_sem"><option value="Semester1" ${d.semester==='Semester1'||!d.semester?'selected':''}>Semester 1</option><option value="Semester2" ${d.semester==='Semester2'?'selected':''}>Semester 2</option><option value="Summer" ${d.semester==='Summer'?'selected':''}>Summer</option></select></div></div>
  <div class="fg-row"><div class="fg"><label>Credits Attempted</label><input id="g_att" type="number" value="${d.credits_attempted||0}"></div><div class="fg"><label>Credits Earned</label><input id="g_ear" type="number" value="${d.credits_earned||0}"></div></div>
  <div class="fg-row"><div class="fg"><label>Semester GPA</label><input id="g_sgpa" type="number" step="0.001" value="${d.semester_gpa||0}" min="0" max="4"></div><div class="fg"><label>Cumulative GPA</label><input id="g_cgpa" type="number" step="0.001" value="${d.cumulative_gpa||0}" min="0" max="4"></div></div>`;}
function gpaAdd(studs){openModal('Add GPA Record','',gpaForm({},studs),async()=>{const r=await post('gpa_upsert',{student_id:val('g_stud'),academic_year:val('g_yr'),semester:val('g_sem'),credits_attempted:val('g_att'),credits_earned:val('g_ear'),semester_gpa:val('g_sgpa'),cumulative_gpa:val('g_cgpa')});if(r.ok){toast('Saved · Standing: '+r.data.academic_standing);closeModal();pages.gpa();}else toast(r.error,'err');},'Save');}
function gpaEdit(d,studs){openModal('Edit GPA Record','',gpaForm(d,studs),async()=>{const r=await post('gpa_upsert',{student_id:d.student_id,academic_year:val('g_yr'),semester:val('g_sem'),credits_attempted:val('g_att'),credits_earned:val('g_ear'),semester_gpa:val('g_sgpa'),cumulative_gpa:val('g_cgpa')});if(r.ok){toast('Updated');closeModal();pages.gpa();}else toast(r.error,'err');},'Save');}
function delGpa(id){confirm2('Delete GPA Record','Remove this GPA record?',async()=>{const r=await post('gpa_delete',{id});if(r.ok){toast('Deleted');pages.gpa();}else toast(r.error,'err');},'Remove');}
