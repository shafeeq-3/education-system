import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'SESSION_SECRET'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  process.exit(1);
}

export default {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database
  mongoUri: process.env.MONGODB_URI,
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh',
  jwtAccessExpire: process.env.JWT_ACCESS_EXPIRE || '15m',
  jwtRefreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  
  // Session
  sessionSecret: process.env.SESSION_SECRET,
  sessionTimeout: parseInt(process.env.SESSION_TIMEOUT) || 30, // minutes
  
  // Cloudinary
  cloudinaryName: process.env.CLOUDINARY_NAME,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET,
  
  // Frontend
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // Rate Limiting
  rateLimitAuth: parseInt(process.env.RATE_LIMIT_AUTH) || 50,
  rateLimitGeneral: parseInt(process.env.RATE_LIMIT_GENERAL) || 1000,
  rateLimitUpload: parseInt(process.env.RATE_LIMIT_UPLOAD) || 50,
  
  // File Upload
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  
  // Backup
  backupSchedule: process.env.BACKUP_SCHEDULE || '0 2 * * *',
  
  // Eligibility
  eligibilityThreshold: parseInt(process.env.ELIGIBILITY_THRESHOLD) || 75
};
