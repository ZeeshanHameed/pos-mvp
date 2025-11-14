# POS Backend API

A robust NestJS backend API for a Point of Sale (POS) system with Firebase Firestore integration, real-time WebSocket synchronization, and comprehensive order management.

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Seeding](#database-seeding)
- [Architecture](#architecture)
- [Deployment](#deployment)

## 🎯 About

The POS Backend is a production-ready REST API built with NestJS that powers a complete Point of Sale system. It provides:

- **Order Management**: Create, track, and update orders with real-time status synchronization
- **Menu Management**: Manage menu items with stock tracking and automatic inventory updates
- **Authentication**: JWT-based authentication for staff users
- **Real-time Sync**: WebSocket gateway for instant order updates across all connected clients
- **Resilient Architecture**: LRU caching, write-queue with retry logic, and graceful error handling

This backend serves two frontend applications:
- **pos-staff**: Staff dashboard for order management (requires authentication)
- **pos-customer**: Customer-facing app for placing and tracking orders (public access)

## ✨ Features

### Core Features
- ✅ **Firebase Firestore** - NoSQL database with real-time listeners
- ✅ **WebSocket Gateway** - Real-time order updates via Socket.io
- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Order Management** - Complete CRUD operations with status workflow
- ✅ **Menu Management** - Dynamic menu with stock tracking
- ✅ **Automatic Seeding** - Demo data and users created on startup

### Advanced Features
- ✅ **LRU Cache** - In-memory caching for improved performance
- ✅ **Write Queue** - LevelDB-based queue for offline write resilience
- ✅ **Background Reconciliation** - Automatic retry with exponential backoff
- ✅ **Audit Logging** - Track all critical operations
- ✅ **API Versioning** - URI-based versioning (v1)
- ✅ **Swagger Documentation** - Interactive API documentation
- ✅ **CORS Enabled** - Cross-origin resource sharing configured
- ✅ **Security Headers** - Helmet.js for security best practices
- ✅ **Compression** - Response compression for better performance
- ✅ **Validation** - Request validation with class-validator

## 🛠 Tech Stack

- **Framework**: [NestJS](https://nestjs.com/) v10
- **Language**: TypeScript
- **Database**: Firebase Firestore (NoSQL)
- **Real-time**: Socket.io (WebSocket)
- **Authentication**: JWT (jsonwebtoken)
- **Caching**: LRU Cache
- **Queue**: LevelDB
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Security**: Helmet, CORS
- **Password Hashing**: Argon2

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Firebase Project** with Firestore enabled
- **Firebase Admin SDK** service account key (JSON file)

## 🚀 Installation

### 1. Clone the repository

```bash
cd pos-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Firestore Database**
4. Go to **Project Settings** → **Service Accounts**
5. Click **Generate New Private Key**
6. Download the JSON file

**⚠️ Important**: Never commit the service account key to version control!

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"my-project",...}

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRY=24h

# Cache Configuration
CACHE_TTL_SECONDS=300
```

### Firebase Credential Configuration

The application uses Firebase credentials as a JSON string environment variable. This approach is ideal for all environments (development, staging, production) and works seamlessly with deployment platforms.

#### Converting Service Account to JSON String

We provide a helper script to convert your Firebase service account JSON file to a single-line string:

```bash
npm run firebase:convert <path-to-service-account.json>
```

**Example**:
```bash
npm run firebase:convert ./secrets/firebase-service-account.json
```

This will output:
- ✅ The properly formatted JSON string
- ✅ Instructions for `.env` file
- ✅ Instructions for deployment platforms
- ✅ Security warnings

#### Setting the Environment Variable

**For Local Development (.env file)**:

```bash
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"my-project","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nABC...XYZ\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-123@my-project.iam.gserviceaccount.com","client_id":"123456"}'
```

**For Deployment Platforms**:

- **Heroku**: `heroku config:set FIREBASE_SERVICE_ACCOUNT='...'`
- **Vercel**: Add to Environment Variables in project settings
- **AWS Lambda**: Add to environment variables or use AWS Secrets Manager
- **Docker**: Pass as environment variable in `docker-compose.yml` or Kubernetes secrets
- **Railway/Render**: Add to environment variables in dashboard

**⚠️ Security Warning**:

- Never commit credentials to version control
- Use environment variables or secret management services
- Rotate credentials regularly
- Restrict service account permissions to minimum required
- Use different service accounts for different environments

## 🏃 Running the Application

### Development Mode

```bash
npm run start:dev
```

The server will start on `http://localhost:3000` with hot-reload enabled.

### Production Mode

```bash
# Build and start production server (automatically builds first)
npm run start:prod
```

This command will:
1. Build the application (`npm run build`)
2. Start the production server (`node dist/src/main`)

Alternatively, you can run the commands separately:

```bash
# Build the application
npm run build

# Start production server (without rebuilding)
node dist/src/main
```

### Watch Mode

```bash
npm run start
```

### Debug Mode

```bash
npm run start:debug
```

## 📚 API Documentation

### Swagger UI

Once the server is running, access the interactive API documentation at:

**http://localhost:3000/api-docs**

### API Endpoints

All endpoints are prefixed with `/api/v1`

#### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/login` | Login with email and password | No |

#### Menu

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/menu` | Get all menu items | No |

#### Orders

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/orders` | Create a new order | Optional |
| GET | `/api/v1/orders` | List all orders (staff only) | Yes (Staff) |
| GET | `/api/v1/orders/:id` | Get order by ID | No |
| PATCH | `/api/v1/orders/:id/status` | Update order status | Yes (Staff) |

## 🌱 Database Seeding

The application automatically seeds the database on startup with:

**Note**: Seeding is idempotent - it only creates items if they don't already exist.

## 🏗 Architecture

### Project Structure

```
pos-backend/
├── src/
│   ├── auth/              # Authentication module
│   ├── audit/             # Audit logging
│   ├── cache/             # Caching and queue services
│   ├── common/            # Shared utilities, guards, filters
│   ├── firebase/          # Firebase configuration
│   ├── menu/              # Menu management
│   ├── migrations/        # Database seeding
│   ├── orders/            # Order management
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── orders.gateway.ts    # WebSocket gateway
│   │   └── dto/
│   ├── users/             # User management
│   ├── app.module.ts      # Root module
│   └── main.ts            # Application entry point
├── .env                   # Environment variables
├── serviceAccountKey.json # Firebase credentials (gitignored)
└── package.json
```

### Key Components

#### WebSocket Gateway

Real-time order synchronization using Socket.io:

- **Events Emitted**:
  - `order:created` - New order created
  - `order:updated` - Order data updated
  - `order:statusChanged` - Order status changed

#### Order Status Workflow

```
Pending → In Progress → Ready → Completed
```

Status transitions are validated to ensure proper workflow.

#### Caching Strategy

- **LRU Cache**: In-memory cache for frequently accessed data
- **TTL**: Configurable time-to-live (default: 300 seconds)
- **Fallback**: Serves cached data when Firestore is unavailable

#### Write Queue

- **LevelDB**: Persistent queue for failed writes
- **Retry Logic**: Exponential backoff (1s, 2s, 4s, 8s, 16s)
- **Reconciliation**: Background worker processes queued operations

## 🐳 Deployment

### Docker

```bash
# Build image
docker compose build

# Run container
docker compose up

# Run in detached mode
docker compose up -d
```

## 🔒 Security

- **Helmet**: Security headers configured
- **CORS**: Cross-origin requests enabled
- **JWT**: Secure token-based authentication
- **Argon2**: Password hashing with salt
- **Validation**: Input validation on all endpoints
- **Guards**: Role-based access control (staff-only endpoints)

## 📝 License

This project is part of the POS MVP system.

## 🤝 Related Projects

- **pos-staff**: Staff dashboard application (Angular 19)
- **pos-customer**: Customer ordering application (Angular 19)
