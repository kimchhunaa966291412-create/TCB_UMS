<?php
// ── REPORTS ───────────────────────────────────────────────

switch ($action) {

    case 'reports':
        $type = $_GET['type'] ?? 'gpa_by_program';

        if ($type === 'gpa_by_program') {
            $rows = q("SELECT p.program_name_en,COUNT(DISTINCT s.student_id) AS students,ROUND(AVG(g.cumulative_gpa),3) AS avg_cgpa FROM program p JOIN student s ON s.program_id=p.program_id JOIN gpa_record g ON g.student_id=s.student_id GROUP BY p.program_id ORDER BY avg_cgpa DESC");

        } elseif ($type === 'enrollment_by_course') {
            $rows = q("SELECT c.course_code,c.course_name_en,COUNT(e.enrollment_id) AS enrolled FROM course c JOIN academic_section sec ON sec.course_id=c.course_id JOIN enrollment e ON e.section_id=sec.section_id AND e.status='Enrolled' GROUP BY c.course_id ORDER BY enrolled DESC LIMIT 10");

        } elseif ($type === 'students_by_status') {
            $rows = q("SELECT status,COUNT(*) AS cnt FROM student GROUP BY status ORDER BY cnt DESC");

        } elseif ($type === 'standing_dist') {
            $rows = q("SELECT academic_standing,COUNT(*) AS cnt FROM gpa_record GROUP BY academic_standing ORDER BY cnt DESC");

        } elseif ($type === 'admissions_by_type') {
            $rows = q("SELECT admission_type,COUNT(*) AS cnt,ROUND(AVG(national_exam_score),1) AS avg_score FROM admission GROUP BY admission_type ORDER BY cnt DESC");

        } else {
            $rows = [];
        }

        ok($rows);
        break;
}
