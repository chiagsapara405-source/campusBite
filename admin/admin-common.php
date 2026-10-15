<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../db.php';

if (empty($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
    header('Location: ../login.php');
    exit;
}

if (empty($_SESSION['admin_token'])) {
    $_SESSION['admin_token'] = bin2hex(random_bytes(16));
}

function adminEscape($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

function getAdminOrders()
{
    $connection = db();
    $orders = [];
    $result = $connection->query('SELECT * FROM orders ORDER BY created_at DESC');

    while ($row = $result->fetch_assoc()) {
        $orders[$row['id']] = [
            'id' => (int) $row['id'],
            'orderId' => $row['order_number'],
            'createdAt' => $row['created_at'],
            'customer' => [
                'name' => $row['customer_name'],
                'studentId' => $row['student_id'],
                'email' => $row['customer_email'],
                'phone' => $row['customer_phone'],
            ],
            'pickup' => ['location' => $row['pickup_location'], 'time' => $row['pickup_time']],
            'specialInstructions' => $row['special_instructions'],
            'paymentMethod' => $row['payment_method'],
            'items' => [],
            'subtotal' => (float) $row['subtotal'],
            'convenienceFee' => (float) $row['fee'],
            'total' => (float) $row['total'],
            'status' => $row['status'],
        ];
    }

    if ($orders) {
        $itemResult = $connection->query(
            'SELECT oi.order_id, oi.food_id, oi.food_name, oi.food_image, oi.quantity, oi.unit_price, oi.item_total FROM order_items oi INNER JOIN orders o ON o.id = oi.order_id ORDER BY oi.id'
        );
        while ($item = $itemResult->fetch_assoc()) {
            if (isset($orders[$item['order_id']])) {
                $orders[$item['order_id']]['items'][] = [
                    'id' => $item['food_id'] === null ? null : (int) $item['food_id'],
                    'name' => $item['food_name'],
                    'image' => $item['food_image'],
                    'quantity' => (int) $item['quantity'],
                    'price' => (float) $item['unit_price'],
                    'total' => (float) $item['item_total'],
                ];
            }
        }
    }

    return array_values($orders);
}

function getAdminOrder($orderNumber)
{
    $statement = db()->prepare('SELECT * FROM orders WHERE order_number = ? LIMIT 1');
    $statement->bind_param('s', $orderNumber);
    $statement->execute();
    $row = $statement->get_result()->fetch_assoc();
    $statement->close();

    if (!$row) {
        return null;
    }

    $order = [
        'id' => (int) $row['id'],
        'orderId' => $row['order_number'],
        'createdAt' => $row['created_at'],
        'customer' => [
            'name' => $row['customer_name'],
            'studentId' => $row['student_id'],
            'email' => $row['customer_email'],
            'phone' => $row['customer_phone'],
        ],
        'pickup' => ['location' => $row['pickup_location'], 'time' => $row['pickup_time']],
        'specialInstructions' => $row['special_instructions'],
        'paymentMethod' => $row['payment_method'],
        'items' => [],
        'subtotal' => (float) $row['subtotal'],
        'convenienceFee' => (float) $row['fee'],
        'total' => (float) $row['total'],
        'status' => $row['status'],
    ];

    $items = db()->prepare(
        'SELECT food_id, food_name, food_image, quantity, unit_price, item_total FROM order_items WHERE order_id = ? ORDER BY id'
    );
    $orderId = (int) $row['id'];
    $items->bind_param('i', $orderId);
    $items->execute();
    $result = $items->get_result();
    while ($item = $result->fetch_assoc()) {
        $order['items'][] = [
            'id' => $item['food_id'] === null ? null : (int) $item['food_id'],
            'name' => $item['food_name'],
            'image' => $item['food_image'],
            'quantity' => (int) $item['quantity'],
            'price' => (float) $item['unit_price'],
            'total' => (float) $item['item_total'],
        ];
    }
    $items->close();

    return $order;
}
?>
