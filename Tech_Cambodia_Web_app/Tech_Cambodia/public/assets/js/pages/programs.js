
//  ICB — Programs Page

pages.programs = async function () {
  const [r, dr] = await Promise.all([get('programs'), get('list_departments')]);
  const rows = r.ok ? r.data : [];
  makePage(`
  <div class="page-hdr">
    <div><h2>Programs</h2><div class="page-hdr-sub">Academic degree programs</div></div>
    <div class="page-hdr-actions"><button class="btn btn-primary" onclick='progAdd(${JSON.stringify(dr.ok ? dr.data : [])})'><i class="fas fa-plus"></i> Add Program</button></div>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Code</th><th>Program</th><th>Department</th><th>Level</th><th>Duration</th><th>Credits</th><th>Students</th><th>Actions</th></tr></thead>
    <tbody>${rows.length ? rows.map(x => `
      <tr>
        <td><code style="font-size:.75rem;background:var(--mist);padding:.15rem .4rem;border-radius:5px">${esc(x.program_code)}</code></td>
        <td><div style="font-weight:600">${esc(x.program_name_en)}</div></td>
        <td style="font-size:.78rem;color:var(--light)">${esc(x.dept_name_en)}</td>
        <td><span class="badge ${x.degree_level==='Master'?'badge-lecturer':x.degree_level==='Doctorate'?'badge-probation':'badge-active'}">${esc(x.degree_level)}</span></td>
        <td>${x.duration_years} yr</td>
        <td>${x.total_credits} cr</td>
        <td>${x.student_count}</td>
        <td class="td-actions">
          <button class="btn btn-ghost btn-sm btn-icon" onclick='progEdit(${JSON.stringify(x)},${JSON.stringify(dr.ok ? dr.data : [])})'><i class="fas fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="delProg(${x.program_id},'${esc(x.program_name_en)}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('') : '<tr><td colspan="8">' + emptyState() + '</td></tr>'}
    </tbody>
  </table></div></div>`);
};

function progForm(d = {}, depts = []) {
  return `
  <div class="fg"><label>Department *</label><select id="p_dept">${depts.map(x => `<option value="${x.dept_id}" ${d.dept_id == x.dept_id ? 'selected' : ''}>${esc(x.dept_name_en)}</option>`).join('')}</select></div>
  <div class="fg-row">
    <div class="fg"><label>Code *</label><input id="p_code" value="${esc(d.program_code || '')}"></div>
    <div class="fg"><label>Degree Level</label><select id="p_level">
      <option value="Associate" ${d.degree_level==='Associate'?'selected':''}>Associate</option>
      <option value="Bachelor" ${!d.degree_level||d.degree_level==='Bachelor'?'selected':''}>Bachelor</option>
      <option value="Master" ${d.degree_level==='Master'?'selected':''}>Master</option>
      <option value="Doctorate" ${d.degree_level==='Doctorate'?'selected':''}>Doctorate</option>
    </select></div>
  </div>
  <div class="fg"><label>Name (English) *</label><input id="p_name_en" value="${esc(d.program_name_en || '')}"></div>
  <div class="fg"><label>Name (Khmer)</label><input id="p_name_km" value="${esc(d.program_name_km || '')}"></div>
  <div class="fg-row">
    <div class="fg"><label>Duration (years)</label><input id="p_dur" type="number" value="${d.duration_years || 4}" min="1" max="7"></div>
    <div class="fg"><label>Total Credits</label><input id="p_cred" type="number" value="${d.total_credits || 180}" min="30"></div>
  </div>`;
}

function progAdd(d) { openModal('Add Program', '', progForm({}, d), async () => { const r = await post('program_add', { dept_id: val('p_dept'), program_code: val('p_code'), program_name_en: val('p_name_en'), program_name_km: val('p_name_km'), degree_level: val('p_level'), duration_years: val('p_dur'), total_credits: val('p_cred') }); if (r.ok) { toast('Program added'); closeModal(); pages.programs(); } else toast(r.error, 'err'); }, 'Add Program'); }
function progEdit(d, dpts) { openModal('Edit Program', '', progForm(d, dpts), async () => { const r = await post('program_edit', { program_id: d.program_id, dept_id: val('p_dept'), program_code: val('p_code'), program_name_en: val('p_name_en'), program_name_km: val('p_name_km'), degree_level: val('p_level'), duration_years: val('p_dur'), total_credits: val('p_cred'), is_active: 1 }); if (r.ok) { toast('Updated'); closeModal(); pages.programs(); } else toast(r.error, 'err'); }, 'Save'); }
function delProg(id, name) { confirm2('Delete Program', `Delete "${name}"?`, async () => { const r = await post('program_delete', { id }); if (r.ok) { toast('Deleted'); pages.programs(); } else toast(r.error, 'err'); }); }
