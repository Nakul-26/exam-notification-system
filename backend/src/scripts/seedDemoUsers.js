import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import Teacher from '../models/Teacher.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Subject from '../models/Subject.js';
import Exam from '../models/Exam.js';
import ExamSubject from '../models/ExamSubject.js';
import ExamMark from '../models/ExamMark.js';
import ClassStudent from '../models/ClassStudent.js';
import ClassSubject from '../models/ClassSubject.js';
import { hashPassword } from '../utils/auth.js';
import { getMongoConnectionConfig } from '../utils/db.js';
import { getDefaultCollegeId } from '../utils/tenant.js';

dotenv.config();

const seed = async () => {
  try {
    const { mongoUri, mongoOptions } = getMongoConnectionConfig();
    console.log(`Connecting to database: ${mongoOptions.dbName}...`);
    await mongoose.connect(mongoUri, mongoOptions);
    
    const collegeId = process.env.COLLEGE_ID || getDefaultCollegeId();
    console.log(`Using College ID: ${collegeId}`);

    // 1. Clear ALL data for a clean demo state
    console.log('Performing deep clean of collections...');
    await Promise.all([
      Admin.deleteMany({}),
      Teacher.deleteMany({}),
      Class.deleteMany({}),
      Student.deleteMany({}),
      Subject.deleteMany({}),
      Exam.deleteMany({}),
      ExamSubject.deleteMany({}),
      ExamMark.deleteMany({}),
      ClassStudent.deleteMany({}),
      ClassSubject.deleteMany({}),
    ]);

    // 2. Create Users
    console.log('Creating demo users...');
    await Admin.create({
      collegeId,
      name: 'Demo Admin',
      email: 'admin@school.com',
      passwordHash: hashPassword('Admin@123'),
    });

    await Teacher.create({
      collegeId,
      name: 'Demo Teacher',
      email: 'teacher@school.com',
      phone: '9876543210',
      passwordHash: hashPassword('Teacher@123'),
    });

    // 3. Create Classes
    console.log('Creating demo classes...');
    const class10A = await Class.create({ collegeId, className: '10', section: 'A' });
    const class10B = await Class.create({ collegeId, className: '10', section: 'B' });

    // 4. Create Subjects
    console.log('Creating demo subjects...');
    const math = await Subject.create({ collegeId, name: 'Mathematics' });
    const science = await Subject.create({ collegeId, name: 'Science' });
    const english = await Subject.create({ collegeId, name: 'English' });

    // 5. Create Students
    console.log('Creating demo students...');
    const studentsData = [
      { name: 'John Doe', rollNo: '101', fatherName: 'Robert Doe', studentPhone: '919876543210', fatherPhone: '919876543210' },
      { name: 'Jane Smith', rollNo: '102', fatherName: 'William Smith', studentPhone: '919123456789', fatherPhone: '919123456789' },
      { name: 'Alice Brown', rollNo: '103', fatherName: 'Charlie Brown', studentPhone: '918888888888', fatherPhone: '918888888888' },
    ];
    const createdStudents = await Student.insertMany(
      studentsData.map(s => ({ ...s, collegeId }))
    );

    // 6. Map Students to Classes
    console.log('Mapping students to classes...');
    await ClassStudent.insertMany(
      createdStudents.map(s => ({
        collegeId,
        className: '10',
        section: 'A',
        student: s._id
      }))
    );

    // 7. Map Subjects to Classes
    console.log('Mapping subjects to classes...');
    await ClassSubject.insertMany([
      { collegeId, className: '10', section: 'A', subject: 'Mathematics' },
      { collegeId, className: '10', section: 'A', subject: 'Science' },
    ]);

    // 8. Create Exam
    console.log('Creating demo exam...');
    const finalExam = await Exam.create({
      collegeId,
      examName: 'Final Examination',
      classId: '10',
      sectionId: 'A',
      examClasses: [{ classId: '10', sectionId: 'A' }],
      academicYear: '2025-26',
      status: 'published'
    });

    // 9. Add Subjects to Exam
    console.log('Adding subjects to exam...');
    const exMath = await ExamSubject.create({
      collegeId,
      examId: finalExam._id,
      subjectId: 'Mathematics',
      examDate: new Date('2026-03-01'),
      totalMarks: 100,
      passingMarks: 35,
    });
    const exScience = await ExamSubject.create({
      collegeId,
      examId: finalExam._id,
      subjectId: 'Science',
      examDate: new Date('2026-03-02'),
      totalMarks: 100,
      passingMarks: 35,
    });

    // 10. Add Marks
    console.log('Adding demo marks...');
    await ExamMark.insertMany([
      { collegeId, examId: finalExam._id, studentId: createdStudents[0]._id, examSubjectId: exMath._id, marksObtained: 85 },
      { collegeId, examId: finalExam._id, studentId: createdStudents[0]._id, examSubjectId: exScience._id, marksObtained: 78 },
      { collegeId, examId: finalExam._id, studentId: createdStudents[1]._id, examSubjectId: exMath._id, marksObtained: 92 },
      { collegeId, examId: finalExam._id, studentId: createdStudents[1]._id, examSubjectId: exScience._id, marksObtained: 88 },
    ]);

    console.log('\n✅ SUCCESS: Demo data successfully seeded!');
    console.log('--------------------------------------------------');
    console.log('Admin:   admin@school.com   / Admin@123');
    console.log('Teacher: teacher@school.com / Teacher@123');
    console.log('--------------------------------------------------');

  } catch (err) {
    console.error('\n❌ SEEDING FAILED:', err.message);
  } finally {
    await mongoose.disconnect();
  }
};

seed();
