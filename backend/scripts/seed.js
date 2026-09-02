import mongoose from 'mongoose';
import config from '../config/env.js';

// Import all models
import User from '../models/User.js';
import Campus from '../models/Campus.js';
import Institute from '../models/Institute.js';
import Department from '../models/Department.js';
import Program from '../models/Program.js';
import AcademicYear from '../models/AcademicYear.js';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import Class from '../models/Class.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import Attendance from '../models/Attendance.js';
import Marksheet from '../models/Marksheet.js';
import Transcript from '../models/Transcript.js';
import FeeStructure from '../models/FeeStructure.js';
import StudentFee from '../models/StudentFee.js';
import SalaryStructure from '../models/SalaryStructure.js';
import SalaryPayment from '../models/SalaryPayment.js';
import Timetable from '../models/Timetable.js';

async function seed() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Campus.deleteMany({}),
      Institute.deleteMany({}),
      Department.deleteMany({}),
      Program.deleteMany({}),
      AcademicYear.deleteMany({}),
      Semester.deleteMany({}),
      Subject.deleteMany({}),
      Class.deleteMany({}),
      Enrollment.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      Attendance.deleteMany({}),
      Marksheet.deleteMany({}),
      Transcript.deleteMany({}),
      FeeStructure.deleteMany({}),
      StudentFee.deleteMany({}),
      SalaryStructure.deleteMany({}),
      SalaryPayment.deleteMany({}),
      Timetable.deleteMany({})
    ]);
    console.log('✅ Data cleared\n');

    // 1. Create Institute
    console.log('🏛️  Creating Institute...');
    const institute = await Institute.create({
      name: 'University of Technology',
      code: 'UOT',
      type: 'university',
      address: '123 University Ave, Tech City',
      phone: '+1234567890',
      email: 'info@uot.edu',
      website: 'https://uot.edu',
      isActive: true
    });
    console.log('✅ Institute created:', institute.name);

    // 2. Create Campuses
    console.log('\n🏫 Creating Campuses...');
    const mainCampus = await Campus.create({
      name: 'Main Campus',
      code: 'MAIN',
      institute: institute._id,
      address: '123 University Ave, Tech City',
      phone: '+1234567890',
      email: 'main@uot.edu',
      isActive: true
    });

    const northCampus = await Campus.create({
      name: 'North Campus',
      code: 'NORTH',
      institute: institute._id,
      address: '456 North Street, Tech City',
      phone: '+1234567891',
      email: 'north@uot.edu',
      isActive: true
    });
    console.log('✅ Campuses created: 2');

    // 3. Create Departments
    console.log('\n🏢 Creating Departments...');
    const csDept = await Department.create({
      name: 'Computer Science',
      code: 'CS',
      campus: mainCampus._id,
      institute: institute._id,
      description: 'Department of Computer Science and Engineering',
      isActive: true
    });

    const eeDept = await Department.create({
      name: 'Electrical Engineering',
      code: 'EE',
      campus: mainCampus._id,
      institute: institute._id,
      description: 'Department of Electrical Engineering',
      isActive: true
    });

    const mgmtDept = await Department.create({
      name: 'Business Management',
      code: 'BM',
      campus: northCampus._id,
      institute: institute._id,
      description: 'Department of Business and Management',
      isActive: true
    });
    console.log('✅ Departments created: 3');

    // 4. Create Programs
    console.log('\n🎓 Creating Programs...');
    const bscsProgram = await Program.create({
      name: 'Bachelor of Science in Computer Science',
      code: 'BSCS',
      department: csDept._id,
      campus: mainCampus._id,
      institute: institute._id,
      duration: 4,
      degreeLevel: 'bachelors',
      description: '4-year undergraduate program in Computer Science',
      isActive: true
    });

    const bseeProgram = await Program.create({
      name: 'Bachelor of Science in Electrical Engineering',
      code: 'BSEE',
      department: eeDept._id,
      campus: mainCampus._id,
      institute: institute._id,
      duration: 4,
      degreeLevel: 'bachelors',
      description: '4-year undergraduate program in Electrical Engineering',
      isActive: true
    });

    const mbaProgram = await Program.create({
      name: 'Master of Business Administration',
      code: 'MBA',
      department: mgmtDept._id,
      campus: northCampus._id,
      institute: institute._id,
      duration: 2,
      degreeLevel: 'masters',
      description: '2-year graduate program in Business Administration',
      isActive: true
    });
    console.log('✅ Programs created: 3');

    // 5. Create Academic Year
    console.log('\n📅 Creating Academic Year...');
    const academicYear = await AcademicYear.create({
      year: '2024-2025',
      startDate: new Date('2024-09-01'),
      endDate: new Date('2025-06-30'),
      campus: mainCampus._id,
      isCurrent: true
    });
    console.log('✅ Academic Year created:', academicYear.year);

    // 6. Create Semesters
    console.log('\n📚 Creating Semesters...');
    const fall2024 = await Semester.create({
      name: 'Fall 2024',
      code: 'FALL24',
      academicYear: academicYear._id,
      startDate: new Date('2024-09-01'),
      endDate: new Date('2024-12-31'),
      campus: mainCampus._id,
      institute: institute._id,
      isCurrent: true,
      isActive: true
    });

    const spring2025 = await Semester.create({
      name: 'Spring 2025',
      code: 'SPR25',
      academicYear: academicYear._id,
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-05-31'),
      campus: mainCampus._id,
      institute: institute._id,
      isCurrent: false,
      isActive: true
    });
    console.log('✅ Semesters created: 2');

    // 7. Create Subjects
    console.log('\n📖 Creating Subjects...');
    const subjects = await Subject.insertMany([
      // CS Subjects
      {
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        department: csDept._id,
        semester: fall2024._id,
        campus: mainCampus._id,
        credits: 3,
        type: 'theory',
        description: 'Fundamental data structures and algorithms'
      },
      {
        name: 'Database Systems',
        code: 'CS301',
        department: csDept._id,
        semester: fall2024._id,
        campus: mainCampus._id,
        credits: 3,
        type: 'theory',
        description: 'Relational database design and SQL'
      },
      {
        name: 'Web Development',
        code: 'CS302',
        department: csDept._id,
        semester: fall2024._id,
        campus: mainCampus._id,
        credits: 4,
        type: 'lab',
        description: 'Full-stack web development'
      },
      {
        name: 'Operating Systems',
        code: 'CS303',
        department: csDept._id,
        semester: fall2024._id,
        campus: mainCampus._id,
        credits: 3,
        type: 'theory',
        description: 'OS concepts and implementation'
      },
      {
        name: 'Software Engineering',
        code: 'CS304',
        department: csDept._id,
        semester: fall2024._id,
        campus: mainCampus._id,
        credits: 3,
        type: 'theory',
        description: 'Software development lifecycle'
      },
      // EE Subjects
      {
        name: 'Circuit Analysis',
        code: 'EE201',
        department: eeDept._id,
        semester: fall2024._id,
        campus: mainCampus._id,
        credits: 3,
        type: 'theory',
        description: 'Basic circuit analysis techniques'
      },
      {
        name: 'Digital Logic Design',
        code: 'EE202',
        department: eeDept._id,
        semester: fall2024._id,
        campus: mainCampus._id,
        credits: 4,
        type: 'lab',
        description: 'Digital circuits and logic gates'
      },
      {
        name: 'Signals and Systems',
        code: 'EE203',
        department: eeDept._id,
        semester: fall2024._id,
        campus: mainCampus._id,
        credits: 3,
        type: 'theory',
        description: 'Signal processing fundamentals'
      },
      // Business Subjects
      {
        name: 'Financial Management',
        code: 'BM301',
        department: mgmtDept._id,
        semester: fall2024._id,
        campus: northCampus._id,
        credits: 3,
        type: 'theory',
        description: 'Corporate finance and investment'
      },
      {
        name: 'Marketing Management',
        code: 'BM302',
        department: mgmtDept._id,
        semester: fall2024._id,
        campus: northCampus._id,
        credits: 3,
        type: 'theory',
        description: 'Marketing strategies and consumer behavior'
      }
    ]);
    console.log('✅ Subjects created:', subjects.length);

    // 8. Create Users (Admin, Teachers, Students)
    console.log('\n👥 Creating Users...');
    
    // Admin
    await User.create({
      email: 'admin@uot.edu',
      username: 'admin',
      password: 'Password@123',
      role: 'admin',
      campus: mainCampus._id,
      institute: institute._id,
      profile: {
        firstName: 'System',
        lastName: 'Administrator',
        phone: '+1234567890',
        gender: 'male'
      },
      isApproved: true,
      isBlocked: false
    });

    // Teachers - 10 teachers
    const teacherData = [
      { first: 'John', last: 'Doe', email: 'john.doe@uot.edu', username: 'johndoe', dept: csDept._id, gender: 'male', dob: '1985-05-15' },
      { first: 'Jane', last: 'Smith', email: 'jane.smith@uot.edu', username: 'janesmith', dept: csDept._id, gender: 'female', dob: '1988-08-20' },
      { first: 'Mike', last: 'Wilson', email: 'mike.wilson@uot.edu', username: 'mikewilson', dept: eeDept._id, gender: 'male', dob: '1982-03-10' },
      { first: 'Sarah', last: 'Johnson', email: 'sarah.johnson@uot.edu', username: 'sarahjohnson', dept: csDept._id, gender: 'female', dob: '1990-11-25' },
      { first: 'David', last: 'Brown', email: 'david.brown@uot.edu', username: 'davidbrown', dept: eeDept._id, gender: 'male', dob: '1987-07-18' },
      { first: 'Emily', last: 'Davis', email: 'emily.davis@uot.edu', username: 'emilydavis', dept: csDept._id, gender: 'female', dob: '1989-04-12' },
      { first: 'Robert', last: 'Miller', email: 'robert.miller@uot.edu', username: 'robertmiller', dept: eeDept._id, gender: 'male', dob: '1984-09-30' },
      { first: 'Lisa', last: 'Anderson', email: 'lisa.anderson@uot.edu', username: 'lisaanderson', dept: mgmtDept._id, gender: 'female', dob: '1991-02-14' },
      { first: 'James', last: 'Taylor', email: 'james.taylor@uot.edu', username: 'jamestaylor', dept: mgmtDept._id, gender: 'male', dob: '1986-12-05' },
      { first: 'Maria', last: 'Garcia', email: 'maria.garcia@uot.edu', username: 'mariagarcia', dept: csDept._id, gender: 'female', dob: '1992-06-22' }
    ];

    const teachers = [];
    for (const t of teacherData) {
      const teacher = await User.create({
        email: t.email,
        username: t.username,
        password: 'Password@123',
        role: 'teacher',
        campus: t.dept === mgmtDept._id ? northCampus._id : mainCampus._id,
        institute: institute._id,
        department: t.dept,
        profile: {
          firstName: t.first,
          lastName: t.last,
          phone: `+1234${Math.floor(Math.random() * 1000000)}`,
          gender: t.gender,
          dateOfBirth: new Date(t.dob)
        },
        isApproved: true,
        isBlocked: false
      });
      teachers.push(teacher);
    }

    // Students - 45 students
    const studentNames = [
      { first: 'Alice', last: 'Johnson', gender: 'female', dept: 'cs' },
      { first: 'Bob', last: 'Brown', gender: 'male', dept: 'cs' },
      { first: 'Charlie', last: 'Davis', gender: 'male', dept: 'cs' },
      { first: 'Diana', last: 'Miller', gender: 'female', dept: 'cs' },
      { first: 'Eve', last: 'Garcia', gender: 'female', dept: 'cs' },
      { first: 'Frank', last: 'Martinez', gender: 'male', dept: 'cs' },
      { first: 'Grace', last: 'Rodriguez', gender: 'female', dept: 'cs' },
      { first: 'Henry', last: 'Lopez', gender: 'male', dept: 'cs' },
      { first: 'Ivy', last: 'Gonzalez', gender: 'female', dept: 'cs' },
      { first: 'Jack', last: 'Wilson', gender: 'male', dept: 'cs' },
      { first: 'Kate', last: 'Anderson', gender: 'female', dept: 'cs' },
      { first: 'Leo', last: 'Thomas', gender: 'male', dept: 'cs' },
      { first: 'Mia', last: 'Taylor', gender: 'female', dept: 'cs' },
      { first: 'Noah', last: 'Moore', gender: 'male', dept: 'cs' },
      { first: 'Olivia', last: 'Jackson', gender: 'female', dept: 'cs' },
      { first: 'Peter', last: 'White', gender: 'male', dept: 'cs' },
      { first: 'Quinn', last: 'Harris', gender: 'female', dept: 'cs' },
      { first: 'Ryan', last: 'Martin', gender: 'male', dept: 'cs' },
      { first: 'Sophia', last: 'Thompson', gender: 'female', dept: 'cs' },
      { first: 'Tom', last: 'Garcia', gender: 'male', dept: 'cs' },
      { first: 'Uma', last: 'Martinez', gender: 'female', dept: 'ee' },
      { first: 'Victor', last: 'Robinson', gender: 'male', dept: 'ee' },
      { first: 'Wendy', last: 'Clark', gender: 'female', dept: 'ee' },
      { first: 'Xavier', last: 'Rodriguez', gender: 'male', dept: 'ee' },
      { first: 'Yara', last: 'Lewis', gender: 'female', dept: 'ee' },
      { first: 'Zack', last: 'Lee', gender: 'male', dept: 'ee' },
      { first: 'Amy', last: 'Walker', gender: 'female', dept: 'ee' },
      { first: 'Ben', last: 'Hall', gender: 'male', dept: 'ee' },
      { first: 'Chloe', last: 'Allen', gender: 'female', dept: 'ee' },
      { first: 'Daniel', last: 'Young', gender: 'male', dept: 'ee' },
      { first: 'Emma', last: 'King', gender: 'female', dept: 'ee' },
      { first: 'Felix', last: 'Wright', gender: 'male', dept: 'ee' },
      { first: 'Gina', last: 'Scott', gender: 'female', dept: 'ee' },
      { first: 'Harry', last: 'Green', gender: 'male', dept: 'ee' },
      { first: 'Iris', last: 'Baker', gender: 'female', dept: 'ee' },
      { first: 'Jason', last: 'Adams', gender: 'male', dept: 'bm' },
      { first: 'Kelly', last: 'Nelson', gender: 'female', dept: 'bm' },
      { first: 'Luke', last: 'Carter', gender: 'male', dept: 'bm' },
      { first: 'Maya', last: 'Mitchell', gender: 'female', dept: 'bm' },
      { first: 'Nathan', last: 'Perez', gender: 'male', dept: 'bm' },
      { first: 'Olivia', last: 'Roberts', gender: 'female', dept: 'bm' },
      { first: 'Paul', last: 'Turner', gender: 'male', dept: 'bm' },
      { first: 'Rachel', last: 'Phillips', gender: 'female', dept: 'bm' },
      { first: 'Sam', last: 'Campbell', gender: 'male', dept: 'bm' },
      { first: 'Tina', last: 'Parker', gender: 'female', dept: 'bm' }
    ];

    const students = [];
    for (let i = 0; i < studentNames.length; i++) {
      const s = studentNames[i];
      const deptId = s.dept === 'cs' ? csDept._id : (s.dept === 'ee' ? eeDept._id : mgmtDept._id);
      const campusId = s.dept === 'bm' ? northCampus._id : mainCampus._id;
      
      const student = await User.create({
        email: `${s.first.toLowerCase()}.${s.last.toLowerCase()}@student.uot.edu`,
        username: `${s.first.toLowerCase()}${s.last.toLowerCase()}`,
        password: 'Password@123',
        role: 'student',
        campus: campusId,
        institute: institute._id,
        department: deptId,
        profile: {
          firstName: s.first,
          lastName: s.last,
          phone: `+123456${7900 + i}`,
          gender: s.gender,
          dateOfBirth: new Date(2002 + (i % 3), (i % 12), (i % 28) + 1)
        },
        isApproved: true,
        isBlocked: false
      });
      students.push(student);
    }
    console.log('✅ Users created: 1 Admin, 10 Teachers, 45 Students');

    // 9. Create Classes
    console.log('\n🏫 Creating Classes...');
    const { createExtendedClasses } = await import('./seed-extended.js');
    const classes = await createExtendedClasses(
      teachers,
      subjects,
      fall2024,
      academicYear,
      { cs: csDept, ee: eeDept, bm: mgmtDept },
      { bscs: bscsProgram, bsee: bseeProgram, mba: mbaProgram },
      { main: mainCampus, north: northCampus },
      institute
    );
    console.log('✅ Classes created:', classes.length);

    // 10. Create Timetables
    console.log('\n⏰ Creating Timetables...');
    const timetableCount = Math.min(classes.length * 2, 24);
    for (let i = 0; i < timetableCount; i++) {
      const cls = classes[i % classes.length];
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      await Timetable.create({
        class: cls._id,
        subject: cls.subject,
        teacher: cls.teacher,
        semester: fall2024._id,
        campus: cls.campus,
        institute: institute._id,
        dayOfWeek: days[i % 5],
        startTime: `${9 + (i % 4)}:00`,
        endTime: `${10 + (i % 4)}:30`,
        room: cls.room,
        type: i % 3 === 0 ? 'lecture' : 'lab',
        createdBy: cls.teacher,
        isActive: true
      });
    }
    console.log('✅ Timetables created:', timetableCount);

    // 11. Create Enrollments
    console.log('\n📝 Creating Enrollments...');
    const { createEnrollments } = await import('./seed-extended.js');
    const enrollments = await createEnrollments(
      students,
      classes,
      fall2024,
      academicYear,
      { main: mainCampus, north: northCampus },
      institute
    );
    console.log('✅ Enrollments created:', enrollments.length);

    // 12. Create Assignments and Submissions
    console.log('\n📋 Creating Assignments and Submissions...');
    const { createAssignmentsAndSubmissions } = await import('./seed-extended.js');
    const { assignments, submissions } = await createAssignmentsAndSubmissions(
      classes,
      students,
      teachers,
      fall2024,
      { main: mainCampus, north: northCampus },
      institute
    );
    console.log('✅ Assignments created:', assignments.length);
    console.log('✅ Submissions created:', submissions.length);

    // 13. Create Attendance Records
    console.log('\n✅ Creating Attendance Records...');
    const { createAttendanceRecords } = await import('./seed-extended.js');
    const attendanceRecords = await createAttendanceRecords(
      classes,
      students,
      teachers,
      fall2024,
      { main: mainCampus, north: northCampus },
      institute
    );
    console.log('✅ Attendance records created:', attendanceRecords.length);

    // 14. Create Marksheets and Transcripts
    console.log('\n📊 Creating Marksheets and Transcripts...');
    const { createMarksheetsAndTranscripts } = await import('./seed-extended.js');
    const { marksheets, transcripts } = await createMarksheetsAndTranscripts(
      students,
      classes,
      subjects,
      fall2024,
      academicYear,
      teachers,
      { main: mainCampus, north: northCampus },
      institute
    );
    console.log('✅ Marksheets created:', marksheets.length);
    console.log('✅ Transcripts created:', transcripts.length);

    // 15. Create Fee Structures and Student Fees
    console.log('\n💰 Creating Fee Structures and Student Fees...');
    const { createFeesAndPayments } = await import('./seed-extended.js');
    const adminUser = await User.findOne({ role: 'admin' });
    const { feeStructures, studentFees } = await createFeesAndPayments(
      students,
      { bscs: bscsProgram, bsee: bseeProgram, mba: mbaProgram },
      fall2024,
      academicYear,
      { main: mainCampus, north: northCampus },
      institute,
      adminUser._id
    );
    console.log('✅ Fee Structures created:', feeStructures.length);
    console.log('✅ Student Fees created:', studentFees.length);

    // 16. Create Salary Structures and Payments
    console.log('\n💼 Creating Salary Structures and Payments...');
    const { createSalariesAndPayments } = await import('./seed-extended.js');
    const { salaryStructures, salaryPayments } = await createSalariesAndPayments(
      teachers,
      { cs: csDept, ee: eeDept, bm: mgmtDept },
      { main: mainCampus, north: northCampus },
      institute,
      adminUser._id
    );
    console.log('✅ Salary Structures created:', salaryStructures.length);
    console.log('✅ Salary Payments created:', salaryPayments.length);

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📊 Data Summary:');
    console.log('   • 1 Institute');
    console.log('   • 2 Campuses');
    console.log('   • 3 Departments');
    console.log('   • 3 Programs');
    console.log('   • 1 Academic Year');
    console.log('   • 2 Semesters');
    console.log('   • 10 Subjects');
    console.log('   • 56 Users (1 Admin, 10 Teachers, 45 Students)');
    console.log('   • 12 Classes');
    console.log('   • 24 Timetables');
    console.log('   • ' + enrollments.length + ' Enrollments');
    console.log('   • ' + assignments.length + ' Assignments');
    console.log('   • ' + submissions.length + ' Submissions');
    console.log('   • ' + attendanceRecords.length + ' Attendance Records');
    console.log('   • ' + marksheets.length + ' Marksheets');
    console.log('   • ' + transcripts.length + ' Transcripts');
    console.log('   • ' + feeStructures.length + ' Fee Structures');
    console.log('   • ' + studentFees.length + ' Student Fees');
    console.log('   • ' + salaryStructures.length + ' Salary Structure');
    console.log('   • ' + salaryPayments.length + ' Salary Payments');
    
    console.log('\n🔐 Login Credentials:');
    console.log('\n   ADMIN:');
    console.log('   Email: admin@uot.edu');
    console.log('   Password: Password@123');
    
    console.log('\n   TEACHERS (Sample):');
    console.log('   Email: john.doe@uot.edu | Password: Password@123');
    console.log('   Email: jane.smith@uot.edu | Password: Password@123');
    console.log('   Email: mike.wilson@uot.edu | Password: Password@123');
    console.log('   Email: sarah.johnson@uot.edu | Password: Password@123');
    console.log('   ... and 6 more teachers');
    
    console.log('\n   STUDENTS (Sample):');
    console.log('   Email: alice.johnson@student.uot.edu | Password: Password@123');
    console.log('   Email: bob.brown@student.uot.edu | Password: Password@123');
    console.log('   Email: charlie.davis@student.uot.edu | Password: Password@123');
    console.log('   ... and 42 more students');
    
    console.log('\n💡 All users have the same password: Password@123');
    console.log('\n📈 System is now ready for demo with comprehensive data!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
    process.exit(0);
  }
}

seed();
