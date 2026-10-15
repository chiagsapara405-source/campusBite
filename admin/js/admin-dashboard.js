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

let orders = [];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const $     = id => document.getElementById(id);
const money = n  => `₹${n}`;

// ─── Bootstrap ───────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  bindEvents();
  renderSummaryCards();
  renderRecentOrders();
  renderStatusOverview();
  renderPopularItems();
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

  toggle.onclick = openSidebar;
  close.onclick  = closeSidebar;
  overlay.onclick = closeSidebar;

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !sidebar.classList.contains('hidden') && window.innerWidth < 1024) {
      closeSidebar();
    }
  });
}

// ─── Data ────────────────────────────────────────────────────────────────────

function loadOrders() {
  orders = Array.isArray(window.CAMPUSBITE_ADMIN_ORDERS) ? window.CAMPUSBITE_ADMIN_ORDERS : [];
}

// ─── Summary Cards ───────────────────────────────────────────────────────────

function renderSummaryCards() {
  const now       = new Date();
  const todayStr  = now.toDateString();

  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === todayStr);
  const pending     = orders.filter(o => o.status === 'Pending');
  const ready       = orders.filter(o => o.status === 'Ready');
  const completedToday = todayOrders.filter(o => o.status === 'Completed');
  const revenue     = completedToday.reduce((sum, o) => sum + (o.total || 0), 0);

  const cards = [
    {
      label: "Today's Orders",
      value: todayOrders.length,
      sub:   todayOrders.length > 0 ? `${todayOrders.length} orders today` : 'No orders today',
      icon:  '📦',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Pending Orders',
      value: pending.length,
      sub:   pending.length > 0 ? 'Need attention' : 'All caught up',
      icon:  '⏳',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      label: 'Ready for Pickup',
      value: ready.length,
      sub:   ready.length > 0 ? 'Waiting for students' : 'No pickups waiting',
      icon:  '🎒',
      color: 'bg-green-50 text-green-700',
    },
    {
      label: "Today's Revenue",
      value: money(revenue),
      sub:   'From completed orders',
      icon:  '💰',
      color: 'bg-orange-50 text-orange-700',
    },
  ];

  $('summary-cards').innerHTML = cards.map(c => `
    <div class="card-hover rounded-2xl border border-orange-100 bg-white p-5 shadow-card">
      <div class="flex items-center gap-3">
        <span class="flex h-11 w-11 items-center justify-center rounded-xl ${c.color} text-xl">${c.icon}</span>
        <div>
          <p class="text-xs font-bold uppercase tracking-wide text-stone-400">${c.label}</p>
          <p class="font-display text-2xl font-extrabold text-ink">${c.value}</p>
        </div>
      </div>
      <p class="mt-2 text-xs font-bold text-stone-500">${c.sub}</p>
    </div>
  `).join('');
}

// ─── Recent Orders ───────────────────────────────────────────────────────────

function renderRecentOrders() {
  if (!orders.length) {
    $('recent-orders').innerHTML = `
      <div class="py-10 text-center">
        <div class="text-3xl">📋</div>
        <p class="mt-2 font-display text-lg font-bold text-ink">No order activity yet</p>
        <p class="mt-1 text-sm text-stone-500">Orders will appear here once students start ordering.</p>
      </div>
    `;
    return;
  }

  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  $('recent-orders').innerHTML = `
    <div class="divide-y divide-stone-100">
      ${recent.map(orderRow).join('')}
    </div>
  `;
}

function orderRow(order) {
  const status     = order.status || 'Pending';
  const badgeClass = STATUS_STYLES[status] || STATUS_STYLES.Pending;
  const badgeLabel = STATUS_LABELS[status] || status;
  const time       = formatTime(order.createdAt);
  const firstItem  = order.items[0] ? `${order.items[0].quantity} × ${escapeHtml(order.items[0].name)}` : '';
  const moreCount  = order.items.length - 1;
  const moreLabel  = moreCount > 0 ? `, <span class="text-stone-400">+${moreCount} more</span>` : '';

  return `
    <div class="flex items-center justify-between gap-3 py-3">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <span class="text-sm font-extrabold text-ink">#${escapeHtml(order.orderId)}</span>
          <span class="rounded-full px-2 py-0.5 text-xs font-extrabold ${badgeClass}">${badgeLabel}</span>
        </div>
        <p class="mt-0.5 truncate text-xs text-stone-500">
          ${escapeHtml(order.customer?.name || 'Unknown')} · ${firstItem}${moreLabel}
        </p>
      </div>
      <div class="flex shrink-0 items-center gap-3">
        <div class="text-right">
          <p class="text-sm font-extrabold text-ink">${money(order.total)}</p>
          <p class="text-xs text-stone-400">${time}</p>
        </div>
        <a href="admin-order-details.php?id=${encodeURIComponent(order.orderId)}"
           class="focus-ring rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-orange-700">
          View
        </a>
      </div>
    </div>
  `;
}

// ─── Status Overview ─────────────────────────────────────────────────────────

function renderStatusOverview() {
  const statuses = ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'];

  const counts = {};
  statuses.forEach(s => {
    counts[s] = orders.filter(o => o.status === s).length;
  });

  $('status-overview').innerHTML = statuses.map(s => {
    const badgeClass = STATUS_STYLES[s];
    const label      = STATUS_LABELS[s];
    const count      = counts[s];

    return `
      <div class="flex items-center justify-between">
        <span class="rounded-full px-2.5 py-1 text-xs font-extrabold ${badgeClass}">${label}</span>
        <span class="font-display text-lg font-extrabold text-ink">${count}</span>
      </div>
    `;
  }).join('');
}

// ─── Popular Items ───────────────────────────────────────────────────────────

function renderPopularItems() {
  const itemCounts = {};

  orders.forEach(o => {
    if (o.status === 'Cancelled') return;
    o.items.forEach(item => {
      if (!item.name) return;
      if (!itemCounts[item.name]) itemCounts[item.name] = 0;
      itemCounts[item.name] += item.quantity || 1;
    });
  });

  const sorted = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (!sorted.length) {
    $('popular-items').innerHTML = `
      <p class="py-6 text-center text-sm text-stone-500">No data yet.</p>
    `;
    return;
  }

  const maxCount = sorted[0][1];

  $('popular-items').innerHTML = `
    <div class="space-y-3">
      ${sorted.map(([name, count], i) => `
        <div>
          <div class="flex items-center justify-between text-sm">
            <span class="font-bold text-ink">${escapeHtml(name)}</span>
            <span class="font-extrabold text-orange-600">${count} orders</span>
          </div>
          <div class="mt-1 h-2 overflow-hidden rounded-full bg-orange-50">
            <div class="h-full rounded-full bg-orange-400" style="width:${Math.round(count / maxCount * 100)}%"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ─── Formatting ──────────────────────────────────────────────────────────────

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
    });
  } catch {
    return '—';
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
