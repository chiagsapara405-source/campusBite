<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="#fff7ed">
    <title>Order Details | CampusBite</title>
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

        /* Cancel modal */
        #cancel-modal { opacity: 0; transition: opacity 200ms ease-out }
        #cancel-modal:not(.hidden) { opacity: 1 }
        #cancel-modal:not(.hidden) > div { transform: scale(1); opacity: 1 }
        #cancel-modal > div { transform: scale(0.98); opacity: 0; transition: transform 200ms ease-out, opacity 200ms ease-out }

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
                    class="focus-ring rounded-full px-4 py-2 text-sm font-bold text-stone-600 hover:bg-orange-50">Menu</a><a
                    href="orders.php"
                    class="focus-ring rounded-full bg-orange-100 px-4 py-2 text-sm font-extrabold text-orange-800">My
                    Orders</a></div>
            <div class="ml-auto flex items-center gap-1 sm:gap-2"><a href="cart.php"
                    class="focus-ring relative flex h-10 items-center gap-1.5 rounded-full bg-orange-600 px-3 text-sm font-extrabold text-white"
                    aria-label="View cart">🛒 <span id="cart-count">0</span></a><button type="button" data-future
                    class="focus-ring hidden h-10 w-10 rounded-full bg-orange-100 font-bold text-orange-800 sm:block"
                    aria-label="Student profile">S</button><button id="menu-toggle" type="button"
                    class="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 md:hidden"
                    aria-expanded="false" aria-controls="mobile-nav" aria-label="Open menu">☰</button></div>
        </nav>
        <div id="mobile-nav" class="hidden border-t border-stone-100 bg-white px-4 py-3 md:hidden"><a href="index.php"
                class="block rounded-xl px-4 py-3 font-bold hover:bg-orange-50">Home</a><a href="menu.php"
                class="block rounded-xl px-4 py-3 font-bold hover:bg-orange-50">Menu</a><a href="orders.php"
                class="block rounded-xl bg-orange-100 px-4 py-3 font-extrabold text-orange-800">My
                Orders</a><button type="button" data-future
                class="block w-full rounded-xl px-4 py-3 text-left font-bold hover:bg-orange-50">Profile</button></div>
    </header>
    <main id="main-content" class="mx-auto max-w-3xl px-4 py-8 pb-28 sm:px-6 lg:px-8">
        <div id="order-content"></div>
    </main>
    <div id="cancel-modal" class="hidden fixed inset-0 z-50 items-center justify-center bg-ink/70 p-4" role="dialog"
        aria-modal="true" aria-labelledby="cancel-modal-title">
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="cancel-modal-title" class="font-display text-xl font-extrabold text-ink">Cancel this order?</h2>
            <p class="mt-2 text-sm text-stone-500">You won't be able to undo this action.</p>
            <div class="mt-5 flex gap-3">
                <button id="cancel-keep"
                    class="focus-ring flex-1 rounded-xl border border-stone-200 px-4 py-3 text-sm font-bold text-stone-600 hover:bg-orange-50">
                    Keep Order
                </button>
                <button id="cancel-confirm"
                    class="focus-ring flex-1 rounded-xl bg-red-600 px-4 py-3 text-sm font-extrabold text-white hover:bg-red-700">
                    Cancel Order
                </button>
            </div>
        </div>
    </div>
    <div id="toast"
        class="pointer-events-none fixed bottom-5 left-1/2 z-[60] hidden -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl"
        role="status" aria-live="polite"></div>
    <script src="js/order-details.js"></script>
</body>

</html>
