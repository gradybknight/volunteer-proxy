import { Effect, Layer } from 'effect'
import { UserRepository as IUserRepository } from './interfaces'
import { Database } from '../infrastructure/Database'
import type { User, UserRole } from '@volunteer-proxy/shared'
import { DatabaseError, NotFoundError } from '@volunteer-proxy/shared'

interface UserRow {
  id: string
  email: string
  password_hash: string
  role: UserRole
  first_name: string
  last_name: string
  created_at: Date
  updated_at: Date
}

const rowToUser = (row: UserRow): User => ({
  id: row.id,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role,
  firstName: row.first_name,
  lastName: row.last_name,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
})

export const UserRepositoryLive = Layer.effect(
  IUserRepository,
  Effect.gen(function* (_) {
    const db = yield* _(Database)

    return {
      findById: (id: string) =>
        Effect.gen(function* (_) {
          const rows = yield* _(
            db.query<UserRow>('SELECT * FROM users WHERE id = $1', [id])
          )
          return rows.length > 0 ? rowToUser(rows[0]) : null
        }),

      findByEmail: (email: string) =>
        Effect.gen(function* (_) {
          const rows = yield* _(
            db.query<UserRow>('SELECT * FROM users WHERE email = $1', [email])
          )
          return rows.length > 0 ? rowToUser(rows[0]) : null
        }),

      create: (user: {
        email: string
        passwordHash: string
        role: UserRole
        firstName: string
        lastName: string
      }) =>
        Effect.gen(function* (_) {
          const rows = yield* _(
            db.query<UserRow>(
              `INSERT INTO users (email, password_hash, role, first_name, last_name)
               VALUES ($1, $2, $3, $4, $5)
               RETURNING *`,
              [user.email, user.passwordHash, user.role, user.firstName, user.lastName]
            )
          )
          return rowToUser(rows[0])
        }),

      update: (id: string, updates: Partial<User>) =>
        Effect.gen(function* (_) {
          const sets: string[] = []
          const values: any[] = []
          let paramCount = 1

          if (updates.email !== undefined) {
            sets.push(`email = $${paramCount++}`)
            values.push(updates.email)
          }
          if (updates.firstName !== undefined) {
            sets.push(`first_name = $${paramCount++}`)
            values.push(updates.firstName)
          }
          if (updates.lastName !== undefined) {
            sets.push(`last_name = $${paramCount++}`)
            values.push(updates.lastName)
          }

          if (sets.length === 0) {
            return yield* _(
              Effect.flatMap(
                IUserRepository,
                (repo) => repo.findById(id)
              ).pipe(
                Effect.flatMap((user) =>
                  user ? Effect.succeed(user) : Effect.fail(new NotFoundError({ message: 'User not found', resource: 'User', id }))
                )
              )
            )
          }

          values.push(id)
          const sql = `UPDATE users SET ${sets.join(', ')} WHERE id = $${paramCount} RETURNING *`

          const rows = yield* _(db.query<UserRow>(sql, values))

          if (rows.length === 0) {
            return yield* _(Effect.fail(new NotFoundError({ message: 'User not found', resource: 'User', id })))
          }

          return rowToUser(rows[0])
        }),
    }
  })
)
