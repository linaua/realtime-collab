import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  max:              20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
})

db.on('error', (err) => {
  console.error('PostgreSQL pool error:', err)
})

export async function testDbConnection(): Promise<void> {
  const client = await db.connect()
  const result = await client.query('SELECT NOW()')
  client.release()
  console.log('✅ PostgreSQL connected:', result.rows[0].now)
}