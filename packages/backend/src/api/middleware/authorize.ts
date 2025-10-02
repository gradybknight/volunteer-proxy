import { FastifyReply } from 'fastify'
import { AuthenticatedRequest } from './auth'

export const authorizeRole = (allowedRoles: string[]) => {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' })
    }

    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({
        error: 'Forbidden',
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`,
      })
    }

    return
  }
}
