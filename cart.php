<?php
require_once __DIR__ . '/db.php';
$cartFoods = [];
try {
    $result = db()->query('SELECT id, name, description, category, price, image, vegetarian, available FROM foods ORDER BY id');
    while ($food = $result->fetch_assoc()) {
        $cartFoods[] = [
            'id' => (int) $food['id'], 'name' => $food['name'], 'description' => $food['description'],
            'category' => $food['category'], 'price' => (float) $food['price'], 'image' => $food['image'],
            'vegetarian' => (bool) $food['vegetarian'], 'available' => (bool) $food['available'],
        ];
    }
} catch (Exception $e) {
    error_log('CampusBite cart menu lookup failed: ' . $e->getMessage());
}
$cartFoodsJson = json_encode($cartFoods, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_INVALID_UTF8_SUBSTITUTE);
if ($cartFoodsJson === false) { $cartFoodsJson = '[]'; }
?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#fff7ed">
    <title>Your Cart | CampusBite</title>
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
        input, textarea, select { transition: border-color 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out }

        .card-hover { transition: transform 200ms ease-out, box-shadow 200ms ease-out }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 20px 40px -20px rgba(124,63,14,.25) }

        .focus-ring:focus-visible { outline: 2px solid #ea580c; outline-offset: 2px }

        #toast { transition: opacity 200ms ease-out, transform 200ms ease-out }

        /* Cart item removal */
        .cart-item-exit { transition: opacity 200ms ease-out, transform 200ms ease-out }
        .cart-item-exit.removing { opacity: 0; transform: translateX(-20px) }

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
                    aria-label="View cart, 0 items" aria-current="page">🛒 <span id="cart-count">0</span></a><button
                    type="button" data-future
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
    <main id="main-content" class="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-8">
        <section class="mb-8">
            <h1 class="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Your Cart</h1>
            <p class="mt-2 text-base text-stone-500 sm:text-lg">Review your items before placing your order.</p>
            <p id="item-count" class="mt-1 text-sm font-bold text-orange-600"></p>
        </section>
        <div id="cart-content">
            <div class="grid gap-8 lg:grid-cols-3">
                <section id="cart-items" class="space-y-4 lg:col-span-2" aria-label="Cart items"></section>
                <aside id="order-summary" class="lg:col-span-1" aria-label="Order summary"></aside>
            </div>
            <section id="recommended-section" class="mt-12 hidden">
                <h2 class="font-display text-2xl font-extrabold text-ink">You might also like</h2>
                <div id="recommended-grid"
                    class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"></div>
            </section>
        </div>
        <div id="empty-cart" class="hidden"></div>
    </main>
    <div id="toast"
        class="pointer-events-none fixed bottom-5 left-1/2 z-[60] hidden -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl"
        role="status" aria-live="polite"></div>
    <script>window.CAMPUSBITE_FOODS = <?= $cartFoodsJson ?>;</script>
    <script src="js/cart.js"></script>
</body>

</html>
