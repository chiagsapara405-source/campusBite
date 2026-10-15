<?php
require_once __DIR__ . '/admin-common.php';
$adminFoods = [];
$foodLoadError = '';
try {
    $result = db()->query('SELECT id, name, description, category, price, image, vegetarian, available FROM foods ORDER BY id');
    while ($food = $result->fetch_assoc()) {
        $adminFoods[] = [
            'id' => (int) $food['id'],
            'name' => $food['name'],
            'description' => $food['description'],
            'category' => $food['category'],
            'price' => (float) $food['price'],
            'image' => $food['image'],
            'vegetarian' => (bool) $food['vegetarian'],
            'available' => (bool) $food['available'],
            'rating' => 0,
            'ingredients' => '',
        ];
    }
} catch (Exception $e) {
    error_log('CampusBite admin menu load failed: ' . $e->getMessage());
    $foodLoadError = 'Food items could not be loaded.';
}
$adminFoodsJson = json_encode($adminFoods, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_INVALID_UTF8_SUBSTITUTE);
if ($adminFoodsJson === false) { $adminFoodsJson = '[]'; }
?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#fff7ed">
    <title>Menu Management | CampusBite Admin</title>
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

        .sidebar-link { transition: background-color 150ms ease-out, color 150ms ease-out }

        #food-list { transition: opacity 150ms ease-out }
        #food-list.fading { opacity: 0.4 }

        .modal-overlay { opacity: 0; transition: opacity 200ms ease-out }
        .modal-overlay.open { opacity: 1 }
        .modal-panel { transform: scale(0.98); transition: transform 200ms ease-out }
        .modal-overlay.open .modal-panel { transform: scale(1) }

        #toast { transition: opacity 200ms ease-out, transform 200ms ease-out }

        main { animation: pageEnter 300ms ease-out }
        @keyframes pageEnter { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }

        .field-error { border-color: #dc2626 !important }
        .field-error-msg { transition: opacity 150ms ease-out }

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
                    <a href="admin-orders.php"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-stone-600 hover:bg-orange-50">
                        <span class="flex h-5 w-5 items-center justify-center"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 4H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-2"/><rect x="9" y="2.5" width="6" height="4" rx="1"/><path d="M8 11h8M8 15h8M8 18h5"/></svg></span> Orders
                    </a>
                    <a href="admin-menu.php" aria-current="page"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl bg-orange-100 px-4 py-3 text-sm font-extrabold text-orange-800">
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
                <div class="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 class="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Menu Management</h1>
                        <p class="mt-2 text-base text-stone-500 sm:text-lg">Manage cafeteria food items and availability.</p>
                        <?php if ($foodLoadError !== ''): ?><p class="mt-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700" role="alert"><?= adminEscape($foodLoadError) ?></p><?php endif; ?>
                    </div>
                    <button id="add-item-btn"
                            class="focus-ring rounded-full bg-orange-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-orange-700">
                        + Add Food Item
                    </button>
                </div>

                <!-- Controls -->
                <section class="mb-6">
                    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div class="flex flex-wrap gap-2" id="filter-tabs" role="tablist" aria-label="Food filters"></div>
                        <div class="flex gap-2">
                            <label class="sr-only" for="food-search">Search food</label>
                            <input id="food-search" type="search" placeholder="Search food..."
                                   class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none placeholder:text-stone-400 sm:w-48">
                            <label class="sr-only" for="food-sort">Sort food</label>
                            <select id="food-sort"
                                    class="focus-ring rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm font-bold text-ink">
                                <option value="recommended">Recommended</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name-asc">Name: A-Z</option>
                                <option value="name-desc">Name: Z-A</option>
                            </select>
                        </div>
                    </div>
                    <p id="result-count" class="mt-2 text-sm font-bold text-stone-400"></p>
                </section>

                <div id="food-list" class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"></div>
                <div id="empty-state"></div>
            </div>
        </main>
    </div>

    <!-- Add/Edit modal -->
    <div id="food-modal"
         class="modal-overlay fixed inset-0 z-[60] hidden items-center justify-center bg-black/40 p-4"
         role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-panel w-full max-w-lg overflow-y-auto rounded-2xl border border-orange-100 bg-white p-6 shadow-xl max-h-[90vh]">
            <div class="flex items-center justify-between">
                <h2 id="modal-title" class="font-display text-xl font-extrabold text-ink">Add Food Item</h2>
                <button id="modal-close" type="button"
                        class="focus-ring flex h-10 w-10 items-center justify-center rounded-full border border-stone-200"
                        aria-label="Close modal"><svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
            </div>
            <form id="food-form" class="mt-5 space-y-4" novalidate>
                <input type="hidden" id="edit-id">

                <div>
                    <label for="field-name" class="mb-1 block text-sm font-bold text-stone-700">Food Name <span class="text-red-500">*</span></label>
                    <input id="field-name" type="text" required
                           class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none">
                    <p class="field-error-msg mt-1 hidden text-xs text-red-600"></p>
                </div>

                <div>
                    <label for="field-desc" class="mb-1 block text-sm font-bold text-stone-700">Description <span class="text-red-500">*</span></label>
                    <textarea id="field-desc" rows="2" required
                              class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none"></textarea>
                    <p class="field-error-msg mt-1 hidden text-xs text-red-600"></p>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label for="field-category" class="mb-1 block text-sm font-bold text-stone-700">Category <span class="text-red-500">*</span></label>
                        <select id="field-category" required
                                class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold">
                            <option value="">Select category</option>
                            <option>Breakfast</option>
                            <option>Meals</option>
                            <option>Burgers</option>
                            <option>Pizza</option>
                            <option>Snacks</option>
                            <option>Drinks</option>
                            <option>Desserts</option>
                        </select>
                        <p class="field-error-msg mt-1 hidden text-xs text-red-600"></p>
                    </div>
                    <div>
                        <label for="field-price" class="mb-1 block text-sm font-bold text-stone-700">Price (&#8377;) <span class="text-red-500">*</span></label>
                        <input id="field-price" type="number" min="0.01" step="0.01" required
                               class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none">
                        <p class="field-error-msg mt-1 hidden text-xs text-red-600"></p>
                    </div>
                </div>

                <div class="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label for="field-image" class="mb-1 block text-sm font-bold text-stone-700">Image URL</label>
                        <input id="field-image" type="url" placeholder="https://..."
                               class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none">
                    </div>
                </div>

                <div class="flex gap-6">
                    <label class="flex items-center gap-2 text-sm font-bold text-stone-700">
                        <input id="field-vegetarian" type="checkbox" checked
                               class="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500">
                        Vegetarian
                    </label>
                    <label class="flex items-center gap-2 text-sm font-bold text-stone-700">
                        <input id="field-available" type="checkbox" checked
                               class="h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500">
                        Available
                    </label>
                </div>

                <div class="flex gap-3 pt-2">
                    <button type="submit"
                            class="focus-ring flex-1 rounded-xl bg-orange-600 px-5 py-3 text-sm font-extrabold text-white hover:bg-orange-700">
                        Save Item
                    </button>
                    <button type="button" id="modal-cancel"
                            class="focus-ring rounded-xl border border-stone-200 bg-white px-5 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Delete confirmation modal -->
    <div id="delete-modal"
         class="modal-overlay fixed inset-0 z-[60] hidden items-center justify-center bg-black/40 p-4"
         role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
        <div class="modal-panel w-full max-w-sm rounded-2xl border border-orange-100 bg-white p-6 shadow-xl">
            <h3 id="delete-modal-title" class="font-display text-xl font-extrabold text-ink">Delete Food Item?</h3>
            <p id="delete-modal-msg" class="mt-2 text-sm text-stone-500"></p>
            <div class="mt-5 flex gap-3">
                <button id="delete-cancel"
                        class="focus-ring flex-1 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold text-stone-600 hover:bg-stone-50">
                    Cancel
                </button>
                <button id="delete-confirm"
                        class="focus-ring flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-extrabold text-white hover:bg-red-700">
                    Delete
                </button>
            </div>
        </div>
    </div>

    <!-- Toast -->
    <div id="toast"
         class="pointer-events-none fixed bottom-5 left-1/2 z-[60] hidden -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl"
         role="status" aria-live="polite"></div>

    <script>window.CAMPUSBITE_ADMIN_FOODS = <?= $adminFoodsJson ?>; window.CAMPUSBITE_ADMIN_TOKEN = <?= json_encode($_SESSION['admin_token']) ?>;</script>
    <script src="js/admin-menu.js"></script>
</body>

</html>
