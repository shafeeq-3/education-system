# Vercel Deployment Guide

Is guide mein aap apni Education System ko Vercel par deploy karna seekhenge.

## Prerequisites

1. **GitHub Repository**: Aapka code GitHub par push hona chahiye
2. **MongoDB Atlas Account**: Free cluster create karein [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
3. **Vercel Account**: Free account banayein [Vercel](https://vercel.com)

## Step 1: MongoDB Atlas Setup

### 1.1 MongoDB Cluster Create Karein

1. [MongoDB Atlas](https://cloud.mongodb.com) par login karein
2. "Create" button par click karein
3. Free tier (M0) select karein
4. Apna preferred region select karein (closest to your users)
5. "Create Cluster" par click karein

### 1.2 Database User Create Karein

1. Security → Database Access par jayein
2. "Add New Database User" par click karein
3. Username aur strong password set karein (save this!)
4. Built-in Role: "Read and write to any database" select karein
5. "Add User" par click karein

### 1.3 Network Access Configure Karein

1. Security → Network Access par jayein
2. "Add IP Address" par click karein
3. "Allow Access from Anywhere" (0.0.0.0/0) select karein
   - Note: Production mein specific IPs use karein for better security
4. "Confirm" par click karein

### 1.4 Connection String Get Karein

1. Cluster par "Connect" button par click karein
2. "Connect your application" select karein
3. Driver: Node.js, Version: latest select karein
4. Connection string copy karein, jaise:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. `<username>` aur `<password>` ko apne actual credentials se replace karein

## Step 2: Vercel Deployment

### Method 1: Vercel Dashboard (Recommended)

#### 2.1 Project Import Karein

1. [Vercel Dashboard](https://vercel.com/dashboard) par login karein
2. "Add New..." → "Project" par click karein
3. GitHub repository import karein:
   - "Import Git Repository" select karein
   - Repository select karein: `shafeeqvibe1/education-system`
   - "Import" par click karein

#### 2.2 Project Configuration

1. **Framework Preset**: Other (default)
2. **Root Directory**: `.` (root)
3. **Build Command**: (leave empty)
4. **Output Directory**: (leave empty)
5. **Install Command**: `npm install` (automatic)

#### 2.3 Environment Variables Add Karein

"Environment Variables" section mein ye values add karein:

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/education_system?retryWrites=true&w=majority
JWT_SECRET=your_super_secure_jwt_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_super_secure_refresh_secret_key_min_32_chars
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
PORT=5000
```

**Important:**
- `MONGODB_URI`: Apna actual MongoDB connection string use karein
- `JWT_SECRET`: Strong random string generate karein (minimum 32 characters)
- `JWT_REFRESH_SECRET`: Alag strong random string (minimum 32 characters)

**JWT Secret Generate Karne Ke Liye:**
```bash
# Node.js use karke
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ya online tool: https://www.random.org/strings/
```

#### 2.4 Deploy Karein

1. "Deploy" button par click karein
2. Wait for deployment to complete (2-3 minutes)
3. Deployment successful hone par aapko URL milega: `https://your-project.vercel.app`

### Method 2: Vercel CLI

#### 2.1 CLI Install Karein

```bash
npm install -g vercel
```

#### 2.2 Login Karein

```bash
vercel login
```

#### 2.3 Deploy Karein

```bash
cd d:\education-system
vercel
```

#### 2.4 Environment Variables Set Karein

```bash
vercel env add MONGODB_URI
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add NODE_ENV
```

Har command ke baad prompted value enter karein.

#### 2.5 Production Deploy Karein

```bash
vercel --prod
```

## Step 3: Database Seed Karein (Optional)

Agar aapko initial data chahiye (demo users, etc.):

### Option A: Local se Seed Karein

1. `.env` file mein production MongoDB URI add karein:
```env
MONGODB_URI=your_production_mongodb_uri
```

2. Seed script run karein:
```bash
cd backend
node scripts/seed.js
```

### Option B: Vercel Function se Seed Karein

Ek temporary endpoint banayein:

1. `backend/routes/seedRoutes.js` create karein:
```javascript
const express = require('express');
const router = express.Router();

// Temporary seed endpoint - DELETE after use!
router.post('/seed', async (req, res) => {
  try {
    // Import your seed script logic here
    const { seedDatabase } = require('../scripts/seed');
    await seedDatabase();
    res.json({ success: true, message: 'Database seeded' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
```

2. `server.js` mein route add karein
3. Deploy karein
4. POST request karein: `https://your-app.vercel.app/api/seed`
5. Seed hone ke baad route DELETE kar dein (security!)

## Step 4: Frontend Configuration

### 4.1 Frontend bhi Vercel par Deploy Karein

1. Naya Vercel project create karein for frontend
2. Root directory: `frontend` set karein
3. Framework preset: Vite select karein
4. Environment variable add karein:
```env
VITE_API_URL=https://your-backend.vercel.app/api
```

### 4.2 Ya Static Export Karein

```bash
cd frontend
npm run build
```

Built files `dist/` folder mein hongi - inhe kisi bhi static hosting par deploy kar sakte hain.

## Step 5: Testing

### 5.1 Backend Test Karein

```bash
# Health check
curl https://your-backend.vercel.app/

# Login test
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin@123"}'
```

### 5.2 Frontend Test Karein

1. Browser mein frontend URL open karein
2. Login page par jayein
3. Demo credentials try karein:
   - Email: `admin@example.com`
   - Password: `Admin@123`

## Troubleshooting

### Issue: "Cannot connect to MongoDB"

**Solution:**
1. MongoDB Atlas mein Network Access check karein (0.0.0.0/0 allowed?)
2. Connection string correct hai? (username, password, database name)
3. Vercel environment variables sahi set hain?

### Issue: "JWT Secret not defined"

**Solution:**
1. Vercel dashboard → Settings → Environment Variables check karein
2. `JWT_SECRET` aur `JWT_REFRESH_SECRET` add karein
3. Redeploy karein

### Issue: "Function timeout"

**Solution:**
1. Vercel free tier: 10s timeout limit hai
2. Heavy operations background mein run karein
3. Ya Vercel Pro upgrade karein (60s timeout)

### Issue: "Module not found"

**Solution:**
1. `package.json` mein all dependencies listed hain?
2. Vercel logs check karein: Dashboard → Deployments → Latest → Logs
3. Build command sahi hai?

## Performance Optimization

### 1. Database Indexing

MongoDB Atlas mein indexes create karein:

```javascript
// Users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })

// Attendance collection
db.attendances.createIndex({ student: 1, date: -1 })
db.attendances.createIndex({ class: 1, date: -1 })

// Assignments collection
db.assignments.createIndex({ class: 1, dueDate: -1 })
```

### 2. Caching

Environment variables mein caching enable karein:
```env
ENABLE_CACHE=true
CACHE_TTL=3600
```

### 3. Connection Pooling

MongoDB connection pooling already configured hai `config/database.js` mein.

## Monitoring

### 1. Vercel Analytics

Vercel Dashboard mein:
- Analytics → Overview
- Function logs
- Error tracking

### 2. MongoDB Atlas Monitoring

Atlas Dashboard mein:
- Metrics → Performance
- Real-time performance panel
- Alerts configure karein

## Security Checklist

- [ ] Strong JWT secrets (minimum 32 characters)
- [ ] MongoDB user has limited permissions
- [ ] Environment variables properly set
- [ ] `.env` files NOT pushed to Git
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] HTTPS enforced (automatic on Vercel)
- [ ] Sensitive data encrypted
- [ ] Regular backups enabled (MongoDB Atlas)

## Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Your changes"
git push origin main

# Vercel automatically deploys!
```

## Custom Domain (Optional)

1. Vercel Dashboard → Settings → Domains
2. "Add Domain" par click karein
3. Your domain enter karein
4. DNS records configure karein (Vercel will guide you)

## Support

Issues face ho to:

1. **Vercel Logs Check Karein**: Dashboard → Deployments → Logs
2. **MongoDB Atlas Logs**: Atlas Dashboard → Activity Feed
3. **GitHub Issues**: Create issue in your repository
4. **Vercel Support**: [Vercel Support](https://vercel.com/support)

## Useful Commands

```bash
# Vercel CLI commands
vercel                  # Deploy to preview
vercel --prod          # Deploy to production
vercel logs            # View function logs
vercel env ls          # List environment variables
vercel domains         # Manage domains
vercel inspect         # Deployment details

# Git commands
git status             # Check status
git log --oneline      # View commits
git push origin main   # Push to GitHub
```

## Cost Estimation

### Free Tier Limits:

**Vercel Free:**
- 100 GB bandwidth/month
- 6000 build minutes/month
- 100 GB-hours serverless function execution
- 10s function timeout

**MongoDB Atlas Free (M0):**
- 512 MB storage
- Shared RAM
- No backups
- Perfect for development/testing

**Upgrade When:**
- Users > 100 concurrent
- Storage > 500 MB
- Need longer function timeouts
- Need automated backups

## Next Steps

1. ✅ Backend deployed on Vercel
2. ✅ Frontend deployed on Vercel
3. ✅ MongoDB Atlas connected
4. ✅ Environment variables configured
5. 🚀 Application live!

**Your URLs:**
- Backend API: `https://your-backend.vercel.app/api`
- Frontend App: `https://your-frontend.vercel.app`

**Default Login:**
- Email: `admin@example.com`
- Password: `Admin@123`

---

## Feedback & Contributions

Issues aur improvements ke liye GitHub repository par contribute karein!

Happy Deploying! 🎉
