import Fastify from 'fastify'
import cors from '@fastify/cors'
import { Effect, Layer } from 'effect'

export const createServer = () => {
  const fastify = Fastify({ logger: true })

  // CORS configuration
  fastify.register(cors, {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  })

  // Health check
  fastify.get('/health', async () => ({ status: 'ok' }))

  return fastify
}

export const startServer = (fastify: ReturnType<typeof createServer>, port: number = 3000) =>
  Effect.promise(() =>
    fastify.listen({ port, host: '0.0.0.0' }).then(() => {
      console.log(`🚀 Server listening on http://localhost:${port}`)
    })
  )
