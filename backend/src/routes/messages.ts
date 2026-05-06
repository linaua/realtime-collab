import { Router } from 'express'
import { authenticate } from '../middleware/auth.js'
import { getMessages } from '../services/messageService.js'

export const messagesRouter = Router()
messagesRouter.use(authenticate)

// GET /messages/:roomId?limit=50&before=<messageId>
messagesRouter.get('/:roomId', async (req, res) => {
  const { roomId } = req.params
  const limit  = Math.min(Number(req.query.limit  || 50),  100)
  const before = req.query.before as string | undefined

  const messages = await getMessages(roomId, limit, before)
  res.json(messages)
})