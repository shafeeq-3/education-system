# Education System

A comprehensive education management system built with Node.js, Express, MongoDB, and React.

## Features

- 🎓 **Multi-Role Support**: Admin, Teacher, Student, and Parent dashboards
- 📚 **Academic Management**: Classes, subjects, semesters, and academic years
- 📊 **Attendance Tracking**: Real-time attendance management
- 📝 **Assignment Management**: Create, submit, and grade assignments
- 💰 **Finance Module**: Fee structures, payments, and salary management
- 📈 **Analytics Dashboard**: Comprehensive reports and insights
- 🔔 **Notifications**: Real-time notification system
- 📄 **Marksheet & Transcripts**: Digital marksheet generation

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing
- Express Validator

### Frontend
- React.js with Vite
- React Router for navigation
- Axios for API calls
- Modern CSS styling

## Project Structure

```
education-system/
├── backend/
│   ├── config/          # Database and environment configuration
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Authentication, validation, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── validations/     # Input validation schemas
│   └── server.js        # Entry point
└── frontend/
    ├── src/
    │   ├── components/  # Reusable components
    │   ├── pages/       # Page components
    │   ├── context/     # React context
    │   └── services/    # API service layer
    └── public/          # Static assets
```

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key
JWT_EXPIRE=1h
JWT_REFRESH_EXPIRE=7d
NODE_ENV=development
```

4. Seed the database (optional):
```bash
node scripts/seed.js
```

5. Start the server:
```bash
npm start
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Add environment variables in Vercel Dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `NODE_ENV=production`

### MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist Vercel's IP addresses (or use 0.0.0.0/0 for testing)
3. Get connection string and add to Vercel environment variables

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Academic Management
- `GET /api/academic/institutes` - Get all institutes
- `POST /api/academic/institutes` - Create institute
- `GET /api/academic/programs` - Get programs
- `POST /api/academic/programs` - Create program
- `GET /api/academic/semesters` - Get semesters
- `POST /api/academic/semesters` - Create semester

### Classes & Enrollment
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `POST /api/enrollment/enroll` - Enroll student

### Assignments
- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Create assignment
- `POST /api/assignments/:id/submit` - Submit assignment

### Finance
- `GET /api/finance/fee-structures` - Get fee structures
- `POST /api/finance/payments` - Record payment
- `GET /api/finance/salary-structures` - Get salary structures

### Analytics
- `GET /api/analytics/overview` - Get system overview
- `GET /api/analytics/attendance` - Attendance analytics
- `GET /api/analytics/academic` - Academic performance

## Default Login Credentials

After seeding the database:

**Admin:**
- Email: `admin@example.com`
- Password: `Admin@123`

**Teacher:**
- Email: `teacher@example.com`
- Password: `Teacher@123`

**Student:**
- Email: `student@example.com`
- Password: `Student@123`

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Input validation and sanitization
- Rate limiting
- Secure HTTP headers
- Activity logging

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@educationsystem.com or create an issue in the repository.

## Authors

- Shafeeq - Initial work

## Acknowledgments

- Express.js team
- React.js team
- MongoDB team
- All contributors
