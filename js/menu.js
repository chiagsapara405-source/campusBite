// ─── Data ────────────────────────────────────────────────────────────────────

let FOOD_ITEMS = [];

const FOODS_KEY  = 'campusbite_foods';
const CATEGORIES = ['All', 'Breakfast', 'Meals', 'Burgers', 'Pizza', 'Snacks', 'Drinks', 'Desserts'];
const CART_KEY   = 'campusbite-cart-v1';

const state = {
  search:       '',
  category:     'All',
  availability: 'all',
  diet:         'all',
  sort:         'recommended',
  cart:         [],
  quantity:     1,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const $     = id => document.getElementById(id);
const money = n  => `₹${n}`;

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

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadFoods();
  loadCart();
  bindEvents();
  renderCategories();
  setTimeout(renderFoodItems, 180);
});

// ─── Event Binding ───────────────────────────────────────────────────────────

function bindEvents() {
  // Sync both search inputs
  $('food-search').addEventListener('input', e => {
    state.search = e.target.value;
    $('header-search').value = state.search;
    $('clear-search').classList.toggle('hidden', !state.search);
    renderFoodItems();
  });

  $('header-search').addEventListener('input', e => {
    $('food-search').value = e.target.value;
    state.search = e.target.value;
    $('clear-search').classList.toggle('hidden', !state.search);
    renderFoodItems();
  });

  $('clear-search').onclick = resetSearch;

  // Filter & sort dropdowns
  [
    ['availability-filter', 'availability'],
    ['diet-filter',         'diet'],
    ['sort-filter',         'sort'],
  ].forEach(([id, key]) => {
    $(id).addEventListener('change', e => {
      state[key] = e.target.value;
      renderFoodItems();
    });
  });

  // Food grid delegation
  $('food-grid').addEventListener('click', gridClick);

  // Mobile nav toggle
  $('menu-toggle').onclick = () => {
    const open = $('mobile-nav').classList.toggle('hidden');
    $('menu-toggle').setAttribute('aria-expanded', String(!open));
  };

  // "Coming soon" links
  document.querySelectorAll('[data-future]').forEach(x => {
    x.addEventListener('click', e => {
      if (x.matches('a[href="cart.html"]')) return;
      e.preventDefault();
      showToast('This feature is coming soon.');
    });
  });

  // Modal backdrop & keyboard close
  $('modal').addEventListener('click', e => {
    if (e.target === $('modal')) closeModal();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
}

// ─── Filtering & Sorting ─────────────────────────────────────────────────────

function items() {
  const query = state.search.toLowerCase();

  const filtered = FOOD_ITEMS.filter(f => {
    const matchesSearch =
      !state.search ||
      `${f.name} ${f.description} ${f.category}`.toLowerCase().includes(query);

    const matchesCategory =
      state.category === 'All' || f.category === state.category;

    const matchesAvailability =
      state.availability === 'all' ||
      (state.availability === 'available') === f.available;

    const matchesDiet =
      state.diet === 'all' || f.vegetarian;

    return matchesSearch && matchesCategory && matchesAvailability && matchesDiet;
  });

  return filtered.sort((a, b) => {
    switch (state.sort) {
      case 'price-low':  return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'rating':     return b.rating - a.rating;
      case 'name':       return a.name.localeCompare(b.name);
      default:           return a.id - b.id;
    }
  });
}

// ─── Rendering ───────────────────────────────────────────────────────────────

function renderCategories() {
  $('categories').innerHTML = CATEGORIES.map(c => `
    <button
      data-category="${c}"
      class="focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-extrabold
             ${c === state.category
               ? 'bg-orange-600 text-white'
               : 'bg-orange-50 text-orange-800 hover:bg-orange-100'}"
    >${c}</button>
  `).join('');

  $('categories').onclick = e => {
    if (e.target.dataset.category) {
      state.category = e.target.dataset.category;
      renderCategories();
      renderFoodItems();
    }
  };
}

function renderFoodItems() {
  const grid = $('food-grid');
  grid.classList.add('fading');

  requestAnimationFrame(() => {
    const a = items();

    $('result-count').textContent = `${a.length} item${a.length === 1 ? '' : 's'}`;

    grid.innerHTML = a.length
      ? a.map(card).join('')
      : `<div class="col-span-full rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center">
           <div class="text-4xl">🍽️</div>
           <h3 class="mt-4 font-display text-2xl font-bold">No food found</h3>
           <p class="mt-2 text-stone-500">Try another search or choose a different category.</p>
           <button data-reset class="focus-ring mt-5 rounded-full bg-orange-600 px-5 py-3 text-sm font-extrabold text-white">
             Clear Filters
           </button>
         </div>`;

    grid.querySelector('[data-reset]')?.addEventListener('click', resetFilters);

    requestAnimationFrame(() => grid.classList.remove('fading'));
  });
}

function card(f) {
  const dietLabel      = f.vegetarian ? '● Vegetarian' : '● Non-vegetarian';
  const dietClass      = f.vegetarian ? 'text-green-700' : 'text-red-700';
  const unavailBadge   = !f.available
    ? `<span class="absolute inset-x-3 bottom-3 rounded-full bg-ink/85 px-3 py-1.5
                    text-center text-xs font-bold text-white">Currently unavailable</span>`
    : '';
  const addBtnClass    = f.available
    ? 'bg-orange-600 text-white hover:bg-orange-700'
    : 'cursor-not-allowed bg-stone-100 text-stone-400';

  return `
    <article class="food-card group overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-card">
      <button data-detail="${f.id}" class="focus-ring block w-full text-left">
        <div class="relative h-44 overflow-hidden bg-orange-100">
          <img class="food-image h-full w-full object-cover"
               src="${f.image}" alt="${f.name}" loading="lazy">
          <span class="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1
                       text-xs font-extrabold ${dietClass}">${dietLabel}</span>
          ${unavailBadge}
        </div>
      </button>
      <div class="flex min-h-[190px] flex-col p-4">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-display text-lg font-bold text-ink">${f.name}</h3>
          <span class="shrink-0 text-sm font-bold text-orange-600">★ ${f.rating}</span>
        </div>
        <p class="mt-1 text-sm leading-relaxed text-stone-500">${f.description}</p>
        <div class="mt-auto flex items-center justify-between pt-4">
          <strong class="font-display text-xl text-ink">${money(f.price)}</strong>
          <button data-add="${f.id}" ${f.available ? '' : 'disabled'}
                  class="focus-ring rounded-full px-4 py-2 text-sm font-extrabold ${addBtnClass}">
            ${f.available ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </article>
  `;
}

// ─── Grid Click Delegation ───────────────────────────────────────────────────

function gridClick(e) {
  const add    = e.target.closest('[data-add]');
  const detail = e.target.closest('[data-detail]');

  if (add)    addToCart(+add.dataset.add, 1);
  if (detail) openModal(+detail.dataset.detail);
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function openModal(id) {
  const f = FOOD_ITEMS.find(x => x.id === id);
  state.quantity = 1;

  const dietLabel   = f.vegetarian ? '● Vegetarian' : '● Non-vegetarian';
  const dietClass   = f.vegetarian ? 'text-green-700' : 'text-red-700';
  const availClass  = f.available  ? 'text-green-700' : 'text-red-700';
  const availLabel  = f.available  ? 'Available' : 'Currently unavailable';
  const addBtnClass = f.available  ? 'bg-orange-600 text-white' : 'bg-stone-100 text-stone-400';

  $('modal-panel').innerHTML = `
    <div class="relative grid sm:grid-cols-2">
      <button data-close
              class="focus-ring absolute right-3 top-3 z-10 h-10 w-10
                     rounded-full bg-white font-bold shadow">×</button>
      <img src="${f.image}" alt="${f.name}" class="h-64 w-full object-cover sm:h-full">
      <div class="p-6">
        <span class="text-sm font-extrabold ${dietClass}">${dietLabel}</span>
        <h2 id="modal-title" class="mt-2 font-display text-3xl font-extrabold">${f.name}</h2>
        <p class="mt-3 text-stone-500">${f.description}</p>
        <p class="mt-3 text-sm text-stone-600"><b>Ingredients:</b> ${f.ingredients}</p>
        <div class="mt-4 flex gap-4 text-sm font-bold">
          <span>★ ${f.rating}</span>
          <span class="${availClass}">${availLabel}</span>
        </div>
        <p class="mt-5 font-display text-3xl font-extrabold text-orange-700">${money(f.price)}</p>
        <div class="mt-5 flex items-center justify-between gap-3">
          <div class="flex items-center rounded-xl border border-stone-200">
            <button data-minus class="focus-ring px-3 py-2 font-bold"
                    aria-label="Decrease quantity">−</button>
            <span id="modal-quantity" class="min-w-9 text-center font-bold">1</span>
            <button data-plus class="focus-ring px-3 py-2 font-bold"
                    aria-label="Increase quantity">+</button>
          </div>
          <button data-modal-add ${f.available ? '' : 'disabled'}
                  class="focus-ring rounded-xl px-4 py-3 text-sm font-extrabold ${addBtnClass}">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;

  $('modal').classList.remove('hidden');
  $('modal').classList.add('flex');
  $('modal-panel').querySelector('[data-close]').focus();

  $('modal-panel').onclick = e => {
    if (e.target.closest('[data-close]'))     closeModal();
    if (e.target.closest('[data-minus]'))     state.quantity = Math.max(1, state.quantity - 1);
    if (e.target.closest('[data-plus]'))      state.quantity++;

    $('modal-quantity').textContent = state.quantity;

    if (e.target.closest('[data-modal-add]')) {
      addToCart(f.id, state.quantity);
      closeModal();
    }
  };
}

function closeModal() {
  $('modal').classList.add('hidden');
  $('modal').classList.remove('flex');
}

// ─── Cart ────────────────────────────────────────────────────────────────────

function loadCart() {
  try {
    state.cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    state.cart = [];
  }
  updateCart();
}

function addToCart(id, q) {
  const f = FOOD_ITEMS.find(x => x.id === id);
  if (!f?.available) return;

  const line = state.cart.find(x => x.id === id);
  if (line) {
    line.quantity += q;
  } else {
    state.cart.push({ id: f.id, name: f.name, price: f.price, quantity: q });
  }

  localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  updateCart();
  showToast(`✓ ${f.name} added to cart`);
}

function removeFromCart(id) {
  state.cart = state.cart.filter(x => x.id !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(state.cart));
  updateCart();
}

function updateCart() {
  const n     = state.cart.reduce((a, x) => a + x.quantity, 0);
  const total = state.cart.reduce((a, x) => a + x.quantity * x.price, 0);

  $('cart-count').textContent    = n;
  $('summary-count').textContent = n;
  $('summary-total').textContent = money(total);
  $('cart-summary').classList.toggle('hidden', !n);

  document.querySelector('a[href="cart.html"]')
    .setAttribute('aria-label', `View cart, ${n} items`);
}

// ─── Toast ───────────────────────────────────────────────────────────────────

let timer;

function showToast(msg) {
  $('toast').textContent = msg;
  $('toast').classList.remove('hidden');
  clearTimeout(timer);
  timer = setTimeout(() => $('toast').classList.add('hidden'), 2800);
}

// ─── Reset Helpers ───────────────────────────────────────────────────────────

function resetSearch() {
  state.search = '';
  $('food-search').value   = '';
  $('header-search').value = '';
  $('clear-search').classList.add('hidden');
  renderFoodItems();
}

function resetFilters() {
  state.search       = '';
  state.category     = 'All';
  state.availability = 'all';
  state.diet         = 'all';
  state.sort         = 'recommended';

  $('food-search').value         = '';
  $('header-search').value       = '';
  $('clear-search').classList.add('hidden');
  $('availability-filter').value = 'all';
  $('diet-filter').value         = 'all';
  $('sort-filter').value         = 'recommended';

  renderCategories();
  renderFoodItems();
}
