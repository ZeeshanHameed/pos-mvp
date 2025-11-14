# POS Customer - Online Ordering Application

A modern Angular 19 application for customers to browse menu, place orders online, and track order status in real-time.

## 🎯 Overview

**POS Customer** is a customer-facing web application that allows users to:
- Browse available menu items
- Add items to cart and place orders without login
- Provide delivery information
- Track order status in real-time
- Receive live updates as order progresses

## 🛠️ Tech Stack

- **Framework**: Angular 19 LTS (Standalone Components)
- **Language**: TypeScript 5.6
- **UI**: Angular Material (MUI)
- **Real-time Sync**: Firebase SDK (Firestore) + WebSocket fallback
- **State Management**: Angular Signals + RxJS BehaviorSubjects
- **Build & Deployment**: Docker-ready production build
- **Linting & Formatting**: ESLint + Prettier

## ✨ Features

### 1. Menu Page
- Display all available menu items in card layout
- Show item name, price, and stock availability
- Visual indicators for out-of-stock and low-stock items
- Add items to cart with one click
- Shopping cart badge showing item count

### 2. Cart & Checkout
- View all cart items with quantity controls
- Add/remove/update item quantities
- Enter customer name and delivery address
- Optional discount field
- Real-time calculation of subtotal and total
- Form validation for required fields

### 3. Order Tracking
- Order confirmation page after successful placement
- Visual timeline showing order progress
- Real-time status updates (Pending → In Progress → Ready → Completed)
- Firebase Firestore sync for instant updates
- WebSocket fallback if Firebase unavailable
- Connection status indicator

### 4. Real-Time Synchronization
- Primary: Firebase Firestore listeners
- Fallback: WebSocket connection to backend
- Automatic failover between sync methods
- Visual connection status indicator

## 📁 Project Structure

```
pos-customer/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── menu/                 # Menu browsing page
│   │   │   ├── checkout/             # Cart and checkout page
│   │   │   └── order-tracking/       # Order status tracking page
│   │   ├── models/
│   │   │   ├── menu.model.ts         # Menu item interfaces
│   │   │   └── order.model.ts        # Order and cart interfaces
│   │   ├── services/
│   │   │   ├── menu.service.ts       # Menu data management
│   │   │   ├── cart.service.ts       # Shopping cart state
│   │   │   ├── order.service.ts      # Order operations
│   │   │   ├── firebase-sync.service.ts  # Firebase real-time sync
│   │   │   ├── websocket.service.ts  # WebSocket fallback
│   │   │   └── notification.service.ts   # Snackbar notifications
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts            # Development config
│   │   └── environment.prod.ts       # Production config
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Angular CLI 19.x

### Installation

```bash
# Navigate to project directory
cd pos-customer

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:4201/`

### Environment Configuration

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',  // Backend API URL
  wsUrl: 'ws://localhost:3000',             // WebSocket URL
  firebase: {
    // Add your Firebase web app config here
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_PROJECT.firebaseapp.com',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_PROJECT.appspot.com',
    messagingSenderId: 'YOUR_SENDER_ID',
    appId: 'YOUR_APP_ID',
  },
};
```

## 📖 Usage

### Customer Journey

1. **Browse Menu** (`/menu`)
   - View all available items
   - See prices and stock status
   - Add items to cart

2. **Checkout** (`/checkout`)
   - Review cart items
   - Adjust quantities
   - Enter name and delivery address
   - Place order

3. **Track Order** (`/order/:id`)
   - View order confirmation
   - See real-time status updates
   - Track order progress

## 🔧 Development

```bash
# Start dev server
npm start

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Build for production
npm run build:prod
```

## 📦 Build & Deployment

### Production Build

```bash
npm run build:prod
```

Output will be in `dist/pos-customer/`

## 🔌 API Integration

The application integrates with the `pos-backend` NestJS API:

- **GET /api/v1/menu** - Fetch menu items
- **POST /api/v1/orders** - Create new order
- **GET /api/v1/orders/:id** - Get order details

## 🔄 Real-Time Updates

### Firebase Firestore
- Listens to order document changes
- Instant status updates
- Primary sync method

### WebSocket Fallback
- Connects if Firebase unavailable
- Listens for `order:statusChanged` events
- Automatic reconnection

## 🎨 Customization

### Theme Colors

Edit `src/styles.scss` to customize Material theme:

```scss
$pos-customer-primary: mat.define-palette(mat.$indigo-palette);
$pos-customer-accent: mat.define-palette(mat.$pink-palette);
$pos-customer-warn: mat.define-palette(mat.$red-palette);
```

## 📝 License

This project is part of the POS MVP system.

## 🤝 Related Projects

- **pos-backend** - NestJS backend API
- **pos-staff** - Staff management application

