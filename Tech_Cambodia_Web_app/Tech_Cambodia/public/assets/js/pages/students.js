// ICB — Students Page
let _studPage=1,_studSearch='',_studStatus='',_studProg=0;
pages.students=async function(pg=1){
  _studPage=pg;
  const[r,pr]=await Promise.all([get('students',{page:pg,search:_studSearch,status:_studStatus,program:_studProg}),get('list_programs')]);
  if(!r.ok){makePage(emptyState('Failed to load'));return;}
  const rows=r.data,progs=pr.ok?pr.data:[];
  makePage(`
  <div class="page-hdr"><div><h2>Students</h2><div class="page-hdr-sub">${r.total} students total</div></div>
  <div class="page-hdr-actions"><button class="btn btn-primary" onclick='studAdd(${JSON.stringify(progs)})'><i class="fas fa-plus"></i> Add Student</button></div></div>
  <div class="filter-bar">
    <input type="text" placeholder="Search name, code, email…" value="${esc(_studSearch)}" oninput="_studSearch=this.value;pages.students()" style="min-width:240px">
    <select onchange="_studStatus=this.value;pages.students(1)"><option value="">All statuses</option><option value="Active" ${_studStatus==='Active'?'selected':''}>Active</option><option value="Graduated" ${_studStatus==='Graduated'?'selected':''}>Graduated</option><option value="Suspended" ${_studStatus==='Suspended'?'selected':''}>Suspended</option><option value="Withdrawn" ${_studStatus==='Withdrawn'?'selected':''}>Withdrawn</option></select>
    <select onchange="_studProg=this.value;pages.students(1)"><option value="0">All programs</option>${progs.map(p=>`<option value="${p.program_id}" ${_studProg==p.program_id?'selected':''}>${esc(p.program_name_en)}</option>`).join('')}</select>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Code</th><th>Name</th><th>Program</th><th>Year/Sem</th><th>Status</th><th>Email</th><th>Actions</th></tr></thead>
    <tbody>${rows.length?rows.map(x=>`
      <tr>
        <td><code style="font-size:.72rem;background:var(--mist);padding:.15rem .4rem;border-radius:5px">${esc(x.student_code)}</code></td>
        <td><div style="font-weight:600">${esc(x.full_name_en)}</div>${x.full_name_km?`<div style="font-size:.7rem;color:var(--light)">${esc(x.full_name_km)}</div>`:''}<div style="font-size:.7rem;color:var(--light)">${esc(x.gender)}</div></td>
        <td><div style="font-size:.78rem;font-weight:500">${esc(x.program_name_en)}</div><div style="font-size:.7rem;color:var(--light)">${esc(x.faculty_name_en)}</div></td>
        <td style="font-size:.78rem">${x.admission_year} · Sem ${x.current_semester}</td>
        <td>${statusBadge(x.status)}</td>
        <td style="font-size:.72rem;color:var(--light)">${esc(x.email_personal)}</td>
        <td class="td-actions">
          <button class="btn btn-ghost btn-sm" onclick="viewTranscript(${x.student_id})"><i class="fas fa-scroll"></i></button>
          <button class="btn btn-ghost btn-sm btn-icon" onclick='studEdit(${JSON.stringify(x)},${JSON.stringify(progs)})'><i class="fas fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="delStud(${x.student_id},'${esc(x.student_code)}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join(''):'<tr><td colspan="7">'+emptyState()+'</td></tr>'}
    </tbody></table></div>${renderPager(r.page,r.pages,'pages.students')}</div>`);
};
function studForm(d={},progs=[]){return `
  <div class="fg-row"><div class="fg"><label>Student Code *</label><input id="st_code" value="${esc(d.student_code||'')}" placeholder="e20240001"></div><div class="fg"><label>Gender *</label><select id="st_gender"><option value="Male" ${d.gender==='Male'||!d.gender?'selected':''}>Male</option><option value="Female" ${d.gender==='Female'?'selected':''}>Female</option><option value="Other" ${d.gender==='Other'?'selected':''}>Other</option></select></div></div>
  <div class="fg-row"><div class="fg"><label>First Name (EN) *</label><input id="st_fn" value="${esc(d.first_name_en||'')}"></div><div class="fg"><label>Last Name (EN) *</label><input id="st_ln" value="${esc(d.last_name_en||'')}"></div></div>
  <div class="fg"><label>Full Name (Khmer)</label><input id="st_km" value="${esc(d.full_name_km||'')}"></div>
  <div class="fg-row"><div class="fg"><label>Date of Birth *</label><input id="st_dob" type="date" value="${esc(d.date_of_birth||'')}"></div><div class="fg"><label>Nationality</label><input id="st_nat" value="${esc(d.nationality||'Cambodian')}"></div></div>
  <div class="fg"><label>Email (Personal) *</label><input id="st_email" type="email" value="${esc(d.email_personal||'')}"></div>
  <div class="fg-row"><div class="fg"><label>ITC Email</label><input id="st_itcemail" value="${esc(d.email_itc||'')}"></div><div class="fg"><label>Phone</label><input id="st_phone" value="${esc(d.phone||'')}"></div></div>
  <div class="fg"><label>Program *</label><select id="st_prog">${progs.map(p=>`<option value="${p.program_id}" ${d.program_id==p.program_id?'selected':''}>${esc(p.program_name_en)}</option>`).join('')}</select></div>
  <div class="fg-row"><div class="fg"><label>Admission Year *</label><input id="st_ay" type="number" value="${d.admission_year||new Date().getFullYear()}" min="2000" max="2030"></div><div class="fg"><label>Current Semester</label><input id="st_sem" type="number" value="${d.current_semester||1}" min="1" max="10"></div></div>
  <div class="fg-row"><div class="fg"><label>Status</label><select id="st_status"><option value="Active" ${d.status==='Active'||!d.status?'selected':''}>Active</option><option value="Graduated" ${d.status==='Graduated'?'selected':''}>Graduated</option><option value="Suspended" ${d.status==='Suspended'?'selected':''}>Suspended</option><option value="Withdrawn" ${d.status==='Withdrawn'?'selected':''}>Withdrawn</option><option value="Deferred" ${d.status==='Deferred'?'selected':''}>Deferred</option></select></div><div class="fg"><label>Guardian Name</label><input id="st_gname" value="${esc(d.guardian_name||'')}"></div></div>
  <div class="fg"><label>Address</label><textarea id="st_addr">${esc(d.address||'')}</textarea></div>`;}
function studAdd(pr){openModal('Add Student','New student record',studForm({},pr),async()=>{const r=await post('student_add',{student_code:val('st_code'),first_name_en:val('st_fn'),last_name_en:val('st_ln'),full_name_km:val('st_km'),gender:val('st_gender'),date_of_birth:val('st_dob'),nationality:val('st_nat'),email_personal:val('st_email'),email_itc:val('st_itcemail'),phone:val('st_phone'),program_id:val('st_prog'),admission_year:val('st_ay'),current_semester:val('st_sem'),status:val('st_status'),guardian_name:val('st_gname'),address:val('st_addr')});if(r.ok){toast('Student added');closeModal();pages.students();}else toast(r.error,'err');},'Add Student');}
function studEdit(d,pr){openModal('Edit Student','',studForm(d,pr),async()=>{const r=await post('student_edit',{student_id:d.student_id,student_code:val('st_code'),first_name_en:val('st_fn'),last_name_en:val('st_ln'),full_name_km:val('st_km'),gender:val('st_gender'),date_of_birth:val('st_dob'),nationality:val('st_nat'),email_personal:val('st_email'),email_itc:val('st_itcemail'),phone:val('st_phone'),program_id:val('st_prog'),admission_year:val('st_ay'),current_semester:val('st_sem'),status:val('st_status'),guardian_name:val('st_gname'),address:val('st_addr')});if(r.ok){toast('Updated');closeModal();pages.students();}else toast(r.error,'err');},'Save');}
function delStud(id,code){confirm2('Delete Student',`Delete student ${code}? This will remove all related records.`,async()=>{const r=await post('student_delete',{id});if(r.ok){toast('Deleted');pages.students();}else toast(r.error,'err');});}
