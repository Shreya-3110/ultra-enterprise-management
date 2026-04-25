const mongoose = require('mongoose');
const User = require('../models/User');
const Student = require('../models/Student');
require('dotenv').config();

const seedParent = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fee_management');
    console.log('Connected to MongoDB...');

    // 1. Find a sample student to get schoolId
    const sampleStudent = await Student.findOne();
    if (!sampleStudent) {
      console.log('No students found. Please seed students first.');
      process.exit(1);
    }

    const parentEmail = 'johnjeffin78@gmail.com';

    // 2. Remove existing user if any
    await User.deleteMany({ email: parentEmail });

    // Link the student to this parent
    sampleStudent.parentDetails = sampleStudent.parentDetails || {};
    sampleStudent.parentDetails.email = parentEmail;
    await sampleStudent.save();

    // 3. Create Parent User
    const parent = await User.create({
      name: 'John Jeffin',
      email: parentEmail,
      password: 'password123',
      role: 'PARENT',
      schoolId: sampleStudent.schoolId
    });

    console.log('-----------------------------------');
    console.log('Parent User Created Successfully!');
    console.log(`Email: ${parentEmail}`);
    console.log(`Password: password123`);
    console.log('-----------------------------------');
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding parent:', error);
    process.exit(1);
  }
};

seedParent();
