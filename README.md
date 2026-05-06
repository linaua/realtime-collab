# 💬 Real-Time Collaboration Tool

A Slack-like real-time messaging application built with
React, Node.js, WebSockets (Socket.io), PostgreSQL, and Redis.

**[🌐 Live Demo](https://collab-tool.vercel.app)**
**[🔌 WebSocket API](https://collab-backend.up.railway.app)**

---

## Architecture

```
┌──────────────────┐         ┌────────────────────────┐
│   React Client   │◄───────►│  Node.js + Socket.io   │
│   (Vercel)       │  WS/HTTP│  (Railway)             │
└──────────────────┘         │                        │
                              │  ┌──────────────────┐  │
                              │  │   PostgreSQL      │  │
                              │  │  (message history)│  │
                              │  └──────────────────┘  │
                              │                        │
                              │  ┌──────────────────┐  │
                              │  │     Redis         │  │
                              │  │ (online, typing,  │  │
                              │  │  msg cache)       │  │
                              │  └──────────────────┘  │
                              └────────────────────────┘
```

## Stack

| Layer     | Tech                          |
|-----------|-------------------------------|
| Frontend  | React 18, TypeScript, Vite    |
| Styling   | Tailwind CSS, Framer Motion   |
| State     | Zustand (persisted auth)      |
| WebSocket | Socket.io client              |
| Backend   | Node.js, Express, Socket.io   |
| Database  | PostgreSQL (pg)               |
| Cache     | Redis (ioredis)               |
| Auth      | JWT (jsonwebtoken, bcryptjs)  |
| Deploy    | Vercel + Railway + Docker     |

## Features

- ⚡ Real-time messaging with WebSockets
- 💾 Message history persisted in PostgreSQL
- 🔴 Online users tracked in Redis (per room)
- ⌨️ Live typing indicators with Redis TTL
- 📦 Message cache in Redis (last 50 per room)
- 🏠 Public and private rooms/channels
- ✏️ Edit and delete your own messages
- 📜 Infinite scroll for message history
- 🔐 JWT authentication
- 📱 Responsive (mobile + desktop)
- 🐳 Docker Compose for local dev

## Run locally

```bash
git clone https://github.com/alinagordiy/collab-tool
cd collab-tool

# Start PostgreSQL + Redis
docker-compose up postgres redis -d

# Backend
cd backend
cp .env.example .env    # fill JWT_SECRET
npm install
npm run dev             # http://localhost:4000

# Frontend (new terminal)
cd frontend
npm install
npm run dev             # http://localhost:5173