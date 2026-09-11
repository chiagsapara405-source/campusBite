// ─── Constants ───────────────────────────────────────────────────────────────

const ORDERS_KEY = 'campusbite_orders';

const FILTERS = ['All', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

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

const NEXT_STATUS = {
  Pending:   ['Preparing', 'Cancelled'],
  Preparing: ['Ready'],
  Ready:     ['Completed'],
  Completed: [],
  Cancelled: [],
};

let orders       = [];
let activeFilter = 'All';
let searchTerm   = '';
let sortOrder    = 'newest';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const $     = id => document.getElementById(id);
const money = n  => `₹${n}`;

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  bindEvents();
  render();
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
    if (e.key === 'Escape' && !sidebar.classList.contains('hidden') && window.innerWidth < 1024) {
      closeSidebar();
    }
  });

  $('order-search').addEventListener('input', e => {
    searchTerm = e.target.value.trim().toLowerCase();
    render();
  });

  $('order-sort').addEventListener('change', e => {
    sortOrder = e.target.value;
    render();
  });

  $('orders-list').addEventListener('click', handleStatusUpdate);
}

// ─── Data ────────────────────────────────────────────────────────────────────

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

// ─── Filtering, Searching, Sorting ──────────────────────────────────────────

function filterOrders() {
  if (activeFilter === 'All') return [...orders];
  return orders.filter(o => o.status === activeFilter);
}

function searchOrders(list) {
  if (!searchTerm) return list;
  return list.filter(o => {
    const idMatch   = o.orderId.toLowerCase().includes(searchTerm);
    const nameMatch = o.customer?.name?.toLowerCase().includes(searchTerm);
    const itemMatch = o.items.some(i => i.name && i.name.toLowerCase().includes(searchTerm));
    return idMatch || nameMatch || itemMatch;
  });
}

function sortOrders(list) {
  return list.sort((a, b) => {
    switch (sortOrder) {
      case 'oldest':  return new Date(a.createdAt) - new Date(b.createdAt);
      case 'highest': return b.total - a.total;
      case 'lowest':  return a.total - b.total;
      default:        return new Date(b.createdAt) - new Date(a.createdAt);
    }
  });
}

// ─── Counts ──────────────────────────────────────────────────────────────────

function getCounts() {
  const counts = { All: orders.length };
  FILTERS.slice(1).forEach(f => {
    counts[f] = orders.filter(o => o.status === f).length;
  });
  return counts;
}

// ─── Rendering ───────────────────────────────────────────────────────────────

function render() {
  const counts = getCounts();

  if (!orders.length) {
    showEmptyState();
    return;
  }

  $('controls-section').classList.remove('hidden');
  $('empty-state').innerHTML = '';
  renderFilterTabs(counts);

  const filtered = filterOrders();
  const searched = searchOrders(filtered);
  const sorted   = sortOrders(searched);

  if (!sorted.length) {
    showEmptyFilterState();
    return;
  }

  renderOrders(sorted);
}

function renderFilterTabs(counts) {
  $('filter-tabs').innerHTML = FILTERS.map(f => `
    <button data-filter="${f}" role="tab"
            aria-selected="${f === activeFilter}"
            class="focus-ring rounded-full px-4 py-2 text-sm font-extrabold
              ${f === activeFilter
                ? 'bg-orange-600 text-white'
                : 'bg-white text-stone-600 hover:bg-orange-50'}">
      ${f} <span class="ml-1 ${f === activeFilter ? 'text-white/70' : 'text-stone-400'}">${counts[f] || 0}</span>
    </button>
  `).join('');

  $('filter-tabs').onclick = e => {
    const btn = e.target.closest('[data-filter]');
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    render();
  };
}

function renderOrders(list) {
  const container = $('orders-list');
  container.classList.add('fading');
  requestAnimationFrame(() => {
    container.innerHTML = list.map(orderCard).join('');
    requestAnimationFrame(() => container.classList.remove('fading'));
  });
}

function orderCard(order) {
  const status      = order.status || 'Pending';
  const badgeClass  = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  const badgeLabel  = STATUS_LABELS[status] || status;
  const dateStr     = formatOrderDate(order.createdAt);
  const itemSummary = order.items.slice(0, 2).map(i => `${i.quantity} × ${escapeHtml(i.name)}`).join(', ');
  const moreCount   = order.items.length - 2;
  const moreLabel   = moreCount > 0 ? `, <span class="text-stone-400">+${moreCount} more</span>` : '';
  const nextOptions = NEXT_STATUS[status] || [];

  const statusActions = nextOptions.length
    ? `<div class="mt-3 flex flex-wrap items-center gap-2">
         <label class="sr-only" for="status-${order.orderId}">Update status</label>
         <select id="status-${order.orderId}" data-update-id="${order.orderId}"
                 class="focus-ring rounded-lg border border-stone-200 bg-white px-2 py-1.5 text-xs font-bold">
           <option value="">Update Status</option>
           ${nextOptions.map(s => `<option value="${s}">${STATUS_LABELS[s]}</option>`).join('')}
         </select>
         <button data-apply-status="${order.orderId}"
                 class="focus-ring rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-orange-700">
           Apply
         </button>
       </div>`
    : '';

  return `
    <article class="card-hover rounded-2xl border border-orange-100 bg-white p-5 shadow-card sm:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="font-display text-lg font-extrabold text-ink">#${escapeHtml(order.orderId)}</h2>
            <span class="rounded-full px-2.5 py-0.5 text-xs font-extrabold ${badgeClass}">${badgeLabel}</span>
          </div>
          <p class="mt-1 text-sm text-stone-500">
            ${escapeHtml(order.customer?.name || 'Unknown')} · ${dateStr}
          </p>
          <p class="mt-1 text-sm text-stone-600">${itemSummary}${moreLabel}</p>
          <p class="mt-1 text-xs text-stone-400">
            ${escapeHtml(order.pickup?.location || '—')} · ${escapeHtml(order.pickup?.time || '—')}
          </p>
          ${statusActions}
        </div>
        <div class="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
          <p class="font-display text-xl font-extrabold text-ink">${money(order.total)}</p>
          <a href="admin-order-details.html?id=${encodeURIComponent(order.orderId)}"
             class="focus-ring rounded-xl bg-orange-600 px-4 py-2 text-sm font-extrabold text-white hover:bg-orange-700">
            View
          </a>
        </div>
      </div>
    </article>
  `;
}

// ─── Status Update ───────────────────────────────────────────────────────────

function handleStatusUpdate(e) {
  const btn = e.target.closest('[data-apply-status]');
  if (!btn) return;

  const orderId   = btn.dataset.applyStatus;
  const select    = document.querySelector(`[data-update-id="${orderId}"]`);
  const newStatus = select?.value;

  if (!newStatus) {
    showToast('Select a status first.');
    return;
  }

  const order = orders.find(o => o.orderId === orderId);
  if (!order) return;

  order.status = newStatus;
  saveOrders();
  render();
  showToast(`Order #${orderId} updated to ${STATUS_LABELS[newStatus]}.`);
}

// ─── Empty States ────────────────────────────────────────────────────────────

function showEmptyState() {
  $('controls-section').classList.add('hidden');
  $('orders-list').innerHTML = '';
  $('empty-state').innerHTML = `
    <div class="mx-auto max-w-md rounded-3xl border border-dashed border-orange-200 bg-white px-8 py-16 text-center shadow-card">
      <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-4xl">📋</div>
      <h2 class="mt-6 font-display text-2xl font-extrabold text-ink">No orders yet</h2>
      <p class="mt-3 text-stone-500">Orders will appear here once students start ordering from the menu.</p>
    </div>
  `;
}

function showEmptyFilterState() {
  $('orders-list').innerHTML = `
    <div class="mx-auto max-w-md rounded-3xl border border-dashed border-orange-200 bg-white px-8 py-12 text-center">
      <h3 class="font-display text-xl font-extrabold text-ink">No orders found</h3>
      <p class="mt-2 text-stone-500">There are no orders matching your current filters.</p>
      <button data-reset-filter
              class="focus-ring mt-4 rounded-full bg-orange-600 px-5 py-2.5 text-sm font-extrabold text-white hover:bg-orange-700">
        View All Orders
      </button>
    </div>
  `;
  $('orders-list').querySelector('[data-reset-filter]').onclick = () => {
    activeFilter = 'All';
    searchTerm   = '';
    $('order-search').value = '';
    render();
  };
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
