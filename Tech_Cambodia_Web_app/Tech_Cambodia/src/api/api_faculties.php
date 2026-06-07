<?php
// ── FACULTIES ─────────────────────────────────────────────

switch ($action) {

    case 'faculties':
        ok(q("SELECT f.*,COUNT(d.dept_id) AS dept_count FROM faculty_academic f LEFT JOIN department d ON d.faculty_id=f.faculty_id GROUP BY f.faculty_id ORDER BY f.faculty_name_en"));
        break;

    case 'faculty_add':
        $f = $_POST;
        db()->prepare("INSERT INTO faculty_academic(faculty_code,faculty_name_en,faculty_name_km,dean,established_year)VALUES(?,?,?,?,?)")
            ->execute([$f['faculty_code'], $f['faculty_name_en'], $f['faculty_name_km'] ?? null, $f['dean'] ?? null, $f['established_year'] ?? null]);
        $id = lastId();
        audit('faculty_add', 'faculty_academic', $id, $f['faculty_name_en']);
        ok(['id' => $id]);
        break;

    case 'faculty_edit':
        $f  = $_POST;
        $id = (int) ($f['faculty_id'] ?? 0);
        db()->prepare("UPDATE faculty_academic SET faculty_code=?,faculty_name_en=?,faculty_name_km=?,dean=?,established_year=?,is_active=? WHERE faculty_id=?")
            ->execute([$f['faculty_code'], $f['faculty_name_en'], $f['faculty_name_km'] ?? null, $f['dean'] ?? null, $f['established_year'] ?? null, (int) ($f['is_active'] ?? 1), $id]);
        audit('faculty_edit', 'faculty_academic', $id);
        ok();
        break;

    case 'faculty_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM faculty_academic WHERE faculty_id=?", [$id]);
        audit('faculty_delete', 'faculty_academic', $id);
        ok();
        break;
}
