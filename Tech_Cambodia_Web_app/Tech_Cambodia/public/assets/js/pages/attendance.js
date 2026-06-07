// ICB — Attendance Page
pages.attendance=async function(){
  const secRes=await get('attendance_sections');const sections=secRes.ok?secRes.data:[];
  makePage(`
  <div class="page-hdr"><div><h2>Attendance</h2><div class="page-hdr-sub">Mark student attendance</div></div></div>
  <div class="card" style="margin-bottom:1rem">
    <div class="card-hdr"><i class="fas fa-calendar-alt"></i><h3>Select Section & Date</h3></div>
    <div style="padding:1rem;display:flex;gap:1rem;flex-wrap:wrap;align-items:flex-end">
      <div class="fg" style="flex:2;min-width:200px">
        <label>Section</label>
        <select id="att_section"><option value="">-- Choose a section --</option>
          ${sections.map(s=>`<option value="${s.section_id}">${s.course_code} – ${s.section_code} (${s.academic_year} ${s.semester})</option>`).join('')}
        </select>
      </div>
      <div class="fg"><label>Date</label><input type="date" id="att_date" value="${new Date().toISOString().slice(0,10)}"></div>
      <div><button class="btn btn-primary" onclick="loadAttendanceSheet()"><i class="fas fa-clipboard-list"></i> Load Sheet</button></div>
    </div>
  </div>
  <div id="attendance-sheet"></div>`);
};
async function loadAttendanceSheet(){
  const section_id=val('att_section');const date=val('att_date');
  if(!section_id){toast('Select a section','err');return;}
  const sheetDiv=document.getElementById('attendance-sheet');
  sheetDiv.innerHTML='<div class="empty"><div class="spin"></div><p>Loading students...</p></div>';
  const[studRes,attRes]=await Promise.all([get('attendance_students',{section_id}),get('attendance_get',{section_id,date})]);
  if(!studRes.ok){sheetDiv.innerHTML=emptyState('Failed to load students','fa-exclamation-circle');return;}
  const students=studRes.data;const existing=attRes.ok?attRes.data:[];
  const existingMap={};existing.forEach(a=>{existingMap[a.student_id]=a.status;});
  sheetDiv.innerHTML=`
  <div class="card">
    <div class="card-hdr"><i class="fas fa-user-check"></i><h3>Mark Attendance for ${date}</h3>
      <div class="card-hdr-right"><button class="btn btn-primary" onclick="saveAttendance()"><i class="fas fa-save"></i> Save</button></div>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Student Code</th><th>Student Name</th><th>Status</th></tr></thead>
      <tbody>${students.map(s=>{const cur=existingMap[s.student_id]||'Present';return`
        <tr>
          <td><code>${esc(s.student_code)}</code></td>
          <td>${esc(s.student_name)}</td>
          <td><select class="att-status" data-student="${s.student_id}">
            <option value="Present" ${cur==='Present'?'selected':''}>Present</option>
            <option value="Absent" ${cur==='Absent'?'selected':''}>Absent</option>
            <option value="Late" ${cur==='Late'?'selected':''}>Late</option>
            <option value="Excused" ${cur==='Excused'?'selected':''}>Excused</option>
          </select></td>
        </tr>`;}).join('')}
      </tbody>
    </table></div>
  </div>`;
}
async function saveAttendance(){
  const section_id=val('att_section');const date=val('att_date');
  const selects=document.querySelectorAll('.att-status');const students={};
  selects.forEach(sel=>{students[sel.dataset.student]=sel.value;});
  const r=await post('attendance_save',{section_id,attendance_date:date,students});
  if(r.ok){toast('Attendance saved');loadAttendanceSheet();}else toast(r.error,'err');
}
