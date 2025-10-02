import { FastifyInstance } from 'fastify'
import { Effect } from 'effect'
import { AuthService } from '../../services/AuthService'
import { Schema as S } from '@effect/schema'
import { CreateUserRequest } from '@volunteer-proxy/shared'

export const registerAuthRoutes = (fastify: FastifyInstance, authService: AuthService) => {
  // POST /api/auth/register
  fastify.post('/api/auth/register', async (request, reply) => {
    const result = await Effect.runPromise(
      Effect.gen(function* (_) {
        // Validate request body
        const data = yield* _(S.decodeUnknown(CreateUserRequest)(request.body))

        // Register user
        return yield* _(authService.register(data))
      }).pipe(
        Effect.catchAll((error) => {
          if (error._tag === 'ConflictError') {
            return Effect.succeed({ statusCode: 409, error: error._tag, message: error.message })
          }
          if (error._tag === 'ParseError') {
            return Effect.succeed({ statusCode: 400, error: 'ValidationError', message: 'Invalid request data' })
          }
          return Effect.succeed({ statusCode: 500, error: 'InternalError', message: 'Internal server error' })
        })
      )
    )

    if ('statusCode' in result) {
      return reply.status(result.statusCode).send({ error: result.error, message: result.message })
    }

    return reply.status(201).send(result)
  })

  // POST /api/auth/login
  fastify.post('/api/auth/login', async (request, reply) => {
    const body = request.body as { email: string; password: string }

    const result = await Effect.runPromise(
      authService.login(body.email, body.password).pipe(
        Effect.catchAll((error) => {
          if (error._tag === 'AuthError') {
            return Effect.succeed({ statusCode: 401, error: error._tag, message: error.message })
          }
          return Effect.succeed({ statusCode: 500, error: 'InternalError', message: 'Internal server error' })
        })
      )
    )

    if ('statusCode' in result) {
      return reply.status(result.statusCode).send({ error: result.error, message: result.message })
    }

    return reply.status(200).send(result)
  })
}
