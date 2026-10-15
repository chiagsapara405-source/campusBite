<?php
require_once __DIR__ . '/admin-common.php';
header('Content-Type: application/json; charset=utf-8');

function sendAdminResult($success, $message, $extra = [])
{
    echo json_encode(array_merge(['success' => $success, 'message' => $message], $extra));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    sendAdminResult(false, 'This action is not available.');
}

$token = $_POST['token'] ?? '';
if (!is_string($token) || !hash_equals($_SESSION['admin_token'], $token)) {
    http_response_code(403);
    sendAdminResult(false, 'Your session expired. Reload the page and try again.');
}

$action = $_POST['action'] ?? '';

try {
    if ($action === 'save_food') {
        $id = filter_var($_POST['id'] ?? '', FILTER_VALIDATE_INT);
        $name = trim((string) ($_POST['name'] ?? ''));
        $description = trim((string) ($_POST['description'] ?? ''));
        $category = trim((string) ($_POST['category'] ?? ''));
        $price = filter_var($_POST['price'] ?? '', FILTER_VALIDATE_FLOAT);
        $image = trim((string) ($_POST['image'] ?? ''));
        $vegetarian = ($_POST['vegetarian'] ?? '') === '1' ? 1 : 0;
        $available = ($_POST['available'] ?? '') === '1' ? 1 : 0;

        if ($name === '' || strlen($name) > 100 || $description === '' || strlen($category) < 1 || strlen($category) > 50
            || $price === false || $price <= 0 || $price > 99999999.99 || strlen($image) > 255 || ($id !== false && $id < 1)) {
            http_response_code(400);
            sendAdminResult(false, 'Check the food details and try again.');
        }
        if ($image === '') {
            $image = null;
        } elseif (filter_var($image, FILTER_VALIDATE_URL) === false) {
            http_response_code(400);
            sendAdminResult(false, 'Enter a valid image URL.');
        }

        if ($id) {
            $statement = db()->prepare(
                'UPDATE foods SET name = ?, description = ?, category = ?, price = ?, image = ?, vegetarian = ?, available = ? WHERE id = ?'
            );
            $statement->bind_param('sssdsiii', $name, $description, $category, $price, $image, $vegetarian, $available, $id);
        } else {
            $statement = db()->prepare(
                'INSERT INTO foods (name, description, category, price, image, vegetarian, available) VALUES (?, ?, ?, ?, ?, ?, ?)'
            );
            $statement->bind_param('sssdsii', $name, $description, $category, $price, $image, $vegetarian, $available);
        }
        $statement->execute();
        $savedId = $id ?: (int) db()->insert_id;
        $statement->close();
        sendAdminResult(true, 'Food item saved.', ['id' => $savedId]);
    }

    if ($action === 'toggle_food') {
        $id = filter_var($_POST['id'] ?? '', FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            http_response_code(400);
            sendAdminResult(false, 'Choose a valid food item.');
        }
        $statement = db()->prepare('UPDATE foods SET available = NOT available WHERE id = ?');
        $statement->bind_param('i', $id);
        $statement->execute();
        $found = $statement->affected_rows > 0;
        $statement->close();
        sendAdminResult($found, $found ? 'Availability updated.' : 'Food item was not found.');
    }

    if ($action === 'delete_food') {
        $id = filter_var($_POST['id'] ?? '', FILTER_VALIDATE_INT);
        if (!$id || $id < 1) {
            http_response_code(400);
            sendAdminResult(false, 'Choose a valid food item.');
        }
        $statement = db()->prepare('DELETE FROM foods WHERE id = ?');
        $statement->bind_param('i', $id);
        $statement->execute();
        $found = $statement->affected_rows > 0;
        $statement->close();
        sendAdminResult($found, $found ? 'Food item deleted.' : 'Food item was not found.');
    }

    if ($action === 'update_order') {
        $orderNumber = trim((string) ($_POST['order_number'] ?? ''));
        $status = $_POST['status'] ?? '';
        $allowedStatuses = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
        if ($orderNumber === '' || !in_array($status, $allowedStatuses, true)) {
            http_response_code(400);
            sendAdminResult(false, 'Choose a valid order status.');
        }
        $currentStatement = db()->prepare('SELECT status FROM orders WHERE order_number = ? LIMIT 1');
        $currentStatement->bind_param('s', $orderNumber);
        $currentStatement->execute();
        $currentOrder = $currentStatement->get_result()->fetch_assoc();
        $currentStatement->close();
        $nextStatuses = [
            'Pending' => ['Preparing', 'Cancelled'],
            'Preparing' => ['Ready'],
            'Ready' => ['Completed'],
            'Completed' => [],
            'Cancelled' => [],
        ];
        if (!$currentOrder || !in_array($status, $nextStatuses[$currentOrder['status']] ?? [], true)) {
            http_response_code(400);
            sendAdminResult(false, 'That order status change is not allowed.');
        }
        $statement = db()->prepare('UPDATE orders SET status = ? WHERE order_number = ?');
        $statement->bind_param('ss', $status, $orderNumber);
        $statement->execute();
        $statement->close();
        sendAdminResult(true, 'Order status updated.');
    }

    if ($action === 'save_settings') {
        $name = trim((string) ($_POST['name'] ?? ''));
        $location = trim((string) ($_POST['location'] ?? ''));
        $status = $_POST['status'] ?? '';
        if ($name === '' || strlen($name) > 100 || $location === '' || strlen($location) > 150
            || !in_array($status, ['Open', 'Closed', 'Maintenance'], true)) {
            http_response_code(400);
            sendAdminResult(false, 'Check the cafeteria settings and try again.');
        }
        $statement = db()->prepare(
            'INSERT INTO cafeteria_settings (id, cafeteria_name, location, operating_status) VALUES (1, ?, ?, ?) ON DUPLICATE KEY UPDATE cafeteria_name = VALUES(cafeteria_name), location = VALUES(location), operating_status = VALUES(operating_status)'
        );
        $statement->bind_param('sss', $name, $location, $status);
        $statement->execute();
        $statement->close();
        sendAdminResult(true, 'Settings saved.');
    }

    http_response_code(400);
    sendAdminResult(false, 'Unknown action.');
} catch (Exception $e) {
    error_log('CampusBite admin action failed: ' . $e->getMessage());
    http_response_code(500);
    sendAdminResult(false, 'The change could not be saved. Please try again.');
}
?>
