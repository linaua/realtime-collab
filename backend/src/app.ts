import 'dotenv/config'
import http from 'http'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'

import { testDbConnection } from './config/database.js'
import { initSocket } from './socket/index.js'
import { authRouter }     from './routes/auth.js'
import { roomsRouter }    from './routes/rooms.js'
import { messagesRouter } from './routes/messages.js'

const app    = express()
const server = http.createServer(app)

// Middleware
app.use(helmet())
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Routes
app.use('/auth',     authRouter)
app.use('/rooms',    roomsRouter)
app.use('/messages', messagesRouter)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Global error handler
app.use((
  err: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

// Init Socket.io
initSocket(server)

// Start
const PORT = Number(process.env.PORT) || 4000

async function start() {
  await testDbConnection()
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`)
    console.log(`🔌 WebSocket ready`)
  })
}

start().catch((err) => {
  console.error('Failed to start:', err)
  process.exit(1)
})