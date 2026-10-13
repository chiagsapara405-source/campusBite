// ─── Data ────────────────────────────────────────────────────────────────────

let FOOD_ITEMS = Array.isArray(window.CAMPUSBITE_FOODS) ? window.CAMPUSBITE_FOODS : [];

const CATEGORIES = ['All', ...new Set(FOOD_ITEMS.map(food => food.category).filter(Boolean))];
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

document.addEventListener('DOMContentLoaded', () => {
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
      if (x.matches('a[href="cart.php"]')) return;
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
      case 'name':       return a.name.localeCompare(b.name);
      default:           return a.id - b.id;
    }
  });
}

// ─── Rendering ───────────────────────────────────────────────────────────────

function renderCategories() {
  $('categories').innerHTML = CATEGORIES.map(c => `
    <button
      data-category="${escapeHtml(c)}"
      class="focus-ring shrink-0 rounded-full px-4 py-2 text-sm font-extrabold
             ${c === state.category
               ? 'bg-orange-600 text-white'
               : 'bg-orange-50 text-orange-800 hover:bg-orange-100'}"
    >${escapeHtml(c)}</button>
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
    $('menu-error').classList.toggle('hidden', !window.CAMPUSBITE_MENU_ERROR);

    grid.innerHTML = a.length
      ? a.map(card).join('')
      : `<div class="col-span-full rounded-3xl border border-dashed border-orange-200 bg-white px-6 py-16 text-center">
           <div class="text-4xl">🍽️</div>
           <h3 class="mt-4 font-display text-2xl font-bold">${FOOD_ITEMS.length ? 'No food found' : 'The menu is empty right now'}</h3>
           <p class="mt-2 text-stone-500">${FOOD_ITEMS.length ? 'Try another search or choose a different category.' : 'Please check back soon for today&#39;s food options.'}</p>
           ${FOOD_ITEMS.length ? '<button data-reset class="focus-ring mt-5 rounded-full bg-orange-600 px-5 py-3 text-sm font-extrabold text-white">Clear Filters</button>' : ''}
         </div>`;

    grid.querySelector('[data-reset]')?.addEventListener('click', resetFilters);

    requestAnimationFrame(() => grid.classList.remove('fading'));
  });
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[character];
  });
}

function safeImage(value) {
  var image = String(value || '').trim();
  return /^(https?:\/\/|\/)/i.test(image) ? escapeHtml(image) : '';
}

function card(f) {
  const name = escapeHtml(f.name);
  const description = escapeHtml(f.description);
  const category = escapeHtml(f.category);
  const image = safeImage(f.image);
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
          ${image ? `<img class="food-image h-full w-full object-cover" src="${image}" alt="${name}" loading="lazy">` : '<div class="h-full w-full"></div>'}
          <span class="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1
                       text-xs font-extrabold ${dietClass}">${dietLabel}</span>
          ${unavailBadge}
        </div>
      </button>
      <div class="flex min-h-[190px] flex-col p-4">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-display text-lg font-bold text-ink">${name}</h3>
          <span class="shrink-0 text-sm font-bold text-stone-500">${category}</span>
        </div>
        <p class="mt-1 text-sm leading-relaxed text-stone-500">${description}</p>
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
  if (!f) return;
  state.quantity = 1;
  const name = escapeHtml(f.name);
  const description = escapeHtml(f.description);
  const category = escapeHtml(f.category);
  const image = safeImage(f.image);

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
      ${image ? `<img src="${image}" alt="${name}" class="h-64 w-full object-cover sm:h-full">` : '<div class="h-64 bg-orange-100 sm:h-full"></div>'}
      <div class="p-6">
        <span class="text-sm font-extrabold ${dietClass}">${dietLabel}</span>
        <h2 id="modal-title" class="mt-2 font-display text-3xl font-extrabold">${name}</h2>
        <p class="mt-3 text-stone-500">${description}</p>
        <p class="mt-3 text-sm text-stone-600"><b>Category:</b> ${category}</p>
        <div class="mt-4 flex gap-4 text-sm font-bold">
          <span>★ ${category}</span>
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

  document.querySelector('a[href="cart.php"]')
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
