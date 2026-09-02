// Extended seed data creation functions
// This file contains helper functions for creating comprehensive seed data

export async function createExtendedClasses(teachers, subjects, fall2024, academicYear, departments, programs, campuses, institute) {
  const Class = (await import('../models/Class.js')).default;
  
  const classes = [];
  
  // CS Classes - 6 classes
  const csClasses = [
    {
      name: 'Data Structures - Section A',
      code: 'CS201-A',
      section: 'A',
      subject: subjects[0]._id,
      teacher: teachers[0]._id,
      room: 'Room 101',
      capacity: 35
    },
    {
      name: 'Data Structures - Section B',
      code: 'CS201-B',
      section: 'B',
      subject: subjects[0]._id,
      teacher: teachers[1]._id,
      room: 'Room 102',
      capacity: 35
    },
    {
      name: 'Database Systems - Section A',
      code: 'CS301-A',
      section: 'A',
      subject: subjects[1]._id,
      teacher: teachers[3]._id,
      room: 'Room 103',
      capacity: 30
    },
    {
      name: 'Web Development - Section A',
      code: 'CS302-A',
      section: 'A',
      subject: subjects[2]._id,
      teacher: teachers[5]._id,
      room: 'Lab 201',
      capacity: 25
    },
    {
      name: 'Operating Systems - Section A',
      code: 'CS303-A',
      section: 'A',
      subject: subjects[3]._id,
      teacher: teachers[9]._id,
      room: 'Room 104',
      capacity: 30
    },
    {
      name: 'Software Engineering - Section A',
      code: 'CS304-A',
      section: 'A',
      subject: subjects[4]._id,
      teacher: teachers[1]._id,
      room: 'Room 105',
      capacity: 30
    }
  ];

  for (const c of csClasses) {
    const cls = await Class.create({
      ...c,
      maxStudents: c.capacity,
      semester: fall2024._id,
      academicYear: academicYear._id,
      department: departments.cs._id,
      program: programs.bscs._id,
      campus: campuses.main._id,
      institute: institute._id,
      schedule: 'Mon, Wed, Fri 9:00-10:30 AM',
      createdBy: teachers[0]._id,
      isActive: true
    });
    classes.push(cls);
  }

  // EE Classes - 4 classes
  const eeClasses = [
    {
      name: 'Circuit Analysis - Section A',
      code: 'EE201-A',
      section: 'A',
      subject: subjects[5]._id,
      teacher: teachers[2]._id,
      room: 'Room 201',
      capacity: 30
    },
    {
      name: 'Circuit Analysis - Section B',
      code: 'EE201-B',
      section: 'B',
      subject: subjects[5]._id,
      teacher: teachers[4]._id,
      room: 'Room 202',
      capacity: 30
    },
    {
      name: 'Digital Logic Design - Section A',
      code: 'EE202-A',
      section: 'A',
      subject: subjects[6]._id,
      teacher: teachers[6]._id,
      room: 'Lab 301',
      capacity: 25
    },
    {
      name: 'Signals and Systems - Section A',
      code: 'EE203-A',
      section: 'A',
      subject: subjects[7]._id,
      teacher: teachers[2]._id,
      room: 'Room 203',
      capacity: 30
    }
  ];

  for (const c of eeClasses) {
    const cls = await Class.create({
      ...c,
      maxStudents: c.capacity,
      semester: fall2024._id,
      academicYear: academicYear._id,
      department: departments.ee._id,
      program: programs.bsee._id,
      campus: campuses.main._id,
      institute: institute._id,
      schedule: 'Tue, Thu 10:00-11:30 AM',
      createdBy: teachers[2]._id,
      isActive: true
    });
    classes.push(cls);
  }

  // Business Classes - 2 classes
  const bmClasses = [
    {
      name: 'Financial Management - Section A',
      code: 'BM301-A',
      section: 'A',
      subject: subjects[8]._id,
      teacher: teachers[7]._id,
      room: 'Room 301',
      capacity: 25
    },
    {
      name: 'Marketing Management - Section A',
      code: 'BM302-A',
      section: 'A',
      subject: subjects[9]._id,
      teacher: teachers[8]._id,
      room: 'Room 302',
      capacity: 25
    }
  ];

  for (const c of bmClasses) {
    const cls = await Class.create({
      ...c,
      maxStudents: c.capacity,
      semester: fall2024._id,
      academicYear: academicYear._id,
      department: departments.bm._id,
      program: programs.mba._id,
      campus: campuses.north._id,
      institute: institute._id,
      schedule: 'Mon, Wed 2:00-3:30 PM',
      createdBy: teachers[7]._id,
      isActive: true
    });
    classes.push(cls);
  }

  return classes;
}

export async function createEnrollments(students, classes, fall2024, academicYear, campuses, institute) {
  const Enrollment = (await import('../models/Enrollment.js')).default;
  
  const enrollments = [];
  
  // CS Students (0-19) - enroll in CS classes
  for (let i = 0; i < 20; i++) {
    // Enroll in 4-5 classes each
    const classesToEnroll = [0, 1, 2, 3, 4].slice(0, i % 2 === 0 ? 5 : 4);
    
    for (const classIdx of classesToEnroll) {
      if (classes[classIdx]) {
        const enrollment = await Enrollment.create({
          student: students[i]._id,
          class: classes[classIdx]._id,
          subject: classes[classIdx].subject,
          semester: fall2024._id,
          academicYear: academicYear._id,
          campus: campuses.main._id,
          institute: institute._id,
          status: 'approved',
          createdBy: students[i]._id,
          enrolledAt: new Date()
        });
        enrollments.push(enrollment);
      }
    }
  }

  // EE Students (20-34) - enroll in EE classes
  for (let i = 20; i < 35; i++) {
    const eeClassIndices = [6, 7, 8, 9];
    const classesToEnroll = eeClassIndices.slice(0, i % 2 === 0 ? 4 : 3);
    
    for (const classIdx of classesToEnroll) {
      if (classes[classIdx]) {
        const enrollment = await Enrollment.create({
          student: students[i]._id,
          class: classes[classIdx]._id,
          subject: classes[classIdx].subject,
          semester: fall2024._id,
          academicYear: academicYear._id,
          campus: campuses.main._id,
          institute: institute._id,
          status: 'approved',
          createdBy: students[i]._id,
          enrolledAt: new Date()
        });
        enrollments.push(enrollment);
      }
    }
  }

  // Business Students (35-44) - enroll in Business classes
  for (let i = 35; i < 45; i++) {
    const bmClassIndices = [10, 11];
    
    for (const classIdx of bmClassIndices) {
      if (classes[classIdx]) {
        const enrollment = await Enrollment.create({
          student: students[i]._id,
          class: classes[classIdx]._id,
          subject: classes[classIdx].subject,
          semester: fall2024._id,
          academicYear: academicYear._id,
          campus: campuses.north._id,
          institute: institute._id,
          status: 'approved',
          createdBy: students[i]._id,
          enrolledAt: new Date()
        });
        enrollments.push(enrollment);
      }
    }
  }

  return enrollments;
}

export async function createAssignmentsAndSubmissions(classes, students, teachers, fall2024, campuses, institute) {
  const Assignment = (await import('../models/Assignment.js')).default;
  const Submission = (await import('../models/Submission.js')).default;
  const Enrollment = (await import('../models/Enrollment.js')).default;
  
  const assignments = [];
  const submissions = [];
  
  // Create 5-7 assignments per class
  for (let classIdx = 0; classIdx < classes.length; classIdx++) {
    const cls = classes[classIdx];
    const numAssignments = 5 + (classIdx % 3);
    
    for (let a = 0; a < numAssignments; a++) {
      const daysAgo = 30 - (a * 5);
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() - daysAgo + 7);
      
      const assignment = await Assignment.create({
        title: `Assignment ${a + 1} - ${cls.name}`,
        description: `Complete the tasks for ${cls.name}. This assignment covers topics from week ${a + 1}.`,
        class: cls._id,
        subject: cls.subject,
        teacher: cls.teacher,
        semester: fall2024._id,
        campus: cls.campus,
        institute: institute._id,
        dueDate: dueDate,
        totalMarks: 100,
        type: a % 4 === 0 ? 'project' : (a % 4 === 1 ? 'quiz' : (a % 4 === 2 ? 'homework' : 'exam')),
        status: daysAgo > 0 ? 'active' : 'closed',
        createdBy: cls.teacher
      });
      assignments.push(assignment);
      
      // Get enrolled students for this class
      const enrolledStudents = await Enrollment.find({ class: cls._id }).select('student _id');
      
      // Create submissions for 70-90% of students
      const submissionRate = 0.7 + (Math.random() * 0.2);
      const numSubmissions = Math.floor(enrolledStudents.length * submissionRate);
      
      for (let s = 0; s < numSubmissions; s++) {
        if (enrolledStudents[s]) {
          const submittedDate = new Date(dueDate);
          submittedDate.setDate(submittedDate.getDate() - Math.floor(Math.random() * 3));
          
          const isLate = submittedDate > dueDate;
          const obtainedMarks = 60 + Math.floor(Math.random() * 40);
          
          const submission = await Submission.create({
            assignment: assignment._id,
            student: enrolledStudents[s].student,
            enrollment: enrolledStudents[s]._id,
            class: cls._id,
            subject: cls.subject,
            semester: fall2024._id,
            campus: cls.campus,
            institute: institute._id,
            submittedAt: submittedDate,
            status: daysAgo > 7 ? 'graded' : 'submitted',
            isLate: isLate,
            content: `Submission for ${assignment.title}`,
            obtainedMarks: daysAgo > 7 ? obtainedMarks : null,
            feedback: daysAgo > 7 ? 'Good work!' : null,
            gradedBy: daysAgo > 7 ? cls.teacher : null,
            gradedAt: daysAgo > 7 ? new Date() : null,
            createdBy: enrolledStudents[s].student
          });
          submissions.push(submission);
        }
      }
    }
  }
  
  return { assignments, submissions };
}

export async function createAttendanceRecords(classes, students, teachers, fall2024, campuses, institute) {
  const Attendance = (await import('../models/Attendance.js')).default;
  const Enrollment = (await import('../models/Enrollment.js')).default;
  
  const attendanceRecords = [];
  
  // Create attendance for last 60 days
  const today = new Date();
  
  for (let classIdx = 0; classIdx < classes.length; classIdx++) {
    const cls = classes[classIdx];
    
    // Get enrolled students with enrollment IDs
    const enrolledStudents = await Enrollment.find({ class: cls._id }).select('student _id');
    
    // Create attendance for 3 days per week for 8 weeks = 24 sessions
    for (let day = 0; day < 24; day++) {
      const attendanceDate = new Date(today);
      attendanceDate.setDate(attendanceDate.getDate() - (60 - (day * 2)));
      attendanceDate.setHours(0, 0, 0, 0); // Normalize to start of day
      
      // Create records array for all students with enrollment reference
      const records = enrolledStudents.map(enrollment => {
        const isPresent = Math.random() > 0.15; // 85% attendance rate
        return {
          student: enrollment.student,
          enrollment: enrollment._id,
          status: isPresent ? 'present' : 'absent',
          remarks: ''
        };
      });
      
      // Create ONE attendance document per class per date with all student records
      const attendance = await Attendance.create({
        class: cls._id,
        subject: cls.subject,
        teacher: cls.teacher,
        semester: fall2024._id,
        campus: cls.campus,
        institute: institute._id,
        date: attendanceDate,
        records: records,
        markedBy: cls.teacher,
        createdBy: cls.teacher,
        isLocked: true,
        lockedBy: cls.teacher,
        lockedAt: attendanceDate
      });
      attendanceRecords.push(attendance);
    }
  }
  
  return attendanceRecords;
}

export async function createMarksheetsAndTranscripts(students, classes, subjects, fall2024, academicYear, teachers, campuses, institute) {
  const Marksheet = (await import('../models/Marksheet.js')).default;
  const Transcript = (await import('../models/Transcript.js')).default;
  const Enrollment = (await import('../models/Enrollment.js')).default;
  
  const marksheets = [];
  const transcripts = [];
  
  // Create marksheets for each student's enrolled subjects
  for (const student of students) {
    const enrollments = await Enrollment.find({ student: student._id, semester: fall2024._id });
    
    const semesterMarksheets = [];
    let totalCredits = 0;
    let totalGradePoints = 0;
    
    for (const enrollment of enrollments) {
      const cls = classes.find(c => c._id.toString() === enrollment.class.toString());
      if (!cls) continue;
      
      const subject = subjects.find(s => s._id.toString() === cls.subject.toString());
      if (!subject) continue;
      
      // Generate marks
      const obtainedMarks = 50 + Math.floor(Math.random() * 50);
      const totalMarks = 100;
      const percentage = (obtainedMarks / totalMarks) * 100;
      
      // Calculate grade
      let letterGrade, gradePoints;
      if (percentage >= 90) { letterGrade = 'A+'; gradePoints = 4.0; }
      else if (percentage >= 85) { letterGrade = 'A'; gradePoints = 3.7; }
      else if (percentage >= 80) { letterGrade = 'A-'; gradePoints = 3.3; }
      else if (percentage >= 75) { letterGrade = 'B+'; gradePoints = 3.0; }
      else if (percentage >= 70) { letterGrade = 'B'; gradePoints = 2.7; }
      else if (percentage >= 65) { letterGrade = 'B-'; gradePoints = 2.3; }
      else if (percentage >= 60) { letterGrade = 'C+'; gradePoints = 2.0; }
      else if (percentage >= 55) { letterGrade = 'C'; gradePoints = 1.7; }
      else if (percentage >= 50) { letterGrade = 'C-'; gradePoints = 1.3; }
      else if (percentage >= 40) { letterGrade = 'D'; gradePoints = 1.0; }
      else { letterGrade = 'F'; gradePoints = 0.0; }
      
      const isPassed = gradePoints >= 1.0;
      
      const marksheet = await Marksheet.create({
        student: student._id,
        enrollment: enrollment._id,
        class: cls._id,
        subject: subject._id,
        semester: fall2024._id,
        academicYear: academicYear._id,
        campus: cls.campus,
        institute: institute._id,
        obtainedMarks,
        totalMarks,
        percentage: Math.round(percentage * 100) / 100,
        letterGrade,
        gradePoints,
        isPassed,
        isFinalized: true,
        finalizedAt: new Date(),
        finalizedBy: cls.teacher,
        createdBy: cls.teacher
      });
      marksheets.push(marksheet);
      semesterMarksheets.push(marksheet);
      
      totalCredits += subject.credits;
      totalGradePoints += gradePoints * subject.credits;
    }
    
    // Create transcript
    if (semesterMarksheets.length > 0) {
      const semesterGPA = totalGradePoints / totalCredits;
      
      const transcript = await Transcript.create({
        student: student._id,
        program: classes[0].program,
        academicYear: academicYear._id,
        campus: student.campus,
        institute: institute._id,
        semesters: [{
          semester: fall2024._id,
          marksheets: semesterMarksheets.map(m => m._id),
          semesterGPA: Math.round(semesterGPA * 100) / 100,
          totalCredits: totalCredits
        }],
        cumulativeGPA: Math.round(semesterGPA * 100) / 100,
        totalCreditsEarned: totalCredits,
        status: 'active',
        createdBy: classes[0].teacher
      });
      transcripts.push(transcript);
    }
  }
  
  return { marksheets, transcripts };
}

export async function createFeesAndPayments(students, programs, fall2024, academicYear, campuses, institute, adminId) {
  const FeeStructure = (await import('../models/FeeStructure.js')).default;
  const StudentFee = (await import('../models/StudentFee.js')).default;
  const Enrollment = (await import('../models/Enrollment.js')).default;
  
  // Create fee structures
  const bscsFee = await FeeStructure.create({
    name: 'BSCS Semester Fee Fall 2024',
    program: programs.bscs._id,
    semester: fall2024._id,
    academicYear: academicYear._id,
    campus: campuses.main._id,
    institute: institute._id,
    components: [
      { name: 'tuition', label: 'Tuition Fee', amount: 50000, isMandatory: true },
      { name: 'lab', label: 'Lab Fee', amount: 5000, isMandatory: true },
      { name: 'library', label: 'Library Fee', amount: 2000, isMandatory: true },
      { name: 'sports', label: 'Sports Fee', amount: 1000, isMandatory: false },
      { name: 'other', label: 'Other Fees', amount: 2000, isMandatory: false }
    ],
    dueDate: new Date('2024-10-15'),
    isActive: true,
    createdBy: adminId
  });

  const bseeFee = await FeeStructure.create({
    name: 'BSEE Semester Fee Fall 2024',
    program: programs.bsee._id,
    semester: fall2024._id,
    academicYear: academicYear._id,
    campus: campuses.main._id,
    institute: institute._id,
    components: [
      { name: 'tuition', label: 'Tuition Fee', amount: 55000, isMandatory: true },
      { name: 'lab', label: 'Lab Fee', amount: 8000, isMandatory: true },
      { name: 'library', label: 'Library Fee', amount: 2000, isMandatory: true },
      { name: 'sports', label: 'Sports Fee', amount: 1000, isMandatory: false },
      { name: 'other', label: 'Other Fees', amount: 2000, isMandatory: false }
    ],
    dueDate: new Date('2024-10-15'),
    isActive: true,
    createdBy: adminId
  });

  const mbaFee = await FeeStructure.create({
    name: 'MBA Semester Fee Fall 2024',
    program: programs.mba._id,
    semester: fall2024._id,
    academicYear: academicYear._id,
    campus: campuses.north._id,
    institute: institute._id,
    components: [
      { name: 'tuition', label: 'Tuition Fee', amount: 75000, isMandatory: true },
      { name: 'library', label: 'Library Fee', amount: 3000, isMandatory: true },
      { name: 'sports', label: 'Sports Fee', amount: 1000, isMandatory: false },
      { name: 'other', label: 'Other Fees', amount: 3000, isMandatory: false }
    ],
    dueDate: new Date('2024-10-15'),
    isActive: true,
    createdBy: adminId
  });

  const studentFees = [];
  
  // Create student fees based on enrollments
  for (let i = 0; i < students.length; i++) {
    const student = students[i];
    
    // Get student's first enrollment to determine program
    const enrollment = await Enrollment.findOne({ student: student._id, semester: fall2024._id });
    if (!enrollment) continue;
    
    let feeStructure, totalAmount, program;
    
    if (i < 20) {
      feeStructure = bscsFee;
      totalAmount = 60000;
      program = programs.bscs._id;
    } else if (i < 35) {
      feeStructure = bseeFee;
      totalAmount = 68000;
      program = programs.bsee._id;
    } else {
      feeStructure = mbaFee;
      totalAmount = 82000;
      program = programs.mba._id;
    }
    
    // 70% paid, 20% partial, 10% pending
    let paidAmount, paymentStatus;
    if (i % 10 < 7) {
      paidAmount = totalAmount;
      paymentStatus = 'paid';
    } else if (i % 10 < 9) {
      paidAmount = Math.floor(totalAmount * 0.5);
      paymentStatus = 'partially_paid';
    } else {
      paidAmount = 0;
      paymentStatus = 'unpaid';
    }
    
    const studentFee = await StudentFee.create({
      student: student._id,
      enrollment: enrollment._id,
      program: program,
      feeStructure: feeStructure._id,
      semester: fall2024._id,
      academicYear: academicYear._id,
      campus: student.campus,
      institute: institute._id,
      totalAmount,
      paidAmount,
      remainingAmount: totalAmount - paidAmount,
      paymentStatus,
      dueDate: new Date('2024-10-15'),
      payments: paidAmount > 0 ? [{
        amount: paidAmount,
        paymentDate: new Date(),
        paymentMethod: 'bank_transfer',
        transactionId: `TXN${Date.now()}${i}`,
        recordedBy: adminId
      }] : [],
      createdBy: adminId
    });
    studentFees.push(studentFee);
  }
  
  return { feeStructures: [bscsFee, bseeFee, mbaFee], studentFees };
}

export async function createSalariesAndPayments(teachers, departments, campuses, institute, adminId) {
  const SalaryStructure = (await import('../models/SalaryStructure.js')).default;
  const SalaryPayment = (await import('../models/SalaryPayment.js')).default;
  
  const salaryStructures = [];
  const salaryPayments = [];
  
  // Create salary structure for each teacher
  for (const teacher of teachers) {
    const salaryStructure = await SalaryStructure.create({
      staff: teacher._id,
      campus: teacher.campus,
      institute: institute._id,
      designation: 'Assistant Professor',
      baseSalary: 80000,
      allowances: [
        { name: 'Housing Allowance', amount: 20000, isPercentage: false },
        { name: 'Transport Allowance', amount: 5000, isPercentage: false },
        { name: 'Medical Allowance', amount: 5000, isPercentage: false },
        { name: 'Other Allowance', amount: 5000, isPercentage: false }
      ],
      deductions: [
        { name: 'Tax', amount: 8000, isPercentage: false },
        { name: 'Insurance', amount: 2000, isPercentage: false },
        { name: 'Other', amount: 1000, isPercentage: false }
      ],
      effectiveFrom: new Date('2024-09-01'),
      isActive: true,
      createdBy: adminId
    });
    salaryStructures.push(salaryStructure);
    
    // Create salary payments for last 3 months
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const paymentDate = new Date();
      paymentDate.setMonth(paymentDate.getMonth() - monthOffset);
      
      const month = paymentDate.getMonth() + 1;
      const year = paymentDate.getFullYear();
      
      const status = monthOffset === 0 ? (teacher._id.toString().endsWith('0') ? 'approved' : 'paid') : 'paid';
      
      const payment = await SalaryPayment.create({
        staff: teacher._id,
        salaryStructure: salaryStructure._id,
        campus: teacher.campus,
        institute: institute._id,
        month: month,
        year: year,
        baseSalary: 80000,
        allowances: [
          { name: 'Housing Allowance', amount: 20000 },
          { name: 'Transport Allowance', amount: 5000 },
          { name: 'Medical Allowance', amount: 5000 },
          { name: 'Other Allowance', amount: 5000 }
        ],
        deductions: [
          { name: 'Tax', amount: 8000 },
          { name: 'Insurance', amount: 2000 },
          { name: 'Other', amount: 1000 }
        ],
        totalAllowances: 35000,
        totalDeductions: 11000,
        grossSalary: 115000,
        netSalary: 104000,
        status: status,
        paymentDate: status === 'paid' ? new Date(year, month - 1, 25) : null,
        paymentMethod: status === 'paid' ? 'bank_transfer' : null,
        transactionId: status === 'paid' ? `TXN${year}${month}${teacher._id.toString().slice(-4)}` : null,
        approvedBy: status === 'paid' || status === 'approved' ? adminId : null,
        approvedAt: status === 'paid' || status === 'approved' ? new Date(year, month - 1, 20) : null,
        paidBy: status === 'paid' ? adminId : null,
        paidAt: status === 'paid' ? new Date(year, month - 1, 25) : null,
        isFinalized: status === 'paid',
        finalizedBy: status === 'paid' ? adminId : null,
        finalizedAt: status === 'paid' ? new Date(year, month - 1, 26) : null,
        createdBy: adminId
      });
      salaryPayments.push(payment);
    }
  }
  
  return { salaryStructures, salaryPayments };
}
