# POS Staff - Frontend Application

A modern Angular 19 application for staff to create, manage, and update orders in a Point of Sale (POS) system.

## Tech Stack

- **Framework**: Angular 19 LTS
- **Language**: TypeScript
- **UI**: Angular Material (MUI)
- **Realtime Sync**: Firebase SDK (Firestore)
- **Fallback Sync**: WebSocket (Socket.io)
- **State Management**: Angular Signals + RxJS BehaviorSubjects
- **Linting & Formatting**: ESLint + Prettier

## Features

### Authentication
- ✅ Staff-only login screen
- ✅ JWT token storage in localStorage
- ✅ HTTP Interceptor for automatic token attachment
- ✅ Auth Guard for route protection
- ✅ Auto redirect on token expiration

### Dashboard
- ✅ Default landing page after login
- ✅ Today's Active Orders (Pending, In Progress, Ready)
- ✅ Completed Orders History
- ✅ Real-time auto-refresh via Firebase/WebSocket
- ✅ Order summary cards with status badges

### Create Order Screen
- ✅ Fetch and display menu items in grid layout
- ✅ Add to cart with quantity management
- ✅ Side panel cart summary
- ✅ Customer name input
- ✅ Discount input
- ✅ Order type: in-store
- ✅ Real-time total calculation
- ✅ Place order with backend API integration

### Order Status Management
- ✅ List of ongoing orders with real-time sync
- ✅ Update order status (Pending → In Progress → Ready → Completed)
- ✅ Status transition validation
- ✅ Instant updates via Firebase + WebSocket

### UI/UX
- ✅ Material Design components
- ✅ Responsive split-pane layout
- ✅ Snackbar notifications for:
  - New orders received
  - Order status updates
  - Sync status (connected/disconnected)
- ✅ Smooth animations and transitions
- ✅ Connection status indicators

## Prerequisites

- Node.js 18+ and npm
- Angular CLI 19
- Firebase project with Firestore enabled
- POS Backend API running (see `pos-backend` folder)

## Installation

```bash
# Install dependencies
npm install

# Install Angular CLI globally (if not already installed)
npm install -g @angular/cli@19
```

## Configuration

### 1. Update Environment Files

Edit `src/environments/environment.ts` and `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1', // Your backend API URL
  wsUrl: 'ws://localhost:3000',           // Your WebSocket URL
  firebase: {
    apiKey: 'your-api-key',
    authDomain: 'your-project-id.firebaseapp.com',
    projectId: 'your-project-id',
    storageBucket: 'your-project-id.appspot.com',
    messagingSenderId: 'your-messaging-sender-id',
    appId: 'your-app-id',
  },
};
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Copy your Firebase config to the environment files
4. Update Firestore security rules to allow authenticated access

## Development

```bash
# Start development server
npm start

# The app will be available at http://localhost:4200
```

## Build

```bash
# Production build
npm run build

# The build artifacts will be stored in the `dist/` directory
```

## Linting & Formatting

```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format
```

## Project Structure

```
pos-staff/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── login/              # Login component
│   │   │   ├── dashboard/          # Dashboard with order overview
│   │   │   ├── create-order/       # Create order with menu & cart
│   │   │   └── manage-orders/      # Manage order status
│   │   ├── guards/
│   │   │   └── auth.guard.ts       # Route protection
│   │   ├── interceptors/
│   │   │   └── auth.interceptor.ts # JWT token injection
│   │   ├── models/
│   │   │   ├── user.model.ts       # User interfaces
│   │   │   ├── menu.model.ts       # Menu interfaces
│   │   │   └── order.model.ts      # Order interfaces
│   │   ├── services/
│   │   │   ├── auth.service.ts     # Authentication service
│   │   │   ├── menu.service.ts     # Menu data service
│   │   │   ├── order.service.ts    # Order management service
│   │   │   ├── cart.service.ts     # Shopping cart service
│   │   │   ├── firebase-sync.service.ts  # Firebase real-time sync
│   │   │   ├── websocket.service.ts      # WebSocket fallback
│   │   │   └── notification.service.ts   # Snackbar notifications
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── environments/
│   │   ├── environment.ts          # Development config
│   │   └── environment.prod.ts     # Production config
│   ├── index.html
│   ├── main.ts
│   └── styles.scss
├── angular.json
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

### Login
1. Navigate to `/login`
2. Enter staff credentials (email: `staff@demo.com`, password: `DemoPos@123!`)
3. Click "Login"
4. Redirected to dashboard on success

### Create Order
1. Click "Create New Order" from dashboard
2. Browse menu items and add to cart
3. Enter customer name
4. Apply discount (optional)
5. Review cart summary
6. Click "Place Order"

### Manage Orders
1. Click "Manage Orders" from dashboard
2. View list of active orders
3. Expand order to see details
4. Click status button to update (e.g., "In Progress", "Ready", "Completed")
5. Changes sync in real-time across all connected clients

## Real-time Sync

The application uses a dual-sync strategy:

1. **Primary**: Firebase Firestore real-time listeners
2. **Fallback**: WebSocket connection to backend

Connection status is displayed in the toolbar:
- 🟢 Firebase icon = Connected to Firebase
- 🟢 WiFi icon = Connected via WebSocket
- 🔴 Cloud off icon = Offline

## API Integration

The app integrates with the following backend endpoints:

- `POST /api/v1/auth/login` - Staff login
- `GET /api/v1/menu` - Fetch menu items
- `POST /api/v1/orders` - Create new order
- `PATCH /api/v1/orders/:id/status` - Update order status
