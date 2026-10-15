<?php
session_start();
require_once __DIR__ . '/db.php';

if (empty($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

function escapeOutput($value)
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

$userId = (int) $_SESSION['user_id'];
$profile = [
    'name' => '',
    'email' => '',
    'student_id' => '',
    'phone' => '',
    'course' => '',
    'pickup_location' => 'Main Cafeteria',
    'dietary_preference' => 'No Preference',
];
$profileError = '';
$profileSuccess = '';

if (empty($_SESSION['profile_token'])) {
    $_SESSION['profile_token'] = bin2hex(random_bytes(16));
}

if (!empty($_SESSION['profile_message'])) {
    $profileSuccess = $_SESSION['profile_message'];
    unset($_SESSION['profile_message']);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $postedToken = $_POST['profileToken'] ?? '';
    $name = $_POST['name'] ?? '';
    $studentId = $_POST['student_id'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $course = $_POST['course'] ?? '';
    $pickupLocation = $_POST['pickup_location'] ?? '';
    $dietaryPreference = $_POST['dietary_preference'] ?? '';

    $formValues = [$postedToken, $name, $studentId, $phone, $course, $pickupLocation, $dietaryPreference];
    foreach ($formValues as $value) {
        if (!is_string($value)) {
            $profileError = 'Please check the profile form and try again.';
            break;
        }
    }

    if ($profileError === '') {
        $name = trim($name);
        $studentId = trim($studentId);
        $phone = trim($phone);
        $course = trim($course);

        if (!hash_equals($_SESSION['profile_token'], $postedToken)) {
            $profileError = 'This form has expired. Please reload the page and try again.';
        } elseif (strlen($name) < 2 || strlen($name) > 100) {
            $profileError = 'Name must be between 2 and 100 characters.';
        } elseif (strlen($studentId) > 50) {
            $profileError = 'Student ID must be 50 characters or fewer.';
        } elseif (strlen($phone) > 20 || ($phone !== '' && !preg_match('/^[0-9+() .-]{7,20}$/', $phone))) {
            $profileError = 'Enter a valid phone number.';
        } elseif (strlen($course) > 100) {
            $profileError = 'Course must be 100 characters or fewer.';
        } elseif (!in_array($pickupLocation, ['Main Cafeteria', 'Food Court'], true)) {
            $profileError = 'Choose a valid pickup location.';
        } elseif (!in_array($dietaryPreference, ['No Preference', 'Vegetarian'], true)) {
            $profileError = 'Choose a valid dietary preference.';
        }

        if ($profileError === '') {
            $connection = null;
            $transactionStarted = false;
            try {
                $connection = db();
                $connection->begin_transaction();
                $transactionStarted = true;

                $userUpdate = $connection->prepare('UPDATE users SET name = ? WHERE id = ?');
                $userUpdate->bind_param('si', $name, $userId);
                $userUpdate->execute();
                $userUpdate->close();

                $profileCheck = $connection->prepare('SELECT id FROM profiles WHERE user_id = ? LIMIT 1');
                $profileCheck->bind_param('i', $userId);
                $profileCheck->execute();
                $existingProfile = $profileCheck->get_result()->fetch_assoc();
                $profileCheck->close();

                if ($existingProfile) {
                    $profileSave = $connection->prepare(
                        'UPDATE profiles SET student_id = ?, phone = ?, course = ?, pickup_location = ?, dietary_preference = ? WHERE user_id = ?'
                    );
                    $profileSave->bind_param('sssssi', $studentId, $phone, $course, $pickupLocation, $dietaryPreference, $userId);
                } else {
                    $profileSave = $connection->prepare(
                        'INSERT INTO profiles (user_id, student_id, phone, course, pickup_location, dietary_preference) VALUES (?, ?, ?, ?, ?, ?)'
                    );
                    $profileSave->bind_param('isssss', $userId, $studentId, $phone, $course, $pickupLocation, $dietaryPreference);
                }
                $profileSave->execute();
                $profileSave->close();

                $connection->commit();
                $transactionStarted = false;
                $_SESSION['user_name'] = $name;
                $_SESSION['profile_message'] = 'Your profile has been saved.';
                header('Location: profile.php');
                exit;
            } catch (Exception $e) {
                if ($transactionStarted && $connection !== null) {
                    try {
                        $connection->rollback();
                    } catch (Exception $rollbackError) {
                        error_log('CampusBite profile rollback failed: ' . $rollbackError->getMessage());
                    }
                }
                error_log('CampusBite profile save failed: ' . $e->getMessage());
                $profileError = 'We could not save your profile. Please try again.';
            }
        }
    }

    $profile['name'] = isset($name) && is_string($name) ? $name : '';
    $profile['student_id'] = isset($studentId) && is_string($studentId) ? $studentId : '';
    $profile['phone'] = isset($phone) && is_string($phone) ? $phone : '';
    $profile['course'] = isset($course) && is_string($course) ? $course : '';
    $profile['pickup_location'] = isset($pickupLocation) && is_string($pickupLocation) ? $pickupLocation : 'Main Cafeteria';
    $profile['dietary_preference'] = isset($dietaryPreference) && is_string($dietaryPreference) ? $dietaryPreference : 'No Preference';
}

try {
    $statement = db()->prepare(
        'SELECT users.name, users.email, profiles.student_id, profiles.phone, profiles.course, profiles.pickup_location, profiles.dietary_preference FROM users LEFT JOIN profiles ON profiles.user_id = users.id WHERE users.id = ? LIMIT 1'
    );
    $statement->bind_param('i', $userId);
    $statement->execute();
    $savedProfile = $statement->get_result()->fetch_assoc();
    $statement->close();

    if ($savedProfile) {
        $profile['email'] = $savedProfile['email'];
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' || $profileError === '') {
            $profile['name'] = $savedProfile['name'];
            $profile['student_id'] = $savedProfile['student_id'] ?? '';
            $profile['phone'] = $savedProfile['phone'] ?? '';
            $profile['course'] = $savedProfile['course'] ?? '';
            $profile['pickup_location'] = $savedProfile['pickup_location'] ?: 'Main Cafeteria';
            $profile['dietary_preference'] = $savedProfile['dietary_preference'] ?: 'No Preference';
        }
    } else {
        $profileError = 'We could not load your account profile.';
    }
} catch (Exception $e) {
    error_log('CampusBite profile load failed: ' . $e->getMessage());
    $profileError = 'We could not load your profile right now. Please try again later.';
}

$initials = 'CB';
if ($profile['name'] !== '') {
    $nameParts = explode(' ', trim($profile['name']));
    $initials = strtoupper(substr($nameParts[0], 0, 1));
    if (count($nameParts) > 1) {
        $initials .= strtoupper(substr($nameParts[count($nameParts) - 1], 0, 1));
    }
}
?>
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
    main { animation: pageEnter 300ms ease-out; }
    @keyframes pageEnter { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
  </style>
</head>
<body class="min-h-screen font-body antialiased">
  <a href="#main-content" class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-white">Skip to profile</a>
  <header class="sticky top-0 z-40 border-b border-orange-100 bg-white/95 backdrop-blur">
    <nav class="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8" aria-label="Primary navigation">
      <a href="index.php" class="focus-ring flex shrink-0 items-center gap-2.5 rounded-xl" aria-label="CampusBite home"><span class="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-xl" aria-hidden="true">🍔</span><span class="font-display text-xl font-bold text-ink">Campus<span class="text-orange-600">Bite</span></span></a>
      <div class="hidden items-center gap-1 md:flex"><a href="index.php" class="focus-ring rounded-full px-4 py-2 text-sm font-bold text-stone-600 hover:bg-orange-50">Home</a><a href="menu.php" class="focus-ring rounded-full px-4 py-2 text-sm font-bold text-stone-600 hover:bg-orange-50">Menu</a><a href="orders.php" class="focus-ring rounded-full px-4 py-2 text-sm font-bold text-stone-600 hover:bg-orange-50">My Orders</a></div>
      <div class="flex items-center gap-2"><a href="cart.php" class="focus-ring rounded-full bg-orange-600 px-3 py-2 text-sm font-extrabold text-white" aria-label="View cart">🛒 <span aria-hidden="true">0</span></a><a href="profile.php" class="focus-ring flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 font-extrabold text-orange-800 ring-2 ring-orange-500/30" aria-current="page" aria-label="My profile"><?= escapeOutput($initials) ?></a><button type="button" class="focus-ring flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 md:hidden" aria-label="Open navigation menu">☰</button></div>
    </nav>
  </header>

  <main id="main-content" class="mx-auto max-w-5xl px-4 py-9 sm:px-6 sm:py-12 lg:px-8">
    <header class="mb-7"><p class="text-sm font-extrabold uppercase tracking-[.16em] text-orange-600">Account</p><h1 class="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">My Profile</h1><p class="mt-2 text-base text-stone-500">Manage your basic account information.</p></header>
    <section class="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-card" aria-labelledby="profile-card-title">
      <div class="flex flex-col gap-5 border-b border-stone-100 bg-orange-50/70 px-5 py-6 sm:flex-row sm:items-center sm:px-8"><div class="flex h-20 w-20 items-center justify-center rounded-full bg-orange-600 font-display text-2xl font-extrabold text-white ring-8 ring-white"><?= escapeOutput($initials) ?></div><div class="flex-1"><h2 id="profile-card-title" class="font-display text-2xl font-extrabold text-ink"><?= escapeOutput($profile['name']) ?></h2><p class="mt-1 text-sm text-stone-500">CampusBite student account</p></div></div>
      <form method="post" action="profile.php" class="px-5 py-7 sm:px-8 sm:py-8">
        <input type="hidden" name="profileToken" value="<?= escapeOutput($_SESSION['profile_token']) ?>" />
        <?php if ($profileSuccess !== ''): ?><p class="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-bold text-green-800" role="status"><?= escapeOutput($profileSuccess) ?></p><?php endif; ?>
        <?php if ($profileError !== ''): ?><p class="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700" role="alert"><?= escapeOutput($profileError) ?></p><?php endif; ?>
        <fieldset><legend class="font-display text-xl font-extrabold text-ink">Basic information</legend><div class="mt-5 grid gap-5 sm:grid-cols-2">
          <div><label for="full-name" class="mb-2 block text-sm font-extrabold text-ink">Full Name</label><input id="full-name" name="name" type="text" maxlength="100" required value="<?= escapeOutput($profile['name']) ?>" class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-ink" /></div>
          <div><label for="student-id" class="mb-2 block text-sm font-extrabold text-ink">Student ID</label><input id="student-id" name="student_id" type="text" maxlength="50" value="<?= escapeOutput($profile['student_id']) ?>" class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-ink" /></div>
          <div><label for="college-email" class="mb-2 block text-sm font-extrabold text-ink">College Email</label><input id="college-email" type="email" value="<?= escapeOutput($profile['email']) ?>" readonly class="w-full cursor-not-allowed rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-500" /></div>
          <div><label for="phone" class="mb-2 block text-sm font-extrabold text-ink">Phone Number</label><input id="phone" name="phone" type="tel" maxlength="20" value="<?= escapeOutput($profile['phone']) ?>" class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-ink" /></div>
          <div><label for="course" class="mb-2 block text-sm font-extrabold text-ink">Course</label><input id="course" name="course" type="text" maxlength="100" value="<?= escapeOutput($profile['course']) ?>" class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-ink" /></div>
        </div></fieldset>
        <fieldset class="mt-9 border-t border-stone-100 pt-7"><legend class="font-display text-xl font-extrabold text-ink">Preferences</legend><div class="mt-5 grid gap-5 sm:grid-cols-2">
          <div><label for="pickup" class="mb-2 block text-sm font-extrabold text-ink">Preferred Pickup Location</label><select id="pickup" name="pickup_location" class="focus-ring w-full rounded-xl border border-stone-200 bg-white px-4 py-3 text-ink"><option value="Main Cafeteria" <?= $profile['pickup_location'] === 'Main Cafeteria' ? 'selected' : '' ?>>Main Cafeteria</option><option value="Food Court" <?= $profile['pickup_location'] === 'Food Court' ? 'selected' : '' ?>>Food Court</option></select></div>
          <div><span class="mb-2 block text-sm font-extrabold text-ink">Dietary Preference</span><div class="flex flex-wrap gap-3"><label class="focus-ring flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-orange-300"><input type="radio" name="dietary_preference" value="No Preference" <?= $profile['dietary_preference'] === 'No Preference' ? 'checked' : '' ?> class="h-4 w-4 accent-orange-600" />No Preference</label><label class="focus-ring flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 px-4 py-3 text-sm font-bold text-stone-700 transition hover:border-orange-300"><input type="radio" name="dietary_preference" value="Vegetarian" <?= $profile['dietary_preference'] === 'Vegetarian' ? 'checked' : '' ?> class="h-4 w-4 accent-orange-600" />Vegetarian</label></div></div>
        </div></fieldset>
        <div class="mt-9 flex flex-col-reverse gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:justify-end"><a href="menu.php" class="focus-ring inline-flex items-center justify-center rounded-xl border border-stone-200 px-5 py-3 text-sm font-extrabold text-stone-700 transition hover:border-orange-300 hover:bg-orange-50">Cancel</a><button type="submit" class="focus-ring inline-flex items-center justify-center rounded-xl bg-orange-600 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-600/20 transition hover:bg-orange-700 active:scale-[.98]">Save Changes</button></div>
      </form>
    </section>
  </main>
</body>
</html>
