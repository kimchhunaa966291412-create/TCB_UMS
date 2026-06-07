<?php
// ── ATTENDANCE ────────────────────────────────────────────

switch ($action) {

    case 'attendance_sections':
        // List sections for the current lecturer (or all for admin/registrar)
        $role = $_SESSION['role'];
        if ($role === 'lecturer') {
            $sections = q(
                "SELECT s.*, c.course_code, c.course_name_en
                 FROM academic_section s
                 JOIN course c ON c.course_id = s.course_id
                 WHERE s.instructor = ? AND s.is_active = 1
                 ORDER BY s.academic_year DESC, s.semester",
                [$_SESSION['full_name']]
            );
        } else {
            $sections = q(
                "SELECT s.*, c.course_code, c.course_name_en
                 FROM academic_section s
                 JOIN course c ON c.course_id = s.course_id
                 WHERE s.is_active = 1
                 ORDER BY s.academic_year DESC, s.semester"
            );
        }
        ok($sections);
        break;

    case 'attendance_students':
        $sid = (int) ($_GET['section_id'] ?? 0);
        if (!$sid) { err('Section ID required'); break; }
        $students = q(
            "SELECT s.student_id, s.student_code,
                    CONCAT(s.first_name_en,' ',s.last_name_en) AS student_name
             FROM enrollment e
             JOIN student s ON s.student_id = e.student_id
             WHERE e.section_id = ? AND e.status = 'Enrolled'
             ORDER BY s.student_code",
            [$sid]
        );
        ok($students);
        break;

    case 'attendance_get':
        $sid  = (int) ($_GET['section_id'] ?? 0);
        $date = $_GET['date'] ?? date('Y-m-d');
        $records = q(
            "SELECT a.*, s.student_code,
                    CONCAT(s.first_name_en,' ',s.last_name_en) AS student_name
             FROM attendance a
             JOIN student s ON s.student_id = a.student_id
             WHERE a.section_id = ? AND a.attendance_date = ?",
            [$sid, $date]
        );
        ok($records);
        break;

    case 'attendance_save':
        $f          = $_POST;
        $sid        = (int) ($f['section_id'] ?? 0);
        $date       = $f['attendance_date'] ?? date('Y-m-d');
        $marked_by  = $_SESSION['user_id'];

        // Delete existing for this date/section then re-insert (simple overwrite)
        qx("DELETE FROM attendance WHERE section_id = ? AND attendance_date = ?", [$sid, $date]);

        $students = $f['students'] ?? [];
        foreach ($students as $student_id => $status) {
            qx(
                "INSERT INTO attendance (section_id, student_id, attendance_date, status, marked_by)
                 VALUES (?, ?, ?, ?, ?)",
                [$sid, $student_id, $date, $status, $marked_by]
            );
        }
        audit('attendance_save', 'attendance', $sid, "Section $sid, date $date");
        ok();
        break;
}
