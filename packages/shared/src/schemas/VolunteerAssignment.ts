import { Schema as S } from "@effect/schema"

export const VolunteerAssignment = S.Struct({
  id: S.UUID,
  volunteerId: S.UUID,
  eventId: S.UUID,
  fulfilled: S.Boolean,
  assignedAt: S.DateFromSelf,
  fulfilledAt: S.NullOr(S.DateFromSelf),
})

export type VolunteerAssignment = S.Schema.Type<typeof VolunteerAssignment>

// For creating a new assignment
export const CreateVolunteerAssignmentRequest = S.Struct({
  volunteerId: S.UUID,
  eventId: S.UUID,
})

export type CreateVolunteerAssignmentRequest = S.Schema.Type<typeof CreateVolunteerAssignmentRequest>
