<?php
// ── ENROLLMENTS ───────────────────────────────────────────

switch ($action) {

    case 'enrollments':
        $sid   = (int) ($_GET['student_id'] ?? 0);
        $secid = (int) ($_GET['section_id'] ?? 0);
        $w = 'WHERE 1=1';
        if ($sid)   $w .= " AND e.student_id=$sid";
        if ($secid) $w .= " AND e.section_id=$secid";
        ok(q("SELECT e.*,CONCAT(s.first_name_en,' ',s.last_name_en) AS full_name_en,s.student_code,c.course_name_en,c.course_code,sec.section_code,sec.academic_year,sec.semester FROM enrollment e JOIN student s ON s.student_id=e.student_id JOIN academic_section sec ON sec.section_id=e.section_id JOIN course c ON c.course_id=sec.course_id $w ORDER BY e.created_at DESC LIMIT 300"));
        break;

    case 'enrollment_add':
        $f   = $_POST;
        $sec = q1("SELECT capacity,enrolled_count FROM academic_section WHERE section_id=?", [$f['section_id']]);
        if ($sec && $sec['enrolled_count'] >= $sec['capacity']) { err('Section is at full capacity'); break; }
        $dup = qv("SELECT COUNT(*) FROM enrollment WHERE student_id=? AND section_id=?", [$f['student_id'], $f['section_id']]);
        if ($dup) { err('Student already enrolled in this section'); break; }
        db()->prepare("INSERT INTO enrollment(student_id,section_id,enrollment_date,enrollment_type,status)VALUES(?,?,?,?,?)")
            ->execute([$f['student_id'], $f['section_id'], $f['enrollment_date'] ?? date('Y-m-d'), $f['enrollment_type'] ?? 'Regular', $f['status'] ?? 'Enrolled']);
        $eid = lastId();
        qx("UPDATE academic_section SET enrolled_count=enrolled_count+1 WHERE section_id=?", [$f['section_id']]);
        ok(['id' => $eid]);
        break;

    case 'enrollment_edit':
        $f  = $_POST;
        $id = (int) ($f['enrollment_id'] ?? 0);
        db()->prepare("UPDATE enrollment SET status=?,drop_date=?,drop_reason=? WHERE enrollment_id=?")
            ->execute([$f['status'], $f['drop_date'] ?? null, $f['drop_reason'] ?? null, $id]);
        if ($f['status'] === 'Dropped') {
            qx("UPDATE academic_section SET enrolled_count=GREATEST(0,enrolled_count-1) WHERE section_id=(SELECT section_id FROM enrollment WHERE enrollment_id=?)", [$id]);
        }
        ok();
        break;

    case 'enrollment_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM enrollment WHERE enrollment_id=?", [$id]);
        ok();
        break;
}
