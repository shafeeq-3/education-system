# Education Management System

A comprehensive education management system with Node.js backend and React frontend.

## 🚀 Quick Deploy

### Backend (Vercel)
1. Push code to GitHub
2. Import project on Vercel
3. Set environment variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `SESSION_SECRET`
   - `FRONTEND_URL`
4. Deploy!

### Frontend (Vercel/Netlify)
1. Deploy frontend folder
2. Set `VITE_API_BASE_URL` to your backend URL

## 📁 Project Structure

```
education-system/
├── backend/          # Node.js + Express API
├── frontend/         # React + Vite frontend
└── vercel.json       # Vercel deployment config
```

## 🔧 Environment Variables

**Backend (.env)**
```env
MONGODB_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
SESSION_SECRET=your_session_secret
FRONTEND_URL=https://your-frontend.vercel.app
```

## 📝 Features

- 🎓 Multi-role dashboard (Admin, Teacher, Student)
- 📚 Academic management
- 📊 Attendance tracking
- 📝 Assignment management
- 💰 Finance module
- 📈 Analytics dashboard
- 🔔 Real-time notifications

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Frontend**: React, Vite, TailwindCSS
- **Auth**: JWT with refresh tokens
- **Database**: MongoDB Atlas

## 📦 Installation

```bash
# Backend
cd backend
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

## 🔐 Security

- JWT authentication
- Password hashing (bcrypt)
- Role-based access control
- Input validation
- Rate limiting

## 👨‍💻 Author

**Shafeeq**
