import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { setupTestDatabase, teardownTestDatabase, getPool } from '../integration/db-setup'
import * as bcrypt from 'bcrypt'

// This test will FAIL until the API is implemented (TDD approach)
describe('Contract Test: POST /auth/login', () => {
  beforeAll(async () => {
    await setupTestDatabase()

    // Create a test user
    const pool = getPool()
    const passwordHash = await bcrypt.hash('testpassword', 10)
    await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)`,
      ['testlogin@example.com', passwordHash, 'volunteer', 'Test', 'Login']
    )
  })

  afterAll(async () => {
    await teardownTestDatabase()
  })

  it('should login with valid credentials and return token', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testlogin@example.com',
        password: 'testpassword',
      }),
    })

    expect(response.status).toBe(200)

    const data = await response.json()
    expect(data).toHaveProperty('token')
    expect(data).toHaveProperty('user')
    expect(data.user.email).toBe('testlogin@example.com')
    expect(data.user).not.toHaveProperty('passwordHash')
  })

  it('should return 401 for invalid password', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testlogin@example.com',
        password: 'wrongpassword',
      }),
    })

    expect(response.status).toBe(401)

    const data = await response.json()
    expect(data).toHaveProperty('error')
  })

  it('should return 401 for non-existent user', async () => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'nonexistent@example.com',
        password: 'password123',
      }),
    })

    expect(response.status).toBe(401)
  })
})
