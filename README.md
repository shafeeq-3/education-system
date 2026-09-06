# Education Management System

A comprehensive educational management system built with MERN stack for managing institutes, students, teachers, classes, assignments, attendance, and finances.

## 🚀 Features

### For Admins
- **Dashboard Analytics**: Comprehensive overview of system statistics
- **User Management**: Manage students, teachers, and staff
- **Academic Management**: Control institutes, campuses, programs, semesters, and subjects
- **Class Management**: Create and manage classes, assign teachers
- **Finance Management**: Student fee tracking, teacher salary management
- **Attendance Tracking**: Monitor student and teacher attendance
- **Reports & Analytics**: Generate detailed reports

### For Teachers
- **Class Management**: View assigned classes and enrolled students
- **Assignment Management**: Create, distribute, and grade assignments
- **Attendance**: Mark and track student attendance
- **Grade Management**: Enter and manage student marks
- **Dashboard**: Overview of classes and pending tasks

### For Students
- **Dashboard**: Personalized view of enrolled classes
- **Assignments**: View and submit assignments
- **Attendance**: Track own attendance records
- **Results**: View marks and report cards
- **Notifications**: Receive important updates

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time notifications
- **Express Validator** for request validation
- **Bcrypt** for password hashing

### Frontend
- **React.js** with Vite
- **React Router** for navigation
- **Axios** for API calls
- **Context API** for state management
- **CSS3** for styling

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd education-system
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Create `.env` file in backend directory:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_ACCESS_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
SESSION_SECRET=your_session_secret_key_here
SESSION_TIMEOUT=30
FRONTEND_URL=http://localhost:5173
RATE_LIMIT_AUTH=5
RATE_LIMIT_GENERAL=100
RATE_LIMIT_UPLOAD=10
MAX_FILE_SIZE=10485760
ELIGIBILITY_THRESHOLD=75
```

4. Seed the database (optional):
```bash
npm run seed
```

5. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Create `.env` file in frontend directory:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

3. Start the frontend development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🚀 Deployment

### Backend Deployment on Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy backend:
```bash
cd backend
vercel --prod
```

3. Set environment variables in Vercel Dashboard:
   - Go to your project settings
   - Add all environment variables from `.env.example`
   - Make sure to set `NODE_ENV=production`
   - Update `FRONTEND_URL` to your frontend deployment URL

### Frontend Deployment

1. Update `VITE_API_URL` in frontend `.env` to your Vercel backend URL

2. Build the frontend:
```bash
cd frontend
npm run build
```

3. Deploy to your preferred platform (Vercel, Netlify, etc.)

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/forgot-password` - Request password reset
- `POST /api/v1/auth/reset-password` - Reset password

### User Endpoints
- `GET /api/v1/users` - Get all users (Admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `POST /api/v1/users` - Create new user (Admin only)
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user (Admin only)

### Academic Endpoints
- Institutes, Campuses, Departments, Programs, Semesters, Subjects
- Full CRUD operations for each entity

### Class Endpoints
- `GET /api/v1/classes` - Get all classes
- `POST /api/v1/classes` - Create new class
- `GET /api/v1/classes/:id` - Get class details
- `POST /api/v1/classes/:id/enroll` - Enroll students

### Assignment Endpoints
- `GET /api/v1/assignments` - Get assignments
- `POST /api/v1/assignments` - Create assignment
- `POST /api/v1/assignments/:id/submit` - Submit assignment
- `PUT /api/v1/assignments/:id/grade` - Grade submission

### Finance Endpoints
- Student fee management
- Teacher salary management
- Payment tracking

## 🔐 Default Credentials

After seeding the database:

**Admin:**
- Email: admin@example.com
- Password: admin123

**Teacher:**
- Email: john.smith@example.com
- Password: teacher123

**Student:**
- Email: alice.johnson@example.com
- Password: student123

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Developed with ❤️ for educational institutions

## 📞 Support

For support, email your-email@example.com or create an issue in the repository.
