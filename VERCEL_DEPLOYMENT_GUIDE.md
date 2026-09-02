# Vercel Deployment Guide - Education System Backend

## ✅ Files Changed

### Created:
1. `backend/app.js` - Express app without server.listen()
2. `backend/config/serverless-db.js` - Cached MongoDB connection for serverless
3. `api/index.js` - Vercel serverless function entry point
4. `.vercelignore` - Files to exclude from deployment
5. `SOCKETIO_DEPLOYMENT.md` - Socket.IO deployment documentation

### Modified:
1. `backend/server.js` - Now for local development only (with Socket.IO)
2. `vercel.json` - Updated to use api/index.js
3. `package.json` - Updated scripts

### Deleted:
1. `index.js` (root) - Replaced with api/index.js

---

## 📋 Code Changes Summary

### 1. backend/app.js (NEW)
**Purpose:** Express application without server startup
- Contains all routes, middleware, and error handlers
- No `app.listen()` or `httpServer.listen()`
- Exports the Express app for both local dev and Vercel

### 2. backend/config/serverless-db.js (NEW)
**Purpose:** MongoDB connection optimized for serverless
- Uses global caching to prevent multiple connections
- Reuses existing connection across function invocations
- Prevents "too many connections" error on Vercel

### 3. api/index.js (NEW)
**Purpose:** Vercel serverless function handler
- Imports Express app from backend/app.js
- Connects to database using cached connection
- Exports app as default (Vercel requirement)

### 4. backend/server.js (MODIFIED)
**Purpose:** Local development server with Socket.IO
- Now imports app from backend/app.js
- Wraps app with http.Server for Socket.IO
- Calls httpServer.listen() for local dev
- **NOT used on Vercel**

### 5. vercel.json (MODIFIED)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

## 🚀 Vercel Dashboard Settings

### Project Settings

**Root Directory:**
```
.
```
(Leave as root - do not set to "backend")

**Build Command:**
```
(leave blank)
```
No build needed - this is a Node.js Express API

**Install Command:**
```
npm install
```
(Vercel auto-detects this)

**Output Directory:**
```
(leave blank)
```

**Framework Preset:**
```
Other
```

**Node.js Version:**
```
18.x or higher
```

---

## 🔐 Required Environment Variables

Add these in Vercel Dashboard → Project → Settings → Environment Variables:

### Essential Variables:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/education-system?retryWrites=true&w=majority

JWT_SECRET=your_super_secret_jwt_key_min_32_characters

JWT_REFRESH_SECRET=your_refresh_secret_key_min_32_characters

SESSION_SECRET=your_session_secret_key_min_32_characters

FRONTEND_URL=https://your-frontend-app.vercel.app

NODE_ENV=production
```

### Optional Variables:
```
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
SESSION_TIMEOUT=30
RATE_LIMIT_AUTH=50
RATE_LIMIT_GENERAL=1000
RATE_LIMIT_UPLOAD=50
MAX_FILE_SIZE=10485760
ELIGIBILITY_THRESHOLD=75
```

### Cloudinary (if using file uploads):
```
CLOUDINARY_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## 🧪 Testing After Deployment

### 1. Root Endpoint
```bash
curl https://your-backend.vercel.app/
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Education System API is running",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 2. Health Check
```bash
curl https://your-backend.vercel.app/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 3. API Endpoints
```bash
# Test authentication endpoint
curl -X POST https://your-backend.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

### 4. Test URLs:
- Base: `https://your-backend.vercel.app/`
- Health: `https://your-backend.vercel.app/health`
- Auth: `https://your-backend.vercel.app/api/v1/auth/*`
- Academic: `https://your-backend.vercel.app/api/v1/academic/*`
- All other routes: `https://your-backend.vercel.app/api/v1/*`

---

## 🔄 Local Development

### Start Local Server with Socket.IO:
```bash
cd backend
npm install
npm start
```

This runs `backend/server.js` with full Socket.IO support on http://localhost:5000

### Local .env file (backend/.env):
```
PORT=5000
NODE_ENV=development
MONGODB_URI=your_local_or_atlas_mongodb_uri
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:5173
```

---

## ⚠️ Socket.IO Limitation

**CRITICAL: Socket.IO DOES NOT work on Vercel Serverless Functions**

### Why?
- Vercel functions are stateless and short-lived (10s timeout)
- Socket.IO requires persistent WebSocket connections
- Vercel does not support long-running connections

### What Works on Vercel:
✅ All REST API endpoints
✅ JWT Authentication
✅ Database operations
✅ File uploads
✅ All business logic

### What Does NOT Work on Vercel:
❌ Socket.IO WebSocket connections
❌ Real-time notifications via WebSocket
❌ Live updates via WebSocket

### Solution:
Deploy Socket.IO separately on platforms that support WebSockets:
- **Railway** (recommended, $5/month)
- **Render** (free tier available)
- **Heroku**
- **DigitalOcean**

See `SOCKETIO_DEPLOYMENT.md` for detailed Socket.IO deployment options.

---

## 📝 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create new Vercel project
- [ ] Import GitHub repository
- [ ] Set Root Directory to `.` (root)
- [ ] Leave Build Command blank
- [ ] Add all environment variables
- [ ] Deploy
- [ ] Test `/health` endpoint
- [ ] Test `/api/v1/auth/login` endpoint
- [ ] Update frontend `VITE_API_BASE_URL` to Vercel URL
- [ ] (Optional) Deploy Socket.IO separately if needed

---

## 🐛 Troubleshooting

### Error: "Module not found"
- Ensure `type: "module"` in package.json
- Check all imports use `.js` extensions
- Verify file paths are correct

### Error: "Too many connections to MongoDB"
- Using `serverless-db.js` should prevent this
- Check that you're not calling `connectDB()` multiple times
- MongoDB Atlas: Increase connection limit or use connection pooling

### Error: "Cannot find module 'backend/config/env.js'"
- Vercel deploys from root, not from backend folder
- All imports should be relative to root: `../backend/...`

### Error: "Function exceeded timeout"
- Check MongoDB connection string is correct
- Ensure database is accessible from Vercel IPs
- Check for slow queries or middleware

### 404 on all routes
- Verify vercel.json has correct routing
- Check that api/index.js exports app as default
- Ensure no syntax errors in api/index.js

---

## 📊 What's Deployed

```
Vercel Serverless Function
├── api/index.js (entry point)
├── backend/app.js (Express app)
├── backend/config/ (env, serverless-db)
├── backend/controllers/
├── backend/middlewares/
├── backend/models/
├── backend/routes/
├── backend/services/
├── backend/utils/
├── backend/validations/
└── package.json (dependencies)

NOT Deployed:
├── backend/server.js (local dev only)
├── frontend/ (separate deployment)
└── .env (use Vercel env vars)
```

---

## 🎯 Final API URL

After deployment, your API will be available at:
```
https://your-project-name.vercel.app
```

Update your frontend .env:
```
VITE_API_BASE_URL=https://your-project-name.vercel.app/api/v1
```

---

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review Function logs in Vercel dashboard
3. Test locally first with `npm start`
4. Verify all environment variables are set
5. Check MongoDB Atlas network access (allow all IPs: 0.0.0.0/0 for testing)

---

## ✨ Success!

If `/health` returns a 200 OK response, your backend is successfully deployed on Vercel! 🎉
