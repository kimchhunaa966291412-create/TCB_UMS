<?php
require_once __DIR__ . '/../Config/Config.php';

function db(): PDO {
    static $p = null;
    if (!$p) {
        try {
            $p = new PDO(
                "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=" . DB_CHAR,
                DB_USER, DB_PASS,
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['ok' => false, 'error' => 'DB connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    return $p;
}

// ── Query Helpers ─────────────────────────────────────────
function q(string $sql, array $p = []): array {
    $s = db()->prepare($sql);
    $s->execute($p);
    return $s->fetchAll();
}

function q1(string $sql, array $p = []): ?array {
    $r = q($sql, $p);
    return $r[0] ?? null;
}

function qv(string $sql, array $p = []): mixed {
    $s = db()->prepare($sql);
    $s->execute($p);
    return $s->fetchColumn();
}

function qx(string $sql, array $p = []): void {
    db()->prepare($sql)->execute($p);
}

function lastId(): int {
    return (int) db()->lastInsertId();
}
