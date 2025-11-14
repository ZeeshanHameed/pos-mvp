# 🍽️ POS MVP - Point of Sale System

A complete Point of Sale (POS) system with real-time order management, built with modern web technologies.

## 📋 Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Applications](#applications)
- [Quick Start](#quick-start)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the System](#running-the-system)
- [Demo Credentials](#demo-credentials)
- [Project Structure](#project-structure)

## 🎯 Overview

This POS MVP system consists of three main applications:

1. **pos-backend** - NestJS REST API with WebSocket support
2. **pos-staff** - Angular 19 staff management application
3. **pos-customer** - Angular 19 customer ordering application

All applications work together to provide a complete real-time order management system with dual-sync capabilities (Firebase + WebSocket).

## 🏗️ System Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   pos-customer  │         │    pos-staff    │
│  (Port: 4201)   │         │  (Port: 4200)   │
│                 │         │                 │
│ - Browse Menu   │         │ - Login         │
│ - Place Orders  │         │ - Create Orders │
│ - Track Status  │         │ - Manage Orders │
└────────┬────────┘         └────────┬────────┘
         │                           │
         │    HTTP/WebSocket         │
         └───────────┬───────────────┘
                     │
         ┌───────────▼────────────┐
         │     pos-backend        │
         │    (Port: 3000)        │
         │                        │
         │ - REST API             │
         │ - WebSocket Gateway    │
         │ - JWT Authentication   │
         │ - Order Management     │
         └───────────┬────────────┘
                     │
         ┌───────────▼────────────┐
         │   Firebase Firestore   │
         │                        │
         │ - Real-time Database   │
         │ - Order Storage        │
         │ - User Management      │
         └────────────────────────┘
```

## 📦 Applications

### 1. pos-backend (NestJS API)

**Location**: `./pos-backend`  
**Port**: 3000  
**Purpose**: Backend REST API with real-time WebSocket support

**Key Features**:
- ✅ RESTful API with Swagger documentation
- ✅ JWT authentication for staff
- ✅ Firebase Firestore integration
- ✅ WebSocket gateway for real-time updates
- ✅ Order management (CRUD operations)
- ✅ Menu management
- ✅ Write queue with retry logic
- ✅ Caching layer for performance

**Quick Start**:
```bash
cd pos-backend
npm install
npm run start:dev
```

📖 **[Full Documentation](./pos-backend/README.md)**

### 2. pos-staff (Staff Application)

**Location**: `./pos-staff`  
**Port**: 4200  
**Purpose**: Staff-facing application for order management

**Key Features**:
- ✅ Staff authentication (login required)
- ✅ Dashboard with active orders
- ✅ Create new orders
- ✅ Update order status
- ✅ Real-time sync (Firebase + WebSocket)
- ✅ Material Design UI

**Quick Start**:
```bash
cd pos-staff
npm install
npm start
```

📖 **[Full Documentation](./pos-staff/README.md)**

### 3. pos-customer (Customer Application)

**Location**: `./pos-customer`  
**Port**: 4201  
**Purpose**: Customer-facing application for online ordering

**Key Features**:
- ✅ Browse menu items
- ✅ Add items to cart
- ✅ Place orders (no login required)
- ✅ Track order status in real-time
- ✅ Real-time sync (Firebase + WebSocket)
- ✅ Material Design UI

**Quick Start**:
```bash
cd pos-customer
npm install
npm start
```

📖 **[Full Documentation](./pos-customer/README.md)**

## 🚀 Quick Start

### Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Firebase Project**: With Firestore enabled
- **Angular CLI**: 19.x (optional, for development)

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd pos-mvp
```

2. **Install all dependencies**:
```bash
# Install backend dependencies
cd pos-backend
npm install

# Install staff app dependencies
cd ../pos-staff
npm install

# Install customer app dependencies
cd ../pos-customer
npm install
```

3. **Configure Firebase**:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Firestore Database
   - Download service account JSON for backend
   - Copy web app config for frontend apps

4. **Set up environment variables**:

**Backend** (`pos-backend/.env`):
```bash
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
JWT_SECRET=your-secret-key
JWT_EXPIRY=86400s
```

**Staff App** (`pos-staff/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  wsUrl: 'ws://localhost:3000',
  firebase: { /* your config */ }
};
```

**Customer App** (`pos-customer/src/environments/environment.ts`):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  wsUrl: 'ws://localhost:3000',
  firebase: { /* your config */ }
};
```

## 🏃 Running the System

### Option 1: Run All Applications (Recommended)

Open **3 terminal windows** and run each application:

**Terminal 1 - Backend**:
```bash
cd pos-backend
npm run start:dev
```
✅ Backend running at http://localhost:3000
✅ Swagger docs at http://localhost:3000/api-docs

**Terminal 2 - Staff App**:
```bash
cd pos-staff
npm start
```
✅ Staff app running at http://localhost:4200

**Terminal 3 - Customer App**:
```bash
cd pos-customer
npm start
```
✅ Customer app running at http://localhost:4201

### Option 2: Production Build

**Backend**:
```bash
cd pos-backend
npm run start:prod  # Automatically builds and starts
```

**Staff App**:
```bash
cd pos-staff
npm run build:prod
# Serve the dist/pos-staff folder with your web server
```

**Customer App**:
```bash
cd pos-customer
npm run build:prod
# Serve the dist/pos-customer folder with your web server
```

## 🔑 Demo Credentials

The backend comes with pre-seeded demo users:

### Staff Login
- **Email**: `staff@demo.com`
- **Password**: `DemoPos@123!`
- **Role**: Staff

### Manager Login
- **Email**: `manager@demo.com`
- **Password**: `DemoPos@123!`
- **Role**: Manager

**Note**: Customer app does not require login.

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 11
- **Language**: TypeScript 5.9
- **Database**: Firebase Firestore
- **Authentication**: JWT
- **Real-time**: Socket.io WebSocket
- **API Docs**: Swagger/OpenAPI
- **Validation**: class-validator
- **Caching**: LRU Cache + LevelDB

### Frontend (Both Apps)
- **Framework**: Angular 19 (Standalone Components)
- **Language**: TypeScript 5.6
- **UI Library**: Angular Material
- **State Management**: Angular Signals + RxJS
- **Real-time Sync**: Firebase SDK + WebSocket
- **HTTP Client**: Angular HttpClient
- **Forms**: Reactive Forms

## ✨ Features

### Real-Time Synchronization
- **Dual-Sync Strategy**: Firebase Firestore (primary) + WebSocket (fallback)
- **Automatic Failover**: Seamlessly switches between sync methods
- **Connection Status**: Visual indicators for sync status
- **Instant Updates**: Order status changes propagate in real-time

### Order Management
- **Create Orders**: Staff and customers can create orders
- **Status Workflow**: Pending → In Progress → Ready → Completed
- **Order Tracking**: Real-time status updates for customers
- **Order History**: View completed orders

### Menu Management
- **Menu Items**: Pre-seeded with demo items
- **Stock Tracking**: Low stock and out-of-stock indicators
- **Pricing**: Dynamic pricing with discount support

### Authentication & Security
- **JWT Tokens**: Secure authentication for staff
- **Route Guards**: Protected routes in staff app
- **HTTP Interceptors**: Automatic token attachment
- **Role-Based Access**: Staff and Manager roles

### Performance
- **Caching**: Menu items cached for fast loading
- **Write Queue**: Resilient write operations with retry logic
- **Optimistic Updates**: Instant UI feedback
- **Lazy Loading**: Components loaded on demand

## 📁 Project Structure

```
pos-mvp/
├── pos-backend/              # NestJS Backend API
│   ├── src/
│   │   ├── auth/            # Authentication module
│   │   ├── orders/          # Order management
│   │   ├── menu/            # Menu management
│   │   ├── users/           # User management
│   │   ├── firebase/        # Firebase integration
│   │   ├── cache/           # Caching layer
│   │   └── common/          # Shared utilities
│   ├── scripts/             # Utility scripts
│   ├── .env                 # Environment variables
│   └── README.md
│
├── pos-staff/               # Staff Angular App
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/  # UI components
│   │   │   ├── services/    # Business logic
│   │   │   ├── guards/      # Route guards
│   │   │   ├── interceptors/# HTTP interceptors
│   │   │   └── models/      # TypeScript interfaces
│   │   └── environments/    # Environment configs
│   └── README.md
│
└── pos-customer/            # Customer Angular App
    ├── src/
    │   ├── app/
    │   │   ├── components/  # UI components
    │   │   ├── services/    # Business logic
    │   │   └── models/      # TypeScript interfaces
    │   └── environments/    # Environment configs
    └── README.md
```

## 🔧 Development

### Backend Development
```bash
cd pos-backend

# Start with hot-reload
npm run start:dev

# Run linter
npm run lint

# View API docs
open http://localhost:3000/api-docs
```

### Frontend Development
```bash
# Staff app
cd pos-staff
npm start              # Start dev server
npm run lint          # Run linter
npm run format        # Format code

# Customer app
cd pos-customer
npm start              # Start dev server
npm run lint          # Run linter
npm run format        # Format code
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Staff login

### Menu
- `GET /api/v1/menu` - Get all menu items

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders` - List orders (with filters)
- `GET /api/v1/orders/:id` - Get order by ID
- `PATCH /api/v1/orders/:id/status` - Update order status

### WebSocket Events
- `order:created` - New order created
- `order:updated` - Order updated
- `order:statusChanged` - Order status changed

## 🧪 Testing the System

### 1. Test Customer Flow
1. Open http://localhost:4201 (customer app)
2. Browse menu items
3. Add items to cart
4. Go to checkout
5. Enter name and address
6. Place order
7. Note the order ID
8. Track order status in real-time

### 2. Test Staff Flow
1. Open http://localhost:4200 (staff app)
2. Login with `staff@demo.com` / `DemoPos@123!`
3. View dashboard with active orders
4. Click "Manage Orders"
5. Find the customer's order
6. Update status: Pending → In Progress → Ready → Completed
7. Watch customer app update in real-time!

### 3. Test Real-Time Sync
1. Open customer app in one browser
2. Open staff app in another browser
3. Create/update orders in staff app
4. Watch updates appear instantly in customer app
5. Check connection status indicators

## 🚀 Deployment

### Backend Deployment

**Important**: The backend includes build tools (`@nestjs/cli`, `typescript`) in production dependencies to support deployment platforms that build on the server.

#### Quick Deploy Steps

1. **Install dependencies** (builds automatically):
```bash
cd pos-backend
npm install
```

2. **Start the server**:
```bash
npm start
```

## 🔒 Security Best Practices

- ✅ Never commit `.env` files or Firebase credentials
- ✅ Use environment variables for all secrets
- ✅ Rotate JWT secrets regularly
- ✅ Use HTTPS in production
- ✅ Enable CORS only for trusted origins
- ✅ Implement rate limiting (already configured)
- ✅ Validate all user inputs
- ✅ Use Firebase security rules

## 📝 Environment Variables Reference

### Backend Required Variables
```bash
PORT=3000
NODE_ENV=development
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
JWT_SECRET=your-secret-key
JWT_EXPIRY=86400s
CACHE_TTL_SECONDS=300
```

### Frontend Required Variables
```typescript
apiUrl: 'http://localhost:3000/api/v1'
wsUrl: 'ws://localhost:3000'
firebase: {
  apiKey: '...',
  authDomain: '...',
  projectId: '...',
  storageBucket: '...',
  messagingSenderId: '...',
  appId: '...'
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linters and tests
5. Submit a pull request

## 📄 License

This project is part of the POS MVP system.

## 🆘 Troubleshooting

### Deployment Error: "nest: not found"

**Problem**: When deploying to production, you get the error "nest: not found"

**Solution**: This has been fixed in the latest version. The `@nestjs/cli` and `typescript` packages are now in `dependencies` instead of `devDependencies`.

**Steps to fix**:

1. **Update your `package.json`** to ensure these packages are in `dependencies`:
```json
"dependencies": {
  "@nestjs/cli": "^11.0.10",
  "typescript": "^5.9.3",
  "rimraf": "^6.0.1",
  ...
}
```

2. **Update your scripts** in `package.json`:
```json
"scripts": {
  "prebuild": "rimraf dist",
  "build": "nest build",
  "start": "node dist/src/main",
  "start:prod": "node dist/src/main",
  "postinstall": "npm run build --if-present"
}
```

3. **Redeploy**:
```bash
# Remove old dependencies
rm -rf node_modules package-lock.json

# Install fresh
npm install

# The postinstall hook will automatically build

# Start the server
npm start
```

**Why this happens**: Most deployment platforms only install `dependencies` in production, not `devDependencies`. Since NestJS needs the CLI to build, it must be in `dependencies`.

### Backend won't start
- Check if port 3000 is available
- Verify Firebase credentials are correct
- Check `.env` file exists and is properly formatted
- Ensure `dist/src/main.js` exists (run `npm run build` if missing)

### Frontend won't connect to backend
- Verify backend is running on port 3000
- Check `apiUrl` in environment files
- Check browser console for CORS errors

### Real-time sync not working
- Verify Firebase config is correct
- Check WebSocket connection in browser DevTools
- Look for connection status indicators in UI

### Build errors
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Clear Angular cache: `npm run ng cache clean`
- For backend: Ensure Node.js version >= 24.0.0

### Production build fails
- Check that `@nestjs/cli` is in `dependencies`
- Verify TypeScript is installed
- Run `npm run build` manually to see detailed errors
- Check deployment platform logs for specific errors

## 📞 Support

For detailed documentation on each application, see:
- [Backend Documentation](./pos-backend/README.md)
- [Staff App Documentation](./pos-staff/README.md)
- [Customer App Documentation](./pos-customer/README.md)

---

**Built with ❤️ using NestJS, Angular 19, and Firebase**

