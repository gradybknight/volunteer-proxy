# Research: Volunteer-Proxy Matching System

**Date**: 2025-10-01
**Feature**: Volunteer-Proxy Matching System
**Status**: Complete

## Technology Stack Decisions

### Effect-ts Architecture

**Decision**: Use effect-ts as the core functional programming framework for both frontend and backend

**Rationale**:
- Provides type-safe error handling through Effect type
- Requirements pattern enables dependency injection without ceremony
- Schema library offers runtime validation with compile-time type inference
- Pipe syntax aligns with functional composition patterns
- Strong TypeScript integration ensures type safety across the stack

**Best Practices**:
- Define all side effects (DB, HTTP, logging) as Requirements
- Use pipe syntax for transformation pipelines
- Leverage Schema for all data validation at boundaries
- Model errors as tagged unions for exhaustive handling
- Keep effects at the edges, pure functions in the core

**Alternatives Considered**:
- Plain TypeScript: Lacks structured error handling and effect management
- fp-ts: More complex API, effect-ts is built on fp-ts with better ergonomics
- Zod for validation: Effect Schema provides integrated validation with effect system

### Monorepo Structure

**Decision**: Use npm/pnpm workspaces with packages/ directory structure

**Rationale**:
- Shared package ensures single source of truth for schemas
- Enables atomic changes across frontend/backend/shared
- Simplifies dependency management and version alignment
- Supports parallel development with clear boundaries
- Aligns with Library-First constitutional principle

**Best Practices**:
- Shared package has zero dependencies on frontend/backend
- Use workspace protocol for internal dependencies
- Build shared package before dependent packages
- Version packages together for consistency
- Clear package.json exports for public API

**Alternatives Considered**:
- Separate repositories: Harder to coordinate schema changes
- Lerna: More complex tooling, workspaces sufficient for 3 packages
- Monolithic single package: Violates library-first principle

### Backend Architecture

**Decision**: Layered architecture with domain, services, api, repositories

**Rationale**:
- Domain layer encapsulates business logic (pure functions)
- Services layer orchestrates effects using Requirements
- API layer handles HTTP concerns (routing, serialization)
- Repositories abstract data access behind interfaces
- Clear separation enables testing at each layer

**Best Practices**:
- Domain models use effect Schema for validation
- Services depend on repository interfaces (Requirements)
- API handlers delegate to services, handle only HTTP
- Use Effect.gen or pipe for service composition
- Repository implementations inject database connections

**Technology Choices**:
- HTTP framework: Effect HTTP or Fastify with effect integration
- Database client: PostgreSQL with effect-pg or similar
- Migration tool: node-pg-migrate or Kysely migrations
- API documentation: OpenAPI generated from effect schemas

### Frontend Architecture

**Decision**: React SPA with Vite, effect-ts for state and async operations

**Rationale**:
- Vite provides fast dev experience and optimized builds
- React component model familiar to team
- Effect-ts hooks integrate effects with React lifecycle
- Service layer encapsulates API calls as Requirements
- Type-safe end-to-end with shared schemas

**Best Practices**:
- Pages compose components, minimal logic
- Components receive data via props, effects via hooks
- Hooks wrap effect-ts services
- Services use shared schemas for API contracts
- Error boundaries handle effect failures

**Technology Choices**:
- State management: Effect-ts + React hooks (no Redux needed)
- Routing: React Router v6
- HTTP client: Effect HTTP client or fetch wrapped in Effect
- UI library: Consider Tailwind CSS or shadcn/ui for components
- Testing: Vitest for unit tests, Playwright for integration

### Database Design

**Decision**: PostgreSQL with normalized schema, migration-based evolution

**Rationale**:
- ACID guarantees for critical matching workflows
- Strong constraint enforcement (unique assignments, time conflicts)
- JSON support for flexible metadata if needed
- Mature ecosystem and k8s operator support
- Effect-ts has good PostgreSQL integration libraries

**Best Practices**:
- Define schema in migrations, not ORM
- Use database constraints to enforce business rules
- Indexes on foreign keys and query columns
- Repositories map rows to domain models
- Connection pooling via effect-ts Resource

**Schema Approach**:
- Events table: id, date, time, location, description
- Users table: id, email, password_hash, role (volunteer|proxy|admin)
- Volunteer_assignments table: volunteer_id, event_id, fulfilled
- Proxy_availability table: proxy_id, event_id, unique constraint
- Requests table: id, volunteer_id, proxy_id, event_id, status, unique constraint on (event_id, volunteer_id) when pending/accepted

### Kubernetes Deployment

**Decision**: Separate deployments for frontend, backend, PostgreSQL StatefulSet

**Rationale**:
- Independent scaling of frontend and backend
- StatefulSet for PostgreSQL ensures data persistence
- Service mesh not needed for initial deployment
- ConfigMaps for environment-specific configuration
- Secrets for database credentials

**Best Practices**:
- Frontend: Nginx container serving static Vite build
- Backend: Node.js container with health checks
- Database: PostgreSQL StatefulSet with PersistentVolumeClaim
- Services: ClusterIP for backend/db, LoadBalancer for frontend
- Ingress: Optional for routing and TLS termination

**Deployment Strategy**:
- Rolling updates for zero-downtime deployments
- Readiness probes to prevent traffic to unhealthy pods
- Resource limits to prevent resource exhaustion
- Namespace isolation for environments (dev, staging, prod)

## Authentication & Authorization

**Decision**: JWT-based authentication with role-based access control

**Rationale** (inferred from spec requirements):
- FR-007 requires authentication and authorization
- Three user roles: admin, volunteer, proxy
- Stateless tokens enable horizontal scaling
- Effect-ts can model auth as Requirements

**Best Practices**:
- Password hashing with bcrypt or argon2
- JWT with short expiry, refresh token pattern
- Role stored in JWT claims for RBAC
- Effect-ts middleware for auth verification
- Secure HTTP-only cookies or Authorization header

**Implementation Notes**:
- Admin role: Can create/edit/delete events
- Volunteer role: Can view events, send proxy requests
- Proxy role: Can mark availability, accept/decline requests
- User cannot have multiple roles simultaneously (FR-006)

## Notification System

**Decision**: Database-polling based notifications for initial implementation

**Rationale** (from spec FR-016, FR-017):
- Simpler than WebSocket/SSE for initial version
- Frontend polls for new notifications
- Can upgrade to real-time later without API changes
- Effect-ts Schedule for polling logic

**Best Practices**:
- Notifications table: user_id, type, message, read, created_at
- API endpoint: GET /notifications?since=timestamp
- Frontend polls every 30-60 seconds when user active
- Mark notifications as read after display
- Future: Add WebSocket or Server-Sent Events for real-time

**Alternative Approaches**:
- Email notifications: Could be added as secondary channel
- Push notifications: Not needed for web app initially
- WebSocket: More complex, defer to future iteration

## Testing Strategy

**Decision**: Contract tests → Integration tests → Unit tests, following TDD

**Rationale** (from constitution):
- Contract tests validate API and schema conformance
- Integration tests validate user stories and workflows
- Unit tests validate domain logic and transformations
- Red-Green-Refactor enforced for all code

**Test Levels**:
1. Schema contract tests: Validate effect schemas match expectations
2. API contract tests: Validate OpenAPI compliance
3. Integration tests: End-to-end user flows (acceptance scenarios)
4. Repository integration tests: Database operations
5. Service unit tests: Business logic with mocked repositories
6. Component unit tests: React components with mocked services

**Testing Tools**:
- Effect-ts test utilities for effect-based tests
- Vitest for unit testing (frontend & backend)
- Playwright for end-to-end integration tests
- Testcontainers for database integration tests

## Open Questions Resolved

All NEEDS CLARIFICATION items from feature spec remain as business decisions, not technical decisions. These will be addressed during implementation or by product owner:

- Event editing/deletion workflows (FR-003)
- User registration method (FR-005)
- Authentication mechanism detail (FR-007)
- Proxy availability update restrictions (FR-010)
- Volunteer assignment process (FR-015)
- Additional notification triggers (FR-018)
- Direct communication features (FR-019)
- Reporting capabilities (FR-021)
- Data retention period (FR-022)

These will be resolved during Phase 1 design or deferred to future iterations based on priority.

## Summary

Technology stack selected: TypeScript + Effect-ts + React + Vite + PostgreSQL + Kubernetes. Architecture follows constitutional principles: library-first (monorepo packages), contract-first (OpenAPI + effect schemas), test-first (TDD with contract tests). All technical decisions align with functional programming constraints and effect-ts patterns. Ready to proceed to Phase 1 design.
