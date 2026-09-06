# 🚀 Deployment Guide - Education Management System

## Backend Deployment on Vercel

### Step 1: Prepare Your Code

Your backend is already configured for Vercel deployment with:
- ✅ `vercel.json` configuration file
- ✅ `.vercelignore` to exclude unnecessary files
- ✅ Serverless-ready `server.js`
- ✅ Environment variable validation

### Step 2: Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Education Management System"

# Add remote (replace with your GitHub repository URL)
git remote add origin https://github.com/your-username/education-system.git

# Push to GitHub
git push -u origin main
```

### Step 3: Deploy to Vercel

#### Option A: Using Vercel Dashboard (Recommended for first-time)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: (leave empty)
   - **Output Directory**: (leave empty)
5. Add Environment Variables:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
SESSION_SECRET=your_session_secret_key_here
SESSION_TIMEOUT=30
FRONTEND_URL=https://your-frontend-domain.vercel.app
RATE_LIMIT_AUTH=5
RATE_LIMIT_GENERAL=100
RATE_LIMIT_UPLOAD=10
MAX_FILE_SIZE=10485760
ELIGIBILITY_THRESHOLD=75
```

6. Click "Deploy"

#### Option B: Using Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to backend directory
cd backend

# Deploy
vercel --prod

# Follow the prompts and add environment variables when asked
```

### Step 4: Configure Environment Variables

After deployment, make sure all environment variables are set:

1. Go to your project in Vercel Dashboard
2. Navigate to Settings → Environment Variables
3. Add all required variables from the list above
4. Redeploy if needed

### Step 5: Update Frontend Configuration

Once backend is deployed, update your frontend `.env`:

```env
VITE_API_URL=https://your-backend-url.vercel.app/api/v1
```

### Step 6: MongoDB Atlas Configuration

Make sure your MongoDB Atlas is configured:

1. **Whitelist Vercel IPs**: 
   - Go to MongoDB Atlas → Network Access
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (0.0.0.0/0)
   - Or add specific Vercel IP ranges

2. **Connection String**:
   - Use the full MongoDB connection string with credentials
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`

### Step 7: Test Your Deployment

```bash
# Test health endpoint
curl https://your-backend-url.vercel.app/health

# Test login endpoint
curl -X POST https://your-backend-url.vercel.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

## Frontend Deployment on Vercel

### Step 1: Configure Frontend

1. Update `frontend/.env`:
```env
VITE_API_URL=https://your-backend-url.vercel.app/api/v1
```

2. Build locally to test:
```bash
cd frontend
npm run build
```

### Step 2: Deploy Frontend

#### Using Vercel Dashboard:

1. Go to Vercel Dashboard
2. Click "Add New Project"
3. Import the same repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add environment variable:
   - `VITE_API_URL`: Your backend URL
6. Deploy

### Step 3: Update Backend CORS

After frontend deployment, update backend environment variable:

```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

Redeploy backend for changes to take effect.

## 🔧 Troubleshooting

### Issue: "Module not found" error
**Solution**: Make sure all dependencies are in `package.json` and not in `devDependencies`

### Issue: Database connection fails
**Solution**: 
- Check MongoDB Atlas IP whitelist
- Verify connection string format
- Ensure database user has correct permissions

### Issue: CORS errors
**Solution**: 
- Verify `FRONTEND_URL` in backend matches your frontend domain
- Check CORS configuration in `server.js`

### Issue: Environment variables not working
**Solution**:
- Redeploy after adding environment variables
- Check for typos in variable names
- Ensure no trailing spaces in values

### Issue: 404 on API routes
**Solution**:
- Check `vercel.json` configuration
- Verify routes are correctly defined
- Check server.js exports default app

## 📊 Post-Deployment Checklist

- [ ] Backend health check working
- [ ] Frontend loads successfully
- [ ] Login functionality works
- [ ] API calls from frontend to backend work
- [ ] Database operations work
- [ ] Real-time notifications work (if applicable)
- [ ] File uploads work (if using Cloudinary)
- [ ] All environment variables set
- [ ] CORS configured correctly
- [ ] MongoDB Atlas IP whitelist configured

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to your GitHub repository:

```bash
# Make changes to your code
git add .
git commit -m "Your commit message"
git push origin main
```

Vercel will automatically:
1. Detect the push
2. Build your application
3. Run tests (if configured)
4. Deploy to production

## 🔐 Security Best Practices

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong JWT secrets** - Generate using: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
3. **Enable MongoDB Atlas IP whitelist** - Restrict to known IPs if possible
4. **Use HTTPS only** - Vercel provides this automatically
5. **Rotate secrets regularly** - Update JWT secrets periodically
6. **Monitor logs** - Check Vercel dashboard for errors

## 📝 Important Notes

- Vercel functions have a 10-second timeout on Hobby plan
- Serverless functions are stateless - each request may hit a different instance
- WebSocket connections (Socket.io) may have limitations on serverless
- Consider upgrading to Pro plan for production apps with high traffic

## 🆘 Support

If you face any issues:
1. Check Vercel logs: Project → Deployments → View Function Logs
2. Check MongoDB Atlas logs
3. Test API endpoints using Postman or curl
4. Review this guide again

Good luck with your deployment! 🎉
