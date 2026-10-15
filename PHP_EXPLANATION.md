# CampusBite — Comprehensive PHP Files & Backend Logic Reference

This document provides a complete, in-depth explanation of every PHP file in **CampusBite**, covering architectural roles, execution lifecycle, database interactions, session & authentication mechanisms, security implementations, and user workflows.

---

## 1. System Architecture & Foundation

CampusBite is structured as a native PHP & MySQL application running under standard LAMP/WAMP/XAMPP environments.
- **Root Directory:** Contains public marketing, student authentication, menu exploration, cart management, checkout transaction, order tracking, and student profile pages.
- **Admin Directory (`/admin`):** Contains the restricted administrator portal for cafeteria operations, kitchen order queues, menu item CRUD, student records, and cafeteria settings.
- **Database Engine:** MySQL with `InnoDB`, utf8mb4 encoding, strict foreign key constraints, and prepared statements on all parameterized queries.

```
                    +------------------------------------------+
                    |                 db.php                   |
                    |  (Singleton MySQLi Connection Factory)   |
                    +--------------------+---------------------+
                                         |
         +-------------------------------+-------------------------------+
         |                                                               |
         v                                                               v
+------------------------------------+          +------------------------------------+
|        Student-Facing Portal       |          |         Admin Portal (/admin)      |
|                                    |          |                                    |
| - index.php (Landing)              |          | - admin-common.php (Auth & Guard)  |
| - login.php (Auth & Role Router)   |          | - admin-actions.php (API Handlers) |
| - register.php (Student Signup)    |          | - admin-dashboard.php (KPIs & Feed)|
| - logout.php (Session Destroyer)   |          | - admin-orders.php (Kitchen Queue) |
| - menu.php (Catalog & Filters)     |          | - admin-order-details.php (Manage) |
| - cart.php (Validation & Pricing)  |          | - admin-menu.php (Food Item CRUD)  |
| - checkout.php (ACID Transaction)  |          | - admin-students.php (Directory)   |
| - order-confirmation.php (Receipt) |          | - admin-settings.php (Cafeteria)   |
| - orders.php (Order History)       |          +------------------------------------+
| - order-details.php (Detail/Cancel)|
| - profile.php (Student Profile)    |
+------------------------------------+
```

---

## 2. Shared Core Infrastructure

### 2.1 `db.php`
- **Location:** `db.php`
- **Purpose:** Centralized, shared MySQL database connection factory.
- **Key Logic & Implementation:**
  - `declare(strict_types=1);` enforces strict type checking.
  - Exposes the global function `db(): mysqli`.
  - Implements a **memoized singleton pattern** (`static $conn = null;`), ensuring only one database connection is opened per HTTP request lifecycle, minimizing connection overhead.
  - Configures strict error reporting (`MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT`) so SQL errors immediately raise catchable `mysqli_sql_exception` instances.
  - Sets connection charset to `utf8mb4` for full Unicode and emoji compatibility.
  - Captures failed connections, logs diagnostic details to PHP's `error_log`, sends an HTTP 500 status code, and halts script execution with a sanitized customer-facing error message without leaking sensitive server credentials.

---

## 3. Student-Facing Application Files

### 3.1 `index.php`
- **Location:** `index.php`
- **Purpose:** Marketing landing page and entrance portal for students and faculty.
- **Key Logic & Implementation:**
  - Loads dynamic cafeteria status (`Open` / `Closed`) and featured menu items.
  - Delivers GSAP & ScrollTrigger scroll animations, interactive cards, and responsive navigation.
  - Detects if an active user session exists (`$_SESSION['user_id']`) to render dynamic navigation headers (swapping "Sign In" with "My Orders" and "Profile").

---

### 3.2 `login.php`
- **Location:** `login.php`
- **Purpose:** Student and Administrator authentication gateway.
- **Key Logic & Implementation:**
  - Initializes session (`session_start()`).
  - **GET Handling:** Renders the login form. If redirected from registration (`?registered=1`), displays a confirmation banner.
  - **POST Handling:**
    - Sanitizes input: trims and lowercases email address; checks minimum password length (6 characters).
    - Queries `users` using a prepared statement:
      ```sql
      SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1
      ```
    - Authenticates password against bcrypt hash using `password_verify($password, $user['password_hash'])`.
    - **Security:** Upon successful authentication, invokes `session_regenerate_id(true)` to prevent **Session Fixation attacks**.
    - Sets session variables: `$_SESSION['user_id']`, `$_SESSION['user_name']`, `$_SESSION['user_email']`, and `$_SESSION['role']`.
    - **Role-based Redirection:** If `role === 'admin'`, redirects to `admin/admin-dashboard.php`; otherwise, redirects students to `menu.php`.

---

### 3.3 `register.php`
- **Location:** `register.php`
- **Purpose:** Self-service student registration.
- **Key Logic & Implementation:**
  - Validates input: Full name (>= 2 chars), valid college email syntax, password (>= 6 chars), and mandatory terms confirmation.
  - Queries `users` for duplicate email collision before attempting insert.
  - Uses native `password_hash($password, PASSWORD_DEFAULT)` to compute secure bcrypt hashes.
  - Inserts new student record with explicit role `'student'`:
    ```sql
    INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'student')
    ```
  - Traps `mysqli_sql_exception` error code `1062` (Duplicate Key violation) gracefully if a concurrent registration race occurs.
  - Upon success, redirects to `login.php?registered=1`.

---

### 3.4 `logout.php`
- **Location:** `logout.php`
- **Purpose:** Secure session termination and state cleanup.
- **Key Logic & Implementation:**
  - Starts or retrieves the active session.
  - Clears the `$_SESSION` superglobal array (`$_SESSION = [];`).
  - Checks if session cookies are used and expires the session cookie on the client browser (`setcookie(session_name(), '', time() - 42000, ...)`).
  - Destroys server-side session data via `session_destroy()`.
  - Redirects user back to `index.php`.

---

### 3.5 `menu.php`
- **Location:** `menu.php`
- **Purpose:** Live food item browsing, dietary filtering, search, and cart staging.
- **Key Logic & Implementation:**
  - Queries active food catalog directly from MySQL:
    ```sql
    SELECT id, name, description, category, price, image, vegetarian, available 
    FROM foods ORDER BY id
    ```
  - Formats fetched rows into strongly typed PHP arrays (casting IDs to `int`, prices to `float`, and flags to `bool`).
  - Serializes items into a sanitized JSON string (`$foodsJson`) using flags:
    `JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_INVALID_UTF8_SUBSTITUTE`
    to prevent XSS when embedding directly into client-side JavaScript.
  - Client-side script handles instant category switching (`Burgers`, `Meals`, `Snacks`, `Drinks`), vegetarian toggles, search debouncing, detail modal generation, and pushes selected items to `localStorage` key `campusbite-cart-v1`.

---

### 3.6 `cart.php`
- **Location:** `cart.php`
- **Purpose:** Cart inspection, quantity adjustments, item removal, and promotional discount verification.
- **Key Logic & Implementation:**
  - Queries active menu items from MySQL and embeds catalog metadata in JavaScript to cross-verify client-side prices.
  - Reads `campusbite-cart-v1` from browser `localStorage`.
  - Calculates line item totals, subtotal, 5% GST tax calculation, and evaluates coupon codes (`CAMPUS10`, `FIRSTBITE`).
  - If cart items are out of stock in the database, displays warning indicators.
  - Features an "Undo" banner for accidentally deleted cart lines.
  - Passes validated cart data forward to `checkout.php`.

---

### 3.7 `checkout.php`
- **Location:** `checkout.php`
- **Purpose:** Secure order finalization, parameter validation, and atomic database transaction.
- **Key Logic & Implementation:**
  - **Authentication Guard:** Verifies `!empty($_SESSION['user_id'])`, redirecting unauthenticated users to `login.php`.
  - **Anti-CSRF & Double-Submission Guard:** Generates a cryptographically random session token (`$_SESSION['checkout_token']`) and validates submitted POST tokens with `hash_equals()`.
  - **Server-Side Validation:**
    - Validates name (2-100 chars), student ID, email, phone format (`regex /^[0-9+() -]{7,30}$/`), pickup location (`Main Cafeteria` vs `Food Court`), scheduled pickup time slot (`ASAP`, `In 10 minutes`, etc.), payment method (`Pay at Counter`), and special instructions (<= 2000 chars).
    - Unpacks `$_POST['cartData']` JSON array.
  - **ACID Transaction Execution:**
    1. Begins database transaction: `$connection->begin_transaction()`.
    2. Prepares pessimistic row lock on ordered items:
       ```sql
       SELECT name, image, price, available FROM foods WHERE id = ? LIMIT 1 FOR UPDATE
       ```
    3. Iterates through items, confirms availability (`available == 1`), reads current verified price from MySQL, and calculates subtotal in integer cents to avoid floating-point rounding inaccuracies.
    4. Generates unique order number with collision checking:
       `CB-YYYYMMDDHHIISS-XXXXXX`.
    5. Inserts primary record into `orders`:
       ```sql
       INSERT INTO orders (order_number, user_id, customer_name, student_id, customer_email, customer_phone, pickup_location, pickup_time, special_instructions, payment_method, subtotal, fee, total, status) VALUES (...)
       ```
    6. Inserts itemized rows into `order_items`:
       ```sql
       INSERT INTO order_items (order_id, food_id, food_name, food_image, quantity, unit_price, item_total) VALUES (...)
       ```
    7. Commits transaction: `$connection->commit()`.
    8. Refreshes checkout token and redirects client to `order-confirmation.php?order=` with the created order number.
    9. On any error or availability change, invokes `$connection->rollback()`.

---

### 3.8 `order-confirmation.php`
- **Location:** `order-confirmation.php`
- **Purpose:** Post-order success screen, pickup token generation, and digital receipt.
- **Key Logic & Implementation:**
  - **Authorization & Ownership Check:** Enforces login and checks that `order_number` belongs to the logged-in user:
    ```sql
    SELECT * FROM orders WHERE order_number = ? AND user_id = ? LIMIT 1
    ```
  - Joins and retrieves item details from `order_items`.
  - Formats pickup location, estimated prep time, and digital counter pickup token.
  - Renders order summary and provides direct links to live order tracking (`orders.php`) or the menu.

---

### 3.9 `orders.php`
- **Location:** `orders.php`
- **Purpose:** Student order history list and live order tracking dashboard.
- **Key Logic & Implementation:**
  - **User-Scoped Querying:** Strictly isolates queries by `user_id = ?`:
    1. Fetches itemized lines:
       ```sql
       SELECT oi.order_id, oi.food_id, oi.food_name, oi.food_image, oi.quantity, oi.unit_price, oi.item_total 
       FROM order_items oi 
       INNER JOIN orders o ON o.id = oi.order_id 
       WHERE o.user_id = ? ORDER BY oi.id
       ```
    2. Fetches order records:
       ```sql
       SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC
       ```
  - Maps items to orders by `order_id`.
  - Visual status badge for each stage: `Pending`, `Preparing`, `Ready`, `Completed`, `Cancelled`.
  - Provides instant "View Details" navigation and "Reorder" capability (re-populating the cart).

---

### 3.10 `order-details.php`
- **Location:** `order-details.php`
- **Purpose:** In-depth single order inspection, printable invoice, and self-service cancellation.
- **Key Logic & Implementation:**
  - Validates `user_id` ownership of the requested `id` (`order_number`).
  - **Order Cancellation:**
    - Supports POST action `action=cancel` guarded with CSRF token `$_SESSION['order_action_token']`.
    - Restricts cancellation strictly to orders in `Pending` state:
      ```sql
      UPDATE orders SET status = 'Cancelled' 
      WHERE order_number = ? AND user_id = ? AND status = 'Pending'
      ```
    - Prevents students from cancelling orders that the kitchen has already started `Preparing` or marked `Ready`.
  - Renders printable receipt layout, breakdown of GST/convenience fees, customer contact info, and kitchen notes.

---

### 3.11 `profile.php`
- **Location:** `profile.php`
- **Purpose:** Student profile management, default counter preferences, and contact settings.
- **Key Logic & Implementation:**
  - Verifies user authentication.
  - Queries `users` and left joins `profiles`:
    ```sql
    SELECT u.name, u.email, p.student_id, p.phone, p.course, p.pickup_location, p.dietary_preference 
    FROM users u LEFT JOIN profiles p ON p.user_id = u.id WHERE u.id = ? LIMIT 1
    ```
  - **Profile Updates (POST):**
    - Validates CSRF token `$_SESSION['profile_token']`.
    - Validates name, student ID, phone format, and allowable pickup locations/dietary preferences.
    - Updates `users` table for `name`.
    - Executes `INSERT ... ON DUPLICATE KEY UPDATE` on `profiles` to update student ID, phone, course, and defaults.
    - Updates `$_SESSION['user_name']` to keep session state in sync across headers.

---

## 4. Administrator Portal Files (`/admin`)

### 4.1 `admin/admin-common.php`
- **Location:** `admin/admin-common.php`
- **Purpose:** Centralized access control, authorization gate, and shared admin data queries.
- **Key Logic & Implementation:**
  - Starts session if not already initialized.
  - Includes `../db.php`.
  - **Strict Admin Guard:**
    ```php
    if (empty($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        header('Location: ../login.php');
        exit;
    }
    ```
    Guarantees that non-admin students or unauthenticated guests cannot load any admin script.
  - Initializes `$_SESSION['admin_token']` for CSRF verification across admin POST requests.
  - Exposes helper functions:
    - `adminEscape($value)`: Safe UTF-8 HTML escaping.
    - `getAdminOrders()`: Queries all cafeteria orders and associated `order_items` ordered by `created_at DESC`.
    - `getAdminOrder($orderNumber)`: Queries single order details by order number.

---

### 4.2 `admin/admin-actions.php`
- **Location:** `admin/admin-actions.php`
- **Purpose:** JSON REST endpoint for asynchronous administrative operations.
- **Key Logic & Implementation:**
  - Requires `admin-common.php`.
  - Validates HTTP method (`POST` only) and enforces CSRF verification via `$_POST['token']` against `$_SESSION['admin_token']`.
  - Dispatches actions via `switch`/`if` block:
    1. **`save_food`**: Adds new menu item or updates existing item (`INSERT` / `UPDATE foods`). Validates name, description, category, positive price, valid image URL, and flags.
    2. **`toggle_food`**: Toggles item availability (`UPDATE foods SET available = NOT available WHERE id = ?`).
    3. **`delete_food`**: Deletes item (`DELETE FROM foods WHERE id = ?`).
    4. **`update_order`**: Validates status transitions through a strict state machine:
       - `Pending` &rarr; `Preparing` or `Cancelled`
       - `Preparing` &rarr; `Ready`
       - `Ready` &rarr; `Completed`
       - Prevents invalid jumps or alterations to completed orders.
    5. **`save_settings`**: Updates cafeteria name, pickup counter names, and operating status (`Open` / `Closed`).
  - Returns structured JSON responses: `{"success": true|false, "message": "..."}`.

---

### 4.3 `admin/admin-dashboard.php`
- **Location:** `admin/admin-dashboard.php`
- **Purpose:** Operational metrics overview, sales KPIs, and recent order stream.
- **Key Logic & Implementation:**
  - Requires `admin-common.php`.
  - Fetches order records and calculates:
    - **Today's Revenue:** Sum of `total` for non-cancelled orders created today.
    - **Total Orders Placed & Pending Count:** Real-time queue volume.
    - **Items Sold:** Quantity breakdown across order lines.
    - **Popular Dishes:** Aggregated frequency of items ordered.
  - Displays quick status update triggers allowing staff to advance orders from the dashboard view.

---

### 4.4 `admin/admin-orders.php`
- **Location:** `admin/admin-orders.php`
- **Purpose:** Kitchen display system (KDS) and full order fulfillment board.
- **Key Logic & Implementation:**
  - Requires `admin-common.php`.
  - Loads complete order history with nested items.
  - Interactive filter tabs: `All`, `Pending`, `Preparing`, `Ready`, `Completed`, `Cancelled`.
  - Real-time client-side search by Order ID, Token Number, or Student Name.
  - Provides 1-click status advance buttons connected via AJAX to `admin-actions.php`.

---

### 4.5 `admin/admin-order-details.php`
- **Location:** `admin/admin-order-details.php`
- **Purpose:** Single order management, fulfillment audit, and kitchen print view.
- **Key Logic & Implementation:**
  - Reads `$_GET['id']` and queries order through `getAdminOrder()`.
  - Displays complete customer information (name, email, phone, student ID), special kitchen instructions, scheduled time slot, and payment status.
  - Offers full status transition selector and printable kitchen slip view.

---

### 4.6 `admin/admin-menu.php`
- **Location:** `admin/admin-menu.php`
- **Purpose:** Food catalog management, pricing controls, and real-time inventory toggling.
- **Key Logic & Implementation:**
  - Queries all food items from `foods`.
  - Lists items with category tags, pricing, and availability switches.
  - Contains Add / Edit Food modal form connected to `admin-actions.php?action=save_food`.
  - In-place instant availability toggle switch (`toggle_food`) without requiring a page reload.

---

### 4.7 `admin/admin-students.php`
- **Location:** `admin/admin-students.php`
- **Purpose:** Student customer directory, contact records, and campus meal preferences.
- **Key Logic & Implementation:**
  - Requires `admin-common.php`.
  - Queries student accounts:
    ```sql
    SELECT users.id, users.name, users.email, users.created_at, 
           profiles.student_id, profiles.phone, profiles.course, 
           profiles.pickup_location, profiles.dietary_preference 
    FROM users 
    LEFT JOIN profiles ON profiles.user_id = users.id 
    WHERE users.role = 'student' 
    ORDER BY users.name ASC
    ```
  - Displays searchable directory of enrolled students and their cafeteria order history.

---

### 4.8 `admin/admin-settings.php`
- **Location:** `admin/admin-settings.php`
- **Purpose:** Cafeteria operating configurations and pickup station management.
- **Key Logic & Implementation:**
  - Reads cafeteria configuration from `cafeteria_settings` table (ID 1).
  - Allows toggling the global cafeteria status (`Open` vs `Closed`).
  - Sets pickup counter descriptions and operating schedules.
  - Submits changes to `admin-actions.php?action=save_settings`.

---

## 5. Summary of Security & Resilience Practices

1. **Prepared Statements Everywhere:** All SQL queries involving dynamic inputs use parameter binding (`$stmt->bind_param(...)`), preventing SQL injection.
2. **Session Security:**
   - Password hashing with bcrypt (`PASSWORD_DEFAULT`).
   - Session fixation mitigation via `session_regenerate_id(true)`.
   - Strict role-based isolation via `admin-common.php`.
3. **Double-Submission & CSRF Protection:**
   - Token-based verification (`checkout_token`, `admin_token`, `order_action_token`) evaluated using timing-attack resistant `hash_equals()`.
4. **Data Integrity & Concurrency:**
   - ACID database transactions with row-level locks (`FOR UPDATE`) in `checkout.php` prevent out-of-stock race conditions and price discrepancies.
   - Financial totals computed in integer cents.
5. **Output Sanitization:**
   - All HTML output is sanitized through `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')`.
   - JSON data embedded into frontend scripts uses `JSON_HEX_*` bitmasks to neutralize script injection risks.
