//  ICB — Classrooms Page

pages.classrooms = async function () {
  const r = await get('classrooms');
  const rows = r.ok ? r.data : [];
  makePage(`
  <div class="page-hdr">
    <div><h2>Classrooms</h2><div class="page-hdr-sub">Rooms, labs and exam halls</div></div>
    <div class="page-hdr-actions"><button class="btn btn-primary" onclick="roomAdd()"><i class="fas fa-plus"></i> Add Room</button></div>
  </div>
  <div class="card"><div class="table-wrap"><table>
    <thead><tr><th>Code</th><th>Building</th><th>Floor</th><th>Type</th><th>Capacity</th><th>Projector</th><th>AC</th><th>Status</th><th>Actions</th></tr></thead>
    <tbody>${rows.length ? rows.map(x => `
      <tr>
        <td><strong>${esc(x.room_code)}</strong></td>
        <td>${esc(x.building || '—')}</td>
        <td>${x.floor != null ? x.floor : '—'}</td>
        <td><span class="badge badge-active">${esc(x.room_type)}</span></td>
        <td>${x.capacity}</td>
        <td>${x.has_projector ? '<i class="fas fa-check" style="color:var(--green)"></i>' : '<i class="fas fa-xmark" style="color:#ccc"></i>'}</td>
        <td>${x.has_ac ? '<i class="fas fa-check" style="color:var(--green)"></i>' : '<i class="fas fa-xmark" style="color:#ccc"></i>'}</td>
        <td>${x.is_active ? '<span class="badge badge-active">Active</span>' : '<span class="badge badge-withdrawn">Inactive</span>'}</td>
        <td class="td-actions">
          <button class="btn btn-ghost btn-sm btn-icon" onclick='roomEdit(${JSON.stringify(x)})'><i class="fas fa-pen"></i></button>
          <button class="btn btn-danger btn-sm btn-icon" onclick="delRoom(${x.room_id},'${esc(x.room_code)}')"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('') : '<tr><td colspan="9">' + emptyState() + '</td></tr>'}
    </tbody>
  </table></div></div>`);
};

function roomForm(d = {}) {
  return `
  <div class="fg-row">
    <div class="fg"><label>Room Code *</label><input id="r_code" value="${esc(d.room_code || '')}" placeholder="B101"></div>
    <div class="fg"><label>Type</label><select id="r_type">
      <option ${d.room_type==='Lecture'||!d.room_type?'selected':''}>Lecture</option>
      <option ${d.room_type==='Lab'?'selected':''}>Lab</option>
      <option ${d.room_type==='Seminar'?'selected':''}>Seminar</option>
      <option value="Exam Hall" ${d.room_type==='Exam Hall'?'selected':''}>Exam Hall</option>
      <option value="Computer Lab" ${d.room_type==='Computer Lab'?'selected':''}>Computer Lab</option>
    </select></div>
  </div>
  <div class="fg-row">
    <div class="fg"><label>Building</label><input id="r_bldg" value="${esc(d.building || '')}" placeholder="Block B"></div>
    <div class="fg"><label>Floor</label><input id="r_floor" type="number" value="${d.floor || ''}" placeholder="1"></div>
  </div>
  <div class="fg"><label>Capacity</label><input id="r_cap" type="number" value="${d.capacity || 40}"></div>
  <div class="fg-row">
    <div class="fg"><label>Projector</label><select id="r_proj"><option value="1" ${d.has_projector?'selected':''}>Yes</option><option value="0" ${!d.has_projector?'selected':''}>No</option></select></div>
    <div class="fg"><label>Air Conditioning</label><select id="r_ac"><option value="1" ${d.has_ac?'selected':''}>Yes</option><option value="0" ${!d.has_ac?'selected':''}>No</option></select></div>
  </div>`;
}

function roomAdd() { openModal('Add Classroom', '', roomForm(), async () => { const r = await post('classroom_add', { room_code: val('r_code'), building: val('r_bldg'), floor: val('r_floor'), room_type: val('r_type'), capacity: val('r_cap'), has_projector: val('r_proj'), has_ac: val('r_ac') }); if (r.ok) { toast('Room added'); closeModal(); pages.classrooms(); } else toast(r.error, 'err'); }, 'Add Room'); }
function roomEdit(d) { openModal('Edit Classroom', '', roomForm(d), async () => { const r = await post('classroom_edit', { room_id: d.room_id, room_code: val('r_code'), building: val('r_bldg'), floor: val('r_floor'), room_type: val('r_type'), capacity: val('r_cap'), has_projector: val('r_proj'), has_ac: val('r_ac'), is_active: 1 }); if (r.ok) { toast('Updated'); closeModal(); pages.classrooms(); } else toast(r.error, 'err'); }, 'Save'); }
function delRoom(id, name) { confirm2('Delete Room', `Delete room "${name}"?`, async () => { const r = await post('classroom_delete', { id }); if (r.ok) { toast('Deleted'); pages.classrooms(); } else toast(r.error, 'err'); }); }