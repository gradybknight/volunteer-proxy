import { Effect, Context, Layer } from 'effect'
import {
  RequestRepository,
  VolunteerAssignmentRepository,
  ProxyAvailabilityRepository,
  NotificationRepository,
} from '../repositories/interfaces'
import { ConflictError, NotFoundError, ForbiddenError, type Request, type CreateRequestRequest } from '@volunteer-proxy/shared'

export interface RequestService {
  readonly create: (data: CreateRequestRequest, volunteerId: string) => Effect.Effect<Request>
  readonly accept: (requestId: string, proxyId: string) => Effect.Effect<Request>
  readonly decline: (requestId: string, proxyId: string) => Effect.Effect<Request>
  readonly listByUser: (userId: string, userRole: string) => Effect.Effect<Request[]>
}

export const RequestService = Context.GenericTag<RequestService>('@services/RequestService')

export const RequestServiceLive = Layer.effect(
  RequestService,
  Effect.gen(function* (_) {
    const requestRepo = yield* _(RequestRepository)
    const assignmentRepo = yield* _(VolunteerAssignmentRepository)
    const availabilityRepo = yield* _(ProxyAvailabilityRepository)
    const notificationRepo = yield* _(NotificationRepository)

    return {
      create: (data, volunteerId) =>
        Effect.gen(function* (_) {
          // Check proxy has availability
          const availability = yield* _(availabilityRepo.findByProxyAndEvent(data.proxyId, data.eventId))
          if (!availability) {
            return yield* _(
              Effect.fail(new NotFoundError({ message: 'Proxy is not available for this event', resource: 'ProxyAvailability' }))
            )
          }

          // Check no pending request exists
          const pendingRequests = yield* _(requestRepo.findPendingByAssignment(data.volunteerAssignmentId))
          if (pendingRequests.length > 0) {
            return yield* _(Effect.fail(new ConflictError({ message: 'A pending request already exists for this assignment' })))
          }

          // Create request
          const request = yield* _(requestRepo.create({ ...data, volunteerId }))

          // Notify proxy
          yield* _(
            notificationRepo.create({
              userId: data.proxyId,
              type: 'request_received',
              message: `You have a new proxy request for event ${data.eventId}`,
              relatedRequestId: request.id,
            })
          )

          return request
        }),

      accept: (requestId, proxyId) =>
        Effect.gen(function* (_) {
          const request = yield* _(requestRepo.findById(requestId))
          if (!request) {
            return yield* _(Effect.fail(new NotFoundError({ message: 'Request not found', resource: 'Request', id: requestId })))
          }

          if (request.proxyId !== proxyId) {
            return yield* _(Effect.fail(new ForbiddenError({ message: 'You can only accept your own requests' })))
          }

          if (request.status !== 'pending') {
            return yield* _(Effect.fail(new ConflictError({ message: 'Request has already been responded to' })))
          }

          // Update request
          const updatedRequest = yield* _(requestRepo.updateStatus(requestId, 'accepted', new Date()))

          // Mark assignment fulfilled
          yield* _(assignmentRepo.markFulfilled(request.volunteerAssignmentId, new Date()))

          // Decline other pending requests for same assignment
          const otherPending = yield* _(requestRepo.findPendingByAssignment(request.volunteerAssignmentId))
          for (const otherRequest of otherPending) {
            if (otherRequest.id !== requestId) {
              yield* _(requestRepo.updateStatus(otherRequest.id, 'declined', new Date()))
              yield* _(
                notificationRepo.create({
                  userId: otherRequest.volunteerId,
                  type: 'request_declined',
                  message: 'Your request was declined (assignment fulfilled by another proxy)',
                  relatedRequestId: otherRequest.id,
                })
              )
            }
          }

          // Notify volunteer
          yield* _(
            notificationRepo.create({
              userId: request.volunteerId,
              type: 'request_accepted',
              message: 'Your proxy request has been accepted!',
              relatedRequestId: requestId,
            })
          )

          return updatedRequest
        }),

      decline: (requestId, proxyId) =>
        Effect.gen(function* (_) {
          const request = yield* _(requestRepo.findById(requestId))
          if (!request) {
            return yield* _(Effect.fail(new NotFoundError({ message: 'Request not found', resource: 'Request', id: requestId })))
          }

          if (request.proxyId !== proxyId) {
            return yield* _(Effect.fail(new ForbiddenError({ message: 'You can only decline your own requests' })))
          }

          if (request.status !== 'pending') {
            return yield* _(Effect.fail(new ConflictError({ message: 'Request has already been responded to' })))
          }

          const updatedRequest = yield* _(requestRepo.updateStatus(requestId, 'declined', new Date()))

          // Notify volunteer
          yield* _(
            notificationRepo.create({
              userId: request.volunteerId,
              type: 'request_declined',
              message: 'Your proxy request was declined',
              relatedRequestId: requestId,
            })
          )

          return updatedRequest
        }),

      listByUser: (userId, userRole) =>
        userRole === 'volunteer'
          ? requestRepo.findByVolunteer(userId)
          : userRole === 'proxy'
          ? requestRepo.findByProxy(userId)
          : Effect.succeed([]),
    }
  })
)
