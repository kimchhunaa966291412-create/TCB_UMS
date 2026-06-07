// ICB — System Users Page
pages.users=async function(){
  if(currentUser.role!=='admin'){makePage(`<div class="empty"><i class="fas fa-lock"></i><p>Admin access required</p></div>`);return;}
  const r=await get('users');const rows=r.ok?r.data:[];
  makePage(`
  <div class="page-hdr"><div><h2>System Users</h2><div class="page-hdr-sub">Manage portal access</div></div>
  <div class="page-hdr-actions"><button class="btn btn-primary" onclick="userAdd()"><i class="fas fa-plus"></i> Add User</button></div></div>
  <div class="card"><div class="table-wrap"><table>
  <thead><tr><th>Username</th><th>Full Name</th><th>Email</th><th>Role</th><th>Status</th><th>Created</th><th>Actions</th></tr></thead>
  <tbody>${rows.length?rows.map(x=>`
    <tr>
      <td><strong>${esc(x.username)}</strong></td><td>${esc(x.full_name)}</td>
      <td style="font-size:.78rem;color:var(--light)">${esc(x.email)}</td>
      <td>${roleBadge(x.role)}</td>
      <td>${x.is_active?'<span class="badge badge-active">Active</span>':'<span class="badge badge-withdrawn">Inactive</span>'}</td>
      <td style="font-size:.75rem;color:var(--light)">${fmtDate(x.created_at)}</td>
      <td class="td-actions">
        <button class="btn btn-ghost btn-sm btn-icon" onclick='userEdit(${JSON.stringify(x)})'><i class="fas fa-pen"></i></button>
        <button class="btn btn-danger btn-sm btn-icon" onclick="delUser(${x.user_id},'${esc(x.username)}')"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join(''):'<tr><td colspan="7">'+emptyState()+'</td></tr>'}
  </tbody></table></div></div>`);
};
function userForm(d={}){return `
  <div class="fg-row"><div class="fg"><label>Username *</label><input id="u_uname" value="${esc(d.username||'')}"></div><div class="fg"><label>Role</label><select id="u_role"><option value="admin" ${d.role==='admin'?'selected':''}>Admin</option><option value="registrar" ${d.role==='registrar'?'selected':''}>Registrar</option><option value="lecturer" ${d.role==='lecturer'||!d.role?'selected':''}>Lecturer</option><option value="staff" ${d.role==='staff'?'selected':''}>Staff</option></select></div></div>
  <div class="fg"><label>Full Name</label><input id="u_fn" value="${esc(d.full_name||'')}"></div>
  <div class="fg"><label>Email *</label><input id="u_email" type="email" value="${esc(d.email||'')}"></div>
  <div class="fg"><label>${d.user_id?'New Password (blank = unchanged)':'Password *'}</label><input id="u_pw" type="password" placeholder="Min 6 characters"></div>
  ${d.user_id?`<div class="fg"><label>Status</label><select id="u_active"><option value="1" ${d.is_active?'selected':''}>Active</option><option value="0">Inactive</option></select></div>`:''}`;}
function userAdd(){openModal('Add User','Create system account',userForm(),async()=>{const r=await post('user_add',{username:val('u_uname'),full_name:val('u_fn'),email:val('u_email'),password:val('u_pw'),role:val('u_role')});if(r.ok){toast('User added');closeModal();pages.users();}else toast(r.error,'err');},'Add User');}
function userEdit(d){openModal('Edit User','',userForm(d),async()=>{const r=await post('user_edit',{user_id:d.user_id,username:val('u_uname'),full_name:val('u_fn'),email:val('u_email'),password:val('u_pw'),role:val('u_role'),is_active:val('u_active')});if(r.ok){toast('Updated');closeModal();pages.users();}else toast(r.error,'err');},'Save');}
function delUser(id,name){confirm2('Delete User',`Delete user "${name}"?`,async()=>{const r=await post('user_delete',{id});if(r.ok){toast('Deleted');pages.users();}else toast(r.error,'err');});}
