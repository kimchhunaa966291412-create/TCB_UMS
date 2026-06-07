<?php
// ── DEPARTMENTS ───────────────────────────────────────────

switch ($action) {

    case 'departments':
        ok(q("SELECT d.*,f.faculty_name_en,COUNT(p.program_id) AS prog_count FROM department d JOIN faculty_academic f ON f.faculty_id=d.faculty_id LEFT JOIN program p ON p.dept_id=d.dept_id GROUP BY d.dept_id ORDER BY d.dept_name_en"));
        break;

    case 'dept_add':
        $f = $_POST;
        db()->prepare("INSERT INTO department(faculty_id,dept_code,dept_name_en,dept_name_km,head)VALUES(?,?,?,?,?)")
            ->execute([$f['faculty_id'], $f['dept_code'], $f['dept_name_en'], $f['dept_name_km'] ?? null, $f['head'] ?? null]);
        $id = lastId();
        audit('dept_add', 'department', $id, $f['dept_name_en']);
        ok(['id' => $id]);
        break;

    case 'dept_edit':
        $f  = $_POST;
        $id = (int) ($f['dept_id'] ?? 0);
        db()->prepare("UPDATE department SET faculty_id=?,dept_code=?,dept_name_en=?,dept_name_km=?,head=?,is_active=? WHERE dept_id=?")
            ->execute([$f['faculty_id'], $f['dept_code'], $f['dept_name_en'], $f['dept_name_km'] ?? null, $f['head'] ?? null, (int) ($f['is_active'] ?? 1), $id]);
        audit('dept_edit', 'department', $id);
        ok();
        break;

    case 'dept_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM department WHERE dept_id=?", [$id]);
        audit('dept_delete', 'department', $id);
        ok();
        break;
}
