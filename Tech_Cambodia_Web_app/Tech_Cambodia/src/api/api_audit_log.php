<?php
// ── AUDIT LOG ─────────────────────────────────────────────

switch ($action) {

    case 'auditlog':
        $page   = max(1, (int) ($_GET['page'] ?? 1));
        $limit  = 20;
        $offset = ($page - 1) * $limit;
        $total  = (int) qv("SELECT COUNT(*) FROM audit_log");
        $data   = q("SELECT a.*,u.full_name FROM audit_log a LEFT JOIN sys_user u ON u.user_id=a.user_id ORDER BY a.created_at DESC LIMIT $limit OFFSET $offset");
        echo json_encode(['ok' => true, 'data' => $data, 'total' => $total, 'pages' => (int) ceil($total / $limit), 'page' => $page]);
        break;

    case 'auditlog_clear':
        if (($_SESSION['role'] ?? '') === 'admin') {
            qx("DELETE FROM audit_log");
            ok();
        } else {
            err('Admin only', 403);
        }
        break;
}
