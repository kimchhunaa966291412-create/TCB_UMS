<?php
// ── GPA RECORDS ───────────────────────────────────────────

switch ($action) {

    case 'gpa_records':
        $sid = (int) ($_GET['student_id'] ?? 0);
        $w   = $sid ? "WHERE g.student_id=$sid" : '';
        ok(q("SELECT g.*,CONCAT(s.first_name_en,' ',s.last_name_en) AS full_name_en,s.student_code,p.program_name_en FROM gpa_record g JOIN student s ON s.student_id=g.student_id JOIN program p ON p.program_id=s.program_id $w ORDER BY g.academic_year DESC,g.semester"));
        break;

    case 'gpa_upsert':
        $f        = $_POST;
        $standing = gpaStanding((float) ($f['cumulative_gpa'] ?? 0));
        db()->prepare("INSERT INTO gpa_record(student_id,academic_year,semester,credits_attempted,credits_earned,semester_gpa,cumulative_gpa,academic_standing)VALUES(?,?,?,?,?,?,?,?) ON DUPLICATE KEY UPDATE credits_attempted=VALUES(credits_attempted),credits_earned=VALUES(credits_earned),semester_gpa=VALUES(semester_gpa),cumulative_gpa=VALUES(cumulative_gpa),academic_standing=VALUES(academic_standing)")
            ->execute([$f['student_id'], $f['academic_year'], $f['semester'], (int) ($f['credits_attempted'] ?? 0), (int) ($f['credits_earned'] ?? 0), (float) ($f['semester_gpa'] ?? 0), (float) ($f['cumulative_gpa'] ?? 0), $standing]);
        ok(['academic_standing' => $standing]);
        break;

    case 'gpa_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM gpa_record WHERE gpa_id=?", [$id]);
        ok();
        break;
}
