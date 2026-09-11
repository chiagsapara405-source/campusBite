# CampusBite — Codebase Context

## Purpose and current phase

CampusBite is a static, frontend-only college cafeteria ordering prototype. It currently covers:

1. Marketing landing page
2. Login and account-registration prototypes
3. Interactive menu browsing and a persistent local cart

There is no backend, authentication, database, API client, build step, or package manifest. Treat all account flows and cafeteria status as mock UI behavior.

## Stack and conventions

- HTML5 files are opened directly or served by any static server.
- Tailwind CSS is loaded from its CDN on every page. Each page defines its custom Tailwind theme before the CDN script.
- JavaScript is vanilla browser JavaScript in `js/`.
- Fonts: **Bricolage Grotesque** for headings and **Nunito Sans** for body copy.
- Brand tokens: `cream` = `#FFF7ED`, `ink` = `#201A15`, primary orange = Tailwind orange-600.
- UI style: cream surfaces, orange primary actions, dark ink text/surfaces, rounded cards, soft orange shadows, visible focus states.
- Remote Unsplash food images are intentional. Existing files in `assets/` are not wired into the current UI.
- Do not introduce React, a framework, Bootstrap, jQuery, or a backend unless a later requirement explicitly changes the architecture.

## Routes and files

| Route | File | Purpose |
| --- | --- | --- |
| `/` | `index.html` + `js/script.js` | Marketing landing page |
| `/login.html` | `login.html` + `js/login.js` | Prototype student sign-in |
| `/register.html` | `register.html` + `js/register.js` | Prototype account creation |
| `/menu.html` | `menu.html` + `js/menu.js` | Menu browsing, filters, modal, and cart |
| `/cart.html` | Not implemented | Reserved Phase 4 cart destination |
| `/orders.html` | Not implemented | Reserved future orders destination |
| `/profile.html` | Not implemented | Reserved future profile destination |

`CampusBite Login Page — Coding Prompt.md` and `CampusBite Phase 3 — Menu Page Implementation Prompt.md` are historical implementation briefs. `Walkthrough.md` documents the original landing-page verification.

## Page behavior

### Landing page

`index.html` is the marketing page. It is the only page that loads GSAP and ScrollTrigger.

`js/script.js` owns mobile navigation, smooth anchor scrolling, scroll header styling, hero/scroll animations, and its toast. It deliberately permits `login.html`, `register.html`, and `menu.html` to navigate normally. Only `orders.html` remains intercepted as a Phase 2 placeholder.

Do not load `js/script.js` on login, register, or menu pages; its behavior and GSAP dependency are landing-page specific.

### Login and registration

Both are frontend prototypes only. They never save, send, or authenticate credentials.

- `js/login.js`: accepts a syntactically valid email and a password of at least six characters; then disables the button, shows a temporary success state, and redirects to `menu.html`.
- `js/register.js`: requires a full name (two or more characters), valid email, six-character password, and prototype acknowledgment checkbox; then redirects to `menu.html`.
- Password visibility buttons must retain their changing accessible labels: “Show password” / “Hide password”.
- Inline validation uses `aria-invalid`, `role="alert"`, and text errors; do not replace it with browser alerts.

### Menu page

`menu.html` is an application-like UI. It must remain independent of GSAP and contains only layout, semantic controls, and placeholders. `js/menu.js` owns all data and state.

Core behavior:

- `FOOD_ITEMS` is the single mock-food source of truth. It contains 16 objects with `id`, `name`, `category`, `description`, `price`, `rating`, `image`, `vegetarian`, `available`, and `ingredients`.
- Food cards are rendered dynamically. Do not hard-code menu items in HTML.
- Search matches name, description, and category. Category, availability, dietary, and sort controls combine.
- Cards open the detail modal; add buttons add directly. Unavailable food cannot be added.
- The modal supports quantity (minimum one), close button, Escape, and backdrop click.
- The temporary grid skeleton is intentional; it is replaced after a very short local-data delay.
- Header search and main search stay synchronized.

## Cart data contract

The menu cart is stored in browser local storage under:

```text
campusbite-cart-v1
```

Stored value:

```js
[
  { id: 1, name: 'Veg Cheese Burger', price: 80, quantity: 2 }
]
```

Rules to preserve:

- Adding an existing item increments `quantity`; never create duplicate lines.
- The header count is total quantity, not unique product count.
- The summary total is `price * quantity` summed across lines.
- Persist immediately after cart changes and load on page start.
- `removeFromCart(id)` exists for the future cart page, even though that page is not yet built.
- The summary is hidden for an empty cart; desktop uses a floating card and mobile uses an inset bottom bar.

## Future-route policy

The cart links point to `cart.html` as required for the next phase. Their `data-future` attribute is retained for styling/selection, but menu JavaScript deliberately lets those cart anchors navigate normally. Orders and Profile instead show a lightweight “This feature is coming soon” toast so users stay on the working menu page.

When implementing the cart page, reuse `campusbite-cart-v1`; do not rename, clear, or silently migrate the key without handling existing data.

## Accessibility and responsive requirements

- Keep semantic headings, associated labels, keyboard-operable buttons, and visible `focus-visible` states.
- Keep the menu modal accessible with `role="dialog"`, `aria-modal`, close control, and Escape/backdrop support.
- Preserve `prefers-reduced-motion` styles on login, registration, and menu pages.
- Menu grid: one column on narrow mobile, two on tablet, up to four on wide screens. Category controls scroll horizontally on mobile.
- The menu header turns into logo + cart + hamburger on mobile.

## Safe next steps

The natural next phase is `cart.html`: render the existing local cart, support quantity changes/removal/clear cart, and preserve the exact storage key and count/total semantics. Do not add checkout, real orders, authentication, or a backend until separately planned.

## Verification checklist

- Run `node --check js/script.js`, `node --check js/login.js`, `node --check js/register.js`, and `node --check js/menu.js` after JavaScript changes.
- Test valid and invalid login/registration fields.
- Test menu search, each filter/sort, empty state reset, unavailable food, modal quantity, duplicate add behavior, and local-storage persistence after refresh.
- Test desktop and narrow mobile navigation/layouts, keyboard modal closing, and browser console output.
