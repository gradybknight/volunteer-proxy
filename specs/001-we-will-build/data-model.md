# Data Model: Volunteer-Proxy Matching System

**Date**: 2025-10-01
**Feature**: Volunteer-Proxy Matching System
**Status**: Complete

## Entity Definitions

### User

**Purpose**: Represents all users in the system (admins, volunteers, proxies)

**Fields**:
- `id`: UUID - Primary key, unique identifier
- `email`: String - Unique, email address for login
- `password_hash`: String - Hashed password (bcrypt/argon2)
- `role`: Enum - One of: "admin" | "volunteer" | "proxy"
- `first_name`: String - User's first name
- `last_name`: String - User's last name
- `created_at`: Timestamp - Account creation time
- `updated_at`: Timestamp - Last modification time

**Validation Rules**:
- Email must be valid format and unique
- Role must be exactly one value (enforced by type, FR-006)
- Password hash must be present
- First and last name required

**State Transitions**: None (role is immutable after creation per FR-006)

**Effect Schema Definition**:
```typescript
import { Schema as S } from "@effect/schema"

export const UserRole = S.Literal("admin", "volunteer", "proxy")

export const User = S.Struct({
  id: S.UUID,
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  passwordHash: S.String,
  role: UserRole,
  firstName: S.String.pipe(S.minLength(1)),
  lastName: S.String.pipe(S.minLength(1)),
  createdAt: S.Date,
  updatedAt: S.Date,
})
```

### Event

**Purpose**: Represents a youth sports event requiring volunteer coverage

**Fields**:
- `id`: UUID - Primary key
- `title`: String - Event name/title
- `description`: String - Event details
- `date`: Date - Event date
- `start_time`: Time - Event start time
- `end_time`: Time - Event end time
- `location`: String - Physical location
- `created_by_id`: UUID - Foreign key to User (admin who created)
- `created_at`: Timestamp - Event creation time
- `updated_at`: Timestamp - Last modification time

**Validation Rules**:
- Start time must be before end time
- Date must be in the future (at creation time)
- Created by must be admin role user
- Title and location required

**State Transitions**:
- Draft → Published (future enhancement)
- Published → Cancelled (future enhancement)

**Effect Schema Definition**:
```typescript
export const Event = S.Struct({
  id: S.UUID,
  title: S.String.pipe(S.minLength(1), S.maxLength(200)),
  description: S.String,
  date: S.Date,
  startTime: S.String, // Time stored as HH:MM format
  endTime: S.String,
  location: S.String.pipe(S.minLength(1)),
  createdById: S.UUID,
  createdAt: S.Date,
  updatedAt: S.Date,
})

// Validation refinement: startTime < endTime
export const ValidEvent = Event.pipe(
  S.filter((event) => event.startTime < event.endTime, {
    message: () => "Start time must be before end time"
  })
)
```

### VolunteerAssignment

**Purpose**: Links volunteers to events they must cover

**Fields**:
- `id`: UUID - Primary key
- `volunteer_id`: UUID - Foreign key to User (role=volunteer)
- `event_id`: UUID - Foreign key to Event
- `fulfilled`: Boolean - Whether requirement is met
- `assigned_at`: Timestamp - When assignment was created
- `fulfilled_at`: Timestamp | null - When proxy accepted (null if not fulfilled)

**Validation Rules**:
- Volunteer ID must reference user with role=volunteer
- Event ID must reference valid event
- Unique constraint on (volunteer_id, event_id)

**State Transitions**:
- Unfulfilled (fulfilled=false) → Fulfilled (fulfilled=true) when proxy accepts

**Effect Schema Definition**:
```typescript
export const VolunteerAssignment = S.Struct({
  id: S.UUID,
  volunteerId: S.UUID,
  eventId: S.UUID,
  fulfilled: S.Boolean,
  assignedAt: S.Date,
  fulfilledAt: S.optional(S.Date),
})
```

### ProxyAvailability

**Purpose**: Represents a proxy indicating availability for a specific event

**Fields**:
- `id`: UUID - Primary key
- `proxy_id`: UUID - Foreign key to User (role=proxy)
- `event_id`: UUID - Foreign key to Event
- `created_at`: Timestamp - When availability was marked
- `updated_at`: Timestamp - Last modification

**Validation Rules**:
- Proxy ID must reference user with role=proxy
- Event ID must reference valid event
- Unique constraint on (proxy_id, event_id)
- Proxy cannot mark availability if already assigned to overlapping event (FR-024, FR-025)

**State Transitions**:
- Created → Deleted (proxy removes availability)
- Available → Assigned (when proxy accepts request, availability should remain or be removed based on business logic)

**Effect Schema Definition**:
```typescript
export const ProxyAvailability = S.Struct({
  id: S.UUID,
  proxyId: S.UUID,
  eventId: S.UUID,
  createdAt: S.Date,
  updatedAt: S.Date,
})
```

### Request

**Purpose**: Represents a volunteer's request for a proxy to cover their event

**Fields**:
- `id`: UUID - Primary key
- `volunteer_id`: UUID - Foreign key to User (role=volunteer)
- `proxy_id`: UUID - Foreign key to User (role=proxy)
- `event_id`: UUID - Foreign key to Event
- `status`: Enum - One of: "pending" | "accepted" | "declined"
- `volunteer_assignment_id`: UUID - Foreign key to VolunteerAssignment
- `created_at`: Timestamp - When request was sent
- `responded_at`: Timestamp | null - When proxy accepted/declined
- `updated_at`: Timestamp - Last modification

**Validation Rules**:
- Volunteer ID must reference user with role=volunteer
- Proxy ID must reference user with role=proxy
- Event ID must reference valid event
- Volunteer assignment ID must exist and match volunteer + event
- Unique constraint on (volunteer_assignment_id) when status = 'pending' or 'accepted'
  (prevents multiple active requests for same assignment)
- Proxy must have ProxyAvailability for the event

**State Transitions**:
- Created (status=pending) → Accepted (status=accepted) via proxy action
- Created (status=pending) → Declined (status=declined) via proxy action
- Cannot transition from accepted/declined back to pending

**Business Rules** (enforced at service layer):
- When status changes to 'accepted':
  - Set VolunteerAssignment.fulfilled = true
  - Set VolunteerAssignment.fulfilled_at = now
  - Decline all other pending requests for same volunteer assignment
  - Prevent proxy from accepting other requests for overlapping time slots (FR-024)

**Effect Schema Definition**:
```typescript
export const RequestStatus = S.Literal("pending", "accepted", "declined")

export const Request = S.Struct({
  id: S.UUID,
  volunteerId: S.UUID,
  proxyId: S.UUID,
  eventId: S.UUID,
  status: RequestStatus,
  volunteerAssignmentId: S.UUID,
  createdAt: S.Date,
  respondedAt: S.optional(S.Date),
  updatedAt: S.Date,
})
```

### Notification

**Purpose**: Represents notifications sent to users about system events

**Fields**:
- `id`: UUID - Primary key
- `user_id`: UUID - Foreign key to User (recipient)
- `type`: Enum - One of: "request_received" | "request_accepted" | "request_declined"
- `message`: String - Notification message
- `related_request_id`: UUID | null - Foreign key to Request (if applicable)
- `read`: Boolean - Whether user has read the notification
- `created_at`: Timestamp - When notification was created

**Validation Rules**:
- User ID must reference valid user
- Type must be valid enum value
- Message required

**Effect Schema Definition**:
```typescript
export const NotificationType = S.Literal(
  "request_received",
  "request_accepted",
  "request_declined"
)

export const Notification = S.Struct({
  id: S.UUID,
  userId: S.UUID,
  type: NotificationType,
  message: S.String.pipe(S.minLength(1)),
  relatedRequestId: S.optional(S.UUID),
  read: S.Boolean,
  createdAt: S.Date,
})
```

## Entity Relationships

```
User (admin) --creates--> Event
User (volunteer) --has--> VolunteerAssignment --references--> Event
User (proxy) --has--> ProxyAvailability --references--> Event
User (volunteer) --sends--> Request --references--> User (proxy)
Request --references--> Event
Request --references--> VolunteerAssignment
User --receives--> Notification
Notification --references--> Request (optional)
```

## Database Constraints

### Primary Keys
- All entities have UUID primary keys

### Foreign Keys
- Event.created_by_id → User.id
- VolunteerAssignment.volunteer_id → User.id
- VolunteerAssignment.event_id → Event.id
- ProxyAvailability.proxy_id → User.id
- ProxyAvailability.event_id → Event.id
- Request.volunteer_id → User.id
- Request.proxy_id → User.id
- Request.event_id → Event.id
- Request.volunteer_assignment_id → VolunteerAssignment.id
- Notification.user_id → User.id
- Notification.related_request_id → Request.id

### Unique Constraints
- User.email (unique)
- VolunteerAssignment(volunteer_id, event_id) (unique)
- ProxyAvailability(proxy_id, event_id) (unique)
- Request(volunteer_assignment_id) WHERE status IN ('pending', 'accepted') (partial unique)

### Check Constraints
- User.role IN ('admin', 'volunteer', 'proxy')
- Request.status IN ('pending', 'accepted', 'declined')
- Event: start_time < end_time

### Indexes
- User.email (unique index)
- Event.date, Event.start_time (for time range queries)
- VolunteerAssignment.volunteer_id
- VolunteerAssignment.event_id
- ProxyAvailability.event_id
- ProxyAvailability.proxy_id
- Request.event_id
- Request.proxy_id
- Request.volunteer_id
- Request.status
- Notification.user_id, Notification.read (for unread queries)

## Domain Invariants

These business rules must be enforced at the service layer:

1. **Single Role Per User** (FR-006): User.role is immutable after creation
2. **Admin-Only Event Creation** (FR-001): Only users with role=admin can create events
3. **No Overlapping Proxy Assignments** (FR-024, FR-025):
   - Proxy cannot accept requests for events with overlapping time ranges
   - Proxy cannot mark availability if already assigned to overlapping event
4. **Request Acceptance Side Effects** (FR-023):
   - When Request.status → 'accepted', set VolunteerAssignment.fulfilled = true
   - Auto-decline other pending requests for the same VolunteerAssignment
5. **Proxy Must Be Available** (FR-011): Volunteer can only send request to proxy with ProxyAvailability for that event
6. **Notification Generation** (FR-016, FR-017):
   - Create notification when request created (proxy receives)
   - Create notification when request accepted (volunteer receives)
   - Create notification when request declined (volunteer receives)

## Migration Strategy

Migrations will be written using a PostgreSQL migration tool (e.g., node-pg-migrate):

1. **Initial Schema** (001_initial_schema.sql):
   - Create all tables with fields, types, primary keys
   - Create foreign key constraints
   - Create unique constraints
   - Create check constraints
   - Create indexes

2. **Seed Data** (002_seed_admin.sql):
   - Create initial admin user for event creation

Future migrations will follow semantic versioning and include:
- Schema changes (add/modify columns)
- Data migrations (transform existing data)
- Index additions (performance optimization)

## Summary

Seven core entities model the volunteer-proxy matching domain: User, Event, VolunteerAssignment, ProxyAvailability, Request, Notification. All entities use Effect-ts schemas for type-safe validation. Database constraints enforce referential integrity and business rules. Service layer enforces complex domain invariants (overlapping events, request workflows). Ready for contract generation.
