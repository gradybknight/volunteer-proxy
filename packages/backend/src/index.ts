import { Effect, Layer } from 'effect'
import { createServer, startServer } from './api/server'
import { makeDatabaseLayer } from './infrastructure/Database'
import { UserRepositoryLive } from './repositories/UserRepository'
import { EventRepositoryLive } from './repositories/EventRepository'
import { VolunteerAssignmentRepositoryLive } from './repositories/VolunteerAssignmentRepository'
import { ProxyAvailabilityRepositoryLive } from './repositories/ProxyAvailabilityRepository'
import { RequestRepositoryLive } from './repositories/RequestRepository'
import { NotificationRepositoryLive } from './repositories/NotificationRepository'
import { AuthServiceLive } from './services/AuthService'
import { EventServiceLive } from './services/EventService'
import { RequestServiceLive } from './services/RequestService'
import { ProxyAvailabilityServiceLive } from './services/ProxyAvailabilityService'
import { NotificationServiceLive } from './services/NotificationService'
import { registerAuthRoutes } from './api/routes/auth'
import { registerEventRoutes } from './api/routes/events'
import { registerRequestRoutes } from './api/routes/requests'
import { AuthService } from './services/AuthService'
import { EventService } from './services/EventService'
import { RequestService } from './services/RequestService'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/volunteer_proxy'

// Build layers with proper dependency resolution
const DatabaseLayer = makeDatabaseLayer(DATABASE_URL)

const RepositoryLayer = Layer.mergeAll(
  UserRepositoryLive,
  EventRepositoryLive,
  VolunteerAssignmentRepositoryLive,
  ProxyAvailabilityRepositoryLive,
  RequestRepositoryLive,
  NotificationRepositoryLive
).pipe(Layer.provide(DatabaseLayer))

const ServiceLayer = Layer.mergeAll(
  AuthServiceLive,
  EventServiceLive,
  RequestServiceLive,
  ProxyAvailabilityServiceLive,
  NotificationServiceLive
).pipe(Layer.provide(RepositoryLayer))

const AppLayer = ServiceLayer

const program = Effect.gen(function* (_) {
  const authService = yield* _(AuthService)
  const eventService = yield* _(EventService)
  const requestService = yield* _(RequestService)

  const fastify = createServer()

  // Register routes
  registerAuthRoutes(fastify, authService)
  registerEventRoutes(fastify, eventService, authService)
  registerRequestRoutes(fastify, requestService, authService)

  // Start server
  yield* _(startServer(fastify, Number(process.env.PORT) || 3000))
})

// Run the application
Effect.runPromise(program.pipe(Effect.provide(AppLayer))).catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
