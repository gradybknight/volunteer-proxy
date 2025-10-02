import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/volunteer_proxy'

async function runMigrations() {
  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    console.log('🔄 Running database migrations...')

    const migrationFile = path.join(__dirname, '../migrations/001_initial_schema.sql')
    const sql = fs.readFileSync(migrationFile, 'utf-8')

    await pool.query(sql)

    console.log('✅ Migrations completed successfully')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

runMigrations()
