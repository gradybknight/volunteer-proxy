import { Schema as S } from "@effect/schema"
import { Data } from "effect"

// Tagged union error types for domain errors
export class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string
  details?: Record<string, unknown>
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  message: string
  resource: string
  id?: string
}> {}

export class AuthError extends Data.TaggedError("AuthError")<{
  message: string
}> {}

export class ConflictError extends Data.TaggedError("ConflictError")<{
  message: string
  details?: Record<string, unknown>
}> {}

export class ForbiddenError extends Data.TaggedError("ForbiddenError")<{
  message: string
  requiredRole?: string
}> {}

export class DatabaseError extends Data.TaggedError("DatabaseError")<{
  message: string
  cause?: unknown
}> {}

// API Error Response Schema
export const ErrorResponse = S.Struct({
  error: S.String,
  message: S.String,
  details: S.optional(S.Record(S.String, S.Unknown)),
})

export type ErrorResponse = S.Schema.Type<typeof ErrorResponse>
