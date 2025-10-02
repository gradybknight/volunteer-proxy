import { Effect, Layer } from 'effect'
import { RequestRepository as IRequestRepository } from './interfaces'
import { Database } from '../infrastructure/Database'
import type { Request, CreateRequestRequest, RequestStatus } from '@volunteer-proxy/shared'

export const RequestRepositoryLive = Layer.effect(
  IRequestRepository,
  Effect.gen(function* (_) {
    const db = yield* _(Database)

    return {
      create: (request: CreateRequestRequest & { volunteerId: string }) =>
        db.query<Request>(
          `INSERT INTO requests (volunteer_id, proxy_id, event_id, status, volunteer_assignment_id)
           VALUES ($1, $2, $3, 'pending', $4) RETURNING *`,
          [request.volunteerId, request.proxyId, request.eventId, request.volunteerAssignmentId]
        ).pipe(Effect.map((rows) => rows[0])),

      findById: (id: string) =>
        db.query<Request>('SELECT * FROM requests WHERE id = $1', [id]).pipe(
          Effect.map((rows) => (rows.length > 0 ? rows[0] : null))
        ),

      updateStatus: (id: string, status: RequestStatus, respondedAt: Date) =>
        db.query<Request>(
          `UPDATE requests SET status = $2, responded_at = $3 WHERE id = $1 RETURNING *`,
          [id, status, respondedAt]
        ).pipe(Effect.map((rows) => rows[0])),

      findByVolunteer: (volunteerId: string, status?: RequestStatus) =>
        status
          ? db.query<Request>('SELECT * FROM requests WHERE volunteer_id = $1 AND status = $2', [volunteerId, status])
          : db.query<Request>('SELECT * FROM requests WHERE volunteer_id = $1', [volunteerId]),

      findByProxy: (proxyId: string, status?: RequestStatus) =>
        status
          ? db.query<Request>('SELECT * FROM requests WHERE proxy_id = $1 AND status = $2', [proxyId, status])
          : db.query<Request>('SELECT * FROM requests WHERE proxy_id = $1', [proxyId]),

      findPendingByAssignment: (assignmentId: string) =>
        db.query<Request>(
          `SELECT * FROM requests WHERE volunteer_assignment_id = $1 AND status = 'pending'`,
          [assignmentId]
        ),
    }
  })
)
