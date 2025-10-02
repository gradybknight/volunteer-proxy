import { Effect, Context, Layer } from 'effect'
import type * as Schemas from '@volunteer-proxy/shared'

export interface ApiClient {
  readonly register: (data: Schemas.CreateUserRequest) => Effect.Effect<{ token: string; user: Schemas.User }>
  readonly login: (email: string, password: string) => Effect.Effect<{ token: string; user: Schemas.User }>
  readonly listEvents: () => Effect.Effect<Schemas.Event[]>
  readonly createEvent: (event: Schemas.CreateEventRequest) => Effect.Effect<Schemas.Event>
  readonly getEvent: (id: string) => Effect.Effect<Schemas.Event>
  readonly listRequests: () => Effect.Effect<Schemas.Request[]>
  readonly createRequest: (data: Schemas.CreateRequestRequest) => Effect.Effect<Schemas.Request>
  readonly acceptRequest: (id: string) => Effect.Effect<Schemas.Request>
  readonly declineRequest: (id: string) => Effect.Effect<Schemas.Request>
  readonly listNotifications: (unreadOnly?: boolean) => Effect.Effect<Schemas.Notification[]>
  readonly markNotificationRead: (id: string) => Effect.Effect<Schemas.Notification>
  readonly getCurrentUser: () => Effect.Effect<Schemas.User>
  readonly listProxyAvailability: (eventId: string) => Effect.Effect<Schemas.ProxyAvailability[]>
  readonly markProxyAvailable: (eventId: string) => Effect.Effect<Schemas.ProxyAvailability>
  readonly listVolunteerAssignments: () => Effect.Effect<Schemas.VolunteerAssignment[]>
}

export const ApiClient = Context.GenericTag<ApiClient>('@services/ApiClient')

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const makeApiClient = (getToken: () => string | null): ApiClient => {
  const fetchWithAuth = (url: string, options: RequestInit = {}) =>
    Effect.tryPromise({
      try: async () => {
        const token = getToken()
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...options.headers,
        }

        if (token) {
          headers['Authorization'] = `Bearer ${token}`
        }

        const response = await fetch(`${API_BASE_URL}${url}`, {
          ...options,
          headers,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'API request failed')
        }

        return response.json()
      },
      catch: (error) => new Error(String(error)),
    })

  return {
    register: (data) =>
      fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    login: (email, password) =>
      fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    listEvents: () => fetchWithAuth('/events'),

    createEvent: (event) =>
      fetchWithAuth('/events', {
        method: 'POST',
        body: JSON.stringify(event),
      }),

    getEvent: (id) => fetchWithAuth(`/events/${id}`),

    listRequests: () => fetchWithAuth('/requests'),

    createRequest: (data) =>
      fetchWithAuth('/requests', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    acceptRequest: (id) =>
      fetchWithAuth(`/requests/${id}/accept`, {
        method: 'POST',
      }),

    declineRequest: (id) =>
      fetchWithAuth(`/requests/${id}/decline`, {
        method: 'POST',
      }),

    listNotifications: (unreadOnly) =>
      fetchWithAuth(`/notifications${unreadOnly ? '?unread=true' : ''}`),

    markNotificationRead: (id) =>
      fetchWithAuth(`/notifications/${id}/read`, {
        method: 'POST',
      }),

    getCurrentUser: () => fetchWithAuth('/users/me'),

    listProxyAvailability: (eventId) => fetchWithAuth(`/proxy-availability?eventId=${eventId}`),

    markProxyAvailable: (eventId) =>
      fetchWithAuth('/proxy-availability', {
        method: 'POST',
        body: JSON.stringify({ eventId }),
      }),

    listVolunteerAssignments: () => fetchWithAuth('/volunteer-assignments'),
  }
}
