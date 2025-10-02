import { Effect, Layer } from 'effect'
import { NotificationRepository as INotificationRepository } from './interfaces'
import { Database } from '../infrastructure/Database'
import type { Notification, CreateNotificationRequest } from '@volunteer-proxy/shared'

export const NotificationRepositoryLive = Layer.effect(
  INotificationRepository,
  Effect.gen(function* (_) {
    const db = yield* _(Database)

    return {
      create: (notification: CreateNotificationRequest) =>
        db.query<Notification>(
          `INSERT INTO notifications (user_id, type, message, related_request_id, read)
           VALUES ($1, $2, $3, $4, false) RETURNING *`,
          [notification.userId, notification.type, notification.message, notification.relatedRequestId]
        ).pipe(Effect.map((rows) => rows[0])),

      findByUser: (userId: string, unreadOnly?: boolean) =>
        unreadOnly
          ? db.query<Notification>(
              'SELECT * FROM notifications WHERE user_id = $1 AND read = false ORDER BY created_at DESC',
              [userId]
            )
          : db.query<Notification>(
              'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
              [userId]
            ),

      markAsRead: (id: string) =>
        db.query<Notification>(`UPDATE notifications SET read = true WHERE id = $1 RETURNING *`, [id]).pipe(
          Effect.map((rows) => rows[0])
        ),
    }
  })
)
