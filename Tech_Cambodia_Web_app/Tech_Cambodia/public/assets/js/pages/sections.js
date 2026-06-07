// ICB — Sections Page
pages.sections = async function(){
  const[r,cr]=await Promise.all([get('sections'),get('list_courses')]);
  const rows=r.ok?r.data:[];
  makePage(`
  <div class="page-hdr"><div><h2>Academic Sections</h2><div class="page-hdr-sub">Course sections by semester</div></div>
  <div class="page-hdr-actions"><button class="btn btn-primary" onclick='secAdd(${JSON.stringify(cr.ok?cr.data:[])})'><i class="fas fa-plus"></i> Add Section</button></div></div>
  <div class="card"><div class="table-wrap"><table>
  <thead><tr><th>Section</th><th>Course</th><th>Instructor</th><th>Year/Semester</th><th>Schedule</th><th>Room</th><th>Enrolled</th><th>Mode</th><th>Actions</th></tr></thead>
  <tbody>${rows.length?rows.map(x=>`
    <tr>
      <td><code style="font-size:.75rem;background:var(--mist);padding:.15rem .4rem;border-radius:5px">${esc(x.section_code)}</code></td>
      <td><div style="font-weight:600;font-size:.8rem">${esc(x.course_name_en)}</div><div style="font-size:.7rem;color:var(--light)">${esc(x.course_code)} · ${x.credit_hours} cr</div></td>
      <td style="font-size:.78rem">${esc(x.instructor||'TBA')}</td>
      <td style="font-size:.78rem">${esc(x.academic_year)} · <span class="badge badge-enrolled">${esc(x.semester)}</span></td>
      <td style="font-size:.75rem;color:var(--light)">${x.schedule_day||''} ${x.time_start?x.time_start.slice(0,5)+'-'+x.time_end.slice(0,5):''}</td>
      <td style="font-size:.75rem">${x.room_code||'—'}</td>
      <td>${x.enrolled_count}/${x.capacity}</td>
      <td><span class="badge ${x.delivery_mode==='Online'?'badge-lecturer':x.delivery_mode==='Hybrid'?'badge-warning':'badge-active'}">${esc(x.delivery_mode)}</span></td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick='secEdit(${JSON.stringify(x)},${JSON.stringify(cr.ok?cr.data:[])})'><i class="fas fa-pen"></i></button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="delSec(${x.section_id},'${esc(x.section_code)}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join(''):'<tr><td colspan="9">'+emptyState()+'</td></tr>'}
  </tbody></table></div></div>`);
};
function secForm(d={},courses=[]){return `
  <div class="fg"><label>Course *</label><select id="s_course">${courses.map(x=>`<option value="${x.course_id}" ${d.course_id==x.course_id?'selected':''}>${esc(x.course_code)} — ${esc(x.course_name_en)}</option>`).join('')}</select></div>
  <div class="fg-row"><div class="fg"><label>Section Code *</label><input id="s_code" value="${esc(d.section_code||'')}"></div><div class="fg"><label>Academic Year *</label><input id="s_year" value="${esc(d.academic_year||'2024-2025')}" placeholder="2024-2025"></div></div>
  <div class="fg-row">
    <div class="fg"><label>Semester</label><select id="s_sem"><option value="Semester1" ${d.semester==='Semester1'||!d.semester?'selected':''}>Semester 1</option><option value="Semester2" ${d.semester==='Semester2'?'selected':''}>Semester 2</option><option value="Summer" ${d.semester==='Summer'?'selected':''}>Summer</option></select></div>
    <div class="fg"><label>Mode</label><select id="s_mode"><option value="In-Person" ${!d.delivery_mode||d.delivery_mode==='In-Person'?'selected':''}>In-Person</option><option value="Online" ${d.delivery_mode==='Online'?'selected':''}>Online</option><option value="Hybrid" ${d.delivery_mode==='Hybrid'?'selected':''}>Hybrid</option></select></div>
  </div>
  <div class="fg"><label>Instructor</label><input id="s_inst" value="${esc(d.instructor||'')}"></div>
  <div class="fg-row"><div class="fg"><label>Capacity</label><input id="s_cap" type="number" value="${d.capacity||40}"></div><div class="fg"><label>Schedule Day(s)</label><input id="s_day" value="${esc(d.schedule_day||'')}" placeholder="Mon,Wed"></div></div>
  <div class="fg-row"><div class="fg"><label>Start Time</label><input id="s_ts" type="time" value="${d.time_start?d.time_start.slice(0,5):''}"></div><div class="fg"><label>End Time</label><input id="s_te" type="time" value="${d.time_end?d.time_end.slice(0,5):''}"></div></div>`;}
function secAdd(cr){openModal('Add Section','',secForm({},cr),async()=>{const r=await post('section_add',{section_code:val('s_code'),course_id:val('s_course'),instructor:val('s_inst'),academic_year:val('s_year'),semester:val('s_sem'),schedule_day:val('s_day'),time_start:val('s_ts'),time_end:val('s_te'),capacity:val('s_cap'),delivery_mode:val('s_mode')});if(r.ok){toast('Section added');closeModal();pages.sections();}else toast(r.error,'err');},'Add Section');}
function secEdit(d,cr){openModal('Edit Section','',secForm(d,cr),async()=>{const r=await post('section_edit',{section_id:d.section_id,section_code:val('s_code'),course_id:val('s_course'),instructor:val('s_inst'),academic_year:val('s_year'),semester:val('s_sem'),schedule_day:val('s_day'),time_start:val('s_ts'),time_end:val('s_te'),capacity:val('s_cap'),delivery_mode:val('s_mode'),is_active:1});if(r.ok){toast('Updated');closeModal();pages.sections();}else toast(r.error,'err');},'Save');}
function delSec(id,code){confirm2('Delete Section',`Delete section "${code}"?`,async()=>{const r=await post('section_delete',{id});if(r.ok){toast('Deleted');pages.sections();}else toast(r.error,'err');});}
