// ─── Constants ───────────────────────────────────────────────────────────────

const FOODS_KEY = 'campusbite_foods';

const DEFAULT_FOODS = [
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
  id:          i + 1,
  name:        x[0],
  category:    x[1],
  description: x[2],
  price:       x[3],
  rating:      x[4],
  vegetarian:  x[5],
  available:   x[6],
  image:       `https://images.unsplash.com/photo-${x[7]}?auto=format&fit=crop&w=700&q=80`,
  ingredients: x[5]
    ? 'Fresh vegetables, herbs, spices and house sauce.'
    : 'Fresh ingredients, herbs, spices and house sauce.',
}));

const FILTERS = ['All', 'Available', 'Unavailable', 'Vegetarian', 'Non-Vegetarian'];

let foods        = [];
let activeFilter = 'All';
let searchTerm   = '';
let sortOrder    = 'recommended';
let editingId    = null;
let deletingId   = null;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const $     = id => document.getElementById(id);
const money = n  => `₹${n}`;

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadFoods();
  bindEvents();
  renderFilters();
  renderFoodList();
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

  $('add-item-btn').onclick = () => openModal();

  $('food-search').addEventListener('input', e => {
    searchTerm = e.target.value.trim().toLowerCase();
    renderFoodList();
  });

  $('food-sort').addEventListener('change', e => {
    sortOrder = e.target.value;
    renderFoodList();
  });

  // Food modal
  $('modal-close').onclick  = closeModal;
  $('modal-cancel').onclick = closeModal;
  $('food-modal').addEventListener('click', e => {
    if (e.target === $('food-modal')) closeModal();
  });

  $('food-form').addEventListener('submit', handleFormSubmit);

  // Delete modal
  $('delete-cancel').onclick  = closeDeleteModal;
  $('delete-confirm').onclick = confirmDelete;
  $('delete-modal').addEventListener('click', e => {
    if (e.target === $('delete-modal')) closeDeleteModal();
  });

  // Food list delegation
  $('food-list').addEventListener('click', handleListClick);

  // Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('delete-modal').classList.contains('hidden')) {
        closeDeleteModal();
      } else if (!$('food-modal').classList.contains('hidden')) {
        closeModal();
      } else if (!sidebar.classList.contains('hidden') && window.innerWidth < 1024) {
        closeSidebar();
      }
    }
  });
}

// ─── Data ────────────────────────────────────────────────────────────────────

function loadFoods() {
  foods = Array.isArray(window.CAMPUSBITE_ADMIN_FOODS) ? window.CAMPUSBITE_ADMIN_FOODS : [];
}

async function saveFood(data) {
  const body = new URLSearchParams({
    action: 'save_food',
    token: window.CAMPUSBITE_ADMIN_TOKEN,
    id: data.id || '',
    name: data.name,
    description: data.description,
    category: data.category,
    price: data.price,
    image: data.image,
    vegetarian: data.vegetarian ? '1' : '0',
    available: data.available ? '1' : '0',
  });
  const response = await fetch('admin-actions.php', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  return response.json();
}

async function changeFood(action, id) {
  const body = new URLSearchParams({ action, token: window.CAMPUSBITE_ADMIN_TOKEN, id: String(id) });
  const response = await fetch('admin-actions.php', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  return response.json();
}

function nextId() {
  return foods.length ? Math.max(...foods.map(f => f.id)) + 1 : 1;
}

// ─── Filtering, Searching, Sorting ──────────────────────────────────────────

function filterFoods() {
  let list = [...foods];

  switch (activeFilter) {
    case 'Available':     list = list.filter(f => f.available); break;
    case 'Unavailable':   list = list.filter(f => !f.available); break;
    case 'Vegetarian':    list = list.filter(f => f.vegetarian); break;
    case 'Non-Vegetarian': list = list.filter(f => !f.vegetarian); break;
  }

  if (searchTerm) {
    list = list.filter(f =>
      `${f.name} ${f.description} ${f.category}`.toLowerCase().includes(searchTerm)
    );
  }

  return list.sort((a, b) => {
    switch (sortOrder) {
      case 'price-low':  return a.price - b.price;
      case 'price-high': return b.price - a.price;
      case 'name-asc':   return a.name.localeCompare(b.name);
      case 'name-desc':  return b.name.localeCompare(a.name);
      default:           return a.id - b.id;
    }
  });
}

// ─── Rendering ───────────────────────────────────────────────────────────────

function renderFilters() {
  $('filter-tabs').innerHTML = FILTERS.map(f => `
    <button data-filter="${f}" role="tab"
            aria-selected="${f === activeFilter}"
            class="focus-ring rounded-full px-4 py-2 text-sm font-extrabold
              ${f === activeFilter
                ? 'bg-orange-600 text-white'
                : 'bg-white text-stone-600 hover:bg-orange-50'}">
      ${f}
    </button>
  `).join('');

  $('filter-tabs').onclick = e => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    renderFilters();
    renderFoodList();
  };
}

function renderFoodList() {
  const list = filterFoods();
  $('result-count').textContent = `${list.length} item${list.length === 1 ? '' : 's'}`;

  const container = $('food-list');
  container.classList.add('fading');

  requestAnimationFrame(() => {
    if (!list.length) {
      container.innerHTML = '';
      $('empty-state').innerHTML = `
        <div class="mx-auto max-w-md rounded-3xl border border-dashed border-orange-200 bg-white px-8 py-16 text-center shadow-card">
          <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-4xl">🍽️</div>
          <h2 class="mt-6 font-display text-2xl font-extrabold text-ink">No food items found</h2>
          <p class="mt-3 text-stone-500">Try changing your search or filters.</p>
          <button data-reset-filters
                  class="focus-ring mt-4 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-orange-700">
            Clear Filters
          </button>
        </div>
      `;
      $('empty-state').querySelector('[data-reset-filters]')?.addEventListener('click', resetFilters);
    } else {
      $('empty-state').innerHTML = '';
      container.innerHTML = list.map(foodCard).join('');
    }
    requestAnimationFrame(() => container.classList.remove('fading'));
  });
}

function foodCard(f) {
  const dietLabel = f.vegetarian ? '● Vegetarian' : '● Non-veg';
  const dietClass = f.vegetarian ? 'text-green-700' : 'text-red-700';
  const availBadge = f.available
    ? `<span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-extrabold text-green-800">Available</span>`
    : `<span class="rounded-full bg-red-100 px-2 py-0.5 text-xs font-extrabold text-red-700">Unavailable</span>`;

  return `
    <article class="card-hover rounded-2xl border border-orange-100 bg-white shadow-card">
      <div class="relative h-40 overflow-hidden rounded-t-2xl bg-orange-100">
        ${f.image
          ? `<img src="${f.image}" alt="${escapeHtml(f.name)}" class="h-full w-full object-cover" loading="lazy">`
          : `<div class="flex h-full w-full items-center justify-center text-3xl text-orange-300">🍽️</div>`}
        <span class="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-extrabold ${dietClass}">${dietLabel}</span>
      </div>
      <div class="p-4">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-display text-lg font-bold text-ink">${escapeHtml(f.name)}</h3>
        </div>
        <p class="mt-1 text-xs text-stone-500">${escapeHtml(f.category)}</p>
        <p class="mt-1 text-sm font-extrabold text-ink">${money(f.price)}</p>
        <div class="mt-2">${availBadge}</div>
        <div class="mt-3 flex flex-wrap gap-2">
          <button data-edit="${f.id}"
                  class="focus-ring rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-extrabold text-orange-700 hover:bg-orange-100">
            Edit
          </button>
          <button data-toggle="${f.id}"
                  class="focus-ring rounded-lg px-3 py-1.5 text-xs font-extrabold
                    ${f.available
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'}">
            ${f.available ? 'Disable' : 'Enable'}
          </button>
          <button data-delete="${f.id}"
                  class="focus-ring rounded-lg bg-red-50 px-3 py-1.5 text-xs font-extrabold text-red-600 hover:bg-red-100">
            Delete
          </button>
        </div>
      </div>
    </article>
  `;
}

// ─── List Click Delegation ───────────────────────────────────────────────────

function handleListClick(e) {
  const editBtn   = e.target.closest('[data-edit]');
  const toggleBtn = e.target.closest('[data-toggle]');
  const deleteBtn = e.target.closest('[data-delete]');

  if (editBtn)   openModal(+editBtn.dataset.edit);
  if (toggleBtn) toggleAvailability(+toggleBtn.dataset.toggle);
  if (deleteBtn) openDeleteModal(+deleteBtn.dataset.delete);
}

// ─── Modal ───────────────────────────────────────────────────────────────────

function openModal(id) {
  editingId = id || null;
  const form = $('food-form');
  form.reset();
  clearAllErrors();

  if (editingId) {
    const f = foods.find(x => x.id === editingId);
    if (!f) return;
    $('modal-title').textContent = 'Edit Food Item';
    $('edit-id').value       = f.id;
    $('field-name').value    = f.name;
    $('field-desc').value    = f.description;
    $('field-category').value = f.category;
    $('field-price').value   = f.price;
    $('field-image').value   = f.image || '';
    $('field-vegetarian').checked = f.vegetarian;
    $('field-available').checked  = f.available;
  } else {
    $('modal-title').textContent = 'Add Food Item';
    $('edit-id').value = '';
    $('field-vegetarian').checked = true;
    $('field-available').checked  = true;
  }

  $('food-modal').classList.remove('hidden');
  $('food-modal').classList.add('flex');
  requestAnimationFrame(() => $('food-modal').classList.add('open'));
  $('field-name').focus();
}

function closeModal() {
  $('food-modal').classList.remove('open');
  setTimeout(() => {
    $('food-modal').classList.add('hidden');
    $('food-modal').classList.remove('flex');
  }, 200);
  editingId = null;
}

// ─── Form Validation & Submit ───────────────────────────────────────────────

async function handleFormSubmit(e) {
  e.preventDefault();
  clearAllErrors();

  const name        = $('field-name').value.trim();
  const description = $('field-desc').value.trim();
  const category    = $('field-category').value;
  const price       = parseFloat($('field-price').value);
  const image       = $('field-image').value.trim();
  const vegetarian  = $('field-vegetarian').checked;
  const available   = $('field-available').checked;

  let valid = true;

  if (!name) {
    showFieldError('field-name', 'Food name is required.');
    valid = false;
  }
  if (!description) {
    showFieldError('field-desc', 'Description is required.');
    valid = false;
  }
  if (!category) {
    showFieldError('field-category', 'Category is required.');
    valid = false;
  }
  if (isNaN(price) || price <= 0) {
    showFieldError('field-price', 'Price must be greater than 0.');
    valid = false;
  }
  if (!valid) return;

  try {
    const result = await saveFood({ id: editingId, name, description, category, price, image, vegetarian, available });
    if (!result.success) { showToast(result.message); return; }
    const savedFood = { id: Number(result.id), name, description, category, price, image, vegetarian, available, rating: 0, ingredients: '' };
    if (editingId) {
      const index = foods.findIndex(food => food.id === editingId);
      if (index !== -1) foods[index] = savedFood;
    } else {
      foods.push(savedFood);
    }
    closeModal();
    renderFoodList();
    showToast('Food item saved successfully.');
  } catch {
    showToast('Food item could not be saved.');
  }
}

function showFieldError(fieldId, msg) {
  const field = $(fieldId);
  const errEl = field.parentElement.querySelector('.field-error-msg');
  field.classList.add('field-error');
  if (errEl) {
    errEl.textContent = msg;
    errEl.classList.remove('hidden');
  }
}

function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
  document.querySelectorAll('.field-error-msg').forEach(el => {
    el.textContent = '';
    el.classList.add('hidden');
  });
}

// ─── Availability Toggle ────────────────────────────────────────────────────

async function toggleAvailability(id) {
  const f = foods.find(x => x.id === id);
  if (!f) return;
  try {
    const result = await changeFood('toggle_food', id);
    if (!result.success) { showToast(result.message); return; }
    f.available = !f.available;
    renderFoodList();
    showToast(`${f.name} is now ${f.available ? 'available' : 'unavailable'}.`);
  } catch {
    showToast('Availability could not be updated.');
  }
}

// ─── Delete ──────────────────────────────────────────────────────────────────

function openDeleteModal(id) {
  deletingId = id;
  const f = foods.find(x => x.id === id);
  if (!f) return;
  $('delete-modal-msg').textContent = `Are you sure you want to remove "${f.name}" from the menu?`;
  $('delete-modal').classList.remove('hidden');
  $('delete-modal').classList.add('flex');
  requestAnimationFrame(() => $('delete-modal').classList.add('open'));
  $('delete-cancel').focus();
}

function closeDeleteModal() {
  $('delete-modal').classList.remove('open');
  setTimeout(() => {
    $('delete-modal').classList.add('hidden');
    $('delete-modal').classList.remove('flex');
  }, 200);
  deletingId = null;
}

async function confirmDelete() {
  if (!deletingId) return;
  const f = foods.find(x => x.id === deletingId);
  try {
    const result = await changeFood('delete_food', deletingId);
    if (!result.success) { showToast(result.message); return; }
    foods = foods.filter(x => x.id !== deletingId);
    closeDeleteModal();
    renderFoodList();
    showToast(`${f?.name || 'Item'} deleted.`);
  } catch {
    showToast('Food item could not be deleted.');
  }
}

// ─── Reset Filters ──────────────────────────────────────────────────────────

function resetFilters() {
  activeFilter = 'All';
  searchTerm   = '';
  sortOrder    = 'recommended';
  $('food-search').value = '';
  $('food-sort').value   = 'recommended';
  renderFilters();
  renderFoodList();
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
