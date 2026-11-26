<?php
require_once __DIR__ . '/staff-common.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method not allowed.');
}

$token = $_POST['token'] ?? '';
if (!is_string($token) || !hash_equals($_SESSION['staff_token'], $token)) {
    http_response_code(403);
    exit('Your session expired. Please return to the order queue and try again.');
}

$orderNumber = trim((string) ($_POST['order_number'] ?? ''));
$newStatus = (string) ($_POST['status'] ?? '');
$allowedTransitions = [
    'Pending' => ['Preparing'],
    'Preparing' => ['Ready'],
    'Ready' => ['Completed'],
];

if ($orderNumber === '' || !in_array($newStatus, ['Preparing', 'Ready', 'Completed'], true)) {
    http_response_code(400);
    exit('Invalid order update.');
}

try {
    $connection = db();
    $connection->begin_transaction();

    $statement = $connection->prepare('SELECT status FROM orders WHERE order_number = ? LIMIT 1 FOR UPDATE');
    $statement->bind_param('s', $orderNumber);
    $statement->execute();
    $order = $statement->get_result()->fetch_assoc();
    $statement->close();

    if (!$order || !in_array($newStatus, $allowedTransitions[$order['status']] ?? [], true)) {
        $connection->rollback();
        http_response_code(409);
        exit('This order can no longer be moved to that status.');
    }

    $update = $connection->prepare('UPDATE orders SET status = ? WHERE order_number = ?');
    $update->bind_param('ss', $newStatus, $orderNumber);
    $update->execute();
    $update->close();
    $connection->commit();

    header('Location: staff-dashboard.php?updated=1');
    exit;
} catch (Throwable $e) {
    if (isset($connection) && $connection instanceof mysqli) {
        $connection->rollback();
    }
    error_log('CampusBite staff order update failed: ' . $e->getMessage());
    http_response_code(500);
    exit('The order could not be updated. Please try again.');
}
