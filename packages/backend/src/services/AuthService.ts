import { Effect, Context, Layer } from 'effect'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import { UserRepository } from '../repositories/interfaces'
import { AuthError, ConflictError, type User, type UserRole } from '@volunteer-proxy/shared'

export interface AuthService {
  readonly register: (data: {
    email: string
    password: string
    role: UserRole
    firstName: string
    lastName: string
  }) => Effect.Effect<{ token: string; user: Omit<User, 'passwordHash'> }>
  readonly login: (email: string, password: string) => Effect.Effect<{ token: string; user: Omit<User, 'passwordHash'> }>
  readonly verifyToken: (token: string) => Effect.Effect<{ userId: string; role: UserRole }>
}

export const AuthService = Context.GenericTag<AuthService>('@services/AuthService')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '24h'

export const AuthServiceLive = Layer.effect(
  AuthService,
  Effect.gen(function* (_) {
    const userRepo = yield* _(UserRepository)

    const hashPassword = (password: string) =>
      Effect.promise(() => bcrypt.hash(password, 10))

    const comparePassword = (password: string, hash: string) =>
      Effect.promise(() => bcrypt.compare(password, hash))

    const generateToken = (userId: string, role: UserRole) =>
      Effect.sync(() =>
        jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
      )

    const removePasswordHash = (user: User): Omit<User, 'passwordHash'> => {
      const { passwordHash, ...userWithoutPassword } = user
      return userWithoutPassword
    }

    return {
      register: (data) =>
        Effect.gen(function* (_) {
          // Check if user exists
          const existingUser = yield* _(userRepo.findByEmail(data.email))
          if (existingUser) {
            return yield* _(Effect.fail(new ConflictError({ message: 'Email already exists' })))
          }

          // Hash password
          const passwordHash = yield* _(hashPassword(data.password))

          // Create user
          const user = yield* _(
            userRepo.create({
              email: data.email,
              passwordHash,
              role: data.role,
              firstName: data.firstName,
              lastName: data.lastName,
            })
          )

          // Generate token
          const token = yield* _(generateToken(user.id, user.role))

          return {
            token,
            user: removePasswordHash(user),
          }
        }),

      login: (email, password) =>
        Effect.gen(function* (_) {
          // Find user
          const user = yield* _(userRepo.findByEmail(email))
          if (!user) {
            return yield* _(Effect.fail(new AuthError({ message: 'Invalid credentials' })))
          }

          // Verify password
          const isValid = yield* _(comparePassword(password, user.passwordHash))
          if (!isValid) {
            return yield* _(Effect.fail(new AuthError({ message: 'Invalid credentials' })))
          }

          // Generate token
          const token = yield* _(generateToken(user.id, user.role))

          return {
            token,
            user: removePasswordHash(user),
          }
        }),

      verifyToken: (token) =>
        Effect.try({
          try: () => {
            const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: UserRole }
            return { userId: decoded.userId, role: decoded.role }
          },
          catch: () => new AuthError({ message: 'Invalid or expired token' }),
        }),
    }
  })
)
