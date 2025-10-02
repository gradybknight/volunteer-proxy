import { Pool } from 'pg'
import * as bcrypt from 'bcrypt'

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/volunteer_proxy'

async function seedDatabase() {
  const pool = new Pool({ connectionString: DATABASE_URL })

  try {
    console.log('🌱 Seeding database...')

    const passwordHash = await bcrypt.hash('admin123', 10)

    const result = await pool.query(
      `INSERT INTO users (email, password_hash, role, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email`,
      ['admin@example.com', passwordHash, 'admin', 'Admin', 'User']
    )

    if (result.rows.length > 0) {
      console.log('✅ Created admin user:', result.rows[0].email)
      console.log('   Password: admin123')
    } else {
      console.log('ℹ️  Admin user already exists')
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seedDatabase()
