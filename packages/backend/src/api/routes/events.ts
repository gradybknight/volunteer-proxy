import { FastifyInstance } from 'fastify'
import { Effect } from 'effect'
import { EventService } from '../../services/EventService'
import { AuthService } from '../../services/AuthService'
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth'
import { Schema as S } from '@effect/schema'
import { ValidCreateEventRequest } from '@volunteer-proxy/shared'

export const registerEventRoutes = (
  fastify: FastifyInstance,
  eventService: EventService,
  authService: AuthService
) => {
  const auth = authMiddleware(authService)

  // GET /api/events
  fastify.get('/api/events', { preHandler: auth }, async (request: AuthenticatedRequest, reply) => {
    const result = await Effect.runPromise(
      eventService.list().pipe(
        Effect.catchAll(() => Effect.succeed({ statusCode: 500, error: 'InternalError', message: 'Failed to fetch events' }))
      )
    )

    if ('statusCode' in result) {
      return reply.status(result.statusCode).send({ error: result.error, message: result.message })
    }

    return reply.status(200).send(result)
  })

  // POST /api/events
  fastify.post('/api/events', { preHandler: auth }, async (request: AuthenticatedRequest, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' })
    }

    const result = await Effect.runPromise(
      Effect.gen(function* (_) {
        const data = yield* _(S.decodeUnknown(ValidCreateEventRequest)(request.body))
        return yield* _(eventService.create(data, request.user!.userId, request.user!.role))
      }).pipe(
        Effect.catchAll((error) => {
          if (error._tag === 'ForbiddenError') {
            return Effect.succeed({ statusCode: 403, error: error._tag, message: error.message })
          }
          if (error._tag === 'ParseError') {
            return Effect.succeed({ statusCode: 400, error: 'ValidationError', message: 'Invalid event data' })
          }
          return Effect.succeed({ statusCode: 500, error: 'InternalError', message: 'Failed to create event' })
        })
      )
    )

    if ('statusCode' in result) {
      return reply.status(result.statusCode).send({ error: result.error, message: result.message })
    }

    return reply.status(201).send(result)
  })

  // GET /api/events/:eventId
  fastify.get('/api/events/:eventId', { preHandler: auth }, async (request: AuthenticatedRequest, reply) => {
    const { eventId } = request.params as { eventId: string }

    const result = await Effect.runPromise(
      eventService.getById(eventId).pipe(
        Effect.catchAll((error) => {
          if (error._tag === 'NotFoundError') {
            return Effect.succeed({ statusCode: 404, error: error._tag, message: error.message })
          }
          return Effect.succeed({ statusCode: 500, error: 'InternalError', message: 'Failed to fetch event' })
        })
      )
    )

    if ('statusCode' in result) {
      return reply.status(result.statusCode).send({ error: result.error, message: result.message })
    }

    return reply.status(200).send(result)
  })
}
