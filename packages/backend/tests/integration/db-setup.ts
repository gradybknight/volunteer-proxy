import { GenericContainer, StartedTestContainer } from 'testcontainers'
import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'

let container: StartedTestContainer | null = null
let pool: Pool | null = null

export async function setupTestDatabase(): Promise<Pool> {
  console.log('🐳 Starting PostgreSQL test container...')

  container = await new GenericContainer('postgres:16-alpine')
    .withEnvironment({
      POSTGRES_USER: 'testuser',
      POSTGRES_PASSWORD: 'testpass',
      POSTGRES_DB: 'testdb',
    })
    .withExposedPorts(5432)
    .start()

  const host = container.getHost()
  const port = container.getMappedPort(5432)
  const connectionString = `postgresql://testuser:testpass@${host}:${port}/testdb`

  pool = new Pool({ connectionString })

  // Run migrations
  const migrationFile = path.join(__dirname, '../../migrations/001_initial_schema.sql')
  const sql = fs.readFileSync(migrationFile, 'utf-8')
  await pool.query(sql)

  console.log('✅ Test database ready')

  return pool
}

export async function teardownTestDatabase(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }

  if (container) {
    await container.stop()
    container = null
  }

  console.log('🧹 Test database cleaned up')
}

export function getPool(): Pool {
  if (!pool) {
    throw new Error('Database not initialized. Call setupTestDatabase first.')
  }
  return pool
}
