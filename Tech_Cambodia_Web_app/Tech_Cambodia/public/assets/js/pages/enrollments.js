// ICB — Enrollments Page
pages.enrollments=async function(){
  const[r,secr,studr]=await Promise.all([get('enrollments'),get('list_sections'),get('list_students_active')]);
  const rows=r.ok?r.data:[];
  makePage(`
  <div class="page-hdr"><div><h2>Enrollments</h2><div class="page-hdr-sub">Student section enrollments</div></div>
  <div class="page-hdr-actions"><button class="btn btn-primary" onclick='enrlAdd(${JSON.stringify(secr.ok?secr.data:[])},${JSON.stringify(studr.ok?studr.data:[])})'><i class="fas fa-plus"></i> Enroll Student</button></div></div>
  <div class="card"><div class="table-wrap"><table>
  <thead><tr><th>Student</th><th>Course / Section</th><th>Year/Sem</th><th>Type</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
  <tbody>${rows.length?rows.map(x=>`
    <tr>
      <td><div style="font-weight:600;font-size:.8rem">${esc(x.full_name_en)}</div><div style="font-size:.7rem;color:var(--light)">${esc(x.student_code)}</div></td>
      <td><div style="font-size:.78rem;font-weight:500">${esc(x.course_name_en)}</div><div style="font-size:.7rem;color:var(--light)">${esc(x.course_code)} · ${esc(x.section_code)}</div></td>
      <td style="font-size:.75rem">${esc(x.academic_year)} · ${esc(x.semester)}</td>
      <td><span class="badge badge-active">${esc(x.enrollment_type)}</span></td>
      <td><span class="badge badge-${x.status.toLowerCase()}">${esc(x.status)}</span></td>
      <td style="font-size:.75rem">${fmtDate(x.enrollment_date)}</td>
      <td class="td-actions"><button class="btn btn-danger btn-sm btn-icon" onclick="delEnrl(${x.enrollment_id})"><i class="fas fa-trash"></i></button></td>
    </tr>`).join(''):'<tr><td colspan="7">'+emptyState()+'</td></tr>'}
  </tbody></table></div></div>`);
};
function enrlAdd(secs,studs){openModal('Enroll Student','Add a student to a section',`
  <div class="fg"><label>Student *</label><select id="e_stud"><option value="">Select student…</option>${studs.map(x=>`<option value="${x.student_id}">${esc(x.label)}</option>`).join('')}</select></div>
  <div class="fg"><label>Section *</label><select id="e_sec"><option value="">Select section…</option>${secs.map(x=>`<option value="${x.section_id}">${esc(x.label)}</option>`).join('')}</select></div>
  <div class="fg"><label>Type</label><select id="e_type"><option value="Regular">Regular</option><option value="Repeat">Repeat</option><option value="Audit">Audit</option></select></div>
  <div class="fg"><label>Enrollment Date</label><input id="e_date" type="date" value="${new Date().toISOString().slice(0,10)}"></div>`,
  async()=>{const r=await post('enrollment_add',{student_id:val('e_stud'),section_id:val('e_sec'),enrollment_type:val('e_type'),enrollment_date:val('e_date')});if(r.ok){toast('Enrolled');closeModal();pages.enrollments();}else toast(r.error,'err');},'Enroll');}
function delEnrl(id){confirm2('Remove Enrollment','Remove this enrollment?',async()=>{const r=await post('enrollment_delete',{id});if(r.ok){toast('Removed');pages.enrollments();}else toast(r.error,'err');},'Remove');}
