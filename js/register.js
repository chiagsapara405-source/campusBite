/** CampusBite registration prototype. No account details are stored or sent. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const fields = ['name', 'email', 'password'];
  const terms = document.getElementById('terms');
  const submit = document.getElementById('submit-button');
  const status = document.getElementById('form-status');
  const setError = (id, message) => { const field = document.getElementById(id); const error = document.getElementById(`${id}-error`); if (field) field.setAttribute('aria-invalid', 'true'); error.textContent = message; error.classList.remove('hidden'); };
  const clearError = (id) => { const field = document.getElementById(id); const error = document.getElementById(`${id}-error`); if (field) field.removeAttribute('aria-invalid'); error.textContent = ''; error.classList.add('hidden'); };
  const validate = () => {
    const name = document.getElementById('name'); const email = document.getElementById('email'); const password = document.getElementById('password');
    const checks = [
      ['name', name.value.trim().length >= 2, 'Please enter your full name.'],
      ['email', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()), 'Please enter a valid college email address.'],
      ['password', password.value.length >= 6, 'Password must be at least 6 characters.'],
      ['terms', terms.checked, 'Please confirm this prototype notice.']
    ];
    checks.forEach(([id, valid, message]) => valid ? clearError(id) : setError(id, message));
    return checks.every(([, valid]) => valid);
  };
  fields.forEach((id) => document.getElementById(id).addEventListener('input', () => { if (document.getElementById(id).getAttribute('aria-invalid') === 'true') validate(); }));
  terms.addEventListener('change', () => { if (document.getElementById('terms-error').textContent) validate(); });
  document.getElementById('password-toggle').addEventListener('click', () => { const password = document.getElementById('password'); const hidden = password.type === 'password'; password.type = hidden ? 'text' : 'password'; const button = document.getElementById('password-toggle'); button.textContent = hidden ? 'Hide' : 'Show'; button.setAttribute('aria-label', hidden ? 'Hide password' : 'Show password'); });
  form.addEventListener('submit', (event) => { event.preventDefault(); if (!validate()) { const firstInvalid = form.querySelector('[aria-invalid="true"]'); if (firstInvalid) firstInvalid.focus(); return; } submit.disabled = true; submit.textContent = 'Creating account...'; status.textContent = 'Account created for this prototype. Opening today\'s menu…'; status.className = 'rounded-xl bg-green-50 px-3.5 py-3 text-sm font-bold text-green-800'; window.setTimeout(() => { window.location.href = 'menu.php'; }, 850); });
});
