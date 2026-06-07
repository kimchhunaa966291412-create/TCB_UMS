<?php
// ── SEARCH ────────────────────────────────────────────────

switch ($action) {

    case 'search':
        $q = '%' . ($_GET['q'] ?? '') . '%';
        $s = q("SELECT student_id AS id,CONCAT(first_name_en,' ',last_name_en) AS name,student_code AS code,'student' AS type,status FROM student WHERE CONCAT(first_name_en,' ',last_name_en) LIKE ? OR student_code LIKE ? LIMIT 5", [$q, $q]);
        $c = q("SELECT course_id AS id,course_name_en AS name,course_code AS code,'course' AS type,'' AS status FROM course WHERE course_name_en LIKE ? OR course_code LIKE ? LIMIT 5", [$q, $q]);
        ok(array_merge($s, $c));
        break;
}
