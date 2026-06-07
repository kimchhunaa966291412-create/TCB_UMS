<?php
require_once __DIR__ . '/../Database/Database.php';

function login(string $u, string $pw): bool {
    $user = q1("SELECT * FROM sys_user WHERE (username=? OR email=?) AND is_active=1", [$u, $u]);
    if ($user && password_verify($pw, $user['password'])) {
        session_regenerate_id(true);
        $_SESSION['user_id']   = $user['user_id'];
        $_SESSION['username']  = $user['username'];
        $_SESSION['role']      = $user['role'];
        $_SESSION['full_name'] = $user['full_name'];
        return true;
    }
    return false;
}

function isLoggedIn(): bool {
    return isset($_SESSION['user_id']);
}

function requireLogin(): void {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['ok' => false, 'error' => 'Authentication required']);
        exit;
    }
}

function checkCsrf(): void {
    $t = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!$t || !hash_equals($_SESSION['csrf_token'], $t)) {
        http_response_code(403);
        echo json_encode(['ok' => false, 'error' => 'CSRF mismatch']);
        exit;
    }
}

function me(): array {
    return [
        'user_id'   => $_SESSION['user_id']   ?? null,
        'username'  => $_SESSION['username']  ?? '',
        'role'      => $_SESSION['role']      ?? '',
        'full_name' => $_SESSION['full_name'] ?? '',
    ];
}
