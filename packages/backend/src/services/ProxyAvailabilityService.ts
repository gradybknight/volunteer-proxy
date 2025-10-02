import { Effect, Context, Layer } from 'effect'
import { ProxyAvailabilityRepository } from '../repositories/interfaces'
import { ConflictError, type ProxyAvailability } from '@volunteer-proxy/shared'

export interface ProxyAvailabilityService {
  readonly markAvailable: (proxyId: string, eventId: string) => Effect.Effect<ProxyAvailability>
  readonly removeAvailability: (id: string) => Effect.Effect<void>
  readonly listByEvent: (eventId: string) => Effect.Effect<ProxyAvailability[]>
}

export const ProxyAvailabilityService = Context.GenericTag<ProxyAvailabilityService>('@services/ProxyAvailabilityService')

export const ProxyAvailabilityServiceLive = Layer.effect(
  ProxyAvailabilityService,
  Effect.gen(function* (_) {
    const availabilityRepo = yield* _(ProxyAvailabilityRepository)

    return {
      markAvailable: (proxyId, eventId) =>
        Effect.gen(function* (_) {
          // Check if already available
          const existing = yield* _(availabilityRepo.findByProxyAndEvent(proxyId, eventId))
          if (existing) {
            return yield* _(Effect.fail(new ConflictError({ message: 'Already marked as available for this event' })))
          }

          return yield* _(availabilityRepo.create({ proxyId, eventId }))
        }),

      removeAvailability: (id) => availabilityRepo.delete(id),

      listByEvent: (eventId) => availabilityRepo.findByEvent(eventId),
    }
  })
)
