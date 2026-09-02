import mongoose from 'mongoose';
import config from '../config/env.js';
import User from '../models/User.js';

async function checkUsers() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const users = await User.find({}).select('email username role isApproved');
    
    console.log(`📊 Total users in database: ${users.length}\n`);
    
    if (users.length > 0) {
      console.log('👥 Users:');
      users.forEach(user => {
        console.log(`   - ${user.email} | ${user.username} | ${user.role} | Approved: ${user.isApproved}`);
      });
    } else {
      console.log('⚠️  No users found in database. Please run: npm run seed');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

checkUsers();
