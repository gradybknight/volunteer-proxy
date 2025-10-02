import { FastifyRequest, FastifyReply } from 'fastify'
import { Effect } from 'effect'
import { AuthService } from '../../services/AuthService'
import { AuthError } from '@volunteer-proxy/shared'

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    userId: string
    role: string
  }
}

export const authMiddleware = (authService: AuthService) => {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7)

    const result = await Effect.runPromise(
      authService.verifyToken(token).pipe(
        Effect.catchAll((error) => Effect.fail(error))
      )
    ).catch((error) => {
      return { error: true, message: error.message }
    })

    if ('error' in result) {
      return reply.status(401).send({ error: 'Unauthorized', message: result.message })
    }

    request.user = result

    return
  }
}
