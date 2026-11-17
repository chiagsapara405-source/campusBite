# CampusBite — Codebase Context

## Project overview

CampusBite is a college cafeteria food-ordering application built with PHP and MySQL. It provides a student-facing ordering experience and a role-restricted administrator portal.

The application runs locally through an Apache/PHP/MySQL environment such as XAMPP.

### Main capabilities

**Student portal**
- Landing page and cafeteria information
- Student registration and login
- Database-backed food menu
- Cart management and checkout
- Order confirmation and order history
- Individual order details and cancellation
- Student profile and preferences

**Admin portal**
- Restricted administrator login
- Dashboard and order overview
- Kitchen order queue and status management
- Food item management
- Student directory
- Cafeteria settings

Treat these as implemented application areas, but verify the corresponding PHP files before assuming every individual workflow is complete.

## Technology stack

- **Backend:** Native PHP
- **Database:** MySQL
- **Database access:** MySQLi with prepared statements for parameterized queries
- **Frontend:** HTML5, Tailwind CSS CDN, vanilla JavaScript
- **Local environment:** XAMPP (Apache and MySQL)
- **Package tooling:** Node.js package manifest exists, but its current `test` script is a placeholder rather than a real test suite.

Do not introduce React, Laravel, another backend framework, or a new database layer without an explicit requirement.

## Project architecture

The repository is organized around three main areas:

1. Root-level PHP files implement the student-facing application.
2. `admin/` contains administrator pages and administrative actions.
3. `database/` contains SQL setup files.

### Shared database connection

`db.php` provides the shared `db(): mysqli` connection function.

Important conventions:
- Use the shared connection instead of creating separate connections in individual pages.
- Use prepared statements for queries containing user-controlled values.
- Preserve the `utf8mb4` connection charset.
- Never expose database credentials or raw database errors to users.

The current local XAMPP configuration uses:
- Host: `127.0.0.1`
- Database: `campusbite`
- Username: `root`
- Password: empty

These are local development defaults, not production credentials.

## Student-facing routes

| Route | File | Purpose |
|---|---|---|
| `/` | `index.php` | Landing page |
| `/login.php` | `login.php` | Student/admin sign-in |
| `/register.php` | `register.php` | Student registration |
| `/logout.php` | `logout.php` | Session logout |
| `/menu.php` | `menu.php` | Database-backed food menu |
| `/cart.php` | `cart.php` | Cart review and quantity management |
| `/checkout.php` | `checkout.php` | Order submission |
| `/order-confirmation.php` | `order-confirmation.php` | Order receipt |
| `/orders.php` | `orders.php` | Student order history |
| `/order-details.php` | `order-details.php` | Individual order details |
| `/profile.php` | `profile.php` | Student profile management |

The landing page currently uses an HTML document served through `index.php`. Do not assume every `.php` file contains server-side logic.

## Administrator portal

Administrator pages live under `admin/`.

| Route | File | Purpose |
|---|---|---|
| `/admin/admin-dashboard.php` | `admin/admin-dashboard.php` | Admin overview and KPIs |
| `/admin/admin-orders.php` | `admin/admin-orders.php` | Kitchen order queue |
| `/admin/admin-order-details.php` | `admin/admin-order-details.php` | Individual order management |
| `/admin/admin-menu.php` | `admin/admin-menu.php` | Food catalog management |
| `/admin/admin-students.php` | `admin/admin-students.php` | Student directory |
| `/admin/admin-settings.php` | `admin/admin-settings.php` | Cafeteria configuration |
| `/admin/admin-common.php` | `admin/admin-common.php` | Shared admin authentication and helpers |
| `/admin/admin-actions.php` | `admin/admin-actions.php` | Administrative POST/AJAX actions |

Admin pages must preserve role-based access restrictions. Students and unauthenticated visitors must not be allowed to perform administrative operations.

## Database structure and setup status

The application currently references these database tables:

- `users` — accounts, password hashes and user roles
- `foods` — food catalog and availability
- `orders` — order records and customer/pickup information
- `order_items` — individual items belonging to orders
- `profiles` — student profile and preference information
- `cafeteria_settings` — cafeteria configuration

### Important SQL setup limitation

`database/schema.sql` currently creates the `users` table and inserts a demo administrator account. It does **not** create all the other tables referenced by the application.

Do not assume importing this one file creates a complete working database.

Before changing database setup:
1. Inspect the SQL files currently present in `database/`.
2. Compare table definitions with the queries in the PHP pages.
3. Keep column names, types, foreign keys and constraints consistent.
4. Document any missing migrations or setup scripts accurately.

The SQL file contains a demo administrator seed. Treat demo credentials as development-only and replace them before any real deployment.

## Authentication and application conventions

- Use PHP sessions for authenticated user state.
- Store password hashes, never plaintext passwords.
- Preserve role checks for administrator-only pages and actions.
- Keep student queries scoped to the authenticated user's ID.
- Use prepared statements for database operations involving dynamic input.
- Escape untrusted values before rendering HTML.
- Validate important checkout and profile fields on the server, not only in JavaScript.
- Preserve CSRF protections and ownership checks on state-changing operations.
- Keep order totals and food availability authoritative on the server.

Do not weaken authentication, authorization, or validation to make a UI flow work.

## Frontend conventions

- Preserve the existing cream, orange and dark-ink visual identity.
- Existing typography uses Bricolage Grotesque for headings and Nunito Sans for body text.
- Tailwind CSS is loaded through its CDN.
- JavaScript remains vanilla JavaScript unless a separate architectural decision is approved.
- Maintain responsive layouts, semantic HTML, keyboard accessibility and visible focus states.
- Respect `prefers-reduced-motion` when adding animations.

Avoid duplicating business logic between JavaScript and PHP. The server must remain authoritative for database-backed operations.

## Local development with XAMPP

1. Install and start Apache and MySQL in XAMPP.
2. Place the repository inside the XAMPP `htdocs` directory.
3. Create a MySQL database named `campusbite`.
4. Import `database/schema.sql` through phpMyAdmin or the MySQL CLI.
5. Inspect the remaining required tables and apply their corresponding SQL setup scripts, if available.
6. Confirm the database connection settings in `db.php`.
7. Open the application through the local Apache server, for example:

   `http://localhost/campusBite/`

Do not open PHP pages directly through the filesystem or a static file server.

If a page reports a database error, inspect the missing table/column and the corresponding SQL setup before changing application logic.

## Package scripts and verification

The repository has a `package.json`, but its current `test` script is only a placeholder.

Do not claim that `npm test` verifies the application.

For JavaScript changes, run syntax checks on the relevant files. For PHP changes, use PHP linting where PHP CLI is available:

```bash
php -l db.php
php -l login.php
php -l register.php
php -l checkout.php
```

Also test affected workflows manually in XAMPP.

Useful manual checks:
- Registration and login
- Student/admin role separation
- Menu loading and availability
- Cart quantity and removal
- Checkout validation and order creation
- Order history and order ownership
- Pending-order cancellation rules
- Admin order status changes
- Food management
- Profile updates
- Responsive layout and browser console errors

## Safe development guidelines

- Inspect the existing implementation before modifying a feature.
- Prefer small, focused changes over broad rewrites.
- Keep PHP, SQL and frontend behavior consistent.
- Do not assume a feature is complete just because a page exists.
- Do not invent database tables, routes, credentials or environment variables.
- Update this document when the architecture, routes or setup process actually change.
