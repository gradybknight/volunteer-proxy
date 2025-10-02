import { Schema as S } from "@effect/schema"

export const ProxyAvailability = S.Struct({
  id: S.UUID,
  proxyId: S.UUID,
  eventId: S.UUID,
  createdAt: S.Date,
  updatedAt: S.Date,
})

export type ProxyAvailability = S.Schema.Type<typeof ProxyAvailability>

// For creating proxy availability
export const CreateProxyAvailabilityRequest = S.Struct({
  eventId: S.UUID,
})

export type CreateProxyAvailabilityRequest = S.Schema.Type<typeof CreateProxyAvailabilityRequest>
