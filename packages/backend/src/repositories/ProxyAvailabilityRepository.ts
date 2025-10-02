import { Effect, Layer } from 'effect'
import { ProxyAvailabilityRepository as IProxyAvailabilityRepository } from './interfaces'
import { Database } from '../infrastructure/Database'
import type { ProxyAvailability } from '@volunteer-proxy/shared'

export const ProxyAvailabilityRepositoryLive = Layer.effect(
  IProxyAvailabilityRepository,
  Effect.gen(function* (_) {
    const db = yield* _(Database)

    return {
      create: (availability: { proxyId: string; eventId: string }) =>
        db.query<ProxyAvailability>(
          `INSERT INTO proxy_availability (proxy_id, event_id) VALUES ($1, $2) RETURNING *`,
          [availability.proxyId, availability.eventId]
        ).pipe(Effect.map((rows) => rows[0])),

      delete: (id: string) =>
        db.query('DELETE FROM proxy_availability WHERE id = $1', [id]).pipe(Effect.asVoid),

      findByEvent: (eventId: string) =>
        db.query<ProxyAvailability>('SELECT * FROM proxy_availability WHERE event_id = $1', [eventId]),

      findByProxy: (proxyId: string) =>
        db.query<ProxyAvailability>('SELECT * FROM proxy_availability WHERE proxy_id = $1', [proxyId]),

      findByProxyAndEvent: (proxyId: string, eventId: string) =>
        db.query<ProxyAvailability>(
          'SELECT * FROM proxy_availability WHERE proxy_id = $1 AND event_id = $2',
          [proxyId, eventId]
        ).pipe(Effect.map((rows) => (rows.length > 0 ? rows[0] : null))),
    }
  })
)
