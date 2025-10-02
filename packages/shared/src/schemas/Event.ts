import { Schema as S } from "@effect/schema"

export const Event = S.Struct({
  id: S.UUID,
  title: S.String.pipe(S.minLength(1), S.maxLength(200)),
  description: S.String,
  date: S.DateFromSelf,
  startTime: S.String.pipe(S.pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)),
  endTime: S.String.pipe(S.pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)),
  location: S.String.pipe(S.minLength(1)),
  createdById: S.UUID,
  createdAt: S.DateFromSelf,
  updatedAt: S.DateFromSelf,
})

export type Event = S.Schema.Type<typeof Event>

// Validation refinement: startTime < endTime
export const ValidEvent = Event.pipe(
  S.filter((event): event is Event => event.startTime < event.endTime, {
    message: () => "Start time must be before end time"
  })
)

export type ValidEvent = S.Schema.Type<typeof ValidEvent>

// For creating a new event
export const CreateEventRequest = S.Struct({
  title: S.String.pipe(S.minLength(1), S.maxLength(200)),
  description: S.String,
  date: S.DateFromSelf,
  startTime: S.String.pipe(S.pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)),
  endTime: S.String.pipe(S.pattern(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)),
  location: S.String.pipe(S.minLength(1)),
})

export type CreateEventRequest = S.Schema.Type<typeof CreateEventRequest>

export const ValidCreateEventRequest = CreateEventRequest.pipe(
  S.filter((event): event is CreateEventRequest => event.startTime < event.endTime, {
    message: () => "Start time must be before end time"
  })
)

export type ValidCreateEventRequest = S.Schema.Type<typeof ValidCreateEventRequest>
