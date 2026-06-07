<?php
// ── COURSES ───────────────────────────────────────────────

switch ($action) {

    case 'courses':
        ok(q("SELECT c.*,d.dept_name_en,f.faculty_name_en,pre.course_code AS prereq_code,pre.course_name_en AS prereq_name FROM course c JOIN department d ON d.dept_id=c.dept_id JOIN faculty_academic f ON f.faculty_id=d.faculty_id LEFT JOIN course pre ON pre.course_id=c.prerequisite_course_id ORDER BY c.course_code"));
        break;

    case 'course_add':
        $f = $_POST;
        db()->prepare("INSERT INTO course(dept_id,course_code,course_name_en,course_name_km,credit_hours,lecture_hours,lab_hours,course_level,course_type,description,prerequisite_course_id)VALUES(?,?,?,?,?,?,?,?,?,?,?)")
            ->execute([$f['dept_id'], $f['course_code'], $f['course_name_en'], $f['course_name_km'] ?? null, (int) ($f['credit_hours'] ?? 3), $f['lecture_hours'] ?? null, (float) ($f['lab_hours'] ?? 0), $f['course_level'] ?? '100', $f['course_type'] ?? 'Core', $f['description'] ?? null, ($f['prerequisite_course_id'] ?? '') ?: null]);
        $id = lastId();
        audit('course_add', 'course', $id, $f['course_name_en']);
        ok(['id' => $id]);
        break;

    case 'course_edit':
        $f  = $_POST;
        $id = (int) ($f['course_id'] ?? 0);
        db()->prepare("UPDATE course SET dept_id=?,course_code=?,course_name_en=?,course_name_km=?,credit_hours=?,lecture_hours=?,lab_hours=?,course_level=?,course_type=?,description=?,prerequisite_course_id=?,is_active=? WHERE course_id=?")
            ->execute([$f['dept_id'], $f['course_code'], $f['course_name_en'], $f['course_name_km'] ?? null, (int) ($f['credit_hours'] ?? 3), $f['lecture_hours'] ?? null, (float) ($f['lab_hours'] ?? 0), $f['course_level'] ?? '100', $f['course_type'] ?? 'Core', $f['description'] ?? null, ($f['prerequisite_course_id'] ?? '') ?: null, (int) ($f['is_active'] ?? 1), $id]);
        audit('course_edit', 'course', $id);
        ok();
        break;

    case 'course_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM course WHERE course_id=?", [$id]);
        audit('course_delete', 'course', $id);
        ok();
        break;
}
