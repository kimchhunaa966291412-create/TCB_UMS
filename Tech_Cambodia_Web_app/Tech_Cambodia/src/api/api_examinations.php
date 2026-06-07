<?php
// ── EXAMINATIONS ──────────────────────────────────────────

switch ($action) {

    case 'examinations':
        ok(q("SELECT ex.*,sec.section_code,c.course_name_en,c.course_code,r.room_code FROM examination ex JOIN academic_section sec ON sec.section_id=ex.section_id JOIN course c ON c.course_id=sec.course_id LEFT JOIN classroom r ON r.room_id=ex.room_id ORDER BY ex.exam_date DESC"));
        break;

    case 'examination_add':
        $f = $_POST;
        db()->prepare("INSERT INTO examination(section_id,exam_type,exam_name,exam_date,duration_minutes,total_marks,weight_percent,room_id,invigilator,remarks)VALUES(?,?,?,?,?,?,?,?,?,?)")
            ->execute([$f['section_id'], $f['exam_type'] ?? 'Midterm', $f['exam_name'], $f['exam_date'], (int) ($f['duration_minutes'] ?? 120), (float) ($f['total_marks'] ?? 100), (float) ($f['weight_percent'] ?? 0), ($f['room_id'] ?? '') ?: null, $f['invigilator'] ?? null, $f['remarks'] ?? null]);
        ok(['id' => lastId()]);
        break;

    case 'examination_edit':
        $f  = $_POST;
        $id = (int) ($f['exam_id'] ?? 0);
        db()->prepare("UPDATE examination SET section_id=?,exam_type=?,exam_name=?,exam_date=?,duration_minutes=?,total_marks=?,weight_percent=?,room_id=?,invigilator=?,remarks=? WHERE exam_id=?")
            ->execute([$f['section_id'], $f['exam_type'] ?? 'Midterm', $f['exam_name'], $f['exam_date'], (int) ($f['duration_minutes'] ?? 120), (float) ($f['total_marks'] ?? 100), (float) ($f['weight_percent'] ?? 0), ($f['room_id'] ?? '') ?: null, $f['invigilator'] ?? null, $f['remarks'] ?? null, $id]);
        ok();
        break;

    case 'examination_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM examination WHERE exam_id=?", [$id]);
        ok();
        break;
}
