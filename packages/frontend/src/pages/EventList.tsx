import { useAuth } from '../hooks/useAuth'
import { useEvents } from '../hooks/useEvents'

export default function EventList() {
  const { token, currentUser } = useAuth()
  const { events, loading, error } = useEvents(token)

  if (loading) return <div>Loading events...</div>
  if (error) return <div className="error">{error}</div>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Events</h2>
        {currentUser?.role === 'admin' && <button>Create Event</button>}
      </div>

      {events.length === 0 ? (
        <p>No events found</p>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {events.map((event) => (
            <div key={event.id} style={{ padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <p>
                <strong>Date:</strong> {new Date(event.date).toLocaleDateString()}
              </p>
              <p>
                <strong>Time:</strong> {event.startTime} - {event.endTime}
              </p>
              <p>
                <strong>Location:</strong> {event.location}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
