
//  ICB — Courses Page

pages.courses = async function () {
  const [r,dr] = await Promise.all([get('courses'),get('list_departments')]);
  const rows = r.ok ? r.data : [];
  makePage(`
  <div class="page-hdr">
    <div><h2>Courses</h2><div class="page-hdr-sub">All academic courses</div></div>
    <div class="page-hdr-actions"><button class="btn btn-primary" onclick='courseAdd(${JSON.stringify(dr.ok?dr.data:[])})'><i class="fas fa-plus"></i> Add Course</button></div>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Code</th><th>Course Name</th><th>Department</th><th>Credits</th><th>Level</th><th>Type</th><th>Prerequisite</th><th>Actions</th></tr></thead>
    <tbody>${rows.length?rows.map(x=>`
      <tr>
        <td><code style="font-size:.75rem;background:var(--sky-lt);color:var(--sky2);padding:.15rem .4rem;border-radius:5px">${esc(x.course_code)}</code></td>
        <td><div style="font-weight:600">${esc(x.course_name_en)}</div>${x.description?`<div style="font-size:.7rem;color:var(--light);max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.description)}</div>`:''}</td>
        <td style="font-size:.78rem;color:var(--light)">${esc(x.dept_name_en)}</td>
        <td><strong>${x.credit_hours}</strong> cr</td>
        <td><span class="badge badge-enrolled">${x.course_level}00</span></td>
        <td><span class="badge ${x.course_type==='Core'?'badge-active':x.course_type==='Lab'?'badge-good':'badge-lecturer'}">${esc(x.course_type)}</span></td>
        <td style="font-size:.75rem">${x.prereq_code?`<code style="background:var(--mist);padding:.1rem .3rem;border-radius:4px">${esc(x.prereq_code)}</code>`:'—'}</td>
        <td class="td-actions">
          <button class="btn btn-ghost btn-sm btn-icon" onclick='courseEdit(${JSON.stringify(x)},${JSON.stringify(dr.ok?dr.data:[])})'><i class="fas fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="delCourse(${x.course_id},'${esc(x.course_code)}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join(''):'<tr><td colspan="8">'+emptyState()+'</td></tr>'}
    </tbody>
  </table></div></div>`);
};
function courseForm(d={},depts=[]){return `
  <div class="fg"><label>Department *</label><select id="c_dept">${depts.map(x=>`<option value="${x.dept_id}" ${d.dept_id==x.dept_id?'selected':''}>${esc(x.dept_name_en)}</option>`).join('')}</select></div>
  <div class="fg-row">
    <div class="fg"><label>Code *</label><input id="c_code" value="${esc(d.course_code||'')}" placeholder="ITE301"></div>
    <div class="fg"><label>Credits *</label><input id="c_cr" type="number" value="${d.credit_hours||3}" min="1" max="6"></div>
  </div>
  <div class="fg"><label>Name (English) *</label><input id="c_name_en" value="${esc(d.course_name_en||'')}"></div>
  <div class="fg"><label>Name (Khmer)</label><input id="c_name_km" value="${esc(d.course_name_km||'')}"></div>
  <div class="fg-row">
    <div class="fg"><label>Level</label><select id="c_lvl"><option value="100" ${d.course_level==='100'?'selected':''}>100</option><option value="200" ${d.course_level==='200'?'selected':''}>200</option><option value="300" ${d.course_level==='300'?'selected':''}>300</option><option value="400" ${d.course_level==='400'?'selected':''}>400</option><option value="500" ${d.course_level==='500'?'selected':''}>500</option></select></div>
    <div class="fg"><label>Type</label><select id="c_type"><option ${d.course_type==='Core'||!d.course_type?'selected':''}>Core</option><option ${d.course_type==='Elective'?'selected':''}>Elective</option><option ${d.course_type==='Lab'?'selected':''}>Lab</option><option ${d.course_type==='Thesis'?'selected':''}>Thesis</option></select></div>
  </div>
  <div class="fg"><label>Description</label><textarea id="c_desc">${esc(d.description||'')}</textarea></div>`;}
function courseAdd(d){openModal('Add Course','',courseForm({},d),async()=>{const r=await post('course_add',{dept_id:val('c_dept'),course_code:val('c_code'),course_name_en:val('c_name_en'),course_name_km:val('c_name_km'),credit_hours:val('c_cr'),course_level:val('c_lvl'),course_type:val('c_type'),description:val('c_desc')});if(r.ok){toast('Course added');closeModal();pages.courses();}else toast(r.error,'err');},'Add Course');}
function courseEdit(d,dpts){openModal('Edit Course','',courseForm(d,dpts),async()=>{const r=await post('course_edit',{course_id:d.course_id,dept_id:val('c_dept'),course_code:val('c_code'),course_name_en:val('c_name_en'),course_name_km:val('c_name_km'),credit_hours:val('c_cr'),course_level:val('c_lvl'),course_type:val('c_type'),description:val('c_desc'),is_active:1});if(r.ok){toast('Updated');closeModal();pages.courses();}else toast(r.error,'err');},'Save');}
function delCourse(id,code){confirm2('Delete Course',`Delete "${code}"?`,async()=>{const r=await post('course_delete',{id});if(r.ok){toast('Deleted');pages.courses();}else toast(r.error,'err');});}
