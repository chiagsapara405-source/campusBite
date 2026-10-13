<?php
session_start();
require_once __DIR__ . '/db.php';

if (empty($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$order = null;
$orderNumber = isset($_GET['order']) && is_string($_GET['order']) ? trim($_GET['order']) : '';

if ($orderNumber !== '') {
    try {
        $statement = db()->prepare('SELECT * FROM orders WHERE order_number = ? AND user_id = ? LIMIT 1');
        $userId = (int) $_SESSION['user_id'];
        $statement->bind_param('si', $orderNumber, $userId);
        $statement->execute();
        $row = $statement->get_result()->fetch_assoc();

        if ($row) {
            $order = [
                'orderId' => $row['order_number'],
                'createdAt' => $row['created_at'],
                'customer' => ['name' => $row['customer_name'], 'studentId' => $row['student_id'], 'email' => $row['customer_email'], 'phone' => $row['customer_phone']],
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
        $statement->close();
    } catch (Exception $e) {
        error_log('CampusBite confirmation lookup failed: ' . $e->getMessage());
    }
}

$orderJson = json_encode($order, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
if ($orderJson === false) {
    $orderJson = 'null';
}
?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#fff7ed">
    <title>Order Confirmed | CampusBite</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Nunito+Sans:wght@400;600;700;800&display=swap"
        rel="stylesheet">
    <script>window.tailwind = window.tailwind || {}; tailwind.config = { theme: { extend: { colors: { cream: '#FFF7ED', ink: '#201A15' }, fontFamily: { display: ['"Bricolage Grotesque"', 'sans-serif'], body: ['"Nunito Sans"', 'sans-serif'] }, boxShadow: { card: '0 16px 38px -18px rgba(124,63,14,.2)' } } } };</script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body { background: #fff7ed; color: #201a15 }
        .bg-ink { background: #201a15 }

        button, a { transition: background-color 150ms ease-out, color 150ms ease-out, transform 150ms ease-out, box-shadow 150ms ease-out, border-color 150ms ease-out, opacity 200ms ease-out }
        button:active { transform: scale(0.97) }

        .focus-ring:focus-visible { outline: 2px solid #ea580c; outline-offset: 2px }

        main { animation: pageEnter 300ms ease-out }
        @keyframes pageEnter { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }

        @media(prefers-reduced-motion:reduce) {
            *, *:before, *:after {
                animation-duration: .01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: .01ms !important;
                scroll-behavior: auto !important
            }
        }
    </style>
</head>

<body class="font-body antialiased"><a href="#main-content"
        class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">Skip
        to content</a>
    <header class="sticky top-0 z-40 border-b border-orange-100 bg-white/95 backdrop-blur">
        <nav class="mx-auto flex h-18 max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
            aria-label="Primary navigation"><a href="index.php"
                class="focus-ring flex shrink-0 items-center gap-2.5 rounded-xl" aria-label="CampusBite home"><span
                    class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-xl">🍔</span><span
                    class="font-display text-xl font-bold text-ink">Campus<span
                        class="text-orange-600">Bite</span></span></a>
            <div class="hidden items-center gap-1 md:flex"><a href="index.php"
                    class="focus-ring rounded-full px-4 py-2 text-sm font-bold text-stone-600 hover:bg-orange-50">Home</a><a
                    href="menu.php"
                    class="focus-ring rounded-full px-4 py-2 text-sm font-bold text-stone-600 hover:bg-orange-50">Menu</a><a href="orders.php"
                    class="focus-ring rounded-full px-4 py-2 text-sm font-bold text-stone-600 hover:bg-orange-50">My
                    Orders</a></div>
            <div class="ml-auto flex items-center gap-1 sm:gap-2"><a href="cart.php"
                    class="focus-ring relative flex h-10 items-center gap-1.5 rounded-full bg-orange-600 px-3 text-sm font-extrabold text-white"
                    aria-label="View cart, 0 items">🛒 <span id="cart-count">0</span></a><button type="button"
                    data-future
                    class="focus-ring hidden h-10 w-10 rounded-full bg-orange-100 font-bold text-orange-800 sm:block"
                    aria-label="Student profile">S</button><button id="menu-toggle" type="button"
                    class="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 md:hidden"
                    aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">☰</button></div>
        </nav>
        <div id="mobile-nav" class="hidden border-t border-stone-100 bg-white px-4 py-3 md:hidden"><a href="index.php"
                class="block rounded-xl px-4 py-3 font-bold hover:bg-orange-50">Home</a><a href="menu.php"
                class="block rounded-xl px-4 py-3 font-bold hover:bg-orange-50">Menu</a><a href="orders.php"
                class="block rounded-xl px-4 py-3 font-bold hover:bg-orange-50">My
                Orders</a><button type="button" data-future
                class="block w-full rounded-xl px-4 py-3 text-left font-bold hover:bg-orange-50">Profile</button></div>
    </header>
    <main id="main-content" class="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6 lg:px-8">
        <div id="confirmation-content"></div>
    </main>
    <div id="toast"
        class="pointer-events-none fixed bottom-5 left-1/2 z-[60] hidden -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl"
        role="status" aria-live="polite"></div>
    <script>window.CAMPUSBITE_ORDER = <?= $orderJson ?>;</script>
    <script src="js/order-confirmation.js"></script>
</body>

</html>
