// ─── Food Data ───────────────────────────────────────────────────────────────

let FOOD_ITEMS = [];

const FOODS_KEY  = 'campusbite_foods';
const CART_KEY   = 'campusbite-cart-v1';
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

let currentOrder = null;

// ─── Load Foods ────────────────────────────────────────────────────────────

function loadFoods() {
  try {
    const raw = localStorage.getItem(FOODS_KEY);
    if (raw) {
      FOOD_ITEMS = JSON.parse(raw);
      if (Array.isArray(FOOD_ITEMS) && FOOD_ITEMS.length) return;
    }
  } catch {}
  FOOD_ITEMS = [
    ['Veg Cheese Burger',  'Burgers',   'Crispy veg patty, cheese and fresh salad.',        80,  4.5, true,  true,  '1568901346375-23c9450c58cd'],
    ['Paneer Wrap',        'Meals',     'Spiced paneer with crunchy vegetables.',            70,  4.4, true,  true,  '1626700051175-6818013e1d4f'],
    ['Margherita Pizza',   'Pizza',     'Tomato, mozzarella and basil on a crisp base.',   120,  4.6, true,  true,  '1513104890138-7c749659a591'],
    ['Masala Dosa',        'Breakfast', 'Golden dosa with potato masala and chutneys.',     60,  4.7, true,  true,  '1630383249896-424e482df921'],
    ['Cold Coffee',        'Drinks',    'Chilled, creamy coffee with a cocoa dusting.',     50,  4.3, true,  true,  '1517701550927-30cf4ba1dba5'],
    ['French Fries',       'Snacks',    'Golden salted fries with tomato ketchup.',         60,  4.3, true,  true,  '1573080496219-bb080dd4f877'],
    ['Veg Sandwich',       'Breakfast', 'Toasted vegetables, chutney and cheese.',          55,  4.2, true,  true,  '1528735602780-2552fd46c7af'],
    ['Chole Bhature',      'Meals',     'Slow-cooked chickpeas with fluffy bhature.',       90,  4.6, true,  true,  '1626132647523-66f5bf380027'],
    ['Masala Maggi',       'Snacks',    'Comforting noodles with vegetables and herbs.',    50,  4.1, true,  true,  '1612929633738-8fe44f7ec841'],
    ['Veg Biryani',        'Meals',     'Fragrant rice, seasonal vegetables and raita.',   100,  4.5, true,  true,  '1563379926898-05f4575a45d8'],
    ['Lemon Soda',         'Drinks',    'Sparkling lemon, mint and a pinch of salt.',       35,  4.2, true,  true,  '1621263764928-df1444c5e859'],
    ['Chocolate Brownie',  'Desserts',  'Fudgy chocolate brownie, baked fresh today.',      65,  4.7, true,  true,  '1606313564200-e75d5e30476c'],
    ['Chicken Burger',     'Burgers',   'Grilled chicken, lettuce and signature sauce.',   110,  4.4, false, false, '1568901346375-23c9450c58cd'],
    ['Pepperoni Pizza',    'Pizza',     'Cheese pizza with smoky pepperoni slices.',       150,  4.5, false, false, '1565299624946-b28f40a0ae38'],
    ['Idli Sambar',        'Breakfast', 'Soft steamed idlis with lentil sambar.',           45,  4.4, true,  true,  '1589301760014-d929f3979dbc'],
    ['Mango Shake',        'Drinks',    'Thick chilled mango shake with almonds.',          55,  4.3, true,  false, '1623065422902-30a2d299bbe4'],
  ].map((x, i) => ({
    id: i + 1, name: x[0], category: x[1], description: x[2], price: x[3], rating: x[4],
    vegetarian: x[5], available: x[6],
    image: `https://images.unsplash.com/photo-${x[7]}?auto=format&fit=crop&w=700&q=80`,
  }));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const $     = id => document.getElementById(id);
const money = n  => `₹${n}`;

function foodById(id) {
  return FOOD_ITEMS.find(f => f.id === id) || null;
}

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadFoods();
  updateCartCount();
  bindEvents();
  const orderId = getOrderIdFromURL();
  currentOrder  = loadOrder(orderId);
  if (currentOrder) {
    renderOrder(currentOrder);
  } else {
    handleOrderNotFound();
  }
});

// ─── Event Binding ───────────────────────────────────────────────────────────

function bindEvents() {
  $('menu-toggle').onclick = () => {
    const open = $('mobile-nav').classList.toggle('hidden');
    $('menu-toggle').setAttribute('aria-expanded', String(!open));
  };

  bindFutureLinks();

  $('cancel-keep').onclick    = closeModal;
  $('cancel-confirm').onclick = () => {
    confirmCancel();
    closeModal();
  };

  $('cancel-modal').addEventListener('click', e => {
    if (e.target === $('cancel-modal')) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
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
  $('cart-count').textContent = cart.reduce((s, x) => s + (x.quantity || 0), 0);
}

// ─── URL & Data ──────────────────────────────────────────────────────────────

function getOrderIdFromURL() {
  return new URLSearchParams(window.location.search).get('id') || '';
}

function loadOrder(id) {
  if (!id) return null;
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    const orders = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(orders)) return null;
    return orders.find(o => o && o.orderId === id) || null;
  } catch {
    return null;
  }
}

function saveOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

// ─── Rendering ───────────────────────────────────────────────────────────────

function renderOrder(order) {
  const status     = order.status || 'Pending';
  const badgeClass = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  const badgeLabel = STATUS_LABELS[status] || status;
  const dateStr    = formatOrderDate(order.createdAt);

  $('order-content').innerHTML = `
    <section class="text-center sm:text-left">
      <a href="orders.php"
         class="focus-ring inline-block text-sm font-bold text-orange-600 hover:text-orange-700">
        ← Back to My Orders
      </a>
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <h1 class="font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">Order #${escapeHtml(order.orderId)}</h1>
        <span class="rounded-full px-3 py-1 text-xs font-extrabold ${badgeClass}">${badgeLabel}</span>
      </div>
      <p class="mt-1 text-sm text-stone-500">Placed ${dateStr}</p>
    </section>

    ${status === 'Cancelled' ? renderCancelledState() : renderOrderStatus(status)}

    <section class="mt-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6" aria-label="Order items">
      <h2 class="font-display text-lg font-extrabold text-ink">Order Items</h2>
      ${renderOrderItems(order)}
    </section>

    <div class="mt-5 grid gap-5 sm:grid-cols-2">
      <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6" aria-label="Pickup details">
        ${renderPickupDetails(order)}
      </section>
      <section class="rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6" aria-label="Customer details">
        ${renderCustomerDetails(order)}
      </section>
    </div>

    ${renderSpecialInstructions(order)}

    <section class="mt-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6" aria-label="Payment">
      <h2 class="font-display text-lg font-extrabold text-ink">Payment</h2>
      <p class="mt-2 text-sm text-stone-600">${escapeHtml(order.paymentMethod || 'Pay at Counter')}</p>
    </section>

    <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
      <a href="orders.php"
         class="focus-ring inline-block rounded-full bg-orange-600 px-6 py-3 text-center text-sm font-extrabold text-white hover:bg-orange-700">
        Back to My Orders
      </a>
      <button id="order-again-btn"
              class="focus-ring inline-block rounded-full border border-orange-600 bg-white px-6 py-3 text-center text-sm font-extrabold text-orange-600 hover:bg-orange-50">
        Order Again
      </button>
      ${status === 'Pending' ? `
        <button id="cancel-order-btn"
                class="focus-ring inline-block rounded-full border border-red-300 bg-white px-6 py-3 text-center text-sm font-bold text-red-600 hover:bg-red-50">
          Cancel Order
        </button>
      ` : ''}
    </div>
  `;

  $('order-again-btn').onclick = handleOrderAgain;
  if ($('cancel-order-btn')) {
    $('cancel-order-btn').onclick = openModal;
  }

  bindFutureLinks();
}

// ─── Status Timeline ─────────────────────────────────────────────────────────

function renderOrderStatus(status) {
  const steps = ['Order Placed', 'Preparing', 'Ready for Pickup', 'Completed'];
  const statusIndex = { Pending: 0, Preparing: 1, Ready: 2, Completed: 3 };
  const current = statusIndex[status] ?? 0;

  return `
    <section class="mt-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6" aria-label="Order status">
      <h2 class="font-display text-lg font-extrabold text-ink">Order Status</h2>
      <ol class="mt-4">
        ${steps.map((step, i) => {
          const done    = i < current;
          const active  = i === current;
          const pending = i > current;
          const circle  = done
            ? 'bg-green-600 text-white'
            : active
              ? 'bg-orange-600 text-white'
              : 'border-2 border-stone-200 bg-white text-stone-400';
          const line    = i < steps.length - 1
            ? (done || active ? 'bg-green-400' : 'bg-stone-200')
            : '';
          const label   = done || active ? 'text-ink' : 'text-stone-400';

          return `
            <li class="flex gap-3 ${i < steps.length - 1 ? 'pb-4' : ''}">
              <div class="flex flex-col items-center">
                <div class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${circle}">
                  ${done ? '✓' : active ? '●' : '○'}
                </div>
                ${i < steps.length - 1 ? `<div class="w-0.5 flex-1 ${line}"></div>` : ''}
              </div>
              <div class="${i < steps.length - 1 ? 'pb-6' : ''}">
                <p class="text-sm font-bold ${label}">${step}</p>
              </div>
            </li>
          `;
        }).join('')}
      </ol>
    </section>
  `;
}

function renderCancelledState() {
  return `
    <section class="mt-5 rounded-2xl border border-red-200 bg-red-50 p-5 sm:p-6" aria-label="Order cancelled">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-xl">✕</div>
        <div>
          <h2 class="font-display text-lg font-extrabold text-red-800">Order Cancelled</h2>
          <p class="text-sm text-red-600">This order was cancelled.</p>
        </div>
      </div>
    </section>
  `;
}

// ─── Order Items ─────────────────────────────────────────────────────────────

function renderOrderItems(order) {
  if (!order.items || !order.items.length) {
    return '<p class="mt-3 text-sm text-stone-500">No items in this order.</p>';
  }

  const itemsHtml = order.items.map(line => {
    const food = foodById(line.id);
    const img  = food?.image || '';
    return `
      <div class="flex items-center gap-3 py-2">
        <div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-orange-100">
          ${img
            ? `<img src="${img}" alt="${escapeHtml(line.name)}" class="h-full w-full object-cover" loading="lazy">`
            : `<div class="flex h-full w-full items-center justify-center text-lg text-orange-300">🍽️</div>`}
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-bold text-ink">${escapeHtml(line.name)}</p>
          <p class="text-xs text-stone-500">${line.quantity} × ${money(line.price)}</p>
        </div>
        <p class="shrink-0 text-sm font-extrabold text-ink">${money(line.price * line.quantity)}</p>
      </div>
    `;
  }).join('');

  return `
    <div class="mt-3 divide-y divide-stone-100">${itemsHtml}</div>
    <dl class="mt-4 space-y-2 border-t border-stone-200 pt-4 text-sm">
      <div class="flex justify-between">
        <dt class="text-stone-500">Subtotal</dt>
        <dd class="font-bold text-ink">${money(order.subtotal)}</dd>
      </div>
      <div class="flex justify-between">
        <dt class="text-stone-500">Convenience Fee</dt>
        <dd class="font-bold text-ink">${money(order.convenienceFee || 0)}</dd>
      </div>
      <div class="flex justify-between border-t border-stone-200 pt-2">
        <dt class="font-display text-base font-extrabold text-ink">Total</dt>
        <dd class="font-display text-lg font-extrabold text-orange-600">${money(order.total)}</dd>
      </div>
    </dl>
  `;
}

// ─── Pickup Details ──────────────────────────────────────────────────────────

function renderPickupDetails(order) {
  return `
    <h2 class="font-display text-lg font-extrabold text-ink">Pickup Details</h2>
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
  `;
}

// ─── Customer Details ────────────────────────────────────────────────────────

function renderCustomerDetails(order) {
  return `
    <h2 class="font-display text-lg font-extrabold text-ink">Customer Details</h2>
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
  `;
}

// ─── Special Instructions ────────────────────────────────────────────────────

function renderSpecialInstructions(order) {
  if (!order.specialInstructions) return '';
  return `
    <section class="mt-5 rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6" aria-label="Special instructions">
      <h2 class="font-display text-lg font-extrabold text-ink">Special Instructions</h2>
      <p class="mt-2 text-sm text-stone-600">${escapeHtml(order.specialInstructions)}</p>
    </section>
  `;
}

// ─── Cancel Order ────────────────────────────────────────────────────────────

function openModal() {
  $('cancel-modal').classList.remove('hidden');
  $('cancel-modal').classList.add('flex');
  $('cancel-keep').focus();
}

function closeModal() {
  $('cancel-modal').classList.add('hidden');
  $('cancel-modal').classList.remove('flex');
}

function confirmCancel() {
  if (!currentOrder) return;

  try {
    const raw    = localStorage.getItem(ORDERS_KEY);
    const orders = raw ? JSON.parse(raw) : [];
    const idx    = orders.findIndex(o => o.orderId === currentOrder.orderId);
    if (idx !== -1) {
      orders[idx].status = 'Cancelled';
      saveOrders(orders);
      currentOrder.status = 'Cancelled';
      renderOrder(currentOrder);
      showToast('Order cancelled');
    }
  } catch {
    showToast('Could not cancel order');
  }
}

// ─── Order Again ─────────────────────────────────────────────────────────────

function handleOrderAgain() {
  if (!currentOrder || !currentOrder.items) return;

  let cart = [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
  } catch {
    cart = [];
  }

  let skipped = 0;

  currentOrder.items.forEach(item => {
    const food = foodById(item.id);
    if (!food || !food.available) {
      skipped++;
      return;
    }

    const existing = cart.find(c => c.id === item.id);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      cart.push({ id: food.id, name: food.name, price: food.price, quantity: item.quantity });
    }
  });

  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();

  if (skipped > 0) {
    showToast(`${skipped} item${skipped > 1 ? 's' : ''} no longer available`);
    setTimeout(() => { window.location.href = 'cart.php'; }, 1500);
  } else {
    showToast('Items added to cart');
    setTimeout(() => { window.location.href = 'cart.php'; }, 1000);
  }
}

// ─── Not Found ───────────────────────────────────────────────────────────────

function handleOrderNotFound() {
  $('order-content').innerHTML = `
    <div class="mx-auto max-w-md rounded-3xl border border-dashed border-orange-200 bg-white px-8 py-16 text-center shadow-card">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100 text-4xl">📋</div>
      <h2 class="mt-6 font-display text-2xl font-extrabold text-ink">Order not found</h2>
      <p class="mt-3 text-stone-500">We couldn't find an order matching this ID.</p>
      <a href="orders.php"
         class="focus-ring mt-6 inline-block rounded-full bg-orange-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-orange-700">
        Back to My Orders
      </a>
    </div>
  `;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

function formatOrderDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', {
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
