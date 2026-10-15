<?php
require_once __DIR__ . '/admin-common.php';
$adminOrders = [];
$ordersError = '';
try {
    $adminOrders = getAdminOrders();
} catch (Exception $e) {
    error_log('CampusBite admin order list failed: ' . $e->getMessage());
    $ordersError = 'Orders could not be loaded. Please try again later.';
}
$adminOrdersJson = json_encode($adminOrders, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_INVALID_UTF8_SUBSTITUTE);
if ($adminOrdersJson === false) { $adminOrdersJson = '[]'; }
?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#fff7ed">
    <title>Order Management | CampusBite Admin</title>
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
        input, select { transition: border-color 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out }

        .card-hover { transition: transform 200ms ease-out, box-shadow 200ms ease-out }
        .card-hover:hover { transform: translateY(-2px); box-shadow: 0 20px 40px -20px rgba(124,63,14,.25) }

        .focus-ring:focus-visible { outline: 2px solid #ea580c; outline-offset: 2px }

        .sidebar-link { transition: background-color 150ms ease-out, color 150ms ease-out }

        #orders-list { transition: opacity 150ms ease-out }
        #orders-list.fading { opacity: 0.4 }

        #toast { transition: opacity 200ms ease-out, transform 200ms ease-out }

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

<body class="font-body antialiased">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">Skip to content</a>

    <!-- Mobile top bar -->
    <header class="sticky top-0 z-40 border-b border-orange-100 bg-white/95 backdrop-blur lg:hidden">
        <div class="flex h-14 items-center justify-between px-4">
            <a href="admin-dashboard.php" class="focus-ring flex items-center gap-2 rounded-xl" aria-label="CampusBite admin home">
                <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-lg"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></span>
                <span class="font-display text-lg font-bold text-ink">Campus<span class="text-orange-600">Bite</span></span>
            </a>
            <button id="sidebar-toggle" type="button"
                    class="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200"
                    aria-expanded="false" aria-controls="sidebar" aria-label="Toggle navigation"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
        </div>
    </header>

    <div class="flex">
        <!-- Sidebar -->
        <aside id="sidebar"
               class="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-orange-100 bg-white lg:sticky lg:top-0 lg:block lg:h-screen"
               aria-label="Admin navigation">
            <div class="flex h-full flex-col">
                <div class="hidden h-16 items-center gap-2.5 border-b border-orange-100 px-6 lg:flex">
                    <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-xl"><svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></span>
                    <div>
                        <span class="font-display text-xl font-bold text-ink">Campus<span class="text-orange-600">Bite</span></span>
                        <p class="text-xs font-bold text-stone-400">Admin Panel</p>
                    </div>
                </div>
                <div class="flex items-center justify-between border-b border-orange-100 px-4 py-3 lg:hidden">
                    <span class="font-display text-lg font-bold text-ink">Navigation</span>
                    <button id="sidebar-close" type="button"
                            class="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200"
                            aria-label="Close navigation"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
                </div>
                <nav class="flex-1 overflow-y-auto px-3 py-4">
                    <a href="admin-dashboard.php"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-stone-600 hover:bg-orange-50">
                        <span class="flex h-5 w-5 items-center justify-center"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="5" rx="1.5"/><rect x="13" y="10" width="8" height="11" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/></svg></span> Dashboard
                    </a>
                    <a href="admin-orders.php" aria-current="page"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl bg-orange-100 px-4 py-3 text-sm font-extrabold text-orange-800">
                        <span class="flex h-5 w-5 items-center justify-center"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-2"/><rect x="9" y="2.5" width="6" height="4" rx="1"/><path d="M8 11h8M8 15h8M8 18h5"/></svg></span> Orders
                    </a>
                    <a href="admin-menu.php"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-stone-600 hover:bg-orange-50">
                        <span class="flex h-5 w-5 items-center justify-center"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3v18M17 3c-2.5 2-3 5-3 8h6V3"/></svg></span> Menu
                    </a>
                    <a href="admin-students.php"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-stone-600 hover:bg-orange-50">
                        <span class="flex h-5 w-5 items-center justify-center"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"/><circle cx="9.5" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></span> Students
                    </a>
                    <a href="admin-settings.php"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-stone-600 hover:bg-orange-50">
                        <span class="flex h-5 w-5 items-center justify-center"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a8 8 0 0 0 0-6l1.4-1.1-1.4-2.4-1.7.6a8 8 0 0 0-2.8-1.6L14.6 3h-2.8l-.3 1.5a8 8 0 0 0-2.8 1.6L7 5.5 5.6 7.9 7 9a8 8 0 0 0 0 6l-1.4 1.1L7 18.5l1.7-.6a8 8 0 0 0 2.8 1.6l.3 1.5h2.8l.3-1.5a8 8 0 0 0 2.8-1.6l1.7.6 1.4-2.4z"/></svg></span> Settings
                    </a>
                </nav>
                <div class="border-t border-orange-100 px-3 py-4">
                    <a href="../logout.php"
                       class="sidebar-link flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50">
                        <span aria-hidden="true"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 17l5-5-5-5M15 12H3"/><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7"/></svg></span> Logout
                    </a>
                </div>
            </div>
        </aside>
        <div id="sidebar-overlay" class="fixed inset-0 z-40 hidden bg-black/30 lg:hidden" aria-hidden="true"></div>

        <!-- Main content -->
        <main id="main-content" class="min-h-screen flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-6xl">
                <div class="mb-8">
                    <h1 class="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Order Management</h1>
                    <p class="mt-2 text-base text-stone-500 sm:text-lg">Manage and update cafeteria orders.</p>
                    <?php if ($ordersError !== ''): ?><p class="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700" role="alert"><?= adminEscape($ordersError) ?></p><?php endif; ?>
                </div>

                <!-- Controls -->
                <section id="controls-section" class="mb-6 hidden">
                    <div class="flex flex-col gap-3">
                        <div id="filter-tabs" class="flex flex-wrap gap-2" role="tablist" aria-label="Order filters"></div>
                        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <label class="sr-only" for="order-search">Search orders</label>
                            <input id="order-search" type="search" placeholder="Search order ID or student..."
                                   class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-stone-400 sm:w-64">
                            <label class="sr-only" for="order-sort">Sort orders</label>
                            <select id="order-sort"
                                    class="focus-ring rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-bold text-ink">
                                <option value="newest">Newest first</option>
                                <option value="oldest">Oldest first</option>
                                <option value="highest">Highest total</option>
                                <option value="lowest">Lowest total</option>
                            </select>
                        </div>
                    </div>
                </section>

                <div id="orders-list" class="space-y-4"></div>
                <div id="empty-state"></div>
            </div>
        </main>
    </div>

    <!-- Toast -->
    <div id="toast"
         class="pointer-events-none fixed bottom-5 left-1/2 z-[60] hidden -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl"
         role="status" aria-live="polite"></div>

    <script>window.CAMPUSBITE_ADMIN_ORDERS = <?= $adminOrdersJson ?>; window.CAMPUSBITE_ADMIN_TOKEN = <?= json_encode($_SESSION['admin_token']) ?>;</script>
    <script src="js/admin-orders.js"></script>
</body>

</html>
