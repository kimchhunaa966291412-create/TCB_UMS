<?php
// ============================================================
//  ITC Academic System — API Bootstrap
//  Include this at the top of every api_*.php file
// ============================================================

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../Database/Database.php';
require_once __DIR__ . '/../Auth/Auth.php';

// ── Shared Response Helpers ───────────────────────────────
function ok(mixed $d = null, array $x = []): void {
    echo json_encode(array_merge(['ok' => true, 'data' => $d], $x));
}

function err(string $m, int $c = 400): void {
    http_response_code($c);
    echo json_encode(['ok' => false, 'error' => $m]);
}

function audit(string $a, string $t = '', int $r = 0, string $d = ''): void {
    $uid = $_SESSION['user_id'] ?? null;
    $ip  = $_SERVER['REMOTE_ADDR'] ?? '';
    db()->prepare(
        "INSERT INTO audit_log(user_id,action,table_name,record_id,details,ip_address)VALUES(?,?,?,?,?,?)"
    )->execute([$uid, $a, $t, $r, $d, $ip]);
}

// ── ITC Grading Scale (ACC Cambodia) ─────────────────────
function calcGrade(float $s): array {
    if ($s >= 85) return ['A',  4.0];
    if ($s >= 75) return ['B',  3.0];
    if ($s >= 65) return ['C+', 2.5];
    if ($s >= 55) return ['C',  2.0];
    if ($s >= 45) return ['D+', 1.5];
    if ($s >= 35) return ['D',  1.0];
    if ($s >= 25) return ['E',  0.5];
    return ['F', 0.0];
}

function gpaStanding(float $gpa): string {
    if ($gpa >= 3.5) return 'Excellent';
    if ($gpa >= 2.5) return 'Good Standing';
    if ($gpa >= 2.0) return 'Warning';
    if ($gpa >= 1.5) return 'Probation';
    return 'Suspension Risk';
}

// ── Auth gate (call from each api file) ──────────────────
function apiAuthGate(string $action, array $publicActions = ['login', 'test']): void {
    if (!in_array($action, $publicActions)) {
        requireLogin();
        if ($_SERVER['REQUEST_METHOD'] === 'POST') checkCsrf();
    }
}
