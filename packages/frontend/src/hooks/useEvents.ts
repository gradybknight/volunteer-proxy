import { useState, useEffect } from 'react'
import { Effect } from 'effect'
import type { Event, CreateEventRequest } from '@volunteer-proxy/shared'
import { makeApiClient } from '../services/ApiClient'

export const useEvents = (token: string | null) => {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const apiClient = makeApiClient(() => token)

  const fetchEvents = async () => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const result = await Effect.runPromise(apiClient.listEvents())
      setEvents(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch events')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [token])

  const createEvent = async (data: CreateEventRequest) => {
    setLoading(true)
    setError(null)

    try {
      const result = await Effect.runPromise(apiClient.createEvent(data))
      setEvents((prev) => [...prev, result])
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
  }
}
