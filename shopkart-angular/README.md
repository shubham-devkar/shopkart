# ShopKart Angular — Final Professional UI

Flipkart-inspired Angular 19 standalone storefront for the existing ShopKart Spring Boot product CRUD API.

## Run on Windows / IntelliJ

1. Keep the existing Spring Boot backend running on `http://localhost:8080`.
2. Open this folder in IntelliJ IDEA (or VS Code).
3. Open Terminal in this folder and run:

   ```bash
   npm install
   npm start
   ```

4. Visit `http://localhost:4200`.

If `ENOSPC` occurs, free disk space and run `npm cache clean --force`, then retry `npm install`.

## Existing API compatibility

The product service continues to use `http://localhost:8080/api/products` and these existing CRUD routes:

- `GET /api/products`
- `GET /api/products/{id}`
- `POST /api/products`
- `PUT /api/products/{id}`
- `DELETE /api/products/{id}`
- Optional search: `GET /api/products/search?name=...`
- Optional category: `GET /api/products/category/{category}`

Product fields expected by the current UI: `id`, `name`, `description`, `price`, `stockQuantity`, `category`, `imageUrl`, `active`. If your Java entity differs, keep the frontend model and payloads aligned with it.

CORS must allow `http://localhost:4200` in Spring Boot.

## Included

- Flipkart-inspired blue/yellow navigation and category strip
- Responsive homepage, banner, product search/category filters, product details
- Cart with localStorage persistence and quantity controls
- Product admin CRUD page
- Login/register UI page and orders page placeholders
- Wishlist storage service
- Responsive styling and image fallbacks

## Backend work still required (important)

The existing Product CRUD backend alone does **not** provide real user accounts, secure checkout, orders, or payments. These cannot be made real by Angular-only code. The login/register and orders pages clearly indicate this dependency; they do not falsely claim to authenticate or create orders.

To enable full selected features, extend Spring Boot with:

1. **Authentication**: `POST /api/auth/register`, `POST /api/auth/login`, password hashing with BCrypt, Spring Security, JWT access tokens, role-based authorization, and validation. Never store raw passwords. Protect `/api/admin/**` and product mutation routes.
2. **Orders**: `POST /api/orders` to create a server-validated order from product IDs/quantities, `GET /api/orders/my` for the authenticated user's history, and server-side stock/price validation.
3. **Payment gateway**: choose a provider (e.g. Razorpay) and create payment orders on the backend using secret credentials stored in environment variables. Verify payment signatures on the backend and only mark an order paid after server verification. Never put a secret key in Angular. Live payments need merchant onboarding and valid keys.
4. **Wishlist**: current wishlist service stores product IDs locally. For account sync, add authenticated wishlist APIs.

## Product images

Product image URLs are loaded from the `imageUrl` field. Remote images require internet access and the host to allow hotlinking. The UI falls back when an image fails. Replace sample image URLs with product images you have permission to use.

## Payment status

This package does not claim to provide a live payment gateway. Live payments require backend code, provider credentials and verification as described above. Current cart checkout remains demo-only until that backend is implemented.
