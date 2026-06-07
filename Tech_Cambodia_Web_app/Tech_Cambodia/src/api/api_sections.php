<?php
// ── SECTIONS ──────────────────────────────────────────────

switch ($action) {

    case 'sections':
        $rows = q("SELECT s.*,c.course_code,c.course_name_en,c.credit_hours,r.room_code FROM academic_section s JOIN course c ON c.course_id=s.course_id LEFT JOIN classroom r ON r.room_id=s.room_id ORDER BY s.academic_year DESC,s.semester,s.section_code");
        ok($rows);
        break;

    case 'section_add':
        $f = $_POST;
        db()->prepare("INSERT INTO academic_section(section_code,course_id,instructor,academic_year,semester,room_id,schedule_day,time_start,time_end,capacity,delivery_mode)VALUES(?,?,?,?,?,?,?,?,?,?,?)")
            ->execute([$f['section_code'], $f['course_id'], $f['instructor'] ?? null, $f['academic_year'], $f['semester'] ?? 'Semester1', ($f['room_id'] ?? '') ?: null, $f['schedule_day'] ?? null, $f['time_start'] ?? null, $f['time_end'] ?? null, (int) ($f['capacity'] ?? 40), $f['delivery_mode'] ?? 'In-Person']);
        ok(['id' => lastId()]);
        break;

    case 'section_edit':
        $f  = $_POST;
        $id = (int) ($f['section_id'] ?? 0);
        db()->prepare("UPDATE academic_section SET section_code=?,course_id=?,instructor=?,academic_year=?,semester=?,room_id=?,schedule_day=?,time_start=?,time_end=?,capacity=?,delivery_mode=?,is_active=? WHERE section_id=?")
            ->execute([$f['section_code'], $f['course_id'], $f['instructor'] ?? null, $f['academic_year'], $f['semester'] ?? 'Semester1', ($f['room_id'] ?? '') ?: null, $f['schedule_day'] ?? null, $f['time_start'] ?? null, $f['time_end'] ?? null, (int) ($f['capacity'] ?? 40), $f['delivery_mode'] ?? 'In-Person', (int) ($f['is_active'] ?? 1), $id]);
        ok();
        break;

    case 'section_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM academic_section WHERE section_id=?", [$id]);
        ok();
        break;
}
