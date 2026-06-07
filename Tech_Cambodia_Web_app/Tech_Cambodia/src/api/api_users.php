<?php
// ── USERS ─────────────────────────────────────────────────

switch ($action) {

    case 'users':
        ok(q("SELECT user_id,username,email,full_name,role,is_active,created_at FROM sys_user ORDER BY created_at DESC"));
        break;

    case 'user_add':
        $f = $_POST;
        if (!($f['username'] ?? '') || !($f['email'] ?? '') || !($f['password'] ?? '')) {
            err('Username, email and password required'); break;
        }
        if (strlen($f['password']) < 6) { err('Password min 6 characters'); break; }
        db()->prepare("INSERT INTO sys_user(username,email,password,full_name,role)VALUES(?,?,?,?,?)")
            ->execute([$f['username'], $f['email'], password_hash($f['password'], PASSWORD_BCRYPT), $f['full_name'] ?? '', $f['role'] ?? 'staff']);
        $id = lastId();
        audit('user_add', 'sys_user', $id, $f['username']);
        ok(['id' => $id]);
        break;

    case 'user_edit':
        $f  = $_POST;
        $id = (int) ($f['user_id'] ?? 0);
        db()->prepare("UPDATE sys_user SET username=?,email=?,full_name=?,role=?,is_active=? WHERE user_id=?")
            ->execute([$f['username'], $f['email'], $f['full_name'] ?? '', $f['role'] ?? 'staff', (int) ($f['is_active'] ?? 1), $id]);
        if (!empty($f['password']) && strlen($f['password']) >= 6) {
            qx("UPDATE sys_user SET password=? WHERE user_id=?", [password_hash($f['password'], PASSWORD_BCRYPT), $id]);
        }
        audit('user_edit', 'sys_user', $id);
        ok();
        break;

    case 'user_delete':
        $id = (int) ($_POST['id'] ?? 0);
        if ($id === (int) ($_SESSION['user_id'] ?? 0)) { err('Cannot delete yourself'); break; }
        qx("DELETE FROM sys_user WHERE user_id=?", [$id]);
        audit('user_delete', 'sys_user', $id);
        ok();
        break;
}
