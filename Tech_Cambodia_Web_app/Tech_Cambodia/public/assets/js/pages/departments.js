
//  ICB — Departments Page

pages.departments = async function () {
  const [r, fr] = await Promise.all([get('departments'), get('list_faculties')]);
  const rows = r.ok ? r.data : [];
  makePage(`
  <div class="page-hdr">
    <div><h2>Departments</h2><div class="page-hdr-sub">Manage academic departments</div></div>
    <div class="page-hdr-actions"><button class="btn btn-primary" onclick='deptAdd(${JSON.stringify(fr.ok ? fr.data : [])})'><i class="fas fa-plus"></i> Add Department</button></div>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Code</th><th>Name</th><th>Faculty</th><th>Head</th><th>Programs</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${rows.length ? rows.map(x => `
      <tr>
        <td><code style="font-size:.75rem;background:var(--mist);padding:.15rem .4rem;border-radius:5px">${esc(x.dept_code)}</code></td>
        <td><div style="font-weight:600">${esc(x.dept_name_en)}</div></td>
        <td style="font-size:.78rem;color:var(--light)">${esc(x.faculty_name_en)}</td>
        <td>${esc(x.head || '—')}</td>
        <td><span class="badge badge-active">${x.prog_count}</span></td>
        <td>${x.is_active ? '<span class="badge badge-active">Active</span>' : '<span class="badge badge-withdrawn">Inactive</span>'}</td>
        <td class="td-actions">
          <button class="btn btn-ghost btn-sm btn-icon" onclick='deptEdit(${JSON.stringify(x)},${JSON.stringify(fr.ok ? fr.data : [])})'><i class="fas fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="delDept(${x.dept_id},'${esc(x.dept_name_en)}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('') : '<tr><td colspan="7">' + emptyState() + '</td></tr>'}
    </tbody>
  </table></div></div>`);
};

function deptForm(d = {}, faculties = []) {
  return `
  <div class="fg"><label>Faculty *</label><select id="d_faculty">${faculties.map(f => `<option value="${f.faculty_id}" ${d.faculty_id == f.faculty_id ? 'selected' : ''}>${esc(f.faculty_name_en)}</option>`).join('')}</select></div>
  <div class="fg-row">
    <div class="fg"><label>Code *</label><input id="d_code" value="${esc(d.dept_code || '')}" placeholder="ITE"></div>
    <div class="fg"><label>Head</label><input id="d_head" value="${esc(d.head || '')}" placeholder="Dr. Name"></div>
  </div>
  <div class="fg"><label>Name (English) *</label><input id="d_name_en" value="${esc(d.dept_name_en || '')}" placeholder="Department of…"></div>
  <div class="fg"><label>Name (Khmer)</label><input id="d_name_km" value="${esc(d.dept_name_km || '')}" placeholder="ខ្មែរ"></div>
  ${d.dept_id ? `<div class="fg"><label>Status</label><select id="d_active"><option value="1" ${d.is_active ? 'selected' : ''}>Active</option><option value="0">Inactive</option></select></div>` : ''}`;
}

function deptAdd(f) {
  openModal('Add Department', '', deptForm({}, f), async () => {
    const r = await post('dept_add', { faculty_id: val('d_faculty'), dept_code: val('d_code'), dept_name_en: val('d_name_en'), dept_name_km: val('d_name_km'), head: val('d_head') });
    if (r.ok) { toast('Department added'); closeModal(); pages.departments(); } else toast(r.error, 'err');
  }, 'Add Department');
}

function deptEdit(d, f) {
  openModal('Edit Department', '', deptForm(d, f), async () => {
    const r = await post('dept_edit', { dept_id: d.dept_id, faculty_id: val('d_faculty'), dept_code: val('d_code'), dept_name_en: val('d_name_en'), dept_name_km: val('d_name_km'), head: val('d_head'), is_active: val('d_active') });
    if (r.ok) { toast('Updated'); closeModal(); pages.departments(); } else toast(r.error, 'err');
  }, 'Save Changes');
}

function delDept(id, name) {
  confirm2('Delete Department', `Delete "${name}"?`, async () => {
    const r = await post('dept_delete', { id });
    if (r.ok) { toast('Deleted'); pages.departments(); } else toast(r.error, 'err');
  });
}
