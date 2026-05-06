import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import { db } from '../config/database.js'
import { cacheUserInfo } from '../services/cacheService.js'
import { authenticate } from '../middleware/auth.js'

export const authRouter = Router()

const RegisterSchema = z.object({
  username: z.string().min(2).max(50).regex(/^[a-zA-Z0-9_]+$/),
  email:    z.string().email(),
  password: z.string().min(6).max(100),
})

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

const AVATAR_COLORS = [
  '#3b82f6','#8b5cf6','#10b981','#f59e0b',
  '#ef4444','#ec4899','#06b6d4','#84cc16',
]

function makeToken(payload: {
  userId: string; username: string; email: string
}): string {
  return jwt.sign({ ...payload}, 
    process.env.JWT_SECRET || 'fallback_secret', 
    {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
}

// POST /auth/register
authRouter.post('/register', async (req, res) => {
  const parsed = RegisterSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return
  }

  const { username, email, password } = parsed.data

  // Check duplicate
  const existing = await db.query(
    'SELECT id FROM users WHERE email = $1 OR username = $2',
    [email, username]
  )
  if ((existing.rowCount ?? 0) > 0) {
    res.status(409).json({ error: 'Email or username already taken' })
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  const color  = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]

  const result = await db.query(
    `INSERT INTO users (username, email, password, color)
     VALUES ($1, $2, $3, $4)
     RETURNING id, username, email, color, avatar_url, created_at`,
    [username, email, hashed, color]
  )
  const user = result.rows[0]

  await cacheUserInfo({
    id:         user.id,
    username:   user.username,
    color:      user.color,
    avatar_url: user.avatar_url,
  })

  const token = makeToken({
    userId:   user.id,
    username: user.username,
    email:    user.email,
  })

  res.status(201).json({ token, user })
})

// POST /auth/login
authRouter.post('/login', async (req, res) => {
  const parsed = LoginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return
  }

  const { email, password } = parsed.data

  const result = await db.query(
    'SELECT id, username, email, password, color, avatar_url FROM users WHERE email = $1',
    [email]
  )
  const user = result.rows[0]

  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  await cacheUserInfo({
    id:         user.id,
    username:   user.username,
    color:      user.color,
    avatar_url: user.avatar_url,
  })

  const token = makeToken({
    userId:   user.id,
    username: user.username,
    email:    user.email,
  })

  const { password: _, ...safeUser } = user
  res.json({ token, user: safeUser })
})

// GET /auth/me
authRouter.get('/me', authenticate, async (req, res) => {
  const result = await db.query(
    'SELECT id, username, email, color, avatar_url, created_at FROM users WHERE id = $1',
    [req.user!.userId]
  )
  if (result.rowCount === 0) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json(result.rows[0])
})