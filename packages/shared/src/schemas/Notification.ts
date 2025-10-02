import { Schema as S } from "@effect/schema"

export const NotificationType = S.Literal(
  "request_received",
  "request_accepted",
  "request_declined"
)

export type NotificationType = S.Schema.Type<typeof NotificationType>

export const Notification = S.Struct({
  id: S.UUID,
  userId: S.UUID,
  type: NotificationType,
  message: S.String.pipe(S.minLength(1)),
  relatedRequestId: S.NullOr(S.UUID),
  read: S.Boolean,
  createdAt: S.Date,
})

export type Notification = S.Schema.Type<typeof Notification>

// For creating a notification
export const CreateNotificationRequest = S.Struct({
  userId: S.UUID,
  type: NotificationType,
  message: S.String.pipe(S.minLength(1)),
  relatedRequestId: S.NullOr(S.UUID),
})

export type CreateNotificationRequest = S.Schema.Type<typeof CreateNotificationRequest>
