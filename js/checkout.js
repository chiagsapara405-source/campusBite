// ─── Food Data ───────────────────────────────────────────────────────────────

let FOOD_ITEMS = [];

const FOODS_KEY  = 'campusbite_foods';
const CART_KEY   = 'campusbite-cart-v1';

let cart = [];

// ─── Load Foods ────────────────────────────────────────────────────────────

function loadFoods() {
  if (Array.isArray(window.CAMPUSBITE_FOODS)) {
    FOOD_ITEMS = window.CAMPUSBITE_FOODS;
    return;
  }
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
    ingredients: x[5] ? 'Fresh vegetables, herbs, spices and house sauce.' : 'Fresh ingredients, herbs, spices and house sauce.',
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
  loadCart();
  bindEvents();
});

// ─── Event Binding ───────────────────────────────────────────────────────────

function bindEvents() {
  $('menu-toggle').onclick = () => {
    const open = $('mobile-nav').classList.toggle('hidden');
    $('menu-toggle').setAttribute('aria-expanded', String(!open));
  };

  document.querySelectorAll('[data-future]').forEach(x => {
    x.addEventListener('click', e => {
      e.preventDefault();
      showToast('This feature is coming soon.');
    });
  });

  $('checkout-form').addEventListener('submit', e => {
    e.preventDefault();
    placeOrder();
  });

  document.querySelectorAll('#checkout-form input:not([type=radio]), #checkout-form textarea').forEach(el => {
    el.addEventListener('input', () => clearFieldError(el));
  });

  const radioErrorMap = {
    pickupLocation: 'pickup-location-error',
    pickupTime:     'pickup-time-error',
    paymentMethod:  'payment-error',
  };

  const radioFieldMap = {
    pickupLocation: 'pickup-location',
    pickupTime:     'pickup-time',
    paymentMethod:  'payment',
  };

  document.querySelectorAll('#checkout-form input[type=radio]').forEach(el => {
    el.addEventListener('change', () => {
      const errorId = radioErrorMap[el.name];
      if (errorId) {
        const errorEl = $(errorId);
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.add('hidden');
        }
      }
      const fieldId = radioFieldMap[el.name];
      if (fieldId) {
        const fieldset = $(fieldId);
        if (fieldset) {
          fieldset.classList.remove('field-error');
          fieldset.removeAttribute('aria-invalid');
        }
      }
    });
  });
}

// ─── Cart Data ───────────────────────────────────────────────────────────────

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    cart = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(cart)) cart = [];
    cart = cart
      .filter(x => x && typeof x.id === 'number' && typeof x.price === 'number')
      .map(x => ({
        id:       x.id,
        name:     typeof x.name === 'string' ? x.name : 'Unknown item',
        price:    x.price,
        quantity: Math.max(1, Math.floor(Number(x.quantity) || 1)),
      }));
  } catch {
    cart = [];
  }

  const n = cart.reduce((sum, x) => sum + x.quantity, 0);
  $('cart-count').textContent = n;

  if (!cart.length) {
    handleEmptyCart();
    return;
  }

  renderOrderSummary();
}

// ─── Empty Cart ──────────────────────────────────────────────────────────────

function handleEmptyCart() {
  $('checkout-content').classList.add('hidden');
  $('empty-cart').classList.remove('hidden');
  $('empty-cart').innerHTML = `
    <div class="mx-auto max-w-md rounded-3xl border border-dashed border-orange-200 bg-white px-8 py-16 text-center shadow-card">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-4xl">🛒</div>
      <h2 class="mt-6 font-display text-2xl font-extrabold text-ink">Your cart is empty</h2>
      <p class="mt-3 text-stone-500">Add items from the menu before checking out.</p>
      <a href="menu.php"
         class="focus-ring mt-6 inline-block rounded-full bg-orange-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-orange-700">
        Browse Menu
      </a>
    </div>
  `;
}

// ─── Order Summary ───────────────────────────────────────────────────────────

function renderOrderSummary() {
  const { subtotal, fee, total } = calculateTotals();

  const itemsHtml = cart.map(line => {
    const food = foodById(line.id);
    const img  = food?.image || '';
    return `
      <div class="flex items-center gap-3">
        <div class="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-orange-100">
          ${img
            ? `<img src="${img}" alt="${line.name}" class="h-full w-full object-cover" loading="lazy">`
            : `<div class="flex h-full w-full items-center justify-center text-lg text-orange-300">🍽️</div>`}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-bold text-ink">${line.name}</p>
          <p class="text-xs text-stone-500">${line.quantity} × ${money(line.price)}</p>
        </div>
        <p class="shrink-0 text-sm font-extrabold text-ink">${money(line.price * line.quantity)}</p>
      </div>
    `;
  }).join('');

  $('order-summary').innerHTML = `
    <div class="rounded-2xl border border-orange-100 bg-white p-5 shadow-card">
      <h2 class="font-display text-xl font-extrabold text-ink">Order Summary</h2>
      <div class="mt-4 space-y-3">${itemsHtml}</div>
      <dl class="mt-5 space-y-2 border-t border-stone-200 pt-4 text-sm">
        <div class="flex justify-between">
          <dt class="text-stone-500">Subtotal</dt>
          <dd class="font-bold text-ink">${money(subtotal)}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-stone-500">Convenience Fee</dt>
          <dd class="font-bold text-ink">${money(fee)}</dd>
        </div>
        <div class="flex justify-between border-t border-stone-200 pt-2">
          <dt class="font-display text-base font-extrabold text-ink">Total</dt>
          <dd class="font-display text-lg font-extrabold text-orange-600">${money(total)}</dd>
        </div>
      </dl>
      <button type="submit" form="checkout-form" id="place-order-btn"
              class="focus-ring mt-5 w-full rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-extrabold text-white hover:bg-orange-700">
        Place Order
      </button>
      <a href="cart.php"
         class="focus-ring mt-3 block rounded-xl border border-stone-200 px-4 py-3 text-center text-sm font-bold text-stone-600 hover:bg-orange-50">
        ← Back to Cart
      </a>
    </div>
  `;
}

// ─── Totals ──────────────────────────────────────────────────────────────────

function calculateTotals() {
  const subtotal = cart.reduce((sum, x) => sum + x.price * x.quantity, 0);
  const fee      = 0;
  return { subtotal, fee, total: subtotal + fee };
}

// ─── Validation ──────────────────────────────────────────────────────────────

function validateForm() {
  let valid = true;
  const form = $('checkout-form');

  const name  = form.fullName.value.trim();
  const sid   = form.studentId.value.trim();
  const email = form.email.value.trim();
  const phone = form.phone.value.trim();

  if (!name) {
    showFieldError('full-name', 'Full name is required.');
    valid = false;
  }

  if (!sid) {
    showFieldError('student-id', 'Student ID is required.');
    valid = false;
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('email', email ? 'Enter a valid email address.' : 'Email is required.');
    valid = false;
  }

  if (!phone || !/^[\d\s\-+()]{7,15}$/.test(phone)) {
    showFieldError('phone', phone ? 'Enter a valid phone number.' : 'Phone number is required.');
    valid = false;
  }

  const location = form.pickupLocation.value;
  if (!location) {
    showFieldError('pickup-location', 'Select a pickup location.');
    valid = false;
  }

  const time = form.pickupTime.value;
  if (!time) {
    showFieldError('pickup-time', 'Select a pickup time.');
    valid = false;
  }

  const payment = form.paymentMethod.value;
  if (!payment) {
    showFieldError('payment', 'Select a payment method.');
    valid = false;
  }

  if (!cart.length) {
    showToast('Your cart is empty.');
    valid = false;
  }

  return valid;
}

function showFieldError(fieldId, msg) {
  const errorEl = $(fieldId + '-error');
  const input   = $(fieldId);

  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
  }
  if (input) {
    input.classList.add('field-error');
    input.setAttribute('aria-invalid', 'true');
  }
}

function clearFieldError(el) {
  const errorEl = $(el.id + '-error');
  if (errorEl) {
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
  el.classList.remove('field-error');
  el.removeAttribute('aria-invalid');
}

// ─── Order ID ────────────────────────────────────────────────────────────────

function placeOrder() {
  if (!validateForm()) return;

  const btn = $('place-order-btn');
  btn.disabled    = true;
  btn.textContent = 'Placing Order...';

  $('cart-data').value = JSON.stringify(cart);
  $('checkout-form').submit();
}

// ─── Toast ───────────────────────────────────────────────────────────────────

let toastTimer;

function showToast(msg) {
  $('toast').textContent = msg;
  $('toast').classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.add('hidden'), 2800);
}
