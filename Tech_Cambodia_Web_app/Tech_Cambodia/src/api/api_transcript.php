<?php
// ── TRANSCRIPT ────────────────────────────────────────────

switch ($action) {

    case 'transcript':
        $sid = (int) ($_GET['student_id'] ?? 0);
        if (!$sid) { err('student_id required'); break; }

        $student = q1(
            "SELECT s.*,CONCAT(s.first_name_en,' ',s.last_name_en) AS full_name_en,
                    p.program_name_en,p.degree_level,p.total_credits,
                    d.dept_name_en,f.faculty_name_en
             FROM student s
             JOIN program p ON p.program_id=s.program_id
             JOIN department d ON d.dept_id=p.dept_id
             JOIN faculty_academic f ON f.faculty_id=d.faculty_id
             WHERE s.student_id=?",
            [$sid]
        );
        if (!$student) { err('Student not found', 404); break; }

        $adm = q1("SELECT * FROM admission WHERE student_id=?", [$sid]);

        $grades = q(
            "SELECT fg.*,c.course_code,c.course_name_en,c.credit_hours,
                    sec.academic_year,sec.semester,sec.section_code
             FROM final_grade fg
             JOIN enrollment e ON e.enrollment_id=fg.enrollment_id
             JOIN academic_section sec ON sec.section_id=e.section_id
             JOIN course c ON c.course_id=sec.course_id
             WHERE e.student_id=?
             ORDER BY sec.academic_year,sec.semester,c.course_code",
            [$sid]
        );

        $gpa_records = q(
            "SELECT * FROM gpa_record WHERE student_id=? ORDER BY academic_year,semester",
            [$sid]
        );

        $cgpa = qv(
            "SELECT cumulative_gpa FROM gpa_record WHERE student_id=? ORDER BY created_at DESC LIMIT 1",
            [$sid]
        );

        $credits_earned = qv(
            "SELECT COALESCE(SUM(c.credit_hours),0)
             FROM final_grade fg
             JOIN enrollment e ON e.enrollment_id=fg.enrollment_id
             JOIN academic_section sec ON sec.section_id=e.section_id
             JOIN course c ON c.course_id=sec.course_id
             WHERE e.student_id=? AND fg.is_passed=1",
            [$sid]
        );

        echo json_encode([
            'ok'            => true,
            'student'       => $student,
            'admission'     => $adm,
            'grades'        => $grades,
            'gpa_records'   => $gpa_records,
            'cgpa'          => $cgpa,
            'credits_earned'=> $credits_earned,
        ]);
        break;
}
