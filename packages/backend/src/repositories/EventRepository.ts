import { Effect, Layer } from 'effect'
import { EventRepository as IEventRepository } from './interfaces'
import { Database } from '../infrastructure/Database'
import type { Event, CreateEventRequest } from '@volunteer-proxy/shared'

export const EventRepositoryLive = Layer.effect(
  IEventRepository,
  Effect.gen(function* (_) {
    const db = yield* _(Database)

    return {
      create: (event: CreateEventRequest & { createdById: string }) =>
        db.query<Event>(
          `INSERT INTO events (title, description, date, start_time, end_time, location, created_by_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
          [event.title, event.description, event.date, event.startTime, event.endTime, event.location, event.createdById]
        ).pipe(Effect.map((rows) => rows[0])),

      findById: (id: string) =>
        db.query<Event>('SELECT * FROM events WHERE id = $1', [id]).pipe(
          Effect.map((rows) => (rows.length > 0 ? rows[0] : null))
        ),

      list: (filters?: { date?: Date }) =>
        filters?.date
          ? db.query<Event>('SELECT * FROM events WHERE date = $1 ORDER BY date, start_time', [filters.date])
          : db.query<Event>('SELECT * FROM events ORDER BY date, start_time'),

      findByDateRange: (startDate: Date, endDate: Date) =>
        db.query<Event>(
          'SELECT * FROM events WHERE date BETWEEN $1 AND $2 ORDER BY date, start_time',
          [startDate, endDate]
        ),
    }
  })
)
