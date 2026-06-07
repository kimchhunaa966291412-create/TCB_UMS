<?php
// ── FINAL GRADES ──────────────────────────────────────────

switch ($action) {

    case 'final_grades':
        $sid = (int) ($_GET['student_id'] ?? 0);
        $w   = $sid ? "AND s.student_id=$sid" : '';
        ok(q("SELECT fg.*,CONCAT(s.first_name_en,' ',s.last_name_en) AS full_name_en,s.student_code,c.course_name_en,c.course_code,c.credit_hours,sec.section_code,sec.academic_year,sec.semester FROM final_grade fg JOIN enrollment e ON e.enrollment_id=fg.enrollment_id JOIN student s ON s.student_id=e.student_id JOIN academic_section sec ON sec.section_id=e.section_id JOIN course c ON c.course_id=sec.course_id WHERE 1=1 $w ORDER BY sec.academic_year DESC,s.student_code"));
        break;

    case 'compute_final_grade':
        $eid = (int) ($_POST['enrollment_id'] ?? 0);
        $enr = q1("SELECT e.*,sec.section_id FROM enrollment e JOIN academic_section sec ON sec.section_id=e.section_id WHERE e.enrollment_id=?", [$eid]);
        if (!$enr) { err('Enrollment not found'); break; }
        // Sum weighted contributions from exam results
        $total = qv("SELECT SUM((r.marks_obtained/ex.total_marks)*ex.weight_percent) FROM exam_result r JOIN examination ex ON ex.exam_id=r.exam_id WHERE r.student_id=? AND ex.section_id=?", [$enr['student_id'], $enr['section_id']]);
        $score = round((float) $total, 2);
        [$letter, $gp] = calcGrade($score);
        $passed = $gp > 0 ? 1 : 0;
        db()->prepare("INSERT INTO final_grade(enrollment_id,total_weighted_score,letter_grade,grade_point,is_passed)VALUES(?,?,?,?,?) ON DUPLICATE KEY UPDATE total_weighted_score=VALUES(total_weighted_score),letter_grade=VALUES(letter_grade),grade_point=VALUES(grade_point),is_passed=VALUES(is_passed)")
            ->execute([$eid, $score, $letter, $gp, $passed]);
        ok(['score' => $score, 'letter' => $letter, 'grade_point' => $gp, 'is_passed' => $passed]);
        break;

    case 'finalize_grade':
        $id = (int) ($_POST['grade_id'] ?? 0);
        $by = $_SESSION['full_name'] ?? 'Registrar';
        qx("UPDATE final_grade SET is_finalized=1,finalized_by=?,finalized_at=NOW() WHERE grade_id=? AND is_finalized=0", [$by, $id]);
        audit('finalize_grade', 'final_grade', $id);
        ok();
        break;

    case 'unfinalize_grade':
        if (($_SESSION['role'] ?? '') === 'admin') {
            $id = (int) ($_POST['grade_id'] ?? 0);
            qx("UPDATE final_grade SET is_finalized=0,finalized_by=NULL,finalized_at=NULL WHERE grade_id=?", [$id]);
            audit('unfinalize_grade', 'final_grade', $id);
            ok();
        } else {
            err('Admin only', 403);
        }
        break;
}
