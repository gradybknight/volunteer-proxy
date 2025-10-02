import { FastifyInstance } from 'fastify'
import { Effect } from 'effect'
import { RequestService } from '../../services/RequestService'
import { AuthService } from '../../services/AuthService'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'
import { Schema as S } from '@effect/schema'
import { CreateRequestRequest } from '@volunteer-proxy/shared'

export const registerRequestRoutes = (
  fastify: FastifyInstance,
  requestService: RequestService,
  authService: AuthService
) => {
  const auth = authMiddleware(authService)

  // GET /api/requests
  fastify.get('/api/requests', { preHandler: auth }, async (request: AuthenticatedRequest, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const result = await Effect.runPromise(
      requestService.listByUser(request.user.userId, request.user.role).pipe(
        Effect.catchAll(() => Effect.succeed({ statusCode: 500, error: 'InternalError' }))
      )
    )

    if ('statusCode' in result) {
      return reply.status(result.statusCode).send({ error: result.error })
    }

    return reply.status(200).send(result)
  })

  // POST /api/requests
  fastify.post('/api/requests', { preHandler: auth }, async (request: AuthenticatedRequest, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const result = await Effect.runPromise(
      Effect.gen(function* (_) {
        const data = yield* _(S.decodeUnknown(CreateRequestRequest)(request.body))
        return yield* _(requestService.create(data, request.user!.userId))
      }).pipe(
        Effect.catchAll((error) => {
          if (error._tag === 'NotFoundError') {
            return Effect.succeed({ statusCode: 404, error: error._tag, message: error.message })
          }
          if (error._tag === 'ConflictError') {
            return Effect.succeed({ statusCode: 409, error: error._tag, message: error.message })
          }
          return Effect.succeed({ statusCode: 500, error: 'InternalError', message: 'Failed to create request' })
        })
      )
    )

    if ('statusCode' in result) {
      return reply.status(result.statusCode).send({ error: result.error, message: result.message })
    }

    return reply.status(201).send(result)
  })

  // POST /api/requests/:requestId/accept
  fastify.post('/api/requests/:requestId/accept', { preHandler: auth }, async (request: AuthenticatedRequest, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const { requestId } = request.params as { requestId: string }

    const result = await Effect.runPromise(
      requestService.accept(requestId, request.user.userId).pipe(
        Effect.catchAll((error) => {
          if (error._tag === 'NotFoundError') {
            return Effect.succeed({ statusCode: 404, error: error._tag, message: error.message })
          }
          if (error._tag === 'ForbiddenError') {
            return Effect.succeed({ statusCode: 403, error: error._tag, message: error.message })
          }
          if (error._tag === 'ConflictError') {
            return Effect.succeed({ statusCode: 409, error: error._tag, message: error.message })
          }
          return Effect.succeed({ statusCode: 500, error: 'InternalError', message: 'Failed to accept request' })
        })
      )
    )

    if ('statusCode' in result) {
      return reply.status(result.statusCode).send({ error: result.error, message: result.message })
    }

    return reply.status(200).send(result)
  })

  // POST /api/requests/:requestId/decline
  fastify.post('/api/requests/:requestId/decline', { preHandler: auth }, async (request: AuthenticatedRequest, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' })
    }

    const { requestId } = request.params as { requestId: string }

    const result = await Effect.runPromise(
      requestService.decline(requestId, request.user.userId).pipe(
        Effect.catchAll((error) => {
          if (error._tag === 'NotFoundError') {
            return Effect.succeed({ statusCode: 404, error: error._tag, message: error.message })
          }
          if (error._tag === 'ForbiddenError') {
            return Effect.succeed({ statusCode: 403, error: error._tag, message: error.message })
          }
          if (error._tag === 'ConflictError') {
            return Effect.succeed({ statusCode: 409, error: error._tag, message: error.message })
          }
          return Effect.succeed({ statusCode: 500, error: 'InternalError', message: 'Failed to decline request' })
        })
      )
    )

    if ('statusCode' in result) {
      return reply.status(result.statusCode).send({ error: result.error, message: result.message })
    }

    return reply.status(200).send(result)
  })
}
