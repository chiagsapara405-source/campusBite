<?php
require_once __DIR__ . '/db.php';

$errors = [];
$old    = ['name' => trim($_POST['name'] ?? ''), 'email' => strtolower(trim($_POST['email'] ?? ''))];
$terms  = isset($_POST['terms']);
$notice = isset($_GET['registered']) ? 'Account created successfully. Please sign in.' : null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $password = (string) ($_POST['password'] ?? '');

    if (mb_strlen($old['name']) < 2)                       { $errors['name'] = 'Please enter your full name.'; }
    if (!filter_var($old['email'], FILTER_VALIDATE_EMAIL)) { $errors['email'] = 'Please enter a valid college email address.'; }
    if (strlen($password) < 6)                             { $errors['password'] = 'Password must be at least 6 characters.'; }
    if (!$terms)                                           { $errors['terms'] = 'Please confirm account creation.'; }

    if (!$errors) {
        $email = $old['email'];
        $stmt  = db()->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->bind_param('s', $email);
        $stmt->execute();
        if ($stmt->get_result()->fetch_assoc()) {
            $errors['email'] = 'An account with this email already exists. Please sign in instead.';
        }
    }

    if (!$errors) {
        $name  = $old['name'];
        $email = $old['email'];
        $hash  = password_hash($password, PASSWORD_DEFAULT);
        try {
            $stmt = db()->prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'student')");
            $stmt->bind_param('sss', $name, $email, $hash);
            $stmt->execute();
        } catch (mysqli_sql_exception $e) {
            if ((int) $e->getCode() === 1062) {
                $errors['email'] = 'An account with this email already exists. Please sign in instead.';
            } else {
                throw $e;
            }
        }
    }

    if (!$errors) {
        header('Location: login.php?registered=1');
        exit;
    }
}
?><!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="Create a CampusBite student account to order cafeteria food for quick pickup." />
  <meta name="theme-color" content="#FFF7ED" />
  <title>Create account | CampusBite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Nunito+Sans:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <script>window.tailwind=window.tailwind||{};tailwind.config={theme:{extend:{colors:{cream:'#FFF7ED',ink:'#201A15'},fontFamily:{display:['"Bricolage Grotesque"','ui-sans-serif','sans-serif'],body:['"Nunito Sans"','ui-sans-serif','sans-serif']},boxShadow:{card:'0 20px 55px -24px rgba(91,48,12,.26)',float:'0 22px 42px -20px rgba(124,63,14,.38)'}}}};</script>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body{background:#FFF7ED;color:#201A15}.bg-ink{background:#201A15}.dot-grid{background-image:radial-gradient(rgba(255,255,255,.3) 1.3px,transparent 1.3px);background-size:18px 18px}.field:focus{border-color:#EA580C;box-shadow:0 0 0 4px rgba(251,146,60,.18);outline:0}.field[aria-invalid="true"]{border-color:#DC2626;background:#FFF7F7}.field[aria-invalid="true"]:focus{box-shadow:0 0 0 4px rgba(220,38,38,.12)}.reveal{opacity:0;transform:translateY(16px);animation:enter .58s cubic-bezier(.2,.8,.2,1) forwards}.r1{animation-delay:.05s}.r2{animation-delay:.16s}.r3{animation-delay:.27s}@keyframes enter{to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}.reveal{opacity:1;transform:none}}
  </style>
</head>
<body class="min-h-screen font-body antialiased">
  <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-5 focus:py-3 focus:text-sm focus:font-bold focus:text-white">Skip to registration form</a>
  <header class="reveal r1 mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
    <a href="index.php" class="flex items-center gap-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2" aria-label="CampusBite home"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 shadow-sm"><svg class="h-7 w-7" viewBox="0 0 40 40" fill="#FFF7ED" aria-hidden="true"><path d="M8 17.5c0-4.7 5.4-7.5 12-7.5s12 2.8 12 7.5v1.2H8z"/><circle cx="14" cy="13.6" r="1.2" fill="#EA580C"/><circle cx="20" cy="12.2" r="1.2" fill="#EA580C"/><rect x="8" y="21" width="24" height="2.6" rx="1.3" opacity=".7"/><rect x="8" y="25.2" width="24" height="2.6" rx="1.3"/><path d="M8 29.6h24v.9c0 2.6-5.4 4.5-12 4.5S8 33.1 8 30.5z"/></svg></span><span class="font-display text-xl font-bold text-ink">Campus<span class="text-orange-600">Bite</span></span></a>
    <a href="index.php" class="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-stone-600 transition hover:bg-orange-50 hover:text-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2"><svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>Back to Home</a>
  </header>
  <main id="main-content" class="mx-auto flex w-full max-w-7xl items-center px-4 pb-8 sm:px-6 lg:min-h-[calc(100vh-84px)] lg:px-8 lg:pb-14">
    <div class="grid w-full overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-card lg:grid-cols-[.98fr_1.02fr]">
      <section class="reveal r2 relative isolate overflow-hidden bg-ink px-6 py-9 text-white sm:px-10 sm:py-12 lg:min-h-[655px] lg:px-12 lg:py-14" aria-labelledby="join-title">
        <div class="dot-grid absolute inset-0 -z-10 opacity-25" aria-hidden="true"></div><div class="absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-orange-500/90" aria-hidden="true"></div><div class="absolute -bottom-28 -right-20 -z-10 h-72 w-72 rounded-full border-[28px] border-orange-300/25" aria-hidden="true"></div>
        <div class="max-w-md"><span class="inline-flex items-center gap-2 rounded-full border border-orange-300/40 bg-white/10 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[.16em] text-orange-100"><span class="h-2 w-2 rounded-full bg-green-400"></span>Fast campus pickup</span><h1 id="join-title" class="mt-7 font-display text-4xl font-extrabold leading-[1.04] tracking-tight sm:text-5xl">Your food break,<br /><span class="text-orange-300">made easier.</span></h1><p class="mt-5 max-w-sm text-base leading-relaxed text-orange-50/85 sm:text-lg">Create your CampusBite account to place cafeteria orders ahead of the queue.</p></div>
        <div class="relative mt-10 max-w-md rounded-[1.7rem] border border-white/15 bg-white/10 p-5 shadow-float backdrop-blur-sm"><div class="flex items-center gap-4"><div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-400 text-3xl" aria-hidden="true">🍱</div><div><p class="font-display text-lg font-bold">Lunch is looking good</p><p class="mt-1 text-sm text-orange-100/80">Order early. Pick up fresh.</p></div></div><div class="mt-5 grid grid-cols-3 gap-2"><span class="rounded-xl bg-white/10 px-2 py-3 text-center text-xs font-bold text-orange-100">No queues</span><span class="rounded-xl bg-white/10 px-2 py-3 text-center text-xs font-bold text-orange-100">Easy pickup</span><span class="rounded-xl bg-white/10 px-2 py-3 text-center text-xs font-bold text-orange-100">Campus food</span></div></div>
        <p class="mt-10 max-w-sm text-sm font-semibold leading-relaxed text-orange-100/80">Your account is stored securely: passwords are encrypted and never saved in plain text.</p>
      </section>
      <section class="reveal r3 flex items-center bg-white px-6 py-10 sm:px-10 sm:py-12 lg:px-12" aria-labelledby="register-title"><div class="w-full max-w-md"><p class="text-sm font-extrabold uppercase tracking-[.16em] text-orange-600">Student registration</p><h2 id="register-title" class="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink">Create your account</h2><p class="mt-3 leading-relaxed text-stone-500">Start ordering your favorite campus meals with less waiting.</p>
                <form id="register-form" class="mt-7 space-y-4" method="post" action="register.php" novalidate><?php if ($notice !== null): ?><p class="mb-1 rounded-xl bg-green-50 text-green-800 px-3.5 py-3 text-sm font-bold" role="status"><?php echo htmlspecialchars($notice, ENT_QUOTES, 'UTF-8'); ?></p><?php endif; ?>
          <div><label for="name" class="mb-2 block text-sm font-extrabold text-ink">Full name</label><input id="name" name="name" type="text" autocomplete="name" placeholder="Your name" value="<?php echo htmlspecialchars($old['name'], ENT_QUOTES, 'UTF-8'); ?>" aria-describedby="name-error"<?php if (isset($errors['name'])) echo ' aria-invalid="true"'; ?> class="field block w-full rounded-xl border border-stone-200 px-4 py-3 text-base text-ink placeholder:text-stone-400 transition"/><p id="name-error" class="<?php echo isset($errors['name']) ? '' : 'hidden'; ?> mt-2 text-sm font-bold text-red-600" role="alert"><?php echo htmlspecialchars($errors['name'] ?? '', ENT_QUOTES, 'UTF-8'); ?></p></div>
          <div><label for="email" class="mb-2 block text-sm font-extrabold text-ink">Student email</label><input id="email" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@college.edu" value="<?php echo htmlspecialchars($old['email'], ENT_QUOTES, 'UTF-8'); ?>" aria-describedby="email-error"<?php if (isset($errors['email'])) echo ' aria-invalid="true"'; ?> class="field block w-full rounded-xl border border-stone-200 px-4 py-3 text-base text-ink placeholder:text-stone-400 transition"/><p id="email-error" class="<?php echo isset($errors['email']) ? '' : 'hidden'; ?> mt-2 text-sm font-bold text-red-600" role="alert"><?php echo htmlspecialchars($errors['email'] ?? '', ENT_QUOTES, 'UTF-8'); ?></p></div>
          <div><label for="password" class="mb-2 block text-sm font-extrabold text-ink">Create password</label><input id="password" name="password" type="password" autocomplete="new-password" placeholder="At least 6 characters" aria-describedby="password-error"<?php if (isset($errors['password'])) echo ' aria-invalid="true"'; ?> class="field block w-full rounded-xl border border-stone-200 px-4 py-3 text-base text-ink placeholder:text-stone-400 transition"/><p id="password-error" class="<?php echo isset($errors['password']) ? '' : 'hidden'; ?> mt-2 text-sm font-bold text-red-600" role="alert"><?php echo htmlspecialchars($errors['password'] ?? '', ENT_QUOTES, 'UTF-8'); ?></p></div>
          <label class="flex cursor-pointer items-start gap-2.5 text-sm font-semibold leading-relaxed text-stone-600"><input id="terms" name="terms" type="checkbox" value="1"<?php if ($terms) echo ' checked'; ?> class="mt-0.5 h-4 w-4 rounded border-stone-300 text-orange-600 focus:ring-orange-500"/><span>I agree to create a CampusBite account with these details.</span></label><p id="terms-error" class="<?php echo isset($errors['terms']) ? '' : 'hidden'; ?> text-sm font-bold text-red-600" role="alert"><?php echo htmlspecialchars($errors['terms'] ?? '', ENT_QUOTES, 'UTF-8'); ?></p>
          <button id="submit-button" type="submit" class="flex w-full items-center justify-center rounded-xl bg-orange-600 px-5 py-3.5 text-base font-extrabold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 active:scale-[.98] disabled:cursor-not-allowed disabled:bg-orange-300 disabled:shadow-none focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2">Create Account</button>
        </form><p class="mt-6 text-center text-sm font-semibold text-stone-500">Already have an account? <a href="login.php" class="font-extrabold text-orange-700 underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-orange-600 focus:ring-offset-2">Sign in</a></p>
      </div></section>
    </div>
  </main>
</body>
</html>
