// ICB — Final Grades Page
pages.grades=async function(){
  const r=await get('final_grades');const rows=r.ok?r.data:[];
  makePage(`
  <div class="page-hdr"><div><h2>Final Grades</h2><div class="page-hdr-sub">Computed and finalized course grades</div></div></div>
  <div class="card"><div class="table-wrap"><table>
  <thead><tr><th>Student</th><th>Course</th><th>Year/Sem</th><th>Score</th><th>Grade</th><th>GP</th><th>Passed</th><th>Status</th><th>Actions</th></tr></thead>
  <tbody>${rows.length?rows.map(x=>`
    <tr>
      <td><div style="font-weight:600;font-size:.8rem">${esc(x.full_name_en)}</div><div style="font-size:.7rem;color:var(--light)">${esc(x.student_code)}</div></td>
      <td><div style="font-size:.78rem;font-weight:500">${esc(x.course_name_en)}</div><div style="font-size:.7rem;color:var(--light)">${esc(x.course_code)} · ${x.credit_hours} cr</div></td>
      <td style="font-size:.75rem">${esc(x.academic_year)} · ${esc(x.semester)}</td>
      <td><strong>${parseFloat(x.total_weighted_score).toFixed(2)}</strong></td>
      <td>${gradeBadge(x.letter_grade)}</td>
      <td>${parseFloat(x.grade_point).toFixed(1)}</td>
      <td>${x.is_passed?'<i class="fas fa-check" style="color:var(--green)"></i>':'<i class="fas fa-xmark" style="color:var(--red)"></i>'}</td>
      <td>${x.is_finalized?'<span class="badge badge-finalized"><i class="fas fa-lock"></i> Finalized</span>':'<span class="badge badge-pending">Pending</span>'}</td>
      <td class="td-actions">
        ${!x.is_finalized?`<button class="btn btn-success btn-sm" onclick="finalizeGrade(${x.grade_id})"><i class="fas fa-lock"></i> Finalize</button>`:''}
        ${x.is_finalized&&currentUser.role==='admin'?`<button class="btn btn-ghost btn-sm" onclick="unfinalizeGrade(${x.grade_id})"><i class="fas fa-lock-open"></i></button>`:''}
      </td>
    </tr>`).join(''):'<tr><td colspan="9">'+emptyState()+'</td></tr>'}
  </tbody></table></div></div>`);
};
async function finalizeGrade(id){const r=await post('finalize_grade',{grade_id:id});if(r.ok){toast('Grade finalized');pages.grades();loadBadges();}else toast(r.error,'err');}
async function unfinalizeGrade(id){const r=await post('unfinalize_grade',{grade_id:id});if(r.ok){toast('Unfinalized');pages.grades();}else toast(r.error,'err');}
