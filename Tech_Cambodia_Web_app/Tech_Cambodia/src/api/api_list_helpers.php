<?php
// ── LIST HELPERS ──────────────────────────────────────────
// Lightweight dropdown data for forms

switch ($action) {

    case 'list_faculties':
        ok(q("SELECT faculty_id,faculty_name_en FROM faculty_academic WHERE is_active=1 ORDER BY faculty_name_en"));
        break;

    case 'list_departments':
        ok(q("SELECT dept_id,dept_name_en,faculty_id FROM department WHERE is_active=1 ORDER BY dept_name_en"));
        break;

    case 'list_programs':
        ok(q("SELECT program_id,program_name_en,degree_level FROM program WHERE is_active=1 ORDER BY program_name_en"));
        break;

    case 'list_classrooms':
        ok(q("SELECT room_id,room_code,building,capacity,room_type FROM classroom WHERE is_active=1 ORDER BY room_code"));
        break;

    case 'list_courses':
        ok(q("SELECT course_id,course_code,course_name_en,credit_hours FROM course WHERE is_active=1 ORDER BY course_code"));
        break;

    case 'list_sections':
        ok(q("SELECT sec.section_id,CONCAT(c.course_code,' — ',sec.section_code,' (',sec.academic_year,')') AS label FROM academic_section sec JOIN course c ON c.course_id=sec.course_id WHERE sec.is_active=1 ORDER BY sec.academic_year DESC,label"));
        break;

    case 'list_students_active':
        ok(q("SELECT student_id,CONCAT(student_code,' — ',first_name_en,' ',last_name_en) AS label FROM student WHERE status='Active' ORDER BY student_code"));
        break;

    case 'list_students_all':
        ok(q("SELECT student_id,CONCAT(student_code,' — ',first_name_en,' ',last_name_en) AS label,status FROM student ORDER BY student_code"));
        break;

    case 'list_enrollments_for_section':
        $sid = (int) ($_GET['section_id'] ?? 0);
        ok(q("SELECT e.enrollment_id,CONCAT(s.student_code,' — ',s.first_name_en,' ',s.last_name_en) AS label,s.student_id FROM enrollment e JOIN student s ON s.student_id=e.student_id WHERE e.section_id=? AND e.status='Enrolled' ORDER BY s.student_code", [$sid]));
        break;

    case 'list_exams_for_section':
        $sid = (int) ($_GET['section_id'] ?? 0);
        ok(q("SELECT exam_id,CONCAT(exam_type,' — ',exam_name) AS label,total_marks FROM examination WHERE section_id=? ORDER BY exam_date", [$sid]));
        break;
}
