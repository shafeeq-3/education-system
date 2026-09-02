# Socket.IO Deployment Notes

## Current Status

The REST API is deployed on **Vercel** and works correctly for all HTTP endpoints.

## Socket.IO Limitation on Vercel

**Socket.IO CANNOT run on Vercel Serverless Functions** because:

1. Vercel Serverless Functions are stateless and short-lived (10s timeout)
2. Socket.IO requires persistent WebSocket connections
3. Vercel does not support long-running WebSocket connections in serverless

## Current Implementation

- **Local Development**: `backend/server.js` runs full server with Socket.IO
- **Vercel Production**: `api/index.js` runs REST API only (NO Socket.IO)

## Solutions for Production Socket.IO

### Option 1: Separate WebSocket Server (Recommended)

Deploy Socket.IO on a different platform that supports persistent connections:

- **Railway** (easiest, $5/month)
- **Render** (free tier available)
- **DigitalOcean App Platform**
- **AWS EC2 / ECS**
- **Heroku**

**Setup:**
1. Deploy `backend/server.js` to Railway/Render
2. Keep REST API on Vercel (faster, cheaper)
3. Frontend connects to:
   - REST API: `https://your-vercel.vercel.app/api/v1/*`
   - WebSocket: `https://your-railway.railway.app` (Socket.IO)

### Option 2: Use Managed Real-Time Service

Replace Socket.IO with a managed service:

- **Pusher** (free tier: 100 connections, 200k messages/day)
- **Ably** (free tier: 3M messages/month)
- **Socket.IO Managed Platform** (paid)

### Option 3: Deploy Everything on Non-Serverless Platform

Move the entire backend from Vercel to:
- Railway
- Render
- DigitalOcean
- Traditional VPS

## What Works on Vercel Now

✅ All REST API endpoints (`/api/v1/*`)
✅ Authentication (JWT)
✅ Database operations (MongoDB)
✅ File uploads (Cloudinary)
✅ All business logic

❌ Socket.IO WebSocket connections
❌ Real-time notifications
❌ Live updates

## Temporary Workaround (Without Socket.IO)

While deploying Socket.IO separately, you can:

1. **Polling**: Frontend polls `/api/v1/notifications` every 30s
2. **Server-Sent Events (SSE)**: Limited on Vercel but possible for one-way updates
3. **WebHooks**: For specific events

## Recommended Architecture

```
Frontend (Vercel)
├── HTTP API calls → Backend REST API (Vercel)
└── WebSocket connection → Socket.IO Server (Railway)
```

Both can share the same MongoDB database.

## Migration Steps

1. Deploy current setup to Vercel (REST API only) ✅
2. Deploy Socket.IO server to Railway
3. Update frontend to connect to both endpoints
4. Update environment variables

## Environment Variables for Dual Setup

**Vercel Backend:**
```
MONGODB_URI=...
JWT_SECRET=...
FRONTEND_URL=https://your-frontend.vercel.app
```

**Railway Socket.IO Server:**
```
MONGODB_URI=... (same database)
PORT=3000
FRONTEND_URL=https://your-frontend.vercel.app
```

**Frontend:**
```
VITE_API_URL=https://backend.vercel.app/api/v1
VITE_SOCKET_URL=https://socketio-server.railway.app
```
