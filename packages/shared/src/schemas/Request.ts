import { Schema as S } from "@effect/schema"

export const RequestStatus = S.Literal("pending", "accepted", "declined")

export type RequestStatus = S.Schema.Type<typeof RequestStatus>

export const Request = S.Struct({
  id: S.UUID,
  volunteerId: S.UUID,
  proxyId: S.UUID,
  eventId: S.UUID,
  status: RequestStatus,
  volunteerAssignmentId: S.UUID,
  createdAt: S.Date,
  respondedAt: S.NullOr(S.Date),
  updatedAt: S.Date,
})

export type Request = S.Schema.Type<typeof Request>

// For creating a new request
export const CreateRequestRequest = S.Struct({
  proxyId: S.UUID,
  eventId: S.UUID,
  volunteerAssignmentId: S.UUID,
})

export type CreateRequestRequest = S.Schema.Type<typeof CreateRequestRequest>
