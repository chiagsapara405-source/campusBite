// ─── Constants ───────────────────────────────────────────────────────────────

const ORDERS_KEY = 'campusbite_orders';

const STATUS_STYLES = {
  Pending:   'bg-amber-100 text-amber-800',
  Preparing: 'bg-blue-100 text-blue-800',
  Ready:     'bg-green-100 text-green-800',
  Completed: 'bg-stone-100 text-stone-600',
  Cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS = {
  Pending:   'Pending',
  Preparing: 'Preparing',
  Ready:     'Ready for Pickup',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

const TIMELINE_STEPS = ['Pending', 'Preparing', 'Ready', 'Completed'];

const NEXT_STATUS = {
  Pending:   ['Preparing', 'Cancelled'],
  Preparing: ['Ready'],
  Ready:     ['Completed'],
  Completed: [],
  Cancelled: [],
};

let orders = [];
let order  = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const $     = id => document.getElementById(id);
const money = n  => `₹${n}`;

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  bindEvents();

  const id = getOrderIdFromURL();
  order = orders.find(o => o.orderId === id);

  if (order) {
    renderOrder();
  } else {
    renderNotFound();
  }
});

// ─── Event Binding ───────────────────────────────────────────────────────────

function bindEvents() {
  const toggle  = $('sidebar-toggle');
  const sidebar = $('sidebar');
  const overlay = $('sidebar-overlay');
  const close   = $('sidebar-close');

  function openSidebar() {
    sidebar.classList.remove('hidden');
    sidebar.classList.add('block');
    overlay.classList.remove('hidden');
    toggle.setAttribute('aria-expanded', 'true');
  }

  function closeSidebar() {
    sidebar.classList.add('hidden');
    sidebar.classList.remove('block');
    overlay.classList.add('hidden');
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.onclick   = openSidebar;
  close.onclick    = closeSidebar;
  overlay.onclick  = closeSidebar;

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('cancel-modal').classList.contains('hidden')) {
        closeCancelModal();
      } else if (!sidebar.classList.contains('hidden') && window.innerWidth < 1024) {
        closeSidebar();
      }
    }
  });

  $('cancel-keep').onclick    = closeCancelModal;
  $('cancel-confirm').onclick = confirmCancel;

  $('cancel-modal').addEventListener('click', e => {
    if (e.target === $('cancel-modal')) closeCancelModal();
  });
}

// ─── Data ────────────────────────────────────────────────────────────────────

function getOrderIdFromURL() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

function loadOrders() {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    orders = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(orders)) orders = [];
    orders = orders.filter(o => o && o.orderId && Array.isArray(o.items));
  } catch {
    orders = [];
  }
}

function saveOrders() {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// ─── Render ──────────────────────────────────────────────────────────────────

function renderOrder() {
  const o         = order;
  const status    = o.status || 'Pending';
  const badgeClass = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  const badgeLabel = STATUS_LABELS[status] || status;
  const dateStr    = formatOrderDate(o.createdAt);
  const nextOptions = NEXT_STATUS[status] || [];

  const statusUpdateHtml = nextOptions.length
    ? `<div class="mt-4 flex flex-wrap items-center gap-3">
         <label for="status-select" class="text-sm font-bold text-stone-600">Update Status</label>
         <select id="status-select"
                 class="focus-ring rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-bold">
           ${nextOptions.map(s => `<option value="${s}">${STATUS_LABELS[s]}</option>`).join('')}
         </select>
         <button id="apply-status-btn"
                 class="focus-ring rounded-xl bg-orange-600 px-5 py-2 text-sm font-extrabold text-white hover:bg-orange-700">
           Update Status
         </button>
       </div>`
    : '';

  const cancelBtn = status === 'Pending'
    ? `<button id="cancel-order-btn"
               class="focus-ring rounded-xl border border-red-200 bg-white px-5 py-2 text-sm font-bold text-red-600 hover:bg-red-50">
         Cancel Order
       </button>`
    : '';

  $('order-content').innerHTML = `
    <!-- Back link -->
    <a href="admin-orders.html"
       class="focus-ring mb-6 inline-flex items-center gap-1 text-sm font-bold text-orange-600 hover:text-orange-700">
      ← Back to Orders
    </a>

    <!-- Header -->
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 class="font-display text-3xl font-extrabold text-ink sm:text-4xl">Order #${escapeHtml(o.orderId)}</h1>
        <p class="mt-1 text-sm text-stone-500">${dateStr}</p>
        <span class="mt-2 inline-block rounded-full px-3 py-1 text-xs font-extrabold ${badgeClass}">${badgeLabel}</span>
      </div>
      <div class="flex flex-wrap gap-2">
        ${cancelBtn}
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Left: items + timeline -->
      <div class="space-y-6 lg:col-span-2">
        <!-- Status timeline -->
        <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6">
          <h2 class="font-display text-lg font-extrabold text-ink">Order Progress</h2>
          ${status === 'Cancelled'
            ? renderCancelledTimeline()
            : renderTimeline(status)}
          ${statusUpdateHtml}
        </section>

        <!-- Items -->
        <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6">
          <h2 class="font-display text-lg font-extrabold text-ink">Order Items</h2>
          ${renderItems(o)}
        </section>
      </div>

      <!-- Right: details -->
      <div class="space-y-6">
        <!-- Customer -->
        <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6">
          <h2 class="font-display text-lg font-extrabold text-ink">Customer Details</h2>
          <dl class="mt-3 space-y-2 text-sm">
            <div class="flex justify-between gap-2">
              <dt class="text-stone-500">Name</dt>
              <dd class="font-bold text-ink">${escapeHtml(o.customer?.name || '—')}</dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="text-stone-500">Student ID</dt>
              <dd class="font-bold text-ink">${escapeHtml(o.customer?.studentId || '—')}</dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="text-stone-500">Email</dt>
              <dd class="truncate font-bold text-ink">${escapeHtml(o.customer?.email || '—')}</dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="text-stone-500">Phone</dt>
              <dd class="font-bold text-ink">${escapeHtml(o.customer?.phone || '—')}</dd>
            </div>
          </dl>
        </section>

        <!-- Pickup -->
        <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6">
          <h2 class="font-display text-lg font-extrabold text-ink">Pickup Details</h2>
          <dl class="mt-3 space-y-2 text-sm">
            <div class="flex justify-between gap-2">
              <dt class="text-stone-500">Location</dt>
              <dd class="font-bold text-ink">${escapeHtml(o.pickup?.location || '—')}</dd>
            </div>
            <div class="flex justify-between gap-2">
              <dt class="text-stone-500">Time</dt>
              <dd class="font-bold text-ink">${escapeHtml(o.pickup?.time || '—')}</dd>
            </div>
          </dl>
        </section>

        <!-- Payment -->
        <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6">
          <h2 class="font-display text-lg font-extrabold text-ink">Payment</h2>
          <p class="mt-2 text-sm font-bold text-ink">${escapeHtml(o.paymentMethod || 'Pay at Counter')}</p>
        </section>

        ${o.specialInstructions ? `
          <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6">
            <h2 class="font-display text-lg font-extrabold text-ink">Special Instructions</h2>
            <p class="mt-2 text-sm text-stone-600">${escapeHtml(o.specialInstructions)}</p>
          </section>
        ` : ''}
      </div>
    </div>
  `;

  // Bind dynamic elements
  $('apply-status-btn')?.addEventListener('click', applyStatusUpdate);
  $('cancel-order-btn')?.addEventListener('click', openCancelModal);
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function renderTimeline(status) {
  const currentIndex = TIMELINE_STEPS.indexOf(status);

  return `
    <ol class="mt-4 space-y-0">
      ${TIMELINE_STEPS.map((step, i) => {
        const done    = i < currentIndex;
        const current = i === currentIndex;
        const label   = STATUS_LABELS[step];
        const icon    = done ? '✓' : current ? '●' : '○';
        const dotCls  = done
          ? 'bg-green-600 text-white'
          : current
            ? 'bg-orange-600 text-white'
            : 'border-2 border-stone-200 bg-white text-stone-400';
        const lineCls = done ? 'bg-green-400' : 'bg-stone-200';
        const textCls = done || current ? 'text-ink' : 'text-stone-400';

        return `
          <li class="flex gap-3 ${i < TIMELINE_STEPS.length - 1 ? 'pb-4' : ''}">
            <div class="flex flex-col items-center">
              <div class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${dotCls}">
                ${icon}
              </div>
              ${i < TIMELINE_STEPS.length - 1
                ? `<div class="w-0.5 flex-1 ${lineCls}"></div>`
                : ''}
            </div>
            <div class="${i < TIMELINE_STEPS.length - 1 ? 'pb-6' : ''}">
              <p class="text-sm font-bold ${textCls}">${label}</p>
              ${current ? '<p class="text-xs text-orange-600 font-bold">Current</p>' : ''}
            </div>
          </li>
        `;
      }).join('')}
    </ol>
  `;
}

function renderCancelledTimeline() {
  return `
    <div class="mt-4 rounded-xl bg-red-50 p-4">
      <p class="font-display text-lg font-extrabold text-red-700">Order Cancelled</p>
      <p class="mt-1 text-sm text-red-600">This order was cancelled and cannot be updated.</p>
    </div>
    <ol class="mt-4 space-y-0">
      <li class="flex gap-3 pb-4">
        <div class="flex flex-col items-center">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">✓</div>
          <div class="w-0.5 flex-1 bg-red-300"></div>
        </div>
        <div class="pb-6"><p class="text-sm font-bold text-ink">Order Placed</p></div>
      </li>
      <li class="flex gap-3">
        <div class="flex flex-col items-center">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-red-600 text-sm font-bold text-white">✕</div>
        </div>
        <div><p class="text-sm font-bold text-red-700">Cancelled</p></div>
      </li>
    </ol>
  `;
}

// ─── Items ───────────────────────────────────────────────────────────────────

function renderItems(o) {
  const itemsHtml = o.items.map(line => {
    const lineTotal = line.price * line.quantity;
    return `
      <div class="flex items-center justify-between py-3">
        <div class="min-w-0">
          <p class="text-sm font-bold text-ink">${escapeHtml(line.name)}</p>
          <p class="text-xs text-stone-500">${line.quantity} × ${money(line.price)}</p>
        </div>
        <p class="shrink-0 text-sm font-extrabold text-ink">${money(lineTotal)}</p>
      </div>
    `;
  }).join('');

  return `
    <div class="mt-3 divide-y divide-stone-100">${itemsHtml}</div>
    <dl class="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm">
      <div class="flex justify-between">
        <dt class="text-stone-500">Subtotal</dt>
        <dd class="font-bold text-ink">${money(o.subtotal)}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-stone-500">Convenience Fee</dt>
        <dd class="font-bold text-ink">${money(o.convenienceFee || 0)}</dd>
      </div>
      <div class="flex justify-between border-t border-stone-200 pt-2">
        <dt class="font-display text-base font-extrabold text-ink">Total</dt>
        <dd class="font-display text-lg font-extrabold text-orange-600">${money(o.total)}</dd>
      </div>
    </dl>
  `;
}

// ─── Status Update ───────────────────────────────────────────────────────────

function applyStatusUpdate() {
  const select    = $('status-select');
  const newStatus = select?.value;
  if (!newStatus) return;

  order.status = newStatus;

  const idx = orders.findIndex(o => o.orderId === order.orderId);
  if (idx !== -1) orders[idx] = order;

  saveOrders();
  renderOrder();
  showToast(`Order #${order.orderId} updated to ${STATUS_LABELS[newStatus]}.`);
}

// ─── Cancel ──────────────────────────────────────────────────────────────────

function openCancelModal() {
  $('cancel-modal').classList.remove('hidden');
  $('cancel-modal').classList.add('flex');
  $('cancel-keep').focus();
}

function closeCancelModal() {
  $('cancel-modal').classList.add('hidden');
  $('cancel-modal').classList.remove('flex');
}

function confirmCancel() {
  order.status = 'Cancelled';

  const idx = orders.findIndex(o => o.orderId === order.orderId);
  if (idx !== -1) orders[idx] = order;

  saveOrders();
  closeCancelModal();
  renderOrder();
  showToast(`Order #${order.orderId} has been cancelled.`);
}

// ─── Not Found ───────────────────────────────────────────────────────────────

function renderNotFound() {
  $('order-content').innerHTML = `
    <div class="mx-auto max-w-md rounded-3xl border border-dashed border-orange-200 bg-white px-8 py-16 text-center shadow-card">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-4xl">🔍</div>
      <h2 class="mt-6 font-display text-2xl font-extrabold text-ink">Order not found</h2>
      <p class="mt-3 text-stone-500">We couldn't find an order matching this ID.</p>
      <a href="admin-orders.html"
         class="focus-ring mt-6 inline-block rounded-full bg-orange-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-orange-700">
        Back to Orders
      </a>
    </div>
  `;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

function formatOrderDate(iso) {
  try {
    const d = new Date(iso);
    return 'Placed ' + d.toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    }) + ' at ' + d.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return 'Unknown date';
  }
}

// ─── Utilities ───────────────────────────────────────────────────────────────

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}

// ─── Toast ───────────────────────────────────────────────────────────────────

let toastTimer;

function showToast(msg) {
  const toast = $('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add('hidden'), 2800);
}
