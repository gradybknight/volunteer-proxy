# Volunteer-Proxy Matching System

A full-stack TypeScript application for managing volunteer-proxy matching for youth sports events, built with effect-ts, React, and PostgreSQL.

## 🏗️ Architecture

This project follows a **library-first, contract-first, test-first** architecture:

- **Monorepo**: pnpm workspaces with 3 packages (shared, backend, frontend)
- **Shared Schema Library**: Effect-ts schemas for type-safe validation
- **Backend API**: Node.js + Fastify + PostgreSQL with effect-ts
- **Frontend SPA**: React + Vite with effect-ts integration
- **Kubernetes**: Production-ready deployment manifests

## 📁 Project Structure

```
├── packages/
│   ├── shared/          # Effect-ts schemas and types
│   ├── backend/         # Node.js API server
│   └── frontend/        # React SPA
├── k8s/                 # Kubernetes manifests
├── specs/               # Feature specifications
└── tests/               # Integration tests
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm 8+
- Docker (for PostgreSQL)
- kubectl (for Kubernetes deployment)

### Local Development

1. **Install dependencies**:
   ```bash
   pnpm install
   ```

2. **Build shared package**:
   ```bash
   pnpm --filter shared build
   ```

3. **Start PostgreSQL**:
   ```bash
   docker run -d \
     --name postgres \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=volunteer_proxy \
     -p 5432:5432 \
     postgres:16-alpine
   ```

4. **Run database migrations**:
   ```bash
   pnpm --filter backend migrate
   ```

5. **Seed database**:
   ```bash
   pnpm --filter backend seed
   ```
   Default admin credentials: `admin@example.com` / `admin123`

6. **Start backend** (in one terminal):
   ```bash
   pnpm --filter backend dev
   ```

7. **Start frontend** (in another terminal):
   ```bash
   pnpm --filter frontend dev
   ```

8. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health: http://localhost:3000/health

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run contract tests
pnpm test:contract

# Run integration tests
pnpm --filter backend test:integration
```

## 📦 Building for Production

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter backend build
pnpm --filter frontend build
```

## ☸️ Kubernetes Deployment

1. **Apply PostgreSQL**:
   ```bash
   kubectl apply -f k8s/postgres/
   ```

2. **Create secrets**:
   ```bash
   kubectl create secret generic postgres-secret \
     --from-literal=password=your-postgres-password

   kubectl create secret generic backend-secret \
     --from-literal=jwt_secret=your-jwt-secret
   ```

3. **Apply backend and frontend**:
   ```bash
   kubectl apply -f k8s/backend/
   kubectl apply -f k8s/frontend/
   ```

## 🔧 Environment Variables

### Backend (.env)

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/volunteer_proxy
JWT_SECRET=your-secret-key-change-in-production
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000/api
```

## 👥 User Roles

- **Admin**: Create and manage events
- **Volunteer**: View events, send proxy requests
- **Proxy**: Mark availability, accept/decline requests

## 📝 API Documentation

See OpenAPI specification: `specs/001-we-will-build/contracts/api-contract.yaml`

## 🎯 Key Features

- ✅ User authentication with JWT
- ✅ Role-based access control (admin, volunteer, proxy)
- ✅ Event management
- ✅ Proxy availability tracking
- ✅ Request/accept workflow
- ✅ Real-time notifications
- ✅ Time conflict detection
- ✅ Full type safety with effect-ts schemas

## 📚 Technology Stack

- **Language**: TypeScript
- **Backend**: Node.js, Fastify, effect-ts
- **Frontend**: React 18, Vite, effect-ts
- **Database**: PostgreSQL 16
- **Testing**: Vitest, Testcontainers
- **Deployment**: Kubernetes, Docker

## 🤝 Contributing

1. Create a feature branch
2. Follow TDD (contract tests → implementation)
3. Ensure all tests pass
4. Submit a pull request

## 📄 License

MIT
