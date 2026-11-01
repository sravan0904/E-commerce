# ShopSphere - Full-Stack E-Commerce Platform

ShopSphere is an enterprise-grade, modern, and fully functional full-stack e-commerce application built with **Spring Boot 3.3.5 (Java 17/21)**, **React (Vite + Tailwind CSS)**, and **MySQL 8** (with an out-of-the-box zero-config H2 dev mode).

---

## Architecture Overview

```
ShopSphere/
├── backend/                  # Java 17+ / Spring Boot 3.3.5 REST API
│   ├── src/main/java/com/shopsphere/
│   │   ├── config/           # Security, CORS & DataInitializer seeds
│   │   ├── controller/       # Auth, Product, Cart, Order, Payment, Admin REST controllers
│   │   ├── dto/              # Strongly-typed request/response models
│   │   ├── entity/           # JPA Entities with full relations
│   │   ├── exception/        # GlobalExceptionHandler & custom exceptions
│   │   ├── repository/       # Spring Data JPA Repositories
│   │   ├── security/         # JWT filter, provider, UserDetails & BCrypt
│   │   ├── service/          # Transactional business logic
│   │   └── util/             # Helper utilities
│   └── pom.xml               # Maven configuration
│
├── frontend/                 # React 18 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/              # Axios instance with auto JWT header injection
│   │   ├── components/       # Layout, Product, Common, and Admin components
│   │   ├── context/          # Auth, Cart, Wishlist & Toast context providers
│   │   ├── pages/            # Customer storefront & Admin portal pages
│   │   ├── utils/            # Currency formatting, helpers
│   │   └── App.jsx           # Main routing & guards
│   └── package.json
│
└── database/                 # Production MySQL scripts
    ├── schema.sql            # 20 relational tables with indexes and foreign keys
    └── sample-data.sql       # Rich sample catalog and test accounts
```

---

## Key Features

### 🛍️ Customer Storefront
- **Dynamic Home Page**: Promotional hero section, curated categories, featured collections, top deals, testimonials, newsletter subscription.
- **Product Catalog & Discovery**: Fast filtering by category, brand, price range, and star rating. Multi-criteria sorting and pagination.
- **Rich Product Detail**: Multi-image carousel gallery, discount calculation, stock badges, specifications, customer reviews, and related products.
- **Cart & Wishlist**: Real-time quantity controls, coupon engine with instant discount preview, persistent cart & wishlist sync.
- **Seamless Checkout**: Address management (add/select/default), Cash on Delivery (COD) and Razorpay test online gateway integration.
- **Order Management & Tracking**: Step-by-step visual order tracking timeline, invoice summary, cancel eligible orders, and return requests.
- **Customer Profile**: Personal details, address book management, order history, and password update.

### 🛡️ Admin Dashboard
- **Analytics Overview**: Live revenue metrics, total orders, customer growth, low-stock warnings, monthly revenue charts (Recharts), and order status distribution pie chart.
- **Catalog Management**: Add/edit/delete products, multiple image gallery URLs, JSON specifications, category management.
- **Order Processing**: Live order list, search and filter by status, transition order states (`CONFIRMED`, `PROCESSING`, `SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`).
- **Inventory Control**: Real-time stock alerts, manual adjustments with audit reason logging (`RESTOCK`, `AUDIT`, etc.).
- **Coupons & Promotions**: Create and manage percentage or flat-rate coupons with minimum order amount, maximum cap, expiry dates, and usage limits.
- **Customer & Review Moderation**: Enable or disable user accounts; moderate and remove inappropriate product reviews.

---

## Default Credentials (Pre-seeded)

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@shopsphere.com` | `Admin@123` |
| **Customer** | `customer@shopsphere.com` | `Customer@123` |

*New customers can also self-register via the `/register` page.*

---

## Quick Start (Development Mode)

### Prerequisites
- **Java 17 or 21**
- **Node.js 18+ & npm**
- Maven (or use bundled wrapper/local Maven)
- *MySQL 8 is optional for dev: the app boots into a MySQL-compatible in-memory/file H2 database automatically if MySQL is not configured.*

---

### Step 1: Start the Backend

Open a terminal in the project directory:

```bash
cd "D:\E commerce\shopsphere\backend"
```

Run with Maven:
```powershell
& "C:\Users\srava\.m2\wrapper\dists\apache-maven-3.9.9-bin\4nf9hui3q3djbarqar9g711ggc\apache-maven-3.9.9\bin\mvn.cmd" spring-boot:run
```
*(Or simply `mvn spring-boot:run` if `mvn` is on your PATH)*

The backend will start at: **`http://localhost:8080`**  
On initial boot, `DataInitializer` automatically populates the database with roles, admin/customer accounts, categories, products, and discount coupons.

H2 Console (in dev mode): **`http://localhost:8080/h2-console`**  
- JDBC URL: `jdbc:h2:mem:shopspheredb;DB_CLOSE_DELAY=-1;MODE=MySQL`
- User: `sa`
- Password: *(leave blank)*

---

### Step 2: Start the Frontend

Open a second terminal:

```bash
cd "D:\E commerce\shopsphere\frontend"
npm install
npm run dev
```

The frontend will run at: **`http://localhost:3000`** (or Vite's assigned port).

---

## Production Setup with MySQL 8

1. Log into your MySQL console and create the database:
   ```sql
   CREATE DATABASE shopsphere_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Execute the schema and sample data scripts:
   ```bash
   mysql -u root -p shopsphere_db < "D:\E commerce\shopsphere\database\schema.sql"
   mysql -u root -p shopsphere_db < "D:\E commerce\shopsphere\database\sample-data.sql"
   ```
3. Update `backend/src/main/resources/application-mysql.properties` with your MySQL credentials:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/shopsphere_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
   spring.datasource.username=YOUR_MYSQL_USERNAME
   spring.datasource.password=YOUR_MYSQL_PASSWORD
   ```
4. Run the backend with the `mysql` profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=mysql
   ```

---

## REST API Overview

### Authentication
- `POST /api/auth/register` — Register a customer account
- `POST /api/auth/login` — Login and obtain JWT token
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Complete password reset

### Products & Categories
- `GET /api/products` — Filtered, sorted, paginated product list
- `GET /api/products/{id}` — Single product details with images & reviews
- `GET /api/categories` — List active product categories

### Shopping Cart & Wishlist
- `GET /api/cart` — View user's cart
- `POST /api/cart/items` — Add product to cart
- `PUT /api/cart/items/{id}` — Update item quantity
- `DELETE /api/cart/items/{id}` — Remove item from cart
- `GET /api/wishlist` — View wishlist
- `POST /api/wishlist` — Add item to wishlist
- `DELETE /api/wishlist/{productId}` — Remove from wishlist

### Orders & Checkout
- `POST /api/orders` — Place order (COD or post-payment)
- `GET /api/orders` — Customer order history
- `GET /api/orders/{id}` — Order details and status timeline
- `PUT /api/orders/{id}/cancel` — Cancel an eligible order
- `POST /api/payments/create-order` — Create Razorpay order ID
- `POST /api/payments/verify` — Verify HMAC signature and confirm payment

### Admin Operations (`ROLE_ADMIN` required)
- `GET /api/admin/dashboard` — Metric counters, revenue chart, order status distribution
- `GET /api/admin/products` / `POST` / `PUT` / `DELETE` — Product management
- `GET /api/admin/categories` / `POST` / `PUT` / `DELETE` — Category management
- `GET /api/admin/orders` & `PUT /api/admin/orders/{id}/status` — Status transition
- `GET /api/admin/inventory` & `PUT /api/admin/inventory/{id}` — Stock adjustment
- `GET /api/admin/coupons` / `POST` / `PUT` / `DELETE` — Coupon management
- `GET /api/admin/customers` & `PUT /api/admin/customers/{id}/status` — Account toggling
- `GET /api/admin/reviews` & `DELETE /api/admin/reviews/{id}` — Feedback moderation

---

## Security Highlights
- **BCrypt**: Passwords salted and hashed with BCrypt.
- **JWT**: Stateless HMAC SHA-256 tokens stored securely and validated on every protected endpoint.
- **Server-side Price Calculation**: The backend recalculates all subtotals, coupon deductions, taxes, and shipping fees from database records — never trusting client amounts.
- **Atomic Transactions**: Stock deduction, coupon usage validation, and order creation occur within `@Transactional` boundaries.
