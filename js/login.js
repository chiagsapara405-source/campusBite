/** CampusBite login prototype. No credentials are saved or sent. */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const passwordToggle = document.getElementById('password-toggle');
  const forgotPassword = document.getElementById('forgot-password');
  const forgotMessage = document.getElementById('forgot-message');
  const submitButton = document.getElementById('submit-button');
  const formStatus = document.getElementById('form-status');

  const setError = (field, message) => {
    const error = document.getElementById(`${field.id}-error`);
    field.setAttribute('aria-invalid', 'true');
    error.textContent = message;
    error.classList.remove('hidden');
    error.classList.add('flex');
  };

  const clearError = (field) => {
    const error = document.getElementById(`${field.id}-error`);
    field.removeAttribute('aria-invalid');
    error.textContent = '';
    error.classList.add('hidden');
    error.classList.remove('flex');
  };

  const validateEmail = () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
    if (!isValid) setError(email, 'Please enter a valid college email address.');
    else clearError(email);
    return isValid;
  };

  const validatePassword = () => {
    const isValid = password.value.length >= 6;
    if (!isValid) setError(password, 'Password must be at least 6 characters.');
    else clearError(password);
    return isValid;
  };

  email.addEventListener('input', () => { if (email.getAttribute('aria-invalid') === 'true') validateEmail(); });
  password.addEventListener('input', () => { if (password.getAttribute('aria-invalid') === 'true') validatePassword(); });

  passwordToggle.addEventListener('click', () => {
    const isHidden = password.type === 'password';
    password.type = isHidden ? 'text' : 'password';
    passwordToggle.textContent = isHidden ? 'Hide' : 'Show';
    passwordToggle.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });

  forgotPassword.addEventListener('click', () => {
    forgotMessage.classList.toggle('hidden');
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailIsValid = validateEmail();
    const passwordIsValid = validatePassword();
    if (!emailIsValid || !passwordIsValid) {
      (emailIsValid ? password : email).focus();
      return;
    }

    const isAdmin = email.value.trim().toLowerCase().includes('admin');

    submitButton.disabled = true;
    submitButton.textContent = 'Signing in...';

    if (isAdmin) {
      formStatus.textContent = 'Signed in as admin. Redirecting to dashboard…';
      formStatus.className = 'rounded-xl bg-green-50 px-3.5 py-3 text-sm font-bold text-green-800';
      localStorage.setItem('campusbite_role', 'admin');
      window.setTimeout(() => { window.location.href = 'admin/admin-dashboard.html'; }, 850);
    } else {
      formStatus.textContent = 'Signed in successfully. Taking you to today\'s menu…';
      formStatus.className = 'rounded-xl bg-green-50 px-3.5 py-3 text-sm font-bold text-green-800';
      localStorage.setItem('campusbite_role', 'student');
      window.setTimeout(() => { window.location.href = 'menu.html'; }, 850);
    }
  });
});
