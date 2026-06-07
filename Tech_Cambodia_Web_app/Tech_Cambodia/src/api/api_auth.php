<?php
// ── AUTH actions ──────────────────────────────────────────

switch ($action) {

    case 'login':
        if (login($_POST['username'] ?? '', $_POST['password'] ?? '')) {
            ok([
                'user_id'    => $_SESSION['user_id'],
                'username'   => $_SESSION['username'],
                'role'       => $_SESSION['role'],
                'full_name'  => $_SESSION['full_name'],
                'csrf_token' => $_SESSION['csrf_token'],
            ]);
        } else {
            err('Invalid username or password', 401);
        }
        break;

    case 'logout':
        session_destroy();
        ok();
        break;

    case 'me':
        ok(me());
        break;

    case 'change_password':
        $uid = (int) ($_SESSION['user_id'] ?? 0);
        $old = $_POST['old_password'] ?? '';
        $new = $_POST['new_password'] ?? '';
        if (!$old || !$new) { err('All fields required'); break; }
        if (strlen($new) < 8) { err('New password must be at least 8 characters'); break; }
        $user = q1("SELECT password FROM sys_user WHERE user_id=?", [$uid]);
        if (!$user || !password_verify($old, $user['password'])) {
            err('Current password is incorrect'); break;
        }
        $hash = password_hash($new, PASSWORD_DEFAULT);
        qx("UPDATE sys_user SET password=? WHERE user_id=?", [$hash, $uid]);
        audit('change_password', 'sys_user', $uid);
        ok();
        break;
}
