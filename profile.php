<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="#FFF7ED" />
  <title>My Profile | CampusBite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Nunito+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <script>
    window.tailwind = window.tailwind || {};
    tailwind.config = { theme: { extend: { colors: { cream: '#FFF7ED', ink: '#201A15' }, fontFamily: { display: ['"Bricolage Grotesque"', 'sans-serif'], body: ['"Nunito Sans"', 'sans-serif'] }, boxShadow: { card: '0 16px 38px -18px rgba(124,63,14,.2)' } } } };
  </script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background: #fff7ed; color: #201a15; }
    .bg-ink { background: #201a15; }
    .focus-ring:focus-visible { outline: 2px solid #ea580c; outline-offset: 3px; }
    input, select { transition: border-color .2s ease, box-shadow .2s ease; }
    input:focus, select:focus { border-color: #ea580c; box-shadow: 0 0 0 4px rgba(251,146,60,.16); outline: none; }
  </style>
</head>
<body class="min-h-screen font-body antialiased">
  <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">Skip to profile</a>
  <header class="sticky top-0 z-40 border-b border-orange-100 bg-white/95 backdrop-blur">
    <nav class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8" aria-label="Primary navigation">
      <a href="index.php" class="focus-ring flex shrink-0 items-center gap-2.5 rounded-xl" aria-label="CampusBite home"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-xl" aria-hidden="true">🍔</span><span class="font-display text-xl font-bold text-ink">Campus<span class="text-orange-600">Bite</span></span></a>
      <div class="hidden items-center gap-1 md:flex"><a href="index.php" class="focus-ring rounded-full px-4 py-2 text-sm font-bold text-stone-600 hover:bg-orange-50">Home</a><a href="menu.php" class="focus-ring rounded-full px-4 py-2 text-sm font-bold text-stone-600 hover:bg-orange-50">Menu</a><a href="orders.php" class="focus-ring rounded-full px-4 py-2 text-sm font-bold text-stone-600 hover:bg-orange-50">My Orders</a></div>
      <div class="flex items-center gap-2"><label class="hidden items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2 lg:flex"><span aria-hidden="true">⌕</span><input type="search" placeholder="Search food" aria-label="Search food" class="w-28 bg-transparent text-sm outline-none placeholder:text-stone-400" /></label><a href="cart.php" class="focus-ring rounded-full bg-orange-600 px-3 py-2 text-sm font-extrabold text-white" aria-label="View cart">🛒 <span aria-hidden="true">0</span></a><a href="profile.php" class="focus-ring hidden h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-extrabold text-orange-800 ring-2 ring-orange-500/30 sm:flex" aria-current="page" aria-label="My profile">CS</a><button type="button" class="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 md:hidden" aria-label="Open navigation menu">☰</button></div>
    </nav>
  </header>

  <main id="main-content" class="mx-auto max-w-5xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
    <header class="mb-7"><p class="text-sm font-extrabold uppercase tracking-[.16em] text-orange-600">Account</p><h1 class="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">My Profile</h1><p class="mt-2 text-base text-stone-500">Manage your basic account information.</p></header>
    <section class="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-card" aria-labelledby="profile-card-title">
      <div class="flex flex-col gap-5 border-b border-stone-100 bg-orange-50/70 px-5 py-6 sm:flex-row sm:items-center sm:px-8"><div class="flex h-20 w-20 items-center justify-center rounded-full bg-orange-600 font-display text-2xl font-extrabold text-white ring-8 ring-white">CS</div><div class="flex-1"><h2 id="profile-card-title" class="font-display text-2xl font-extrabold text-ink">Chirag Sapra</h2><p class="mt-1 text-sm text-stone-500">CampusBite student account</p></div><button type="button" class="focus-ring w-fit rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-extrabold text-orange-700 transition hover:border-orange-400 hover:bg-orange-100">Change Photo</button></div>
      <form class="px-5 py-7 sm:px-8 sm:py-8">
        <fieldset><legend class="font-display text-xl font-extrabold text-ink">Basic information</legend><div class="mt-5 grid gap-5 sm:grid-cols-2"><div><label for="full-name" class="mb-2 block text-sm font-extrabold text-ink">Full Name</label><input id="full-name" name="full-name" type="text" value="Chirag Sapra" class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-ink" /></div><div><label for="student-id" class="mb-2 block text-sm font-extrabold text-ink">Student ID</label><input id="student-id" name="student-id" type="text" value="Student ID" readonly disabled class="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-500" /></div><div><label for="college-email" class="mb-2 block text-sm font-extrabold text-ink">College Email</label><input id="college-email" name="college-email" type="email" value="student@example.com" readonly disabled class="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-500" /></div><div><label for="phone" class="mb-2 block text-sm font-extrabold text-ink">Phone Number</label><input id="phone" name="phone" type="tel" value="+91 XXXXX XXXXX" class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-ink" /></div><div><label for="course" class="mb-2 block text-sm font-extrabold text-ink">Course</label><input id="course" name="course" type="text" value="BCA" class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-ink" /></div></div></fieldset>
        <fieldset class="mt-9 border-t border-stone-100 pt-7"><legend class="font-display text-xl font-extrabold text-ink">Preferences</legend><div class="mt-5 grid gap-5 sm:grid-cols-2"><div><label for="pickup" class="mb-2 block text-sm font-extrabold text-ink">Preferred Pickup Location</label><select id="pickup" name="pickup" class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-ink"><option>Main Cafeteria / Food Court</option></select></div><div><span class="mb-2 block text-sm font-extrabold text-ink">Dietary Preference</span><div class="flex flex-wrap gap-3"><label class="focus-ring flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-orange-300"><input type="radio" name="dietary" value="none" checked class="h-4 w-4 accent-orange-600" />No Preference</label><label class="focus-ring flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-orange-300"><input type="radio" name="dietary" value="vegetarian" class="h-4 w-4 accent-orange-600" />Vegetarian</label></div></div></div></fieldset>
        <div class="mt-9 flex flex-col-reverse gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:justify-end"><a href="menu.php" class="focus-ring inline-flex items-center justify-center rounded-xl border border-stone-200 px-5 py-3 text-sm font-extrabold text-stone-700 transition hover:border-orange-300 hover:bg-orange-50">Cancel</a><button type="button" class="focus-ring inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 active:scale-[.98]">Save Changes</button></div>
      </form>
    </section>
  </main>
</body>
</html>
