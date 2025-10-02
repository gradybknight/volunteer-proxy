import { Effect, Context } from 'effect'
import type * as Schemas from '@volunteer-proxy/shared'

// Repository interfaces as Effect Requirements

export interface UserRepository {
  readonly findById: (id: string) => Effect.Effect<Schemas.User | null>
  readonly findByEmail: (email: string) => Effect.Effect<Schemas.User | null>
  readonly create: (user: {
    email: string
    passwordHash: string
    role: Schemas.UserRole
    firstName: string
    lastName: string
  }) => Effect.Effect<Schemas.User>
  readonly update: (id: string, updates: Partial<Schemas.User>) => Effect.Effect<Schemas.User>
}

export const UserRepository = Context.GenericTag<UserRepository>('@services/UserRepository')

export interface EventRepository {
  readonly create: (event: Schemas.CreateEventRequest & { createdById: string }) => Effect.Effect<Schemas.Event>
  readonly findById: (id: string) => Effect.Effect<Schemas.Event | null>
  readonly list: (filters?: { date?: Date }) => Effect.Effect<Schemas.Event[]>
  readonly findByDateRange: (startDate: Date, endDate: Date) => Effect.Effect<Schemas.Event[]>
}

export const EventRepository = Context.GenericTag<EventRepository>('@services/EventRepository')

export interface VolunteerAssignmentRepository {
  readonly create: (assignment: Schemas.CreateVolunteerAssignmentRequest) => Effect.Effect<Schemas.VolunteerAssignment>
  readonly findByVolunteer: (volunteerId: string) => Effect.Effect<Schemas.VolunteerAssignment[]>
  readonly findByEvent: (eventId: string) => Effect.Effect<Schemas.VolunteerAssignment[]>
  readonly findById: (id: string) => Effect.Effect<Schemas.VolunteerAssignment | null>
  readonly markFulfilled: (id: string, fulfilledAt: Date) => Effect.Effect<Schemas.VolunteerAssignment>
}

export const VolunteerAssignmentRepository = Context.GenericTag<VolunteerAssignmentRepository>(
  '@services/VolunteerAssignmentRepository'
)

export interface ProxyAvailabilityRepository {
  readonly create: (availability: { proxyId: string; eventId: string }) => Effect.Effect<Schemas.ProxyAvailability>
  readonly delete: (id: string) => Effect.Effect<void>
  readonly findByEvent: (eventId: string) => Effect.Effect<Schemas.ProxyAvailability[]>
  readonly findByProxy: (proxyId: string) => Effect.Effect<Schemas.ProxyAvailability[]>
  readonly findByProxyAndEvent: (proxyId: string, eventId: string) => Effect.Effect<Schemas.ProxyAvailability | null>
}

export const ProxyAvailabilityRepository = Context.GenericTag<ProxyAvailabilityRepository>(
  '@services/ProxyAvailabilityRepository'
)

export interface RequestRepository {
  readonly create: (request: Schemas.CreateRequestRequest & { volunteerId: string }) => Effect.Effect<Schemas.Request>
  readonly findById: (id: string) => Effect.Effect<Schemas.Request | null>
  readonly updateStatus: (
    id: string,
    status: Schemas.RequestStatus,
    respondedAt: Date
  ) => Effect.Effect<Schemas.Request>
  readonly findByVolunteer: (volunteerId: string, status?: Schemas.RequestStatus) => Effect.Effect<Schemas.Request[]>
  readonly findByProxy: (proxyId: string, status?: Schemas.RequestStatus) => Effect.Effect<Schemas.Request[]>
  readonly findPendingByAssignment: (assignmentId: string) => Effect.Effect<Schemas.Request[]>
}

export const RequestRepository = Context.GenericTag<RequestRepository>('@services/RequestRepository')

export interface NotificationRepository {
  readonly create: (notification: Schemas.CreateNotificationRequest) => Effect.Effect<Schemas.Notification>
  readonly findByUser: (userId: string, unreadOnly?: boolean) => Effect.Effect<Schemas.Notification[]>
  readonly markAsRead: (id: string) => Effect.Effect<Schemas.Notification>
}

export const NotificationRepository = Context.GenericTag<NotificationRepository>('@services/NotificationRepository')
