// ─── Food Data ───────────────────────────────────────────────────────────────

let FOOD_ITEMS = [];

const FOODS_KEY = 'campusbite_foods';
const CART_KEY  = 'campusbite-cart-v1';

let cart = [];
let lastRemoved = null;

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
  renderCart();
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

  $('cart-items').addEventListener('click', handleCartClick);
  $('recommended-grid')?.addEventListener('click', handleRecommendedClick);
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
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// ─── Rendering ───────────────────────────────────────────────────────────────

function renderCart() {
  updateCartCount();

  if (!cart.length) {
    handleEmptyCart();
    return;
  }

  $('cart-content').classList.remove('hidden');
  $('empty-cart').classList.add('hidden');

  renderCartItems();
  updateOrderSummary();
  renderRecommendedItems();
}

function renderCartItems() {
  $('cart-items').innerHTML = cart.map(line => {
    const food = foodById(line.id);
    const img  = food?.image || '';
    const desc = food?.description || '';
    const cat  = food?.category || '';
    const lineTotal = line.price * line.quantity;

    return `
      <article class="cart-item-exit flex gap-4 rounded-2xl border border-orange-100 bg-white p-4 shadow-card sm:gap-5 sm:p-5"
               data-cart-item="${line.id}">
        <div class="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-orange-100 sm:h-24 sm:w-24">
          ${img
            ? `<img src="${img}" alt="${line.name}" class="h-full w-full object-cover" loading="lazy">`
            : `<div class="flex h-full w-full items-center justify-center text-2xl text-orange-300">🍽️</div>`}
        </div>
        <div class="flex min-w-0 flex-1 flex-col">
          <div class="flex items-start justify-between gap-2">
            <div class="min-w-0">
              <h3 class="font-display text-base font-bold text-ink sm:text-lg">${line.name}</h3>
              ${desc ? `<p class="mt-0.5 truncate text-sm text-stone-500">${desc}</p>` : ''}
              ${cat  ? `<p class="mt-0.5 text-xs font-bold text-stone-400">${cat}</p>` : ''}
            </div>
            <button data-remove="${line.id}"
                    class="focus-ring shrink-0 rounded-lg px-2 py-1 text-sm font-bold text-red-500 hover:bg-red-50"
                    aria-label="Remove ${line.name}">Remove</button>
          </div>
          <div class="mt-auto flex items-center justify-between pt-3">
            <div class="flex items-center rounded-xl border border-stone-200">
              <button data-minus="${line.id}"
                      class="focus-ring px-3 py-1.5 font-bold text-stone-600 hover:text-orange-600"
                      aria-label="Decrease quantity">−</button>
              <span class="min-w-8 text-center text-sm font-bold">${line.quantity}</span>
              <button data-plus="${line.id}"
                      class="focus-ring px-3 py-1.5 font-bold text-stone-600 hover:text-orange-600"
                      aria-label="Increase quantity">+</button>
            </div>
            <div class="text-right">
              <p class="text-xs text-stone-400">${money(line.price)} each</p>
              <p class="font-display text-lg font-extrabold text-ink">${money(lineTotal)}</p>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function updateOrderSummary() {
  const subtotal = cart.reduce((sum, x) => sum + x.price * x.quantity, 0);
  const fee      = 0;
  const total    = subtotal + fee;

  $('order-summary').innerHTML = `
    <div class="sticky top-24 rounded-2xl border border-orange-100 bg-white p-5 shadow-card">
      <h2 class="font-display text-xl font-extrabold text-ink">Order Summary</h2>
      <dl class="mt-4 space-y-3 text-sm">
        <div class="flex justify-between">
          <dt class="text-stone-500">Subtotal</dt>
          <dd class="font-bold text-ink">${money(subtotal)}</dd>
        </div>
        <div class="flex justify-between">
          <dt class="text-stone-500">Convenience Fee</dt>
          <dd class="font-bold text-ink">${money(fee)}</dd>
        </div>
        <div class="border-t border-stone-200 pt-3">
          <div class="flex justify-between">
            <dt class="font-display text-base font-extrabold text-ink">Total</dt>
            <dd class="font-display text-lg font-extrabold text-orange-600">${money(total)}</dd>
          </div>
        </div>
      </dl>
      <a href="checkout.php"
         class="focus-ring mt-5 block rounded-xl bg-orange-600 px-4 py-3.5 text-center text-sm font-extrabold text-white hover:bg-orange-700">
        Proceed to Checkout
      </a>
      <a href="menu.php"
         class="focus-ring mt-3 block rounded-xl border border-stone-200 px-4 py-3 text-center text-sm font-bold text-stone-600 hover:bg-orange-50">
        ← Continue Shopping
      </a>
    </div>
  `;
}

function updateCartCount() {
  const n = cart.reduce((sum, x) => sum + x.quantity, 0);
  $('cart-count').textContent = n;
  $('item-count').textContent = n ? `${n} item${n === 1 ? '' : 's'}` : '';
  document.querySelector('a[href="cart.php"]')
    ?.setAttribute('aria-label', `View cart, ${n} items`);
}

// ─── Cart Actions ────────────────────────────────────────────────────────────

function updateItemQuantity(id, delta) {
  const line = cart.find(x => x.id === id);
  if (!line) return;

  line.quantity = Math.max(1, line.quantity + delta);
  saveCart();
  renderCart();
  showToast('Cart updated');
}

function removeFromCart(id) {
  const idx  = cart.findIndex(x => x.id === id);
  if (idx === -1) return;

  const el = document.querySelector(`[data-cart-item="${id}"]`);
  if (el) {
    el.classList.add('removing');
    setTimeout(() => {
      lastRemoved = { ...cart[idx], index: idx };
      cart.splice(idx, 1);
      saveCart();
      renderCart();
      showUndoToast(lastRemoved.name);
    }, 200);
  } else {
    lastRemoved = { ...cart[idx], index: idx };
    cart.splice(idx, 1);
    saveCart();
    renderCart();
    showUndoToast(lastRemoved.name);
  }
}

function addToCart(id, qty) {
  const food = foodById(id);
  if (!food?.available) return;

  const line = cart.find(x => x.id === id);
  if (line) {
    line.quantity += qty;
  } else {
    cart.push({ id: food.id, name: food.name, price: food.price, quantity: qty });
  }

  saveCart();
  renderCart();
  showToast(`✓ ${food.name} added to cart`);
}

// ─── Empty Cart ──────────────────────────────────────────────────────────────

function handleEmptyCart() {
  $('cart-content').classList.add('hidden');
  $('empty-cart').classList.remove('hidden');
  $('empty-cart').innerHTML = `
    <div class="mx-auto max-w-md rounded-3xl border border-dashed border-orange-200 bg-white px-8 py-16 text-center shadow-card">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-4xl">🛒</div>
      <h2 class="mt-6 font-display text-2xl font-extrabold text-ink">Your cart is empty</h2>
      <p class="mt-3 text-stone-500">Looks like you haven't added anything yet. Explore today's cafeteria menu and find something delicious.</p>
      <a href="menu.php"
         class="focus-ring mt-6 inline-block rounded-full bg-orange-600 px-6 py-3 text-sm font-extrabold text-white hover:bg-orange-700">
        Browse Menu
      </a>
    </div>
  `;
}

// ─── Recommended Items ──────────────────────────────────────────────────────

function renderRecommendedItems() {
  if (!cart.length) {
    $('recommended-section').classList.add('hidden');
    return;
  }

  const cartIds = new Set(cart.map(x => x.id));
  const picks   = FOOD_ITEMS.filter(f => f.available && !cartIds.has(f.id)).slice(0, 4);

  if (!picks.length) {
    $('recommended-section').classList.add('hidden');
    return;
  }

  $('recommended-section').classList.remove('hidden');
  $('recommended-grid').innerHTML = picks.map(f => `
    <article class="card-hover overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-card">
      <div class="h-36 overflow-hidden bg-orange-100">
        <img src="${f.image}" alt="${f.name}" class="h-full w-full object-cover" loading="lazy">
      </div>
      <div class="p-4">
        <h3 class="font-display text-sm font-bold text-ink">${f.name}</h3>
        <div class="mt-1 flex items-center justify-between text-sm">
          <span class="font-extrabold text-ink">${money(f.price)}</span>
          <span class="font-bold text-orange-600">★ ${f.rating}</span>
        </div>
        <button data-rec-add="${f.id}"
                class="focus-ring mt-3 w-full rounded-xl bg-orange-600 py-2 text-sm font-extrabold text-white hover:bg-orange-700">
          Add to Cart
        </button>
      </div>
    </article>
  `).join('');
}

// ─── Event Delegation ────────────────────────────────────────────────────────

function handleCartClick(e) {
  const plus   = e.target.closest('[data-plus]');
  const minus  = e.target.closest('[data-minus]');
  const remove = e.target.closest('[data-remove]');

  if (plus)   updateItemQuantity(+plus.dataset.plus, 1);
  if (minus)  updateItemQuantity(+minus.dataset.minus, -1);
  if (remove) removeFromCart(+remove.dataset.remove);
}

function handleRecommendedClick(e) {
  const add = e.target.closest('[data-rec-add]');
  if (add) addToCart(+add.dataset.recAdd, 1);
}

// ─── Toast ───────────────────────────────────────────────────────────────────

let toastTimer;
let undoTimer;

function showToast(msg) {
  clearTimeout(undoTimer);
  $('toast').innerHTML = msg;
  $('toast').classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('toast').classList.add('hidden'), 2800);
}

function showUndoToast(name) {
  clearTimeout(toastTimer);
  clearTimeout(undoTimer);

  $('toast').innerHTML = `
    <span class="flex items-center gap-3">
      <span>${name} removed</span>
      <button id="undo-btn" class="focus-ring rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold underline">Undo</button>
    </span>
  `;
  $('toast').classList.remove('hidden');

  $('undo-btn').onclick = () => {
    if (!lastRemoved) return;
    cart.splice(lastRemoved.index, 0, {
      id:       lastRemoved.id,
      name:     lastRemoved.name,
      price:    lastRemoved.price,
      quantity: lastRemoved.quantity,
    });
    lastRemoved = null;
    saveCart();
    renderCart();
    clearTimeout(undoTimer);
    showToast('Item restored');
  };

  undoTimer = setTimeout(() => {
    lastRemoved = null;
    $('toast').classList.add('hidden');
  }, 5000);
}
