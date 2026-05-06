import { Router } from 'express'
import { z } from 'zod'
import { authenticate } from '../middleware/auth.js'
import {
  getRooms,
  createRoom,
  joinRoom,
  getRoomMembers,
} from '../services/roomService.js'

export const roomsRouter = Router()
roomsRouter.use(authenticate)

const CreateRoomSchema = z.object({
  name:        z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPrivate:   z.boolean().default(false),
})

// GET /rooms
roomsRouter.get('/', async (req, res) => {
  const rooms = await getRooms(req.user!.userId)
  res.json(rooms)
})

// POST /rooms
roomsRouter.post('/', async (req, res) => {
  const parsed = CreateRoomSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return
  }

  const room = await createRoom({
    ...parsed.data,
    ownerId: req.user!.userId,
  })
  res.status(201).json(room)
})

// POST /rooms/:id/join
roomsRouter.post('/:id/join', async (req, res) => {
  await joinRoom(req.params.id, req.user!.userId)
  res.json({ success: true })
})

// GET /rooms/:id/members
roomsRouter.get('/:id/members', async (req, res) => {
  const members = await getRoomMembers(req.params.id)
  res.json(members)
})