import { Effect, Context, Layer } from 'effect'
import { EventRepository } from '../repositories/interfaces'
import { ForbiddenError, NotFoundError, type Event, type CreateEventRequest } from '@volunteer-proxy/shared'

export interface EventService {
  readonly create: (event: CreateEventRequest, createdById: string, userRole: string) => Effect.Effect<Event>
  readonly list: (filters?: { date?: Date }) => Effect.Effect<Event[]>
  readonly getById: (id: string) => Effect.Effect<Event>
}

export const EventService = Context.GenericTag<EventService>('@services/EventService')

export const EventServiceLive = Layer.effect(
  EventService,
  Effect.gen(function* (_) {
    const eventRepo = yield* _(EventRepository)

    return {
      create: (event, createdById, userRole) =>
        Effect.gen(function* (_) {
          if (userRole !== 'admin') {
            return yield* _(
              Effect.fail(new ForbiddenError({ message: 'Only admins can create events', requiredRole: 'admin' }))
            )
          }

          return yield* _(eventRepo.create({ ...event, createdById }))
        }),

      list: (filters) => eventRepo.list(filters),

      getById: (id) =>
        Effect.gen(function* (_) {
          const event = yield* _(eventRepo.findById(id))
          if (!event) {
            return yield* _(Effect.fail(new NotFoundError({ message: 'Event not found', resource: 'Event', id })))
          }
          return event
        }),
    }
  })
)
