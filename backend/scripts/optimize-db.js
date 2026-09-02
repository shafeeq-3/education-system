import mongoose from 'mongoose';
import config from '../config/env.js';

// Import models to ensure indexes are created
import '../models/User.js';
import '../models/Campus.js';
import '../models/Institute.js';
import '../models/Department.js';
import '../models/Program.js';
import '../models/AcademicYear.js';
import '../models/Semester.js';
import '../models/Subject.js';
import '../models/Class.js';
import '../models/Timetable.js';
import '../models/Enrollment.js';
import '../models/Assignment.js';
import '../models/Submission.js';
import '../models/Attendance.js';
import '../models/Marksheet.js';
import '../models/Transcript.js';
import '../models/FeeStructure.js';
import '../models/StudentFee.js';
import '../models/SalaryStructure.js';
import '../models/SalaryPayment.js';
import '../models/Notification.js';
import '../models/ActivityLog.js';

async function optimizeDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    console.log('\n📊 Creating/Updating Indexes...');
    
    // Get all models
    const models = mongoose.modelNames();
    
    for (const modelName of models) {
      const model = mongoose.model(modelName);
      console.log(`\n📝 Processing ${modelName}...`);
      
      try {
        // Sync indexes (create missing, remove extra)
        await model.syncIndexes();
        console.log(`  ✅ Indexes synced for ${modelName}`);
        
        // Get index information
        const indexes = await model.collection.getIndexes();
        console.log(`  📌 Total indexes: ${Object.keys(indexes).length}`);
        
        // List all indexes
        for (const [name, index] of Object.entries(indexes)) {
          const keys = Object.keys(index.key).join(', ');
          console.log(`     - ${name}: [${keys}]`);
        }
      } catch (err) {
        console.error(`  ❌ Error processing ${modelName}:`, err.message);
      }
    }

    console.log('\n✅ Database optimization complete!');
    console.log('\n💡 Tips for better performance:');
    console.log('  - Use pagination for large datasets');
    console.log('  - Add indexes on frequently queried fields');
    console.log('  - Use select() to limit returned fields');
    console.log('  - Use lean() for read-only queries');
    console.log('  - Consider caching for frequently accessed data');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

optimizeDatabase();
