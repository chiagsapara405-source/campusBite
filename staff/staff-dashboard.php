<?php
require_once __DIR__ . '/staff-common.php';

$orders = [];
$itemsByOrder = [];
$loadError = '';

try {
    $result = db()->query(
        "SELECT id, order_number, customer_name, student_id, customer_phone, pickup_location, pickup_time, special_instructions, status, created_at
         FROM orders
         WHERE status IN ('Pending', 'Preparing', 'Ready')
         ORDER BY FIELD(status, 'Pending', 'Preparing', 'Ready'), created_at ASC"
    );

    while ($row = $result->fetch_assoc()) {
        $row['id'] = (int) $row['id'];
        $orders[$row['id']] = $row;
    }

    if ($orders) {
        $itemResult = db()->query(
            "SELECT oi.order_id, oi.food_name, oi.quantity
             FROM order_items oi
             INNER JOIN orders o ON o.id = oi.order_id
             WHERE o.status IN ('Pending', 'Preparing', 'Ready')
             ORDER BY oi.id ASC"
        );
        while ($item = $itemResult->fetch_assoc()) {
            $itemsByOrder[(int) $item['order_id']][] = $item;
        }
    }
} catch (Throwable $e) {
    error_log('CampusBite staff queue failed: ' . $e->getMessage());
    $loadError = 'Orders could not be loaded right now. Please refresh the page.';
}

$counts = ['Pending' => 0, 'Preparing' => 0, 'Ready' => 0];
foreach ($orders as $order) {
    if (isset($counts[$order['status']])) {
        $counts[$order['status']]++;
    }
}

$nextStatus = [
    'Pending' => 'Preparing',
    'Preparing' => 'Ready',
    'Ready' => 'Completed',
];
$statusLabel = [
    'Pending' => 'Waiting',
    'Preparing' => 'Preparing',
    'Ready' => 'Ready for pickup',
];
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#fff7ed">
    <title>Staff Order Queue | CampusBite</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Nunito+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background:#fff7ed; color:#201a15 }
        .bg-ink { background:#201a15 }
        .focus-ring:focus-visible { outline:2px solid #ea580c; outline-offset:3px }
        @media(prefers-reduced-motion:reduce) { *,*:before,*:after { animation-duration:.01ms!important; transition-duration:.01ms!important; scroll-behavior:auto!important } }
    </style>
</head>
<body class="min-h-screen font-['Nunito_Sans'] antialiased">
    <header class="border-b border-orange-100 bg-white">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
            <a href="staff-dashboard.php" class="rounded-lg font-['Bricolage_Grotesque'] text-xl font-extrabold text-stone-900 focus-ring">Campus<span class="text-orange-600">Bite</span><span class="ml-2 text-xs font-bold uppercase tracking-wider text-stone-400">Staff</span></a>
            <div class="flex items-center gap-3">
                <span class="hidden text-sm font-bold text-stone-600 sm:inline"><?= staffEscape($_SESSION['user_name'] ?? 'Staff') ?></span>
                <a href="../logout.php" class="focus-ring rounded-xl border border-stone-200 px-4 py-2 text-sm font-extrabold text-red-600 hover:bg-red-50">Log out</a>
            </div>
        </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div class="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <p class="text-xs font-extrabold uppercase tracking-[.18em] text-orange-600">Kitchen workspace</p>
                <h1 class="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold sm:text-4xl">Order queue</h1>
                <p class="mt-2 text-stone-500">Prepare incoming orders and keep pickup status up to date.</p>
            </div>
            <a href="staff-dashboard.php" class="focus-ring w-fit rounded-xl bg-white px-4 py-2.5 text-sm font-extrabold text-stone-700 shadow-sm hover:bg-orange-50">Refresh queue</a>
        </div>

        <section class="mb-7 grid gap-3 sm:grid-cols-3" aria-label="Order counts">
            <?php foreach (['Pending' => 'Waiting', 'Preparing' => 'In preparation', 'Ready' => 'Ready for pickup'] as $key => $label): ?>
                <div class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                    <p class="text-sm font-bold text-stone-500"><?= staffEscape($label) ?></p>
                    <p class="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold"><?= (int) $counts[$key] ?></p>
                </div>
            <?php endforeach; ?>
        </section>

        <?php if ($loadError !== ''): ?>
            <p class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700" role="alert"><?= staffEscape($loadError) ?></p>
        <?php elseif (!$orders): ?>
            <div class="rounded-2xl border border-orange-100 bg-white px-6 py-16 text-center shadow-sm">
                <div class="text-4xl" aria-hidden="true">🍽️</div>
                <h2 class="mt-4 font-['Bricolage_Grotesque'] text-xl font-extrabold">No active orders</h2>
                <p class="mt-2 text-sm text-stone-500">New student orders will appear here.</p>
            </div>
        <?php else: ?>
            <div class="space-y-4">
                <?php foreach ($orders as $order): ?>
                    <?php
                    $current = $order['status'];
                    $next = $nextStatus[$current] ?? null;
                    $badge = ['Pending' => 'bg-amber-100 text-amber-800', 'Preparing' => 'bg-blue-100 text-blue-800', 'Ready' => 'bg-green-100 text-green-800'][$current] ?? 'bg-stone-100 text-stone-700';
                    ?>
                    <article class="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
                        <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div class="flex flex-wrap items-center gap-2">
                                    <h2 class="font-['Bricolage_Grotesque'] text-xl font-extrabold"><?= staffEscape($order['order_number']) ?></h2>
                                    <span class="rounded-full px-3 py-1 text-xs font-extrabold <?= $badge ?>"><?= staffEscape($statusLabel[$current] ?? $current) ?></span>
                                </div>
                                <p class="mt-2 text-sm font-bold text-stone-700"><?= staffEscape($order['customer_name']) ?> <span class="font-normal text-stone-400">· Student ID <?= staffEscape($order['student_id']) ?></span></p>
                                <p class="mt-1 text-sm text-stone-500">Pickup: <?= staffEscape($order['pickup_location']) ?> · <?= staffEscape($order['pickup_time']) ?></p>
                            </div>
                            <p class="text-xs font-semibold text-stone-400"><?= staffEscape(date('d M Y, h:i A', strtotime($order['created_at']))) ?></p>
                        </div>
                        <div class="mt-4 rounded-xl bg-orange-50/70 p-4">
                            <p class="mb-2 text-xs font-extrabold uppercase tracking-wider text-stone-500">Items</p>
                            <ul class="space-y-1.5 text-sm font-bold text-stone-800">
                                <?php foreach (($itemsByOrder[$order['id']] ?? []) as $item): ?>
                                    <li><?= (int) $item['quantity'] ?> × <?= staffEscape($item['food_name']) ?></li>
                                <?php endforeach; ?>
                            </ul>
                        </div>
                        <?php if (!empty($order['special_instructions'])): ?>
                            <p class="mt-3 text-sm text-stone-600"><span class="font-extrabold">Instructions:</span> <?= nl2br(staffEscape($order['special_instructions'])) ?></p>
                        <?php endif; ?>
                        <div class="mt-4 flex flex-col gap-3 border-t border-stone-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                            <p class="text-sm text-stone-500">Contact: <?= staffEscape($order['customer_phone']) ?></p>
                            <?php if ($next !== null): ?>
                                <form method="post" action="staff-actions.php" class="flex flex-wrap items-center gap-2">
                                    <input type="hidden" name="token" value="<?= staffEscape($_SESSION['staff_token']) ?>">
                                    <input type="hidden" name="order_number" value="<?= staffEscape($order['order_number']) ?>">
                                    <input type="hidden" name="status" value="<?= staffEscape($next) ?>">
                                    <button type="submit" class="focus-ring rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-orange-700">
                                        <?= $next === 'Preparing' ? 'Start preparing' : ($next === 'Ready' ? 'Mark ready' : 'Mark completed') ?>
                                    </button>
                                </form>
                            <?php endif; ?>
                        </div>
                    </article>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </main>
</body>
</html>
