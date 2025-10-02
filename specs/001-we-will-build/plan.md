
# Implementation Plan: Volunteer-Proxy Matching System

**Branch**: `001-we-will-build` | **Date**: 2025-10-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/Users/grady/git/personal-github/volunteer-proxy/specs/001-we-will-build/spec.md`

## Execution Flow (/plan command scope)
```
1. Load feature spec from Input path
   → If not found: ERROR "No feature spec at {path}"
2. Fill Technical Context (scan for NEEDS CLARIFICATION)
   → Detect Project Type from file system structure or context (web=frontend+backend, mobile=app+api)
   → Set Structure Decision based on project type
3. Fill the Constitution Check section based on the content of the constitution document.
4. Evaluate Constitution Check section below
   → If violations exist: Document in Complexity Tracking
   → If no justification possible: ERROR "Simplify approach first"
   → Update Progress Tracking: Initial Constitution Check
5. Execute Phase 0 → research.md
   → If NEEDS CLARIFICATION remain: ERROR "Resolve unknowns"
6. Execute Phase 1 → contracts, data-model.md, quickstart.md, agent-specific template file (e.g., `CLAUDE.md` for Claude Code, `.github/copilot-instructions.md` for GitHub Copilot, `GEMINI.md` for Gemini CLI, `QWEN.md` for Qwen Code or `AGENTS.md` for opencode).
7. Re-evaluate Constitution Check section
   → If new violations: Refactor design, return to Phase 1
   → Update Progress Tracking: Post-Design Constitution Check
8. Plan Phase 2 → Describe task generation approach (DO NOT create tasks.md)
9. STOP - Ready for /tasks command
```

**IMPORTANT**: The /plan command STOPS at step 7. Phases 2-4 are executed by other commands:
- Phase 2: /tasks command creates tasks.md
- Phase 3-4: Implementation execution (manual or via tools)

## Summary
A full-stack volunteer-proxy matching system that connects parents who need replacements for youth sports event volunteer duties with parents available to substitute. The system manages events, tracks proxy availability, facilitates volunteer-proxy matching through a request/accept workflow, and ensures volunteer requirements are fulfilled.

## Technical Context
**Language/Version**: TypeScript (Node.js for backend, Browser runtime for frontend)
**Primary Dependencies**:
- Frontend: Vite, React, effect-ts
- Backend: Node.js, effect-ts
- Shared: effect-ts schema library
**Storage**: PostgreSQL (hosted in k8s cluster)
**Testing**: Effect-ts testing utilities, integration tests
**Target Platform**: Kubernetes cluster deployment
**Project Type**: web (frontend SPA + backend API + shared schema library)
**Performance Goals**: Standard web app responsiveness (<500ms API responses)
**Constraints**: Functional programming paradigms, effect-ts Requirements pattern, pipe syntax preferred over generators
**Scale/Scope**: Multi-tenant youth sports organization, hundreds of events per season, moderate user base

## Constitution Check
*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**I. Library-First Architecture**:
- ✅ PASS - Planning shared schema library (standalone, clear purpose)
- ✅ PASS - Frontend and backend as separate concerns with clear interfaces
- ✅ PASS - No organizational-only libraries planned

**II. Contract-First Development**:
- ✅ PASS - Will define API contracts via OpenAPI before implementation (Phase 1)
- ✅ PASS - Shared schema library will define all data contracts using effect-ts schema
- ✅ PASS - Request/response schemas and error conditions will be formalized

**III. Test-First Development**:
- ✅ PASS - TDD mandatory per constitution
- ✅ PASS - Plan includes contract tests before implementation
- ✅ PASS - Integration tests from user stories before feature implementation

**IV. Integration Testing Focus**:
- ✅ PASS - Contract changes will require integration tests
- ✅ PASS - Inter-service communication (frontend-backend) will be integration tested
- ✅ PASS - Shared schema library will have comprehensive integration tests

**V. Transparency and Observability**:
- ✅ PASS - Effect-ts provides structured error handling and logging capabilities
- ✅ PASS - All service interactions traceable through effect-ts Requirements pattern

**Initial Assessment**: PASS - No constitutional violations detected. Architecture aligns with library-first (3 projects: frontend, backend, shared), contract-first (schema library + OpenAPI), and test-first principles.

## Project Structure

### Documentation (this feature)
```
specs/[###-feature]/
├── plan.md              # This file (/plan command output)
├── research.md          # Phase 0 output (/plan command)
├── data-model.md        # Phase 1 output (/plan command)
├── quickstart.md        # Phase 1 output (/plan command)
├── contracts/           # Phase 1 output (/plan command)
└── tasks.md             # Phase 2 output (/tasks command - NOT created by /plan)
```

### Source Code (repository root)
```
packages/
├── shared/                    # Shared schema library
│   ├── src/
│   │   ├── schemas/          # Effect-ts schemas for all entities
│   │   ├── types/            # Derived TypeScript types
│   │   └── validation/       # Shared validation logic
│   ├── tests/
│   │   ├── contract/         # Schema contract tests
│   │   └── unit/
│   └── package.json
│
├── backend/                   # Node.js backend API
│   ├── src/
│   │   ├── domain/           # Domain models & business logic
│   │   ├── services/         # Service layer (Requirements)
│   │   ├── api/              # HTTP handlers
│   │   ├── repositories/     # Data access layer
│   │   └── infrastructure/   # Database, config, etc.
│   ├── tests/
│   │   ├── contract/         # API contract tests
│   │   ├── integration/      # End-to-end API tests
│   │   └── unit/
│   └── package.json
│
└── frontend/                  # React SPA
    ├── src/
    │   ├── components/       # Reusable UI components
    │   ├── pages/            # Page-level components
    │   ├── services/         # API client (Requirements)
    │   ├── hooks/            # React hooks with effect-ts
    │   └── lib/              # Utilities
    ├── tests/
    │   ├── integration/      # User flow tests
    │   └── unit/             # Component tests
    └── package.json

k8s/                          # Kubernetes manifests
├── backend/
├── frontend/
└── postgres/

package.json                  # Workspace root
```

**Structure Decision**: Web application with monorepo structure using npm/pnpm workspaces. Three packages align with Library-First principle: shared schemas (reusable), backend API (clear boundary), frontend SPA (clear boundary). Kubernetes manifests in dedicated directory for deployment configuration.

## Phase 0: Outline & Research
1. **Extract unknowns from Technical Context** above:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:
   ```
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

## Phase 1: Design & Contracts
*Prerequisites: research.md complete*

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Generate API contracts** from functional requirements:
   - For each user action → endpoint
   - Use standard REST/GraphQL patterns
   - Output OpenAPI/GraphQL schema to `/contracts/`

3. **Generate contract tests** from contracts:
   - One test file per endpoint
   - Assert request/response schemas
   - Tests must fail (no implementation yet)

4. **Extract test scenarios** from user stories:
   - Each story → integration test scenario
   - Quickstart test = story validation steps

5. **Update agent file incrementally** (O(1) operation):
   - Run `.specify/scripts/bash/update-agent-context.sh claude`
     **IMPORTANT**: Execute it exactly as specified above. Do not add or remove any arguments.
   - If exists: Add only NEW tech from current plan
   - Preserve manual additions between markers
   - Update recent changes (keep last 3)
   - Keep under 150 lines for token efficiency
   - Output to repository root

**Output**: data-model.md, /contracts/*, failing tests, quickstart.md, agent-specific file

## Phase 2: Task Planning Approach
*This section describes what the /tasks command will do - DO NOT execute during /plan*

**Task Generation Strategy**:
- Load `.specify/templates/tasks-template.md` as base
- Generate tasks from Phase 1 design docs (contracts, data model, quickstart)
- Follow TDD Red-Green-Refactor cycle per constitution

**Task Categories** (estimated 45-55 tasks):

1. **Project Setup** (5 tasks) [P]:
   - Initialize monorepo with pnpm workspaces
   - Setup shared package with effect-ts schema dependencies
   - Setup backend package with Node.js, effect-ts, PostgreSQL client
   - Setup frontend package with Vite, React, effect-ts
   - Create k8s manifest structure

2. **Shared Schema Library** (8 tasks) [P after setup]:
   - Define User schema with effect-ts
   - Define Event schema with effect-ts
   - Define VolunteerAssignment schema with effect-ts
   - Define ProxyAvailability schema with effect-ts
   - Define Request schema with effect-ts
   - Define Notification schema with effect-ts
   - Define error types as tagged unions
   - Write contract tests for all schemas (must fail initially)

3. **Database Schema** (3 tasks):
   - Create PostgreSQL migration for all tables
   - Write seed script for admin user
   - Create database integration test setup (Testcontainers)

4. **Backend - Repository Layer** (7 tasks) [P]:
   - Define repository interfaces as effect-ts Requirements
   - Implement User repository with PostgreSQL
   - Implement Event repository with PostgreSQL
   - Implement VolunteerAssignment repository
   - Implement ProxyAvailability repository
   - Implement Request repository
   - Implement Notification repository

5. **Backend - Domain Services** (9 tasks):
   - Authentication service (register, login, JWT)
   - Event service (create, list, get - admin only)
   - Volunteer assignment service (CRUD)
   - Proxy availability service (mark, remove, check conflicts)
   - Request service (create, accept, decline with business rules)
   - Notification service (create, list, mark read)
   - Time conflict validation service
   - Request workflow orchestration service
   - Write service unit tests (pure business logic)

6. **Backend - API Layer** (8 tasks):
   - Setup HTTP server with effect-ts HTTP or Fastify
   - Implement auth endpoints (/register, /login)
   - Implement event endpoints (CRUD)
   - Implement volunteer assignment endpoints
   - Implement proxy availability endpoints
   - Implement request endpoints (create, accept, decline)
   - Implement notification endpoints
   - Implement user profile endpoint
   - Write API contract tests (validate OpenAPI spec)

7. **Frontend - API Client** (3 tasks):
   - Create effect-ts HTTP client as Requirement
   - Implement API client methods using shared schemas
   - Write contract tests for client (match backend spec)

8. **Frontend - State & Hooks** (4 tasks):
   - Create auth state management with effect-ts
   - Create event hooks (useEvents, useEvent)
   - Create request hooks (useRequests, useCreateRequest)
   - Create notification hooks (useNotifications)

9. **Frontend - Components** (8 tasks) [P]:
   - Login/Register page
   - Event list page (all users)
   - Event detail page (with proxy availability for proxies, available proxies for volunteers)
   - Volunteer assignments page (volunteer only)
   - Proxy requests page (proxy only)
   - Admin event creation page (admin only)
   - Notification component (bell icon with unread count)
   - Layout and routing

10. **Integration Tests** (5 tasks):
    - Test Scenario 1: Admin creates event
    - Test Scenario 2: Proxy marks availability
    - Test Scenario 3: Volunteer searches proxies
    - Test Scenario 4: Volunteer sends request
    - Test Scenario 5: Proxy accepts, volunteer fulfilled

11. **Kubernetes Deployment** (3 tasks):
    - PostgreSQL StatefulSet and PVC manifests
    - Backend Deployment and Service manifests
    - Frontend Deployment and Service/Ingress manifests

12. **Documentation & CI** (2 tasks):
    - Update README with quickstart instructions
    - Setup GitHub Actions for test + build

**Ordering Strategy**:
- Setup tasks first (1)
- Shared schemas before backend/frontend (2)
- Database before repositories (3)
- Repositories before services (4-5)
- Services before API layer (6)
- Backend API before frontend client (7)
- Client before UI (8-9)
- Integration tests after all implementation (10)
- K8s and docs concurrent with testing (11-12)
- Mark [P] for tasks that can run in parallel (independent modules)

**TDD Enforcement**:
- Contract tests written before implementation (category 2, 6, 7)
- Service unit tests written before service implementation (category 5)
- Integration tests written as tasks, run after implementation (category 10)
- Each test task must show RED (failing) before implementation task
- Implementation task makes test GREEN
- Refactor as needed while keeping tests green

**Estimated Output**: 52 numbered, dependency-ordered tasks in tasks.md

**IMPORTANT**: This phase is executed by the /tasks command, NOT by /plan

## Phase 3+: Future Implementation
*These phases are beyond the scope of the /plan command*

**Phase 3**: Task execution (/tasks command creates tasks.md)  
**Phase 4**: Implementation (execute tasks.md following constitutional principles)  
**Phase 5**: Validation (run tests, execute quickstart.md, performance validation)

## Complexity Tracking
*Fill ONLY if Constitution Check has violations that must be justified*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |


## Progress Tracking
*This checklist is updated during execution flow*

**Phase Status**:
- [x] Phase 0: Research complete (/plan command)
- [x] Phase 1: Design complete (/plan command)
- [x] Phase 2: Task planning complete (/plan command - describe approach only)
- [x] Phase 3: Tasks generated (/tasks command)
- [ ] Phase 4: Implementation complete
- [ ] Phase 5: Validation passed

**Gate Status**:
- [x] Initial Constitution Check: PASS
- [x] Post-Design Constitution Check: PASS
- [x] All NEEDS CLARIFICATION resolved (technical decisions made, business decisions documented in spec)
- [x] Complexity deviations documented (none - design aligns with constitution)

---
*Based on Constitution v1.0.0 - See `/memory/constitution.md`*
