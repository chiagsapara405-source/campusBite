<?php
require_once __DIR__ . '/admin-common.php';
$orderNumber = isset($_GET['id']) && is_string($_GET['id']) ? trim($_GET['id']) : '';
$adminOrder = null;
$adminOrderError = '';
try {
    if ($orderNumber !== '') {
        $adminOrder = getAdminOrder($orderNumber);
    }
} catch (Exception $e) {
    error_log('CampusBite admin order details load failed: ' . $e->getMessage());
    $adminOrderError = 'Order details could not be loaded.';
}
$adminOrderJson = json_encode($adminOrder, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_INVALID_UTF8_SUBSTITUTE);
if ($adminOrderJson === false) { $adminOrderJson = 'null'; }
?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#fff7ed">
    <title>Order Details | CampusBite Admin</title>
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
        select { transition: border-color 150ms ease-out, box-shadow 150ms ease-out }

        .focus-ring:focus-visible { outline: 2px solid #ea580c; outline-offset: 2px }

        .sidebar-link { transition: background-color 150ms ease-out, color 150ms ease-out }

        .modal-overlay { opacity: 0; transition: opacity 200ms ease-out }
        .modal-overlay.open { opacity: 1 }
        .modal-panel { transform: scale(0.98); transition: transform 200ms ease-out }
        .modal-overlay.open .modal-panel { transform: scale(1) }

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
            <div id="order-content" class="mx-auto max-w-5xl"></div>
        </main>
    </div>

    <!-- Cancel confirmation modal -->
    <div id="cancel-modal"
         class="modal-overlay fixed inset-0 z-[60] hidden items-center justify-center bg-black/40 p-4"
         role="dialog" aria-modal="true" aria-labelledby="cancel-modal-title">
        <div class="modal-panel w-full max-w-sm rounded-2xl border border-orange-100 bg-white p-6 shadow-xl">
            <h3 id="cancel-modal-title" class="font-display text-xl font-extrabold text-ink">Cancel this order?</h3>
            <p class="mt-2 text-sm text-stone-500">You won't be able to undo this action.</p>
            <div class="mt-5 flex gap-3">
                <button id="cancel-keep"
                        class="focus-ring flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-600 hover:bg-stone-50">
                    Keep Order
                </button>
                <button id="cancel-confirm"
                        class="focus-ring flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-red-700">
                    Cancel Order
                </button>
            </div>
        </div>
    </div>

    <!-- Toast -->
    <div id="toast"
         class="pointer-events-none fixed bottom-5 left-1/2 z-[60] hidden -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl"
         role="status" aria-live="polite"></div>

    <script>window.CAMPUSBITE_ADMIN_ORDER = <?= $adminOrderJson ?>; window.CAMPUSBITE_ADMIN_TOKEN = <?= json_encode($_SESSION['admin_token']) ?>;</script>
    <script src="js/admin-order-details.js"></script>
</body>

</html>
