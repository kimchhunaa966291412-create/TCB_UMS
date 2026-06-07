
//  ICB — Faculties Page

pages.faculties = async function () {
  const r = await get('faculties');
  const rows = r.ok ? r.data : [];
  makePage(`
  <div class="page-hdr">
    <div><h2>Faculties</h2><div class="page-hdr-sub">Academic faculties of ITC</div></div>
    <div class="page-hdr-actions"><button class="btn btn-primary" onclick="facultyAdd()"><i class="fas fa-plus"></i> Add Faculty</button></div>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Code</th><th>Name (EN)</th><th>Dean</th><th>Departments</th><th>Est.</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${rows.length ? rows.map(x => `
      <tr>
        <td><code style="font-size:.75rem;background:var(--sky-lt);color:var(--sky2);padding:.15rem .4rem;border-radius:5px">${esc(x.faculty_code)}</code></td>
        <td><div style="font-weight:600">${esc(x.faculty_name_en)}</div>${x.faculty_name_km ? `<div style="font-size:.72rem;color:var(--light)">${esc(x.faculty_name_km)}</div>` : ''}</td>
        <td>${esc(x.dean || '—')}</td>
        <td><span class="badge badge-active">${x.dept_count} depts</span></td>
        <td>${x.established_year || '—'}</td>
        <td>${x.is_active ? '<span class="badge badge-active">Active</span>' : '<span class="badge badge-withdrawn">Inactive</span>'}</td>
        <td class="td-actions">
          <button class="btn btn-ghost btn-sm btn-icon" onclick='facultyEdit(${JSON.stringify(x)})'><i class="fas fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="delFaculty(${x.faculty_id},'${esc(x.faculty_name_en)}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('') : '<tr><td colspan="7">' + emptyState() + '</td></tr>'}
    </tbody>
  </table></div></div>`);
};

function facultyForm(d = {}) {
  return `
  <div class="fg-row">
    <div class="fg"><label>Code *</label><input id="f_code" value="${esc(d.faculty_code || '')}" placeholder="FITE"></div>
    <div class="fg"><label>Est. Year</label><input id="f_year" type="number" value="${esc(d.established_year || '')}" placeholder="2002"></div>
  </div>
  <div class="fg"><label>Name (English) *</label><input id="f_name_en" value="${esc(d.faculty_name_en || '')}" placeholder="Faculty of Information Technology"></div>
  <div class="fg"><label>Name (Khmer)</label><input id="f_name_km" value="${esc(d.faculty_name_km || '')}" placeholder="ខ្មែរ"></div>
  <div class="fg"><label>Dean</label><input id="f_dean" value="${esc(d.dean || '')}" placeholder="Prof. Dr. Name"></div>
  ${d.faculty_id ? `<div class="fg"><label>Status</label><select id="f_active"><option value="1" ${d.is_active ? 'selected' : ''}>Active</option><option value="0" ${!d.is_active ? 'selected' : ''}>Inactive</option></select></div>` : ''}`;
}

function facultyAdd() {
  openModal('Add Faculty', 'Create a new academic faculty', facultyForm(), async () => {
    const r = await post('faculty_add', { faculty_code: val('f_code'), faculty_name_en: val('f_name_en'), faculty_name_km: val('f_name_km'), dean: val('f_dean'), established_year: val('f_year') });
    if (r.ok) { toast('Faculty added'); closeModal(); pages.faculties(); } else toast(r.error, 'err');
  }, 'Add Faculty');
}

function facultyEdit(d) {
  openModal('Edit Faculty', 'Update faculty details', facultyForm(d), async () => {
    const r = await post('faculty_edit', { faculty_id: d.faculty_id, faculty_code: val('f_code'), faculty_name_en: val('f_name_en'), faculty_name_km: val('f_name_km'), dean: val('f_dean'), established_year: val('f_year'), is_active: val('f_active') });
    if (r.ok) { toast('Faculty updated'); closeModal(); pages.faculties(); } else toast(r.error, 'err');
  }, 'Save Changes');
}

function delFaculty(id, name) {
  confirm2('Delete Faculty', `Delete "${name}"? This will fail if departments exist.`, async () => {
    const r = await post('faculty_delete', { id });
    if (r.ok) { toast('Deleted'); pages.faculties(); } else toast(r.error, 'err');
  });
}
