<?php
// ── STUDENTS ──────────────────────────────────────────────

switch ($action) {

    case 'students':
        $search = '%' . ($_GET['search'] ?? '') . '%';
        $status = $_GET['status'] ?? '';
        $prog   = (int) ($_GET['program'] ?? 0);
        $page   = max(1, (int) ($_GET['page'] ?? 1));
        $limit  = 15;
        $offset = ($page - 1) * $limit;

        $w = "WHERE (CONCAT(s.first_name_en,' ',s.last_name_en) LIKE ? OR s.student_code LIKE ? OR s.email_personal LIKE ?)";
        $p = [$search, $search, $search];
        if ($status) { $w .= " AND s.status=?";     $p[] = $status; }
        if ($prog)   { $w .= " AND s.program_id=?"; $p[] = $prog;   }

        $total = (int) qv("SELECT COUNT(*) FROM student s $w", $p);
        $rows  = q("SELECT s.*,CONCAT(s.first_name_en,' ',s.last_name_en) AS full_name_en,p.program_name_en,p.degree_level,d.dept_name_en,f.faculty_name_en FROM student s JOIN program p ON p.program_id=s.program_id JOIN department d ON d.dept_id=p.dept_id JOIN faculty_academic f ON f.faculty_id=d.faculty_id $w ORDER BY s.student_code DESC LIMIT $limit OFFSET $offset", $p);

        echo json_encode(['ok' => true, 'data' => $rows, 'total' => $total, 'pages' => (int) ceil($total / $limit), 'page' => $page]);
        break;

    case 'student_get':
        $id = (int) ($_GET['id'] ?? 0);
        $r  = q1("SELECT s.*,CONCAT(s.first_name_en,' ',s.last_name_en) AS full_name_en,p.program_name_en FROM student s JOIN program p ON p.program_id=s.program_id WHERE s.student_id=?", [$id]);
        if ($r) ok($r); else err('Not found', 404);
        break;

    case 'student_add':
        $f = $_POST;
        if (!($f['student_code'] ?? '') || !($f['first_name_en'] ?? '') || !($f['last_name_en'] ?? '') || !($f['email_personal'] ?? '')) {
            err('Required fields missing'); break;
        }
        db()->prepare("INSERT INTO student(student_code,first_name_en,last_name_en,full_name_km,gender,date_of_birth,nationality,email_personal,email_itc,phone,program_id,admission_year,current_semester,status,guardian_name,guardian_phone,guardian_relation,address)VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
            ->execute([$f['student_code'], $f['first_name_en'], $f['last_name_en'], $f['full_name_km'] ?? null, $f['gender'] ?? 'Male', $f['date_of_birth'], $f['nationality'] ?? 'Cambodian', $f['email_personal'], $f['email_itc'] ?? null, $f['phone'] ?? null, (int) $f['program_id'], (int) $f['admission_year'], (int) ($f['current_semester'] ?? 1), $f['status'] ?? 'Active', $f['guardian_name'] ?? null, $f['guardian_phone'] ?? null, $f['guardian_relation'] ?? null, $f['address'] ?? null]);
        $id = lastId();
        audit('student_add', 'student', $id, $f['student_code']);
        ok(['id' => $id]);
        break;

    case 'student_edit':
        $f  = $_POST;
        $id = (int) ($f['student_id'] ?? 0);
        db()->prepare("UPDATE student SET student_code=?,first_name_en=?,last_name_en=?,full_name_km=?,gender=?,date_of_birth=?,nationality=?,email_personal=?,email_itc=?,phone=?,program_id=?,admission_year=?,current_semester=?,status=?,guardian_name=?,guardian_phone=?,guardian_relation=?,address=? WHERE student_id=?")
            ->execute([$f['student_code'], $f['first_name_en'], $f['last_name_en'], $f['full_name_km'] ?? null, $f['gender'] ?? 'Male', $f['date_of_birth'], $f['nationality'] ?? 'Cambodian', $f['email_personal'], $f['email_itc'] ?? null, $f['phone'] ?? null, (int) $f['program_id'], (int) $f['admission_year'], (int) ($f['current_semester'] ?? 1), $f['status'] ?? 'Active', $f['guardian_name'] ?? null, $f['guardian_phone'] ?? null, $f['guardian_relation'] ?? null, $f['address'] ?? null, $id]);
        audit('student_edit', 'student', $id, $f['student_code']);
        ok();
        break;

    case 'student_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM student WHERE student_id=?", [$id]);
        audit('student_delete', 'student', $id);
        ok();
        break;

    case 'student_by_code':
        $code = trim($_GET['code'] ?? '');
        if (!$code) { err('code required'); break; }
        $r = q1("SELECT student_id, student_code, CONCAT(first_name_en,' ',last_name_en) AS full_name_en, status FROM student WHERE LOWER(student_code)=LOWER(?)", [$code]);
        if ($r) ok($r); else err('Student not found — please check the ID (e.g. e20230312)', 404);
        break;
}
