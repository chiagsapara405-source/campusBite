# CampusBite — Complete System Architecture & Documentation

## 1. Overview & Vision
**CampusBite** is a modern, responsive, client-side web application and prototype designed for college cafeterias. It streamlines the food ordering experience for students and gives cafeteria administrators an intuitive portal to manage food items, live orders, customer records, and cafeteria operations.

The system runs completely in the browser without requiring a backend server or database setup. It achieves full functionality and state persistence through modern browser **`localStorage`**, custom utility functions, and responsive UI components powered by **Tailwind CSS**.

---

## 2. Technical Stack & Design System

### 2.1 Technologies
- **Markup & Styling:** HTML5, Tailwind CSS (via CDN with pre-configured inline design tokens).
- **Icons & Visuals:** Lucide Icons (CDN) / inline SVGs and high-resolution Unsplash food photography.
- **Animations:** GSAP 3.x & ScrollTrigger (used exclusively on the marketing landing page).
- **Scripting:** Vanilla JavaScript (ES6+), zero external runtime frameworks (no React, Vue, or jQuery).
- **Data Persistence:** Browser `localStorage` for menu catalog, cart items, order histories, and cafeteria settings.

### 2.2 Design Language & Theme
- **Color Palette:**
  - `cream`: `#FFF7ED` (Warm, approachable background tone)
  - `ink`: `#201A15` (Deep dark slate/charcoal for text and high-contrast elements)
  - `primary`: Tailwind `orange-600` (`#EA580C`) (Action buttons, badges, highlights)
  - `surface`: Pure white `#FFFFFF` or softened amber cards
- **Typography:**
  - Headings: **Bricolage Grotesque** (Playful, energetic typography)
  - Body & UI: **Nunito Sans** (Clear, readable modern sans-serif)
- **Accessibility:** Semantic HTML5 elements, ARIA dialog roles, accessible focus outlines (`focus-visible`), and responsive layouts accommodating mobile, tablet, and desktop viewports.

---

## 3. Architecture & Data Flow

```
+-----------------------------------------------------------------------------------+
|                                BROWSER STORAGE                                    |
|                                                                                   |
|  [campusbite_foods]       [campusbite-cart-v1]     [campusbite_orders]            |
|  - Custom menu items      - Active cart items       - History of placed orders    |
|  - Pricing & availability - Quantities & modifiers - Status, tokens, timestamps   |
+--------------------------+-------------------------+------------------------------+
                           ^                         ^
                           | (Read / Write)          | (Creates / Updates)
                           v                         v
+----------------------------------------------------+------------------------------+
|                            STUDENT-FACING PORTAL                                  |
|                                                                                   |
|  1. Landing Page (index.html)     -> Marketing, cafeteria features, CTA           |
|  2. Auth (login.html / register)  -> Client-validated mock authentication         |
|  3. Menu (menu.html)              -> Search, category filters, food details modal |
|  4. Cart (cart.html)              -> Quantity adjustments, coupon discounts       |
|  5. Checkout (checkout.html)      -> Pickup counter, time slot, payment selector  |
|  6. Confirmation (order-conf.)    -> Live pickup token & receipt summary          |
|  7. Orders (orders.html)          -> Active & past order tracker with timeline    |
|  8. Order Details (order-det.)    -> Detailed breakdown, itemized bill, re-order  |
+-----------------------------------------------------------------------------------+
                                                     ^
                                                     | (Live Status Sync)
                                                     v
+----------------------------------------------------+------------------------------+
|                              ADMINISTRATOR PORTAL                                 |
|                                                                                   |
|  1. Dashboard (admin-dashboard)   -> Sales KPIs, popular items, order backlog     |
|  2. Orders (admin-orders)         -> Live board (Pending -> Preparing -> Ready)   |
|  3. Order Detail (admin-order-det)-> Detailed order fulfillment & status controls |
|  4. Menu Management (admin-menu)  -> Add/Edit food items, toggle stock, pricing   |
|  5. Students (admin-students)     -> Student directory, spend analytics           |
|  6. Settings (admin-settings)     -> Counter slots, cafeteria open/close status   |
+-----------------------------------------------------------------------------------+
```

---

## 4. Key Storage Schemas (`localStorage`)

### 4.1 Cart (`campusbite-cart-v1`)
Contains an array of selected food objects with user quantities:
```json
[
  {
    "id": 1,
    "name": "Veg Cheese Burger",
    "price": 80,
    "quantity": 2
  }
]
```
*Rule:* If an item already exists in the cart, the quantity is incremented rather than creating a duplicate row.

### 4.2 Food Menu Catalog (`campusbite_foods`)
Contains the active master menu items. If empty, the application auto-populates from the default 16-item catalog.
```json
[
  {
    "id": 1,
    "name": "Veg Cheese Burger",
    "category": "Burgers",
    "description": "Crispy veg patty, cheese and fresh salad.",
    "price": 80,
    "rating": 4.5,
    "vegetarian": true,
    "available": true,
    "image": "https://images.unsplash.com/...",
    "ingredients": "Fresh vegetables, herbs, spices and house sauce."
  }
]
```

### 4.3 Orders (`campusbite_orders` & `campusbite_latest_order`)
Stores user order records created at checkout:
```json
[
  {
    "id": "CB-8942",
    "token": "A-14",
    "items": [
      { "id": 1, "name": "Veg Cheese Burger", "price": 80, "quantity": 2 }
    ],
    "subtotal": 160,
    "tax": 8,
    "discount": 0,
    "total": 168,
    "counter": "Counter 2 (Snacks & Quick Bites)",
    "pickupTime": "12:45 PM",
    "paymentMethod": "UPI",
    "status": "Pending",
    "placedAt": "2026-09-11T13:15:00.000Z",
    "customer": {
      "name": "Alex Smith",
      "phone": "9876543210",
      "email": "alex@campus.edu"
    }
  }
]
```

---

## 5. Detailed Page Breakdown & User Flows

### 5.1 Student Experience

#### 1. Marketing Landing Page (`index.html` & `js/script.js`)
- **Purpose:** Welcomes students, highlights daily specials, explains the 3-step ordering process, features customer testimonials, and displays campus cafeteria hours.
- **Key Features:**
  - GSAP & ScrollTrigger scroll animations.
  - Sticky navigation bar with mobile slide-out drawer.
  - Live cafeteria open/close status indicator.
  - Quick action links directing students straight to the menu.

#### 2. Authentication Prototypes (`login.html`, `register.html` & `js/login.js`, `js/register.js`)
- **Purpose:** Student registration and sign-in interface.
- **Key Features:**
  - Dynamic client-side form validation (email format, minimum password length, terms checkbox).
  - Show / Hide password toggle with accessible ARIA announcements.
  - Seamless redirection to `menu.html` upon validation.

#### 3. Interactive Menu Page (`menu.html` & `js/menu.js`)
- **Purpose:** The core discovery and ordering interface.
- **Key Features:**
  - **Live Filter & Search:** Real-time search across item names, descriptions, and ingredients; category pill tabs (`All`, `Burgers`, `Pizza`, `Meals`, `Drinks`, etc.); vegetarian-only toggle.
  - **Sorting:** By price (low to high, high to low) and customer ratings.
  - **Item Detail Modal:** Clickable food cards reveal ingredient lists, descriptions, and custom quantity selectors before adding to cart.
  - **Stock Checks:** Out-of-stock items display an "Unavailable" badge and disable addition controls.
  - **Floating Cart Indicator:** Summarizes total quantity and total cost with quick jump to `cart.html`.

#### 4. Cart Page (`cart.html` & `js/cart.js`)
- **Purpose:** Order review and modification before purchasing.
- **Key Features:**
  - Inline quantity increment/decrement (`+` / `-`) and item removal.
  - Undo banner when an item is removed.
  - Promo code / Coupon verification (e.g., `CAMPUS10`, `FIRSTBITE`).
  - Itemized pricing breakdown: Subtotal, Taxes (5% GST), Discounts, and Final Payable Amount.
  - "Empty Cart" placeholder state with direct link back to menu.

#### 5. Checkout Flow (`checkout.html` & `js/checkout.js`)
- **Purpose:** Finalizing order parameters and simulated payment.
- **Key Features:**
  - **Pickup Counter Selection:** Choose specific campus pickup stations (e.g., Counter 1 - Meals, Counter 2 - Fast Food).
  - **Time Slot Selector:** Schedule pickup for "As soon as possible" or select upcoming 15-minute intervals.
  - **Payment Options:** Support for simulated UPI (Google Pay, PhonePe, Paytm QR), Campus Meal Card, and Cash on Pickup.
  - **Order Creation:** Generates a unique Order ID (`CB-XXXX`), pickup token (e.g., `B-08`), persists the record to `campusbite_orders`, clears the active cart, and redirects to confirmation.

#### 6. Order Confirmation & Tracking (`order-confirmation.html`, `orders.html`, `order-details.html`)
- **Purpose:** Real-time feedback and order lifecycle visibility.
- **Key Features:**
  - **Confirmation Screen:** Highlights pickup token, pickup counter, and QR code for scanning at the counter.
  - **Live Timeline:** Visual progression tracking: `Order Placed` -> `Preparing` -> `Ready for Pickup` -> `Completed`.
  - **Orders List:** Displays historical orders with current statuses, timestamps, and quick "Reorder" action.
  - **Order Details:** Printable invoice and detailed item breakdown.

---

### 5.2 Administrator Experience (`/admin`)

#### 1. Admin Dashboard (`admin/admin-dashboard.html` & `admin-dashboard.js`)
- **Purpose:** Central command center for cafeteria supervisors.
- **Key Features:**
  - Summary metrics: Today's Revenue, Total Orders Placed, Pending Orders, and Items Sold.
  - Quick order status overview chart/distribution.
  - Top-selling food items breakdown.
  - Recent orders feed with instant status change triggers.

#### 2. Order Management Board (`admin/admin-orders.html` & `admin-orders.js`)
- **Purpose:** Kitchen display and order queue processing.
- **Key Features:**
  - Filter orders by status (`All`, `Pending`, `Preparing`, `Ready`, `Completed`, `Cancelled`).
  - Action buttons to advance orders through kitchen stages.
  - Search by Order ID, Token Number, or Student Name.

#### 3. Menu Item Management (`admin/admin-menu.html` & `admin-menu.js`)
- **Purpose:** Full CRUD operations on cafeteria food offerings.
- **Key Features:**
  - Add new menu items with image URLs, categories, descriptions, and pricing.
  - Toggle live stock availability (instantly reflects on student menu).
  - Edit or delete items directly from the catalog.

#### 4. Cafeteria Settings & Student Directory (`admin-settings.html`, `admin-students.html`)
- **Purpose:** Operational controls and student spending insights.
- **Key Features:**
  - Toggle cafeteria operational status (Open / Closed).
  - Configure pickup counters, tax rates, and maximum concurrent orders.
  - Student database tracking order frequency and favorite dishes.

---

## 6. How to Run & Verify the Project

1. **Prerequisites:**
   - Any modern web browser (Chrome, Firefox, Safari, Edge).
   - Optional: A lightweight HTTP server such as VS Code Live Server or Python's `http.server`:
     ```bash
     python -m http.server 8000
     ```
2. **Direct Browser Execution:**
   - You can also open [`index.html`](file:///d:/campusBite/index.html) directly via file URI in any browser.
3. **Resetting Prototype Data:**
   - To restore fresh default data, open your browser's Developer Tools (`F12`), navigate to **Application > Local Storage**, and clear keys or run `localStorage.clear()` in the Console.

