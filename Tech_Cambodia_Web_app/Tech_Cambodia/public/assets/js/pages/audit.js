// ICB — Audit Log Page
let _auditPage=1;
pages.audit=async function(pg=1){
  _auditPage=pg;const r=await get('auditlog',{page:pg});
  if(!r.ok){makePage(emptyState('Failed to load'));return;}const rows=r.data;
  makePage(`
  <div class="page-hdr"><div><h2>Audit Log</h2><div class="page-hdr-sub">${r.total} total entries</div></div>
  <div class="page-hdr-actions">${currentUser.role==='admin'?`<button class="btn btn-danger" onclick="clearAudit()"><i class="fas fa-trash"></i> Clear Log</button>`:''}</div></div>
  <div class="card"><div class="table-wrap"><table>
  <thead><tr><th>#</th><th>Action</th><th>Table</th><th>Record ID</th><th>User</th><th>IP</th><th>Details</th><th>Time</th></tr></thead>
  <tbody>${rows.length?rows.map(x=>`
    <tr>
      <td style="font-size:.72rem;color:var(--light)">${x.log_id}</td>
      <td><code style="font-size:.72rem;background:var(--sky-lt);color:var(--sky2);padding:.15rem .4rem;border-radius:5px">${esc(x.action)}</code></td>
      <td style="font-size:.75rem;color:var(--light)">${esc(x.table_name||'—')}</td>
      <td style="font-size:.75rem">${x.record_id||'—'}</td>
      <td style="font-size:.78rem">${esc(x.full_name||'System')}</td>
      <td style="font-size:.72rem;color:var(--light);font-family:monospace">${esc(x.ip_address||'')}</td>
      <td style="font-size:.72rem;color:var(--light);max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(x.details||'')}</td>
      <td style="font-size:.72rem;color:var(--light);white-space:nowrap">${fmtDate(x.created_at)}</td>
    </tr>`).join(''):'<tr><td colspan="8">'+emptyState()+'</td></tr>'}
  </tbody></table></div>${renderPager(r.page,r.pages,'pages.audit')}</div>`);
};
function clearAudit(){confirm2('Clear Audit Log','Delete all audit log entries? This cannot be undone.',async()=>{const r=await post('auditlog_clear');if(r.ok){toast('Log cleared');pages.audit();}else toast(r.error,'err');},'Clear All');}
