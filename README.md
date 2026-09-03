# VELORA — Luxury Makeup & Beauty E-Commerce Platform

A production-style, full-stack, server-side rendered (SSR) cosmetics and beauty products e-commerce web application. Built with Node.js, Express.js, MongoDB, Mongoose, and EJS, featuring session authentication, role-based admin controls, dynamic cart/wishlist management, and an automated procedural cosmetic product image generator.

---

## 1. Requirements

- **Node.js**: v18.0.0 or later (Tested on Node.js v20+)
- **npm**: v9.0.0 or later
- **MongoDB**: v6.0 or later (Community Server, Docker container, or MongoDB Atlas URI)

---

## 2. Installation & Quick Start

```bash
# 1. Navigate to the project directory
cd velora-beauty-store

# 2. Install dependencies
npm install

# 3. Configure environment variables (pre-configured for localhost)
cp .env.example .env

# 4. Seed database with 32 luxury products and demo accounts
npm run seed

# 5. Start the production server
npm start
```

For live development with auto-reloading:
```bash
npm run dev
```

---

## 3. Website & Access URLs

- **Public Storefront**: [http://localhost:3000](http://localhost:3000)
- **Shop Catalog**: [http://localhost:3000/products](http://localhost:3000/products)
- **Makeup Category**: [http://localhost:3000/category/makeup](http://localhost:3000/category/makeup)
- **Skincare Category**: [http://localhost:3000/category/skincare](http://localhost:3000/category/skincare)
- **Shopping Bag**: [http://localhost:3000/cart](http://localhost:3000/cart)
- **Saved Wishlist**: [http://localhost:3000/wishlist](http://localhost:3000/wishlist)
- **Client Login**: [http://localhost:3000/login](http://localhost:3000/login)
- **Client Registration**: [http://localhost:3000/signup](http://localhost:3000/signup)
- **Admin Console**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)

---

## 4. Default Seeded Credentials

### Administrator Account
- **Email**: `admin@velora.com`
- **Password**: `Admin@123password`
- **Role**: `admin` (Has full access to `/admin/dashboard`, product CRUD, stock updates, and order lifecycle management)

### Demo Customer Account
- **Email**: `customer@velora.com`
- **Password**: `Customer@123password`
- **Role**: `customer` (Pre-seeded with shipping addresses and verified reviews)

---

## 5. Environment Variables Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/velora_beauty
SESSION_SECRET=velora_luxury_secret_key_beauty_992184
NODE_ENV=development
```

### Changing MongoDB Connection
- **Local MongoDB**: `mongodb://127.0.0.1:27017/velora_beauty`
- **MongoDB Atlas**: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/velora_beauty?retryWrites=true&w=majority`

---

## 6. Project Architecture & Structure

```
velora-beauty-store/
├── app.js                         # Express application entry & server listener
├── package.json                   # Dependencies & npm scripts
├── .env                           # Environment configuration
├── .env.example                   # Template environment configuration
├── README.md                      # Comprehensive guide
├── config/
│   └── db.js                      # Mongoose MongoDB connection
├── models/
│   ├── User.js                    # User schema (roles, bcrypt hashing, addresses)
│   ├── Product.js                 # Product schema (slug, shades, stock, ratings)
│   ├── Category.js                # Category & subcategory schema
│   ├── Order.js                   # Order schema & status history
│   ├── Wishlist.js                # User wishlist mapping
│   ├── Cart.js                    # Cart schema
│   └── Review.js                  # Product rating & customer reviews
├── controllers/
│   ├── productController.js       # Storefront, catalog, search, details, reviews
│   ├── userController.js          # Authentication (login/signup), profile
│   ├── cartController.js          # Cart operations, quantity updates, totals
│   ├── wishlistController.js      # Wishlist toggle and move-to-bag action
│   ├── orderController.js         # Checkout, order placement, order tracking
│   └── adminController.js         # Admin dashboard, product CRUD, orders, users
├── routes/
│   ├── productRoutes.js           # Public shop & product detail routes
│   ├── userRoutes.js              # Auth & profile routes
│   ├── cartRoutes.js              # Cart management routes
│   ├── wishlistRoutes.js          # Wishlist routes
│   ├── orderRoutes.js             # Checkout & order routes
│   └── adminRoutes.js             # Protected admin panel routes
├── middleware/
│   ├── auth.js                    # Session guard & view locals
│   ├── admin.js                   # Admin authorization guard
│   ├── upload.js                  # Multer diskStorage for product image uploads
│   └── errorHandler.js            # 404 handler and error boundary
├── views/
│   ├── partials/
│   │   ├── header.ejs             # Head tags, typography, stylesheets
│   │   ├── footer.ejs             # Brand story, customer service, newsletter
│   │   ├── navbar.ejs             # Announcement bar, search, badges, drawer
│   │   ├── product-card.ejs       # Reusable card with hover quick add & wishlist
│   │   └── alerts.ejs             # Flash notification messages
│   ├── home.ejs                   # Editorial hero banner & 9 curated sections
│   ├── products.ejs               # Catalog with MongoDB filters, sort, & pagination
│   ├── product-details.ejs        # Gallery, shade picker, reviews, ingredients
│   ├── search.ejs                 # Server-side search results
│   ├── cart.ejs                   # Shopping bag with stock limits & free shipping meter
│   ├── wishlist.ejs               # Saved products with move-to-bag workflow
│   ├── checkout.ejs               # Shipping form & demo payment selection
│   ├── order-success.ejs          # Order confirmation, invoice, & progress stepper
│   ├── orders.ejs                 # Order history & status tracking
│   ├── profile.ejs                # User details & shipping address editor
│   ├── login.ejs                  # Client sign-in portal
│   ├── signup.ejs                 # New customer registration
│   ├── 404.ejs                    # Graceful 404 page
│   └── admin/
│       ├── login.ejs              # Admin sign-in portal
│       ├── dashboard.ejs          # Key performance indicators & recent orders
│       ├── products.ejs           # Inventory list, stock switch, search
│       ├── add-product.ejs        # Product creation form (multer upload, shades)
│       ├── edit-product.ejs       # Product edit & image replacement form
│       ├── orders.ejs             # Order processing & lifecycle status updater
│       └── users.ejs              # Registered customer list & order stats
├── public/
│   ├── css/
│   │   ├── style.css              # Core typography, palette, layout, components
│   │   ├── responsive.css         # Mobile drawer, breakpoints, touch gestures
│   │   └── admin.css              # Clean modern admin panel styling
│   ├── js/
│   │   ├── main.js                # Navigation drawer, tabs, shade selector
│   │   ├── cart.js                # AJAX cart updates & wishlist toggle
│   │   └── admin.js               # Dynamic category dropdowns & image preview
│   └── images/
│       ├── products/              # Generated high-resolution cosmetic SVG illustrations
│       ├── banners/               # Hero & editorial promo graphic banners
│       └── categories/            # Category thumbnail imagery
└── utils/
    ├── generateProductImages.js   # Procedural cosmetic SVG generator
    └── seedProducts.js            # Seeder script (32 luxury products, categories, admin)
```

---

## 7. How Automatic Cosmetic Product Images Work

The project runs completely offline without requiring any third-party external image generation API or subscription keys.

When running `npm run seed`:
1. `utils/generateProductImages.js` analyzes each product's name, category, and subcategory.
2. It procedurally renders scalable vector graphics (SVG) with luxury studio lighting, soft gradient backgrounds, metallic rose gold accents, beveled lipstick bullets, glass reflection gradients, and embossed "VELORA" monograms.
3. Assets are written to `public/images/products/` and directly referenced in the database.
4. When adding a product via the Admin Panel, administrators can either upload their own image (JPEG, PNG, WebP) using Multer or leave it empty to use the default luxury aesthetic SVG.

---

## 8. How to Add Products

1. Sign in at `http://localhost:3000/admin/login` using `admin@velora.com` / `Admin@123password`.
2. Click **➕ Add New Formulation** on the sidebar navigation or top bar.
3. Fill in:
   - **Product Name** & **Editorial Description**
   - **Category** (Makeup or Skincare) and **Subcategory** (Lipsticks, Serum, etc.)
   - **Regular Price** and optional **Discount Price**
   - **Inventory Count**
   - **Shades** (comma-separated, e.g. `01 Nude:#C48A85, 02 Rose:#A35359`)
   - **Upload Image** (optional)
   - Select placement flags (**Featured**, **Bestseller**, **New Arrival**).
4. Click **Publish Product**. The formulation will appear immediately in the shop and category listings.

---

## 9. Verification & Testing Instructions

To verify the installation:
1. Seed the database: `npm run seed`
2. Start the server: `npm start`
3. Test browsing the homepage, filter products by category/price at `/products`, view product details at `/product/velora-nude-muse-lipstick`, and add items to cart.
4. Log in as `customer@velora.com`, proceed to checkout, place an order with COD or Demo Card, and view your tracking status at `/orders`.
5. Log in to the Admin Panel at `/admin/login`, update order status to `Shipped`, and add a new test formulation.
# Velora-Beauty-Store
