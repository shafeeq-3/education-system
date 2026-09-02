import app from '../backend/app.js';
import connectDB from '../backend/config/serverless-db.js';

// Connect to database for serverless environment
await connectDB();

// Export the Express app as a serverless function handler
export default app;
