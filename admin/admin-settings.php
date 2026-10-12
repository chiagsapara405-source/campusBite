<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#fff7ed">
    <title>Settings | CampusBite Admin</title>
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
        .focus-ring:focus-visible { outline: 2px solid #ea580c; outline-offset: 2px }
        .sidebar-link { transition: background-color 150ms ease-out, color 150ms ease-out }
        #toast { transition: opacity 200ms ease-out, transform 200ms ease-out }
        main { animation: pageEnter 300ms ease-out }
        @keyframes pageEnter { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @media(prefers-reduced-motion:reduce) {
            *, *:before, *:after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important }
        }
    </style>
</head>

<body class="font-body antialiased">
    <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">Skip to content</a>

    <!-- Mobile top bar -->
    <header class="sticky top-0 z-40 border-b border-orange-100 bg-white/95 backdrop-blur lg:hidden">
        <div class="flex h-14 items-center justify-between px-4">
            <a href="admin-dashboard.php" class="focus-ring flex items-center gap-2 rounded-xl" aria-label="CampusBite admin home">
                <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-lg">🍔</span>
                <span class="font-display text-lg font-bold text-ink">Campus<span class="text-orange-600">Bite</span></span>
            </a>
            <button id="sidebar-toggle" type="button"
                    class="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200"
                    aria-expanded="false" aria-controls="sidebar" aria-label="Toggle navigation">☰</button>
        </div>
    </header>

    <div class="flex">
        <!-- Sidebar -->
        <aside id="sidebar"
               class="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-orange-100 bg-white lg:sticky lg:top-0 lg:block lg:h-screen"
               aria-label="Admin navigation">
            <div class="flex h-full flex-col">
                <div class="hidden h-16 items-center gap-2.5 border-b border-orange-100 px-6 lg:flex">
                    <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-xl">🍔</span>
                    <div>
                        <span class="font-display text-xl font-bold text-ink">Campus<span class="text-orange-600">Bite</span></span>
                        <p class="text-xs font-bold text-stone-400">Admin Panel</p>
                    </div>
                </div>
                <div class="flex items-center justify-between border-b border-orange-100 px-4 py-3 lg:hidden">
                    <span class="font-display text-lg font-bold text-ink">Navigation</span>
                    <button id="sidebar-close" type="button"
                            class="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200"
                            aria-label="Close navigation">✕</button>
                </div>
                <nav class="flex-1 overflow-y-auto px-3 py-4">
                    <a href="admin-dashboard.php"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-stone-600 hover:bg-orange-50">
                        <span aria-hidden="true">📊</span> Dashboard
                    </a>
                    <a href="admin-orders.php"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-stone-600 hover:bg-orange-50">
                        <span aria-hidden="true">📋</span> Orders
                    </a>
                    <a href="admin-menu.php"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-stone-600 hover:bg-orange-50">
                        <span aria-hidden="true">🍽️</span> Menu
                    </a>
                    <a href="admin-students.php"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-stone-600 hover:bg-orange-50">
                        <span aria-hidden="true">👥</span> Students
                    </a>
                    <a href="admin-settings.php" aria-current="page"
                       class="sidebar-link mb-1 flex items-center gap-3 rounded-xl bg-orange-100 px-4 py-3 text-sm font-extrabold text-orange-800">
                        <span aria-hidden="true">⚙️</span> Settings
                    </a>
                </nav>
                <div class="border-t border-orange-100 px-3 py-4">
                    <a href="../login.php" onclick="localStorage.removeItem('campusbite_role')"
                       class="sidebar-link flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50">
                        <span aria-hidden="true">🚪</span> Logout
                    </a>
                </div>
            </div>
        </aside>
        <div id="sidebar-overlay" class="fixed inset-0 z-40 hidden bg-black/30 lg:hidden" aria-hidden="true"></div>

        <!-- Main content -->
        <main id="main-content" class="min-h-screen flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-2xl">
                <div class="mb-8">
                    <h1 class="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Cafeteria Settings</h1>
                    <p class="mt-2 text-base text-stone-500 sm:text-lg">Configure basic cafeteria information.</p>
                </div>

                <form id="settings-form" class="rounded-2xl border border-orange-100 bg-white p-6 shadow-card sm:p-8">
                    <div class="space-y-5">
                        <div>
                            <label for="setting-name" class="mb-1 block text-sm font-bold text-stone-700">Cafeteria Name</label>
                            <input id="setting-name" type="text" value="CampusBite Cafeteria"
                                   class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none">
                        </div>

                        <div>
                            <label for="setting-location" class="mb-1 block text-sm font-bold text-stone-700">Location</label>
                            <input id="setting-location" type="text" value="Main Cafeteria / Food Court"
                                   class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none">
                        </div>

                        <div>
                            <label for="setting-status" class="mb-1 block text-sm font-bold text-stone-700">Operating Status</label>
                            <select id="setting-status"
                                    class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-bold">
                                <option value="Open" selected>Open</option>
                                <option value="Closed">Closed</option>
                                <option value="Maintenance">Under Maintenance</option>
                            </select>
                        </div>

                        <div>
                            <label class="mb-1 block text-sm font-bold text-stone-700">Pickup Information</label>
                            <p class="text-sm text-stone-500">Orders are prepared for cafeteria pickup.</p>
                        </div>
                    </div>

                    <div class="mt-6 flex gap-3">
                        <button type="submit"
                                class="focus-ring rounded-xl bg-orange-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-orange-700">
                            Save Settings
                        </button>
                        <button type="button" id="reset-settings"
                                class="focus-ring rounded-xl border border-stone-200 bg-white px-6 py-3 text-sm font-bold text-stone-600 hover:bg-stone-50">
                            Reset
                        </button>
                    </div>
                </form>
            </div>
        </main>
    </div>

    <!-- Toast -->
    <div id="toast"
         class="pointer-events-none fixed bottom-5 left-1/2 z-[60] hidden -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl"
         role="status" aria-live="polite"></div>

    <script>
        (function() {
            var SETTINGS_KEY = 'campusbite_settings';
            var toggle  = document.getElementById('sidebar-toggle');
            var sidebar = document.getElementById('sidebar');
            var overlay = document.getElementById('sidebar-overlay');
            var close   = document.getElementById('sidebar-close');
            var form    = document.getElementById('settings-form');
            var reset   = document.getElementById('reset-settings');
            var toast, toastTimer;

            function $(id) { return document.getElementById(id); }

            // Sidebar
            toggle.onclick = function() {
                sidebar.classList.toggle('hidden');
                sidebar.classList.toggle('block');
                overlay.classList.toggle('hidden');
                toggle.setAttribute('aria-expanded', String(!sidebar.classList.contains('hidden')));
            };
            close.onclick = function() {
                sidebar.classList.add('hidden');
                sidebar.classList.remove('block');
                overlay.classList.add('hidden');
                toggle.setAttribute('aria-expanded', 'false');
            };
            overlay.onclick = close.onclick;
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && !sidebar.classList.contains('hidden') && window.innerWidth < 1024) close.onclick();
            });

            // Load settings
            function loadSettings() {
                try {
                    var raw = localStorage.getItem(SETTINGS_KEY);
                    if (raw) {
                        var s = JSON.parse(raw);
                        if (s.name)     $('setting-name').value     = s.name;
                        if (s.location) $('setting-location').value = s.location;
                        if (s.status)   $('setting-status').value   = s.status;
                    }
                } catch {}
            }

            // Save
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                var settings = {
                    name:     $('setting-name').value.trim(),
                    location: $('setting-location').value.trim(),
                    status:   $('setting-status').value,
                };
                localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
                showToast('Settings saved.');
            });

            // Reset
            reset.onclick = function() {
                $('setting-name').value     = 'CampusBite Cafeteria';
                $('setting-location').value = 'Main Cafeteria / Food Court';
                $('setting-status').value   = 'Open';
            };

            // Toast
            function showToast(msg) {
                toast = $('toast');
                toast.textContent = msg;
                toast.classList.remove('hidden');
                clearTimeout(toastTimer);
                toastTimer = setTimeout(function() { toast.classList.add('hidden'); }, 2800);
            }

            loadSettings();
        })();
    </script>
</body>

</html>
