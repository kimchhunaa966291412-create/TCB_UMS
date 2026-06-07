<?php
// ── CLASSROOMS ────────────────────────────────────────────

switch ($action) {

    case 'classrooms':
        ok(q("SELECT * FROM classroom ORDER BY room_code"));
        break;

    case 'classroom_add':
        $f = $_POST;
        db()->prepare("INSERT INTO classroom(room_code,building,floor,room_type,capacity,has_projector,has_ac)VALUES(?,?,?,?,?,?,?)")
            ->execute([$f['room_code'], $f['building'] ?? null, $f['floor'] ?? null, $f['room_type'] ?? 'Lecture', (int) ($f['capacity'] ?? 40), (int) ($f['has_projector'] ?? 0), (int) ($f['has_ac'] ?? 0)]);
        ok(['id' => lastId()]);
        break;

    case 'classroom_edit':
        $f  = $_POST;
        $id = (int) ($f['room_id'] ?? 0);
        db()->prepare("UPDATE classroom SET room_code=?,building=?,floor=?,room_type=?,capacity=?,has_projector=?,has_ac=?,is_active=? WHERE room_id=?")
            ->execute([$f['room_code'], $f['building'] ?? null, $f['floor'] ?? null, $f['room_type'] ?? 'Lecture', (int) ($f['capacity'] ?? 40), (int) ($f['has_projector'] ?? 0), (int) ($f['has_ac'] ?? 0), (int) ($f['is_active'] ?? 1), $id]);
        ok();
        break;

    case 'classroom_delete':
        $id = (int) ($_POST['id'] ?? 0);
        qx("DELETE FROM classroom WHERE room_id=?", [$id]);
        ok();
        break;
}
