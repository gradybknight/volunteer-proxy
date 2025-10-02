import { Schema as S } from "@effect/schema"

export const UserRole = S.Literal("admin", "volunteer", "proxy")

export type UserRole = S.Schema.Type<typeof UserRole>

export const User = S.Struct({
  id: S.UUID,
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  passwordHash: S.String,
  role: UserRole,
  firstName: S.String.pipe(S.minLength(1)),
  lastName: S.String.pipe(S.minLength(1)),
  createdAt: S.DateFromSelf,
  updatedAt: S.DateFromSelf,
})

export type User = S.Schema.Type<typeof User>

// For creating a new user (without generated fields)
export const CreateUserRequest = S.Struct({
  email: S.String.pipe(S.pattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)),
  password: S.String.pipe(S.minLength(8)),
  role: UserRole,
  firstName: S.String.pipe(S.minLength(1)),
  lastName: S.String.pipe(S.minLength(1)),
})

export type CreateUserRequest = S.Schema.Type<typeof CreateUserRequest>
