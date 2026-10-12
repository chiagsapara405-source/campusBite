// ─── Constants ───────────────────────────────────────────────────────────────

const CART_KEY   = 'campusbite-cart-v1';
const LATEST_KEY = 'campusbite_latest_order';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const $     = id => document.getElementById(id);
const money = n  => `₹${n}`;

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  bindEvents();
  const order = loadLatestOrder();
  if (order) {
    renderOrderDetails(order);
  } else {
    handleMissingOrder();
  }
});

// ─── Event Binding ───────────────────────────────────────────────────────────

function bindEvents() {
  $('menu-toggle').onclick = () => {
    const open = $('mobile-nav').classList.toggle('hidden');
    $('menu-toggle').setAttribute('aria-expanded', String(!open));
  };

  bindFutureLinks();
}

function bindFutureLinks() {
  document.querySelectorAll('[data-future]').forEach(x => {
    if (x.dataset.bound) return;
    x.dataset.bound = 'true';
    x.addEventListener('click', e => {
      e.preventDefault();
      showToast('This feature is coming soon.');
    });
  });
}

// ─── Cart Count ──────────────────────────────────────────────────────────────

function updateCartCount() {
  let cart = [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch {
    cart = [];
  }
  const n = cart.reduce((sum, x) => sum + (x.quantity || 0), 0);
  $('cart-count').textContent = n;
}

// ─── Load Order ──────────────────────────────────────────────────────────────

function loadLatestOrder() {
  try {
    const raw = localStorage.getItem(LATEST_KEY);
    if (!raw) return null;
    const order = JSON.parse(raw);
    if (!order || !order.orderId || !order.items) return null;
    return order;
  } catch {
    return null;
  }
}

// ─── Render ──────────────────────────────────────────────────────────────────

function renderOrderDetails(order) {
  const statusSteps = [
    { label: 'Order Placed',       active: true  },
    { label: 'Preparing',          active: false },
    { label: 'Ready for Pickup',   active: false },
    { label: 'Completed',          active: false },
  ];

  $('confirmation-content').innerHTML = `
    <div class="text-center">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
        <span class="text-4xl" aria-hidden="true">✓</span>
      </div>
      <h1 class="mt-5 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Order Placed!</h1>
      <p class="mt-2 text-base text-stone-500 sm:text-lg">Your order has been received by the cafeteria.</p>
      <p class="mt-3 font-display text-2xl font-extrabold text-orange-600">Order #${escapeHtml(order.orderId)}</p>
      <span class="mt-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-800">${escapeHtml(order.status)}</span>
    </div>

    <section class="mt-8 rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6" aria-label="Order status">
      <h2 class="font-display text-lg font-extrabold text-ink">Order Status</h2>
      ${renderOrderStatus(statusSteps)}
    </section>

    <section class="mt-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6" aria-label="Order items">
      <h2 class="font-display text-lg font-extrabold text-ink">Your Order</h2>
      ${renderOrderItems(order)}
    </section>

    <div class="mt-5 grid gap-5 sm:grid-cols-2">
      <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6" aria-label="Pickup information">
        <h2 class="font-display text-lg font-extrabold text-ink">Pickup Info</h2>
        <dl class="mt-3 space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-stone-500">Location</dt>
            <dd class="font-bold text-ink">${escapeHtml(order.pickup?.location || '—')}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-stone-500">Time</dt>
            <dd class="font-bold text-ink">${escapeHtml(order.pickup?.time || '—')}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6" aria-label="Student information">
        <h2 class="font-display text-lg font-extrabold text-ink">Student Info</h2>
        <dl class="mt-3 space-y-2 text-sm">
          <div class="flex justify-between">
            <dt class="text-stone-500">Name</dt>
            <dd class="font-bold text-ink">${escapeHtml(order.customer?.name || '—')}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-stone-500">Student ID</dt>
            <dd class="font-bold text-ink">${escapeHtml(order.customer?.studentId || '—')}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-stone-500">Email</dt>
            <dd class="truncate font-bold text-ink">${escapeHtml(order.customer?.email || '—')}</dd>
          </div>
          <div class="flex justify-between">
            <dt class="text-stone-500">Phone</dt>
            <dd class="font-bold text-ink">${escapeHtml(order.customer?.phone || '—')}</dd>
          </div>
        </dl>
      </section>
    </div>

    ${order.specialInstructions ? `
      <section class="mt-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6" aria-label="Special instructions">
        <h2 class="font-display text-lg font-extrabold text-ink">Special Instructions</h2>
        <p class="mt-2 text-sm text-stone-600">${escapeHtml(order.specialInstructions)}</p>
      </section>
    ` : ''}

    <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <a href="orders.php"
         class="focus-ring inline-block rounded-full bg-orange-600 px-6 py-3 text-center text-sm font-extrabold text-white hover:bg-orange-700">
        View My Orders
      </a>
      <a href="menu.php"
         class="focus-ring inline-block rounded-full border border-stone-200 bg-white px-6 py-3 text-center text-sm font-bold text-stone-600 hover:bg-orange-50">
        Back to Menu
      </a>
    </div>
  `;

  bindFutureLinks();
}

// ─── Order Status Timeline ───────────────────────────────────────────────────

function renderOrderStatus(steps) {
  return `
    <ol class="mt-4 space-y-0">
      ${steps.map((step, i) => `
        <li class="flex gap-3 ${i < steps.length - 1 ? 'pb-4' : ''}">
          <div class="flex flex-col items-center">
            <div class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold
              ${step.active
                ? 'bg-green-600 text-white'
                : 'border-2 border-stone-200 bg-white text-stone-400'}">
              ${step.active ? '✓' : '○'}
            </div>
            ${i < steps.length - 1
              ? `<div class="w-0.5 flex-1 ${step.active ? 'bg-green-400' : 'bg-stone-200'}"></div>`
              : ''}
          </div>
          <div class="${i < steps.length - 1 ? 'pb-6' : ''}">
            <p class="text-sm font-bold ${step.active ? 'text-ink' : 'text-stone-400'}">${step.label}</p>
          </div>
        </li>
      `).join('')}
    </ol>
  `;
}

// ─── Order Items ─────────────────────────────────────────────────────────────

function renderOrderItems(order) {
  const itemsHtml = order.items.map(line => `
    <div class="flex items-center justify-between py-2">
      <div class="min-w-0">
        <p class="text-sm font-bold text-ink">${escapeHtml(line.name)}</p>
        <p class="text-xs text-stone-500">${line.quantity} × ${money(line.price)}</p>
      </div>
      <p class="shrink-0 text-sm font-extrabold text-ink">${money(line.price * line.quantity)}</p>
    </div>
  `).join('');

  return `
    <div class="mt-3 divide-y divide-stone-100">${itemsHtml}</div>
    <dl class="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm">
      <div class="flex justify-between">
        <dt class="text-stone-500">Subtotal</dt>
        <dd class="font-bold text-ink">${money(order.subtotal)}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-stone-500">Convenience Fee</dt>
        <dd class="font-bold text-ink">${money(order.convenienceFee)}</dd>
      </div>
      <div class="flex justify-between border-t border-stone-200 pt-2">
        <dt class="font-display text-base font-extrabold text-ink">Total</dt>
        <dd class="font-display text-lg font-extrabold text-orange-600">${money(order.total)}</dd>
      </div>
    </dl>
  `;
}

// ─── Missing Order ───────────────────────────────────────────────────────────

function handleMissingOrder() {
  $('confirmation-content').innerHTML = `
    <div class="mx-auto max-w-md rounded-3xl border border-dashed border-orange-200 bg-white px-8 py-16 text-center shadow-card">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-4xl">📋</div>
      <h2 class="mt-6 font-display text-2xl font-extrabold text-ink">Order not found</h2>
      <p class="mt-3 text-stone-500">We couldn't find a recent order on this device.</p>
      <a href="menu.php"
         class="focus-ring mt-6 inline-block rounded-full bg-orange-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-orange-700">
        Back to Menu
      </a>
    </div>
  `;
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

let toastTimer;

function showToast(msg) {
  let toast = $('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'pointer-events-none fixed bottom-5 left-1/2 z-[60] hidden -translate-x-1/2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
}
