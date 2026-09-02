import mongoose from 'mongoose';
import config from '../config/env.js';
import User from '../models/User.js';

async function testLogin() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB\n');

    const testEmail = 'admin@uot.edu';
    const testPassword = 'Password@123';

    console.log(`🔍 Testing login for: ${testEmail}`);
    console.log(`🔑 Password: ${testPassword}\n`);

    // Find user with password field
    const user = await User.findOne({ email: testEmail }).select('+password');
    
    if (!user) {
      console.log('❌ User not found!');
      return;
    }

    console.log('✅ User found:');
    console.log(`   - Email: ${user.email}`);
    console.log(`   - Username: ${user.username}`);
    console.log(`   - Role: ${user.role}`);
    console.log(`   - Approved: ${user.isApproved}`);
    console.log(`   - Blocked: ${user.isBlocked}`);
    console.log(`   - Password hash: ${user.password.substring(0, 30)}...`);

    // Test password comparison
    console.log('\n🔐 Testing password comparison...');
    const isValid = await user.comparePassword(testPassword);
    
    if (isValid) {
      console.log('✅ Password is CORRECT! Login should work.');
    } else {
      console.log('❌ Password is INCORRECT! This is the issue.');
      console.log('\n💡 Solution: Run seed again to reset passwords:');
      console.log('   npm run seed');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

testLogin();
