<?php
// ── PROGRAMS ──────────────────────────────────────────────

switch ($action) {

    case 'programs':
        ok(q("SELECT p.*,d.dept_name_en,f.faculty_name_en,COUNT(s.student_id) AS student_count FROM program p JOIN department d ON d.dept_id=p.dept_id JOIN faculty_academic f ON f.faculty_id=d.faculty_id LEFT JOIN student s ON s.program_id=p.program_id GROUP BY p.program_id ORDER BY p.program_name_en"));
        break;

    case 'program_add':
        $f = $_POST;
        db()->prepare("INSERT INTO program(dept_id,program_code,program_name_en,program_name_km,degree_level,duration_years,total_credits)VALUES(?,?,?,?,?,?,?)")
            ->execute([$f['dept_id'], $f['program_code'], $f['program_name_en'], $f['program_name_km'] ?? null, $f['degree_level'] ?? 'Bachelor', (int) ($f['duration_years'] ?? 4), (int) ($f['total_credits'] ?? 180)]);
        $id = lastId();
        audit('program_add', 'program', $id, $f['program_name_en']);
        ok(['id' => $id]);
        break;

    case 'program_edit':
        $f  = $_POST;
        $id = (int) ($f['program_id'] ?? 0);
        db()->prepare("UPDATE program SET dept_id=?,program_code=?,program_name_en=?,program_name_km=?,degree_level=?,duration_years=?,total_credits=?,is_active=? WHERE program_id=?")
            ->execute([$f['dept_id'], $f['program_code'], $f['program_name_en'], $f['program_name_km'] ?? null, $f['degree_level'] ?? 'Bachelor', (int) ($f['duration_years'] ?? 4), (int) ($f['total_credits'] ?? 180), (int) ($f['is_active'] ?? 1), $id]);
        audit('program_edit', 'program', $id);
        ok();
        break;

    case 'program_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM program WHERE program_id=?", [$id]);
        audit('program_delete', 'program', $id);
        ok();
        break;
}
