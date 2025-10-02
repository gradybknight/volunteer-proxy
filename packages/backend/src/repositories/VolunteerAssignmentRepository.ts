import { Effect, Layer } from 'effect'
import { VolunteerAssignmentRepository as IVolunteerAssignmentRepository } from './interfaces'
import { Database } from '../infrastructure/Database'
import type { VolunteerAssignment, CreateVolunteerAssignmentRequest } from '@volunteer-proxy/shared'

export const VolunteerAssignmentRepositoryLive = Layer.effect(
  IVolunteerAssignmentRepository,
  Effect.gen(function* (_) {
    const db = yield* _(Database)

    return {
      create: (assignment: CreateVolunteerAssignmentRequest) =>
        db.query<VolunteerAssignment>(
          `INSERT INTO volunteer_assignments (volunteer_id, event_id, fulfilled)
           VALUES ($1, $2, false) RETURNING *`,
          [assignment.volunteerId, assignment.eventId]
        ).pipe(Effect.map((rows) => rows[0])),

      findByVolunteer: (volunteerId: string) =>
        db.query<VolunteerAssignment>(
          'SELECT * FROM volunteer_assignments WHERE volunteer_id = $1',
          [volunteerId]
        ),

      findByEvent: (eventId: string) =>
        db.query<VolunteerAssignment>(
          'SELECT * FROM volunteer_assignments WHERE event_id = $1',
          [eventId]
        ),

      findById: (id: string) =>
        db.query<VolunteerAssignment>('SELECT * FROM volunteer_assignments WHERE id = $1', [id]).pipe(
          Effect.map((rows) => (rows.length > 0 ? rows[0] : null))
        ),

      markFulfilled: (id: string, fulfilledAt: Date) =>
        db.query<VolunteerAssignment>(
          `UPDATE volunteer_assignments SET fulfilled = true, fulfilled_at = $2 WHERE id = $1 RETURNING *`,
          [id, fulfilledAt]
        ).pipe(Effect.map((rows) => rows[0])),
    }
  })
)
