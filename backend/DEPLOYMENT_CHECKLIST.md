# 🚀 Backend Deployment Checklist for Vercel

## Pre-Deployment Checks

### ✅ Code Ready
- [x] All files use ES modules (import/export)
- [x] No `require()` statements
- [x] `__dirname` properly handled with `fileURLToPath`
- [x] `process.exit()` wrapped in Vercel checks
- [x] Database connection optimized for serverless
- [x] CORS configured for multiple origins
- [x] Error handlers don't crash the process

### ✅ Configuration Files
- [x] `vercel.json` present in backend folder
- [x] `.vercelignore` present in backend folder
- [x] `package.json` has `"type": "module"`
- [x] `package.json` has `engines` field for Node version
- [x] `.env.example` updated with all variables
- [x] `.gitignore` excludes `.env` and sensitive files

### ✅ Environment Variables Required
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
SESSION_SECRET=...
SESSION_TIMEOUT=30
FRONTEND_URL=https://your-frontend.vercel.app
RATE_LIMIT_AUTH=5
RATE_LIMIT_GENERAL=100
RATE_LIMIT_UPLOAD=10
MAX_FILE_SIZE=10485760
ELIGIBILITY_THRESHOLD=75
```

## MongoDB Atlas Setup

### 1. Database Configuration
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with read/write permissions
- [ ] Connection string copied

### 2. Network Access
- [ ] Go to Network Access in MongoDB Atlas
- [ ] Click "Add IP Address"
- [ ] Select "Allow Access from Anywhere" (0.0.0.0/0)
- [ ] Or add Vercel's IP ranges if you want to be more restrictive

### 3. Test Connection
```bash
# Test connection string locally first
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_MONGODB_URI').then(() => console.log('Connected!')).catch(e => console.error(e))"
```

## GitHub Setup

### 1. Create Repository
```bash
# If not already done
git init
git remote add origin https://github.com/your-username/education-system.git
```

### 2. Commit and Push
```bash
# Stage all files
git add .

# Commit
git commit -m "feat: Production-ready backend for Vercel deployment"

# Push to GitHub
git push -u origin main
```

## Vercel Deployment

### Method 1: Vercel Dashboard (Recommended)

#### Step 1: Import Project
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Select the repository

#### Step 2: Configure Project
1. **Root Directory**: `backend`
2. **Framework Preset**: Other
3. **Build Command**: (leave empty)
4. **Output Directory**: (leave empty)
5. **Install Command**: `npm install`

#### Step 3: Add Environment Variables
1. Click "Environment Variables"
2. Add all variables from `.env.production.example`
3. Make sure to add them for "Production", "Preview", and "Development"

#### Step 4: Deploy
1. Click "Deploy"
2. Wait for deployment to complete (usually 2-3 minutes)
3. Note the deployment URL (e.g., `https://your-backend.vercel.app`)

### Method 2: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Navigate to backend directory
cd backend

# Deploy to production
vercel --prod

# Follow prompts to:
# - Link to existing project or create new
# - Add environment variables
# - Confirm deployment
```

## Post-Deployment Verification

### 1. Test Health Endpoint
```bash
curl https://your-backend-url.vercel.app/health
```

Expected response:
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production"
}
```

### 2. Test API Endpoints

#### Test Login
```bash
curl -X POST https://your-backend-url.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

#### Test Public Route
```bash
curl https://your-backend-url.vercel.app/api/v1/institutes
```

### 3. Check Vercel Logs
1. Go to Vercel Dashboard
2. Select your project
3. Go to "Deployments"
4. Click on latest deployment
5. Check "Functions" logs for any errors

### 4. Monitor Database Connection
- Check MongoDB Atlas → Metrics
- Verify connections are being made
- Check for any connection errors

## Update Frontend Configuration

After backend is deployed successfully:

```bash
cd frontend
```

Update `frontend/.env`:
```env
VITE_API_URL=https://your-backend-url.vercel.app/api/v1
```

Then deploy frontend or update environment variable in Vercel.

## Common Issues & Solutions

### Issue: 500 Internal Server Error
**Solutions:**
- Check Vercel function logs
- Verify all environment variables are set
- Check MongoDB connection string format
- Ensure MongoDB Atlas IP whitelist includes 0.0.0.0/0

### Issue: CORS Error
**Solutions:**
- Verify `FRONTEND_URL` environment variable
- Check frontend URL matches exactly (with https://)
- Redeploy after updating FRONTEND_URL

### Issue: Database Connection Timeout
**Solutions:**
- Verify MongoDB URI format
- Check MongoDB Atlas is not paused
- Verify network access settings in Atlas
- Try shorter timeout values in database.js

### Issue: JWT Token Errors
**Solutions:**
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set
- Secrets should be long and complex (min 32 characters)
- Check for any whitespace in environment variables

### Issue: Module Not Found
**Solutions:**
- Verify all imports use `.js` extension
- Check package.json has all dependencies (not devDependencies)
- Clear Vercel cache and redeploy

### Issue: Function Timeout (10 seconds on Hobby plan)
**Solutions:**
- Optimize database queries
- Add indexes to frequently queried fields
- Consider upgrading to Pro plan for 60s timeout
- Use pagination for large data sets

## Performance Optimization

### 1. Database Indexes
Run these in MongoDB Atlas shell or Compass:
```javascript
// User indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });

// Class indexes
db.classes.createIndex({ academicYear: 1, semester: 1 });

// Assignment indexes
db.assignments.createIndex({ class: 1, createdAt: -1 });

// Attendance indexes
db.attendances.createIndex({ class: 1, date: -1 });
```

### 2. Enable MongoDB Caching
Already implemented in `database.js` with connection reuse.

### 3. Monitor Performance
- Use Vercel Analytics (optional paid feature)
- Monitor function execution time
- Check for slow queries in MongoDB Atlas

## Security Checklist

- [ ] All secrets are strong (min 32 characters)
- [ ] `.env` file is in `.gitignore`
- [ ] MongoDB user has minimal required permissions
- [ ] Rate limiting is enabled
- [ ] CORS is restricted to your frontend domain
- [ ] Sensitive data is not logged
- [ ] MongoDB Atlas has network restrictions (if possible)

## Maintenance

### Update Deployment
```bash
# Make changes
git add .
git commit -m "fix: description"
git push origin main
```

Vercel will automatically redeploy on push to main branch.

### Rollback Deployment
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → "Promote to Production"

### View Logs
```bash
# Using Vercel CLI
vercel logs

# Or view in dashboard
# Project → Deployments → Click deployment → Functions
```

## Next Steps

1. ✅ Backend deployed successfully
2. [ ] Deploy frontend to Vercel
3. [ ] Update frontend VITE_API_URL
4. [ ] Test complete user flow
5. [ ] Set up custom domain (optional)
6. [ ] Configure monitoring/alerts
7. [ ] Document API endpoints
8. [ ] Set up CI/CD workflows

## Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Node.js on Vercel](https://vercel.com/docs/runtimes/node-js)
- [Environment Variables on Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Need Help?** Check Vercel logs first, then MongoDB Atlas logs. Most issues are related to environment variables or database connectivity.
