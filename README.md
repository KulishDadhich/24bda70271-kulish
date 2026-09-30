# 🍔 FoodVerse — 3D Food Delivery Web App with Real-Time Order Tracking

> A creative next-generation full-stack food delivery web application featuring interactive **Three.js / React Three Fiber** 3D food models, **Leaflet + OpenStreetMap** live GPS courier tracking, **Socket.IO** real-time bidirectional telemetry, role-based JWT authentication, and a **dark glassmorphism** aesthetic.

---

## 🌟 Key Highlights & Features

1. **Interactive 3D Universe**:
   - **Hero Section**: Floating 3D Burger, Woodfired Pizza, Drink Cup, Donut, and Truffle Fries orbiting in 3D space with **mouse cursor parallax tracking** and floating physics.
   - **3D Interactive Kitchen Showcase**: 360-degree rotatable 3D dish previews with `OrbitControls`.
   - **3D Animated Delivery Scooter**: Live courier scooter with spinning rubber wheels and delivery thermal box on the tracking dashboard.
   - **Procedural 3D Geometries**: Built with Three.js primitives for zero-latency instant loading (no heavy 3D asset downloads required).

2. **Real-Time GPS Order Tracking**:
   - High-frequency **Socket.IO** room subscriptions (`order:${orderId}`).
   - Backend **Rider Simulation Service** interpolates city street waypoints and broadcasts live GPS coordinates (`lat`, `lng`), speed (`km/h`), heading angles, and dynamic ETA every 2 seconds.
   - **Leaflet + OpenStreetMap** integration with custom glowing SVG markers and polyline route animation (100% free, **Zero paid Google Maps API keys required**).
   - Dynamic Order Lifecycle: `Placed` ➔ `Accepted` ➔ `Preparing` ➔ `Out for Delivery` ➔ `Delivered`.
   - **1-Click Viva Fast-Forward**: Advance stages instantly for demo and presentation purposes.

3. **Multi-Role Authentication & Access Control**:
   - JWT with `bcryptjs` password hashing and protected routes.
   - **1-Click Instant Demo Login Badges**:
     - 👤 **Customer**: `customer@foodverse.com` / `password123` (Alex Johnson)
     - 🍳 **Restaurant Admin**: `restaurant@foodverse.com` / `password123` (Chef Marco Bellini)
     - 🛵 **Delivery Partner**: `delivery@foodverse.com` / `password123` (Sam Ryder)

4. **Restaurant Exploration & Menu System**:
   - 8 richly curated restaurants across **Burgers, Italian Pizza, Japanese Ramen & Sushi, Indian Dum Biryani, Healthy Bowls, Mexican Tacos, Gourmet Bakery & Gelato Cafe**.
   - 48 gourmet dishes with spice meters (🌶️), vegetarian indicators, and customization addons.
   - Multi-facet search, cuisine pills, pure-veg switch, 4.5+ star rating filter, and sorting.

5. **Cart, Coupons & Checkout**:
   - Persistent Zustand shopping cart with cross-restaurant conflict detection.
   - Interactive Promo Codes (`FOODVERSE50`, `TASTY30`, `FREESHIP`, `CHEESE20`) with instant validation and discount computation.
   - Price breakdown: Subtotal, GST & Taxes (8%), Delivery Fee (Free over $40), Coupon Savings, and Total.
   - Simulated Gateway (Card, UPI / QR Code, Cash on Delivery) with celebratory confetti fireworks.

6. **Restaurant Admin & Courier Dashboards**:
   - **Kitchen Portal**: Manage incoming live orders, advance cooking status, toggle in-stock/out-of-stock items, add new dishes to catalog, and inspect weekly revenue trends.
   - **Rider Console**: View active pickup tasks, route navigation, and one-click delivery completion.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend UI** | React 18, Vite, Tailwind CSS, Lucide React, Canvas-Confetti |
| **3D Graphics** | Three.js, React Three Fiber (`@react-three/fiber`), Drei (`@react-three/drei`) |
| **Animations** | Framer Motion (3D Tilt Cards, Parallax, Smooth Transitions) |
| **State Management** | Zustand (with persistent localStorage middleware) |
| **Routing** | React Router v6 |
| **Maps & Geo** | Leaflet, React-Leaflet, OpenStreetMap |
| **Backend API** | Node.js, Express.js (MVC Pattern: Controllers, Routes, Models, Middleware) |
| **Real-Time WebSockets**| Socket.IO (Rooms, Broadcasts, Live GPS Simulation) |
| **Database & ODM** | MongoDB with Mongoose (with instant zero-download In-Memory fallback) |
| **Security & Auth** | JSON Web Tokens (JWT), Bcrypt.js, CORS |

---

## 📂 Project Architecture

```
foodverse/
├── package.json                   # Root scripts
├── server/                        # Node.js + Express REST API & Socket.IO
│   ├── src/
│   │   ├── config/
│   │   │   ├── db.js              # Dual-mode DB manager (Mongoose + In-Memory)
│   │   │   ├── socket.js          # Socket.IO room hub & event listeners
│   │   │   └── inMemoryStore.js   # Fast zero-latency in-memory query engine
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── restaurantController.js
│   │   │   ├── dishController.js
│   │   │   ├── orderController.js
│   │   │   ├── couponController.js
│   │   │   └── statsController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js   # JWT token verification & role enforcement
│   │   │   └── errorMiddleware.js  # 404 & global error handler
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Restaurant.js
│   │   │   ├── Dish.js
│   │   │   ├── Order.js
│   │   │   ├── Coupon.js
│   │   │   └── modelAdapter.js    # Seamless Mongoose / In-Memory proxy
│   │   ├── routes/                # REST endpoints
│   │   ├── services/
│   │   │   └── riderSimulationService.js # High-frequency GPS waypoint emitter
│   │   ├── seed/
│   │   │   ├── seedData.js        # 8 restaurants, 48 dishes, 3 demo users, 4 coupons
│   │   │   └── seeder.js          # Standalone seed runner
│   │   └── server.js              # Express app & HTTP/Socket entrypoint
│   └── package.json
│
└── client/                        # React + Vite + Tailwind + R3F Frontend
    ├── src/
    │   ├── components/
    │   │   ├── 3d/                # Three.js 3D models & canvas components
    │   │   │   ├── Food3DModels.jsx
    │   │   │   ├── Hero3DCanvas.jsx
    │   │   │   ├── Scooter3DCanvas.jsx
    │   │   │   └── FoodItem3DPreview.jsx
    │   │   ├── common/            # Navbar, Footer, Card3DTilt, Loader
    │   │   ├── restaurant/        # RestaurantCard, FilterBar, DishCard
    │   │   ├── cart/              # CartDrawer, CheckoutModal
    │   │   └── tracking/          # LiveTrackingMap, OrderTimeline, RiderCard
    │   ├── pages/                 # Full application views
    │   ├── services/              # Axios API & Socket.IO clients
    │   ├── store/                 # Zustand state stores (Cart, Auth, Theme)
    │   ├── index.css              # Custom neon gradients & glass tokens
    │   ├── App.jsx                # Router & layout
    │   └── main.jsx
    ├── tailwind.config.js
    └── vite.config.js
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### 1. Start Backend Server
```bash
cd server
npm install
node src/server.js
```
*The server starts on `http://localhost:5000`. If local MongoDB is not running, it automatically activates the instant In-Memory database engine with full seed data.*

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*Open `http://localhost:5173` in your browser to experience FoodVerse!*

---

## 📡 REST API Directory

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Login with email & password |
| `GET` | `/api/auth/demo-accounts` | Public | Get list of instant demo accounts |
| `GET` | `/api/auth/me` | Private | Get profile of logged-in user |
| `GET` | `/api/restaurants` | Public | Get all restaurants with search, cuisine filters & sorting |
| `GET` | `/api/restaurants/:idOrSlug` | Public | Get restaurant details with categorized dishes |
| `GET` | `/api/dishes/restaurant/:id` | Public | Get all dishes for a specific restaurant |
| `POST` | `/api/orders` | Private | Place a new order & initiate GPS route |
| `GET` | `/api/orders/:id` | Private | Get single order tracking details |
| `GET` | `/api/orders/customer/my-orders` | Private | Get customer order history |
| `GET` | `/api/orders/restaurant/:id` | Private (Admin) | Get incoming kitchen orders |
| `PATCH` | `/api/orders/:id/status` | Private | Update order lifecycle status |
| `POST` | `/api/orders/:id/advance-status`| Public/Private| 1-Click Fast-Forward status (Viva helper) |
| `POST` | `/api/orders/:id/review` | Private | Submit post-delivery rating & comment |
| `POST` | `/api/coupons/validate` | Public | Verify promo code discount |
| `GET` | `/api/stats/restaurant/:id` | Private (Admin) | Get weekly revenue and sales analytics |

---

## 🎓 Viva & Technical Defense Q&A Cheatsheet

### Q1: How does the Real-Time GPS Tracking work without a paid Google Maps API?
**Answer**:
1. When an order is placed, the backend calculates geographic waypoints between the Restaurant coordinates and Customer coordinates.
2. When the status changes to `Out for Delivery`, `riderSimulationService.js` starts an interval timer that steps through waypoints every 2 seconds.
3. In each tick, the backend calculates the current `[lat, lng]`, bearing angle (heading), and dynamic ETA, then emits `order:locationUpdate` over **Socket.IO** to room `order:${orderId}`.
4. On the frontend, **Leaflet** listens to these updates and smoothly moves the custom animated scooter marker along the polyline path with **OpenStreetMap** tiles.

### Q2: Why use Procedural 3D Geometry in React Three Fiber instead of heavy .GLTF files?
**Answer**:
- External `.gltf` / `.obj` 3D files often require 10-50MB downloads per model, introducing network latency, pop-in, and CORS issues.
- Our procedural models (`BurgerModel`, `PizzaSliceModel`, `DrinkCupModel`, `DonutModel`, `FriesModel`) use native Three.js primitives (Spheres, Cylinders, Tori, PBR materials) built dynamically on the GPU. They load in **0 milliseconds**, support dynamic recoloring, and achieve 60 FPS performance even on mobile browsers.

### Q3: How is state managed between components?
**Answer**:
- **Zustand** stores (`useCartStore`, `useAuthStore`, `useThemeStore`) provide lightweight, decoupled state with `persist` middleware for localStorage retention.
- `useCartStore` enforces single-restaurant cart validation and automatically computes subtotals, 8% GST/taxes, delivery fees, and promo code discounts.

---

## 👥 Demo Credentials for Evaluation

| Role | Name | Email | Password |
|---|---|---|---|
| **Customer** | Alex Johnson | `customer@foodverse.com` | `password123` |
| **Restaurant Admin** | Chef Marco Bellini | `restaurant@foodverse.com` | `password123` |
| **Delivery Partner** | Sam Ryder | `delivery@foodverse.com` | `password123` |
