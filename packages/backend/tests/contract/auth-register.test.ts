import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupTestDatabase, teardownTestDatabase } from '../integration/db-setup'

// This test will FAIL until the API is implemented (TDD approach)
describe('Contract Test: POST /auth/register', () => {
  beforeAll(async () => {
    await setupTestDatabase()
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  it('should register a new user and return token', async () => {
    // This will fail - API not implemented yet
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'newuser@example.com',
        password: 'password123',
        role: 'volunteer',
        firstName: 'Test',
        lastName: 'User',
      }),
    })

    expect(response.status).toBe(201)

    const data = await response.json()
    expect(data).toHaveProperty('token')
    expect(data).toHaveProperty('user')
    expect(data.user.email).toBe('newuser@example.com')
    expect(data.user.role).toBe('volunteer')
  })

  it('should return 409 for duplicate email', async () => {
    // Register first user
    await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'duplicate@example.com',
        password: 'password123',
        role: 'volunteer',
        firstName: 'Test',
        lastName: 'User',
      }),
    })

    // Try to register again with same email
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'duplicate@example.com',
        password: 'password456',
        role: 'proxy',
        firstName: 'Another',
        lastName: 'User',
      }),
    })

    expect(response.status).toBe(409)

    const data = await response.json()
    expect(data).toHaveProperty('error')
    expect(data).toHaveProperty('message')
  })

  it('should return 400 for invalid email format', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
        role: 'volunteer',
        firstName: 'Test',
        lastName: 'User',
      }),
    })

    expect(response.status).toBe(400)
  })

  it('should return 400 for short password', async () => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'short',
        role: 'volunteer',
        firstName: 'Test',
        lastName: 'User',
      }),
    })

    expect(response.status).toBe(400)
  })
})
