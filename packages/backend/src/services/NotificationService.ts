import { Effect, Context, Layer } from 'effect'
import { NotificationRepository } from '../repositories/interfaces'
import { NotFoundError, type Notification } from '@volunteer-proxy/shared'

export interface NotificationService {
  readonly listByUser: (userId: string, unreadOnly?: boolean) => Effect.Effect<Notification[]>
  readonly markAsRead: (id: string) => Effect.Effect<Notification>
}

export const NotificationService = Context.GenericTag<NotificationService>('@services/NotificationService')

export const NotificationServiceLive = Layer.effect(
  NotificationService,
  Effect.gen(function* (_) {
    const notificationRepo = yield* _(NotificationRepository)

    return {
      listByUser: (userId, unreadOnly) => notificationRepo.findByUser(userId, unreadOnly),

      markAsRead: (id) =>
        Effect.gen(function* (_) {
          try {
            return yield* _(notificationRepo.markAsRead(id))
          } catch (error) {
            return yield* _(Effect.fail(new NotFoundError({ message: 'Notification not found', resource: 'Notification', id })))
          }
        }),
    }
  })
)
