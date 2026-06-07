<?php
// ── ADMISSIONS ────────────────────────────────────────────

switch ($action) {

    case 'admissions':
        ok(q("SELECT a.*,CONCAT(s.first_name_en,' ',s.last_name_en) AS full_name_en,s.student_code FROM admission a JOIN student s ON s.student_id=a.student_id ORDER BY a.admission_date DESC"));
        break;

    case 'admission_add':
        $f = $_POST;
        db()->prepare("INSERT INTO admission(student_id,application_date,admission_date,admission_type,national_exam_score,high_school_name,high_school_gpa,documents_verified,admitted_by,remarks)VALUES(?,?,?,?,?,?,?,?,?,?)")
            ->execute([$f['student_id'], $f['application_date'], $f['admission_date'], $f['admission_type'] ?? 'Direct', $f['national_exam_score'] ?? null, $f['high_school_name'] ?? null, $f['high_school_gpa'] ?? null, (int) ($f['documents_verified'] ?? 0), $f['admitted_by'] ?? null, $f['remarks'] ?? null]);
        ok(['id' => lastId()]);
        break;

    case 'admission_edit':
        $f  = $_POST;
        $id = (int) ($f['admission_id'] ?? 0);
        db()->prepare("UPDATE admission SET application_date=?,admission_date=?,admission_type=?,national_exam_score=?,high_school_name=?,high_school_gpa=?,documents_verified=?,admitted_by=?,remarks=? WHERE admission_id=?")
            ->execute([$f['application_date'], $f['admission_date'], $f['admission_type'] ?? 'Direct', $f['national_exam_score'] ?? null, $f['high_school_name'] ?? null, $f['high_school_gpa'] ?? null, (int) ($f['documents_verified'] ?? 0), $f['admitted_by'] ?? null, $f['remarks'] ?? null, $id]);
        ok();
        break;

    case 'admission_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM admission WHERE admission_id=?", [$id]);
        ok();
        break;
}
