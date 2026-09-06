import express from 'express';
import Institute from '../models/Institute.js';
import Campus from '../models/Campus.js';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const router = express.Router();

// TEMPORARY SEED ENDPOINT - Remove after use!
router.post('/seed-production', async (req, res) => {
  try {
    // Check if already seeded
    const existingInstitute = await Institute.findOne();
    if (existingInstitute) {
      return res.json({ 
        success: true, 
        message: 'Database already seeded',
        data: {
          institutes: await Institute.countDocuments(),
          campuses: await Campus.countDocuments(),
          users: await User.countDocuments()
        }
      });
    }

    console.log('🌱 Starting database seed...');

    // Create Institute
    const institute = await Institute.create({
      name: 'Sample Institute',
      code: 'INST001',
      type: 'university',
      address: {
        street: '123 Education Street',
        city: 'Karachi',
        state: 'Sindh',
        country: 'Pakistan',
        postalCode: '75500'
      },
      contactInfo: {
        phone: '+92-300-1234567',
        email: 'info@institute.edu.pk',
        website: 'https://institute.edu.pk'
      }
    });
    console.log('✅ Institute created');

    // Create Campus
    const campus = await Campus.create({
      name: 'Main Campus',
      code: 'MC',
      institute: institute._id,
      address: {
        street: '456 Campus Road',
        city: 'Karachi',
        state: 'Sindh',
        country: 'Pakistan',
        postalCode: '75500'
      },
      contactInfo: {
        phone: '+92-300-1234568',
        email: 'campus@institute.edu.pk'
      }
    });
    console.log('✅ Campus created');

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@example.com',
      username: 'admin',
      password: adminPassword,
      role: 'admin',
      campus: campus._id,
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        gender: 'other',
        dateOfBirth: new Date('1985-01-01')
      },
      isActive: true
    });
    console.log('✅ Admin created');

    // Create Teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await User.create({
      email: 'john.smith@example.com',
      username: 'john.smith',
      password: teacherPassword,
      role: 'teacher',
      campus: campus._id,
      profile: {
        firstName: 'John',
        lastName: 'Smith',
        gender: 'male',
        dateOfBirth: new Date('1988-05-15')
      },
      isActive: true
    });
    console.log('✅ Teacher created');

    // Create Student
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await User.create({
      email: 'alice.johnson@example.com',
      username: 'alice.johnson',
      password: studentPassword,
      role: 'student',
      campus: campus._id,
      profile: {
        firstName: 'Alice',
        lastName: 'Johnson',
        gender: 'female',
        dateOfBirth: new Date('2000-09-20')
      },
      isActive: true
    });
    console.log('✅ Student created');

    res.json({
      success: true,
      message: '🎉 Database seeded successfully!',
      data: {
        institute: {
          name: institute.name,
          code: institute.code
        },
        campus: {
          name: campus.name,
          code: campus.code
        },
        users: {
          admin: admin.email,
          teacher: teacher.email,
          student: student.email
        },
        credentials: {
          admin: { email: 'admin@example.com', password: 'admin123' },
          teacher: { email: 'john.smith@example.com', password: 'teacher123' },
          student: { email: 'alice.johnson@example.com', password: 'student123' }
        }
      }
    });

  } catch (error) {
    console.error('❌ Seed error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;
