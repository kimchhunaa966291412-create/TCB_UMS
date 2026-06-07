<?php
// ── EXAM RESULTS ──────────────────────────────────────────

switch ($action) {

    case 'exam_results':
        $eid = (int) ($_GET['exam_id'] ?? 0);
        $sid = (int) ($_GET['student_id'] ?? 0);
        $w   = 'WHERE 1=1';
        if ($eid) $w .= " AND r.exam_id=$eid";
        if ($sid) $w .= " AND r.student_id=$sid";
        ok(q("SELECT r.*,CONCAT(s.first_name_en,' ',s.last_name_en) AS full_name_en,s.student_code,ex.exam_name,ex.exam_type,ex.total_marks,c.course_name_en FROM exam_result r JOIN student s ON s.student_id=r.student_id JOIN examination ex ON ex.exam_id=r.exam_id JOIN academic_section sec ON sec.section_id=ex.section_id JOIN course c ON c.course_id=sec.course_id $w ORDER BY r.entry_date DESC LIMIT 500"));
        break;

    case 'exam_result_add':
        $f    = $_POST;
        $exam = q1("SELECT total_marks,section_id FROM examination WHERE exam_id=?", [$f['exam_id']]);
        if (!$exam) { err('Exam not found'); break; }
        $score = min((float) ($f['marks_obtained'] ?? 0), (float) $exam['total_marks']);
        // Upsert
        db()->prepare("INSERT INTO exam_result(exam_id,student_id,marks_obtained,is_absent,remarks,entered_by)VALUES(?,?,?,?,?,?) ON DUPLICATE KEY UPDATE marks_obtained=VALUES(marks_obtained),is_absent=VALUES(is_absent),remarks=VALUES(remarks),entered_by=VALUES(entered_by)")
            ->execute([$f['exam_id'], $f['student_id'], $score, (int) ($f['is_absent'] ?? 0), $f['remarks'] ?? null, $f['entered_by'] ?? null]);
        ok();
        break;

    case 'exam_result_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM exam_result WHERE result_id=?", [$id]);
        ok();
        break;
}
