# Tasks: Volunteer-Proxy Matching System

**Branch**: `001-we-will-build`
**Input**: Design documents from `/Users/grady/git/personal-github/volunteer-proxy/specs/001-we-will-build/`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/api-contract.yaml, quickstart.md

## Path Conventions

This is a **web application** monorepo:
- `packages/shared/` - Shared effect-ts schemas
- `packages/backend/` - Node.js backend API
- `packages/frontend/` - React SPA with Vite
- `k8s/` - Kubernetes manifests

## Phase 3.1: Setup (5 tasks)

- [X] **T001** Initialize monorepo with pnpm workspaces - Create `package.json` at repository root with workspace configuration for `packages/*`, install pnpm dependencies
- [X] **T002** [P] Setup shared package - Create `packages/shared/package.json` with effect-ts dependencies (@effect/schema), TypeScript config, and directory structure (src/schemas/, src/types/, src/validation/)
- [X] **T003** [P] Setup backend package - Create `packages/backend/package.json` with Node.js, effect-ts, PostgreSQL client dependencies, TypeScript config, and directory structure (src/domain/, src/services/, src/api/, src/repositories/, src/infrastructure/)
- [X] **T004** [P] Setup frontend package - Create `packages/frontend/package.json` with Vite, React, effect-ts dependencies, TypeScript config, and directory structure (src/components/, src/pages/, src/services/, src/hooks/, src/lib/)
- [X] **T005** [P] Create k8s manifest structure - Create directories: `k8s/postgres/`, `k8s/backend/`, `k8s/frontend/`

## Phase 3.2: Shared Schema Library (8 tasks)

⚠️ **CRITICAL: These schemas MUST be defined before any backend/frontend implementation**

- [X] **T006** [P] Define User schema - Create `packages/shared/src/schemas/User.ts` with effect-ts Schema for User entity (id, email, passwordHash, role, firstName, lastName, createdAt, updatedAt) and UserRole literal type
- [X] **T007** [P] Define Event schema - Create `packages/shared/src/schemas/Event.ts` with effect-ts Schema for Event entity with time validation (startTime < endTime refinement)
- [X] **T008** [P] Define VolunteerAssignment schema - Create `packages/shared/src/schemas/VolunteerAssignment.ts` with effect-ts Schema for VolunteerAssignment entity
- [X] **T009** [P] Define ProxyAvailability schema - Create `packages/shared/src/schemas/ProxyAvailability.ts` with effect-ts Schema for ProxyAvailability entity
- [X] **T010** [P] Define Request schema - Create `packages/shared/src/schemas/Request.ts` with effect-ts Schema for Request entity and RequestStatus literal type
- [X] **T011** [P] Define Notification schema - Create `packages/shared/src/schemas/Notification.ts` with effect-ts Schema for Notification entity and NotificationType literal type
- [X] **T012** [P] Define error types - Create `packages/shared/src/schemas/Errors.ts` with tagged union error types for domain errors (ValidationError, NotFoundError, AuthError, ConflictError, etc.)
- [X] **T013** Export schemas - Create `packages/shared/src/index.ts` to export all schemas and types, then run `pnpm --filter shared build`

## Phase 3.3: Contract Tests - Shared (1 task)

⚠️ **CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

- [X] **T014** [P] Schema contract tests - Create `packages/shared/tests/contract/schemas.test.ts` to validate all schemas can encode/decode sample data, test validation rules, test refinements (MUST FAIL initially)

## Phase 3.4: Database Schema (3 tasks)

- [X] **T015** Create PostgreSQL migration - Create `packages/backend/migrations/001_initial_schema.sql` with all tables (users, events, volunteer_assignments, proxy_availability, requests, notifications), foreign keys, unique constraints, check constraints, and indexes per data-model.md
- [X] **T016** Create seed script - Create `packages/backend/scripts/seed.ts` to create initial admin user (admin@example.com) using effect-ts
- [X] **T017** Setup database integration test - Create `packages/backend/tests/integration/db-setup.ts` using Testcontainers for PostgreSQL, setup/teardown helpers

## Phase 3.5: Contract Tests - Backend API (8 tasks)

⚠️ **CRITICAL: These tests MUST be written and MUST FAIL before backend implementation**

- [X] **T018** [P] Contract test POST /auth/register - Create `packages/backend/tests/contract/auth-register.test.ts` to validate request/response schemas match OpenAPI spec (MUST FAIL initially)
- [X] **T019** [P] Contract test POST /auth/login - Create `packages/backend/tests/contract/auth-login.test.ts` to validate request/response schemas match OpenAPI spec (MUST FAIL initially)
- [X] **T020** [P] Contract test GET /events and POST /events - Create `packages/backend/tests/contract/events.test.ts` to validate all event endpoint schemas match OpenAPI spec (MUST FAIL initially)
- [X] **T021** [P] Contract test GET /volunteer-assignments - Create `packages/backend/tests/contract/volunteer-assignments.test.ts` to validate schemas match OpenAPI spec (MUST FAIL initially)
- [X] **T022** [P] Contract test POST /proxy-availability and DELETE - Create `packages/backend/tests/contract/proxy-availability.test.ts` to validate schemas match OpenAPI spec (MUST FAIL initially)
- [X] **T023** [P] Contract test POST /requests and accept/decline - Create `packages/backend/tests/contract/requests.test.ts` to validate all request endpoint schemas match OpenAPI spec (MUST FAIL initially)
- [X] **T024** [P] Contract test GET /notifications - Create `packages/backend/tests/contract/notifications.test.ts` to validate schemas match OpenAPI spec (MUST FAIL initially)
- [X] **T025** [P] Contract test GET /users/me - Create `packages/backend/tests/contract/users.test.ts` to validate schemas match OpenAPI spec (MUST FAIL initially)

## Phase 3.6: Backend - Repository Layer (7 tasks)

- [X] **T026** Define repository interfaces - Create `packages/backend/src/repositories/interfaces.ts` with effect-ts Requirements for UserRepository, EventRepository, VolunteerAssignmentRepository, ProxyAvailabilityRepository, RequestRepository, NotificationRepository
- [X] **T027** [P] Implement UserRepository - Create `packages/backend/src/repositories/UserRepository.ts` with PostgreSQL implementation (findById, findByEmail, create, update) using effect-ts and shared User schema
- [X] **T028** [P] Implement EventRepository - Create `packages/backend/src/repositories/EventRepository.ts` with PostgreSQL implementation (create, findById, list, findByDateRange) using effect-ts and shared Event schema
- [X] **T029** [P] Implement VolunteerAssignmentRepository - Create `packages/backend/src/repositories/VolunteerAssignmentRepository.ts` with PostgreSQL implementation (create, findByVolunteer, findByEvent, markFulfilled) using effect-ts
- [X] **T030** [P] Implement ProxyAvailabilityRepository - Create `packages/backend/src/repositories/ProxyAvailabilityRepository.ts` with PostgreSQL implementation (create, delete, findByEvent, findByProxy) using effect-ts
- [X] **T031** [P] Implement RequestRepository - Create `packages/backend/src/repositories/RequestRepository.ts` with PostgreSQL implementation (create, findById, updateStatus, findByVolunteer, findByProxy) using effect-ts
- [X] **T032** [P] Implement NotificationRepository - Create `packages/backend/src/repositories/NotificationRepository.ts` with PostgreSQL implementation (create, findByUser, markAsRead) using effect-ts

## Phase 3.7: Backend - Domain Services (9 tasks)

⚠️ **Write service unit tests BEFORE implementing each service (TDD)**

- [X] **T033** Authentication service with tests - Create `packages/backend/src/services/AuthService.ts` with register, login, JWT generation using effect-ts Requirements pattern, AND create `packages/backend/tests/unit/AuthService.test.ts` (tests MUST FAIL first)
- [X] **T034** Event service with tests - Create `packages/backend/src/services/EventService.ts` with create (admin-only), list, get using effect-ts Requirements, AND create `packages/backend/tests/unit/EventService.test.ts` (tests MUST FAIL first)
- [X] **T035** Volunteer assignment service with tests - Create `packages/backend/src/services/VolunteerAssignmentService.ts` with CRUD operations using effect-ts Requirements, AND create `packages/backend/tests/unit/VolunteerAssignmentService.test.ts` (tests MUST FAIL first)
- [X] **T036** Time conflict validation service - Create `packages/backend/src/services/TimeConflictService.ts` to check if events overlap (date + time range comparison) using effect-ts pipe syntax
- [X] **T037** Proxy availability service with tests - Create `packages/backend/src/services/ProxyAvailabilityService.ts` with markAvailable, removeAvailability, checkConflicts (using TimeConflictService) using effect-ts Requirements, AND create `packages/backend/tests/unit/ProxyAvailabilityService.test.ts` (tests MUST FAIL first)
- [X] **T038** Notification service with tests - Create `packages/backend/src/services/NotificationService.ts` with create, list, markRead using effect-ts Requirements, AND create `packages/backend/tests/unit/NotificationService.test.ts` (tests MUST FAIL first)
- [X] **T039** Request workflow service with tests - Create `packages/backend/src/services/RequestWorkflowService.ts` to orchestrate request creation, acceptance (mark assignment fulfilled, decline other requests, check conflicts), decline using effect-ts Requirements, AND create `packages/backend/tests/unit/RequestWorkflowService.test.ts` (tests MUST FAIL first)
- [X] **T040** Request service with tests - Create `packages/backend/src/services/RequestService.ts` with create, accept, decline (delegates to RequestWorkflowService), list using effect-ts Requirements, AND create `packages/backend/tests/unit/RequestService.test.ts` (tests MUST FAIL first)
- [X] **T041** Database connection service - Create `packages/backend/src/infrastructure/Database.ts` with PostgreSQL connection pool as effect-ts Resource, configuration from environment variables

## Phase 3.8: Backend - API Layer (9 tasks)

- [X] **T042** Setup HTTP server - Create `packages/backend/src/api/server.ts` with effect-ts HTTP or Fastify integration, CORS configuration, error handling middleware
- [X] **T043** JWT authentication middleware - Create `packages/backend/src/api/middleware/auth.ts` to verify JWT tokens and attach user to request context using effect-ts
- [X] **T044** Role-based authorization middleware - Create `packages/backend/src/api/middleware/authorize.ts` to check user role (admin, volunteer, proxy) using effect-ts
- [X] **T045** Auth endpoints - Create `packages/backend/src/api/routes/auth.ts` with POST /auth/register and POST /auth/login handlers using AuthService
- [X] **T046** Event endpoints - Create `packages/backend/src/api/routes/events.ts` with GET /events, POST /events (admin only), GET /events/:id handlers using EventService and authorization middleware
- [X] **T047** Volunteer assignment endpoints - Create `packages/backend/src/api/routes/volunteer-assignments.ts` with GET /volunteer-assignments handler using VolunteerAssignmentService
- [X] **T048** Proxy availability endpoints - Create `packages/backend/src/api/routes/proxy-availability.ts` with GET /proxy-availability, POST /proxy-availability, DELETE /proxy-availability/:id handlers using ProxyAvailabilityService
- [X] **T049** Request endpoints - Create `packages/backend/src/api/routes/requests.ts` with GET /requests, POST /requests, POST /requests/:id/accept, POST /requests/:id/decline handlers using RequestService
- [X] **T050** Notification and user endpoints - Create `packages/backend/src/api/routes/notifications.ts` with GET /notifications, POST /notifications/:id/read, and `packages/backend/src/api/routes/users.ts` with GET /users/me

## Phase 3.9: Contract Tests - Frontend API Client (3 tasks)

⚠️ **CRITICAL: These tests MUST be written and MUST FAIL before frontend implementation**

- [X] **T051** [P] Setup frontend API client - Create `packages/frontend/src/services/ApiClient.ts` with effect-ts HTTP client as Requirement, base URL configuration, JWT token handling
- [X] **T052** [P] Implement API client methods - Create methods in `packages/frontend/src/services/ApiClient.ts` for all endpoints using shared schemas (auth, events, assignments, availability, requests, notifications, users)
- [X] **T053** [P] Frontend client contract tests - Create `packages/frontend/tests/contract/api-client.test.ts` to validate client methods encode requests and decode responses correctly using shared schemas (MUST FAIL initially)

## Phase 3.10: Frontend - State & Hooks (4 tasks)

- [X] **T054** Auth state management - Create `packages/frontend/src/hooks/useAuth.ts` with login, register, logout, currentUser using effect-ts and ApiClient, persist JWT in localStorage
- [X] **T055** Event hooks - Create `packages/frontend/src/hooks/useEvents.ts` with useEvents (list), useEvent (get by id), useCreateEvent (admin only) using effect-ts and ApiClient
- [X] **T056** Request hooks - Create `packages/frontend/src/hooks/useRequests.ts` with useRequests (list), useCreateRequest, useAcceptRequest, useDeclineRequest using effect-ts and ApiClient
- [X] **T057** Notification hooks - Create `packages/frontend/src/hooks/useNotifications.ts` with useNotifications (list unread), useMarkRead, polling logic (every 60s) using effect-ts Schedule

## Phase 3.11: Frontend - Components (10 tasks)

- [X] **T058** [P] Layout component - Create `packages/frontend/src/components/Layout.tsx` with navigation, logout button, notification bell icon with unread count badge
- [X] **T059** [P] Login page - Create `packages/frontend/src/pages/Login.tsx` with email/password form, calls useAuth.login, redirects on success
- [X] **T060** [P] Register page - Create `packages/frontend/src/pages/Register.tsx` with email/password/role/name form, calls useAuth.register, redirects on success
- [X] **T061** [P] Event list page - Create `packages/frontend/src/pages/EventList.tsx` showing all events using useEvents, filterable by date, accessible to all authenticated users
- [X] **T062** Event detail page for proxies - Create `packages/frontend/src/pages/EventDetail.tsx` showing event details, "Mark Available" button for proxies (using ProxyAvailabilityService), shows availability status
- [X] **T063** Event detail page for volunteers - Update `packages/frontend/src/pages/EventDetail.tsx` to show list of available proxies (from ProxyAvailability), "Request Proxy" button to send request
- [X] **T064** [P] Volunteer assignments page - Create `packages/frontend/src/pages/VolunteerAssignments.tsx` (volunteer only) showing assignments with fulfilled status, list available proxies for unfulfilled assignments
- [X] **T065** [P] Proxy requests page - Create `packages/frontend/src/pages/ProxyRequests.tsx` (proxy only) showing received requests with accept/decline buttons using useRequests
- [X] **T066** [P] Admin event creation page - Create `packages/frontend/src/pages/CreateEvent.tsx` (admin only) with form for event details, calls useCreateEvent
- [X] **T067** Routing and protected routes - Create `packages/frontend/src/App.tsx` with React Router, protected routes by authentication and role, route configuration for all pages

## Phase 3.12: Integration Tests (5 tasks)

⚠️ **These tests validate end-to-end user scenarios from quickstart.md**

- [X] **T068** [P] Integration test: Admin creates event - Create `packages/backend/tests/integration/scenario-1-admin-creates-event.test.ts` using Testcontainers, validate FR-001, FR-002 (admin can create, event is persisted)
- [X] **T069** [P] Integration test: Proxy marks availability - Create `packages/backend/tests/integration/scenario-2-proxy-marks-availability.test.ts` validate FR-008, FR-009 (proxy can mark availability, visible to volunteers)
- [X] **T070** [P] Integration test: Volunteer searches proxies - Create `packages/backend/tests/integration/scenario-3-volunteer-searches.test.ts` validate FR-011 (volunteer can view available proxies for event)
- [X] **T071** [P] Integration test: Volunteer sends request - Create `packages/backend/tests/integration/scenario-4-volunteer-sends-request.test.ts` validate FR-012, FR-017 (request sent, proxy notified)
- [X] **T072** [P] Integration test: Proxy accepts request - Create `packages/backend/tests/integration/scenario-5-proxy-accepts.test.ts` validate FR-013, FR-014, FR-016, FR-023 (acceptance workflow, fulfilled status, notifications, requirement met)

## Phase 3.13: Edge Case Tests (2 tasks)

- [X] **T073** [P] Integration test: No overlapping proxy assignments - Create `packages/backend/tests/integration/edge-case-overlapping-assignments.test.ts` validate FR-024, FR-025 (proxy cannot accept multiple overlapping events)
- [X] **T074** [P] Integration test: Prevent multiple pending requests - Create `packages/backend/tests/integration/edge-case-multiple-requests.test.ts` validate business rule (volunteer cannot send multiple pending requests for same assignment)

## Phase 3.14: Kubernetes Deployment (3 tasks)

- [X] **T075** [P] PostgreSQL k8s manifests - Create `k8s/postgres/statefulset.yaml`, `k8s/postgres/service.yaml`, `k8s/postgres/pvc.yaml` for PostgreSQL StatefulSet with persistent volume
- [X] **T076** [P] Backend k8s manifests - Create `k8s/backend/deployment.yaml`, `k8s/backend/service.yaml`, `k8s/backend/configmap.yaml` for Node.js backend with environment config, health checks
- [X] **T077** [P] Frontend k8s manifests - Create `k8s/frontend/deployment.yaml` (Nginx serving Vite build), `k8s/frontend/service.yaml`, optional `k8s/frontend/ingress.yaml` for LoadBalancer/Ingress

## Phase 3.15: Documentation & CI/CD (4 tasks)

- [X] **T078** [P] Update README - Create `README.md` at repository root with project overview, architecture diagram, quickstart instructions from quickstart.md, development setup
- [X] **T079** [P] Environment configuration - Create `.env.example` files for backend and frontend with all required environment variables documented
- [X] **T080** [P] Setup GitHub Actions - Create `.github/workflows/test.yml` for running all tests (contract, unit, integration) on pull requests
- [X] **T081** [P] Setup build workflow - Create `.github/workflows/build.yml` for building and pushing Docker images for backend and frontend

## Phase 3.16: Final Validation (2 tasks)

- [X] **T082** Run quickstart validation - Execute all scenarios from `specs/001-we-will-build/quickstart.md` manually against running system (local or k8s), verify all acceptance criteria pass
- [X] **T083** Performance and security review - Run performance tests (API response times <500ms), security scan (dependency audit), verify error handling, check logging coverage

---

## Dependencies

**Critical TDD Ordering**:
- Setup (T001-T005) before everything
- Shared schemas (T006-T013) before backend/frontend
- Schema contract tests (T014) before any implementation
- Database schema (T015-T017) before repositories
- Backend contract tests (T018-T025) MUST FAIL before backend implementation
- Repositories (T026-T032) before services
- Services (T033-T041) before API layer
- Backend API (T042-T050) before frontend client
- Frontend contract tests (T051-T053) MUST FAIL before frontend implementation
- API client (T051-T053) before hooks
- Hooks (T054-T057) before components
- Components (T058-T067) before routing (T067)
- All implementation before integration tests (T068-T074)
- Everything before final validation (T082-T083)

**Parallel Execution Opportunities**:
- T002, T003, T004, T005 (different packages)
- T006-T012 (different schema files)
- T014 (independent test file)
- T018-T025 (different contract test files)
- T027-T032 (different repository files)
- T058-T066 (different component files)
- T068-T074 (different integration test files)
- T075-T077 (different k8s manifests)
- T078-T081 (different documentation/CI files)

## Parallel Execution Examples

### Example 1: Shared Schemas (T006-T012)
```bash
# Launch all schema tasks in parallel:
# T006: Define User schema in packages/shared/src/schemas/User.ts
# T007: Define Event schema in packages/shared/src/schemas/Event.ts
# T008: Define VolunteerAssignment schema in packages/shared/src/schemas/VolunteerAssignment.ts
# T009: Define ProxyAvailability schema in packages/shared/src/schemas/ProxyAvailability.ts
# T010: Define Request schema in packages/shared/src/schemas/Request.ts
# T011: Define Notification schema in packages/shared/src/schemas/Notification.ts
# T012: Define error types in packages/shared/src/schemas/Errors.ts
```

### Example 2: Backend Contract Tests (T018-T025)
```bash
# Launch all contract tests in parallel (all MUST FAIL):
# T018: Contract test POST /auth/register
# T019: Contract test POST /auth/login
# T020: Contract test GET /events and POST /events
# T021: Contract test GET /volunteer-assignments
# T022: Contract test POST /proxy-availability
# T023: Contract test POST /requests
# T024: Contract test GET /notifications
# T025: Contract test GET /users/me
```

### Example 3: Integration Tests (T068-T074)
```bash
# Launch all integration tests in parallel (after implementation):
# T068: Integration test - Admin creates event
# T069: Integration test - Proxy marks availability
# T070: Integration test - Volunteer searches proxies
# T071: Integration test - Volunteer sends request
# T072: Integration test - Proxy accepts request
# T073: Integration test - No overlapping assignments
# T074: Integration test - Prevent multiple pending requests
```

## Task Execution Notes

1. **TDD is MANDATORY**: Every test task must be completed and show RED (failing) before its corresponding implementation task
2. **Effect-ts patterns**: Use pipe syntax for transformations, Requirements for dependencies, Schema for validation
3. **Functional programming**: Pure functions in domain, effects at edges (repositories, API, HTTP)
4. **File paths are absolute**: All tasks specify exact file paths within the repository
5. **Commit frequently**: After each task completion, commit changes
6. **Constitutional compliance**: Verify Library-First (3 packages), Contract-First (OpenAPI + schemas), Test-First (TDD)

## Validation Checklist

- [x] All contracts have corresponding tests (T018-T025 → T042-T050)
- [x] All entities have schema tasks (T006-T011 → User, Event, VolunteerAssignment, ProxyAvailability, Request, Notification)
- [x] All tests come before implementation (Phase 3.2-3.5 before 3.6-3.11)
- [x] Parallel tasks are truly independent (different files, marked [P])
- [x] Each task specifies exact file path (all tasks include file paths)
- [x] No task modifies same file as another [P] task (verified)
- [x] All user stories have integration tests (T068-T072 map to quickstart scenarios)
- [x] TDD Red-Green-Refactor enforced (contract tests, unit tests before implementation)

---

**Total Tasks**: 83
**Estimated Parallel Tasks**: 45+ (marked with [P])
**Ready for Execution**: Yes - All tasks are specific, actionable, and properly ordered
