<?php
require_once __DIR__ . '/admin-common.php';

$message = '';
$messageType = 'success';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['token'] ?? '';
    $userId = filter_var($_POST['user_id'] ?? '', FILTER_VALIDATE_INT);
    $role = $_POST['role'] ?? '';

    if (!is_string($token) || !hash_equals($_SESSION['admin_token'], $token)) {
        http_response_code(403);
        $message = 'Your session expired. Refresh the page and try again.';
        $messageType = 'error';
    } elseif (!$userId || $userId < 1 || !in_array($role, ['student', 'staff'], true)) {
        http_response_code(400);
        $message = 'Choose a valid account and role.';
        $messageType = 'error';
    } else {
        $statement = db()->prepare("UPDATE users SET role = ? WHERE id = ? AND role IN ('student', 'staff')");
        $statement->bind_param('si', $role, $userId);
        $statement->execute();
        $changed = $statement->affected_rows > 0;
        $statement->close();

        $message = $changed ? 'Account role updated.' : 'No change was made. The account may already have that role or may be an administrator.';
        $messageType = $changed ? 'success' : 'error';
    }
}

$accounts = [];
try {
    $result = db()->query("SELECT id, name, email, role, created_at FROM users WHERE role IN ('student', 'staff') ORDER BY name ASC");
    while ($row = $result->fetch_assoc()) {
        $accounts[] = $row;
    }
} catch (Throwable $e) {
    error_log('CampusBite staff access list failed: ' . $e->getMessage());
    $message = 'Accounts could not be loaded. Please try again.';
    $messageType = 'error';
}
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#fff7ed">
    <title>Staff Access | CampusBite Admin</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800&family=Nunito+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body{background:#fff7ed;color:#201a15}.bg-ink{background:#201a15}
        .focus-ring:focus-visible{outline:2px solid #ea580c;outline-offset:3px}
        @media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
    </style>
</head>
<body class="min-h-screen font-['Nunito_Sans'] antialiased">
    <header class="border-b border-orange-100 bg-white">
        <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <a href="admin-dashboard.php" class="focus-ring rounded-lg font-['Bricolage_Grotesque'] text-xl font-extrabold">Campus<span class="text-orange-600">Bite</span><span class="ml-2 text-xs font-bold uppercase tracking-wider text-stone-400">Admin</span></a>
            <a href="../logout.php" class="focus-ring rounded-xl border border-stone-200 px-4 py-2 text-sm font-extrabold text-red-600 hover:bg-red-50">Log out</a>
        </div>
    </header>
    <main class="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <a href="admin-dashboard.php" class="focus-ring text-sm font-extrabold text-orange-700 hover:underline">← Back to dashboard</a>
        <div class="mt-5">
            <p class="text-xs font-extrabold uppercase tracking-[.18em] text-orange-600">Team permissions</p>
            <h1 class="mt-2 font-['Bricolage_Grotesque'] text-3xl font-extrabold sm:text-4xl">Staff access</h1>
            <p class="mt-2 max-w-2xl text-stone-500">Promote an existing student account to Staff, or return it to Student. Administrator accounts cannot be changed here.</p>
        </div>

        <?php if ($message !== ''): ?>
            <p class="mt-6 rounded-xl border px-4 py-3 text-sm font-bold <?= $messageType === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700' ?>" role="status"><?= adminEscape($message) ?></p>
        <?php endif; ?>

        <section class="mt-7 overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm">
            <div class="border-b border-stone-100 px-5 py-4">
                <h2 class="font-['Bricolage_Grotesque'] text-lg font-extrabold">Student and staff accounts</h2>
            </div>
            <?php if (!$accounts): ?>
                <p class="p-6 text-sm text-stone-500">No student or staff accounts found.</p>
            <?php else: ?>
                <div class="divide-y divide-stone-100">
                    <?php foreach ($accounts as $account): ?>
                        <div class="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                            <div class="min-w-0">
                                <p class="font-extrabold text-stone-900"><?= adminEscape($account['name']) ?></p>
                                <p class="mt-0.5 break-all text-sm text-stone-500"><?= adminEscape($account['email']) ?></p>
                            </div>
                            <form method="post" action="admin-staff.php" class="flex items-center gap-2">
                                <input type="hidden" name="token" value="<?= adminEscape($_SESSION['admin_token']) ?>">
                                <input type="hidden" name="user_id" value="<?= (int) $account['id'] ?>">
                                <label class="sr-only" for="role-<?= (int) $account['id'] ?>">Role for <?= adminEscape($account['name']) ?></label>
                                <select id="role-<?= (int) $account['id'] ?>" name="role" class="focus-ring rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm font-bold">
                                    <option value="student" <?= $account['role'] === 'student' ? 'selected' : '' ?>>Student</option>
                                    <option value="staff" <?= $account['role'] === 'staff' ? 'selected' : '' ?>>Staff</option>
                                </select>
                                <button type="submit" class="focus-ring rounded-lg bg-orange-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-orange-700">Save</button>
                            </form>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        </section>
        <p class="mt-4 text-xs leading-relaxed text-stone-400">Staff accounts can access only the kitchen order queue. They cannot access admin pages, menu management, student records, or cafeteria settings.</p>
    </main>
</body>
</html>
