# Quickstart: Volunteer-Proxy Matching System

**Date**: 2025-10-01
**Feature**: Volunteer-Proxy Matching System
**Purpose**: Validate implementation with end-to-end user scenarios

## Prerequisites

- Docker and Docker Compose installed (for PostgreSQL)
- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Repository cloned and at repository root

## Setup

### 1. Install Dependencies

```bash
# Install all workspace dependencies
pnpm install

# Build shared package first
pnpm --filter shared build

# Build backend
pnpm --filter backend build

# Build frontend
pnpm --filter frontend build
```

### 2. Start PostgreSQL

```bash
# Using docker-compose
docker-compose up -d postgres

# Or using kubectl (if testing k8s deployment)
kubectl apply -f k8s/postgres/
```

### 3. Run Database Migrations

```bash
# Navigate to backend and run migrations
pnpm --filter backend migrate
```

### 4. Seed Initial Data

```bash
# Create admin user for testing
pnpm --filter backend seed
```

Expected output:
```
Created admin user: admin@example.com (password: admin123)
```

### 5. Start Backend Server

```bash
# Start in development mode
pnpm --filter backend dev

# Expected output:
# Backend server listening on http://localhost:3000
# Database connected
```

### 6. Start Frontend Development Server

```bash
# In a new terminal
pnpm --filter frontend dev

# Expected output:
# Vite dev server running at http://localhost:5173
```

## End-to-End Test Scenarios

These scenarios validate the acceptance criteria from the feature specification. Execute them in order.

### Scenario 1: Admin Creates Event (FR-001, FR-002)

**Given**: An admin user is authenticated
**When**: Admin creates an event
**Then**: Event is persisted and visible to all users

```bash
# Login as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "admin123"}'

# Save the token from response
export TOKEN="<token_from_response>"

# Create an event
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Soccer Practice Volunteer",
    "description": "Help set up and supervise soccer practice",
    "date": "2025-10-15",
    "startTime": "16:00",
    "endTime": "18:00",
    "location": "Main Field, Sports Complex"
  }'

# Expected: 201 Created with event object
# Save event ID: export EVENT_ID="<id_from_response>"
```

**Browser Test**:
1. Navigate to http://localhost:5173
2. Login as admin@example.com / admin123
3. Click "Create Event"
4. Fill form with event details
5. Submit
6. Verify event appears in event list

### Scenario 2: Proxy Marks Availability (FR-008, FR-009)

**Given**: A proxy user is registered and authenticated
**When**: Proxy marks availability for an event
**Then**: Availability is recorded and visible to volunteers

```bash
# Register as proxy
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "proxy1@example.com",
    "password": "password123",
    "role": "proxy",
    "firstName": "Jane",
    "lastName": "Smith"
  }'

# Save proxy token
export PROXY_TOKEN="<token_from_response>"

# Mark availability for event
curl -X POST http://localhost:3000/api/proxy-availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROXY_TOKEN" \
  -d '{"eventId": "'$EVENT_ID'"}'

# Expected: 201 Created with availability object

# Verify availability visible
curl -X GET "http://localhost:3000/api/proxy-availability?eventId=$EVENT_ID" \
  -H "Authorization: Bearer $PROXY_TOKEN"

# Expected: Array with availability record
```

**Browser Test**:
1. Logout admin, register new user as proxy
2. Navigate to "Events" page
3. Click event "Soccer Practice Volunteer"
4. Click "Mark Available"
5. Verify availability indicator shows "You are available"

### Scenario 3: Volunteer Searches for Available Proxies (FR-011)

**Given**: A volunteer is assigned to an event
**When**: Volunteer searches for available proxies
**Then**: All proxies with availability for that event are shown

```bash
# Register as volunteer
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "volunteer1@example.com",
    "password": "password123",
    "role": "volunteer",
    "firstName": "John",
    "lastName": "Doe"
  }'

export VOLUNTEER_TOKEN="<token_from_response>"
export VOLUNTEER_ID="<id_from_user_object>"

# Admin creates volunteer assignment (normally done separately)
curl -X POST http://localhost:3000/api/volunteer-assignments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "volunteerId": "'$VOLUNTEER_ID'",
    "eventId": "'$EVENT_ID'"
  }'

export ASSIGNMENT_ID="<id_from_response>"

# Volunteer views available proxies for event
curl -X GET "http://localhost:3000/api/proxy-availability?eventId=$EVENT_ID" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"

# Expected: Array with proxy availability (including proxy1@example.com)
```

**Browser Test**:
1. Logout, login as volunteer1@example.com / password123
2. Navigate to "My Assignments"
3. Click on "Soccer Practice Volunteer" assignment
4. View "Available Proxies" section
5. Verify Jane Smith (proxy1) appears in list

### Scenario 4: Volunteer Sends Request to Proxy (FR-012)

**Given**: Volunteer has found a suitable proxy
**When**: Volunteer sends request to proxy
**Then**: Proxy receives the request

```bash
# Get proxy ID from availability
export PROXY_ID="<proxy_id_from_availability>"

# Volunteer sends request
curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" \
  -d '{
    "proxyId": "'$PROXY_ID'",
    "eventId": "'$EVENT_ID'",
    "volunteerAssignmentId": "'$ASSIGNMENT_ID'"
  }'

# Expected: 201 Created with request object (status: pending)
export REQUEST_ID="<id_from_response>"

# Proxy checks requests
curl -X GET "http://localhost:3000/api/requests?proxyId=$PROXY_ID" \
  -H "Authorization: Bearer $PROXY_TOKEN"

# Expected: Array with pending request

# Proxy checks notifications (FR-017)
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer $PROXY_TOKEN"

# Expected: Notification with type "request_received"
```

**Browser Test**:
1. As volunteer, click "Request Proxy" next to Jane Smith
2. Confirm request
3. Logout, login as proxy1@example.com / password123
4. Navigate to "Requests"
5. Verify request from John Doe appears

### Scenario 5: Proxy Accepts Request (FR-013, FR-014, FR-016, FR-023)

**Given**: Proxy has received a request
**When**: Proxy accepts the request
**Then**: Volunteer's requirement is fulfilled and both parties are notified

```bash
# Proxy accepts request
curl -X POST http://localhost:3000/api/requests/$REQUEST_ID/accept \
  -H "Authorization: Bearer $PROXY_TOKEN"

# Expected: 200 OK with request object (status: accepted)

# Verify volunteer assignment fulfilled
curl -X GET http://localhost:3000/api/volunteer-assignments \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"

# Expected: Assignment with fulfilled: true

# Volunteer checks notifications (FR-016)
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN"

# Expected: Notification with type "request_accepted"
```

**Browser Test**:
1. As proxy, click "Accept" on request from John Doe
2. Verify request status changes to "Accepted"
3. Logout, login as volunteer1@example.com / password123
4. Check notifications bell icon
5. Verify "Your request was accepted by Jane Smith"
6. Navigate to "My Assignments"
7. Verify assignment shows "Fulfilled by Jane Smith"

### Edge Case Tests

#### Edge Case 1: Proxy Cannot Accept Multiple Overlapping Requests (FR-024)

```bash
# Create second event at same time
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Basketball Practice Volunteer",
    "description": "Help with basketball practice",
    "date": "2025-10-15",
    "startTime": "16:00",
    "endTime": "18:00",
    "location": "Gym A"
  }'

export EVENT2_ID="<id_from_response>"

# Proxy marks available for second event
curl -X POST http://localhost:3000/api/proxy-availability \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $PROXY_TOKEN" \
  -d '{"eventId": "'$EVENT2_ID'"}'

# Second volunteer requests same proxy
# (create volunteer2, assignment2, request2 - omitted for brevity)

# Proxy tries to accept second request
curl -X POST http://localhost:3000/api/requests/$REQUEST2_ID/accept \
  -H "Authorization: Bearer $PROXY_TOKEN"

# Expected: 409 Conflict - "You are already assigned to an event at this time"
```

#### Edge Case 2: Volunteer Cannot Send Multiple Pending Requests

```bash
# Register second proxy
# Mark availability for EVENT_ID
# Volunteer tries to send second request while first is pending

curl -X POST http://localhost:3000/api/requests \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $VOLUNTEER_TOKEN" \
  -d '{
    "proxyId": "'$PROXY2_ID'",
    "eventId": "'$EVENT_ID'",
    "volunteerAssignmentId": "'$ASSIGNMENT_ID'"
  }'

# Expected: 409 Conflict - "You already have a pending request for this assignment"
```

## Validation Checklist

After completing all scenarios, verify:

- [x] Admin can create events (FR-001)
- [x] Events are persisted and viewable (FR-002)
- [x] Only admin can create events (403 for volunteer/proxy)
- [x] Users can only have one role (FR-006)
- [x] Proxy can mark availability (FR-008)
- [x] Proxy can view events (FR-009)
- [x] Volunteer can search available proxies (FR-011)
- [x] Volunteer can send requests (FR-012)
- [x] Proxy can accept/decline requests (FR-013)
- [x] Fulfilled status tracked (FR-014)
- [x] Volunteer notified on accept/decline (FR-016)
- [x] Proxy notified on request (FR-017)
- [x] Requirement fulfilled when accepted (FR-023)
- [x] No overlapping proxy assignments (FR-024)

## Cleanup

```bash
# Stop services
docker-compose down

# Or for k8s
kubectl delete -f k8s/

# Clean database
pnpm --filter backend migrate:down
```

## Troubleshooting

**Database connection errors**:
- Verify PostgreSQL is running: `docker ps`
- Check connection string in `packages/backend/.env`

**Build errors**:
- Ensure shared package built first: `pnpm --filter shared build`
- Clear node_modules: `rm -rf node_modules packages/*/node_modules && pnpm install`

**Authentication errors**:
- Verify JWT_SECRET set in backend .env
- Check token not expired (default 1h)

**CORS errors**:
- Verify backend CORS configured for http://localhost:5173
- Check frontend API_URL in .env

## Next Steps

After successful quickstart validation:
1. Run full test suite: `pnpm test`
2. Run contract tests: `pnpm test:contract`
3. Run integration tests: `pnpm test:integration`
4. Deploy to k8s cluster: `kubectl apply -f k8s/`
5. Run smoke tests against deployed environment
