# University ERP System - Backend

Enterprise-grade University Educational ERP System backend built with Node.js, Express, and MongoDB.

## 🏗️ Architecture

- **MVC Pattern**: Clean separation of concerns
- **RESTful API**: Following REST principles with versioning (/api/v1)
- **JWT Authentication**: Access + Refresh token strategy
- **Role-Based Access Control**: SuperAdmin, Admin, Teacher, Student, Accounts
- **Multi-Campus Support**: Data isolation by campus/institute

## 📁 Project Structure

```
backend/
├── config/           # Configuration files
│   ├── env.js       # Environment variables
│   └── database.js  # MongoDB connection
├── models/          # Mongoose models
│   ├── User.js
│   ├── RefreshToken.js
│   └── PasswordResetToken.js
├── controllers/     # Route controllers
│   └── authController.js
├── services/        # Business logic
│   └── authService.js
├── routes/          # API routes
│   └── authRoutes.js
├── middlewares/     # Express middlewares
│   ├── auth.js      # Authentication & authorization
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   ├── validate.js
│   └── logger.js
├── validations/     # Request validation schemas
│   └── authValidation.js
├── utils/           # Utility functions
│   ├── jwt.js
│   ├── response.js
│   └── errors.js
└── server.js        # Application entry point
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.x
- MongoDB >= 6.x
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Copy .env.example to .env and update values
cp .env.example .env
```

3. Update `.env` file with your configuration:
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Secrets (use strong random strings)
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary (for file uploads)
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Running the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## 📡 API Endpoints

### Authentication Module (Implemented)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| POST | `/api/v1/auth/refresh-token` | Refresh access token | No |
| POST | `/api/v1/auth/logout` | Logout user | Yes |
| POST | `/api/v1/auth/logout-all` | Logout from all devices | Yes |
| POST | `/api/v1/auth/forgot-password` | Request password reset | No |
| POST | `/api/v1/auth/reset-password/:token` | Reset password | No |
| POST | `/api/v1/auth/change-password` | Change password | Yes |
| GET | `/api/v1/auth/me` | Get current user | Yes |
| PATCH | `/api/v1/auth/profile` | Update profile | Yes |
| GET | `/api/v1/auth/sessions` | Get active sessions | Yes |
| DELETE | `/api/v1/auth/sessions/:id` | Terminate session | Yes |

## 🔐 Authentication Flow

1. **Register**: User registers → Account created (isApproved: false)
2. **Admin Approval**: Admin approves account → User can login
3. **Login**: User logs in → Receives access token (15min) + refresh token (7 days)
4. **API Requests**: Include access token in Authorization header
5. **Token Refresh**: When access token expires, use refresh token to get new one
6. **Logout**: Revoke refresh token

## 🛡️ Security Features

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT access + refresh token strategy
- ✅ Rate limiting (5 login attempts per 15 minutes)
- ✅ Account lockout after 5 failed attempts (30 minutes)
- ✅ Session tracking and management
- ✅ Password strength validation
- ✅ XSS protection headers
- ✅ CORS configuration
- ✅ Request logging and monitoring

## 📊 Database Models

### User Model
- Email, username, password (hashed)
- Role (superadmin, admin, teacher, student, accounts)
- Campus and institute references
- Account status (isApproved, isBlocked)
- Profile information
- Session tracking
- Login attempt tracking

### RefreshToken Model
- User reference
- Token (hashed)
- Expiration date
- Device information
- Revocation status

### PasswordResetToken Model
- User reference
- Token (hashed)
- Expiration date
- Usage status

## 🧪 Testing

Test authentication endpoints:

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@university.edu",
    "username": "testuser",
    "password": "Test@123",
    "role": "student",
    "campusId": "campus_id",
    "profile": {
      "firstName": "Test",
      "lastName": "User"
    }
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@university.edu",
    "password": "Test@123"
  }'

# Get current user (with token)
curl -X GET http://localhost:5000/api/v1/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 📝 Error Handling

All errors follow standard format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-02-09T10:30:00Z",
    "requestId": "req_xxx"
  }
}
```

## 🔄 Next Steps

Modules to be implemented:
- [ ] Academic Module (Institutes, Campuses, Departments, Programs, etc.)
- [ ] Academic Operations (Assignments, Submissions, Attendance, Marksheets)
- [ ] Finance Module (Fees, Salaries, Transactions)
- [ ] Communication Module (Announcements, Notifications)
- [ ] System Module (Activity Logs, Error Logs, System Health, Backups)

## 📚 Documentation

- [API Contract](../API_CONTRACT_MASTER.md)
- [Database Schema](../DATABASE_SCHEMA_DERIVED_FROM_REQUIREMENTS.md)
- [Requirements](../.kiro/specs/university-erp/requirements.md)

## 🤝 Contributing

1. Follow MVC architecture
2. Use async/await for asynchronous operations
3. Implement proper error handling
4. Add validation for all inputs
5. Write clean, documented code
6. Follow the established patterns

## 📄 License

Proprietary - University ERP System
