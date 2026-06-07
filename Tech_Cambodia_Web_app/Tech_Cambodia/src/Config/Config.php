<?php
// ============================================================
//  ITC Academic System — Configuration v3.1
//  Institute of Technology of Cambodia
//  Loads values from /.env when present; falls back to
//  hard-coded defaults for zero-config local development.
// ============================================================

// ── Load .env (simple parser, no external dependency) ─────
(function () {
    $envFile = dirname(__DIR__, 2) . '/.env';
    if (!file_exists($envFile)) return;
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) continue;
        [$key, $val] = explode('=', $line, 2);
        $key = trim($key);
        $val = trim(trim($val), '"\'');
        if (!array_key_exists($key, $_ENV)) {
            $_ENV[$key] = $val;
            putenv("$key=$val");
        }
    }
})();

// ── Helper ────────────────────────────────────────────────
function env(string $key, mixed $default = null): mixed {
    return $_ENV[$key] ?? getenv($key) ?: $default;
}

// ── Database ──────────────────────────────────────────────
define('DB_HOST', env('DB_HOST', '127.0.0.1'));
define('DB_PORT', env('DB_PORT', '3306'));
define('DB_NAME', env('DB_NAME', 'db_itc'));
define('DB_USER', env('DB_USER', 'root'));
define('DB_PASS', env('DB_PASS', ''));
define('DB_CHAR', 'utf8mb4');

// ── App ───────────────────────────────────────────────────
define('APP_NAME', env('APP_NAME', 'ITC Academic System'));
define('APP_VER',  '3.1');
define('APP_ENV',  env('APP_ENV', 'development'));

// ── Security ─────────────────────────────────────────────
define('SESSION_TIMEOUT',    (int) env('SESSION_TIMEOUT',    3600));
define('MAX_LOGIN_ATTEMPTS', (int) env('MAX_LOGIN_ATTEMPTS', 5));
define('LOCKOUT_DURATION',   (int) env('LOCKOUT_DURATION',   900));

// ── Session ───────────────────────────────────────────────
session_name(env('SESSION_NAME', 'ITC_SID'));
session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'secure'   => filter_var(env('SESSION_SECURE', 'false'), FILTER_VALIDATE_BOOLEAN),
    'httponly' => true,
    'samesite' => 'Strict',
]);
session_start();

// Regenerate CSRF token if not set
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

// ── Session timeout enforcement ───────────────────────────
if (isset($_SESSION['last_activity'])) {
    if (time() - $_SESSION['last_activity'] > SESSION_TIMEOUT) {
        session_unset();
        session_destroy();
    }
}
if (isset($_SESSION['user_id'])) {
    $_SESSION['last_activity'] = time();
}

// ── Error display ─────────────────────────────────────────
if (APP_ENV === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', 0);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}
