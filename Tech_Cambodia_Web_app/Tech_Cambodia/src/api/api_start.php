<?php
// ============================================================
//  ITC Academic System — Main API Router
//  Entry point: /backend/api_start.php
//  Routes ?action=X to the correct api_*.php handler
// ============================================================

require_once __DIR__ . '/api_init.php';

$action = $_GET['action'] ?? $_POST['action'] ?? '';
apiAuthGate($action);

// ── Route map: action prefix → file ──────────────────────
$routes = [
    // Auth
    'login'           => 'api_auth.php',
    'logout'          => 'api_auth.php',
    'me'              => 'api_auth.php',
    'change_password' => 'api_auth.php',

    // Stats / start
    'test'            => 'api_start.php',
    'stats'           => 'api_start.php',
    'grade_dist'      => 'api_start.php',
    'at_risk_list'    => 'api_start.php',
    'recent_activity' => 'api_start.php',

    // Users
    'users'       => 'api_users.php',
    'user_add'    => 'api_users.php',
    'user_edit'   => 'api_users.php',
    'user_delete' => 'api_users.php',

    // Faculties
    'faculties'      => 'api_faculties.php',
    'faculty_add'    => 'api_faculties.php',
    'faculty_edit'   => 'api_faculties.php',
    'faculty_delete' => 'api_faculties.php',

    // Departments
    'departments' => 'api_departments.php',
    'dept_add'    => 'api_departments.php',
    'dept_edit'   => 'api_departments.php',
    'dept_delete' => 'api_departments.php',

    // Programs
    'programs'       => 'api_programs.php',
    'program_add'    => 'api_programs.php',
    'program_edit'   => 'api_programs.php',
    'program_delete' => 'api_programs.php',

    // Classrooms
    'classrooms'      => 'api_classrooms.php',
    'classroom_add'   => 'api_classrooms.php',
    'classroom_edit'  => 'api_classrooms.php',
    'classroom_delete'=> 'api_classrooms.php',

    // Courses
    'courses'      => 'api_courses.php',
    'course_add'   => 'api_courses.php',
    'course_edit'  => 'api_courses.php',
    'course_delete'=> 'api_courses.php',

    // Sections
    'sections'       => 'api_sections.php',
    'section_add'    => 'api_sections.php',
    'section_edit'   => 'api_sections.php',
    'section_delete' => 'api_sections.php',

    // Students
    'students'       => 'api_students.php',
    'student_get'    => 'api_students.php',
    'student_add'    => 'api_students.php',
    'student_edit'   => 'api_students.php',
    'student_delete'   => 'api_students.php',
    'student_by_code' => 'api_students.php',

    // Admissions
    'admissions'      => 'api_admissions.php',
    'admission_add'   => 'api_admissions.php',
    'admission_edit'  => 'api_admissions.php',
    'admission_delete'=> 'api_admissions.php',

    // Enrollments
    'enrollments'      => 'api_enrollments.php',
    'enrollment_add'   => 'api_enrollments.php',
    'enrollment_edit'  => 'api_enrollments.php',
    'enrollment_delete'=> 'api_enrollments.php',

    // Examinations
    'examinations'       => 'api_examinations.php',
    'examination_add'    => 'api_examinations.php',
    'examination_edit'   => 'api_examinations.php',
    'examination_delete' => 'api_examinations.php',

    // Exam Results
    'exam_results'      => 'api_exam_results.php',
    'exam_result_add'   => 'api_exam_results.php',
    'exam_result_delete'=> 'api_exam_results.php',

    // Final Grades
    'final_grades'      => 'api_final_grades.php',
    'compute_final_grade'=> 'api_final_grades.php',
    'finalize_grade'    => 'api_final_grades.php',
    'unfinalize_grade'  => 'api_final_grades.php',

    // GPA Records
    'gpa_records' => 'api_gpa_records.php',
    'gpa_upsert'  => 'api_gpa_records.php',
    'gpa_delete'  => 'api_gpa_records.php',

    // Transcript
    'transcript' => 'api_transcript.php',

    // Reports
    'reports' => 'api_reports.php',

    // Audit Log
    'auditlog'       => 'api_audit_log.php',
    'auditlog_clear' => 'api_audit_log.php',

    // List Helpers
    'list_faculties'              => 'api_list_helpers.php',
    'list_departments'            => 'api_list_helpers.php',
    'list_programs'               => 'api_list_helpers.php',
    'list_classrooms'             => 'api_list_helpers.php',
    'list_courses'                => 'api_list_helpers.php',
    'list_sections'               => 'api_list_helpers.php',
    'list_students_active'        => 'api_list_helpers.php',
    'list_students_all'           => 'api_list_helpers.php',
    'list_enrollments_for_section'=> 'api_list_helpers.php',
    'list_exams_for_section'      => 'api_list_helpers.php',

    // Search
    'search' => 'api_search.php',

    // Attendance
    'attendance_sections' => 'api_attendance.php',
    'attendance_students' => 'api_attendance.php',
    'attendance_get'      => 'api_attendance.php',
    'attendance_save'     => 'api_attendance.php',
];

if (isset($routes[$action])) {
    require_once __DIR__ . '/' . $routes[$action];
} else {
    err("Unknown action: $action", 400);
}

// ── STATS & DASHBOARD (handled in this same file) ────────
// This block is only reached when $action is one of the stats actions.
// The router requires this file for: test, stats, grade_dist, at_risk_list, recent_activity

try {
    switch ($action) {

        case 'test':
            ok(['message' => 'ITC API OK', 'version' => APP_VER]);
            break;

        case 'stats':
            ok([
                'students'       => (int) qv("SELECT COUNT(*) FROM student"),
                'active_students'=> (int) qv("SELECT COUNT(*) FROM student WHERE status='Active'"),
                'graduated'      => (int) qv("SELECT COUNT(*) FROM student WHERE status='Graduated'"),
                'faculties'      => (int) qv("SELECT COUNT(*) FROM faculty_academic"),
                'departments'    => (int) qv("SELECT COUNT(*) FROM department"),
                'programs'       => (int) qv("SELECT COUNT(*) FROM program"),
                'courses'        => (int) qv("SELECT COUNT(*) FROM course"),
                'sections'       => (int) qv("SELECT COUNT(*) FROM academic_section WHERE is_active=1"),
                'enrollments'    => (int) qv("SELECT COUNT(*) FROM enrollment WHERE status='Enrolled'"),
                'exams'          => (int) qv("SELECT COUNT(*) FROM examination"),
                'results'        => (int) qv("SELECT COUNT(*) FROM exam_result"),
                'at_risk'        => (int) qv("SELECT COUNT(*) FROM gpa_record WHERE academic_standing IN('Warning','Probation','Suspension Risk') AND (academic_year,semester)=(SELECT academic_year,semester FROM gpa_record ORDER BY created_at DESC LIMIT 1)"),
                'pending_verify' => (int) qv("SELECT COUNT(*) FROM admission WHERE documents_verified=0"),
                'unfinalized'    => (int) qv("SELECT COUNT(*) FROM final_grade WHERE is_finalized=0"),
            ]);
            break;

        case 'grade_dist':
            ok(q("SELECT letter_grade,COUNT(*) AS cnt FROM final_grade GROUP BY letter_grade ORDER BY FIELD(letter_grade,'A','B','C+','C','D+','D','E','F')"));
            break;

        case 'at_risk_list':
            ok(q("SELECT s.student_id,s.student_code,CONCAT(s.first_name_en,' ',s.last_name_en) AS full_name,p.program_name_en,g.cumulative_gpa,g.academic_standing FROM gpa_record g JOIN student s ON s.student_id=g.student_id JOIN program p ON p.program_id=s.program_id WHERE g.academic_standing IN('Warning','Probation','Suspension Risk') ORDER BY g.cumulative_gpa LIMIT 15"));
            break;

        case 'recent_activity':
            ok(q("SELECT a.*,u.full_name FROM audit_log a LEFT JOIN sys_user u ON u.user_id=a.user_id ORDER BY a.created_at DESC LIMIT 10"));
            break;
    }
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'DB error: ' . $e->getMessage()]);
} catch (Exception $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Server error: ' . $e->getMessage()]);
}
