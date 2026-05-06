import { Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import type { JWTPayload } from '../types.js'

declare module 'socket.io' {
  interface Socket {
    user: JWTPayload
  }
}

export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): void {
  const token =
    socket.handshake.auth.token ||
    socket.handshake.headers.authorization?.split(' ')[1]

  if (!token) {
    next(new Error('Authentication required'))
    return
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload
    socket.user = payload
    next()
  } catch {
    next(new Error('Invalid token'))
  }
}