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

## 🔑 Demo Credentials

The backend comes with pre-seeded demo users:

### Staff Login
- **Email**: `staff@demo.com`
- **Password**: `DemoPos@123!`
- **Role**: Staff

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

## 🔒 Security Best Practices

- ✅ Never commit `.env` files or Firebase credentials
- ✅ Use environment variables for all secrets
- ✅ Rotate JWT secrets regularly
- ✅ Use HTTPS in production
- ✅ Enable CORS only for trusted origins
- ✅ Implement rate limiting (already configured)
- ✅ Validate all user inputs
- ✅ Use Firebase security rules